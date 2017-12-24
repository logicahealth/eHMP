<!-- { "label": "Controls", "path": "UI.Form.Controls" } -->

::: page-description
# Form Control Extensions #
Re-usable UI form controls.
:::

## Usage ##
Pass `controlClass` option to [`ADK.UI.Form`][ADK.UI.Form]. The `controlClass` object value should follow the key value pair pattern defined below:
- **key**: string value used for field name
- **value**: view definition extended from a [`ADK.UI.Form.Controls`][ADK.UI.Form.Controls] property

```JavaScript
define([
    'app/extensions/extensions'
], function(Extensions) {

    var formView = ADK.UI.Form.extend({
        controlClass: {
            'assignTo': Extensions.UI.Form.Controls.AssignTo
        },
        //...
    });

});
```

## Documentation  ##
All Form Control Extensions should follow the structure outlined below for markdown documentation. This includes following the standards spelled out in the [UI extension documentation](./#/ui/extensions/#Documentation).

### Required Headings ###
The following 2nd level headings (`<h2>`) are required:
- Overview
- Field Options
- Dynamic Control Events _(if any)_
- Validation _(if any)_
- Code Examples

### Example ###
Below is the raw markdown syntax for documenting a form control extension. Please reference the [UI extension documentation](./#/ui/extensions/#Documentation-Readme-File) for more information on where your `README.md` markdown file should live.
```Markdown
<!-- { "label": "Example", "path": "UI.Form.Controls.Example", "tags": ["tag1"] } -->

::: page-description
# Example Form Control Extension #
Re-usable example form control.
:::

## Overview ##

## Field Options ##
| Required                         | Attribute               | Type                | Description / Example                                          |
|:--------------------------------:|:------------------------|:-------------------:|:---------------------------------------------------------------|
|<i class="fa fa-check-circle"></i>| **attribute name here** | attribute type here | description here <br /> **Example:** `example value here`      |

## Dynamic Control Events ##
| Event                  | Parameter Type | Description / Example                                   |
|:-----------------------|:--------------:|:--------------------------------------------------------|
| **control:event:name** | object         | description here <br/>**Example:** `example value here` |
:::

## Validation ##

## Code Examples ##
::: showcode Example 1:
// Example 1 Code Block
:::
::: showcode Example 2:
// Example 2 Code Block
:::
```

[ADK]: ./#/adk/
[ADK.UI]: ./#/adk/ui-library
[ADK.UI.Form]: ./#/adk/ui-library/views#Form
[ADK.UI.Form.Controls]: ./#/adk/ui-library/form-controls