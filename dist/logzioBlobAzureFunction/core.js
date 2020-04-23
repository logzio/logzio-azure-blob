const logger = require("logzio-nodejs");
const DataParser = require("./data-parser");
const zlib = require("zlib");
const request = require("request");
const event = 0;
const fileTypes = {
  text: "text",
  json: "json",
  csv: "csv"
}
const gzip = "gz";

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
});

function sendData(format, data, context) {
  const callBackFunction = getCallBackFunction(context);
  const dataParser = new DataParser({
    internalLogger: context
  });
  const { host, token } = getParserOptions();
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

function extractFileType(url, isCompressed){
  const urlArray = url.split(".");
  if (isCompressed){
    urlArray.pop();
  }
  const fileType  = urlArray.pop();
  const format = process.env.Format;
  if (fileType === fileTypes.csv){
    return fileTypes.csv;
  }
  if (![fileTypes.text, fileTypes.csv, fileTypes.json].includes(format)){
    return fileTypes.text;
  }
  return format;
}

function getData(url, callback) {
  const isCompressed =  url.endsWith(gzip); 
  const format = extractFileType(url, isCompressed);    
  request(url, { encoding: null }, function(err, response, body) {
    if (isCompressed) {
      zlib.gunzip(body, function(err, dezipped) {
        callback(dezipped.toString(), format);
      });
    } else {
      callback(body.toString(), format);
    }
  });
}

function processEventHubMessages(context, eventHubMessages) {
  context.log(`Starting Logz.io Azure function with logs`);
  process.env.Format = "json";
  eventHubMessages.forEach(message => {
    const url = message[event]["data"]["url"];
    getData(url, function(data, format) {
      sendData(format, data, context);
    });
  });
}

module.exports = {
  processEventHubMessages: processEventHubMessages,
  sendData: sendData
};
