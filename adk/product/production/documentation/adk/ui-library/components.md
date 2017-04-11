::: page-description
# Components #
ADK UI Library's Standardized Components that are 508 Compliant
:::

::: definition
UI Components can be acccessed and used by calling:
### **ADK.UI.[component-name]** ###
:::

## Alert ##
### Overview ###
**ADK.UI.Alert** provides a standard approach for generating and showing an alert window that is 508 compliant and has consistent HTML styling. _ADK.UI.Alert_ should be used for simple prompts that require an action, such as confirming a submission. In other words, this is not an alternative to **ADK.UI.Modal** or **ADK.UI.Workflow**.

### Basic Usage ###
_ADK.UI.Alert_ is a Backbone.Marionette layout view constructor. The following is an example of creating and showing a new _ADK.UI.Alert_ view:

```JavaScript
var SimpleAlertItemView = Backbone.Marionette.ItemView.extend({
    template: Handlebars.compile([
        '<h3>I am a simple item view</h3>',
        '<p>Simple Example Text</p>'
    ].join('\n'))
});
var SimpleAlertFooterItemView = Backbone.Marionette.ItemView.extend({
    template: Handlebars.compile([
        '{{ui-button "Cancel" classes="btn-default alert-cancel" title="Click to cancel"}}',
        '{{ui-button "Continue" classes="btn-primary alert-continue" title="Click to continue"}}''
    ].join('\n')),
    events: {
        'click button': function() {
            // hide is available on the ADK.UI.Alert constructor
            // see table below for more details
            ADK.UI.Alert.hide();
        }
    }
});
var alertView = new ADK.UI.Alert({
    // available options go here, see table below for full descriptions
    title: "Example Alert",
    icon: "fa-info",
    messageView: SimpleAlertItemView,
    footerView: SimpleAlertFooterItemView
});
// displays alert
alertView.show();
```

::: callout
**Note:** The alert view is destroyed upon calling `ADK.UI.Alert.hide()`. Therefore, ADK.UI.Alert must be instantiated everytime a particular view needs to be shown.
:::

### Options ###
The following are the available options to pass to the _ADK.UI.Alert_ constructor:
| Required                          | Option          | Type                       | Description                                                    |
|:---------------------------------:|-----------------|----------------------------|----------------------------------------------------------------|
|<i class="fa fa-check-circle"></i>| **title**       | string                     | the title or topic of the alert message |
|                                  | **icon**        | string                     | font awesome class to use on the icon <br />**default**: _"fa-exclamation-triangle"_ |
|                                  | **messageView** | Marionette View definition | view to show in the body of the alert |
|                                  | **footerView**  | Marionette View definition | view to show in the footer of the alert |

### Methods ###
The following are methods available to call upon the ADK.UI.Alert constructor:
| Method   | Parameter         | Description                                                           |
|----------|-------------------|-----------------------------------------------------------------------|
| hide     |                   | hides and destroys any currently open alert windows.<br />**Example**: `ADK.UI.Alert.hide()`   |

## Form ##
> **A list of supported form controls can be found by [clicking here][FormControls].**
### Overview ###
The ADK provides a way to generate, render and capture user input with an HTML form.  The data entered by the user is retrieved and stored in a Backbone model.  The form is rendered with a Marionette view. Any changes to the form are reflected back to the model and vice versa.  In order to POST (or PUT) the form to the server, a developer will simply have call the Backbone model's save method.

**ADK.UI.Form** provides a standard approach for developing forms including: form generation, model binding, and form validation. Form validation will be handled by Backbone.Model's validate method, which will have to be extended on a per-model basis and thus will be handled by the developer.  The form's html pieces have all been test and certified as 508 compliant.

### Options ###
**ADK.UI.Form** is the base form view that handles the form generation.  Each individual form can be customized by extending the base view with the following available options:

