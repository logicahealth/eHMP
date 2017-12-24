::: page-description
# Extensions #
High level explanation of what is an Extension and how to create and consume Extensions
:::

## Intent ##
Extensions are intended to be used as re-usable configurations/set-ups of [ADK][ADK] functionality for use within applet code. This is desirable both over simply defining a configuration in one applet and requiring that configuration from another applet as well as sticking the configuration in ADK as a convenience to avoid cross-applet dependencies. That being said, Extensions should NOT be used simply as a convenient code dumpster used as a crutch for poorly-designed applet structure. Extensions can help avoid the common pattern of sharing util files across applets, especially utils that receive a view as an argument, by defining a view or behavior with commonalities placed on its prototype.

## Creation ##
### Directory Structure ###
In order to determine the directory structure to use, first determine what piece of [ADK][ADK] functionality is being extended. For example, if extending [ADK.UI.Form][ADK.UI.Form] by defining a custom control where on [use would be accessed](#Usage) with `Extensions.UI.Form.Controls.MyControlDefinition`, the directory structure should look like:

```
- extensions // top level
  extensions.js // would require ui/extensions.js
  - ui
    extensions.js // would require form/extensions.js
    - form
      extensions.js // would require controls/extensions.js
      - controls
        extensions.js // would require my_control/control.js
        - my_control
          control.js // control definition
```

And then `extensions/ui/form/controls/extensions.js` would look like:

```JavaScript
require([
  'app/extensions/ui/form/controls/my_control/control'
], function(MyControlDefinition) {
	// defines Extensions.UI.Form.Controls.MyControlDefinition
	// due to chaining up the extensions.js's
	return {
		MyControlDefinition: MyControlDefinition
	};
});
```

### Chaining ###
Defining a chain of extensions [using nested `extensions.js`](#Creation-Directory-Structure) has the benefit of feeling familiar due to matching the ADK structure while also keeping extensions organized.

Example `extensions/ui/extensions.js`

```JavaScript
require([
  'app/extensions/ui/form/extensions'
], function(Form) {
	// defines Extensions.UI.Form
	// due to chaining up the extensions.js's
	return {
		Form: Form
	};
});
```


## Usage ##
Extensions should be used by requiring `app/extensions/extensions.js` in your module and then accessing them like any other object. For example, we have created a [custom form control](./#/ui/extensions/ui/form/controls/) named `MyControl`:

```JavaScript
require([
  'app/extensions/extensions'
], function(Extensions) {
	var MyControlClass = Extensions.UI.Form.Controls.MyControl;
});
```

The intent is to make extensions follow the general hierarchy that [ADK][ADK] uses for the functionality being extended. For the above example, [ADK.UI.Form][ADK.UI.Form] is being extended by defining a custom control, thus `Extensions.UI.Form.Controls` was used as the path.

## Documentation ##
### Readme File ###
Add a `README.md` at the directory level in which the extension is made. For inclusion in documentation navigation dropdown, include the following at the top of the the `README.md`:

In this example, an extension of an ADK.UI.Form is made at `product/app/extensions/ui/form/extensions.js`. The readme file should be placed at `product/app/extensions/ui/form/README.md`.
```markdown
<!-- {"label": "My Extension", "path": "Path.To.MyExtension"} -->

Note that this must be valid JSON, else these options will be excluded
```

### Linking to ADK Docs ###
If necessary to link to the ADK docs, the links are required to use this syntax: `./#/adk/<rest of link>`

Examples:

```Markdown
[My Link To ADK][ADK]

[ADK]: ./#/adk/
[ADK.UI]: ./#/adk/ui-library
[ADK.UI.Form]: ./#/adk/ui-library/views#Form
[ADK.UI.Form.Controls]: ./#/adk/ui-library/form-controls
```
[ADK]: ./#/adk/
[ADK.UI]: ./#/adk/ui-library
[ADK.UI.Form]: ./#/adk/ui-library/views#Form
[ADK.UI.Form.Controls]: ./#/adk/ui-library/form-controls
