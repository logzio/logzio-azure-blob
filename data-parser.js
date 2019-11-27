const isArray = arr => arr instanceof Array;
const isEmptyArray = arr => (isArray(arr) ? arr.length === 0 : false);
const isNil = item => item == null || item === 'null' || item === 'undefined';
const isEmpty = item => item === '';
const isEmptyObj = obj => (typeof obj === 'object' ? Object.keys(obj).length === 0 : false);
const isAllEmpty = (k, v) => !isEmpty(k) && !isNil(k) && !isEmpty(v)
  && !isNil(v) && !isEmptyArray(v) && !isEmptyObj(v);
const renameLogKey = (obj) => {
  if (obj.time) {
    delete Object.assign(obj, {
      '@timestamp': obj.time,
    }).time;
  }
};

class DataParser {
  constructor(
    internalLogger = global.console
  ) {
    this._parsedMessages = [];
    this._parsing = false;
    this._internalLogger = internalLogger;
    this._availableStatistics = ['count', 'total', 'average', 'maximum', 'minimum'];
  }

  _removeEmpty(obj) {
    if (typeof (obj) === 'string') return obj; // for string event.

    const cleanObj = Object.keys(obj)
      .filter(k => isAllEmpty(k, obj[k]))
      .reduce((acc, k) => Object.assign(acc, {
        [k]: typeof obj[k] === 'object' ? this._removeEmpty(obj[k]) : obj[k],
      }), {});

    // In case of object that all of its values are empty
    Object.keys(cleanObj).forEach((key) => {
      if (!isAllEmpty(key, cleanObj[key])) delete cleanObj[key];
    });

    return cleanObj;
  }

  _renameKeyRemoveEmpty(obj) {
    renameLogKey(obj);
    return this._removeEmpty(obj);
  }
   
  _pushMessage(msg) {
    if (isArray(msg.records)) {
      msg.records.forEach(subMsg => this._parsedMessages.push(this._renameKeyRemoveEmpty(subMsg)));
    } else {
      this._parsedMessages.push(this._renameKeyRemoveEmpty(msg));
    }
  }

  toJson(ndjson, context) {
    var splittedJson, jsonArray = [];
    try{
      splittedJson = ndjson.split('\n').join(',');
      jsonArray = JSON.parse(`[${splittedJson}]`);
    }
    catch(e){
      context.log(e);
      if (e instanceof TypeError){
          jsonArray[0] = ndjson;
      }
      if (e instanceof SyntaxError){
        // throw new Error("Your data is invalid, Please ensure new lines seperates logs only.");
        context.log("data with new lines, parsing anyway...");
      }
    }
    return jsonArray;
  }

  parseJsonToLogs(message, context) {
    var arr;
    try{
      arr = this.toJson(message);
    }
    catch(e){
      context.log(e);
    }
    return arr;
  } 

  parseCSVtoLogs(message, context) {
    context.log("message: " + message);
    var lines = message.split("\n");
    context.log("lines"+lines);
    var result = [];
    var headers=lines[0].split(",");
    for(var i=1;i<lines.length;i++){
        var obj = {};
        var currentline=lines[i].split(",");
        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }
       result.push(obj);
    }
    context.log(result);
    return result;
  }

  parseEventHubLogMessagesToArray(eventHubMessage, logType, context) {
    context.log("message in:" + eventHubMessage);
    var logsArray = [];
    if (this._parsing === true) throw Error('already parsing, create a new DataParser');
    this._parsing = true;
    if (logType.toLowerCase() === 'csv') {
      context.log("in csv");
      logsArray = this.parseJsonToLogs(eventHubMessage, context);
    }
    if (logType.toLowerCase() === 'json') {
        logsArray = this.parseJsonToLogs(eventHubMessage, context);
        context.log(logsArray);
    }
    if (isArray(logsArray)) {
      logsArray.forEach(msg => this._pushMessage(msg));
    } else {
      this._pushMessage(logsArray);
    }
    return this._parsedMessages;
  }
}

module.exports = DataParser;