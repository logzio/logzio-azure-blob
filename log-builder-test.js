const simpleStringLog = 'test';

const validJson = { "systemId": "validJson", "category": "NetworkSecurityGroupEvent", "resourceId": "/SUBSCRIPTIONS/6EFCEE72-C8D7-4DE7-9E6A-4B20FDCA5725/RESOURCEGROUPS/LOGZIOINTEGRATION/PROVIDERS/MICROSOFT.NETWORK/NETWORKSECURITYGROUPS/LOGSGENERATORVM-NSG", "operationName": "NetworkSecurityGroupEvents", "properties": {"vnetResourceGuid":"{01A750B5-2BCC-461B-A3DA-8958FFB4DDF7}","subnetPrefix":"172.16.0.0/24","macAddress":"00-0D-3A-36-5D-CA","primaryIPv4Address":"172.16.0.4","ruleName":"UserRule_HTTP","direction":"In","priority":340,"type":"allow","conditions":{"protocols":"6","sourcePortRange":"0-65535","destinationPortRange":"80-80","sourceIP":"0.0.0.0/0,0.0.0.0/0","destinationIP":"0.0.0.0/0,0.0.0.0/0"}}};

//JSON.stringify or insert new line
const invalidJson = `{
	"key1": "value1",
	"key2": "value2",
	"key3": "value3"
},
{
	"key1": "value1",
	"key2": "value2",
	"key3": "value3"
}`

const validCSV = `Lead,Title,Phone,Notes
Jim Grayson,Senior Manager,(555)761-2385,"Spoke Tuesday; he is interested"
Prescilla Winston,Development Director,(555)218-3981, "said to call again next week"
Melissa Potter,Head of Accounts,(555)791-3471,"Not interested; gave referral"`;

