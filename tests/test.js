const DataParser = require("./data-parser");
const logsBuilder = require("./log-builder-test");
const logHandler = require("./core");
const nock = require("nock");
const dummyHost = "listener.logz.io";
const nockHttpAddress = `https://${dummyHost}:8071`;
const dummyToken = '123456789';
const formats = {
  csv: "csv",
  json: "json",
  text: "text"
 };
 const context = {
  log: () => {},
  done: () =>{},
  err: () => {}
};
const validItem = {
  Lead: 'Jim Grayson',
  Title: 'Senior Manager',
  Phone: '(555)761-2385',
  Notes: '"Spoke Tuesday; he is interested"'
}
const validItemIndex = 0;
const parseJsonTest = () => {
  const dataParser = new DataParser(context);
  var jsonArray = JSON.parse(`[${multiLines.split("\n")}]`);
  jsonArray.forEach((log, index) => {
    if (log.time) {
      delete Object.assign(log, {
        "@timestamp": log.time
      }).time;
    }
    jsonArray[index] = dataParser._removeEmpty(log);
  });
  return jsonArray;
};
const stringLog = logsBuilder.simpleStringLog;
const validJson = logsBuilder.validJson;
const multiLines = logsBuilder.multiLines;
const validCSV = logsBuilder.validCSV;
var parseMessagesArray;

describe("Azure Blob Storage functions - unittest", () => {

  it("Simple string logs", () => {
    const dataParser = new DataParser(context);
    parseMessagesArray = dataParser.parseEventHubLogMessagesToArray(stringLog, formats.text);
    const validStringLogArray = [ stringLog ];
    expect(parseMessagesArray).toEqual(validStringLogArray);
  });

  it("Json logs", () => {
    const dataParser = new DataParser(context);
    parseMessagesArray = dataParser.parseEventHubLogMessagesToArray(validJson, formats.json);
    expect(parseMessagesArray.length).toBe(1);
    expect(parseMessagesArray[0]).toEqual(
      validJson
    );
  });

  it("Multiple lines as Json", () => {
    const dataParser = new DataParser(context);
    parseMessagesArray = dataParser.parseEventHubLogMessagesToArray(multiLines, formats.json);
    var jsonParsedValid = parseJsonTest();
    expect(parseMessagesArray).toEqual(
      jsonParsedValid
    );
  });

  it("Multiple lines as text", () => {
    const format = process.env.Format;
    const dataParser = new DataParser(context);
    parseMessagesArray = dataParser.parseEventHubLogMessagesToArray(multiLines, formats.text);
    var textParsedValid = multiLines.split("\n");
    expect(parseMessagesArray).toEqual(
      (textParsedValid)
    );
  });

  it("CSV logs", () => {
    const dataParser = new DataParser(context);
    fileLength = validCSV.split("\n").length - 1;
    parseMessagesArray = dataParser.parseEventHubLogMessagesToArray(validCSV, formats.csv);
    expect(parseMessagesArray.length).toBe(fileLength);
    expect(parseMessagesArray[validItemIndex]).toEqual(
      validItem
    );
  });
  
  describe("Test functionsz full flow", () => {
    beforeEach(() => {
      process.env.LogzioToken = dummyToken;
      process.env.LogzioHost = dummyHost;
      process.env.Format = formats.text;
    });

    it("logzio Host is called", done => {
      nock(nockHttpAddress)
        .post("/")
        .query({
          token: dummyToken
        })
        .reply(200, (response) => {
          done();
        });
        logHandler.sendData(stringLog, context);
    });
  });
});