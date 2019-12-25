const logger = require("logzio-nodejs");
const DataParser = require("./data-parser");
const zlib = require("zlib");
const request = require("request");
const gzip = "gz";
const event = 0;

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
  const parseMessagesArray = dataParser.parseEventHubLogMessagesToArray(
    data,
    logType
  );
  const logzioShipper = logger.createLogger({
    token: token,
    host: host,
    type: "blobStorage",
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

function parseMessage(message) {
  const url = message[event]["subject"];
  const splitUrl = url.split(".");
  var fileExtension = splitUrl.pop();
  const isCompressed = fileExtension === gzip;
  if (isCompressed) {
    fileExtension = splitUrl[splitUrl.length - 1];
  }
  return { url, logType: fileExtension , isCompressed};
}

function processEventHubMessages(context, eventHubMessages) {
  context.log(`Starting Logz.io Azure function with logs`);
  eventHubMessages.forEach(message => {
    const { url, logType , isCompressed  } = parseMessage(message);
    getData(url, isCompressed, function(data) {
      sendData(data, logType, context);
    });
  });
}

module.exports = {
  processEventHubMessages: processEventHubMessages,
  sendData: sendData
};
