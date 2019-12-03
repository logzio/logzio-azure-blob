const logger = require('logzio-nodejs');
const DataParser = require('./data-parser');
const axios = require('axios');
const zlib = require('zlib');
const https = require('https');

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
  logs: {
    token: process.env.LogzioLogsToken,
    host: process.env.LogzioLogsHost,
  },
});

 function isGzipCompressed(headers, context){
    var messageType = headers['content-type']; 
    const index  = messageType.indexOf('/') + 1;
    return messageType.substr(index) === 'x-gzip';
  }

  function getGzipped(url, callback) {
    var buffer = [];

    https.get(url, function(res) {
        var gunzip = zlib.createGunzip();            
        res.pipe(gunzip);
        gunzip.on('data', function(data) {
            buffer.push(data.toString())

        }).on("end", function() {
            callback(null, buffer.join("")); 

        }).on("error", function(e) {
            callback(e);
        })
    }).on('error', function(e) {
        callback(e)
    });
  }

  function sendData(data, logType, context){
    const dataParser = new DataParser({
      internalLogger: context
    });
    const parseMessagesArray = dataParser.parseEventHubLogMessagesToArray(data, logType, context);
    context.log("parsed: " + parseMessagesArray);
    const callBackFunction = getCallBackFunction(context);
    const logzioShipper = logger.createLogger({
      token: 'VRumDxNPhJyNAHmAZXnqJKPqDuGJVesn',
      host: 'listener.logz.io',
      type: 'eventHub',
      protocol: 'https', 
      internalLogger: context,
      compress: true,
      debug: true,
      callback: callBackFunction,
    });

    context.log(`About to send ${parseMessagesArray.length} logs...`);
    parseMessagesArray.forEach((log) => {
      context.log(JSON.stringify(`logging: ${log}`));
      logzioShipper.log(log);
    });
    logzioShipper.sendAndClose(callBackFunction);    
  } 

module.exports = function processEventHubMessages(context, eventHubMessages) {
  // const {
  //   host,
  //   token,
  // } = getParserOptions().logs;
  context.log(`Starting Logz.io Azure function with logs`);
  const url = eventHubMessages[0][0]['data']['url'];
  const messageType = eventHubMessages[0][0]['data']['contentType'];
  var index  = messageType.indexOf('/');
  const logType = messageType.substr(index + 1);

 

    axios.get(url).then(response => {
        const data = response.data;
        const headers = response.headers;
        const logType= "json";
        context.log(headers);
        try{
        var compressed = isGzipCompressed(headers, context);
        context.log(compressed);
        if (compressed){
          getGzipped(url, function(err, data) {
            context.log("passed gunzip" + data);
             sendData(data, logType, context);
          });
        }
        else{
            context.log("not gzip" + data);
            sendData(data, logType, context);
        }
        }
        catch(e){
          context.log(e);
        }
      })
      .catch(error => {
        context.log(error);
      });
};