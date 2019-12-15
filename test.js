const DataParser = require("./data-parser");
const logsBuilder = require("./log-builder-test");
const logHandler = require("./core");
const nock = require("nock");
const dummyHost = "listener.logz.io";
const nockHttpAddress = `https://${dummyHost}:8071`;
const dummyToken = "123456789";

const context = {
  log: () => {}, 
  done: () => {},
  err: () => {}
};

var parseMessagesArray;
const stringLog = JSON.stringify(logsBuilder.simpleStringLog);
const validJson = logsBuilder.validJson;
const multiJson = logsBuilder.multiJson;
const validCSV = logsBuilder.validCSV;
const validItem = { 
  Lead: 'Melissa Potter',
  Title: 'Head of Accounts',
  Phone: '(555)791-3471',
  Notes: '"Not interested; gave referral"' 
}

describe('Azure eventHub functions - unittest', () => {
  it('Simple string logs', () => {
    const dataParser = new DataParser(context);
    parseMessagesArray = dataParser.parseEventHubLogMessagesToArray(stringLog, 'text');
    expect(parseMessagesArray.length).toBe(1);
    expect(parseMessagesArray[0]).toBe(stringLog);
  });

  it('Json logs', () => {   
    const dataParser = new DataParser(context);
    parseMessagesArray = dataParser.parseEventHubLogMessagesToArray(validJson, 'json');
    expect(parseMessagesArray.length).toBe(1);
    expect(JSON.stringify(parseMessagesArray[0])).toBe(JSON.stringify(validJson));
  });

  it('Multiple Json logs', () => {
    const dataParser = new DataParser(context);
    parseMessagesArray = dataParser.parseEventHubLogMessagesToArray(multiJson, 'json');
    const jsonArray = JSON.parse(`[${multiJson.split("\n")}]`);
    expect(parseMessagesArray.length).toBe(jsonArray.length);
    expect(JSON.stringify(parseMessagesArray)).toBe(JSON.stringify(jsonArray));
  });

  it('CSV logs', () => {
    const dataParser = new DataParser(context);
    fileLength = validCSV.split("\n").length - 1; 
    parseMessagesArray = dataParser.parseEventHubLogMessagesToArray(validCSV, 'csv');
    expect(parseMessagesArray.length).toBe(fileLength);
    expect(JSON.stringify(parseMessagesArray[fileLength - 1])).toBe(JSON.stringify(validItem));
  });

  describe('Test functions full flow', () => {
    beforeEach(() => {
      process.env.LogzioToken = dummyToken;
      process.env.LogzioHost = dummyHost;
    });

    it('logzioLogsFunction', (done) => {
      nock(nockHttpAddress)
        .post('/')
        .query({
          token: dummyToken,
        })
        .reply(200, () => {
          done();
        });
        logHandler.sendData(stringLog, 'text', context);
      });

  });
});