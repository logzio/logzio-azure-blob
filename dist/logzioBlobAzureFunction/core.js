const logger = require("logzio-nodejs");
const DataParser = require("./data-parser");
const { ContainerClient } = require('@azure/storage-blob');
const zlib = require("zlib");
// const asyncGunzip = require('async-gzip-gunzip').asyncGunzip
const containerIndex = (splitUrl) => {
 return splitUrl.length-2;
};
const blobIndex = (splitUrl) => {
  return splitUrl.length-1;
 };
const extractMessageFromArray = (message) => {
   return message[0];
 }
const fileTypes = {
  text: "text",
  json: "json",
  csv: "csv"
}
const gzip = "gz";
const getCallBackFunction = (context) => {
  return function callback(err) {
    if (err) {
      context.err(`logzio-logger error: ${err}`, err);
    }
    context.done();
  };
}

const streamToStringAsync = async (readableStream) => {
  return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on("data", (data) => {
      chunks.push(data.toString());
      });
      readableStream.on("end", () => {
      resolve(chunks.join(""));
      });
      readableStream.on("error", reject);
  });
};
const getParserOptions = () => ({
  token: process.env.LogzioToken,
  host: process.env.LogzioHost,
});

const sendData = (format, data, context) =>{
  const callBackFunction = getCallBackFunction(context);
  const dataParser = new DataParser({
    internalLogger: context
  });
  const { host, token } = getParserOptions();
  const parsedMessagesArray = dataParser.parseEventHubLogMessagesToArray(
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
  context.log(`About to send ${parsedMessagesArray.length} logs...`);
  parsedMessagesArray.forEach(log => {
    logzioShipper.log(log);
  });
  logzioShipper.sendAndClose(callBackFunction);
}

const unzipData = (data, callback) =>{
  zlib.gunzip(data, function(err, dezipped) {
    callback(dezipped.toString());
  });
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

const getBlob = async(splitUrlArr) => {
  const containerName = splitUrlArr[containerIndex(splitUrlArr)];
  const blobName = splitUrlArr[blobIndex(splitUrlArr)];
  const blobConnectionString = process.env.BlobConnectionString;
  const containerClient = new ContainerClient(blobConnectionString, containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloadBlockBlobResponse = await blockBlobClient.download(0);
  const data = await streamToStringAsync(downloadBlockBlobResponse.readableStreamBody);
  return data;
}


const getAndSendData = async (url, context) =>{
    let gunzipped = null;
    const isCompressed =  url.endsWith(gzip); 
    const format = extractFileType(url, isCompressed); 
    const splitUrlArr = url.split("/");
    const data = await getBlob(splitUrlArr);
    if (isCompressed) {
      // gunzipped = asyncGunzip(data);
      unzipData(data, function(unzippedData){
        // console.log("after zip: ", unzippedData);   
        sendData(format, unzippedData, context);
      });
    }
    else{
      sendData(format, gunzipped || data, context);
    }
}

const processEventHubMessages = (context, eventHubMessages) => {
  console.log(`Starting Logz.io Azure function with logs`);
  eventHubMessages.forEach(message => {
    const url = extractMessageFromArray(message)["data"]["url"];
    getAndSendData(url, context);
  });
}
module.exports = {
  processEventHubMessages: processEventHubMessages,
  sendData: sendData
};