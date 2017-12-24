::: page-description
# Inpatient Discharge Follow-Up Applet #
This applet's main purpose is to display discharges from the user's facility
:::

## Applet Id ##
```JavaScript
{ id: 'discharge_followup' }
```

## View Types ##
### Expanded ###
```JavaScript
{
    type: 'expanded',
    view: AppletLayoutView,
    chromeEnabled: true
}
```

#### View ####
Uses [ADK.UI.ServerPagingApplet](/r2.0/documentation/#/adk/ui-library/applet-views#ServerPagingApplet) to display a list of discharges from the current facility. A toolbar is available in the applet header to provide server side filtering based on teams associated with the discharge. The filter will default to the user's teams if they are part of any. The standard applet filtering behavior is available as well. This applet will be available in the application's staff context.

## Messaging Events ##
### Requests ###
#### On Applet Channel ####
`ADK.Messaging.getChannel('task_forms')`
##### activity_detail {.method} #####
On request of this event, tasks_forms applet will open the shared activity details modal.
```JavaScript
ADK.Messaging.getChannel('task_forms').request('activity_detail', activityDetailsParams);
```

[Expanded View]: #View-Types-Expanded