const isArray = arr => arr instanceof Array;
const isEmptyArray = arr => (isArray(arr) ? arr.length === 0 : false);
const isNil = item => item == null || item === "null" || item === "undefined";
const isEmpty = item => item === "";
const isEmptyObj = obj =>
  typeof obj === "object" ? Object.keys(obj).length === 0 : false;
const isAllEmpty = (k, v) =>
  !isEmpty(k) &&
  !isNil(k) &&
  !isEmpty(v) &&
  !isNil(v) &&
  !isEmptyArray(v) &&
  !isEmptyObj(v);
const renameLogKey = obj => {
  if (obj.time) {
    delete Object.assign(obj, {
      "@timestamp": obj.time
    }).time;
  }
};

class DataParser {
  constructor(internalLogger = global.console) {
    this._parsedMessages = [];
    this._parsing = false;
    this._internalLogger = internalLogger;
  }

  _removeEmpty(message) {
    if (typeof message === "string") return message; // for string event.
    const cleanObj = Object.keys(message)
      .filter(k => isAllEmpty(k, message[k]))
      .reduce(
        (acc, k) =>
        Object.assign(acc, {  
            [k]: typeof message[k] === "object" ? this._removeEmpty(message[k]) : message[k]
          }),
        {}
      );
    // In case of object that all of its values are empty
    Object.keys(cleanObj).forEach(key => {
      if (!isAllEmpty(key, cleanObj[key])){ delete cleanObj[key];
      }
    });
    return cleanObj;
  }

  _renameKeyRemoveEmpty(message) {
    renameLogKey(message);
    return this._removeEmpty(message);
  }

  _pushMessage(message) {
    if (isArray(message.records)) {
      message.records.forEach(subMessage =>
        this._parsedMessages.push(this._renameKeyRemoveEmpty(subMessage))
      );
    } else {
      this._parsedMessages.push(this._renameKeyRemoveEmpty(message));
    }
  }

  _removeLastNewline(message) {
    try {
      if (message.charAt(message.length - 1) === "\n") {
        message = message.slice(0, -1);
      }
    } catch (e) {}
    return message;
  }

  _parseJsonToLogs(message) {
    var jsonArray = [];
    message = this._removeLastNewline(message);
    try {
      var splittedJson = message.split("\n").join(",");
      jsonArray = JSON.parse(`[${splittedJson}]`);
    } catch (e) {
      if (e instanceof TypeError) {
        jsonArray[0] = message;
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

  _parseEventHubLogMessagesToArray(eventHubMessage, logType) {
    var logsArray = [];
    if (this._parsing === true)
      throw Error("already parsing, create a new DataParser");
    this._parsing = true;
    switch (logType.toLowerCase()) {
      case "csv":
        logsArray = this._parseCSVtoLogs(eventHubMessage);
        break;
      case "json":
        logsArray = this._parseJsonToLogs(eventHubMessage);
        break;
      default:
        logsArray = eventHubMessage;
    }
    if (isArray(logsArray)) {
      logsArray.forEach(message => this._pushMessage(message));
    } else {
      this._pushMessage(logsArray);
    }
    return this._parsedMessages;
  }
}

module.exports = DataParser;
