::: page-description
# Conventions #
Conventions used by ADK and best practices for applet developers
:::

## Applet Level Conventions ##
### Naming and Folder Structure ###
- **applet name** - lower case with underscores (e.g. medication_review).  This is the value provided when issuing a gradle createApplet and used for the applet directory name and applet id.
- **views** - camelCase ...View.js (e.g. _medicationView.js_, _medicationListView.js_)
- **templates** - camelCase ...Template.html (e.g. _medicationTemplate.html_, _medicationListTemplate.html_)
- **JavaScript functions** - all applet functionality should be abstracted into an eventHandler.js file to allow for accessibility in unit test.
- **directory structure**
    - applets are to be created in the applets directory
    - applet.js should exist in the root applet directory
    - every applet will have an **assets** folder that contains the following sub-folders: sass and img
        - this is where applet specific sass and image files should be stored _*_
```
▼ medication_review
   ▼ assets
      ▼ sass
         styles.scss
      ▶ img
   ▼ modal
      modalTemplate.html
      modalView.js
   ▼ templates
      medicationListTemplate.html
      medicationListView.js
      medicationTemplate.html
      medicationView.js
   applet.js
   eventHandler.js
```

### Event Handlers ###
In general, event handlers should go in their own file. This way, the actual view would be a wrapper for the event handler. This will be useful in both testing and debugging.

For unit testing, the event handler will be utilized instead of having a reference to the entire view - just the function to be tested. Additionally, the application would not have to be required in order to test a function - reducing dependencies on unrelated functionalities.

For debugging purposes, the event handler file would prove to be easier to find and correct than an isolated function in the view.

### Writeback ###
All writeback code should live in a **writeback** directory under the appropriate applet folder!

For an example, an orders writeback form would live under: `app/applets/orders/writeback`
```
▼ app
  ▼ applets
    ▼ orders
      ▼ writeback
        addOrder.js // example file
        ...[writeback files live here]...
      applet.js
```

The main writeback file should return an ADK.UI.Form Definition:
```JavaScript
define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    ...
], function(Backbone, Marionette, $, Handlebars...) {

    var Form = ADK.UI.Form.extend({
        ....
    });
    return Form;
});
```
The applet.js file should require the main writback file and add an additional viewType object to the applet's config:
```JavaScript
define([
  'main/ADK',
  'underscore',
  'app/applets/[SAMPLE-APPLET-NAME]/writeback/[MAIN-WRITEBACK-FILE]'
], function (ADK, _, WritebackForm) {
  ...

  var appletConfig = {
    id: '[SAMPLE-APPLET-ID]',
    viewTypes: [
    //...additional view types
    {
      type: 'writeback',
      view: WritebackForm,
      chromeEnabled: false
    }],
    ...
  };

  return appletConfig;
});
```
When an action is performed to enable a writeback form to show you can follow the example below on how to retrieve the form view and show it:
```JavaScript
events: {
  '[some-event]': function(e) {
    e.preventDefault();
    var writebackView = ADK.utils.appletUtils.getAppletView([SAMPLE-APPLET-ID], 'writeback');
    var formModel = new Backbone.Model();
    var workflowOptions = {
      title: "Sample Form Title",
      steps: [{
        view: writebackView,
        viewModel: formModel,
        stepTitle: 'Step 1'
      }]
    };
    ADK.UI.Workflow.show(workflowOptions);
  }
}
```
::: callout
**Note:** The above code sample is only an example!
:::

## Resources ##
A resource is a model/collection which represents data from the back-end, and includes all available mechanisms used to communicate.  There are currently two types of resources, **writeback** and **picklist**.  All resources should have clearly defined abstracts which extend from **ADK.Resources.Model** and **ADK.Resources.Collection**.

Resource abstracts live in the ADK and should not have any instance-specific code.
```
▼ main
  ▼ resources
    ▼ picklist
      picklistCollection.js
      picklistGroup.js
      picklistModel.js
    ▼ writeback
      writebackCollection.js
      writebackModel.js
```

