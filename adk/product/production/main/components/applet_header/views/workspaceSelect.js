/**
 * Created by kuruczd on 3/23/15.
 */
define([
    'api/Navigation',
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!main/components/applet_header/templates/workspaceSelectDropdown',
    'hbs!main/components/applet_header/templates/workSpaceSelectMenuItem',
    'hbs!main/components/applet_header/templates/workspaceEditorButton',
    'hbs!main/components/applet_header/templates/workspaceContainer',
    'hbs!main/components/applet_header/templates/workspaceSelectDropdownToggleButton',
    "api/UserDefinedScreens",
    'api/Messaging'
], function(Navigation, Backbone, Marionette, _, Handlebars, WorkspaceSelectTemplate, WorkSpaceSelectMenuItemTemplate, WorkspaceEditorButtonTemplate, WorkspaceContainerTemplate, WorkspaceSelectDropdownToggleButtonTemplate, UserDefinedScreens, Messaging) {
    'use strict';

    var CurrentScreenModel = Backbone.Model.extend({
        defaults: {
            currentScreenTitle: "",
            predefined: false
        }
    });

    var WorkspaceManagerButton = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile([
            '<i class="fa fa-th"></i><span class="sr-only">Workspace Manager Page</span>'
        ].join('\n')),
        tagName: 'button',
        className: 'btn btn-primary',
        attributes: {
            title: 'Workspace Manager',
            type: 'button',
            id: 'workspace-manager-button'
        },
        events: {
            'click': 'openWorkspaceManager'
        },
        openWorkspaceManager: function(e) {
            this.triggerMethod('open:workspace:manager');
        }
    });

    var WorkspaceSelectDropdownItemView = Backbone.Marionette.ItemView.extend({
        template: WorkSpaceSelectMenuItemTemplate,
        tagName: 'li',
        className: 'routename-button',
        attributes: {
            role: 'presentation'
        },
        ui: {
            'WorkspaceLink': 'a.workspace-navigation-link'
        },
        events: {
            'click @ui.WorkspaceLink': 'navigateToNewScreen',
            'keydown @ui.WorkspaceLink': function(e) {
                if (e.which === 32) {
                    e.stopImmediatePropagation();
                    this.ui.WorkspaceLink.trigger('click');
                }
            }
        },
        navigateToNewScreen: function(e) {
            e.preventDefault();
            this.triggerMethod('navigate:new:screen');
        }
    });

    var WorkspaceSelectDropdownCompositeView = Backbone.Marionette.CompositeView.extend({
        template: WorkspaceSelectTemplate,
        ui: {
            'DropdownMenuItemsContainer': '.dropdown-menu-items-container',
            'ClearFilterButton': 'button',
            'FilterInput': 'input',
            'FirstMenuItem': '[role=menuitem]:first-of-type'
        },
        events: {
            'click @ui.ClearFilterButton': function(e) {
                e.preventDefault();
                this.resetMenuItems();
                this.ui.FilterInput.val('');
                // prefer to use this.children.first().ui.WorkspaceLink
                // but in IE this.children.first() returned LAST child
                this.$('[role=menuitem]').first().focus();
            },
            'keydown @ui.FilterInput': function(e) {
                if (e.which === 32) {
                    e.stopPropagation();
                }
            },
            'input @ui.FilterInput': function(e) {
                e.preventDefault();
                e.stopPropagation();
                var filterString = e.target.value.toLowerCase();
                if (filterString.length > 0) {
                    this.collection.set(this.originalCollection.filter(function(model) {
                        return model.get('title').toLowerCase().indexOf(filterString) > -1;
                    }));
                    if (this.ui.ClearFilterButton.hasClass('hidden')) {
                        this.ui.ClearFilterButton.removeClass('hidden');
                    }
                    this.updateForCurrentScreen();
                } else {
                    this.resetMenuItems();
                }
            }
        },
        childViewContainer: '@ui.DropdownMenuItemsContainer',
        childView: WorkspaceSelectDropdownItemView,
        childEvents: {
            'navigate:new:screen': function(child) {
                this.navigate(child);
                this.ui.FilterInput.val('');
                this.hideFilterButton();
            }
        },
        initialize: function(options) {
            this.originalCollection = options.originalCollection;
            this.currentScreenModel = options.currentScreenModel;
            this.listenTo(this.currentScreenModel, 'change:currentScreen', function() {
                this.resetMenuItems();
                this.updateForCurrentScreen();
            });
        },
        onRenderCollection: function() {
            this.updateForCurrentScreen();
        },
        navigate: function(child) {
            var href = '#' + child.model.get('routeName');
            Navigation.navigate(href);
        },
        resetMenuItems: function() {
            this.collection.set(this.originalCollection.models);
            this.hideFilterButton();
            this.updateForCurrentScreen();
        },
        hideFilterButton: function() {
            if (!this.ui.ClearFilterButton.hasClass('hidden')) {
                this.ui.ClearFilterButton.addClass('hidden');
            }
        },
        updateForCurrentScreen: function() {
            var currentScreenID = this.currentScreenModel.get('currentScreen').id;
            var currentScreenMenuItem = this.children.find(function(child) {
                return child.model.get('id') == currentScreenID;
            });
            this.$('li.active').removeClass('active');
            if (currentScreenMenuItem) {
                // will not enter if correct child is filtered out
                currentScreenMenuItem.$el.addClass('active');
            }
        }
    });

    var WorkspaceSelectDropdownButtonTextView = Backbone.Marionette.ItemView.extend({
        template: WorkspaceSelectDropdownToggleButtonTemplate,
        initialize: function(options) {
            this.listenTo(this.model, 'change:currentScreenTitle', this.render);
        }
    });

    var WorkspaceSelectDropdownLayoutView = Backbone.Marionette.LayoutView.extend({
        className: 'dropdown',
        template: Handlebars.compile([
            '<button type="button" class="btn btn-primary dropdown-toggle workspace-select-dropdown-button-text-region{{#if currentScreen.predefined}} no-button-to-right{{else}}{{#if currentScreen.nonPatientCentricView}} no-button-to-right{{/if}}{{/if}}" data-toggle="dropdown" aria-expanded="false"></button>',
            '<ul class="dropdown-menu"></ul>'
        ].join('\n')),
        ui: {
            'DropdownToggleButton': 'button.workspace-select-dropdown-button-text-region',
            'DropdownMenu': 'ul.dropdown-menu'
        },
        regions: {
            'WorkspaceSelectDropdownButtonTextRegion': '@ui.DropdownToggleButton',
            'WorkspaceSelectDropdownMenuRegion': '@ui.DropdownMenu'
        },
        events: {
            'focusout.dropdown.data-api @ui.DropdownMenu': function(e) {
                e.stopImmediatePropagation();
                this.ui.DropdownMenu.attr('aria-expanded', 'false');
            },
            'shown.bs.dropdown': function(e) {
                e.stopImmediatePropagation();
                this.dropdownMenuView.$('[role=menuitem]').first().focus();
            },
            'hidden.bs.dropdown': function(e) {
                e.stopImmediatePropagation();
                this.ui.DropdownMenu.attr('aria-expanded', 'false');
            },
            'keydown @ui.DropdownToggleButton': function(e) {
                if (e.which === 32) {
                    e.stopImmediatePropagation();
                    this.ui.DropdownToggleButton.trigger('click');
                }
            }
        },
        initialize: function(options) {
            this.currentScreenModel = options.currentScreenModel;
            this.originalCollection = options.originalCollection;
            this.dropdownButtonTextView = new WorkspaceSelectDropdownButtonTextView({
                model: this.currentScreenModel
            });
            this.dropdownMenuView = new WorkspaceSelectDropdownCompositeView({
                currentScreenModel: this.model,
                collection: this.collection,
                originalCollection: this.originalCollection
            });
        },
        onBeforeShow: function() {
            this.showChildView('WorkspaceSelectDropdownButtonTextRegion', this.dropdownButtonTextView);
            this.showChildView('WorkspaceSelectDropdownMenuRegion', this.dropdownMenuView);
        }
    });

    var WorkspaceEditorButton = Backbone.Marionette.ItemView.extend({
        template: WorkspaceEditorButtonTemplate,
        ui: {
            'WorkspaceEditorButton': '.workspace-editor-trigger-button'
        },
        events: {
            'click @ui.WorkspaceEditorButton': 'openAddApplets'
        },
        initialize: function(options) {
            this.listenTo(this.model, 'change', function() {
                if ('userDefined' in this.model.changed || 'nonPatientCentricView' in this.model.changed) {
                    this.render();
                    this.triggerMethod('toggle:standalone:class');
                }
            });
        },
        openAddApplets: function(e) {
            this.triggerMethod('open:add:applets');
        }
    });

    var WorkspaceSelectLayoutView = Backbone.Marionette.LayoutView.extend({
        template: WorkspaceContainerTemplate,
        className: 'WorkspaceSelectContainer',
        regions: {
            'WorkspaceManagerButtonRegion': '.workspace-manager-button-region',
            'WorkspaceSelectDropdownRegion': '.workspace-select-dropdown-region',
            'WorkspaceEditorButtonRegion': '.workspace-editor-button-region'
        },
        childEvents: {
            'open:workspace:manager': function(child) {
                this.openWorkspaceManager();
            },
            'open:add:applets': function(child) {
                this.openAddApplets();
            },
            'toggle:standalone:class': function(child) {
                if (!child.model.get('predefined') && !child.model.get('nonPatientCentricView')) {
                    this.workspaceSelectDropdownView.ui.DropdownToggleButton.removeClass('no-button-to-right');
                } else {
                    this.workspaceSelectDropdownView.ui.DropdownToggleButton.addClass('no-button-to-right');
                }
            }
        },
        initialize: function(options) {
            // sets collection
            this.collection = this.getOption('collection') || new Backbone.Collection();
            this.originalCollection = this.getOption('originalCollection') || new Backbone.Collection();
            this.listenToOnce(this.collection, 'change', this.updateCurrentScreenModel);
            this.updateWorkspaceList();
            this.listenTo(ADK.Messaging, 'close:workspaceManager', this.updateWorkspaceList);

            this.currentScreenModel = new CurrentScreenModel();

            // Update the current screen model once on init to pick up the default screen model attributes
            this.updateCurrentScreenModel();

            this.workspaceManagerButtonView = new WorkspaceManagerButton();
            this.workspaceSelectDropdownView = new WorkspaceSelectDropdownLayoutView({
                model: this.model,
                currentScreenModel: this.currentScreenModel,
                collection: this.collection,
                originalCollection: this.originalCollection
            });
            this.workspaceEditorButtonView = new WorkspaceEditorButton({
                model: this.currentScreenModel
            });

            this.listenTo(this.model, 'change:currentScreen', function() {
                // this needs to be called upon each change of screen unless we go to a global collection
                this.updateWorkspaceList();
                this.updateCurrentScreenModel();
            });
        },
        onBeforeShow: function() {
            this.showChildView('WorkspaceManagerButtonRegion', this.workspaceManagerButtonView);
            this.showChildView('WorkspaceEditorButtonRegion', this.workspaceEditorButtonView);
            this.showChildView('WorkspaceSelectDropdownRegion', this.workspaceSelectDropdownView);
        },
        openWorkspaceManager: function(event) {
            var channel = Messaging.getChannel('workspaceManagerChannel');
            channel.trigger('workspaceManager');
        },
        openAddApplets: function() {
            var channel = Messaging.getChannel('addAppletsChannel');
            channel.trigger('addApplets');
        },
        updateCurrentScreenModel: function() {
            /** TODO: remove check to hide the Plus Button when
             * WorkspaceManager is smart enough to allow only applets
             * that are associated with a screen or applet type
             **/
            // this can be cleaned up once workspace uses a shared collection
            var screenTitle = "",
                currentScreen = this.model.get('currentScreen') || {};

            if (currentScreen.id === "record-search") {
                screenTitle = "Search Record";
            } else if (currentScreen.id.indexOf("-full") > -1) {
                screenTitle = _.isArray(currentScreen.applets) && !_.isUndefined(currentScreen.applets[0]) ? currentScreen.applets[0].title || "" : "";
            } else {
                var predefinedScreenConfigForCurrentScreen = this.collection.find(function(model) {
                    return model.get('id') == currentScreen.id;
                }, this) || new Backbone.Model();
                screenTitle = predefinedScreenConfigForCurrentScreen.get("title") || "";
            }

            this.currentScreenModel.set({
                predefined: currentScreen.predefined || false,
                currentScreenTitle: screenTitle,
                nonPatientCentricView: this.model.get('nonPatientCentricView') ||
                    (_.isBoolean(this.model.get("currentScreen").nonPatientCentricView) && this.model.get("currentScreen").nonPatientCentricView ? this.model.get("currentScreen").nonPatientCentricView : false),
                userDefined: (!currentScreen.predefined && (currentScreen.contentRegionLayout === 'gridster'))
            });
        },
        updateWorkspaceList: function() {
            // this should be updated when global collection integration occurs
            UserDefinedScreens.getScreensConfig().done(function(screensConfig) {
                if (!_.isEqual(this.lastScreensConfig, screensConfig)) {
                    this.collection.set(screensConfig.screens);
                    this.originalCollection.set(this.collection.models);
                    this.lastScreensConfig = screensConfig;
                }
            }.bind(this));
        }
    });

    return WorkspaceSelectLayoutView;
});