# Ship logs from Azure Blob Storage

To simplify shipping of your logs in Azure Blob Storage,
we provide an automated deployment process.

At the end of this process,
this integration will forward logs from Azure Blob Storage
to your Logz.io account.

<!-- tabContainer:start -->
<div class="branching-container">

* [For a new blob storage account](#new-blob-config)
* [For an existing blob storage account](#existing-blob-config)

<!-- tab:start -->
<div id="new-blob-config">

## New blob storage setup

<div class="tasklist">

### 1. Configure an automated deployment

👇 Click this button to start the automated deployment.

[![Deploy to Azure](https://azuredeploy.net/deploybutton.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Flogzio%2Flogzio-azure-blob%2Fmaster%2Fdeployments%2FdeploymentTemplateForNewStorage.json)

You'll be taken to Azure,
where you'll configure the resources to be deployed.
Make sure to use the settings shown below.

#### In the BASICS section

| Parameter | Description |
|---|---|
| Resource group | Click **Create new**. Give a meaningful **Name**, such as "logzioEventHubIntegration", and then click **OK**. |
| Location | Choose the same region as the Azure services that will stream data to this Event Hub. |

#### In the SETTINGS section

| Parameter | Description |
|---|---|
| Logs listener host | Use the listener URL for your logs account region. For more information on finding your account's region, see [Account region](https://docs.logz.io/user-guide/accounts/account-region.html). |
| Logs account token | Use the [token](https://app.logz.io/#/dashboard/settings/general) of the logs account you want to ship to. |

At the bottom of the page, select **I agree to the terms and conditions stated above**,
and then click **Purchase** to deploy.

Deployment can take a few minutes.

### 2. Check Logz.io for your logs

Give your logs some time to get from your system to ours, and then open Kibana.
If everything went according to plan, you should see logs with the type `blobStorage` in Kibana.

If you still don’t see your logs, see [log shipping troubleshooting](https://docs.logz.io/user-guide/log-shipping/log-shipping-troubleshooting.html).

</div>

</div>
<!-- tab:end -->

<!-- tab:start -->
<div id="existing-blob-config">

## Existing blob storage setup

**Important**:
**If you don't have a StorageV2 account, stop here.**
Instead, set up this deployment for existing blob storage.
<br>
<br>
This deployment works with general-purpose v2 storage accounts only.
These are listed as "StorageV2" in the
[_Storage accounts_](https://portal.azure.com/#blade/HubsExtension/BrowseResource/resourceType/Microsoft.Storage%2FStorageAccounts)
list,
under the _Kind_ column.

<div class="tasklist">

### 1. Configure an automated deployment

👇 Click this button to start the automated deployment.

[![Deploy to Azure](https://azuredeploy.net/deploybutton.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Flogzio%2Flogzio-azure-blob%2Fmaster%2Fdeployments%2FdeploymentTemplate.json)

You'll be taken to Azure,
where you'll configure the resources to be deployed.
Make sure to use the settings shown below.

#### In the BASICS section

| Parameter | Description |
|---|---|
| Resource group | Click **Create new**. Give a meaningful **Name**, such as "logzioEventHubIntegration", and then click **OK**. |
| Location | Choose the same region as the Azure services that will stream data to this Event Hub. |

#### In the SETTINGS section

| Parameter | Description |
|---|---|
| Logs listener host | Use the listener URL for your logs account region. For more information on finding your account's region, see [Account region](https://docs.logz.io/user-guide/accounts/account-region.html). |
| Logs account token | Use the [token](https://app.logz.io/#/dashboard/settings/general) of the logs account you want to ship to. |
| Format (Default: text) | Your files format: json/csv/text  |

At the bottom of the page, select **I agree to the terms and conditions stated above**,
and then click **Purchase** to deploy.

Deployment can take a few minutes.

### 2. _(If needed)_ Build a blob container

If you don't have a blob container, build one now.

In the
[_Storage accounts_](https://portal.azure.com/#blade/HubsExtension/BrowseResource/resourceType/Microsoft.Storage%2FStorageAccounts)
page, click your StorageV2 storage account to open it.

Click the **Containers** card to continue to the _Containers_ page.

Click **+ Container** in the toolbar.

Give your container a meaningful **Name**,
and choose **Blob** from the **Public access level** list.

Press **OK** to create your container
and return to the _Containers_ page.

### 3. Build an event subscription

In your storage account, in the left menu, click **Events**.

Click **+ Event Subscription** in the toolbar.

#### In "EVENT SUBSCRIPTION DETAILS"

| Parameter | Description |
|---|---|
| Name | Give a meaningful name. |
| Event Schema | Choose **Event Grid Schema** |

#### In "EVENT TYPES"

Give the event subscription a meaningful **Name**.

| Parameter | Description |
|---|---|
| Filter to Event Types | Select **Blob Created** only, and clear the remaining check boxes. |

#### In "ENDPOINT DETAILS"

| Parameter | Description |
|---|---|
| Endpoint Type | Choose **Event Hubs**. |
| Endpoint | Click **Select an endpoint**, then choose your new **Resource group** (we gave the sample name "logzioEventHubIntegration" above). |

Click **Create** to continue.

### 4. Check Logz.io for your logs

Give your logs some time to get from your system to ours, and then open Kibana.
If everything went according to plan, you should see logs with the type `blobStorage` in Kibana.

If you still don’t see your logs, see [log shipping troubleshooting](https://docs.logz.io/user-guide/log-shipping/log-shipping-troubleshooting.html).

</div>

</div>
<!-- tab:end -->

</div>
<!-- tabContainer:end -->
