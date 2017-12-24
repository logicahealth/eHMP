::: page-description
# Behaviors #
ADK UI Library's Standardized Marionette Behaviors
:::

Marionette provides a mechanism to define a centralized pool of reusable behaviors.  Behaviors sit on top of a view, but can access elements or components within a view.  It is important to maintain an event-observer pattern to ensure proper abstraction when developing a behavior.

Behaviors live in the ADK, and each behavior needs to be included in ```behavior.js``` in order to be available in the behavior pool.
```
▼ main
  ▼ components
    ▼ behaviors
```

All behaviors defined in this manner are globally accessible from any view.  The view will lookup the behavior from the ```Backbone.Marionette.Behaviors.behaviorsLookup``` method defined in ```behaviors.js```.

Nothing needs to be required or included in the file which owns the view.  The only thing needed to add a behavior from the pool to any view within the application is to include it in the behaviors attribute in the view's definition.  Behaviors can be nested and multiple behaviors can be specified in a view.

```
var config = {};
var view = Backbone.Marionette.ItemView.extend({
  behaviors: {
    Tooltip: config,
    Popover: {}
  }
});
```

## Action Button ##

The Action Button behavior provides a standardized button component that a developer would utilzize for any secondary action that a user is allowed to take to navigate to an actionable task.  This behavior corresponds to the gotoactionbutton QuickMenu option.  The Action Button is the secondary action of a tile, can be enabled or disabled at the component level, may be used for any action configured for the tile (e.g. edit form, completing a task, writing an order, adding a problem), and will be configured to direct users to where the appropriate action takes place (e.g. the tray with a particular form open).

**a template with the .action-container class is needed to add the Action Behavior to a table**

```Javascript
childView: ChildView.extend({
     tileOptions: {
          quickMenu: {
               enabled: true,
               buttons: [{
                    type: 'gotoactionbutton',
                    actionType: 'task', //defaults to Go To Action
                    shouldShow: true, //function() {return true;},
                    onClick: function(model) {
                         EventHandler.actionButtonHandler.call(model);
                    },
                    disabled: true //function() {return true;}
               }]
          },
          actions: {
               enabled: true,
               actionType: 'task', //defaults to Go To Action
               shouldShow: true, //function() {return true;},
               onClickButton: function(model) {
                    EventHandler.actionButtonHandler.call(model);
               },
               disableAction: true //function() {return true;}
          }
     }
})
```

::: side-note
***Note:*** The options for the Action Button and the gotoactionbutton QuickMenu option are separated in the event that only one is necessary.
:::

## ChildBehaviors ##

The ChildBehaviors behavior allows a user to apply a behavior configuration to all children of a CollectionView or CompositeView.  This behavior works by overriding `buildChildView` so that it extends the existing behaviors on a child and adds in the ones defined in ChildBehaviors.

```Javascript
var View = Marionette.CollectionView.extend({
  childView: SomeView.extend({
    behaviors: {
      Tooltip: {}
    }
  }),
  behaviors: {
    ChildBehaviors: {
      Injectable: {
        insertMethod: 'append',
        childView: SomeOtherView,
        childViewOptions: function() {
          return {
            something: this.view.something
          }
        },
        attributes: {} //attributes on the container element
      }
    }
  }
});
```

## CollectionOptionsList ##

The CollectionOptionsList behavior turns any Marionette Collection or Composite View into a 508 compliant list of items which allows users to use the up and down arrow keys to navigate through the items. This behavior works by adding the proper tabIndex values and aria roles to the view's DOM elements and then dynamically shifting focus between the items based on the rules outlined below.
- When tabbing to the list (both forward tabbing and reverse tabbing with the shift key), in the case where the user has already started navigating the items of the list, focus will immediately jump to the last list-item or child-view that had focus, otherwise by default, focus will go to the first list-item or child-view. In both cases the top level Collection/Composite View DOM element will be skipped in the tabbing order.
- When the view is considered empty, meaning there are no children being rendered to the DOM, focus will land on the Collection/Composite View's element, with the next tab proceeding to the next tabbable element in the DOM order.
```JavaScript
// Collection or Composite View
behaviors: {
  CollectionOptionsList: {} // no options are supported at this time
}
```

## ErrorComponents ##

The ErrorComponents shows all custom components (i.e. from [`ADK.Messaging.request('get:component:items')`](application-component-registration.md)) that are registered with `type: 'errorItem'`. This is meant to be used in error views.

