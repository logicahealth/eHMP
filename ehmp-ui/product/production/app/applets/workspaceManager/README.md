::: page-description
# Workspace Manager Applet #
This applet's main purpose is to create, edit, and select workspaces.
:::

## Workspace Selector ##
This is the mechanism by which the user can see the current workspace, select a different workspace, and  access any additional options available, such as opening the Workspace Manager or Workspace Editor.

### Workspace Options Dropdown ###
Sub-component of the Workspace Selector which shows any additional options available to the user for a given context or workspace. The trigger button is shown when options are present. Options are registered as [prescribed below](#Workspace-Selector-Workspace-Options-Dropdown-Options-Registration).
#### Options Registration ####
In order to be shown in the Workspace Options dropdown, an option must be registered with the following options:

```JavaScript
// option's view -- example use cases
var WorkspaceManagerButton = Backbone.Marionette.ItemView.extend({
    tagName: 'li', // shown in ul, so should be li
    template: Handlebars.compile([
    // first child element should be 'a' tag
        '<a href="#" class="workspace-manager-option right-padding-xs left-padding-xs workspace-manager-option--trigger" tabindex="-1" role="menuitem">',
        '<span class="flex-display">',
        '<i class="right-padding-sm top-padding-xs fa fa-wrench"></i> ',
        '<span class="word-break-break-word white-space">Manage {{context}} workspaces</span>',
        '</span>',
        '</a>',
    ].join('\n')),
    templateHelpers: function() {
        return {
            'context': ADK.WorkspaceContextRepository.currentContextId
        };
    },
    ui: {
        'WorkspaceManager': '.workspace-manager-option--trigger'
    },
    events: {
    	// how click event should be defined
        'click @ui.WorkspaceManager': 'openWorkspaceManager'
    },
    openWorkspaceManager: function(e) {
        e.preventDefault();
        var channel = ADK.Messaging.getChannel('workspaceManagerChannel');
        channel.trigger('workspaceManager');
    }
});
// component registration
ADK.Messaging.trigger('register:component', {
    type: "workspaceSelectorOption", // targets the workspace dropdown
    group: ["patient"], // defines in which context option will be displayed
    key: "workspaceManagerButton", // unique to this option
    view: WorkspaceManagerButton, // view defined above
    orderIndex: 5 // if order is important
});
```

## Workspace Select Dropdown ##
### Skip Link ###
A skip link to the workspace select dropdown button is added to ADK.Accessibility.SkipLinks using the SkipLinks behavior
