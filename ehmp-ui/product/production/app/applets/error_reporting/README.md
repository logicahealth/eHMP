::: page-description
# Error Reporting Applet #
This applet's main purpose is to allow the user to report an incident to the operations team.
:::

## Applet Id ##
```JavaScript
{ id: 'error_reporting' }
```

## View Types ##
### Footer Error Report Button ###
```JavaScript
{
    type: 'footer-error-report-button',
    chromeEnabled: false
    view: //see below
}
```
#### View ####
Displays a HTML button that on click opens a report form that contains a comment field which the user can use to describe the issue(s) they are experiencing as well as a list of any caught errors. The list of caught errors are pull from `ADK.Errors.collection`. The error models captured in the list are removed from the collection once the report form is submitted.
::: callout
**Note:** The comment field is required if there are no errors present in the list displayed in the report modal.
:::
##### Options #####
###### label {.method} ######
String value used as the button's text.
###### showErrorWarning {.method} ######
Boolean value that determines if the button should display a visual indicator when the application has caught errors. Default value is `false`.

## Registered Components ##
### Error Reporter ###
This component is registered twice under two different types/groups.
```JavaScript
// meant for use in application footer only
{
    type: "applicationFooterItem",
    group: "right",
    key: "errorReporter"
    ...
}
```
```JavaScript
// meant for use in any error view
{
    type: "errorItem",
    key: "errorReporter"
    ...
}
```
#### Consuming Error Reporting Button ####
To add the "Report Issue" button to an error view, include the 'ErrorComponents' behavior to the error view. This will display all registered error view components (i.e. `type: 'errorItem'`). See the ADK docs on registered components registration for full details on consuming registered components.

```JavaScript
behaviors: {
    ErrorComponents: {
        container: 'td.has-error-message', // element in which to append button, defaults to view's $el
        getModel: function() { // receives view as binding, uses view.model by default
            return this.errorModel;
        },
        shouldShow: function() { // returns boolean, if shouldShow is undefined, assumes true
            return _.isEqual(this.model.get('state'), 'error');
        }
    }
}
```