```JavaScript
// parent view
behaviors: {
  ErrorComponents: {
    container: '.error-components-target-container', // defaults to view's $el
    // used to determine model to pass into components, bound with view
    // defaults to view's model if not defined
    getModel: function() {
      return this.errorModel;
    },
    // defaults to true if not defined
    shouldShow: function() {
      return _.isEqual(this.model.get('state'), 'error');
    }
  }
}
```

## ErrorContext ##

The ErrorContext behavior enables smaller, re-usable views to get some context as to where in the application they might be. The behavior is placed on some parent view, and a child view can ask that parent view for it's context. For example, this is useful when the re-usable ADK.UI.Error view is shown due to a resource error. With this behavior attached to ADK.UI.Chrome, which has access to the applet id, etc., the error view can capture meaningful information.

Note that the first ancestor to capture the event will stop propagation.

```JavaScript
// parent view
behaviors: {
  ErrorContext: {
    // string (or function returning string -- bound with view)
    // user friendly description (i.e. applet 'title' attribute)
    title: 'Example applet/view',
    // object (or function returning object -- bound with view)
    // any additional context (i.e. full applet config) -- useful for debugging
    details: {
      config: {
        id: 'example-applet',
        title: 'Example applet/view',
        //...
      }
    }
  }
}

// then in descendant view (i.e. error view)
events: {
  'my:reply:event': function(event, context) {
    // do something with context.title and context.details
  }
},
onAttach: function() {
// onAttach ensures both views are in DOM
  // pass eventString (required)
  this.$el.trigger('request:error:context', 'my:reply:event');
}
```

## FlexContainer ##

The FlexContainer behavior provides an easy mechanism for applying flexbox styled layouts. An example usage would be to have one or more regions be fixed in place with one or more regions made scrollable. The FlexContainer behavior can only apply flexbox styles to a container and its direct children.

```JavaScript
// this example makes .region2 a scrollable region with the other
// regions remaining fixed. Note: the regions must be siblings of each other
var View = Backbone.Marionette.LayoutView.extend({
  template: Handlebars.compile([
    '<div class="region1"></div>', // will receive flex-width: none
    '<div data-flex-width="1" class="region2 auto-overflow-y"></div>',
    '<div class="region3"></div>'  // will receive flex-width: none
  ].join('\n')),
  regions: {
    Region1: '.region1',
    Region2: '.region2',
    Region3: '.region3'
  },
  behaviors: {
    FlexContainer: {
      // container option: optional (defaults to this.$el)
      container: '.region1', // takes string selector to point to element in this.$el
      // OR array, which is used to recursively add flex to each valid container in array
      container: [
        true, // true indicates to apply flex to this.$el (uses rest of config)
        '.region2', // string selector points to element in this.$el (uses rest of config)
        { // OR object with container -- applied to specified container with new options only
          container: '.region3',
          direction: 'row',
          justifyContent: 'center',
          alignItems: 'baseline'
        }
      ],
      direction: 'column', // or other flex-direction (row row-reverse column-reverse)
      justifyContent: 'flex-start' // or other justify-content (flex-end, center, space-between, space-around),
      alignItems: 'flex-start' // or other align-items (flex-end, center, baseline, stretch)
    }
  }
});
```

::: side-note
**Note on `container` option:** the target container by default is `this.$el`, which means `this.$el` will receive `display: flex` and its direct children receive a flex-width of none unless specified with `data-flex-width="1"` (or other number, on increments of 0.5). If `container` is defined, the targeted element will receive `display: flex` and its direct children will receive the appropriate flex-width.

Acceptable formats of `container`:
- string: should be valid css/jquery selector that will get used to look up the correct element in this.$el
- array: indicates multiple levels of flexbox properties within the view.
  - `true`: indicates to apply flexbox to `this.$el`. Uses rest of config options
  - string: indicates to look up the specified selector in this.$el. Uses rest of config options
  - object: indicates that a new configuration is to be used. Must contain its own `container` option with string selector defined. In practice, this can be used to effectively apply desired properties in multiple containers
:::

## HelpLink ##

The HelpLink behavior provides an easy mechanism for injecting help buttons into any view. A valid help mapping or url MUST be defined, otherwise the button will not appear. By default, the button is appended to the end of the view's template. To overwrite this, a container option can be defined. Additional options such as icon and color can be configured through the `buttonOptions` option. See below for example.

