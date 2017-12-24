/* global ADK */
define([
    'underscore',
    'jquery',
    'backbone',
    'app/applets/addApplets/list/appletSelectionSlider',
    'app/applets/addApplets/list/appletLayoutFooter',
    'app/applets/addApplets/list/appletLayoutFilter',
    'app/applets/addApplets/list/gridsterCollectionView',
    'hbs!app/applets/addApplets/templates/appletEditor'
], function(_, $, Backbone, AppletSelectionSlider, FooterView, FilterView, GridsterView, template) {
    'use strict';


    return Backbone.Marionette.LayoutView.extend({
        behaviors: {
            HelpLink: {
                mapping: 'workspace_editor',
                container: '.help-button-container'
            }
        },

        template: template,

        regions: {
            appletSlider: '.applet-tray',
            gridsterRegion: '#gridster2',
            footer: '.add-applets--footer-region',
            filter: '#workspace-editor-filter'
        },

        ui: {
            editorFilter: '#workspace-editor-filter',
            optionsBox: '.options-box'
        },

        events: {
            'keydown @ui.optionsBox': 'handleSpacebarOrEnter',
            'shown.bs.collapse @ui.editorFilter': 'focusFilter'
        },

        channelEvents: {
            addAppletToGridster: '_addAppletToGridster',
            addAppletPlaceholder: 'addAppletPlaceholder'
        },

        childEvents: {
            'save': '_saveGridster',
            'click:switchboard': '_saveLatentSwitchBoards',
            'filter:change': 'onFilterChange',
            'boundary:width': 'setBoundaryWidth'
        },

        setBoundaryWidth: function(childView, width) {
            this.$('.boundary-indicator').css('width', width);
        },

        templateHelpers: function() {
            return {
                'screenTitle': _.get(this, 'screenConfig.title', 'Title Unavailable')
            };
        },

        initialize: function() {
            var screenModule = ADK.ADKApp.Screens[Backbone.history.fragment.split('/').pop()];
            var screensConfig = ADK.UserDefinedScreens.getScreensConfigFromSession();

            this.rightmostWidgetGrid = undefined;
            this.model = new Backbone.Model();
            this.screenConfig = _.findWhere(screensConfig.screens, {
                id: screenModule.id
            });

            this.bindEntityEvents(ADK.Messaging.getChannel('addApplets'), this.channelEvents);
            this.loadConfiguration();
        },

        onBeforeShow: function() {
            var slider = this.getRegion('appletSlider');
            var gridster = this.getRegion('gridsterRegion');
            var footer = this.getRegion('footer');
            var filter = this.getRegion('filter');

            var sliderView = new AppletSelectionSlider();
            var gridsterView = new GridsterView({
                screenId: this.screenConfig.id,
                isEditor: true
            });
            var footerView = new FooterView({
                screenConfig: this.screenConfig
            });
            var filterView = new FilterView();

            slider.show(sliderView);
            gridster.show(gridsterView);
            footer.show(footerView);
            filter.show(filterView);
        },

        onBeforeDestroy: function() {
            this.unbindEntityEvents(ADK.Messaging.getChannel('addApplets'), this.channelEvents);
        },

        loadConfiguration: function() {
            var appConfig = new Backbone.Model();
            appConfig.fetch({
                url: 'app.json',
                async: false
            });
        },

        handleSpacebarOrEnter: function(event) {
            if (event.which === $.ui.keyCode.ENTER || event.which === $.ui.keyCode.SPACE) {
                event.preventDefault();
                event.stopPropagation();
                this.$(event.target).click();
                return false;
            }
        },

        onFilterChange: function(view, text) {
            this.appletSlider.currentView.filterApplets(text);
        },

        focusFilter: function() {
            this.filter.currentView.focusInput();
        },

        addAppletToGridster: function(appletId, title) {
            if (!this.isSwitchboardDisplayed()) {
                var gridsterRegion = this.getRegion('gridsterRegion');
                gridsterRegion.currentView.createWidget(appletId, title);
            }
            this.rightmostWidgetGrid = undefined;
        },

        addAppletPlaceholder: function() {
            var gridster = this.getRegion('gridsterRegion').currentView;
            gridster.addPlaceHolder();
        },

        _saveGridster: function() {
            this._saveLatentSwitchBoards();
            this.saveGridsterAppletsConfig(true);
        },

        _saveLatentSwitchBoards: function() {
            var gridster =  this.getRegion('gridsterRegion').currentView;
            if(gridster) {
                gridster.children.each(function(child) {
                    var regions = _.result(child, 'regionManager.getRegions', {});
                    var switchBoard = _.get(regions, 'switchBoard.currentView');
                    if(switchBoard) {
                        switchBoard.$('.options-panel li:first>button').click();
                    }
                });
            }
        },

        _addAppletToGridster: function(params) {
            var appletId = params.appletId;
            var appletTitle = params.appletTitle;
            this.addAppletToGridster(appletId, appletTitle);
        },

        isSwitchboardDisplayed: function() {
            var gridster = this.getRegion('gridsterRegion');
            var view = _.get(gridster, 'currentView', false);
            if (view) {
                return view.isSwitchboardOpen();
            }
            return false;
        },

        saveGridsterAppletsConfig: function() {
            var screen = ADK.ADKApp.currentScreen.id;
            var originalConfig = ADK.ADKApp.Screens[screen].config;
            var gridster = this.getRegion('gridsterRegion').currentView;
            var applets = gridster.getConfig();
            var config = _.extend({}, originalConfig, {applets: applets});

            this.listenToOnce(ADK.UserDefinedScreens, 'save:error', this._saveError);
            this.listenToOnce(ADK.UserDefinedScreens, 'save:success', this._saveSuccess);

            ADK.UserDefinedScreens.saveGridsterConfig(config, screen);
        },

        _saveError: function() {
            var error = new ADK.UI.Notification({
                title: 'Error',
                message: 'Failed to save workspace',
                type: 'danger'
            });
            error.show();
            this._saveCompete();
        },

        _saveSuccess: function() {
            var success = new ADK.UI.Notification({
                title: 'Success',
                message: 'Workspace Updated',
                type: 'success'
            });
            success.show();
            this._saveCompete();
        },

        _saveCompete: function() {
            this.stopListening(ADK.UserDefinedScreens, 'save:success');
            this.stopListening(ADK.UserDefinedScreens, 'save:error');
            ADK.UI.FullScreenOverlay.hide();
            ADK.Navigation.navigate(ADK.ADKApp.currentScreen.id);
            $('.workspace-editor-trigger-button').focus();
        }
    });
});