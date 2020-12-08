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

function isGzip(buf){
	if (!buf || buf.length < 3) {
		return false;
	}
	return buf[0] === 0x1F && buf[1] === 0x8B && buf[2] === 0x08;
};

function getCallBackFunction(context) {
  return function callback(err, bulk) {
    if (err) {
      context.log.error(`logzio-logger error: ${err}`, err);
    }
    context.done();
  };
}

const getParserOptions = () => ({
  token: process.env.LogzioToken,
  host: process.env.LogzioHost,
});

const sendData = (format, fileName, data, context) =>{
  const callBackFunction = getCallBackFunction(context);
  const dataParser = new DataParser({
    internalLogger: context
  });
  const { host, token } = getParserOptions();
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
  try{
   const parsedMessagesArray = dataParser.parseEventHubLogMessagesToArray(data, format);
    context.log(`About to send ${parsedMessagesArray.length} logs...`);
    parsedMessagesArray.forEach(log => {
        logzioShipper.log(log);
    });
  }
  catch(e){
    if (e instanceof SyntaxError) {
        const jsonSyntaxError = "Your data is invalid, please ensure only new lines seperates logs in: " + fileName;
        context.log.error(jsonSyntaxError);
        logzioShipper.log(jsonSyntaxError);
      }
  }

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
    if (isGzip(body)) {
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
  eventHubMessages.forEach(message => {
    const url = message[event]["data"]["url"];
    getData(url, function(data, format) {
      const fileindex = url.lastIndexOf('/');
      const fileName = url.substring(fileindex + 1);
      sendData(format, fileName, data, context);
    });
  });
}


module.exports = {
  processEventHubMessages: processEventHubMessages,
  sendData: sendData
};
