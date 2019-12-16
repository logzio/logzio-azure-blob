const logger = require("logzio-nodejs");
const DataParser = require("./data-parser");
const zlib = require("zlib");
const request= require('request');
const context = {
  log: () => {},
  done: () => {},
  err: () => {}
};

function getCallBackFunction(context) {
  return function callback(err, bulk) {
    if (err) {
      context.err(`logzio-logger error: ${err}`, err);
      context.bindings.outputBlob = bulk;
    }
    context.done();
  };
}

const getParserOptions = () => ({
  token: process.env.LogzioToken,
  host: process.env.LogzioHost
});

function sendData(data, logType, context) {
  const callBackFunction = getCallBackFunction(context);
  const dataParser = new DataParser({
    internalLogger: context
  });
  const { host, token } = getParserOptions();
  const parseMessagesArray = dataParser._parseEventHubLogMessagesToArray(
    data,
    logType,
    context
  );

  const logzioShipper = logger.createLogger({
    token: token,
    host: host,
    type: "eventHub",
    protocol: "https",
    internalLogger: context,
    compress: true,
    debug: true,
    callback: callBackFunction
  });
  context.log(`About to send ${parseMessagesArray.length} logs...`);
  parseMessagesArray.forEach(log => {
    logzioShipper.log(log);
  });
  logzioShipper.sendAndClose(callBackFunction);
}

function getData(url, compressed, callback) {
  request(url, { encoding: null }, function(err, response, body) {
    if (compressed) {
      zlib.gunzip(body, function(err, dezipped) {
        callback(dezipped.toString());
      });
    } else {
      callback(body.toString());
    }
  });
}

function handleEventHub(message) {
  const url = message[0]["subject"];
  const splitUrl = message[0]["subject"].split(".");
  var logType = splitUrl.pop();
  const compressed = logType === "gz";
  if (compressed) {
    logType = splitUrl[splitUrl.length - 1];
  }
  getData(url, compressed, function(data) {
    sendData(data, logType, context);
  });
}

function processEventHubMessages(context, eventHubMessages) {
  context.log(`Starting Logz.io Azure function with logs`);
  eventHubMessages.forEach(eventHubMessage => {
    handleEventHub(eventHubMessage);
  });
}

module.exports = {
  processEventHubMessages: processEventHubMessages,
  sendData: sendData
};