```JavaScript
var View = Backbone.Marionette.ItemView.extend({
  template: Handlebars.compile([
    '<div class="view-content1"></div>',
    '<div class="help-button-container"></div>',
    '<div class="view-content2"></div>'
  ].join('\n'))
  behaviors: {
    HelpLink: {
      mapping: 'example_mapping', // must exist in helpMappings.js
      // OR url -- in practice, is used when url is determined from mapping beforehand
      url: '/documentation/', // would link to sdk docs. Subject to security content policies
      container: '.help-button-container', // valid css/jquery selector in this.$el
      buttonOptions: {
        icon: 'fa-question-circle', // default 'fa-question' (any valid font-awesome class)
        colorClass: 'bgc-primary-dark', // 'bgc-<color>' -- primary-dark, primary-light, pure-white. Describes color of background
        paddingClass: 'all-padding-no', // if default button padding is messing up styles
        fontSize: 15 // or "15" (or any whole integer)
      }
    }
  }
});

// the mapping and url can be updated at any time with the following events triggered on the view's $el
var view = new View();
view.$el.trigger('update:help:mapping', 'new_example_mapping');
view.$el.trigger('update:help:url', '/documentation/#/adk/ui-library/components');
view.$el.trigger('update:help:button:options', { colorClass: 'bgc-primary-light' });
```

::: showcode Try it out in the console:
```JavaScript
// paste into console on application page:
// Note: remove mapping option... Since the mapping does not exist,
// the button will not be displayed.
// =======================
// can be any view type
var MyView = Backbone.Marionette.ItemView.extend({
  behaviors: {
    HelpLink: {
      // container is optional, link will be appended to end of view
      // if not specified
      container: '.help-icon-container', // restricted to be within the view
      mapping: 'example_view', // PREFERRED! corresponds to helpMappings.js -- (omit this line)
      // also supports url, though content policies restrict outside links
      url: '/documentation/' // DISCOURAGED! would take you to SDK docs
      // Note: the help link will not be shown if neither mapping or url
      // are defined. Also, if mapping is defined, it will only be shown if
      // it is found in helpMappings.js
    }
  },
  template: Handlebars.compile('<div class="help-icon-container"></div>')
});

// The mapping/url (and therefore whether the link is shown or not)
// can be changed at any time using DOM events hooked up to the views el
// see below for example. This can be tried in the console of a locally deployed
// app, though the line with mapping option above should be removed for this
// to work (also, don't trigger update of mapping, only url)
//===================
var myView = new MyView();
var MyExampleLayoutView = Backbone.Marionette.LayoutView.extend({
// simply an example view, normally would be shown in a normal way
  el: 'body', // please, NEVER DO THIS, just an example
  template: Handlebars.compile('<div class="my-region"></div>'),
  regions: {
    MyRegion: '.my-region'
  },
  onRender: function() {
    this.showChildView('MyRegion', myView)
  }
});
var myExampleLayoutView = new MyExampleLayoutView();
myExampleLayoutView.render();
// Notice at this point, the href will be pointing to '/documentation/'
```
```JavaScript
// update mapping -- won't work unless mapping exists (skip this line)
myView.$el.trigger('update:help:mapping', 'new_example_mapping');
// OR update url (do this one if trying in console)
myView.$el.trigger('update:help:url', '/documentation/#/adk/using-adk#Behaviors-HelpLink');
// Now notice the updated href and destination in popup
```
:::

## InfiniteScroll ##

The InfiniteScroll behavior allows for easy paging by scrolling.

```JavaScript
behaviors: {
  InfiniteScroll: {
    getCollection: function() { // since this.collection is not defined upon behavior instantiation
      return this.collection // must be a collection with hasNextPage and getNextPage functions
      // recommended to use ADK.Collections.ServerCollection or one that extends it
    },
    container: 'table tbody', // jQuery selector for scrollable container
    tagName: 'tr', // tagName to use for scrolling/loading indicator
    className: 'all-border-no other-class', // extra classes to add to the scrolling/loading indicator
    events: 'click tr.row-header' // additional events besides scrolling on container to trigger paging
  }
}
```

## Injectable ##

The Injectable behavior allows any view to be treated as a LayoutView, by applying a RegionManager and allowing a user to specify an existing container in the view's $el.  An attribute, `targetView`, is handed to the childView when it is created, so the childView can reference the view the behavior is applied to using `this.getOption('targetView')`.  In the example below the values given are the defaults, and the only required field is `childView`.

```Javascript
behaviors: {
  Injectable: {
    childView: SomeViewDefinition,
    insertMethod: 'prepend', //'append'
    shouldShow: true, //function() {return true;}
    tagName: 'div', //function() {return 'div';}
    component: 'mainRegion', //used to name the region
    attributes: {}, //function() {return {disabled: true};}
    containerSelector: function() { //can be string selector
      return this.view.$el;
    }
  }
}
```

