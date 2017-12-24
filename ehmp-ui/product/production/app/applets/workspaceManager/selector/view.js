define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/workspaceManager/selector/templates/selectDropdown',
    'hbs!app/applets/workspaceManager/selector/templates/menuItem'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    WorkspaceSelectTemplate,
    WorkSpaceSelectMenuItemTemplate
) {
    'use strict';

    var CurrentScreenModel = Backbone.Model.extend({
        defaults: {
            currentContextTitle: "",
            currentWorkspaceTitle: "",
            predefined: false,
            showFilter: true
        }
    });

    var requestAnimationFrame = requestAnimationFrame || _.partialRight(setTimeout, 0);

    var WorkspaceSelectDropdownItemView = Backbone.Marionette.ItemView.extend({
        template: WorkSpaceSelectMenuItemTemplate,
        tagName: 'li',
        className: 'list-group-item prevent-default-styling',
        attributes: {
            role: 'presentation'
        },
        ui: {
            'WorkspaceLink': 'a.workspace-navigation-link'
        },
        events: {
            'click @ui.WorkspaceLink': 'navigateToNewScreen'
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
            this.$el.trigger('hidden.bs.dropdown');
            ADK.Messaging.trigger('obscure:content');
            requestAnimationFrame(function() {
                this.triggerMethod('navigate:new:screen');
                ADK.utils.crsUtil.removeStyle(this);
            }.bind(this));
        },
        templateHelpers: function() {
            return {
                'currentWorkspace': function() {
                    return ADK.WorkspaceContextRepository.currentWorkspaceAndContext.get('workspace') === this.routeName;
                },
                'defaultScreen': function() {
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
            'submit': function(e) {
                e.preventDefault();
            },
            'click @ui.ClearFilterButton': function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.resetMenuItems();
                this.ui.FilterInput.focus();
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
            'keydown .dropdown-body li:first a': function(e) {
                if (_.isEqual(e.which, 38) && this.model.get('showFilter')) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.ui.FilterInput.focus();
                }
            }
        },
        childViewContainer: '@ui.DropdownMenuItemsContainer',
        childView: WorkspaceSelectDropdownItemView,
        emptyView: Backbone.Marionette.ItemView.extend({
            template: _.template('<p class="left-padding-sm top-margin-sm" role="menuitem">No workspaces found.</p>'),
            tagName: 'li',
            attributes: {
                "aria-live": "assertive"
            }
        }),
        modelEvents: {
            'change:currentContextTitle': 'render'
        },
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
            var currentWorkspaceID = this.model.get('currentWorkspace').id;
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
        tagName: 'span',
        className: 'right-padding-xs transform-text-uppercase',
        attributes: {
            'id': 'screenName'
        },
        template: Handlebars.compile('<i class="fa fa-th-large" aria-hidden="true"></i> {{#if currentWorkspaceTitle}}{{currentWorkspaceTitle}}{{else}}Menu{{/if}}'),
        modelEvents: {
            'change:currentWorkspaceTitle': 'render'
        }
    });

    var WorkspaceContextTextView = Backbone.Marionette.ItemView.extend({
        tagName: 'span',
        template: Handlebars.compile('{{currentContextTitle}} Workspace:'),
        modelEvents: {
            'change:currentContextTitle': 'render'
        }
    });

    var WorkspaceSelectOptionsDropdownCollectioneView = Backbone.Marionette.CompositeView.extend({
        template: Handlebars.compile([
            '<button type="button" class="btn dropdown-toggle right-padding-xs left-padding-xs percent-height-100" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-original-title="Workspace Options">',
            '<i class="fa fa-lg fa-cog"></i><span class="sr-only">Workspace Options</span>',
            '</button>',
            '<ul class="dropdown-menu" role="menu"></ul>'
        ].join('\n')),
        className: 'dropdown dropdown--options btn-group',
        attributes: {
            role: 'group'
        },
        events: {
            'shown.bs.dropdown': 'transferFocusToFirstItem'
        },
        transferFocusToFirstItem: function() {
            this.$('ul a:first').focus();
        },
        childViewContainer: 'ul',
        behaviors: {
            Tooltip: {
                trigger: 'hover focus',
                selector: '> button'
            }
        },
        getChildView: function(item) {
            return item.get('view').extend({
                tagName: 'li',
                className: 'prevent-default-styling',
                attributes: {
                    role: 'presentation'
                }
            });
        },
        childViewOptions: function(model, index) {
            return {
                optionsButton: this.$('button.dropdown-toggle')[0]
            };
        },
        filter: function(child) {
            return child.isOfGroup('workspaceSelectorOption', ADK.WorkspaceContextRepository.currentContextId) && child.shouldShow();
        },
        hasItems: function() {
            return !_.isEmpty(this.collection.filter(this.filter));
        },
        resortView: function() {} // Turning off the rendering of children on a sort of the collection
    });

    var WorkspaceSelectDropdownLayoutView = Backbone.Marionette.LayoutView.extend({
        behaviors: function() {
            return {
                Tooltip: {},
                SkipLinks: {
                    items: [{
                        label: 'Workspace Navigation',
                        element: function() {
                            return this.$el;
                        },
                        rank: 1,
                        focusFirstTabbable: true
                    }]
                },
                FlexContainer: {
                    container: [{
                        container: true,
                        direction: 'row'
                    }, {
                        container: 'button > div ',
                        direction: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }, {
                        container: 'button',
                        direction: 'row',
                        alignItems: 'center'
                    }]
                }
            };
        },
        className: 'prevent-default-styling btn-group workspace-selector',
        template: Handlebars.compile([
            '<div class="dropdown dropdown--workspace btn-group" role="group">',
            '<button type="button" class="btn left-padding-sm dropdown-toggle workspace-dropdown-button workspace-manager-btn" ',
            'data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">',
            '<span class="context-name right-padding-xs"></span>',
            '<div>',
            '<span class="workspace-name"></span>',
            '<i class="fa fa-caret-down pull-right" aria-hidden="true"></i>',
            '</div>',
            '</button>',
            '<div class="dropdown-menu-container--workspaces"></div>',
            '</div>',
        ].join('\n')),
        ui: {
            'WorkspaceName': '.workspace-name',
            'ContextName': '.context-name',
            'WorkspaceDropdown': '.dropdown--workspace',
            'WorkspaceDropdownMenuContainer': '.dropdown-menu-container--workspaces',
            'WorkspaceDropdownToggleButton': '.workspace-dropdown-button'
        },
        regions: {
            'WorkspaceNameRegion': '@ui.WorkspaceName',
            'ContextNameRegion': '@ui.ContextName',
            'WorkspaceDropdownMenuRegion': '@ui.WorkspaceDropdownMenuContainer'
        },
        events: {
            'shown.bs.dropdown @ui.WorkspaceDropdown': function(e) {
                e.stopImmediatePropagation();
                this.ui.WorkspaceDropdownMenuContainer.addClass('open');
                this.$el.addClass('dropdown-menu-open');
                if (this.currentWorkspaceModel.get('showFilter')) {
                    this.$('#dropdownSearchElement').focus();
                } else {
                    this.ui.WorkspaceDropdownMenuContainer.find('.dropdown-body li:first a').focus();
                }
            },
            'hidden.bs.dropdown @ui.WorkspaceDropdown': function(e) {
                e.stopImmediatePropagation();
                this.ui.WorkspaceDropdownMenuContainer.removeClass('open');
                this.$el.removeClass('dropdown-menu-open');
                this.ui.WorkspaceDropdownMenuContainer.attr('aria-expanded', 'false');
            },
            'blur @ui.WorkspaceDropdownToggleButton': function(e) {
                if (this.$('.dropdown').hasClass('open') && this.$(e.relatedTarget).length === 0) {
                    this.ui.WorkspaceDropdownToggleButton.trigger('click');
                }
            },
            'blur @ui.WorkspaceDropdownMenuContainer': function(e) {
                if (this.$('.dropdown').hasClass('open') && _.isEmpty(this.$el.find(e.relatedTarget)) && e.relatedTarget !== null) {
                    this.ui.WorkspaceDropdownToggleButton.trigger('click');
                }
            }
        },
        initialize: function(options) {
            this.collection = new Backbone.Collection();
            this.originalCollection = new Backbone.Collection();
            this.currentWorkspaceModel = new CurrentScreenModel();
            this.listenToOnce(this.collection, 'change', this.updateCurrentScreenModel);
            this.updateWorkspaceList();
            this.listenTo(ADK.Messaging, 'close:workspaceManager', this.updateWorkspaceList);

            // Update the current screen model once on init to pick up the default screen model attributes
            this.updateCurrentScreenModel();

            this.dropdownButtonTextView = new WorkspaceSelectDropdownButtonTextView({
                model: this.currentWorkspaceModel
            });
            this.contextTextView = new WorkspaceContextTextView({
                model: this.currentWorkspaceModel
            });
            this.workspaceDropdownMenuView = new WorkspaceSelectDropdownCompositeView({
                model: this.currentWorkspaceModel,
                collection: this.collection,
                originalCollection: this.originalCollection
            });

            this.registeredComponentsCollection = ADK.Messaging.request('get:components');
            this.optionsDropdownMenuView = new WorkspaceSelectOptionsDropdownCollectioneView({
                collection: this.registeredComponentsCollection
            });

            this.currentContextAndWorkspace = ADK.WorkspaceContextRepository.currentWorkspaceAndContext;

            this.listenTo(this.currentContextAndWorkspace, 'change:workspace change:context', function() {
                // this needs to be called upon each change of screen unless we go to a global collection
                this.updateWorkspaceList();
                this.updateCurrentScreenModel();
            });
            this.listenTo(this.currentContextAndWorkspace, 'change:context', this.updateVisibility);

            this.listenTo(ADK.Messaging, 'workspace:change:currentWorkspaceTitle', function(newTitle) {
                this.currentWorkspaceModel.set('currentWorkspaceTitle', newTitle);
            });

            this.bindEntityEvents(ADK.UserDefinedScreens, this.userDefinedScreensEvents);
        },
        onAttach: function(){
            this.updateSkipLinkVisibility();
        },
        updateSkipLinkVisibility: function() {
            this.triggerMethod('toggle:skip:link', 'Workspace Navigation', !!ADK.WorkspaceContextRepository.currentContext.get('showWorkspaceSelector'));
        },
        updateVisibility: function() {
            var showWorkspaceSelector = ADK.WorkspaceContextRepository.currentContext.get('showWorkspaceSelector');
            if (showWorkspaceSelector) {
                this.$el.removeClass('hidden');
            } else {
                this.$el.addClass('hidden');
            }
            this.updateSkipLinkVisibility();
            this.toggleOptionsView();
        },
        onBeforeShow: function() {
            this.updateVisibility();
            this.showChildView('ContextNameRegion', this.contextTextView);
            this.showChildView('WorkspaceNameRegion', this.dropdownButtonTextView);
            this.showChildView('WorkspaceDropdownMenuRegion', this.workspaceDropdownMenuView);
            this.toggleOptionsView();
        },
        toggleOptionsView: function() {
            this.stopListening(this.registeredComponentsCollection, 'add');
            var hasItems = this.optionsDropdownMenuView.hasItems();
            if (!hasItems && !_.isEmpty(this.$('.dropdown--options'))) {
                this.el.removeChild(this.optionsDropdownMenuView.el);
            }
            this.showOptions(hasItems);
        },
        showOptions: function(shouldShow) {
            if (shouldShow) {
                this.optionsDropdownMenuView.render();
                this.el.appendChild(this.optionsDropdownMenuView.el);
            } else {
                this.listenTo(this.registeredComponentsCollection, 'add', function(componentModel) {
                    if (this.optionsDropdownMenuView.filter(componentModel)) {
                        this.showOptions();
                        this.stopListening(this.registeredComponentsCollection, 'add');
                    }
                });
            }
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
                currentContextTitle: _.capitalize(ADK.WorkspaceContextRepository.currentContextId),
                currentWorkspace: currentWorkspace,
                predefined: currentWorkspace.get('predefined') || false,
                currentWorkspaceTitle: screenTitle,
                userDefined: (!currentWorkspace.get('predefined') && (currentWorkspace.get('contentRegionLayout') === 'gridster')),
                showFilter: !ADK.WorkspaceContextRepository.currentContext.get('hideFilterInWorkspaceSelector')
            });
        },
        userDefinedScreensEvents: {
            'fetch:success': 'updateWorkspaceList',
            'clone:success': 'updateWorkspaceList',
            'save:success': 'updateWorkspaceList'
        },
        updateWorkspaceList: function(model) {
            var screensConfig = ADK.UserDefinedScreens.getScreensConfigFromSession();
            if (screensConfig && !_.isEqual(this.lastScreensConfig, screensConfig)) {
                this.collection.set(screensConfig.screens);
                this.originalCollection.set(this.collection.models);
                this.lastScreensConfig = screensConfig;
                this.updateCurrentScreenModel();
            }
        },
        onDestroy: function() {
            this.unbindEntityEvents(ADK.UserDefinedScreens, this.userDefinedScreensEvents);
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "applicationHeaderItem",
        group: ["left"],
        key: "workspaceSelector",
        view: WorkspaceSelectDropdownLayoutView,
        orderIndex: 20
    });

    return WorkspaceSelectDropdownLayoutView;
});
