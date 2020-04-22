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
  host: process.env.LogzioHost,
  format: process.env.Format
});

function extractFileType(fileExtension){
  var fileType = fileExtension.pop();
  if (fileType === gzip){
    fileType = fileExtension.pop();
  }
  return fileType;
}

function sendData(data, context) {
  const callBackFunction = getCallBackFunction(context);
  const dataParser = new DataParser({
    internalLogger: context
  });
  var { host, token, format } = getParserOptions();
  const parseMessagesArray = dataParser.parseEventHubLogMessagesToArray(
    data,
    format
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

function getData(url, callback) {
  const fileExtension = url.split("/").pop().split(".");
  const isCompressed = fileExtension[fileExtension.length - 1] === gzip;
  const fileType = extractFileType(fileExtension);
  const format = process.env.Format;
  if (fileType != format || [null, undefined].includes(format)){
      process.env.Format = "text";
  }
  request(url, { encoding: null }, function(err, response, body) {
    if (isCompressed) {
      zlib.gunzip(body, function(err, dezipped) {
        callback(dezipped.toString());
      });
    } else {
      callback(body.toString());
    }
  });
}

function processEventHubMessages(context, eventHubMessages) {
  context.log(`Starting Logz.io Azure function with logs`);
  eventHubMessages.forEach(message => {
    const url = message[event]["data"]["url"];
    getData(url, function(data) {
      sendData(data, context);
    });
  });
}

module.exports = {
  processEventHubMessages: processEventHubMessages,
  sendData: sendData
};
