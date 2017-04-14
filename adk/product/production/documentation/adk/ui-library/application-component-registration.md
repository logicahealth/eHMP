::: page-description
# Application Component Registration #
ADK UI Library's methods for creating and registering application level "components" and "component items".
:::

:::callout
An "_application component_" is a component that can be registered to some application-level container that is intended for housing functionality from an applet. For example, the writeback trays in the patient workspaces are examples of components that were registered as trays to the writeback group. One applet can define a containing component (the tray container with button), while other applets can register as items to different application components. An example of an item registering to a component would be the allergies applet registering its writeback form to the observations tray. Upon registration, components are placed in a central Backbone collection meant for components while the component items are placed in a similarly placed collection meant just for items.
:::
**Note:** This structure is designed to eliminate direct dependencies between applets and application-level containers and is achieved by utilizing Marionette's Collection view's ability to consume an empty collection and then render accordingly when the collection is updated upon registration of components. This also provides the ability for domain-specific code to reside in the domain (applet) that it belongs, allowing ADK views to become cleaner and more maintainable.
:::definition
In order for a component to be displayed, the following events must occur at some point in the life of the application. This can happen in no particular order due to the existence of the two collections (components and items) prior to the loading of a screen.
- Application container view consumes the global component collection.
- An applet registers a component to the central collection to be shown in the application container view.
- An applet registers an item to be consumed by the component it specifies.
:::

## Registering Components ##
When registered, application components are placed in a central Backbone collection of components. This collection is instantiated upon start of the application. Because of this, there are no race conditions with applets. Simply registering a component does not do anything but add a model to the application component collection. In order for a component to be utilized, a container must opt-in to use the component. This is accomplished using the `type` and `group` options. The container asks the collection for all components matching the `type` and `group` specified by the container, and then shows the components accordingly.

### Example ###
```JavaScript
ADK.Messaging.trigger('register:component', {
    type: "COMPONENT_TYPE", // What kind of component
    group: "GROUP_1", // used to categorize "type"
    key: "UNIQUE_COMPONENT_ID", // used for the component items to decide to which component to register
    view: Backbone.Marionette.CollectionView.extend(), // view to show
    shouldShow: function() {return true;}, // function that determines whether component should show
    orderIndex: 10 // Dictates position when there are multiple components of the same type and group
});
```

## Registering Items ##
When registered, application component **items** are placed in a central Backbone collection of component items which is instantiated upon start of the application in order to eliminate the risk of race conditions. Registering an item adds a model to this central collection and is made available to the component that has the matching `key` and `type` options. In other words, an **item** has the ability to specify to which component(s) it wants to register.

### Example ###
```JavaScript
ADK.Messaging.trigger('register:component:item', {
    type: "tray", // What kind of component
    key: ["observations"], // (array of strings) which specific component of specified type
    label: "Vitals", // Is used as display text of the item for the component
    shouldShow: function() {return true;} // function that determines whether the item should show
                                          // ie. permissions
});
```

## Available Application Components ##
|Domain/Applet | Component Type            | Component Group      | Component Key     |Location in Application|
|--------------|---------------------------|----------------------|-------------------|-----------------------|
|observations  |`"tray"`                   |`"writeback"`         | `"observations"`  | Patient Header bar    |
|notes         |`"tray"`                   |`"writeback"`         | `"notes"`         | Patient Header bar    |
|action        |`"tray"`                   |`"writeback"`         | `"actions"`       | Patient Header bar    |
|any           |`"applicationHeaderItem"`  |`"user-nav-alerts"`   | any               | Navigation Header     |
|any           |`"applicationHeaderItem"`  |`"patient-nav-alerts"`| any               | Navigation Header     |


::: callout
**Note:** When registering a component of type **"tray"** and group **"writeback"** to be used in the patient header bar, the `viewport` option on the Tray will be overwritten.
:::

## Current Application Component Items ##
|Domain/Applet | Component Type | Component Key        |
|--------------|----------------|----------------------|
|allergy_grid  |`type: "tray"`  |`key: "observations"` |
|immunizations |`type: "tray"`  |`key: "observations"` |
|notes         |`type: "tray"`  |`key: "notes"`        |
|orders        |`type: "tray"`  |`key: "actions"`      |
|vitals        |`type: "tray"`  |`key: "observations"` |