Each resource abstract should define every method and option necessary for the resource to be self-contained and polymorphic.  Resources will not be tied directly to views and will not have event listeners for objects outside of the resource hierarchy.

Objects that extend the abstract Model and Collection will parse attribute arrays and objects into collections and models unless ```{childParse:false}```. Another options is to specify an array of attributes ```childAttributes:[]``` which will be turned into models/collections.  In most cases, this will have little effect on performance, but in extreme cases, such as parsing over 100k models, a second or so can be saved by configuring which fields should be converted into models/collections.

Take the following JSON object one would pass into a collection's constructor or add method.  In this example, the root is an array of objects which each have an attribute that is an array of objects.
```JavaScript
[{
    'ien': '101',
    'teas': [{
        'black': {
            'amount': '10oz',
            'cost': '3'
        }
    }, {
        'sweet': {
            'amount': '12oz',
            'cost': '1'
        }
    }]
}, {
    'ien': '307',
    'coffees': [{
        'black': {
            'amount': '10oz',
            'cost': '7'
        }
    }, {
        'decaf': {
            'amount': '8oz',
            'cost': '2'
        }
    }]
}]
```
With a basic Backbone Collection this input would yield:
```JavaScript
Collection.models [
    Model.attributes {
        ien: 101
        teas: [{...}] //array of objects
    },
    Model.attributes {
        ien: 307
        coffees: [{...}] //array of objects
    }
]
```

By default, when using the ADK's abstract Collection, the results would be:
```JavaScript
Collection.models [ //level 1
    Model.attributes {  //level 2
        ien: 101
        teas: Collection.models [ //level 3
                  Model.attributes { //level 4
                      black: Model.attributes {
                          amount: 10oz
                          cost: 3
                      }
                  },
                  Model.attributes {
                      sweet: Model.attributes {
                          amount: 12oz
                          cost: 1
                      }
                  }
              ]
    }
    Model.attributes {
        ien: 307
        coffees: Collection.models [
                  Model.attributes {
                      black: Model.attributes {
                          amount: 10oz
                          cost: 7
                      }
                  },
                  Model.attributes {
                      decaf: Model.attributes {
                          amount: 8oz
                          cost: 2
                      }
                  }
              ]
    }
]
```

If there is no need to create Collections and Models out of all arrays and objects then it is possible to tell the Model which attribute[s] to parse.
```JavaScript
var Collection = ADK.Resources.Collection.extend({
    model: ADK.Resources.Model.extend({
        childAttributes: ['teas']
    })
});

```
Using the above Collection would yield the following parsed structure:
```JavaScript
Collection.models [ //level 1
    Model.attributes {  //level 2
        ien: 101
        teas: Collection.models [ //level 3
                Model.attributes { //level 4
                    black: Model.attributes { //level 5
                        amount: 10oz
                        cost: 3
                    }
                },
                Model.attributes {
                    sweet: Model.attributes {
                        amount: 12oz
                        cost: 1
                    }
                }
              ]
    }
    Model.attributes {
        ien: 307
        coffees: [{...}] //just a basic JSON object
    }
]
```
Allowing the Collection/Model to parse subobjects into Backbone objects allows deeper searching without needing to understand the structure.  It also allows events to bubble up.  In the above example, at level 4, ```Model.get('black').trigger('customEvent')``` would cause ```customEvent``` to bubble up to the root collection.

Searching for model is quite easy from the root.  Note that this returns the first match, not all matches.
```JavaScript
var model = collection.findWhere({'amount': '10oz'});
```

