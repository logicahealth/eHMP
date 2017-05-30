::: page-description
# Code review checklist #
Code review checklist for ADK and eHMP-UI developers
:::

## JavaScript in general ##
+ There are no _commented_ lines of codes. Rely on git to find obsolete code blocks instead of keeping them in the latest revision.
+ There are no _ambiguous_ or _obsolete_ comments.  Having bad comments is far worse than having no comment.
+ There are no _global_ variables.  Don't define global variables unless there is a compelling reason to do so.
+ Each local variable is declared with its own var statement.  Don't definemultiple local variables with a single _var_.
  ```JavaScript
    // Bad practice
    var foo = 1,
        bar = 2;
  ```
  ```JavaScript
    // Good practice
    var foo = 1;
    var bar = 2;
  ```
+ There should be _'use strict'_ for better [ECMAScript5](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) semantic checking.
  ```JavaScript
    // Good practice
    define([
        'backbone',
        'handlebars'
    ], function(Backbone, Handlebars) {
        'use strict';
        ...
    }
  ```
+ Do not use _inline_ style.
  ```JavaScript
    // Bad practice
    $('a[title="Search"] img').css('background-position','0px 0px');
  ```
+ Each line should not exceed 120 characters.
+ All updates should be passed through _jshint_ to ensure formatting meets project specifications.  Ctrl+Option+f will accomplish this in Sublime.
+ There are no code blocks that can be replaced by utility functions of __[lodash](https://lodash.com/docs)__ or __ADK.Utils__.
+ There are no console _loggings_.  Error reporting should use _console.error_.
+ Each variable should be declared with unique naming within its visibility.
  ```JavaScript
    // Bad practice
    var patientName;
    ...
    var = function(patientInfo) {
        var patientName;
        ...
    }
  ```
+ All variable names adhere to the variable naming standards.
  ```JavaScript
    // Bad practice. Those variable names are not descriptive enough.
    var a1;
    var a11;
    var a111;
    var f1;

    // This function name is misleading.
    var isSwitchOn = function(switchFlash) {
        return (switchFlash !== true);
    }

  ```
+ There are no functions with too many lines.  Break into smaller functions.
+ There are no heavily nested codes. Refactor such codes for better readability.
  ```JavaScript
    // Bad practice
    if (condition1) {
        ...
        if (condition2) {
            ...
            if (condition3) {
                ...
                if (condition4) {
                    ...
                    if (condition5) {
                        ...
                    }
                }
            }
        }
    }
  ```
* There are no excessive nested iterations.
* There are no double quotes around string values.
  ```JavaScript
    // Bad practice
    var fistName = "Joe";
  ```

## Backbone and Marionette ##
* There are no memory leaks from 'zombie' views. See [Marionette](http://marionettejs.com/docs/v2.4.1/marionette.layoutview.html#re-rendering-a-layoutview) documentation.
  ```JavaScript
    // Good practice. Instantiate a child view when it is needed
    layoutView.showChildView('menu', new MenuView());
    //equivalent with different syntax
    layoutView.getRegion('header').show(new HeaderView());
  ```
* Ensure there are no memory leaks or singletons in require scope.  Only primitives should be referenced outside of the scope of a Marionette object.
  ```Javascript
      define([
          'backbone',
          'handlebars'
      ], function(Backbone, Handlebars) {
          'use strict';

          //memory leaks
          var someView;
          var someModel = new Backbone.Model();

          var View = Marionette.View.extend({
              //singleton--all instances will share this reference on the prototype
              model: new Backbone.Model(),
              initialize: function() {
                  //save a reference to the object instance to a variable in the require scope
                  //leak...
                  someView = this;
              }
          })
      }
  ```
* Ensure there are no memory leaks as a result of event listeners
  ```Javascript
  var View = Marionette.View.extend({
      initialize: function() {
          this.specialCollection = new Backbone.Collection();
          this.model = this.getOption('model') || new Backbone.Model();
          this.collection = new Backbone.Collection();

          //bad
          var self = this;
          this.model.on('change', function(model) {
              self.doStuff();
          })
          ADK.getChannel('some_channel').on('some_event', function(obj) {
              self.doStuff();
          });
          this.collection.on('add', function(collection, model) {
              self.addModel();
          })

          //good
          this.listenTo(ADK.getChannel('some_channel'), 'some_event', function(obj) {
              this.doStuff();
          })
          this.bindEntityEvents(this.specialCollection, this.specialCollectionEvents);
      }
      //proper
      modelEvents: {
          'change': 'doStuff'
      },
      collectionEvents: {
          'add': 'addModel'
          'remove': function(collection, model) {
              this.triggerMethod('remove:model', model);
          }
      },
      //some views will need to have more than one collection or model
      specialCollectionEvents: {
          'update': 'updateSpecialCollection'
      },
      onRemoveModel: function(model) {
          this.doSomething(model);
      },
      onDestroy: function() {
          //make sure to release these events
          this.unbindEntityEvents(this.specialCollection, this.specialCollectionEvents);
      }
  })
  ```
* Ensure there are no leaks due to using throw-away collections
  ```Javascript
  //bad
  var View = Marionette.View.extend({
    initialize: function() {
      this.collection = new Backbone.Collection();
    },
    collectionEvents: {
      'sync': 'doStuff'
    },
    onBeforeShow: function() {
      var fetchOptions = {}; //set options
      //destroys the reference so all events bound are lost
      this.collection = ADK.PatientRecordService.fetchCollection(fetchOptions);
      //now the view is looking at a memory leak to see if 'sync' is ever called
    }
  });

  //acceptable
  var View = Marionette.View.extend({
    initialize: function() {
      this.collection = new Backbone.Collection();
    },
    collectionEvents: {
      'sync': 'doStuff'
    },
    onBeforeShow: function() {
      var fetchOptions = {}; //set options
      ADK.PatientRecordService.fetchCollection(fetchOptions, this.collection);
    }
  });

  ```
* Ensure destroy() is issued to views when parent is destroyed, ideally through Marionette mechanisms.
* There is no asynchronous template rendering.
  ```JavaScript
    // Good practice. Let a single painting render all children views
    onBeforeShow: function() {
        this.showChildView('header', new HeaderView());
        this.showChildView('footer', new FooterView());
    }
  ```
* There are no redundant divs.
* There is no full DOM tree traversing by jQuery.  Use this.$(selector) for better performance.
* There are no DOM events to elements outside of the scope of the current view.
* Every resource is released when a listening view is destroyed.
  ```JavaScript
    // Good practice
    onBeforeDestroy: function() {
        ADK.Messaging.getChannel('someChannel').stopReplying('someEvent');
    },
  ```
* No code relies on obsolete/deprecated ADK features.
* Messaging `request`/`reply` and `trigger`/`on`/`listenTo` should be used appropriately.  Avoid `command`/`comply`.  If a `request` or `on` is configured within the scope of a view, it should be turned off in `onDestroy` with `off` or `stopReplying`.
* Parent views should always be of type _CompositeView_, _CollectionView_, or _LayoutView_ instead of _ItemView_.
* There are no `.html()` calls and there are no `.append()` calls.  All DOM elements should be managed by a view.
### Best Practices ###
* Utilize [Marionette's **ui** hash](http://marionettejs.com/docs/v2.4.2/marionette.itemview.html#organizing-ui-elements) to keep track of your view's elements. Doing this will help the maintainability of your views and allow selectors to be changed in only one location. This works in all Marionette views (item, collection, composite, and layout).  Attributes in the ui hash object should be upper case.
  ``` JavaScript
  var View = Backbone.Marionette.ItemView.extend({
    template: Handlebars.compile([
      '<button class="button-a">A</button>',
      '<button class="paragraph-b">Text</button>'
    ].join('\n')),
    ui: {
      'ButtonA': '.button-a',
      'ParagraphB': '.paragraph-b'
    },
    events: {
      'click @ui.ButtonA': function(e) {
        //event handler example
        this.ui.ParagraphB.html('Oh no! I have been clicked!');
      }
    }
  })
  ```
#### Displaying Data ####
* Content display should be event driven.  See [Event Listeners](/documentation/#/adk/conventions#Applet-Level-Conventions-Event-Listeners)
  ```Javascript
    var RowView = Marionette.ItemView.extend({
      tagName: 'li',
      tempalte: Handlebars.compile('<button>{{name}}</button>')
      ui: {
        'Button': 'button'
      },
      modelEvents: {
        'change:name': 'render'
      },
      triggers: {
        'click @ui.Button': 'select:row'
      }
    });

    var CollectionView = Marionette.CollectionView.extend({
      tagName: 'ul',
      childView: RowView
    });

    var SelectionView = Marionette.ItemView.extend({
      tagName: 'span',
      template: Handlebars.compile('{{chosenSelection}}'),
      modelEvents: {
        'change': 'render'
      }
    })

    var ListManager = Marionette.LayoutView.extend({
      template: Handlebars.compile('<div class="selection"></div><div class="list"></div>'),
      regions: {
        'SelectionRegion': '.selection'
        'ListRegion': '.list'
      },
      initialize: function() {
        this.collection = new Backbone.Collection();
        this.model = new Backbone.Model();
      },
      collectionEvents: {
        'request': 'showLoading',
        'sync': 'removeLoading',
        'error': 'showError'
      },
      childViewEvents: {
        'select:row': 'onSelectRow'
      },
      onSelectRow: function(rowView) {
        //the collection view will automatically
        //bounce the event that the row view fires
        //in this example we're simply updating a field that shows
        //which row was clicked
        this.model.set('chosenSelection', rowView.model.get('name'));

        //update the name on the row from this view
        rowView.model.set('name', 'no longer selectable');
      },
      onBeforeShow: function() {
        this.getRegion('SelectionRegion').show(new SelectionView({
          model: this.model
        }));
        this.getRegion('ListRegion').show(new CollectionView({
          collection: this.collection
        }));

        this.collection.fetch(); //assume the resource is configured
      }
    })
  ```
* Data manipulation for display purposes should occur in `serializeModel`, `serializeCollection`, or `serializeData` as appropriate.  In most views, `serializeData` calls `serializeModel`, and then `serializeCollection` where the model will get preference and `serializeCollection` will not get called if the view owns a model.  _CollectionView_ and _CompositeView_ do not have `serializeCollection`.  Of the two, only _CompositeView_ calls `serializeModel`.  Data should _never_ be changed in a AJAX callback.  If data for a collection or model needs to be modified for business needs, such as an attribute used as a query parameter for a cascading fetch scenario, it should happen in the parse method for the collection or model.  For most purposes, the data only needs to be modified for display.
  ```Javascript
    var ViewAbstract = Marionette.ItemView.extend({
      maxChars: 20,
      initialize: function() {
        var Model = Backbone.Model.extend({
          defaults: {
            'description': ''
          }
        })
        this.model = new Model;
      },
      modelEvents: {
        'change': 'render'
      },
      onBeforeShow: function() {
        //assume the model is configured to be able to fetch
        this.model.fetch();
      }
    });

    //unacceptable
    var View = ViewAbstract.extend({
      //override initialize from ViewAbstract
      initialize: functon() {
        var Model = Backbone.Model.extend({
          parse: function(resp) {
            //permanently changes data
            resp.description = resp.description.substr(0, this.maxChars - 1) + '...';

            //no need to add an attribute just for display
            resp.shortDescription = resp.description.substr(0, this.maxChars - 1) + '...';

            return resp;
          }
        })
      }
    });

    //even worse
    var View = ViewAbstract.extend({
      //post processing in closure scope
      onSuccess: function(resp) {
        resp.description = resp.description.substr(0, this.maxChars - 1) + '...';
        //what would be even worse, would be something like
        //this.model.set(resp);
        //this.model = new Bacbone.Model(resp);
        return resp;
      },
      //override onBeforeShow from ViewAbstract
      onBeforeShow: function() {
        var fetchOptions = {
          'success': this.onSuccess
        }
        this.model.fetch(fetchOptions);
      }
    });

    //proper
    var View = ViewAbstract.extend({
      //override serializeData from ViewAbstract
      serializeData: function(model) {
        var JSON = model.toJSON();
        JSON.description = JSON.description.substr(0, this.maxChars - 1) + '...';
        return JSON;
      }
    });

  ```

## HTML Template ##
* Tags are 508-compliant.
* Do not use `tabindex=0` to make non-actionable items navigable via the tab key.
* Do not use `tabindex` to adjust tab navigation that breaks the left->right top->bottom visual flow.
* Do not use inline style.
* Do not use deprecated HTML elements & attributes.
* There are no misleading or ambiguous element id values.
* Do not use single quotes around attributes.
  ```JavaScript
    <!-- Bad practice -->
    <button type='button' class='btn btn-default' title='Active'>Active</button>
  ```
## Miscellaneous ##
* Specify exact library version in _bower.json_.
  ```
    "lodash": "1.3.1",
    "jquery": "1.9.1",
  ```
* Run `gradle build` to verify newly generated css files are identical to the ones from git.
  ```
    Running "shell:sass" (shell) task
    Running "compass:dist" (compass) task
    overwrite _assets/css/adk.css (1.229s)
    identical _assets/css/browser-not-supported.css (0.004s)
    identical _assets/css/ui-components.css (0.443s)
    identical _assets/css/vendor.css (0.002s)
  ```