| Required     | Option          | Type   | Description                                                                                             |
|:------------:|-----------------|--------|---------------------------------------------------------------------------------------------------------|
|<i class="fa fa-check-circle"></i> | **model** | instance of a Backbone.Model | a model that the field's values will be binded to  |
|<i class="fa fa-check-circle note">*</i> | **fields** | array of controls | configuration of controls and how they are layed out in the form's UI |
|              | **events** | hash / function | see [backbone's documentation on events][BackboneViewEvents] |
|              | **modelEvents** | hash / function | see [marionette's documentation on modelEvents][MarionetteModelEvents] |
|              | **onRender** | function | see [marionette's documentation on onRender][MarionetteOnRender] |
|              | **onInitialize** | function | method gets called after the form's initialize method which gets called when the view is first created. <br /> **Note:** the options object passed to the constructor / initialize will get passed through as a argument of the _onInitialize_ method.  <br /> **Default:** `function(options){ }`|

::: callout
**<i class="fa fa-check-circle note">\*</i> Note:** the fields array is composed of a list of control objects.  Please see the [section below](#Form-Controls) for more information on what a control object is.
:::

### Basic Usage ###
```JavaScript
var ExampleFormView = ADK.UI.Form.extend({
    model: new Backbone.Model(),
    fields: [],
    events: {
        "event-selector": "callback-function"
        //...
    },
    modelEvents: {
        "event-selector": "callback-function"
        //...
    },
    onRender: function(){
        //...
    },
    onInitialize: function(options){
        //...
    }
});
```
::: callout
**Note:** ADK.UI.Form returns a Marionette View, and in order to create an instance of the view you must call **new** on the view returned. `var formViewInstance = new ExampleFormView(); `

**Important:** DO NOT EXTEND/OVERWRITE the following methods/properties of an ADK.UI.Form View: `tagName`, `attributes`, `template`, `initialize`, `onRenderCollection`, `childViewOptions`, and `getChildView`. Overwriting these will likely cause issues with rendering and showing a fully functional form.
:::

### Controls ###
The ADK has created a collection of form controls that are 508 Compliant and are avaiable for use in the the **fields** array definition of ADK.UI.Form.  Each form control has a set of avabile attrbutes used to customize its look/feel and functionality.
::: callout
All form control objects **must** contain the attribute of **"control"** which tells the base view (ADK.UI.Form) which control is being defined/used.

Most controls also have a attribute of **"name"** which gets used to bind the control's value back to the form's model.
:::

The following is an example of creating a Form with one input field, who's value is binded to the model's _"input1"_ attribute:
```JSON
var ExampleFormView = ADK.UI.Form.extend({
    model: new Backbone.Model({
        input1: ""
    }),
    fields: [{
        control: "input",
        name: "input1",
        label: "Input Label",
        placeholder: "Enter text..."
    }]
});
```

::: side-note
**The complete list of supported form controls can be found by [clicking here][FormControls].**
:::

### Form Validation ###
Form validation will be handled by Backbone.Model's **validate** method, which will have to be extended on a per-model basis and thus will be handled by the developer.

The validate method receives the model attributes as well as any options passed to set or save. If the attributes are valid, don't return anything from validate. If they are invalid return an error of your choosing. It can be as simple as a string error message to be displayed, or a complete error object that describes the error programmatically. If validate returns an error, save will not continue, and the model attributes will not be modified on the server. Failed validations trigger an "invalid" event, and set the validationError property on the model with the value returned by this method.

---

Below is an example of validating the model to ensure that the attribute _"numberInput"_ is between 10 and 20:
```JavaScript
var Model = Backbone.Model.extend({
    defaults: {
        numberInput: 1,
    },
    validate: function(attributes, options) {
        this.errorModel.clear();
        var number = parseFloat(this.get("numberInput"), 10);
        if (isNaN(number)) {
            this.errorModel.set({
                numberInput: "Not a number!"
            });
        } else if (number <= 10 || number >= 20) {
            this.errorModel.set({
                numberInput: "Must be between 10 and 20"
            });
        }
        if (!_.isEmpty(this.errorModel.toJSON())) {
            return "Validation errors. Please fix.";
        }
    }
});
```
``` JavaScript
var FormView = ADK.UI.Form.extend({
    events: {
        "submit": function(e) {
            e.preventDefault();
            // calling the form model's validate method
            if (this.model.isValid())
                // logic for when the model is valid
            else {
                // logic for when the model is not valid
            }
        }
    }
    ...
});
```
View [Backbone's Documentation on validate][BackboneModelValidate] for more details

### Setting focus on first error field ###
If the model does not pass validation (`[form model].isValid()`) generally the user's focus should be placed at the first failing form field.

By calling `[form view].transferFocusToFirstError()` the first form field with an error message will recieve focus.
``` JavaScript
var FormView = ADK.UI.Form.extend({
    events: {
        "submit": function(e) {
            e.preventDefault();
            // calling the form model's validate method
            if (this.model.isValid())
                // logic for when the model is valid
            else {
                // logic for when the model is not valid
                // ...
                this.transferFocusToFirstError();
            }
        }
    }
    ...
});
```

### Dynamic Hiding and Showing of Form Elements ###
Hiding and showing of form elements dynamically, should be hanndled by Marionette's **modelEvents** object.  The _modelEvents_ object parameter can be added to the form's view like shown in the example below:

```JavaScript
var ExampleFormView = ADK.UI.Form.extend({
    model: new Backbone.Model(),
    fields: [],
    modelEvents: {
        "event-selector": "callback-function"
    }
});
```

An example case where you might need to hide/show form elements dynmaically could be to allow the user to provide more specific information on a particular selection.  So the following example is to show how once the user selects an option from the select dropdown, if the option they select is email then the appropriately email field will be enabled and required, otherwise if they choose phone-number then similarly the phone number input field will be enabled and required.

```JavaScript
var ExampleFormModel = Backbone.Model.extend({
    defaults: {
        perferredMethodOfContact: '',
        email: '',
        phoneNumber: ''
    }
});
ExampleFormView = ADK.UI.Form.extend({
    model: new ExampleFormModel(),
    ui: {
        "phoneNumberField": ".phoneNumber",
        "emailField": ".email",
    },
    fields: [{
        control: "select",
        name: "perferredMethodOfContact",
        label: "What is your perferred method of contact?",
        options: [{
            label: "Email",
            value: "email"
        }, {
            label: "Phone",
            value: "phone"
        }],
        required: true
    }, {
        control: "input",
        name: "email",
        label: "Email Address",
        placeholder: "Enter youremail...",
        type: "email",
        extraClasses: ["hidden"],
        required: true
    }, {
        control: "input",
        name: "phoneNumber",
        label: "Phone Number",
        placeholder: "Enter your phone number...",
        type: "input",
        extraClasses: ["hidden"],
        required: true
    }],
    modelEvents: {
        'change:perferredMethodOfContact': function() {
            var method = this.model.get('perferredMethodOfContact');
            if (method === "email") {
                this.ui.phoneNumberField.trigger('control:hidden', true);
                this.ui.emailField.trigger('control:hidden', false);
            } else if (method === "phone") {
                this.ui.emailField.trigger('control:hidden', true);
                this.ui.phoneNumberField.trigger('control:hidden', false);
            } else {
                this.ui.emailField.trigger('control:hidden', true);
                this.ui.phoneNumberField.trigger('control:hidden', true);
            }
        }
    }
});
```

::: callout
**Please refer to each componet's documentation individually to ensure which events are supported for each.** (Not all controls will support the events used above example)
:::



## Modal ##
### Basic Usage ###
#### Create clickable item ####
Add a unique id to the HTML tag.  See example below:

```HTML
<button id="modalButton">CLICK ME</button>
```

#### Tie clickable item to event function ####
Under the events field in the extend Backbone ItemView use the unique id assign to the clickable item to listen for a click event.
The event should call a function that creates your new instance of your modal view and assigned this.model to be the model for that view.
Finally, instantiate the **ADK.UI.Modal** constructor with the appropriate options, and use the **show** function to display the view.  (see below)

```JavaScript
events: {
    'click #modalButton': 'showModal'
},
showModal: function(event) {
    event.preventDefault(); //prevent the page from jumping back to the top

    //Note: the view shown in the modal window can be any view
    var view = new exampleView();
    view.model = this.model;

    //Note: this is optional and only an example.
    //      this example creates a view that has a "Exit" button, that will be displayed in the modal's footer
    var footerView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile("<button type='button' class='btn btn-default' data-dismiss='modal'>Exit</button>")
    });

    //Note: this is optional and only an example.
    //Specifying your own header view will remove the default x-close button -> create your own if needed
    // This example creates a view that has a title as well as a "Previous" and "Next" button
    var headerView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile("<h1>Hi I'm a Modal Header</h1><button type='button' class='btn btn-default'>Previous</button><button type='button' class='btn btn-default'>Next</button>")
    });

    //Note: passing in modalOptions is optional
    var modalOptions = {
        'title': this.model.get('name'),
        'size': 'medium',
        'wrapperClasses': ['special-class-1', 'special-class-2']
        'backdrop': true,
        'keyboard': true,
        'callShow': true,
        'headerView': headerView,
        'footerView': footerView
    }
    var modalView = new ADK.UI.Modal({view: view, options: modalOptions});
    modalView.show();
}
```
::: side-note
**Note**: When a modal is created, it saves the last focused element that has triggered to open up the modal.  When the modal is closed, the element gets focused automatically. Optionally modalView's show function can take a parameter to override last focused element.  See this example that makes the last focused element to be shared,
```JavaScript
var showOptions = {triggerElement: $(':focus')};
modal.show(showOptions);
...
anotherModal.show(showOptions); // this closes the first modal.
```
:::

### Options ###
_*Note:_ The **ADK.UI.Modal** constructor can take in one options object that contains two attributes.
- The first attribute is the **view** that gets shown in the modal: _required_
- The second attribute is the **options** object, an object variable with the modal options: _optional_
- Example: `new ADK.UI.Modal({view: exampleView, options: modalOptions})`

The following are the available options/attributes for the _options_ object:

| Required  | Option             | Type                                | Description                                                      |
|:---------:|--------------------|-------------------------------------|------------------------------------------------------------------|
|           | **title**          | string                              | displays a string as the title to the modal |
|           | **size**           | string                              | valid modal widths include: 'xlarge' / 'large' / 'medium' / 'small' <br />**default**: _'medium'_ |
|           | **wrapperClasses** | string / array of strings           | classes to add the the top level wrapping element of the modal.  This can be used to help style the modal container or any content inside the modal. <br />**default**: _[ ] (empty array)_ |
|           | **backdrop**       | boolean / "static"                  | Includes a modal-backdrop element. Alternatively, specify static for a backdrop which doesn't close the modal on click. Notice that _true_ **draggable** option disables backdrop. <br />**default**: _true_ |
|           | **draggable**      | boolean                             | Makes modal draggable. <br />**default**: _true_ |
|           | **keyboard**       | boolean                             | closes the modal when escape key is pressed <br />**default**: _true_ |
|           | **callShow**       | boolean                             | Shows the modal when initialized <br />**default**: _true_ <br />**Note:** If the developer wishes to issue $("#mainModal").modal('show') or use data-toggle this MUST be set to _false_ |
|           | **footerView**     | Marionette view definition / string | overwrites the default modal footer (close button) with a specified view <br />**Note:** if set to _'none'_ no footer region will be shown |
|           | **headerView**     | Marionette view definition          | overwrites the default modal header (x-close button and title) with a specified view |

::: side-note

**Note**: When ADK.UI.Modal({view: view, options: modalOptions}) is issued by some method other than an element with the data-toggle="modal" data-target="#modalElement" (such as through the channeling service or JavaScript), the modal must have the 'callShow' option set to true.

**Also Note**: Instantiating the _ADK.UI.Modal_ constructor returns the modal's Layout View which includes modal-header, modal-body and modal-footer.
:::

### Ways to Hide/Terminate Modal ###
There are two ways to terminate a modal. A developer can apply 'data-dismiss="modal"' to a button and by default a click of that button will close the modal and destroy all associated views. Programatically, a developer can issue an ADK.UI.Modal.hide() call (for instance, in a 'success' callback) which will also terminate a modal and destroy all views.


## Notification  ##

### Overview ###
**ADK.UI.Notification** provides a standard approach for generating and showing a growl-type alert that is 508 compliant and has consistent HTML styling. _ADK.UI.Notification_ should be used for notifications of actions completed, such as successfully submitting a form.  Optically a callback function can be invoked on click event.  Also it can become sticky to remain on the screen where sticky growl alert remains unique by preventing another sticky growl alert with same message from being displayed.  See the options below.

### Basic Usage ###
_ADK.UI.Notification_ is an object constructor. The following is an example of creating and showing a new _ADK.UI.Notification_:

```JavaScript
// example: displays notification on submit button click
var exampleView = Backbone.Marionette.ItemView.extend({
    template: Handlebars.compile([
        {{ui-button "Submit" classes="btn-primary" type="submit"}}
    ].join('\n')),
    events: {
        'submit': function() {
            // displays the notification
            simpleNotification.show();
        }
    },
    initialize: function() {
        this.simpleNotification = new ADK.UI.Notification({
            // available options go here, see table below for full descriptions
            title: "Example Alert",
            icon: "fa-check", // only matters if type: "basic"
            message: SimpleAlertItemView,
            type: "basic",
            autoClose: false, // prevents from closing automatically after 5 seconds
            onClick: function () { // an optional callback function to be invoked on click event
                ADK.Messaging.getChannel('notification-demo').trigger('alert-dropdown.show'); 
            }
        });
    }
})
```

### Options ###
The following are the available options to pass to the _ADK.UI.Notification_ constructor:
| Required                          | Option          | Type                       | Description                                                    |
|:---------------------------------:|-----------------|----------------------------|----------------------------------------------------------------|
|<i class="fa fa-check-circle"></i>| **title**       | string                     | the title or topic of the notification message<br />**Example**: `title: "Example Title"` |
|                                  | **icon**        | string                     | font awesome class to use on the icon<br />**Note**: only used if _type_ is `"basic"`, otherwise will be determined by _type_ <br />**Example**: `icon: "fa-info"` |
|                                  | **message**        | string                     | message to be displayed in the "body" of the notification<br />**Example**: `message: "This is an example of notification text"` |
|                                  | **type**        | string                     | determines color and icon of notification (specifying _"basic"_ will allow icon to be specified) <br />**Options**: _"basic"_(default), _"success"_, _"info"_, _"warning"_, and _"danger"_<br />**Example**: `type: "success"`|
|                                  | **autoClose**  | boolean  | If true, growl alert disappears after 5 seconds. If false, growl alert becomes sticky where the sticky growl alert remains unique on the screen by preventing another sticky growl alert with same message from being displayed.<br />**default**: `autoClose: true` |
|                                  | **onClick**  | function |  a callback function to be invoked on click event that closes growl alert.<br /> |


### Methods ###
The following are methods available to call upon the ADK.UI.Notification constructor:
| Method   | Parameter         | Description                                                           |
|----------|-------------------|-----------------------------------------------------------------------|
| hide     |                   | hides and destroys any currently open notifcations.<br />**Example**: `ADK.UI.Notification.hide()`   |

## Tabs  ##
### Overview ###
**ADK.UI.Tabs** provides a standard approach for generating and showing bootstrap tabs that are 508 compliant and has consistant HTML styling.

### Options ###
The following are the available options to pass into **ADK.UI.Tabs** constuctor upon initialization:

**Note**: Must be passed in as an array of objects to a **tabs** attribute, with each tab consisting of one object (Example: `new ADK.UI.Tabs({tabs: tabConfigArray}))`

| Required                          | Option      | Type                                 | Description                                              |
|:---------------------------------:|-------------|--------------------------------------|----------------------------------------------------------|
|<i class="fa fa-check-circle"></i> | **label**   | string   | Label / title to be displayed on a particular tab                  |
|<i class="fa fa-check-circle"></i>| **view**    | view     | View to be shown when its matching tab is selected |

### Basic Usage ###
The following is an example of instantiating the _ADK.UI.Tabs_ constructor. **Note**: This returns a view that must be shown by some parent view.

``` JavaScript
var exampleParentView = Backbone.Marionette.LayoutView.extend({
    ... // regions and template set up here
    initialize: function() {
        var tabsConfig = [{
            label: 'Tab 1',
            view: Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('tab 1 content')
            })
        }, {
            label: 'Tab 2',
            view: Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('tab 2 content')
            })
        }, {
            label: 'Tab 3',
            view: Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('tab 3 content')
            })
        }, {
            label: 'Tab 4',
            view: Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile('tab 4 content')
            })
        }];
        // returns a Backbone.Marionette view
        this.exampleTabsView = new ADK.UI.Tabs({tabs: tabsConfig});
    },
    onBeforeShow: function() {
        this.showChildView('tabs-region', this.exampleTabsView);
    }
});
```

## Tray ##
### Overview ###
The tray component is a container to house other views or components.  The tray functions very similarly to a Bootstrap dropdown, except that the trigger button can reside anywhere on a page, and the tray will always open from the left or right edges of the viewport.

There are two possible uses for a tray component:  menu, and interactive content.

### Basic Usage ###

A tray is a combination of a button and content container ecapsulated in a DIV.  The basic structure is as follows:

```Handlebars
<div class="sidebar"> <!-- element which fires events -->
    <!-- toggles tray -->
    <button type="button" class="btn" data-toggle="sidebar-tray"></button>
    <div class="sidebar-tray">
        <!-- region which owns the tray contents-->
    </div>
</div>
```

A basic tray definition as one would most likely be used within the application would be similar to this:
```JavaScript
var someViewDefinitionOrInstance = Backbone.Marionette.ItemView.extend({...});

var trayView = ADK.UI.Tray.extend({
    options: {
        position: 'right',
        buttonLabel: 'Toggle the Tray',
        tray: someViewDefinitionOrInstance,
        trayKey: 'tray1'
    },
    events: {
        'click button': function() {
            console.log('I was clicked');
        }
    },
    attributes: {
        id: 'unique-tray-1',
    }
});
```
::: callout
**Note:** All critical functions defined in the tray abstract will continue to fire even if new ones are defined in the tray definition.  This also applies to events in that newly defined events will be merged into the event list.  However, a duplicate event definition will override the event in the tray abstract.  As such any additional event functionality can be easily implemented, and if needed, existing events can be overwriten.
:::

### Options ###
| Required                          | Option                  | Type            | Description                                                       |
|:---------------------------------:|-------------------------|-----------------|-------------------------------------------------------------------|
|<i class="fa fa-check-circle"></i> | **buttonLabel**         | string          | The title or name of the button (only required if `buttonView` isn't defined) |
|                                   | **iconClass**           | string          | Sets classes in icon.  No icon will be rendered if option not provided |
|                                   | **buttonView**          | Marionette View | Contents of button container.  Will override `iconClass` and `buttonLabel` |
|                                   | **buttonClass**         | string          | CSS classes to add to the button |
|                                   | **tray**                | Marionette View | Contents of tray; can be set after invocation but should usually be set in options |
|                                   | **position**            | string          | Valid options are "left" or "right"; defaults to "right" |
|                                   | **preventFocusoutClose**| boolean         | Prevents the tray from closing if an object in the DOM outside of the view takes focus. |
|                                   | **viewport**            | string          | A selector for the DOM object which will determine the position and height of the tray.  If not defined, the tray will extend from the buttom of the trigger button to the bottom of #center-region |
|                                   | **eventChannelName**    | string          | A unique identifier in which the will be used to define a Messaging Channel that all the tray events will be broadcasted on.|
|                                   | **widthScale**          | Number          | is used to scale the width of the tray based off of it's viewport. Value must be between 0 and 1. |

In most cases, it is best to avoid setting **preventFocusoutClose** in the options.  In the cases where an external object needs to be loaded, eventing can be used to allow focus to leave the tray container temporarily.

```JavaScript
var MyView = Marionette.ItemView.extend({
    model: someModel,
    onRender: {
        //setup the modal[s]
        ......

        //set events
        this.$('.modal').on('hidden.bs.modal', function() {
            self.trigger('hidden.bs.modal');
        }).on('show.bs.modal', function() {
            self.trigger('show.bs.modal');
        }
    }
});

var TrayView = ADK.UI.Tray({
    options: {
        tray: ADK.Views.Loading.create(), //start out with a loading view
        buttonView: Backbone.Marionette.ItemView.extend({ //to specify the buttonView
            template: Handlebars.compile('Open Tray')
        }),
        position: 'right'
    },
    initialize: function() {
        this.listenTo(someModel, 'sync', function() {
            this.setTrayView(new MyView());
        })
    },
    onShow: function() {
        this.listenTo(this.TrayRegion.currentView, 'show.bs.modal', function() {
            this.options.preventFocusoutClose = false;
        });
        this.listenTo(this.TrayRegion.currentView, 'hidden.bs.modal', function() {
            this.options.preventFocusoutClose = true;
        });
    }
});

someModel.fetch();
ADK.Messaging.trigger('register:component', {
    type: "tray",
    group: "writeback", //grouping to add the tray to. (trays added to the "writeback" group are included in the patient demographics bar)
    key: "observations", //unique identifier for the tray
    view: TrayView,
    shouldShow: function() {
        return (ADK.PatientRecordService.isPatientInPrimaryVista()); //determine wether or not to show the tray
    }
});
```
### Events ###

All events are broadcasted both on the parent element with class **sidebar**, the view, and on the Messaging channel if one was provided in the tray view's options (_eventChannelName_).
| Event            | Description                       |
|:----------------:|-----------------------------------|
| tray.show        | fired when show is called         |
| tray.shown       | fired after animation is complete |
| tray.hide        | fired when hide is called         |
| tray.hidden      | fired after animation is complete |

#### Closing tray(s) ####
A listener is configured to look for **tray.close** on the global Messaging channel.  Passing the **cid** of a tray through the trigger will prevent the view with that **cid** from being closed.
```JavaScript
ADK.Messaging.trigger('tray.close'); //close all trays
ADK.Messaging.trigger('tray.close', view.cid); //close all but this view
```

Alternatively, a single tray can be closed if executed from a descendant of the tray view using DOM eventing. The descendant view can simply trigger a **tray.hide** event on its DOM element. This works well even with code normally subject to race conditions (i.e. an asynchronous success callback that closes the tray but the user manually clicks the tray button to close the tray).

```JavaScript
// only an example
events: {
    'click button.close-btn': function() {
        this.$el.trigger('tray.hide');
    }
}
```

#### Changing the tray's contents dynamically ####
A listener is configured to look for **tray.swap** on the tray's element.  The event listener takes in a Backbone.Marionette view, and "swaps" the tray's main view [(view passed into `tray` option)](#Tray-Options) with the one passed in.

Below is an example of swaping out the tray's view from a region inside a tray:
```JavaScript
var NewView = Backbone.Marionette.ItemView.extend({
    template: Handlebars.compile("Sample View To Swap")
});
```
```JavaScript
// This is going to trigger an event in the DOM that will propagate up to the tray component.
// The tray component will catch the event and use the passed in view definition to create a view
// to replace the tray's main view.
this.$el.trigger('tray.swap', NewView);
```

#### Reseting the tray's contents ####
A listener is configured to look for **tray.reset** on the tray's element.  The event listener when captured, replaces the current tray's contents with the tray's main view [(view passed into `tray` option)](#Tray-Options).

Below is expanding on the example from above.
```JavaScript
var NewView = Backbone.Marionette.ItemView.extend({
    ui: {
        'BackButton': 'button'
    },
    events: {
        'click @ui.BackButton': function() {
            // To go back to the tray's main view, again we can trigger an event in the DOM
            // that will propagate up to the tray component.  When the tray component catches
            // this event it destroys the current view in the region and displays the tray's
            // main view again.
            this.$el.trigger('tray.reset');
        }
    },
    template: Handlebars.compile("Sample View To Swap <button>Go Back To Tray's Main View</button>")
});
```
```JavaScript
// this swaps the views
this.$el.trigger('tray.swap', NewView);
```

### Interactive Content ###

Interactive content can be a form or display data.  This type of content is not meant to provide navigation, but is used for data display or form input.  Content markup can be arranged in any manner, but container elements should not have **tabindex** set to avoid 508 issues.

Interactive content will act similarly to menus except that keyboard arrow navigation will not be applied, and when the tray is opened, the entire container will initially get focus to allow **accessibility technologies** to read the entire contents of the now-visible tray container.

### Registering as an ADK Component ###

The tray can live anywhere in the application but to inject a tray into the patient header, specify the group as "writeback" as shown in the example below:
```JavaScript
var TrayView = ADK.UI.TrayView(options);
ADK.Messaging.trigger('register:component', {
    type: "tray",
    group: "writeback", //grouping to add the tray to. (trays added to the "writeback" group are included in the patient demographics bar)
    key: "observations", //unique identifier for the tray
    view: TrayView, //is a definition and not a Backbone view instance
    shouldShow: function() {
        return (ADK.PatientRecordService.isPatientInPrimaryVista()); //determine wether or not to show the tray
    }
});
```

### Inter-Component Functionality Support ###
#### Supported By ####
| Component    | Description |
|--------------|-------------|
| Workflow     | The workflow component supports being shown inside a specific tray with the group **"writeback"**. <br /> _[(More details)](#Workflow-Inter-Component-Functionality-Support-Tray)_ |

## SubTray ##
### Overview ###
The sub-tray component is a container to house other views or components.  The sub-tray functions very similarly to the [ADK's tray component](#Tray).  The main usage for a sub-tray component is to add a second menu or interactive content section inside a [tray component](#Tray).

### Basic Usage ###

A sub-tray is a combination of a button and content container ecapsulated in a DIV.  The basic structure is as follows:

```Handlebars
<div class="sidebar"> <!-- element which fires events -->
    <!-- toggles sub-tray -->
    <button type="button" class="btn" data-toggle="sidebar-subTray"></button>
    <div class="sidebar-sub-tray">
        <!-- region which owns the sub-tray contents-->
    </div>
</div>
```

A basic sub-tray definition as one would most likely be used within the application would be similar to this:
```JavaScript
var someViewDefinitionOrInstance = Backbone.Marionette.ItemView.extend({...});

var SubTrayView = ADK.UI.SubTray.extend({
    options: {
        position: 'left',
        buttonLabel: 'Toggle the Sub-Tray',
        tray: someViewDefinitionOrInstance,
        trayKey: 'subtray1'
    },
    events: {
        'click button': function() {
            console.log('I was clicked');
        }
    },
    attributes: {
        id: 'unique-subtray-1',
    }
});
```
::: callout
**Note:** All critical functions defined in the sub-tray abstract will continue to fire even if new ones are defined in the sub-tray definition.  This also applies to events in that newly defined events will be merged into the event list.  However, a duplicate event definition will override the event in the sub-tray abstract.  As such any additional event functionality can be easily implemented, and if needed, existing events can be overwriten.
:::

### Options ###
| Required                          | Option                  | Type            | Description                                                       |
|:---------------------------------:|-------------------------|-----------------|-------------------------------------------------------------------|
|<i class="fa fa-check-circle"></i> | **buttonLabel**         | string          | The title or name of the button |
|                                   | **buttonClass**         | string          | CSS classes to add to the button |
|                                   | **tray**                | Marionette View | Contents of sub-tray; can be set after invocation but should usually be set in options |
|                                   | **position**            | string          | Valid options are "left" or "right"; defaults to "right" |
|                                   | **preventFocusoutClose**| boolean         | Prevents the sub-tray from closing if an object in the DOM outside of the view takes focus. |
|                                   | **viewport**            | string          | A selector for the DOM object which will determine the position and height of the sub-tray.  If not defined, the sub-tray will extend from the buttom of the trigger button to the bottom of #center-region |
|                                   | **eventChannelName**    | string          | A unique identifier in which the will be used to define a Messaging Channel that all the sub-tray events will be broadcasted on.|
|                                   | **widthScale**          | Number          | is used to scale the width of the tray based off of it's viewport. Value must be between 0 and 1. |

In most cases, it is best to avoid setting **preventFocusoutClose** in the options.  In the cases where an external object needs to be loaded, eventing can be used to allow focus to leave the sub-tray container temporarily.

```JavaScript
var MyView = Marionette.ItemView.extend({
    model: someModel,
    onRender: {
        //setup the modal[s]
        ......

        //set events
        this.$('.modal').on('hidden.bs.modal', function() {
            self.trigger('hidden.bs.modal');
        }).on('show.bs.modal', function() {
            self.trigger('show.bs.modal');
        }
    }
});

var SubTrayView = ADK.UI.SubTray({
    options: {
        tray: ADK.Views.Loading.create(), //start out with a loading view
        buttonLabel: 'Open Sub-Tray',
        position: 'right'
    },
    initialize: function() {
        this.listenTo(someModel, 'sync', function() {
            this.setTrayView(new MyView());
        })
    },
    onShow: function() {
        this.listenTo(this.TrayRegion.currentView, 'show.bs.modal', function() {
            this.options.preventFocusoutClose = false;
        });
        this.listenTo(this.TrayRegion.currentView, 'hidden.bs.modal', function() {
            this.options.preventFocusoutClose = true;
        });
    }
});

someModel.fetch();
ADK.Messaging.trigger('register:component', {
    type: "sub-tray",
    group: "notes-writeback", //grouping to add the sub-tray to.
    key: "previous-notes", //unique identifier for the sub-tray
    view: SubTrayView,
    shouldShow: function() {
        return (ADK.PatientRecordService.isPatientInPrimaryVista()); //determine wether or not to show the sub-tray
    }
});
```
### Events ###

All events are broadcasted both on the parent element with class **sidebar**, the view, and on the Messaging channel if one was provided in the sub-tray view's options (_eventChannelName_).
| Event            | Description                       |
|:----------------:|-----------------------------------|
| subTray.show     | fired when show is called         |
| subTray.shown    | fired after animation is complete |
| subTray.hide     | fired when hide is called         |
| subTray.hidden   | fired after animation is complete |

A listener is configured to look for **subTray.close** on the global Messaging channel.  Passing the **cid** of a sub-tray through the trigger will prevent the view with that **cid** from being closed.
```JavaScript
ADK.Messaging.trigger('subTray.close'); //close all subTrays
ADK.Messaging.trigger('subTray.close', view.cid); //close all but this view
```

#### Closing sub-tray(s) ####
A listener is configured to look for **subTray.close** on the global Messaging channel.  Passing the **cid** of a sub-tray through the trigger will prevent the view with that **cid** from being closed.
```JavaScript
ADK.Messaging.trigger('subTray.close'); //close all subTrays
ADK.Messaging.trigger('subTray.close', view.cid); //close all but this view
```

#### Changing the sub-tray's contents dynamically ####
A listener is configured to look for **subTray.swap** on the sub-tray's element.  The event listener takes in a Backbone.Marionette view, and "swaps" the sub-tray's main view [(view passed into `tray` option)](#SubTray-Options) with the one passed in.

Below is an example of swaping out the sub-tray's view from a region inside a sub-tray:
```JavaScript
var NewView = Backbone.Marionette.ItemView.extend({
    template: Handlebars.compile("Sample View To Swap")
});
```
```JavaScript
// This is going to trigger an event in the DOM that will propagate up to the sub-tray component.
// The sub-tray component will catch the event and use the passed in view definition to create a view
// to replace the sub-tray's main view.
this.$el.trigger('subTray.swap', NewView);
```

#### Reseting the sub-tray's contents ####
A listener is configured to look for **subTray.reset** on the sub-tray's element.  The event listener when captured, replaces the current sub-tray's contents with the sub-tray's main view [(view passed into `tray` option)](#SubTray-Options).

Below is expanding on the example from above.
```JavaScript
var NewView = Backbone.Marionette.ItemView.extend({
    ui: {
        'BackButton': 'button'
    },
    events: {
        'click @ui.BackButton': function() {
            // To go back to the sub-tray's main view, again we can trigger an event in the DOM
            // that will propagate up to the sub-tray component.  When the sub-tray component catches
            // this event it destroys the current view in the region and displays the sub-tray's
            // main view again.
            this.$el.trigger('subTray.reset');
        }
    },
    template: Handlebars.compile("Sample View To Swap <button>Go Back To Sub-Tray's Main View</button>")
});
```
```JavaScript
// this swaps the views
this.$el.trigger('subTray.swap', NewView);
```

### Interactive Content ###

Interactive content can be a form or display data.  This type of content is not meant to provide navigation, but is used for data display or form input.  Content markup can be arranged in any manner, but container elements should not have **tabindex** set to avoid 508 issues.

Interactive content will act similarly to menus except that keyboard arrow navigation will not be applied, and when the sub-tray is opened, the entire container will initially get focus to allow **accessibility technologies** to read the entire contents of the now-visible sub-tray container.

### Registering as an ADK Component ###

A sub-tray can live under any tray in the application but to inject a sub-tray into a specific tray, insure to specify the group string used when defining the view that was registered / shown within the main tray.
```JavaScript
var SubTrayView = ADK.UI.SubTray(options);
ADK.Messaging.trigger('register:component', {
    type: "sub-tray",
    group: "notes-writeback", //grouping to add the sub-tray to.
    key: "previous-notes", //unique identifier for the sub-tray
    view: SubTrayView,
    shouldShow: function() {
        return (ADK.PatientRecordService.isPatientInPrimaryVista()); //determine wether or not to show the sub-tray
    }
});
```

### Inter-Component Functionality Support ###
#### Supported By ####
| Component    | Description |
|--------------|-------------|
| Workflow     | The workflow component supports showing all available sub-tray components registered to the ADK under the provided group string. <br /> _[(More details)](#Workflow-Inter-Component-Functionality-Support-SubTray)_ |

## Alert Dropdown ##

### Overview ###
The alert dropdown component is a dropdown container which resides in the navigation header.  Like trays, the alert dropdown is registered to the component registry.  The dropdown consists of a button and container.  The user may use options provided or may supply custom views for both the button and dropdown container.

```JavaScript
var AlertDropdown = ADK.UI.AlertDropdown.extend({});
ADK.Messaging.trigger('register:component', {
    type: 'applicationHeaderItem', //the component subset which is filtered out for display
    title: 'Press enter to view notifications.', //508 title for the button in the global header
    orderIndex: 1, //the order in which this particular item appears in the list
    key: 'notification-demo', //the channel on which global events will be broadcasted
    group: 'user-nav-alerts', //visual group of items
    view: AlertDropdown //view definition, not instance
});
```

::: callout
**Note:** Anything passed into the options above will be available in the AlertDropdown view, and it's children.
:::


### Basic Usage ###

The component will automatically create a model to contain it's options if one is not provided.  All configuration options attached to the view object will be automatically set on the model to be aviailble for template control logic on the button and dropdown views.  Additionally, custom views can be configured on the component.

A basic alert dropdown view would be configured as follows:
```Javascript
var AlertDropdown = ADK.UI.AlertDropdown.extend({
    //which icon to display
    icon: 'fa-folder-open',
    dropdownTitle: 'Notifications For User',
    //omit backdrop to prevent backdrop from appearing on show of dropdown
    backdrop: true,
    //omit footerButton to prevent a footer from being rendered
    footerButton: {
        eventName: 'all-notification',
        title: 'Press enter to view all notifications.',
        label: 'View All Notifications'
    },
    onBeforeInitialize: function() {
        //fired after the custom options and model have been set but
        //before view logic is configured
        //this will also be triggered on the view as 'before:initialize'
        this.collection = new Backbone.Collection([{
            'title': 'First Item',
            'label': 'Hello'
        }, {
            'title': 'Second Item',
            'label': 'I am a label'
        }]);
    },
    onInitialize: function() {
        //fired after initialize finishes
        //also triggered on the view as 'initialize'
    }
});
```

The three view definitions used to build the component can be sourced from the component abstract.  In addition, the alignment, container, and button's templates can be configured.
The footer button, if optioned, will trigger an event `eventName` on the channel `key`.  These options can be set on the component definition, or on the DropdownListView definition.

```JavaScript
var AlertDropdown = ADK.UI.AlertDropdown.extend({
    //in most cases, this is the only view that will need to be configured
    //the RowView is going to be each row item within the dropdown container
    RowView: ADK.UI.AlertDropdown.RowView.extend({
        template: SomeTemplate,
        //[data-dimiss=dropdown] will close the dropdown when the row is clicked
        attributes: {
            'data-dismiss': 'dropdown'
        }
        events: {'click': function(e) { //communicate back with your applet
            ADK.Messaging.getChannel(this.getOption('key')).trigger('openDetails', this.model);
        }},
        onBeforeInitialize: {},
        onInitialize: {}
    }),
    DropdownListView: ADK.UI.AlertDropdown.DropdownListView.extend({}),
    ButtonView: ADK.UI.AlertDropdown.ButtonView.extend({}),

    position: 'auto', //top | bottom | auto (defaults to bottom),
    align: 'left', //left | right | middle
    ButtonTemplate: Handlebars.compile('<i class="fa {{icon}}"></i>')
})
```

In some cases, logic will need to be driven on the button view to determine what icons, and what colors are displayed.  This can be accomplished by configuring the `getTemplate` method on the `ButtonView`.  The collection that will populate the dropdown container will be available here so counting logic can occur as thus:
```JavaScript
ButtonView: ADK.UI.AlertDropdown.ButtonView.extend({
    getTemplate: function() {
        var subset = this.collection.where({'severity': 'high', 'unread': true});
        if(subset.length)
            return Handlebars.compile([
                '<i class="fa danger {{icon}"}></i>',
                '<i class="badge">' + subset.length + '</i>'
            ].join('\n'));
        else return this.getOption('template');
    }
})
```

In some cases, logic will need to be driven on the dropdown header to determine what count is displayed.  This can be accomplished by overriding `serializeModel` on the `DropdownListView` and setting the `count` attribute against the view's model.
```Javascript
DropdownListView: ADK.UI.AlertDropdown.DropdownListView.extend({
    serializeModel: function(model) {
        model.set('count', this.collection.where({'severity': 'hight', 'unread': true}));
        return model.toJSON();
    }
}
})

```

### Options ###

Options can be set in the constructor options, or on the view definition.
| Required                          | Option                  | Type            | Description                                                       |
|:---------------------------------:|-------------------------|-----------------|-------------------------------------------------------------------|
|                                   | ButtonTemplate          | method          |  Configures the template for the ButtonView.  If a template is defined on the ButtonView, this option will be ignored |
|                                   | position                | string          |  Determines whether the dialog appears above or below the trigger element.  Options are `top`, `bottom`, and `auto`. <br> **Default**: `bottom` |
|                                   | align                   | string          |  Horizonatally aligns dialog to trigger element.  Options are `left`, `right`, and `middle`.
|                                   | backdrop                | boolean         |  Determines whether a backdrop should be displayed when the dropdown menu is shown. <br> **Default**: `false`
|                                   | icon                    | string          |  Sets an attribute on the comopnent model to be used for setting the icon in the template. |
|                                   | ButtonView              | view            |  Configures the ButtonView.  The ButtonView definition can be accessed via `ADK.UI.AlertDrodpown.ButtonView`. |
|                                   | DropdownListView        | view            |  Configures a menu view.  This is the view assigned to DropdownView by default.  The DropdownListView definition can be accessed via `ADK.UI.AlertDropdown.DropdownListView`.  A list view will be a navigation menu.|
|                                   | DropdownView            | view            |  Overrides the selection of DropdownListView should a different view type, such as DropdownFormView need to be utilized. The DropdownFormView definition can be accessed via `ADK.UI.AlertDropdown.DropdownFormView`.  The DropdownFormView implies the dropdown contains a writeback feature.|
|                                   | RowView                 | view            |  Configures the childView on a DropdownListView. The RowView definition can be accessed via `ADK.UI.AlertDropdown.RowView`.|
|                                   | RowContentTemplate      | string          |  Use this options to set the contents of the RowView, but not override the RowView's template. |


### Events ###
All events are broadcasted both on the parent element with class **alert-dropdown** and on the AlertDropdown view.  Triggering **dropdown.show** or **dropdown.hide** on the DOM element with the class **alert-dropdown** will activate the corresponding behavior.  When a dropdown is open, the parent element will have the class **open** applied.

| Event             | Description                              |
|:-----------------:|------------------------------------------|
| dropdown.show     | fired when show is called                |
| dropdown.shown    | fired after dropdown is added to DOM     |
| dropdown.hide     | fired when hide is called                |
| dropdown.hidden   | fired after dropdown is removed from DOM |

### Listeners ###
Listeners are available to show and hide the component.
```Javascript
//key is the same string as the one passed into the component registration options
ADK.Messaging.getChannel(key).trigger('alert-dropdown.show');
ADK.Messaging.getChannel(key).trigger('alert-dropdown.hide');
```

A global listener will close all dropdowns which extend from `ADK.UI.Dropdown` including this component.
```Javascript
ADK.Messaging.trigger('dropdown.close');
```

## Workflow ##
### Overview ###
A Workflow is a collection of form views that represent a writeback applet. Unlike a modal, a workflow allows a developer to open multiple form views at once and be able to step between them.  All form views will persist in the DOM elements until the workflow is abandonded or completes successfully.

The first thing to note is that a workflow should always be triggered programatically. Any button that either initiates the workflow, or adds another item to the workflow, needs to use event binding that triggers ADK.UI.Workflow.show(). Do not set 'data-toggle="modal" data-target="#mainWorkflow"'' on the DOM element. This will cause unwanted behavior and is not supported.

### Basic Usage ###
A typical invocation is as follows:

```JavaScript
var workflowOptions = {
    title: "Example Workflow"
    showProgress: true,
    steps: [{
        view: exampleFormView,
        viewModel: formModel,
        stepTitle: 'Step 1'
    }, {
        view: exampleFormView2,
        viewModel: formModel,
        stepTitle: 'Step 2'
    }]
};
var workflowController = new ADK.UI.Workflow(workflowOptions);
workflowController.show();
```

**Note:** Instantiating the **ADK.UI.Workflow** constructor with the appropriate options will return the Marionette View Instance of the WorkflowController.

### Workflow Controller ###
The **WorkflowController** has the following properties/methods that you can use.

| Method        | Parameter         | Description                                                               |
|---------------|-------------------|---------------------------------------------------------------------------|
| getFormView   | integer           | uses the given index to return the appropriate step's form view           |

Example Usage:
``` JavaScript
var workflowController = new ADK.UI.Workflow(workflowOptions);

var firstForm = workflowController.getFormView(0);
var secondForm = workflowController.getFormView(1);
//....and so on for every step in the workflow
```

### Options ###
The following are the available attributes for the workflowOptions object:
| Required                                | Option          | Type               | Description                                                      |
|:---------------------------------------:|-----------------|--------------------|------------------------------------------------------------------|
|<i class="fa fa-check-circle"></i>       | **title**       | string             | the title or topic of the workflow form |
|<i class="fa fa-check-circle note">*</i> | **steps**       | array of objects   | configuration of workflow step objects (details listed below in the following table) |
|                                         | **startAtStep** | integer            | zero based index that corresponds to the step index in which to start the workflow at.|
|                                         | **showProgress**| boolean            | a model that the field's values will be binded to  |
|                                         | **size**        | string             | valid workflow widths include: "xlarge" / "large" / "medium" / "small" <br />**default**: _"medium"_ |
|                                         | **backdrop**    | boolean / "static" | Includes a modal-backdrop element. Alternatively, specify static for a backdrop which doesn't close the workflow on click. <br />**default**: _true_ |
|                                         | **keyboard**    | boolean            | closes the workflow when escape key is pressed <br />**default**: _true_ |
|                                         | **headerOptions**    | object            | Contains an **actionItems** (array of objects) attribute with each object containing a **label** (string) attribute and **onClick** (function) attribute. If _headerOptions.actionItems_ is present, a dropdown menu will be displayed and each object in the _actionItems_ array will correspond to a menu item. <br /><br />Also contains a **closeButtonOptions** (object) attribute that can have the following attributes specified: **title** (string) _(default: 'Press enter to close')_, **onClick** (function) _(default: ADK.UI.Workflow.hide())_. <br /><br />**Note**: in the function specified for _onClick_, `this` is a reference to the form. <br />**Example**: `headerOptions: {actionItems:[{label: 'Close', onClick: function(){ ADK.UI.Workflow.hide();} }], closeButtonOptions: {title: 'Press enter to save and close', onClick: function(){ //custom code to go here }} }` |

::: callout
**<i class="fa fa-check-circle note">\*</i> Note:** the views array is composed of a list of workflow step objects.  Each workflow step object defines a step in the workflow in which the user can/will encounter.
:::

### Workflow Step Object ###
A **workflow step object** is composed of the following available attributes:

| Required                         | Option       | Type                       | Description                                                        |
|:--------------------------------:|--------------|----------------------------|--------------------------------------------------------------------|
|<i class="fa fa-check-circle"></i>| **view**     | Marionette view definition | the view to display for that particular step in the workflow  |
|<i class="fa fa-check-circle"></i>| **viewModel**| Backbone model instance    | model instance that the provided view will be tied to |
|<i class="fa fa-check-circle">*</i>| **stepTitle**| string                    | String to display in the workflow progress bar <br />**\* Note**: this attribute must be defined if showProgress is set to true |
|                         | **onBeforeShow**| function   | Function that gets called just before the step is shown |

### Extra Workflow Methods ###
The following is a table of the available public methods to change the workflow header dynamically.

| Method                         | Parameter        | Description                                                      |
|--------------------------------|------------------|------------------------------------------------------------------|
| changeHeaderTitle              | string           | updates the workflow header title using the parameter string value as the new value |
| changeHeaderActionItems        | array of objects | takes in an array of actionItem configuration object (ex. _[{label: 'Close', onClick: function(){ ADK.UI.Workflow.hide();} }]_ ) and updates the workflow action items dropdown |
| changeHeaderCloseButtonOptions | object           | takes in a closButtonOptions configuration object (ex. _{title: 'Press enter to save and close', onClick: function(){ //custom code to go here }}_ ) and updates the close button title and onClick method. |

Example usage of how to change the workflow header dynamically using the above methods:
``` JavaScript
var workflowController = new ADK.UI.Workflow(workflowOptions);

workflowController.changeHeaderTitle('New Header Title');

workflowController.changeHeaderActionItems([{
    label: 'Close',
    onClick: function(){
        ADK.UI.Workflow.hide();
    }
}]);

workflowController.changeHeaderCloseButtonOptions({
    title: 'Press enter to save and close',
    onClick: function(){
        //custom code to go here
    }
});
```

### Ways to Hide/Terminate Workflow ###
There are two ways to terminate a workflow. Like Modal, a developer can apply 'data-dismiss="modal"'' to a button and by default a click of that button will close the workflow and destroy all associated views. Programatically, a developer can issue an ADK.UI.Workflow.hide() call (for instance, in a 'success' callback) which will also terminate a workflow and destroy all views.

### Inter-Component Functionality Support ###
#### Supports ####
The workflow component supports extended functionality when used in conjunction with the following components:
::: definition
#### Form ####
When added and shown inside a workflow, each form (step view) in the workflow will be assign a `workflow` and `stepIndex` property.
- **workflow** : pointer back to the workflow view which has helper methods to navigate between steps. Below is a table of the helper methods:

    | Method        | Parameter | Description                                                      |
    |---------------|-----------|------------------------------------------------------------------|
    | goToNext      |           | shows the next step's view in the provided steps array           |
    | goToPrevious  |           | shows the previous step's view in the provided steps array       |
    | goToIndex     | integer   | uses the given index to show the appropriate step's view         |

- **stepIndex** : step view's reference to it own view's index in the workflow

Example Usage:
``` JavaScript
ADK.UI.Form.extend({
...
    events: {
        "click button.continue": function(e) {
            e.preventDefault();
            if (!this.model.isValid())
                this.model.set("formStatus", {
                    status: "error",
                    message: self.model.validationError
                });
            else {
                this.model.unset("formStatus");
                this.workflow.goToNext();
            }
            return false;
        }
        ...
    }
})
```
:::

::: definition
#### Tray ####
The workflow component supports showing it's inside a ADK.UI.Tray component's main container if the tray is part of the **"writeback"** group. In order to have a workflow be displayed in a tray, passing an options object with `{inTray: TRAY_KEY}` to the _show_ method will display the workflow in the tray specified.

**Note:** the TRAY_KEY is the string of the **"key"** that the targeted tray specified upon its registration.
An applet's workflow should only try to display in the tray that the applet registered to. For example, if the allergies applet registers itself as an  application component item to the "observations" tray (which is a registered application component), it must show itself in the observations tray (`inTray: "observations"`) and not some other tray. This will prevent undesired behaviors from occurring.

Example:
```JavaScript
var workflowOptions = {
    title: "Example Workflow"
    showProgress: true,
    steps: [{
        view: exampleFormView,
        viewModel: formModel,
        stepTitle: 'Step 1'
    }, {
        view: exampleFormView2,
        viewModel: formModel,
        stepTitle: 'Step 2'
    }]
};
var workflowController = new ADK.UI.Workflow(workflowOptions);
// "{inTray: TRAY_KEY}" is only difference required to show in tray
workflowController.show({
    inTray: TRAY_KEY
});
```

:::callout
**Important**: Only one writeback workflow can be active in a particular tray at a time.
:::

::: definition
#### SubTray ####
The workflow component supports showing a collection of sub-tray components in a container below the workflow's header.

![subTraysInWorkflow](assets/subTraysInWorkflow.png "Screenshot of sub-trays inside a workflow")

For the sub-trays to be included, each step in the workflow can designate which group of sub-trays it would like to have presented when it is shown by specifiy a string value for the `subTrayGroup` option in the [workflow's step object](#Workflow-Workflow-Step-Object). By not specifiying a value, the step is choosing not to show any sub-trays (default).

**Note:** the `subTrayGroup` string value corresponds to the `group` that was specified upon a given sub-tray's [registration as a component](application-component-registration.md#Application-Component-Registration-Registering-Components) to the ADK.

Below is an example of a four step workflow that utilizes registered sub-trays:
```JavaScript
ADK.Messaging.trigger('register:component', {
    type: "sub-tray",
    group: ["example-writeback-step1", "example-writeback-step2"],
    key: "example-sub-tray-1",
    view: ADK.UI.SubTray.extend({
        options: {
            tray: VIEW_TO_SHOW_IN_SUBTRAY,
            position: 'right',
            buttonLabel: 'Sub-Tray 1',
        }
    }),
    shouldShow: function() {
        return true;
    }
});
```
```JavaScript
ADK.Messaging.trigger('register:component', {
    type: "sub-tray",
    group: ["example-writeback-step2"],
    key: "example-sub-tray-2",
    view: ADK.UI.SubTray.extend({
        options: {
            tray: VIEW_TO_SHOW_IN_SUBTRAY,
            position: 'right',
            buttonLabel: 'Sub-Tray 2',
        }
    }),
    shouldShow: function() {
        return true;
    }
});
```
```JavaScript
var workflowOptions = {
    title: "Example Workflow"
    showProgress: true,
    steps: [{
        view: exampleFormView,
        viewModel: formModel,
        stepTitle: 'Step 1',
        subTrayGroup: 'example-writeback-step1'
    }, {
        view: exampleFormView2,
        viewModel: formModel,
        stepTitle: 'Step 2',
        subTrayGroup: 'example-writeback-step2'
    }, {
        view: exampleFormView3,
        viewModel: formModel,
        stepTitle: 'Step 3',
        subTrayGroup: 'example-writeback-step3'
    }, {
        view: exampleFormView4,
        viewModel: formModel,
        stepTitle: 'Step 4'
    }]
};
var workflow = new ADK.UI.Workflow(workflowOptions);
// Note: the workflow must be shown inside the tray for the sub-trays to be displayed
workflow.show({
    inTray: TRAY_KEY
});
```

In this example the:
- First step:  will show only one sub-tray ("example-sub-tray-1").
- Second step:  will show two sub-trays ("example-sub-tray-1" and "example-sub-tray-2").
- Third step:  will not show any sub-trays. Even though a "subTrayGroup" was specified for the step, there were no sub-trays registered to that group.
- Forth step:  will not show any sub-trays due to not specifying a "subTrayGroup" value.

::: callout
**Note:** The `viewport`, `buttonClass` and `position` options on the sub-tray will be overwritten when used inside a workflow.
:::


[FormControls]: form-controls.md
[BackboneViewEvents]: http://backbonejs.org/#View-delegateEvents
[BackboneModelValidate]: http://backbonejs.org/#Model-validate
[MarionetteModelEvents]: http://marionettejs.com/docs/v2.4.1/marionette.itemview.html#modelevents-and-collectionevents
[MarionetteOnRender]: http://marionettejs.com/docs/v2.4.1/marionette.itemview.html#render--onrender-event