Both Collections and Models have a ```methodMap``` attribute which defines a method name to request type correlation.
```JavaScript
methodMap: {
    'create': 'create', //POST
    'update': 'update', //PUT
    'patch': 'patch',   //PATCH
    'delete': 'delete', //DELETE
    'read': 'read'      //GET
    'eie': 'update'     //PUT model.enteredInError()
}
```
The default types can be overriden and new types can be defined.  Each method can be overriden to be a function or object.  A function or object should include the paramters shown in the below ```customMethod``` example.
```JavaScript
var Collection = ADK.Resources.Collection.extend({
    resource: '[resourceDirectory_key]',
    methodMap: {
        'create': 'update', //change from POST to PUT
        'update': {  //model.save(), if model.isNew() is 'false', will call update
            'resource': 'some-resource', //if not applied, it will use the model's resource
            'method': 'update', //not needed since we aren't changing the mapping
        },
        'scramble': 'create', //'scramble' is a new method that issues a POST,
        'customMethod': { //'customMethod' is a new method
            'method': 'create',  //issue a POST
            'parameters': {
                //if the url looks like '/something/:resourceId'
                //this will take the model attribute and assign it
                //so we get '/something/1515'
                'resourceId': 'someModelAttribute'
            },
            'resource': 'some-resource' //this is looked up in the ResourceDirectory
        }
    },
    scrambleMethod: function(options) {
        options.params = {}; //set custom options
        //'scramble' below matches the attribute key in methodMap
        this.sync('scramble', this, options);
    }
    customMethod: function(options) {
        this.set('someModelAttribute', '1515');
        this.sync('customMethod', this, options);
    }
})
```
Every method will have a corresponding ```success```, ```error```, and ```before``` event fired accordingly.  Using the custom example above, there will be a ```before:scramble``` method fired before the request is issued, and changes to parameters can be made at this time;  ```scramble:success``` or ```scramble:error``` will be triggered accordingly.

Rather than using a callback to render a view, one could use collectionEvents.
```JavaScript
MyCollection.extend({
    collectionEvents: {
        'read:success': function(collection, response, options) {
            //if it's a sub[model|collection] firing this event,
            //it will still bubble; check to see
            if(collection !== this.collection) return;
            this.render();
        }
    }
})
```

### Picklist Resources ###
A picklist resource is meant to manage operational data that may drive additional lookups.  Since picklist data is generally less complex than VPR data, but may contain more nodes, only the field configured as the picklist set will be parsed into child collection.  The basic structure of a picklist will include a Collection, a Group which is a model owned by the collection, and the leaf object which is a Model.

There are two basic types of picklists:  flat and nested.  A flat picklist will simply be an array of objects and will not have a picklist or group defined, whereas a nested picklist will be grouped, such that the object in the root array will contain a collection.

This is a basic working example of a flat picklist:
```JavaScript
define([], function() {

    var Specimen = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'ien', //primary key--must be unique
        label: 'name', //attribute used for the label
        value: 'ien',  //attribute used for the value...could be function as well
        childParse: 'false', //we don't have any complex structures, don't bother trying to parse
        defaults: {  //every field that comes back
            ien: '',
            name: ''
        }
    });

    var Specimens = ADK.Resources.Picklist.Collection.extend({
        type: 'lab-order-specimens', //this is the type parameter defined in the picklist request
        model: Specimen,
    });

    return Specimens;
});
```

Given this structure, the following is how the data is fetched and converted to the picklist format.
```JavaScript
var specimens = new ADK.UIResources.Picklist.Lab_Orders.Specimens();
//'this' should be a view, or better yet use collectionEvents
this.listenTo(specimens, 'read:success', function(collection, response) {
    var picklistJSON = collection.toPicklist();
    console.log(JSON.stringify(picklistJSON));
});
specimens.fetch();
```

This is a subset of the output of the above example:
```JavaScript
[{
    "label": "24 HR URINE  (URINE)",
    "value": "8755"
}, {
    "label": "ABDOMEN  (Y4100)",
    "value": "114"
}]
```

To access the original model, simply use ```findWhere```.  This method will drill down for complex picklists as well.
```JavaScript
//we know that our value, which is our lookup, is set to 'ien'
var model = specimens.findWhere({'ien':'114'});
```

