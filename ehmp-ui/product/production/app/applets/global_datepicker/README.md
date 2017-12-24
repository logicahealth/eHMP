::: page-description
# Global Datepicker Applet #
This applet's main purpose is to provide an UI that allows the user to go to one place to change the date range applied as a filter to the data presented on the screen.
:::

## Applet Id ##
```JavaScript
{ id: 'global_datepicker' }
```

## View Types ##
### Selector ###
```JavaScript
{
    type: 'selector',
    chromeEnabled: false
    view: //see below
}
```
#### View ####
Default view type, that joins together all the other view types to provide a UI experience that helps the user choose the appropriate global date range filter to apply.

### Spike Line ###
```JavaScript
{
    type: 'spikeLine',
    chromeEnabled: false
    view: //see below
}
```
#### View ####
Small graphical representation of the data for the date range selected. This is used and displayed in the [Selector View][Selector].

### Trend History ###
```JavaScript
{
    type: 'trendHistory',
    chromeEnabled: false
    view: //see below
}
```
#### View ####
Larger graphical representation of the data for the larger date range available. This is used and displayed in the [Selector View][Selector]'s popover.

## Registered Components ##
### Global Datepicker ###
```JavaScript
{
    type: "contextHeaderItem",
    group: ["patient", "patient-right"],
    key: "globalDatePicker"
    ...
}
```
Registers the applet's [Selector View][Selector] to the right side of the patient context's header. The view will be shown on any workspace that is under the patient context and doesn't specify `globalDatepicker: false` as part of it's workspace definition.

## Messaging Events ##
### Triggers ###
#### On Global Channel ####
`ADK.Messaging`
##### globalDate:selected {.method} #####
Views can listen for this event and update their elements based on the new date range.

_Note:_ This event passes along the newly set date range model as an argument to any callbacks registered.
```JavaScript
this.listenTo(ADK.Messaging, 'globalDate:selected', function(dateModel) {
    // do something with the newly set date range
}
```

[Selector]: #View-Types-Selector
