const logsProcessor = require('./core');

module.exports = function processEventHubMessages(context, eventHubMessages) {
  try{console.log(eventHubMessages)}
  catch(e){
    console.log(e)
  }
  logsProcessor.processEventHubMessages(context, eventHubMessages);
};
