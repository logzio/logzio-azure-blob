const logger = require('logzio-nodejs');
const DataParser = require('./data-parser');
const axios = require('axios');

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

module.exports = function processEventHubMessages(context, eventHubMessages) {
  // const {
  //   host,
  //   token,
  // } = getParserOptions().logs;
  context.log(`Starting Logz.io Azure function with logs`);
  // context.log(JSON.stringify(eventHubMessages));
  const url = eventHubMessages[0][0]['data']['url'];
  const messageType = eventHubMessages[0][0]['data']['contentType'];
  var index  = messageType.indexOf('/');
  const logType = messageType.substr(index + 1);
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

  const dataParser = new DataParser({
    internalLogger: context
  });

  axios.get(url).then(response => {
    context.log("response:" + response);
    const message = response.data;
    context.log("MESSAGE: " + message);
    context.log("MESSAGE type: " + typeof(message));    
    const parseMessagesArray = dataParser.parseEventHubLogMessagesToArray(message, logType, context);
    // context.log(`About to send ${parseMessagesArray.length} logs...`);
    // context.log(`type: ${typeof(message)}`);
    parseMessagesArray.forEach((log) => {
      // context.log(JSON.stringify(`logging: ${log}`));
      logzioShipper.log(log);
    });
    logzioShipper.sendAndClose(callBackFunction);      
  })
  .catch(error => {
    console.log(error);
  });
};