Complex picklists with groupings need a little more configuration.
```Javascript
define([], function() {

    var Allergen = ADK.Resources.Picklist.Model.extend({
        idAttribute: 'name', //primary key--can't have duplicates
        label: 'name',
        //since value isn't defined, the model's cid will automatically
        //be added to the attributes and made the value so that a unique lookup exists
        //value: 'ien'
        defaults: {
            file: '',
            foodDrugOther: '',
            ien: '',
            name: '',
            source: ''
        }
    });

    var AllergenGroup = ADK.Resources.Picklist.Group.extend({
        idAttribute: 'source',  //primary key, might be useful to omit in some cases
        groupLabel: 'categoryName', //attribute that will be the group
        //picklist is the attribute that will be parsed into a Collection
        //and will be set as the picklist attribute in grouped lists
        picklist: 'allergens',
        Collection: ADK.Resources.Picklist.Collection.extend({
            model: Allergen
        }),
        defaults: { //remember to include every field
            categoryName: '',
            source: '',
            name: '',
            top: '',
            plus: '',
            allergens: [] //this will be parsed into a Collection
        }
    });

    var allergies = ADK.Resources.Picklist.Collection.extend({
        type: 'allergies-match',
        model: AllergenGroup,
        params: function(method, options) {
            return { //allergies.fetch({'searchString': 'ABC'})
                searchString: options.searchString || ''
            };
        }
    });

    return allergies;
});
```

Picklists have one more unique options that allows dynamic translation where labels don't quite meet the required format.  Like ```value```, ```label``` can be a function.  Keep in mind that both ```label``` and ```value``` are only releveant when ```toPicklist``` is called.  The ```label``` field can also be a dynamic lookup.  Also, if ```this.get(this.label)``` is not found, the string value of ```label``` will be assigned.

```JavaScript
label: {
    defaultLabel: 'name',
    filters: [{
            'name': 'ABCIXIMAB', //if this.get('name') === 'ABCIX...' then
            'label': 'ien' //set the label to this.get('ien'), or 'ien' if attribute not found
        }, { //any number of conditions must be met
            'name': 'ABC COMPOUND WITH CODEINE #3', //if this.get('name') === 'ABC...' and
            'ien': '1099', // this.get('ien') === '1099' then
            'label': 'WOOT' //set the label to this.get('WOOT') or 'WOOT'
        }, {
            'name': function(attr) { //need a custom comparision such as a date?  no problem!
                return this.get(attr).search('ABC CPD AND') >= 0;
            },
            'label': function() { //can use a function for label too
                return 'Custom Label';
            }
        }]
        //if none of the conditions are met, set the label to this.get('name') or 'name'
        //as specified by the default label
}
```

### Writeback Resources ###
A writeback resource is a model-collection definition pair which represents the data format of a writeback request.

All writeback resources will reside in EHMP-UI under **app/resources/writeback** to follow the pattern **[VPR_collection]/collection.js** and **[VPR_collection]/model.js**.
```
▼ app
  ▼ resources
    ▼ writeback
      ▼ allergies
        model.js
        collection.js
        composite.js
```

Resources will be available in the ADK when included in *app/resources/writeback/resources.js**.
```JavaScript
define([
    'app/resources/writeback/allergies/model',
    'main/resources/writeback/allergies/collection'
    ...
], function(Allergy, Allergies) {

    return {
        id: 'Writeback' //name space
        resources: {
            Allergies: {
                Model: Allergy,
                Collection: Allergies
            },
        }
    };
)};
```

Once included in **resources.js**, a writeback resource can be accessed like so:
```JavaScript
var notes_collection = ADK.UIResources.Writeback.Notes.Collection;
var notes_model = ADK.UIResources.Writeback.Notes.Models;
```
::: callout
**Note:** ADK.UIResources is loaded after the ADK but before applets.
:::

