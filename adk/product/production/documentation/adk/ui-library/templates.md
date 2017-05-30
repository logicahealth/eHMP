::: page-description
# Templates Helpers & Partials #
ADK UI Library Has A Set Of Standardized Helpers & Partials To Use Inside Of A Handlebar Template.
:::

## Helpers ##
**Found In:** production/_assets/templates/helpers/

### Format Date ###
`{{formatDate [date]  "[displayFormat]"  "[sourceFormat]" }}`

```Handlebars
<span>{{formatDate dateOfBirth}}</span>
<span>{{formatDate dateOfBirth "YYYY-MM-DD"}}</span>
<span>{{formatDate dateOfBirth "YYYY-MM-DD" "DDMMYYYY"}}</span>
```

### Format SSN ###
`{{formatSSN [ssn] [mask boolean] }}`

If mask boolean is true, the helper will return the ssn string with all but the last four digits replaced by a "**\***"
```Handlebars
<span>{{formatSSN ssn}}</span>
<span>{{formatSSN ssn true}}</span>
<span>{{formatSSN ssn false}}</span>
```

### Format Phone ###
`{{formatPhone [number] [defaultVal] }}`

Utilizes libphonenumber (https://github.com/googlei18n/libphonenumber) to consistently format phone numbers.
```Handlebars
<span>{{formatPhone phone}}</span>
<span>{{formatPhone phone "Not Specified"}}</span>
```

### Get Age ###
`{{getAge [date of birth] "[sourceFormat]" }}`

```Handlebars
<span>{{getAge dateOfBirth}}y</span>
<span>{{getAge dateOfBirth "DDMMYYYY"}}</span>
```

### Has Permission ###
`{{hasPermission "[permission string]" }}`

Used to check if the current user has the specified permission. Returns html inside "hasPermission" tags if the user has the specified permission.
```Handlebars
{{hasPermission "edit-patient-record"}}
<button>Add</button>
{{/hasPermission}}
```

## Partials ##
**Found In:** production/main/ui_components/templateHelpers.js

::: definition
ADK UI Library's Template Partials can be accessed and used in any Handlebar template by calling:
### **{{ui-[partial-name] ...}}** ###
:::

### Button ###
`{{ui-button "[visible text string]" }}`

#### Options ####
| Required                          | Option            | Type   | Description |
|:---------------------------------:|-------------------|--------|-------------|
|<i class="fa fa-check-circle"></i> | **title**         | string | text value assigned to the button's _title_ attribute |
|                                   | **classes**       | string | CSS style classes to add to the button element |
|                                   | **attributes**    | string | string list of other attributes to add to the button element <br/>**Example:**<br/>`{{ui-button 'Button with custom attributes' attributes='data-button-state="pending" role="button"'}}`|


#### Basic Usage ####
![buttonTemplateHelpers](assets/buttonTemplateHelpers.png "Button Template Helpers Options")
```Handlebars
{{ui-button 'Normal' classes='btn-default' title='Press enter to select'}}
{{ui-button 'Disabled' classes='btn-default' title='Press enter to select' disabled=true}}

{{ui-button 'Default' classes='btn-default' title='Press enter to select'}}
{{ui-button 'Primary' classes='btn-primary' title='Press enter to select'}}
{{ui-button 'Success' classes='btn-success' title='Press enter to select'}}
{{ui-button 'Info' classes='btn-info' title='Press enter to select'}}
{{ui-button 'Warning' classes='btn-warning' title='Press enter to select'}}
{{ui-button 'Danger' classes='btn-danger' title='Press enter to select'}}
{{ui-button 'Link' classes='btn-link' title='Press enter to select'}}

{{ui-button 'Coversheet' classes='btn-default' title='Press enter to select' icon='fa-th'}}
{{ui-button 'Timeline' classes='btn-default' title='Press enter to select' icon='fa-bar-chart'}}
{{ui-button 'Meds Review' classes='btn-default' title='Press enter to select' icon='fa-clipboard'}}
{{ui-button 'Documents' classes='btn-default' title='Press enter to select' icon='fa-file-text-o'}}

{{ui-button 'Large Button' classes='btn-default' title='Press enter to select' size='lg'}}
{{ui-button 'Default Button' classes='btn-default' title='Press enter to select'}}
{{ui-button 'Small Button' classes='btn-default' title='Press enter to select' size='sm'}}
```
