::: page-description
# Applets #
High level explanation of what is an Applet and how to build an Applet.
:::

## What is an Applet? ##
The majority of web developers working within the creation of the eHMP UI will spend their time developing applets.  The applet is the incremental user functionality.  An applet is a set of HTML/SASS/JavaScript that runs within the ADK.

Applet development begins with using a devops service/offering to initialize the applet (currently all applet development will be done in a single eHMP-UI App repo).  The result of this service includes: a new git repository for the applet, seeded based upon an applet template; CI (Jenkins) jobs responsible for reacting to check-in, compiling the HTML/SASS/JavaScript,  running unit and acceptance tests, and publishing the resulting artifact to an artifact repository.

The resulting artifact of an applet will likely include two versions: a development version optimized for debugging (not minified) and a version optimized for production (minified).

The goal of the ADK is to provide the guidelines, constraints, and technology to ensure that teams can efficiently create incremental functionality WITHOUT requiring unscalable close collaboration between development teams.  Yes, collaboration is a good thing.  However, many teams modifying the same code or having to coordinate routine changes is not scalable to an ecosystem of many parallel functional development areas.

::: side-note
The ADK:
- provides a mechanism for applet developers to discover the current patient
- provides a mechanism for applet developers to fetch patient data from vista exchange, can use canonical model (based on VPR) or provide custom "view" model
- provides a mechanism for applet developers to bind data to backbone views, provide templating
- provides a mechanism for applet developers to choose from preselected display paradigms (grid view, pill view, etc) and UI controls.  UI style set by application
- includes a CI pipeline / devops for "compiling" applet, packing, running tests, publishing to artifact repository. This produces a CM-ed version of the applet
- allows applet developers to produce a marionette "view".  The view returned by the applet can be any type of marionette view, CollectionView, CompositeView, ItemView, or LayoutView.  A CompositeView and LayoutView can include additional regions that applet developers have control of to load other sub views.  This often will fall into patterns as below:
    - HTML template for a row using handlebars
    - Creation of backbone view-model
    - Registering these with ADK
:::

## How to build Applets ##
**Make sure to reference the Developer Specific Instructions on how to create/deploy/test an Applet.** <br />(Links to these instructions can be found in the footer)

> **Important**: The applet must also be added to the **appletsManifest** _(/applets/appletsManifest.js)_ by adding a new applet object to the appletsManifest's **applets array** (example code below).
>
> **Note**: specify _true_ for **showInUDWSelection** in order for the applet to display in the User Defined Workspaces' add applet carousel.
> ```JavaScript
> var applets = [{
>       id: 'sample_applet',                    // same as name given to applet on
>                                               //      creation (same as applet folder name)
>       title: 'Sample Applet Display Name',    // what is displayed on title bar
>       context: ['patient','staff','admin'],   // specify a list of contexts that this applet belongs to.
>       maximizeScreen: 'sample-applet-full',   // (optional) screen for maximized version of applet.
>       showInUDWSelection: true,               // true to show up in User Defined Workspace Carousel
>       permissions: ['some-permission', 'another-permission'] // Array of permissions needed to view applet.
>       dependencies: ['other_sample_applet'],  // array of applets to prioritize before this applet
>       requiredByLayout: ['patient'] || true   // array of contexts requiring this applet for its layout (true == all contexts)
>   },
>     ...
> }];
> ```

### Basic Applet Structure ###
An applet is made up of marionette "views".  Each applet should have an **applet.js** file that returns an applet object that includes the following attributes:

| Required                                      | Attributes         | Description                                                                       |
|-----------------------------------------------|--------------------|-----------------------------------------------------------------------------------|
|<i class="fa fa-check-circle center"></i>      | **id**             | **unqiue identifier** to reference the applet by                                  |
|<i class="fa fa-check-circle note center">*</i>| **getRootView**    | returns the applet view                                                           |
|<i class="fa fa-check-circle note center">*</i>| **viewTypes**      | an array of applet viewType objects (see description of **viewType object** below)|
|<i class="fa fa-check-circle note center">*</i>| **defaultViewType**| _(string)_ the name of the default viewType to use if not defined in the screen   |

::: callout
 **<i class="fa fa-check-circle note">\*</i> IMPORTANT**: it is required to either have a **getRootView** attribute **or** a **viewTypes** array in an applet configuration.  When specifying a **viewTypes** array, a **defaultViewType** is also _required_ in the applet config.
:::

::: definition
#### **viewType object** - attributes ####
- "**type**" - the viewType id (ex. 'gist', 'summary', 'expanded')
- "**view**" - a marionette view
- "**chromeEnabled**" - boolean <br /> _true_ : wraps your view in a common container that is styled by the ADK _(optional)_ <br /> (_default_: false)
:::

