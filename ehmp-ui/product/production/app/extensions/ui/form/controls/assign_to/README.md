<!-- { "label": "Assign To", "path": "UI.Form.Controls.AssignTo", "tags": ["assignment", "roles", "person", "teams", "facility"] } -->

::: page-description
# Assign To Form Control Extension #
Re-usable assignment form control.
:::
## Overview ##
The assign to form control extension provides a consistent UI pattern for selecting a person or team with associated roles inside an [ADK Form View][ADK.UI.Form]. The control is built with a subset of five separate form fields each corresponding to predefined configuration of a [ADK's Form Control][ADK.UI.Form.Controls].  The assign to control has logic around: show/hiding fields, populating select pick-lists, form model validation, and error catching.  Below is a table outlining the five fields that make up this control:

| Label         | Name          | Type              | Description                                                                                   |
|:--------------|:--------------|:------------------|:----------------------------------------------------------------------------------------------|
| Assign to     | **type**      | radio control     | configured with a set of radio options. The selected option plays into the logic of show/hiding fields, populating select pick-lists, and determining what fields are required when validating the model's value. The set of radio options is configurable via the control's _options_ attribute outlined in the [Field Options](#field-options) table.  |
| Facility      | **facility**  | select control    | list of facilities. The field's value drives the filtered pick-list data that populates the _Person_ and _Team_ fields. |
| Person        | **person**    | select control    | list of eHMP users. |
| Team          | **team**      | select control    | list of teams for a facility. The field's value drives the filtered pick-list data that populates the _Roles_ field.  |
| Roles         | **roles**     | select control    | list of roles for a team. Multiple roles may be selected. |

### Field Values ###

Each field's _name_ will be utilized as the key on the object that holds the values for the fields selected item. This object of values will be saved to the form's model under the attribute name assigned by the [control's _name_ field option](#field-options).

::: showcode See code example of how to access the fields' values on the form's model.
```JavaScript
var ExampleFormView = ADK.UI.Form.extend({
    controlClass: {
        'assignTo': Extensions.UI.Form.Controls.AssignTo
    },
    fields: [{
        control: "assignTo",
        name: "assignment"
    }]
});
var form = new ExampleFormView({ model: new Backbone.Model() });
```

Result of calling `form.model.toJSON()`
```JSON
{
    assignment: {
        type: 'opt_anyteam',
        facility: 'facility1',
        team: 'team1',
        roles: ['role1']
        //...
    }
    //...
}
```

Example of retrieving the facility field's value: `_.get(form.model.get('assignment'), 'facility')`
:::

### Labels for Selected Values ###

To retrieve the labels for the selected items, a `_labelsForSelectedValues` attribute is made available on the object of values. Each field's _name_ will be utilized as the key on the object that holds the labels for the fields selected item.

::: showcode See code example of how to access the labels for selected values on the form's model.
```JavaScript
var ExampleFormView = ADK.UI.Form.extend({
    controlClass: {
        'assignTo': Extensions.UI.Form.Controls.AssignTo
    },
    fields: [{
        control: "assignTo",
        name: "assignment"
    }]
});
var form = new ExampleFormView({ model: new Backbone.Model() });
```

Result of calling `form.model.toJSON()`
```JSON
{
    assignment: {
        //...,
        _labelsForSelectedValues: {
            type: 'Any Team',
            facility: 'Facility 1',
            team: 'Team 1',
            roles: 'Role 1'
        }
    }
    //...
}
```

Example of retrieve the formatted facility name of the selected item: `_.get(form.model.get('assignment'), '_labelsForSelectedValues.facility')`
:::

### Resources Used For Fields' Pick-lists ###
For this control, the `type` value (radio field labeled "_Assign To_") is used to determine which resource is used to populate the fields' pick-lists. Below is a matrix of resources used based on the type selection:

| Assign To (_type_)                        |  Facility (_facility_) | Person (_person_)     | Team (_team_)         | Roles (_roles_)       |
|:------------------------------------------|:----------------------:|:---------------------:|:---------------------:|:---------------------:|
|**Me** (*opt_me*)                          |         _N.A._         |         _N.A._        |         _N.A._        |         _N.A._        |
|**Person** (*opt_person*)                  |         **#1**         |         **#2**        |         _N.A._        |         _N.A._        |
|**My Teams** (*opt_myteams*)               |         _N.A._         |         _N.A._        |   **#3** and **#4**   |         **#7**        |
|**Patient's Teams** (*opt_patientteams*)   |         _N.A._         |         _N.A._        |         **#5**        |         **#7**        |
|**Any Team** (*opt_anyteam*)               |         **#1**         |         _N.A._        |         **#6**        |         **#7**        |

1. [ADK.UIResources.Picklist.Locations.Facilities][Picklist.Facility]
2. [ADK.UIResources.Picklist.Team_Management.PeopleAtAFacility][Picklist.Person]
3. [ADK.UIResources.Picklist.Team_Management.Teams.ForAUser][Picklist.Teams.ForAUser]
4. [ADK.UIResources.Picklist.Team_Management.Teams.PatientRelatedForAUser][Picklist.Teams.PatientRelatedForAUser]
5. [ADK.UIResources.Picklist.Team_Management.Teams.ForAPatient][Picklist.Teams.ForAPatient]
6. [ADK.UIResources.Picklist.Team_Management.Teams.ForAFacility][Picklist.Teams.ForAFacility]
7. [ADK.UIResources.Picklist.Team_Management.Roles.ForATeam][Picklist.Roles]

## Field Options ##

| Required                         | Attribute       | Type       | Description / Example                                                           |
|:--------------------------------:|:----------------|:----------:|:--------------------------------------------------------------------------------|
|<i class="fa fa-check-circle"></i>| **name**        | string     | Model attribute to be updated. <br />**Example:** `name: "assignment"`|
|                                  | **extraClasses**| array of strings | Classes to be added to container <br />**Example:** `extraClasses: ["class1", "class2"]`|
|                                  | **hidden**      | boolean    | Makes control hidden <br />**Default:** `false`<br />**Example:** `hidden: true`|
|                                  | **modelListeners**| array of strings | Listen for change of specified model values <br />**Example:** `modelListeners: ["inputValue1", "inputValue2"]`<br />_Use this to have your template update based on model changes_|
|                                  | **options**     | object     | Configurable object that allows for the "Assign To" radio options of "Me", "Person", "My Teams", "Patient's Teams", or "Any Team" to be enabled/disabled individually. <br />**Example/Default:** `{ me: true, person: true, myTeams: true, patientsTeams: true, anyTeam: true }`|
|                                  | **required**    | boolean    | Makes all the control's fields required <br />**Default:** `true`<br />**Example:** `required: false`|
|                                  | **template**    | string  | HTML snippet to display before the control's fields <br />**Example:** `template: "<h3>Helpful text</h3>"` <br />_Can be used in conjunction with modelListeners to arrange model values_|


## Dynamic Control Events ##

| Event               | Parameter Type | Description / Example                                                      |
|:--------------------|:--------------:|:--------------------------------------------------------------------------------|
|**control:hidden**   | boolean        | hides/shows the full control <br/>**Example:** `$().trigger('control:hidden', true)` |
|**control:required** | boolean        | toggles the required state of the control's fields <br/>**Example:** `$().trigger('control:required', true)` |

## Validation ##
The control will automatically validate on submit (form model's isValid method is called). When the control is `required: true`, validation will ensure the appropriate fields are not empty based on the selection of the `type` value which is controlled by the radio field labeled "_Assign To_".

### Options ###
The control's internal model validate and isValid methods allows for the following options to be passed in:

| Attribute         | Parameter Type | Description / Example                                                      |
|:------------------|:--------------:|:--------------------------------------------------------------------------------|
|**silent**         | boolean        | prevents errorModel from being set with error messages and therefore the fields visually will not present any sign of error <br/>**Default:** `false`<br/>**Example:** `silent: true` |
|**loadingDraft**   | boolean        | sets the error message associated with `type` value (radio field labeled "_Assign To_") to "Error loading assign to list." when `type` value is undefined. This option is used to support the edge case of repopulating the field values from a draft state but one of the pick-list resource calls fails.<br/>**Default:** `false`<br/>**Example:** `loadingDraft: true` |
**Note:** These options will be passed along to the control's internal model's methods when calling the form model's validate or isValid methods.

### Required Fields ###
For this control, the `type` value (radio field labeled "_Assign To_") is always required when the control is set to `required: true`. Below is a matrix of required fields based on the type selection:

| Assign To (_type_)                        |  Facility (_facility_) | Person (_person_)     | Team (_team_)         | Roles (_roles_)       |
|:------------------------------------------|:----------------------:|:---------------------:|:---------------------:|:---------------------:|
|**Me** (*opt_me*)                          |                        |                       |                       |                       |
|**Person** (*opt_person*)                  | <i class="fa fa-asterisk"></i>|<i class="fa fa-asterisk"></i>|                       |                       |
|**My Teams** (*opt_myteams*)               | <i class="fa fa-asterisk"></i>|                       |<i class="fa fa-asterisk"></i>|<i class="fa fa-asterisk"></i>|
|**Patient's Teams** (*opt_patientteams*)   | <i class="fa fa-asterisk"></i>|                       |<i class="fa fa-asterisk"></i>|<i class="fa fa-asterisk"></i>|
|**Any Team** (*opt_anyteam*)               | <i class="fa fa-asterisk"></i>|                       |<i class="fa fa-asterisk"></i>|<i class="fa fa-asterisk"></i>|

## Code Examples ##
::: showcode Example Form Instance:
```JavaScript
var ExampleFormView = ADK.UI.Form.extend({
    controlClass: {
        'assignTo': Extensions.UI.Form.Controls.AssignTo
    },
    model: new Model(),
    fields: [
    // basic
    {
        control: "assignTo",
        name: "assignment1"
    },
    // with custom Template
    {
        control: "assignTo",
        name: "assignment2",
        template: "<b>Helpful text here</b>",
    },
    -- OR --
    {
        control: "assignTo",
        name: "assignment3",
        template: Handlebars.compile('<b>Helpful text here</b>')
    },
    // displaying model values in template
    {
        control: "assignTo",
        name: "assignment4",
        template: Handlebars.compile('<b>Make a selection on who {{value1}} will be assigned to.</b>'),
        modelListeners: ["value1"]
    },
    // with extra classes
    {
        control: "assignTo",
        name: "assignment5",
        extraClasses: ["special-class-1"]
    }]
});
```
:::
::: showcode Example of dynamically calling the control events:
``` JavaScript
//Trigger the hidden event to hide all the fields
this.$('.assignment').trigger('control:hidden', true)

//Trigger the required event to mark all fields as not required
this.$('.assignment').trigger('control:required', false)
```
:::

[ADK]: ./#/adk/
[ADK.UI]: ./#/adk/ui-library
[ADK.UI.Form]: ./#/adk/ui-library/views#Form
[ADK.UI.Form.Controls]: ./#/adk/ui-library/form-controls

[Picklist.Facility]: ./#/ui/resources/picklist/locations/facilities/
[Picklist.Person]: ./#/ui/resources/picklist/team_management/peopleAtAFacility/
[Picklist.Teams.ForAUser]: ./#/ui/resources/picklist/team_management/teams/forAUser/
[Picklist.Teams.PatientRelatedForAUser]: ./#/ui/resources/picklist/team_management/teams/forAUser/patientRelated/
[Picklist.Teams.ForAPatient]: ./#/ui/resources/picklist/team_management/teams/forAPatient/
[Picklist.Teams.ForAFacility]: ./#/ui/resources/picklist/team_management/teams/forAFacility/
[Picklist.Roles]: ./#/ui/resources/picklist/team_management/roles/forATeam/


