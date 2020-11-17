const logger = require("logzio-nodejs");
const DataParser = require("./data-parser");
const { ContainerClient } = require('@azure/storage-blob');
const zlib = require("zlib");
const asyncGunzip = require('async-gzip-gunzip').asyncGunzip

const event = 0;
function containerIndex(splitUrl){
 return splitUrl.length-2;
};
function blobIndex(splitUrl){
  return splitUrl.length-1;
 };
const fileTypes = {
  text: "text",
  json: "json",
  csv: "csv"
}
const gzip = "gz";
function getCallBackFunction(context) {
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
function sendData(format, data, context) {
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

function unzipData(data, callback){
  zlib.gunzip(data, function(err, dezipped) {
    callback(dezipped.toString());
  });
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

async function getBlob(splitUrlArr){
  const containerName = splitUrlArr[containerIndex(splitUrlArr)];
  const blobName = splitUrlArr[blobIndex(splitUrlArr)];
  const blobConnectionString = process.env.BlobConnectionString;
  const containerClient = new ContainerClient(blobConnectionString, containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloadBlockBlobResponse = await blockBlobClient.download(0);
  const data = await streamToStringAsync(downloadBlockBlobResponse.readableStreamBody);
  return data;
}


async function getAndSendData(url, context){
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

function processEventHubMessages(context, eventHubMessages){
  console.log(`Starting Logz.io Azure function with logs`);
  eventHubMessages.forEach(message => {
    const url = message[event]["data"]["url"];
    getAndSendData(url, context);
  });
}
module.exports = {
  processEventHubMessages: processEventHubMessages,
  sendData: sendData
};