The following is an example **applet.js** file.
```JavaScript
define(['handlebars'], function (Handlebars) {

  var AppletGistView = Backbone.Marionette.ItemView.extend({
      template: Handlebars.compile('<div>I am a simple Item View</div>'),
  });
  var AppletLayoutView = Backbone.Marionette.LayoutView.extend({
      initialize: function() {
          this.sampleView = new SampleView();
      },
      onRender: function() {
          this.appletMain.show(this.sampleView);
      },
      template: Handlebars.compile('<div id="sample-applet-main"></div>'),
      regions: {
          appletMain: "#sample-applet-main"
      }
  });
  var applet = {
      id: "sample",
      getRootView: function() {
          return AppletLayoutView;
      },
      viewTypes: [{
          type: 'gist',
          view: AppletGistView,
          chromeEnabled: true
      }, ...]
  };
  return applet;
});
```
::: side-note
### For creating views for use in an applet config an applet developer can either: ###
  - create a custom view using [Marionette][MarionetteViews]'s ItemView, CompositeView, LayoutView ...
  - extend an [ADK.AppletView][AppletViews] or [ADK.BaseDisplayApplet][BaseDisplayApplet] as a starting point
:::

#### Applet Javscript Files ####
For all applet JavaScript files, use the following shell to wrap your applet code, as seen also in the example applet.js file above:
```JavaScript
define([], function () {

  /* Applet Code Goes Here*/

});
```

#### Requiring Libraries / Files from the ADK ####
To use any libraries or include any files into your current javascript, follow the steps below:


1. Add file's file path string to the dependencies array
    - Note: the App's root directory is **.../product/production/**, therefore you simply need to state the remaining file path with the file's extension omitted
    <br />e.g. ".../product/production/app/applets/sampleApplet/helper.js" &#10140; "app/applets/sampleApplet/helper"

    - Note: for including html templates the same rules apply from the previous bullet point, except you also need to prepend the string **"hbs!"** to the file path string
    <br />e.g. ".../product/production/app/applets/sampleApplet/template.html" &#10140; "hbs!app/applets/sampleApplet/template"

2. Add a parameter name to the onResolveDependencies function that is used as a reference to the file.
    - Note: **Order of the array strings and function parameters is very important!** (need to match up to each other)

See below for a full example:
```JavaScript
define([
  "main/ADK",
  "app/applets/sampleApplet/helper",
  "hbs!app/applets/sampleApplet/template"
], function (ADK, AppletHelper, AppletTemplate) {

  /* Note how the dependency strings are in the same order as the parameters above
   *
   * "main/ADK"  "app/applets/sampleApplet/helper"  "hbs!app/applets/sampleApplet/template"
   *    ADK              AppletHelper                          AppletTemplate
   */

  var ItemView = Backbone.Marionette.ItemView.extend({
      template: AppletTemplate, // Referencing template.html
      initialize: function(){
        AppletHelper.helperFunction(); // Referencing helper.js
      }
  });
  ...

});
```


## How to document an Applet ##
Easy as "1 - 2 - 3":

1) Add README.md at root level of applet directory (sibling to applet.js)
2) Add `documentation: true` to applet's entry in appletsManifest.js
3) Add markdown content to README.md!

[adkSourceCode]: https://code.vistacore.us/scm/app/adk.git
[ehmpuiSourceCode]: https://code.vistacore.us/scm/app/ehmp-ui.git
[standardizedIdeWikiPage]: https://wiki.vistacore.us/display/VACORE/Team+Standardized+IDE+for+JavaScript+Development
[workspaceSetupWikiPage]: https://wiki.vistacore.us/display/VACORE/Creating+DevOps+workspace+environment
[sublimeWebsite]: http://www.sublimetext.com/3
[sublimeSettingsWikiPage]: https://wiki.vistacore.us/x/RZsZ
[adkBuildJenkins]: https://build.vistacore.us/view/adk/view/Next%20Branch/
[bsCSS]: http://getbootstrap.com/css/
[bsComponents]: http://getbootstrap.com/components/
[bsJQ]: http://getbootstrap.com/javascript/
[backboneWebPage]: http://backbonejs.org/
[marionetteWebPage]: https://github.com/marionettejs/backbone.marionette/tree/master/docs
[requireJsWebPage]: http://requirejs.org/
[amdWebPage]: http://requirejs.org/docs/whyamd.html
[handlebarsWebPage]: http://handlebarsjs.com/
[underscoreFilterWebPage]: http://underscorejs.org/#filter
[BackboneRadio]: https://github.com/marionettejs/backbone.radio
[sass]: http://sass-lang.com/
[appletLevelConventions]: adk/conventions.md#Applet-Level-Conventions
[BaseDisplayApplet]: adk/using-adk.md#BaseDisplayApplet
[AppletViews]: adk/using-adk.md#ADK-AppletViews
[MarionetteViews]: http://marionettejs.com/docs/v2.4.1/marionette.view.html
[AppletChrome]: adk/using-adk.md#Applet-Chrome