::: side-note
***Note:*** If a selector is used for `containerSelector`, the element must be inside `this.view.$el`.  The selector won't match against the parent element.
:::

## Notification Icon ##

The Notification Icon behavior provides a standard icon which a developer can use to draw attention to certain records.  For the user, a dedicated Notification Indicator space will display a Notification Icon when there is a notification related to the tile.  When no notification exists, the indicator will not appear.  Mouse hovering over the notification icon will give users a tooltip explaining the nature of the notification

**a template with the .notification-container class is needed to add the Notification Icon behavior to a table**

```Javascript
childView: ChildView.extend({
  tileOptions: {
    notifications: {
      enabled: true,
      container: '.notification-container', // selector in which to input the icon
      titleAttr: 'NOTIFICATIONTITLE', // the model's attribute that holds the title of the notification. Used as the icon's tool tip
      shouldShow: function(model) {
        return model.get('NOTIFICATION');
      }
    }
  }
})
```

::: side-note
***Note:*** The notification icon is not available for pill-styled tiles.
:::

## Popover ##

Bootstrap popovers are enhanced from tooltips, so the same possible problem can apply, in that the popover can be orphaned if the control element is lost, which happens when a view is destroyed while the popover is opened.  The popover behavior doesn't default any configuration at this time, so it would be advisable to pass in any configuration options necessary into the behavior options.

```
var view = Backbone.Marionette.ItemView.extend({
  template: Handlebars.compile('<div data-toggle="popovers">Quicklook</div>'),
  modelEvents: {
    'sync': 'render'
  },
  events: {
    'click button': 'refreshAction'
  },
  refreshAction: function(event) {
    this.model.fetch();
  },
  behaviors: {
    //see Bootstrap documentation for options
    Popover: {
      title: function() {
        return this.getTitle();
      },
      trigger: 'click',
      html: 'true'
    }
  },
  getTitle: function() {
    return '<div>Popover Contents</div>';
  }
});
```

## QuickMenu ##

The QuickMenu behavior allows a developer to apply a menu to a view and any element within a view.  It extends from the Injectable behavior, so many of its options are going to be the same.  In most cases, the only options that will need adjustments on a case by case basis are `tagName` and `containerSelector`.  For a user, the Quick Menu appears as a drop down with both an icon and a label for each menu item.

```Javascript
var View = Marionette.View.extend({
  behaviors: {
    QuickMenu: {
      childView: QuickMenuView, //don't override unless you need to apply a custom menu
      tagName: 'td', //will often be td or div
      containerSelector: function() { //could be a string selector
        return this.$el;
      },
      insertMethod: 'prepend',
      shouldShow: function() {
        var tileOptions = this.getOption('tileOptions') || {};
        return _.result(tileOptions, 'quickMenu.shouldShow', true);
      },
      events: {} //applies events to View
    }
  }
})
```

## QuickTile ##

The QuickTile behavior extends from ChildBehaviors and provides an easy to use and highly configurable component which can be applied to any CollectionView or CompositeView to provide the QuickMenu and QuickLook components to all children.  The QuickTile behavior is applied to a parent view, but each child view can configure each child component for its needs, using the tileOptions attribute.  Each method within tileOptions is scoped to the row view.  One can apply tileOptions using childViewOptions, or simply by setting tileOptions against the child definition.

