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

  parseEventHubLogMessagesToArray(eventHubMessage, logType) {
    var logsArray = [];
    if (this._parsing === true)
      throw Error("already parsing, create a new DataParser");
    this._parsing = true;
    switch (logType.toLowerCase()) {
      case LogTypes.csv:
        logsArray = this._parseCSVtoLogs(eventHubMessage);
        break;
      case LogTypes.json:
        logsArray = this._parseJsonToLogs(eventHubMessage);
        break;
      default:
        logsArray = eventHubMessage;
    }
    var parsedMessages = [];
    if (logsArray instanceof Array) {
      logsArray.forEach(message => parsedMessages.push(this._normalizeMessage(message)));
    } else {
      parsedMessages.push(this._normalizeMessage(logsArray));
    }
    return parsedMessages;
  }

  _removeEmpty(message) {
    if (typeof message === "string") return message;
    const cleanObj = Object.keys(message)
      .filter(k => emptyKeyValue(k, message[k]))
      .reduce(
        (acc, k) =>
        Object.assign(acc, {  
            [k]: typeof message[k] === "object" ? this._removeEmpty(message[k]) : message[k]
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

  _normalizeMessage(message) {
    if (message.time) {
      delete Object.assign(message, {
        "@timestamp": message.time
      }).time;
    }
    return this._removeEmpty(message);
  }

  _removeLastNewline(message) {
    try {
      if (message.charAt(message.length - 1) === "\n") {
        return message.slice(0, -1);
      }
    } catch (e) {}
    return message;
  }

  _parseJsonToLogs(message) {
    var jsonArray = [];
    var validMessage = this._removeLastNewline(message);
    try {
      var splittedJson = validMessage.split("\n").join(",");
      return JSON.parse(`[${splittedJson}]`);
    } catch (e) {
      if (e instanceof TypeError) {
        return [validMessage];
      }
      if (e instanceof SyntaxError) {
        throw new Error(
          "Your data is invalid, Please ensure new lines seperates logs only."
        );
      }
    }
    return jsonArray;
  }

  _parseCSVtoLogs(message) {
    var lines = message.split("\n");
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