const multiJson = 
`{ "systemId": "mySystemID", "category": "NetworkSecurityGroupEvent", "resourceId": "/SUBSCRIPTIONS/6EFCEE72-C8D7-4DE7-9E6A-4B20FDCA5725/RESOURCEGROUPS/LOGZIOINTEGRATION/PROVIDERS/MICROSOFT.NETWORK/NETWORKSECURITYGROUPS/LOGSGENERATORVM-NSG", "operationName": "NetworkSecurityGroupEvents", "properties": {"vnetResourceGuid":"{01A750B5-2BCC-461B-A3DA-8958FFB4DDF7}","subnetPrefix":"172.16.0.0/24","macAddress":"00-0D-3A-36-5D-CA","primaryIPv4Address":"172.16.0.4","ruleName":"DefaultRule_AllowAzureLoadBalancerInBound","direction":"In","priority":65001,"type":"allow","conditions":{"sourcePortRange":"0-65535","destinationPortRange":"0-65535","destinationIP":"0.0.0.0/0,0.0.0.0/0"}}}
{ "systemId": "mySystemID", "category": "NetworkSecurityGroupEvent", "resourceId": "/SUBSCRIPTIONS/6EFCEE72-C8D7-4DE7-9E6A-4B20FDCA5725/RESOURCEGROUPS/LOGZIOINTEGRATION/PROVIDERS/MICROSOFT.NETWORK/NETWORKSECURITYGROUPS/LOGSGENERATORVM-NSG", "operationName": "NetworkSecurityGroupEvents", "properties": {"vnetResourceGuid":"{01A750B5-2BCC-461B-A3DA-8958FFB4DDF7}","subnetPrefix":"172.16.0.0/24","macAddress":"00-0D-3A-36-5D-CA","primaryIPv4Address":"172.16.0.4","ruleName":"DefaultRule_AllowAzureLoadBalancerInBound","direction":"In","priority":65001,"type":"allow","conditions":{"sourcePortRange":"0-65535","destinationPortRange":"0-65535","destinationIP":"0.0.0.0/0,0.0.0.0/0"}}}
{ "systemId": "mySystemID", "category": "NetworkSecurityGroupEvent", "resourceId": "/SUBSCRIPTIONS/6EFCEE72-C8D7-4DE7-9E6A-4B20FDCA5725/RESOURCEGROUPS/LOGZIOINTEGRATION/PROVIDERS/MICROSOFT.NETWORK/NETWORKSECURITYGROUPS/LOGSGENERATORVM-NSG", "operationName": "NetworkSecurityGroupEvents", "properties": {"vnetResourceGuid":"{01A750B5-2BCC-461B-A3DA-8958FFB4DDF7}","subnetPrefix":"172.16.0.0/24","macAddress":"00-0D-3A-36-5D-CA","primaryIPv4Address":"172.16.0.4","ruleName":"DefaultRule_AllowAzureLoadBalancerInBound","direction":"In","priority":65001,"type":"allow","conditions":{"sourcePortRange":"0-65535","destinationPortRange":"0-65535","destinationIP":"0.0.0.0/0,0.0.0.0/0"}}}
{ "systemId": "mySystemID", "category": "NetworkSecurityGroupEvent", "resourceId": "/SUBSCRIPTIONS/6EFCEE72-C8D7-4DE7-9E6A-4B20FDCA5725/RESOURCEGROUPS/LOGZIOINTEGRATION/PROVIDERS/MICROSOFT.NETWORK/NETWORKSECURITYGROUPS/LOGSGENERATORVM-NSG", "operationName": "NetworkSecurityGroupEvents", "properties": {"vnetResourceGuid":"{01A750B5-2BCC-461B-A3DA-8958FFB4DDF7}","subnetPrefix":"172.16.0.0/24","macAddress":"00-0D-3A-36-5D-CA","primaryIPv4Address":"172.16.0.4","ruleName":"DefaultRule_AllowAzureLoadBalancerInBound","direction":"In","priority":65001,"type":"allow","conditions":{"sourcePortRange":"0-65535","destinationPortRange":"0-65535","destinationIP":"0.0.0.0/0,0.0.0.0/0"}}}
{ "systemId": "mySystemID", "category": "NetworkSecurityGroupEvent", "resourceId": "/SUBSCRIPTIONS/6EFCEE72-C8D7-4DE7-9E6A-4B20FDCA5725/RESOURCEGROUPS/LOGZIOINTEGRATION/PROVIDERS/MICROSOFT.NETWORK/NETWORKSECURITYGROUPS/LOGSGENERATORVM-NSG", "operationName": "NetworkSecurityGroupEvents", "properties": {"vnetResourceGuid":"{01A750B5-2BCC-461B-A3DA-8958FFB4DDF7}","subnetPrefix":"172.16.0.0/24","macAddress":"00-0D-3A-36-5D-CA","primaryIPv4Address":"172.16.0.4","ruleName":"DefaultRule_AllowAzureLoadBalancerInBound","direction":"In","priority":65001,"type":"allow","conditions":{"sourcePortRange":"0-65535","destinationPortRange":"0-65535","destinationIP":"0.0.0.0/0,0.0.0.0/0"}}}
{ "systemId": "mySystemID", "category": "NetworkSecurityGroupEvent", "resourceId": "/SUBSCRIPTIONS/6EFCEE72-C8D7-4DE7-9E6A-4B20FDCA5725/RESOURCEGROUPS/LOGZIOINTEGRATION/PROVIDERS/MICROSOFT.NETWORK/NETWORKSECURITYGROUPS/LOGSGENERATORVM-NSG", "operationName": "NetworkSecurityGroupEvents", "properties": {"vnetResourceGuid":"{01A750B5-2BCC-461B-A3DA-8958FFB4DDF7}","subnetPrefix":"172.16.0.0/24","macAddress":"00-0D-3A-36-5D-CA","primaryIPv4Address":"172.16.0.4","ruleName":"DefaultRule_AllowAzureLoadBalancerInBound","direction":"In","priority":65001,"type":"allow","conditions":{"sourcePortRange":"0-65535","destinationPortRange":"0-65535","destinationIP":"0.0.0.0/0,0.0.0.0/0"}}}
{ "systemId": "mySystemID", "category": "NetworkSecurityGroupEvent", "resourceId": "/SUBSCRIPTIONS/6EFCEE72-C8D7-4DE7-9E6A-4B20FDCA5725/RESOURCEGROUPS/LOGZIOINTEGRATION/PROVIDERS/MICROSOFT.NETWORK/NETWORKSECURITYGROUPS/LOGSGENERATORVM-NSG", "operationName": "NetworkSecurityGroupEvents", "properties": {"vnetResourceGuid":"{01A750B5-2BCC-461B-A3DA-8958FFB4DDF7}","subnetPrefix":"172.16.0.0/24","macAddress":"00-0D-3A-36-5D-CA","primaryIPv4Address":"172.16.0.4","ruleName":"DefaultRule_AllowAzureLoadBalancerInBound","direction":"In","priority":65001,"type":"allow","conditions":{"sourcePortRange":"0-65535","destinationPortRange":"0-65535","destinationIP":"0.0.0.0/0,0.0.0.0/0"}}}
{ "systemId": "mySystemID", "category": "NetworkSecurityGroupEvent", "resourceId": "/SUBSCRIPTIONS/6EFCEE72-C8D7-4DE7-9E6A-4B20FDCA5725/RESOURCEGROUPS/LOGZIOINTEGRATION/PROVIDERS/MICROSOFT.NETWORK/NETWORKSECURITYGROUPS/LOGSGENERATORVM-NSG", "operationName": "NetworkSecurityGroupEvents", "properties": {"vnetResourceGuid":"{01A750B5-2BCC-461B-A3DA-8958FFB4DDF7}","subnetPrefix":"172.16.0.0/24","macAddress":"00-0D-3A-36-5D-CA","primaryIPv4Address":"172.16.0.4","ruleName":"DefaultRule_AllowAzureLoadBalancerInBound","direction":"In","priority":65001,"type":"allow","conditions":{"sourcePortRange":"0-65535","destinationPortRange":"0-65535","destinationIP":"0.0.0.0/0,0.0.0.0/0"}}}
{ "systemId": "mySystemID", "category": "NetworkSecurityGroupEvent", "resourceId": "/SUBSCRIPTIONS/6EFCEE72-C8D7-4DE7-9E6A-4B20FDCA5725/RESOURCEGROUPS/LOGZIOINTEGRATION/PROVIDERS/MICROSOFT.NETWORK/NETWORKSECURITYGROUPS/LOGSGENERATORVM-NSG", "operationName": "NetworkSecurityGroupEvents", "properties": {"vnetResourceGuid":"{01A750B5-2BCC-461B-A3DA-8958FFB4DDF7}","subnetPrefix":"172.16.0.0/24","macAddress":"00-0D-3A-36-5D-CA","primaryIPv4Address":"172.16.0.4","ruleName":"DefaultRule_AllowAzureLoadBalancerInBound","direction":"In","priority":65001,"type":"allow","conditions":{"sourcePortRange":"0-65535","destinationPortRange":"0-65535","destinationIP":"0.0.0.0/0,0.0.0.0/0"}}}`;


module.exports = {
    simpleStringLog,
    multiJson,
    validJson,
    invalidJson,
    validCSV
  };