```Javascript
behaviors: {
  QuickTile: {
    enabled: true, //can be method
    menuEnabled: true, //can be method
    rowContainerClassName: 'quickmenu-container', //class applied to the row container, do not alter
    headerContainerClassName: 'quickmenu-header', //class applied to the header, do not alter
    rowAttributes: {}, //attributes on the row's container element
    headerAttributes: {}, //attributes on the header's container element
    childView: QuickMenuView, //view definition to be applied, do not alter
    tagName: 'td', //can be a method, will usually be td or div
    containerSelector: function() { //can also be a string selector or jQuery object
      return this.$el;
    },
    insertMethod: 'prepend' //where to stick the container, at the beginning or end (append),
    shouldShow: function() { //determines whether entire component will be applied
      var collection = this.getOption('collection');
      return !!(collection && collection.length)

    }
  }
},
childView: ChildView.extend({
  tileOptions: {
    primaryAction: { //what happens when you click the row
        enabled: true | function() {return true;}, //defaults to enabled
        onClick: function(options, event) { //often not necessary
          var $buttonEl = options.$el;
          var model = options.model = this.model;
          var collection = options.model.collection = this.model.collection;
        }
    },
    quickMenu: {
      disabled: false //disables the trigger button,
      shouldShow: true //determines whether the compopnent is shown on the row
      //the order of the buttons is fixed and cannot be altered, so the order
      //they are configured here in the array is irrelevant
      buttons: [{
          type: 'infobutton',
          shouldShow: 'true' //function or boolean, for case by case determination
        },{
          type: 'detailsviewbutton',
          //every button can have onClick and even events set, but this should be left alone if possible
          //with the exception of some detailsviewbutton events, where onClick may need to be specified.
          //The method is scoped to the row, and propagation and default behavior are stopped before
          //onClick is triggered
          onClick: function(options, event) {
            var $buttonEl = options.$el;
            var model = options.model = this.model;
            var collection = options.model.collection = this.model.collection;
            if(this.model.has('something')) this.doSomething();
          }
        },{
          type: 'notesobjectbutton'
        },{
          type: 'editviewbutton',
          shouldShow: function() {
              return ADK.UserService.hasPermission('edit-condition-problem');
          },
          disableNonLocal: function() { //specific to editviewbutton
              return this.getOption('disableNonLocal');
          }
        },{
          type: 'crsbutton'
        },{
          type: 'associatedworkspace'
        },{
          type: 'deletestackedgraphbutton'
        },{
          type: 'tilesortbutton'
        },{
          type: 'additembutton',
          disabled: function() {
            return patient.hasPermissions();
          }
      }]
    }
  }
})
```

::: side-note
***Note:*** No options are required in the QuickTile behavior definition, but to make the entire row the container (remember that `$el.find` does not test against itself), one must `return this.$el`.  In `tileOptions`, on the childView definition, `quickMenu` must contain a list of `buttons`, but no other fields are required.
:::

## SkipLinks ##

The SkipLinks behavior abstracts the preferred pattern of adding and maintaining [Skip Links](../using-adk.md#Accessibility-Skip-Links--SkipLinks), including adding the links to the ADK.Accessibility.SkipLinks collection on attach, removing the links on destroy, and ensuring a focusable element is provided. This behavior should be used rather than manually adding and removing links from the collection.

```JavaScript
// example usage
var MyView = Marionette.LayoutView.extend({
  template: Handlebars.compile('<div class="example-target-link-region">'),
  behaviors: {
    SkipLinks: {
      items: [{
        label: 'Example Skip Link Menu Item', // Menu item label
        element: function() {
          // element that receives highlighting on hover of menu item and
          // focus on click of menu item. Function receives view as this binding
          return this.$('.example-target-link-region');
        },
        rank: 0, // position of item relative to other items, lower == higher on list
        focusFirstTabbable: true // if true, focus will be set to first focusable
        // element on click of item. If false and 'element' is not focusable,
        // tabindex of -1 will be set on 'element'
      }]
    }
  }
});
```

## Tooltip ##

The ```Tooltip``` behavior initializes the tooltip when a view is rendered, ensures that the tooltip is destroyed if it's shown when a view is destroyed, and will pull the necessary configuration from the DOM element or a configuration can be specified in the behavior's options.  Views that use Bootstrap tooltips need to use the ```Tooltip``` behavior to ensure the tooltip display container is not left attached to the body if the view is destroyed while the tooltip is still open.

```
var view = Backbone.Marionette.ItemView.extend({
  template: Handlebars.compile(['<div tooltip-data-key="Refresh">',
                               '<button>Refresh View</button>',
                               '</div>'].join()),
  model: resourceModel,
  modelEvents: {
    'sync': 'render'
  },
  events: {
    'click button': 'refreshAction'
  },
  refreshAction: function(event) {
    this.model.fetch();
  },
  behaviors: {
    //see Bootstrap documentation for options
    Tooltip: config || {}
  }

});

```

In the above example, the ```tooltip-data-key``` will be cross referenced with ```_assets/js/tooltipMappings.js``` in the ADK to produce the tooltip contents.  If no contents are found, the default tooltip configuration options will be used, and if ```data-original-title``` or ```title``` cannot be found, then it will set the tooltip contents as the attribute value, in this case, ```Refresh```.  Note that any Bootstrap configuration can be passed in as the behavior options, above shown as ```config```.

Since the attributes are read from the HTML elements in most cases, help tooltips will continue to work as expected so long as this behavior is defined on views which contain help tooltips, and mapping standards are followed.  Note that help tooltips are looked up against ```_assets/js/helpMappings.js```.