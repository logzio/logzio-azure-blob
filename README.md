# logzio-azure-blob
This repo contains the code and instructions you'll need to ship logs from your Azure Blob Storage to Logz.io.
At the end of this process, your Azure function will forward logs from an Azure Blob Stroage Account to your Logz.io account.

## Setting log shipping from Azure
Option one: Build a new blob storage account and set your log shipping.

Option two: Set your log shipping for an exiting blob storage.

# Option one:

## Build a new blob storage account and set your log shipping

### 1. Deploy the Logz.io template

 👇Deploy your logs from an existing blob storage

 [![Deploy to Azure](https://azuredeploy.net/deploybutton.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Flogzio%2Flogzio-azure-blob%2Fdevelop%2Fdeployments%2FdeploymentTemplateForNewStorage.json)

### 2. Configure the template

Make sure to use these settings:

**In the BASICS section**
* **Resource group**: Click **Create new**. <br />
  Give a meaningful **Name**, such as "logzioEventHubIntegration", and then click **OK**.
* **Location**: Choose the same region as the Azure services that will stream data to this Event Hub.

**In the SETTINGS section:**
* **Logs listener host**: Use the listener URL for your logs account region.
  If your login URL is app.logz.io, use `listener.logz.io` (this is the default setting).
  If your login URL is app-eu.logz.io, use `listener-eu.logz.io`.
* **Logs account token**: Use the [token](https://app.logz.io/#/dashboard/settings/general) of the logs account you want to ship to.

At the bottom of the page, select **I agree to the terms and conditions stated above**, and then click **Purchase** to deploy.

Deployment can take a few minutes.

### 3. [Add backup storage account](LINK TO Optional part) for shipping timeouts

### 4. Check Logz.io for your logs

Upload blobs to your storage account and watch them in Kibana.

# Option two:

## Set your log shipping for an exiting blob storage

*** This option is for storage account of kind "StorageV2" only.
 To find out your storage account's kind go to your Storage account/overview. ***

![Account kind](images/Storage-account-settings.png)


### 1. Deploy the Logz.io template

 👇Deploy your logs from an existing blob storage

 [![Deploy to Azure](https://azuredeploy.net/deploybutton.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Flogzio%2Flogzio-azure-blob%2Fdevelop%2Fdeployments%2FdeploymentTemplate.json)

### 2. Configure the template

Make sure to use these settings:

**In the BASICS section**
* **Resource group**: Click **Create new**. <br />
  Give a meaningful **Name**, such as "logzioEventHubIntegration", and then click **OK**.
* **Location**: Choose the same region as the Azure services that will stream data to this Event Hub.

**In the SETTINGS section:**
* **Logs listener host**: Use the listener URL for your logs account region.
  If your login URL is app.logz.io, use `listener.logz.io` (this is the default setting).
  If your login URL is app-eu.logz.io, use `listener-eu.logz.io`.
* **Logs account token**: Use the [token](https://app.logz.io/#/dashboard/settings/general) of the logs account you want to ship to.

At the bottom of the page, select **I agree to the terms and conditions stated above**, and then click **Purchase** to deploy.

Deployment can take a few minutes.

### 3. Build a blob container (if you don't have one)
On your storage account:
1. Go to **Containers**.
2. Add a new container:
    * Name: **choose a uniqe name**.
    * Public access level: choose **Blob**.
3. Press **OK**.

### 4. Build an event subscription
On your storage account:
1. Go to 'Events'. (If you do not have an 'Events' tab, your storage account is not of kind 'StorageV2', please deploy with option one). //link to option one
2. Add a new event subscription:
    * Name: **choose a uniqe name**.
    * Event Schema: **Event Grid Schema**.
    * Event types/Filter to event types: Mark only **Blob Created** (Unmark the rest).
    * Endpoint type: 
        * Choose **eventhub**.
        * Press **Select an endpoint**
        * Resource Group: put your **new** resource group.
        * Press **Confirm Seletion**.
    * Press 'Create'. 

![Account kind](images/create-event-subscription.png)

### 5. [Add backup storage account](LINK TO Optional part) for shipping timeouts

### 6. Check Logz.io for your logs

Upload blobs to your storage account and watch them in Kibana.

# _(Optional)_ Add backup storage account for shipping timeouts

You can configure logzio-azure-serverless to back up your blobs to Azure Blob Storage,
so if the connection to Logz.io times out or an error occurs, you'll still have a backup of any dropped data that didn't get shipped.

To do this, expand your function app's left menu, and then click **Integrate**.

In the top of the triggers panel, click **Azure Blob Storage (outputBlob)**.
The _Azure Blob Storage output_ settings are displayed.
* Blob parameter name: **outputBlob**
* Path: **logziologsfailcontainer/{output-blob}**
* Storage account connection: **LogsStorageConnectionString**
* Press **Save**.

![New Blob output](images/output-blob-storage.png)

**Note:** For more information on Azure Blob output binding, see [Azure Blob storage bindings for Azure Functions > Output](https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-storage-blob#output) from Microsoft.

