::: page-description
# Patient Sync Status Applet #
This applet's main purpose is to request and display the status of the patient record's synchronization process.
:::

## Applet Id ##
```JavaScript
{ id: 'patient_sync_status' }
```

## View Types ##
### Details ###
```JavaScript
{
    type: 'details',
    chromeEnabled: false
    view: //see below
}
```
#### View ####

### Footer Summary ###
```JavaScript
{
    type: 'footerSummary',
    chromeEnabled: false
    view: //see below
}
```
#### View ####
Displays a concise list of different areas patient data is synced from. This list includes items like: `MySite`, `All VA`, `DoD`, and `Communities`.
Each list item has a corresponding icon that indicates whether there is new data available for sync or if the area is up-to-date. Present alongside the list are two actionable items. The first is a **Refresh All Data** button which will pull down any new data that is available to be synced. The second item is a **View Details** button that will open up a modal with the applet's [details view][Details View].

Along with the sync status list and controls, the view displays the site that the current user in logged.

## Registered Components ##
### Patient Sync Status ###
```JavaScript
{
    type: "applicationFooterItem",
    group: "right",
    key: "patientSyncStatus"
    ...
}
```
Registers the applet's [footer summary view][FooterSummaryView] to the application's footer region. The view will be shown on any workspace that is under the patient context.
### Patient Sync Status Help ###
```JavaScript
{
    type: "applicationFooterItem",
    group: "right",
    key: "patientSyncStatusHelp"
    ...
}
```
Registers a corresponding help button to the application's footer region. The button will be shown on any workspace that is under the patient context.
## Messaging Events ##
### Replies ###
#### On Applet Channel ####
`ADK.Messaging.getChannel('patient_sync_status')`
##### get:simple:sync:status {.method} #####
On request of this event, the applet returns the last received raw data response object from the RDK `synchronization-datastatus` fetch resource.
```JavaScript
ADK.Messaging.getChannel('patient_sync_status').reply('get:simple:sync:status', _.bind(function() {
    return this.model.get('rawData');
}, this));
```

[Details View]: #View-Types-Details
[FooterSummaryView]: #View-Types-Footer-Summary