### Models ###
Writeback resource models will extend ```ADK.Resources.Writeback.Model``` and collections ```ADK.Resources.Writeback.Collection```.  Read requests will return a collection, and all writeback actions will occur at the model level.

Writeback models and collections cannot be instantiated until a user has logged in and a patient selected.  An error will be thrown if this data is not available when the resource's constructor is called.  Patient and user data are attached to the model and be read with ```this.patient``` and ```this.user```.

**Basic Model**
```JavaScript
define([
    'main/ADK'
], function(ADK) {
    var vprModel = ADK.Resources.Writeback.Model.extend({
        //Writeback paths should follow the patterns outlined in the RDK.
        //In most cases it will be '/resource/write-health-data/patient/:pid/[vpr_model]'
        //:pid will be automatically set when getUrl is called
        resource: [resourceDirectory_reference],
        //vpr is the channel used to issue events.
        //In some cases this will not be the same as the url
        vpr: [vpr_model],
        //this is the attribute used to determine of a model is new or not
        //this will usually be 'uid', but might be something else
        //ensure this is empty when a new model is created
        idAttribute: 'uid',
        parse: function(resp, options) {
            //this function is used to PERMANENTLY alter model attributes after a fetch
            //if the data needs to be altered simply for display puposes, use view.serializeData
            //Do not modify data in such a way that the contract is broken
            //and fields no longer match with the expected request mapping
            return resp;
        },
        getUrl: function(method) {
            //can be used to specific different urls for different methods--see writebackModel.js
            //would be better to denote a custom methodMap in most cases
        },
        methodMap: {
            //can be used to change HTTP request types if required
            //the attribute will map to Backbone's set and pick the type based on the lookup
            //(change model.destroy() to be a soft delete using PUT for instance, change to 'update')
            //only include the specific type which needs to be modified
            //every key in the methodMap will have associated events
            //in the case of overrides, a function or object can specified
            'create': 'create', //POST
            'update': 'update', //PUT
            'patch': 'patch',   //PATCH
            'delete': 'delete', //DELETE
            'read': 'read'      //GET
            'eie': 'update'     //PUT (this is build in and has an enteredInError method associated)
        },
        resourceEvents: { //only writeback resources have the ability to configure events
             //use events to trigger view or data updates, and not callbacks
             //every success and save event will also be broadcast on the associated vpr channel
            'before:create': function(context) {
                //set additional fields such as visit or timestamps here
                //patient and user are attached the model is constructed
                var patient = this.patient;
                var user = this.user;
                var visit = patient.get('visit');

                this.set('encounterName', visit.locationDisplayName + visit.formatteddateTime);
            },
            //keep resource dependent events here,
            //and view specific functionality in modelEvents within the view
            'create:success': function(model, response, options) {},
            'create:error': function(model, response, options) {},
            ...[same for all methodMap keys]...
        },
        defaults: {
            //every attribute than can be saved or retrieved should be listed here for readability
            'author': null,
            'authorDisplayName': null,
            'authorUid': null,
            'documentDefUid': null,
            ...[add all possible save attributes]...
        },
        initialize: function() {
            //this is the only method which cannot be overloaded
            //specifying a new initialize function will not prevent the inherited one from executing
        }
    });
    return vprModel;
}
```

When a model is successfully created, it will automatically be added to every collection instance that shares the same vpr channel.  This ensures multiple instances of the same collections will stay in sync.  This behavior can be disabled by specifying a different vpr channel for a collection.

To trigger actions on a view, use **listenTo** or specify model events.  This will prevent unintentional lingering references which result in memory leaks.
```JavaScript
var View = Backbone.Marionette.ItemView.extend({
    modelEvents: {
        'success:create': 'doSomething',
        'error:create': 'displayError',
        'before:create': 'disableSubmitButton'
    }
});

var viewInstance = new View({model: new ADK.Resources.Models.Allergy()});
```
::: callout
**Note:** If the model instance is attached to the view after initialize is called, delegateEvents must be issued in the view to re-bind modelEvents, which will also re-bind all events, so it shouldn't be used haphazardly.
:::

