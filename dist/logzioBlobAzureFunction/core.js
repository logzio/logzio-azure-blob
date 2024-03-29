const logger = require("logzio-nodejs");
const DataParser = require("./data-parser");
const { ContainerClient } = require('@azure/storage-blob');
const isGzip = require('is-gzip');
const asyncGunzip = require('async-gzip-gunzip').asyncGunzip
const gzip = "gz";

const lastIndex = (url) => {
  return url.lastIndexOf('/');
}

const extractMessageFromArray = (message) => {
   return message[0];
}

const fileTypes = {
  text: "text",
  json: "json",
  csv: "csv"
}

const getCallBackFunction = (context) => {
  return function callback(err) {
    if (err) {
      context.log.error(`logzio-logger error: ${err}`);
    }
    context.done();
  };
}

const getParserOptions = () => ({
  token: process.env.LogzioToken,
  host: process.env.LogzioHost,
});

const sendData = (format, containerName, fileName, data, context) =>{
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
        callback: callBackFunction,
        extraFields : {
          container: containerName,
          file: fileName
      },
    });
  try{
    const parsedMessagesArray = dataParser.parseEventHubLogMessagesToArray(data, format);
    context.log(`About to send ${parsedMessagesArray.length} logs...`);
    parsedMessagesArray.forEach(log => {
        logzioShipper.log(log);
    });
  }
  catch(e){
    let errorMessage;
    if (e instanceof SyntaxError) {
      errorMessage = "Your data is invalid, please ensure only new lines seperates logs in: " + containerName + "/" + fileName;
    }
    else{
      errorMessage = "The file " + containerName + "/" + fileName + " was not sent due to " + e;
    }
    context.log.error(errorMessage);
    logzioShipper.log(errorMessage);
  }
  logzioShipper.sendAndClose(callBackFunction);
}

const extractFileType = (url, isCompressed) => {
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

const getFilePath = (urlStr) => {
  const indexBeforeContainer = urlStr.indexOf(".net");
  return urlStr.substring(indexBeforeContainer + 5);
}

const getBlob = async(containerName, blobName) => {
  const blobConnectionString = process.env.BlobConnectionString;
  const containerClient = new ContainerClient(blobConnectionString, containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloadBlockBlobPromise = await blockBlobClient.downloadToBuffer();
  return downloadBlockBlobPromise;
}

const getAndSendData = async (url, context) =>{
    let gunzipped = null;
    const isCompressed =  url.endsWith(gzip);                                                                                                                                                                                                                    
    const format = extractFileType(url, isCompressed); 
    const substringUrl = url.substring(0, url.lastIndexOf('/'));
    const containerName = getFilePath(substringUrl);
    const fileName = url.substring(lastIndex(url) + 1);
    const data = await getBlob(containerName, fileName);
    if(isGzip(data.slice(0, 3))){
      gunzipped = await asyncGunzip(data);
    }
    const blobData = gunzipped || data;
    sendData(format, containerName, fileName, blobData.toString(), context);
}

const processEventHubMessages = (context, eventHubMessages) => {
  context.log(`Starting Logz.io Azure function with logs`);
  eventHubMessages.forEach(message => {
    const url = extractMessageFromArray(message)["data"]["url"];
    getAndSendData(url, context);
  });
}

module.exports = {
  processEventHubMessages: processEventHubMessages,
  sendData: sendData
};