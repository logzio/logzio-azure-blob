const isEmptyArray = arr => (arr instanceof Array ? arr.length === 0 : false);
const isNil = item => item === "" || item == null || item === "null" || item === "undefined";
const isEmptyObj = obj =>
  typeof obj === "object" ? Object.keys(obj).length === 0 : false;
const emptyKeyValue = (k, v) =>
  !isNil(k) &&
  !isNil(v) &&
  !isEmptyArray(v) &&
  !isEmptyObj(v);
const LogTypes = {
  csv: "csv",
  json: "json"
 };

 class DataParser {
  constructor(internalLogger = global.console) {
    this._parsing = false;
    this._internalLogger = internalLogger;
  }

  parseEventHubLogMessagesToArray(data, logType) {
    var logsArray = [];
    if (this._parsing === true)
      throw Error("already parsing, create a new DataParser");
    this._parsing = true;
    switch (logType.toLowerCase()) {
      case LogTypes.csv:
        logsArray = this._parseCSVtoLogs(data);
        break;
      case LogTypes.json:
        logsArray = this._parseJsonToLogs(data);
        break;
      default:
        logsArray = data.split("\n");
    }
    var parsedMessages = [];
    if (logsArray instanceof Array) {
      logsArray.forEach(message => parsedMessages.push(this._normalizeData(message)));
    } else {
      parsedMessages.push(this._normalizeData(logsArray));
    }
    return parsedMessages;
  }

  _removeEmpty(data) {
    if (typeof data === "string") return data;
    const cleanObj = Object.keys(data)
      .filter(k => emptyKeyValue(k, data[k]))
      .reduce(
        (acc, k) =>
        Object.assign(acc, {  
            [k]: typeof data[k] === "object" ? this._removeEmpty(data[k]) : data[k]
          }),
        {}
      );
    Object.keys(cleanObj).forEach(key => {
      if (!emptyKeyValue(key, cleanObj[key])){ 
        delete cleanObj[key];
      }
    });
    return cleanObj;
  }

  _normalizeData(data) {
    if (data.time) {
      delete Object.assign(data, {
        "@timestamp": data.time
      }).time;
    }
    return this._removeEmpty(data);
  }

  _removeLastNewline(data) {
    try {
      if (data.charAt(data.length - 1) === "\n") {
        return data.slice(0, -1);
      }
    } catch (e) {}
    return data;
  }

  _parseJsonToLogs(data) {
    var validMessage = this._removeLastNewline(data);
    try {
      var splittedJson = validMessage.split("\n");
      return JSON.parse(`[${splittedJson}]`);
    } catch (e) {
      if (e instanceof TypeError) {
        return [validMessage];
      }
      if (e instanceof SyntaxError) {
        throw new SyntaxError(e);
      }
      else{
        throw new Error(e);
      }
    }
  }

  _parseCSVtoLogs(data) {
    var lines = data.split("\n");
    var result = [];
    var headers = lines[0].split(",");
    for (var i = 1; i < lines.length; i++) {
      var obj = {};
      var currentline = lines[i].split(",");
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }
    return result;
  }
}

module.exports = DataParser;