Since there are no callbacks, saving a new model is quite simple.
```JavaScript
//assumes you have a collection instance
var newModel = new collection.model();
//set the attributes
newModel.set({'key': value', 'key2': 'value2'});
//if newModel.isNew(), this will be 'create'
//else it will be 'update'
newModel.save();
```

### Collections ###
Recall that collections are responsible for retrieving data and that models are responble for saving data.  With a properly defined resource, fetching data is simple.
```JavaScript
var collection = new ADK.UIResources.Writeback.Allergies();
this.listenTo('collection', 'fetch:success', 'updateView');
collection.fetch();
```

In many cases the models which need saving already exist on a server.  In these cases, access the existing model through it's collection.

```JavaScript
initialize: function() {
    this.collection = new ADK.UIResources.Writeback.Allergies();
    collection.fetch();
},
collectionEvents: {
    'fetch:success': function() {
        //how one COULD but SHOULDN'T modify model data--see next example
        var model = this.collection.findWhere({'someAttribute': 'someValue'});
        model.set({'key': value', 'key2': 'value2'});
        model.save();
    },
    'update:success': function() { //remember, these events bubble up to the collection
        console.log('model finished saving');
    }
}
```

Collections will be displayed with **Marionette.CollectionView** or **Marionette.CompositeView** so a childView is where the model will be accessed.
```Javascript
var ContainerView = Backbone.Marionette.LayoutView.extend(
{
    regions: {'appletContainer': '.container'}
    onBeforeShow: {
        this.appletContainer.show(new CollectionView({
            collection: new ADK.UIResources.Picklist.Allergies()
        }))
    },
    childEvents: {
        'success': 'showResponse',
        'error': 'showResponse'
    },
    showResponse: function(text) {
        console.log(text);
    }
});

var CollectionView = Backbone.Marionette.CollectionView.extend({
    tagName: 'ul',
    initialize: function() {
        this.collection.fetch();
    },
    childView: ItemView,
    childEvents: {
        'success': 'success',
        'error': 'error'
    },
    success: function(model, response, options) {
        //notify user or trigger event for parent
        this.trigger('success', response.responseText);
    },
    error: function(model, response, options) {
        //notify user or trigger event for parent
        this.trigger('error', response.responseText);
    }
});

var ItemView = Backbone.Marionette.ItemView.extend({
    //this would be a row operation rather than opening a new form
    tagName: 'li',
    modelEvents: {
        'change': 'render'
        'save:success': 'success',
        'create:success': 'success',
        'save:error': 'error',
        'create:error': 'error'
    },
    success: function() {
        this.trigger('success', arguments);
    },
    events: {
        'click submit': 'update'
    },
    update: {
        this.model.save();
    }
});

return ContainerView;
```

The above is a rough example, but not much else is really required.  Much of the rendering and changes will occur naturally if an eventing pattern is followed.  For instance, to create a new item with this pattern, assume that the ContainerView would then open a new form view.
```JavaScript
var SomeForm = FormView.extend({
    events: {
        'change .someDomEl': 'update',
        'click submit': 'submit'
    },
    submit: function() {
        //since this doesn't have a uid or primary key,
        //it must be new...it will be added to the collection
        //when save completes, and the collection will render
        //a new view to represent this model automatically
        this.model.save();
    }
});

//pass in an instance of the collection's model definition
//it's safer to grab the model through the collection than
//to grab it's abstract in the case of complex structures
var formView = new SomeForm({model: new this.collection.model()});

//show will issue render
this.getRegion('form').show(new formView());
```
::: callout
**Note:** When a new model is created and added to the collection, do not assume it shares the same reference as the model that is in the form view, since it will actually be a duplicate populated from the data returned on the save action.  If the form contents need to be updated with the new model, use a collection event on the ContainerView (in the above example) to set the new model as the form view's model.
:::

