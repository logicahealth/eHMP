define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars',
    'app/applets/workspaceManager/list/associationCounterView',
    'app/applets/workspaceManager/list/problems/associationManagerView',
    'hbs!app/applets/workspaceManager/list/screenEditorRow',
    'app/applets/workspaceManager/list/row_cells/defaultButton',
    'app/applets/workspaceManager/list/row_cells/workspaceTitle',
    'app/applets/workspaceManager/list/row_cells/workspaceDescription',
    'app/applets/workspaceManager/list/row_cells/previewButton',
    'app/applets/workspaceManager/list/row_cells/customizeButton',
    'app/applets/workspaceManager/list/row_cells/launchButton'
], function(
    _,
    Backbone,
    Marionette,
    Handlebars,
    AssociationCounterView,
    AssociationManagerView,
    RowTemplate,
    DefaultWorkspaceButton,
    WorkspaceTitle,
    WorkspaceDescription,
    PreviewButton,
    CustomizeButton,
    LaunchButton
) {
    'use strict';

    var generateRandomScreenId = function(screenId, screensConfig) {
        return _.find(screensConfig.screens, function(screen) {
            return screen.screenId === screenId;
        });
    };

    var generateScreenId = function(screenTitle) {
        var newId = screenTitle.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase().replace(/\s+/g, '-');
        var newScreenId = _.random(1048576);
        var screensConfig = ADK.UserDefinedScreens.getScreensConfigFromSession();
        var screenIdUnique = false;
        while (!screenIdUnique) {
            if (generateRandomScreenId(newScreenId, screensConfig)) {
                newScreenId = _.random(1048576);
            } else {
                screenIdUnique = true;
            }
        }
        var newScreen = {
            newId: newId,
            newScreenId: newScreenId
        };

        var idExists = _.find(screensConfig.screens, function(screen) {
            return screen.id === newId;
        });

        if (!idExists) {
            return newScreen;
        } else {
            console.error('Cannot create a screen ID that already exists: ' + newId);
        }
    };

    var Row = Backbone.Marionette.LayoutView.extend({
        template: RowTemplate,
        templateHelpers: function() {
            return {
                getCopyTitle: 'Press enter to copy ' + (this.model.get('title') || 'this workspace') + '.',
                getDeleteTitle: 'Press enter to open the dialog to delete ' + (this.model.get('title') || 'this workspace') + '.'
            };
        },
        attributes: function() {
            return {
                class: 'table-row tableRow ' + (this.model.get('predefined') ? 'predefined-screen-row' : 'user-defined'),
                'data-screen-id': this.model.get('id'),
                role: 'row'
            };
        },
        events: {
            'click .rearrange-worksheet': 'rearrangeWorksheet',
            'blur .rearrange-worksheet': 'captureFocus',
            'click .duplicate-worksheet': 'clone',
            'click .delete-worksheet': 'delete'
        },
        modelEvents: {
            'change:problems': 'saveAssociationChange'
        },
        defaultScreenModelEvents: {
            'change:defaultScreenId': function(model, value) {
                // only use unset if you want to clean it up..
                var isDefault = this._isDefault(value);
                this.model.set('default', isDefault, {
                    unset: !isDefault
                });
            }
        },
        saveLastFocus: function() {
            var titleSelector = '.editor-title-element';
            var descriptionSelector = '.editor-description-element';
            var lastFocusElement = '[data-screen-id="' + this.model.get('id') + '"] ';
            var titleHasFocus = this.$(titleSelector).is(':focus');
            var descriptionHasFocus = this.$(descriptionSelector).is(':focus');

            if (titleHasFocus) {
                lastFocusElement = lastFocusElement + titleSelector;
            } else if (descriptionHasFocus) {
                lastFocusElement = lastFocusElement + descriptionSelector;
            } else {
                lastFocusElement = null;
            }
            return this.triggerMethod('set:last:focus:element', lastFocusElement);
        },
        userDefinedScreensEvents: {
            'save:success': function() {
                this.model.set('savingWorkspace', false);
                this.trigger('saved');
            }
        },
        childEvents: {
            'click:default': function(child) {
                this.triggerMethod('click:makeDefault');
            },
            'save:change:title': function(child, newTitle) {
                var origValue = child.originalValue;
                var origId = this.screenOptions.id;
                this.cleanupPopover();
                if (newTitle.toLowerCase() !== origValue.toLowerCase()) {
                    newTitle = this.processTitleChange(newTitle);
                }
                var newScreen = generateScreenId(newTitle);
                this.screenOptions.id = newScreen.newId;
                if (_.isEmpty(this.screenOptions.screenId)) {
                    this.screenOptions.screenId = newScreen.newScreenId;
                }
                this.screenOptions.title = newTitle;
                this.screenOptions.routeName = newScreen.newId;
                this.model.set({
                    id: this.screenOptions.id,
                    title: this.screenOptions.title,
                    routeName: this.screenOptions.routeName
                });
                this.saveLastFocus();
                ADK.ADKApp.ScreenPassthrough.editScreen(this.screenOptions, origId);
                this.listenToOnce(ADK.UserDefinedScreens, 'save:success', function() {
                    child.updateValue(newTitle);
                    this.$el.attr({
                        'data-screen-id': newScreen.newId
                    });
                    this.createPopover();
                });
            },
            'save:change:description': function(child, newDescription) {
                var origId = this.screenOptions.id;
                this.screenOptions.description = newDescription;
                this.model.set('description', this.screenOptions.description);

                this.saveLastFocus();
                ADK.ADKApp.ScreenPassthrough.editScreen(this.screenOptions, origId);
            },
            saving: function() {
                this.trigger('saving');
            }
        },
        regions: {
            defaultWorkspaceButtonRegion: '.default-workspace-btn-region',
            workspaceTitleRegion: '.workspace-title-region',
            associationCounterRegion: '.associations-counter-region',
            workspaceDescriptionRegion: '.workspace-description-region',
            previewWorkspaceRegion: '.preview-workspace-container',
            customizeWorkspaceRegion: '.customize-screen-container',
            launchWorkspaceRegion: '.launch-screen-container'
        },
        initialize: function() {
            this.defaultScreenModel = this.getOption('defaultScreenModel');
            this.bindEntityEvents(this.defaultScreenModel, this.defaultScreenModelEvents);
            this.bindEntityEvents(ADK.UserDefinedScreens, this.userDefinedScreensEvents);
            var attrs = ['id', 'screenId', 'routeName', 'title', 'description', 'predefined', 'hasCustomize', 'problems', 'author'];
            this.screenOptions = this.model.pick(attrs);
            this.screenOptions.problems = _.clone(this.screenOptions.problems) || [];
            var id = this.model.get('id');
            var module = ADK.ADKApp.Screens[id];
            var config = ADK.UserDefinedScreens.getGridsterConfigFromSession(id);
            var predefined = this.model.get('predefined');
            var hasApplets = false;
            var isDocumentsList;
            if (predefined && !!_.get(module, 'applets.length')) {
                hasApplets = true;
            }
            if (predefined === false && !!_.get(config, 'applets.length')) {
                hasApplets = true;
            }
            if (this.model.get('screenId') === 'documents-list') {
                isDocumentsList = true;
            }
            this.model.set({
                'hasApplets': hasApplets,
                'documents-list': isDocumentsList,
                'default': this._isDefault(this.defaultScreenModel.get('defaultScreenId'))
            });
        },
        onRender: function() {
            this.showChildView('defaultWorkspaceButtonRegion', new DefaultWorkspaceButton({
                model: this.model
            }));
            this.showChildView('workspaceTitleRegion', new WorkspaceTitle({
                model: this.model
            }));
            this.showChildView('associationCounterRegion', new AssociationCounterView({
                model: this.model
            }));
            this.showChildView('workspaceDescriptionRegion', new WorkspaceDescription({
                model: this.model
            }));
            this.showChildView('previewWorkspaceRegion', new PreviewButton({
                model: this.model
            }));
            this.showChildView('customizeWorkspaceRegion', new CustomizeButton({
                model: this.model
            }));
            this.showChildView('launchWorkspaceRegion', new LaunchButton({
                model: this.model
            }));
            this.createPopover();
        },
        _isDefault: function(currentDefault) {
            return _.isEqual(this.model.get('id'), currentDefault);
        },
        createPopover: function() {
            var self = this;
            var associationsPopoverTrigger = this.$('.show-associations[data-toggle="popover"]');

            var globalClickHandler = function(e) {
                if (self.$(e.target).closest('.popover').length === 0) { //ignore clicks inside the popover
                    // there was a click outside the popover, so hide the popover
                    var isTrigger = self.$(e.target).closest('[data-toggle="popover"]').is(associationsPopoverTrigger);
                    if (!isTrigger) { // ignore clicks on the trigger elem - let bootstrap handle those
                        associationsPopoverTrigger.click();
                    }
                }
            };
            var popoverKeyupHandler = function(e) {
                var isEscKey = (e.type === 'keyup' && e.keyCode === 27 ? true : false);
                if (isEscKey) {
                    e.stopPropagation();
                    associationsPopoverTrigger.click();
                    associationsPopoverTrigger.focus();
                }
            };

            var closeButtonHandler = function(e) {
                if (_.get(e, 'target.id') === 'associationManagerCloseBtn') {
                    e.stopPropagation();
                    associationsPopoverTrigger.click();
                    associationsPopoverTrigger.focus();
                }
            };

            associationsPopoverTrigger.popup({
                container: '[data-screen-id="' + self.screenOptions.id + '"]',
                placement: _.bind(this.getPopoverPlacement, this, associationsPopoverTrigger),
                halign: 'left',
                // Title is not displayed, but is needed to prevent the content function from being called twice.
                // This is a known issue in bootstrap 3: https://github.com/twbs/bootstrap/issues/12563
                title: 'Title',
                delay: 0,
                animation: false,
                content: function() {
                    self.associationManagerView = new AssociationManagerView({
                        model: self.model
                    });
                    self.associationManagerView.render();
                    return self.associationManagerView.$el;
                },
                template: '<div class="popover association-manager-popover" aria-live="polite"><div class="popover-content"></div></div>',
            });
            associationsPopoverTrigger.on('shown.bs.popover', function(e) {
                self.associationManagerView.trigger('show');

                // hide the popover on the next click outside the popover
                $('html').on('click.workspaceCollectionViewPopover', globalClickHandler);

                // close the popover when escape is pressed
                self.$('.association-manager-popover').on('keyup.workspaceCollectionViewPopover', popoverKeyupHandler);

                //close button
                self.$('.association-manager-popover').on('click.associationManagerCloseBtn', closeButtonHandler);

                associationsPopoverTrigger.addClass('active')
                    .attr('aria-expanded', true);
            });

            associationsPopoverTrigger.on('hide.bs.popover', function(e) {
                $('html').off('click.workspaceCollectionViewPopover');
                self.$('.association-manager-popover').off('keyup.workspaceCollectionViewPopover');
                self.$('.association-manager-popover').off('click.associationManagerCloseBtn');
                self.cleanupAssociationManager();
                associationsPopoverTrigger.removeClass('active')
                    .attr('aria-expanded', false);
            });
        },
        getPopoverPlacement: function(associationsPopoverTrigger) {
            associationsPopoverTrigger = associationsPopoverTrigger || this.$('[data-toggle="popover"]');
            var placement = 'bottom';
            var popoverTop = associationsPopoverTrigger.offset().top + associationsPopoverTrigger.outerHeight();
            if (popoverTop + 250 > window.innerHeight) {
                placement = 'top';
            }
            return placement;
        },
        rearrangeWorksheet: function() {
            if (this.$el.hasClass('rearrange-row')) {
                //toggling off the selected workspace row
                this.$el.removeClass('rearrange-row');
                this.triggerMethod('click:setWorkspaceOrderSR');
            } else {
                //toggling off a different workspace row
                this.$el.closest('#list-group').find('.rearrange-row').removeClass('rearrange-row');
                this.$el.addClass('rearrange-row');
                this.$('.rearrange-worksheet').focus();
            }
        },
        captureFocus: function() {
            if (this.$el.hasClass('rearrange-row')) {
                this.$('.rearrange-worksheet').focus();
            }
        },
        clone: function(event) {
            this.triggerMethod('clone:screen', event);
        },
        delete: function() {
            this.triggerMethod('delete:screen');
        },
        saveAssociationChange: function() {
            if (!this.screenOptions.predefined) {
                var newProblems = this.model.get('problems') || [];
                var currentProblems = this.screenOptions.problems || [];
                var changed = false;
                if (newProblems.length !== currentProblems.length) {
                    changed = true;
                } else {
                    for (var i = 0; i < currentProblems.length && !changed; i++) {
                        if (currentProblems[i].snomed !== newProblems[i].snomed) {
                            changed = true;
                        }
                    }
                }
                if (changed) {
                    this.screenOptions.problems = this.model.get('problems');
                    this.save(this.screenOptions.id);
                }
            }
        },
        save: function(screenId) {
            ADK.ADKApp.ScreenPassthrough.editScreen(this.screenOptions, screenId);
        },
        processTitleChange: function(title) {
            var loop = true;
            var newTitle = title;
            while (loop) {
                if (ADK.ADKApp.ScreenPassthrough.titleExists(newTitle)) {
                    var split = newTitle.split(' ');
                    var counter = isNaN(split[split.length - 1]) ? 2 : parseInt(split[split.length - 1]) + 1;
                    if (counter !== 2) {
                        split.length = split.length - 1;
                    }
                    newTitle = split.join(' ') + ' ' + counter;
                } else {
                    loop = false;
                }
            }
            return newTitle;
        },
        onBeforeDestroy: function() {
            this.cleanupPopover();
            this.cleanupAssociationManager();
            this.unbindEntityEvents(this.defaultScreenModel, this.defaultScreenModelEvents);
            this.unbindEntityEvents(ADK.UserDefinedScreens, this.userDefinedScreensEvents);
        },
        cleanupAssociationManager: function() {
            if (this.associationManagerView) {
                this.associationManagerView.destroy();
            }
        },
        cleanupPopover: function() {
            var $popover = this.$('.show-associations[data-toggle="popover"]');
            $popover.off('shown.bs.popover');
            $popover.off('hide.bs.popover');
            $popover.popover('destroy');
        },
        behaviors: {
            Tooltip: {}
        }
    });

    return Row;
});