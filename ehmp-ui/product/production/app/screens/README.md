::: page-description
# Screens #
High level explanation of what is a Screen and how to build a Screen.
:::

## How to build screens ##
A screen is a JavaScript file that returns a "screen config" object.
To build a screen, start off by creating a JavaScript file in the **"screens" directory** (follow lower camelCase naming convention) then follow the steps for adding a screen config.

> **Important**: The screen must also be added to the **screensManifest** _(/screens/ScreensManifest.js)_ by pushing new screen object to the screenManifest's **screens array** (example code below)
> ```JavaScript
> screens.push({
>   routeName: 'user-visible-screen-name-url', // the screen's id
>   fileName: 'sampleScreen', // screen's file name with the file's extension omitted
>   requiredPermissions: ['some-permission', 'another-permission'] //optional parameter that gets called to check if the user has permission to view the page. Will reroute the user back to the default screen if permission to view the screen is forbidden.
> });
> ```

### Screen Config ###
A screen configuration describes the screen and how it should be built. There are several component options available to keep in mind while building a screen. The configuration determines which applet layout to use and which applets go in which regions within that layout. Various components can be specified to be placed in various regions around the screen. Below is a complete list of accepted screen config attributes.

| Required         | Attributes              | Description   |
|:----------------:|-------------------------|---------------|
| <i class="fa fa-check-circle center"></i> | **id**                  | **unique identifier** that will also be the **url path** to get to the screen <br /> When specifying an id, one should always use hypens versus camel case. (e.g. _sample-screen_) |
| <i class="fa fa-check-circle center"></i> | **applets**             | array of **applet screen config objects** to render on the screen <br /> _(see below for more details on a applet screen config)_ |
|                  | **contentRegionLayout** | name of layout to use for center/applet region <br /> _(see choices below)_ |
| <i class="fa fa-check-circle center"></i> | **requiresPatient**     | boolean used to show or hide patient demographic header |
|                  | **onStart**             | method that gets called when the screen is shown  |
|                  | **onStop**              | method that gets called before screen is changed |

**Note**: _the onStart and onStop methods are generally the place to start and stop listening to the screen's applets on their respective channels using ADK.Messaging..._

::: definition
### Applet Screen Config Object ###
An applet screen config object contains the following attributes:
- **id** : _(string)_ the [applet's id](#How-to-build-Applets-Basic-Applet-Structure) which is defined in the applet's configuration object
- **title** : _(string)_ visible to user when using [Applet Chrome][AppletChrome]
- **region** : _(string)_ region of the _contentRegionLayout_ in which to display the applet (see below for a list of regions)
- **fullScreen** : _(boolean)(optional)_ true if the applet is the only one on the screen
- **maximizeScreen** : _(string)(optional)_ id of the screen to navigate to when the applet's chrome maximize event is called ([applet chrome details][AppletChrome])
- **viewType** : _(string)_ name of the applet's viewType to display

### Content Region Layouts ###
The following are supported layouts to be used when defining a screen's  **contentRegionLayout** attribute:
| Layout Title            | Regions                                                                                            |
|-------------------------|----------------------------------------------------------------------------------------------------|
| gridOne                 | <div class="c-r-l"><div class="row"><div class="col-md-12"><div>center</div></div></div></div>     |
| fullOne                 | <div class="c-r-l nm"><div class="row"><div class="col-md-12"><div>center</div></div></div></div>  |
| gridTwo                 | <div class="c-r-l"><div class="row"><div class="col-md-6"><div>left</div><div>left2</div><div>left3</div><div>left4</div><div>left5</div></div><div class="col-md-6"><div>right</div><div>right2</div><div>right3</div><div>right4</div><div>right5</div></div></div></div> |
| gridThree               | <div class="c-r-l"><div class="row"><div class="col-md-4"><div>left</div><div>left2</div><div>left3</div><div>left4</div></div><div class="col-md-4"><div>center</div><div>center2</div><div>center3</div><div>center4</div></div><div class="col-md-4"><div>right</div><div>right2</div><div>right3</div><div>right4</div></div></div></div> |
| columnFour              | <div class="c-r-l"><div class="row"><div class="col-md-3"><div>one</div></div><div class="col-md-3"><div>two</div></div><div class="col-md-3"><div>three</div></div><div class="col-md-3"><div>four</div></div></div></div> |

_**Note**_: each layout only supports enough applets to fit one in each region_
:::

### Basic Screen Configuration ###
Below is an example of a screen's JavaScript file:

```JavaScript
define([], function () {
  var screenConfig = {
      id: 'user-visible-screen-name-url',
      contentRegionLayout: 'gridOne',
      applets: [{
          id: 'some-applet-id',
          title: 'User Visible Title',
          region: 'center'
      }],
      requiresPatient: true,
      onStart: function() {
        var someAppletChannel = ADK.Messaging.getChannel("someAppletName");
        someAppletChannel.on('someEventToListenTo', someFunctionToBeCalled);
      },
      onStop: function() {
          var someAppletChannel = ADK.Messaging.getChannel("someAppletName");
          someAppletChannel.off('someEventToListenTo', someFunctionToBeCalled);
      }
  };
  return screenConfig;
});
```

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