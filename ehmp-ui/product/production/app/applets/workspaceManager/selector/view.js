define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/workspaceManager/selector/templates/selectDropdown',
    'hbs!app/applets/workspaceManager/selector/templates/menuItem',
    'hbs!app/applets/workspaceManager/selector/templates/selectDropdownToggleButton'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    WorkspaceSelectTemplate,
    WorkSpaceSelectMenuItemTemplate,
    WorkspaceSelectDropdownToggleButtonTemplate
) {
    'use strict';

    var CurrentScreenModel = Backbone.Model.extend({
        defaults: {
            currentWorkspaceTitle: "",
            predefined: false
        }
    });

    var WorkspaceSelectDropdownItemView = Backbone.Marionette.ItemView.extend({
        template: WorkSpaceSelectMenuItemTemplate,
        tagName: 'li',
        className: 'list-group-item',
        attributes: {
            role: 'menuitem'
        },
        ui: {
            'WorkspaceLink': 'a.workspace-navigation-link'
        },
        events: {
            'click @ui.WorkspaceLink': 'navigateToNewScreen',
        },
        sessionUserEvents: {
            'change:preferences:defaultScreen': 'render'
        },
        initialize: function() {
            var user = ADK.UserService.getUserSession();
            this.bindEntityEvents(user, this.sessionUserEvents);
        },
        onDestroy: function() {
            var user = ADK.UserService.getUserSession();
            this.unbindEntityEvents(user, this.sessionUserEvents);
        },
        navigateToNewScreen: function(e) {
            e.preventDefault();
            // Reset CRS highlighting
            ADK.utils.crsUtil.removeStyle(this);
            this.triggerMethod('navigate:new:screen');
        },
        templateHelpers: function() {
            return {
                'currentWorkspace': function() {
                    return ADK.WorkspaceContextRepository.currentWorkspaceAndContext.get('workspace') === this.routeName;
                },
                'defaultScreen': function () {
                    return this.id === ADK.WorkspaceContextRepository.currentContextDefaultScreen;
                }
            };
        }
    });

    var WorkspaceSelectDropdownCompositeView = Backbone.Marionette.CompositeView.extend({
        template: WorkspaceSelectTemplate,
        className: 'dropdown-menu dropdown-complex',
        ui: {
            'DropdownMenuItemsContainer': '.dropdown-body',
            'ClearFilterButton': 'button.btn-icon',
            'FilterInput': 'input'
        },
        events: {
            'submit' :function(e) {
                e.preventDefault();
            },
            'click @ui.ClearFilterButton': function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.resetMenuItems();
                this.$el.find('#dropdownSearchElement').focus();
            },
            'keydown @ui.FilterInput': function(e) {
                if (e.which === 32) {
                    e.stopPropagation();
                } else if (e.which === 40) {
                    e.preventDefault();
                    this.$('.dropdown-body li:first a').focus();
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
            },
            'click #workspaceNavigationManagerButton': function(e){
                var channel = ADK.Messaging.getChannel('workspaceManagerChannel');
                channel.trigger('workspaceManager');
            }
        },
        childViewContainer: '@ui.DropdownMenuItemsContainer',
        childView: WorkspaceSelectDropdownItemView,
        emptyView: Backbone.Marionette.ItemView.extend({
            template: _.template('<p class="left-padding-sm top-margin-sm">No workspaces found.</p>'),
            tagName: 'li',
            attributes: {
                "aria-live":"assertive"
            }
        }),
        childEvents: {
            'navigate:new:screen': function(child) {
                this.navigate(child);
                this.ui.FilterInput.val('');
                this.hideFilterButton();
            }
        },
        filter: function(child) {
            var workspace = ADK.WorkspaceContextRepository.workspaces.get(child.id);
            if (_.isUndefined(workspace)) {
                // If something went wrong with WCR, it's better to show it(expose the bug) than to not show it
                return true;
            }
            return workspace.shouldShowInWorkspaceSelector();
        },
        initialize: function(options) {
            this.originalCollection = options.originalCollection;
            this.currentWorkspaceModel = options.currentWorkspaceModel;
            this.listenTo(ADK.Messaging, 'screen:navigate', function() {
                this.resetMenuItems();
                this.updateForCurrentScreen();
            });
        },
        onRenderCollection: function() {
            this.updateForCurrentScreen();
        },
        navigate: function(child) {
            var href = '#' + child.model.get('routeName');
            ADK.Navigation.navigate(href);
            this.render();
            this.$el.parents().closest('.dropdown').children('button').focus();
        },
        resetMenuItems: function() {
            this.collection.set(this.originalCollection.models);
            this.hideFilterButton();
            this.updateForCurrentScreen();
        },
        hideFilterButton: function() {
            if (!this.ui.ClearFilterButton.hasClass('hidden')) {
                this.ui.ClearFilterButton.addClass('hidden');
                this.ui.FilterInput.val('');
            }
        },
        updateForCurrentScreen: function() {
            var currentWorkspaceID = this.currentWorkspaceModel.get('currentWorkspace').id;
            var currentWorkspaceMenuItem = this.children.find(function(child) {
                return child.model.get('id') == currentWorkspaceID;
            });
            this.$('li.active').removeClass('active');
            if (currentWorkspaceMenuItem) {
                // will not enter if correct child is filtered out
                currentWorkspaceMenuItem.$el.addClass('active');
            }
        }
    });

    var WorkspaceSelectDropdownButtonTextView = Backbone.Marionette.ItemView.extend({
        template: WorkspaceSelectDropdownToggleButtonTemplate,
        initialize: function(options) {
            this.listenTo(this.model, 'change:currentWorkspaceTitle', this.render);
        }
    });

    var WorkspaceSelectDropdownLayoutView = Backbone.Marionette.LayoutView.extend({
        className: 'btn-group workspace-selector left-padding-xs',
        template: Handlebars.compile([
            '<div class="dropdown">',
            '<button type="button" class="btn btn-primary dropdown-toggle workspace-dropdown-button workspace-manager-btn" ',
            'title="Press enter to open the workspace navigation drop down." ',
            'data-toggle="dropdown" aria-expanded="false"></button>',
            '<div class="dropdown-menu-container"></div>',
            '</div>'
        ].join('\n')),
        ui: {
            'DropdownToggleButton': 'button.workspace-dropdown-button',
            'DropdownMenu': '.dropdown-menu-container'
        },
        regions: {
            'WorkspaceSelectDropdownButtonTextRegion': '@ui.DropdownToggleButton',
            'WorkspaceSelectDropdownMenuRegion': '@ui.DropdownMenu'
        },
        events: {
            'shown.bs.dropdown': function(e) {
                e.stopImmediatePropagation();
                this.ui.DropdownMenu.addClass('open');
                this.$('#dropdownSearchElement').focus();
            },
            'hidden.bs.dropdown': function(e) {
                e.stopImmediatePropagation();
                this.ui.DropdownMenu.removeClass('open');
                this.ui.DropdownMenu.attr('aria-expanded', 'false');
            },
            'blur @ui.DropdownToggleButton': function(e) {
                if(this.$('.dropdown').hasClass('open') && this.$(e.relatedTarget).length === 0) {
                    this.ui.DropdownToggleButton.trigger('click');
                }
            },
            'blur @ui.DropdownMenu': function(e) {
                if(this.$('.dropdown').hasClass('open') && _.isEmpty(this.$el.find(e.relatedTarget)) && e.relatedTarget !== null) {
                    this.ui.DropdownToggleButton.trigger('click');
                }
            }
        },
        initialize: function(options) {
            this.collection = new Backbone.Collection();
            this.originalCollection =  new Backbone.Collection();
            this.listenToOnce(this.collection, 'change', this.updateCurrentScreenModel);
            this.updateWorkspaceList();
            this.listenTo(ADK.Messaging, 'close:workspaceManager', this.updateWorkspaceList);

            this.currentWorkspaceModel = new CurrentScreenModel();

            // Update the current screen model once on init to pick up the default screen model attributes
            this.updateCurrentScreenModel();

            this.dropdownButtonTextView = new WorkspaceSelectDropdownButtonTextView({
                model: this.currentWorkspaceModel
            });
            this.dropdownMenuView = new WorkspaceSelectDropdownCompositeView({
                currentWorkspaceModel: this.currentWorkspaceModel,
                collection: this.collection,
                originalCollection: this.originalCollection
            });

            this.listenTo(ADK.WorkspaceContextRepository.currentWorkspaceAndContext, 'change:workspace', function() {
                // this needs to be called upon each change of screen unless we go to a global collection
                this.updateWorkspaceList();
                this.updateCurrentScreenModel();
            });

            this.listenTo(ADK.Messaging, 'workspace:change:currentWorkspaceTitle', function (newTitle) {
                this.currentWorkspaceModel.set('currentWorkspaceTitle', newTitle);
            });
        },
        onBeforeShow: function() {
            this.showChildView('WorkspaceSelectDropdownButtonTextRegion', this.dropdownButtonTextView);
            this.showChildView('WorkspaceSelectDropdownMenuRegion', this.dropdownMenuView);
        },
        updateCurrentScreenModel: function() {
            var screenTitle = "",
                currentWorkspace = ADK.WorkspaceContextRepository.currentWorkspace || {};

            if (currentWorkspace.id === "record-search") {
                screenTitle = "Search Record";
            } else if (currentWorkspace.get('id').indexOf("-full") > -1) {
                screenTitle = _.isArray(currentWorkspace.get('applets')) && !_.isUndefined(currentWorkspace.get('applets')[0]) ? currentWorkspace.get('applets')[0].title || "" : "";
            } else {
                var predefinedScreenConfigForCurrentScreen = this.originalCollection.find(function(model) {
                    return model.get('id') == currentWorkspace.get('id');
                }, this) || new Backbone.Model();
                screenTitle = predefinedScreenConfigForCurrentScreen.get("title") || "";
            }

            this.currentWorkspaceModel.set({
                currentWorkspace: currentWorkspace,
                predefined: currentWorkspace.get('predefined') || false,
                currentWorkspaceTitle: screenTitle,
                userDefined: (!currentWorkspace.get('predefined') && (currentWorkspace.get('contentRegionLayout') === 'gridster'))
            });
        },
        updateWorkspaceList: function() {
            // this should be updated when global collection integration occurs
            ADK.UserDefinedScreens.getScreensConfig().done(function(screensConfig) {
                if (!_.isEqual(this.lastScreensConfig, screensConfig)) {
                    this.collection.set(screensConfig.screens);
                    this.originalCollection.set(this.collection.models);
                    this.lastScreensConfig = screensConfig;
                }
            }.bind(this));
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "contextNavigationItem",
        group: ["patient", "patient-right", "staff", "admin"],
        key: "workspaceSelector",
        view: WorkspaceSelectDropdownLayoutView,
        orderIndex: 3
    });

    return WorkspaceSelectDropdownLayoutView;
});