The collection definitions will be pretty simple for the most part.  Here's an example of a basic one:
```JavaScript
define([
    'main/resources/notes/model'
], function(Collection, Model) {
    var notes = ADK.Resources.Writeback.Collection.extend({
        resource: 'write-pick-list',
        vpr: 'notes',
        model: Model,
        parse: function(resp, options) {
            return resp.data.notes;
        },
        getUrl: function(method) {
            //can be used to specific different urls for different methods--see adkCollection.js
        },
        methodMap: {} //like the model every method will have a success and error event
    });

    return notes;
});
```

This one is more complex requiring the model's vpr to be different than the model abstract.
```JavaScript
define([
    'app/resources/writeback/notes/model'
], function(Model) {
    var notes = ADK.Resources.Writeback.Collection.extend({
        resource: 'patient-record-document',
        model: Model.extend({
            vpr: 'signedNotes'
        }),
        vpr: 'signedNotes',
        resource: 'patient-record-document',
        params: function() {
            return {
                param: {
                    pid: this.patient.get('pid')
                },
                filter: 'someFilterString',
                pid: this.patient.get('icn')
            };
        },
        parse: function(resp, options) {
            return resp.data.items;
        }
    });

    return notes;
});
```

### Composites ###
There will be resources that are more complex than a simple model-collection pattern.  Some might even require multiple fetches to gather all the data necessary to map the resource.  These will be known as **Composites**.  Composites can be a model that contains collections or models.  In a case where a LayoutView is utilized, a model of collections would be good choice for direct accession.


## Technologies ##
- Use Backbone and Marionette for applet development
- Use Bootstrap for styling and display components
- Use Handlebars for html templates

## 508 Compliance ##
508 compliance is the minimum standard by which accessibility users are enabled to adequately operate the application.  WCAG 2.0 is an extended and more thorough means of ensure operability.  See here for an example of each enhanced Bootstrap object including a description of behavior and usage: [Simple 508 examples][508_Compliance]

## Git Conventions ##
In order to contribute code, you need to be familiar with Git.

### Branches ###
Branch names should be all lowercase letters with dash-separated words.

Branch naming conventions:
 * for new functionality:
    * `us0001-short-description`
    * where us0001 is the user story ID, if applicable
 * for bug fixes:
    * `master-de0001-short-description`
    * where `master` is the branch that the defect was created for (`r1.2`, for example) and `de0001` is the defect ID, if applicable

### Commits ###
A uniform commit message format is important for easy and accurate tracking of history.

The text up to the first blank line of the commit message is treated as the title, and the rest of the message is the body.

Commit message requirements:
 * The title should be no longer than 50 characters.
 * The title should imperatively describe what action the commit makes. For example, "Add authentication unit tests".
    * No declarative statements ("Added authentication unit tests" - BAD)
 * The title should use sentence case (just capitalize the first letter of the sentence).
 * Do not end the title with a period.
 * Wrap the body at 72 characters.
 * Use the body to explain what and why, not to explain how.

Commit change requirements:
 * Commits should be atomic. Commits should do one thing. All changes on a commit must relate to the commit message. Do not add changes which do not relate to the commit message.
    * Commits which have changes unrelated to the commit message make understanding git history difficult.
    * Atomic commits make cherry-picking, resolving merge conflicts, and reverting simple.

Tips:
 * If you've already made many changes without committing along the way, and you have many changes to commit, use `git add --patch` and make sure not to commit with the `-a` flag.
    * SourceTree or `git gui` make this easier with buttons that let you add individual chunks to commit.
 * Git GUI tools are useful for observation, but usually obscure how git commands are performed, so learn the simple git command-line interface to avoid confusion and mistakes.


[508_Compliance]: ./508_compliance.html
