define([
    'jquery',
    'underscore',
    'api/Messaging',
    'main/Utils',
    'api/Navigation',
    'api/ResourceService',
    'api/SessionStorage',
    'hbs!main/components/applet_chrome/templates/containerTemplate',
    'main/components/applet_chrome/views/addButtonView',
    'main/components/applet_chrome/views/optionsButtonView',
    'main/components/applet_chrome/views/refreshButtonView',
    'main/components/applet_chrome/views/resizeView',
    'main/components/applet_chrome/views/filterButtonView',
    'main/components/applet_chrome/views/helpButtonView',
    'main/components/applet_chrome/views/buttonCollectionView',
    'main/components/applet_chrome/views/notificationView',
    'main/api/WorkspaceFilters',
    'main/adk_utils/crsUtil'
], function(
    $,
    _,
    Messaging,
    Utils,
    Navigation,
    ResourceService,
    SessionStorage,
    containerTemplate,
    AddButtonView,
    OptionsButtonView,
    RefreshButtonView,
    ResizeView,
    FilterButtonView,
    HelpButtonView,
    ButtonCollectionView,
    NotificationView,
    WorkspaceFilters,
    CrsUtil
) {
    'use strict';


    function getAppletHelpKey(appletView) {
        var appletViewName = appletView.options.appletConfig.id;
        var viewType = appletView.options.appletConfig.viewType;
        if (viewType !== undefined) {
            appletViewName += '_' + viewType.replace('summary', 'standard');
        } else {
            appletViewName += '_' + appletView.options.appletConfig.fullScreen ? '_expanded' : 'standard';
        }
        return appletViewName;
    }

    function getHelpUrl(appletView) {
        var helpKey = getAppletHelpKey(appletView);
        return Utils.helpUtils.getUrl(helpKey);
    }

    function getHelpTooltip(appletView) {
        var helpKey = getAppletHelpKey(appletView);
        return Utils.helpUtils.getTooltip(helpKey);
    }
    var ButtonViewModel = Backbone.Model.extend({
        defaults: {
            'id': '',
            'view': undefined
        }
    });

    var MaximizedAppletModel = Backbone.Model.extend({
        defaults: {
            'instanceId': undefined,
            'workspaceId': undefined,
            'filterName': ''
        }
    });

    /*
     * options: {appletScreenConfig, AppletView, AppletController(optional)}
     */
    var ChromeLayoutView = Backbone.Marionette.LayoutView.extend({
        initialize: function(options) {
            this.buttonCollection = new Backbone.Collection();
            this.appletScreenConfig = this.appletScreenConfig || options.appletScreenConfig;
            var maximizedModel = ADK.Messaging.request('applet:maximized');
            if (!_.isUndefined(maximizedModel)) {
                this.appletScreenConfig.filterName = maximizedModel.get('filterName');
            }
            if (_.isUndefined(this.appletScreenConfig.filterName)) {
                this.appletScreenConfig.filterName = ADK.SessionStorage.getAppletStorageModel(this.appletScreenConfig.instanceId, 'filterName', true) || '';
            }
            ADK.SessionStorage.setAppletStorageModel(this.appletScreenConfig.instanceId, 'filterName', this.appletScreenConfig.filterName, true);

            this.model = new Backbone.Model(this.appletScreenConfig);
            this.AppletView = this.AppletView || options.AppletView;
            this.options = options;
            this.predefinedScreen = _.get(options, 'screenModule.config.predefined');
            if (_.isUndefined(this.predefinedScreen)) {
                this.predefinedScreen = true;
            }
            this.model.set('cid', this.cid);
            if (this.model.get('filterName') !== '') {
                this.$el.addClass('filtered');
            }
        },
        onBeforeShow: function() {
            this.createViews();
            this.appletDiv.show(this.viewToDisplay);

            this.createPredefinedButtons();
            this.buttonCollectionView = new ButtonCollectionView({
                collection: this.buttonCollection
            });
            this.buttonRegion.show(this.buttonCollectionView);
            this.ensureEditableTitleCssClass();
            var appletInstanceId = this.model.get('instanceId');
            WorkspaceFilters.onAppletFilterCollectionChanged(appletInstanceId, this.refreshAppletTitleColor, this);

            var NotificationView = _.get(this.appletViewConfig, 'chromeOptions.notificationView');
            if (NotificationView) {
                var aggregatedOptions = {};

                _.extend(aggregatedOptions, this.appletView.appletConfig || {}, this.appletView.dataGridOptions || {}, this.appletView.appletOptions || {});
                if (_.isFunction(NotificationView)) {
                    NotificationView = NotificationView.extend({
                        collection: aggregatedOptions.collection
                    });
                    this.NotificationContainer.show(new NotificationView());
                } else if (_.isArray(NotificationView)) {
                    var NotificationsCollection = new Backbone.Collection(NotificationView, {
                        comparator: 'orderIndex'
                    });

                    var CollectionView = Backbone.Marionette.CollectionView.extend({
                        collection: NotificationsCollection,
                        childViewOptions: {
                            collection: aggregatedOptions.collection
                        },
                        getChildView: function(model) {
                            return model.get('view');
                        }
                    });

                    this.NotificationContainer.show(new CollectionView());
                }
            }
        },
        refreshAppletTitleColor: function(args) {
            var anyFilters = args.anyFilters;
            var panelHeading = this.$el.find('.panel-heading');
            if (anyFilters) {
                panelHeading.addClass('panel-heading-filtered');
            } else {
                panelHeading.removeClass('panel-heading-filtered');
            }
        },
        createViews: function() {
            if (this.AppletController) {
                this.viewToDisplay = new this.AppletController(this.options);
                this.listenTo(this.viewToDisplay.model, 'change:currentView', this.appletViewTypeChange);
                this.appletView = this.viewToDisplay.model.get('currentView');
            } else {
                this.viewToDisplay = new this.AppletView(this.options);
                this.appletView = this.viewToDisplay;
            }
            if (this.appletView.eventMapper) {
                this.eventMapper = this.appletView.eventMapper;
            }
        },
        createPredefinedButtons: function() {
            var viewConfig = Utils.appletUtils.getViewTypeConfig(this.options, this.model.get('viewType'));
            if (_.isArray(_.get(viewConfig, 'chromeOptions.additionalButtons'))) {
                _.forEach(viewConfig.chromeOptions.additionalButtons, function(item) {
                    if (item.id && item.view) {
                        this.buttonCollection.add(new ButtonViewModel({
                            id: item.id,
                            view: item.view
                        }));
                    }
                }, this);
            }

            //Create Refresh Button View
            if (this.refreshEnabled()) {
                this.buttonCollection.add(new ButtonViewModel({
                    id: 'refresh-button',
                    view: RefreshButtonView
                }));
            }

            //Create Help Button View
            if (this.helpEnabled()) {
                this.buttonCollection.add(new ButtonViewModel({
                    id: 'help-button',
                    view: HelpButtonView
                }));
            }
            //Create Add Button View
            // - if the view being displayed has a onClickAdd method
            if (this.appletView.hasOwnProperty('onClickAdd')) {
                this.buttonCollection.add(new ButtonViewModel({
                    id: 'add-button',
                    view: AddButtonView
                }));
            }
            //Create Filter Button View
            // - when the view being displayed has a filterDateRangeView or filterView
            if (this.appletView.hasOwnProperty('filterDateRangeView') || this.appletView.hasOwnProperty('filterView')) {
                if (!this.model.get('filterName')) {
                    this.model.set('filterName', '');
                }
                this.buttonCollection.add(new ButtonViewModel({
                    id: 'filter-button',
                    instanceId: this.model.get('instanceId'),
                    buttonMsg: 'Press enter to activate filter',
                    view: FilterButtonView
                }));
            }
            //Create the cog icon Options Button View
            // - don't show if on a fullScreen view or not a user defined workspace
            // this if(options.screenModule) check needs to be here for the timeline summary view
            if (!this.predefinedScreen && (!this.model.has('fullScreen') && ($('.gridster').length > 0)) && this.AppletController) {
                this.buttonCollection.add(new ButtonViewModel({
                    id: 'options-button',
                    view: OptionsButtonView
                }));
            }
            //Create Resize Button View
            // - when applet has a maximizeScreen specified in the screen config
            if (this.model.has('maximizeScreen') || (this.model.has('fullScreen') && this.model.get('fullScreen') === true)) {
                this.buttonCollection.add(new ButtonViewModel({
                    id: 'resize',
                    maximizeScreen: this.model.get('maximizeScreen'),
                    fullScreen: this.model.get('fullScreen'),
                    view: ResizeView,
                    fromMinimizedToMaximized: this.options.fromMinimizedToMaximized
                }));
            }
        },
        appletViewTypeChange: function(appletControllerModel) {
            this.appletView = this.viewToDisplay.model.get('currentView');
            this.model.set('viewType', appletControllerModel.get('currentViewType'));
            this.resetButtons();

            this.$el.find(".applet-div-chrome-container").removeClass("hide");
            this.$el.find(".switchboard-container").addClass("hide");
            this.$el.find(".grid-applet-heading").toggleClass("optionsPanelStyle panel-heading");

            if (this.$el.find(".panel-title-label").text().indexOf("- Select a View") > -1) {
                this.$el.find(".panel-title-label").text(this.model.attributes.title);
                this.$el.find(".panel-title").removeClass("col-xs-12 text-center");
            } else {
                this.$el.find(".panel-title-label").text(this.model.attributes.title + " - Select a View");
                this.$el.find(".panel-title").addClass("col-xs-12 text-center");
            }
            this.switchboardContainer.reset();
        },
        resetButtons: function() {
            this.buttonCollection.reset();

            this.refreshButtonView = null;
            this.createPredefinedButtons();
        },
        ensureEditableTitleCssClass: function() {
            if (this.isTitleEditable()) {
                this.$el.addClass('editable-title');
            }
        },
        onRender: function() {
            Utils.applyMaskingForSpecialCharacters(this.$el.find('.panel-title-textbox'));
        },
        template: containerTemplate,
        behaviors: {
            Tooltip: {}
        },
        regions: {
            NotificationContainer: '.panel-title-notification',
            appletDiv: '.applet-div-chrome-container',
            buttonRegion: '.right-button-region',
            chromeFooter: '.grid-footer',
            switchboardContainer: '.switchboard-container'
        },
        events: {
            'click .applet-maximize-button': 'expandApplet',
            'click .applet-minimize-button': 'minimizeApplet',
            'click .applet-refresh-button': function(event) {
                this.onClickButton("refresh", event);
            },
            'click .applet-add-button': function(event) {
                this.onClickButton("add", event);
            },
            'click .applet-help-button': 'showHelp',
            'click .applet-options-button': 'displaySwitchboard',
            'click .applet-exit-options-button': 'closeSwitchboard',
            'click .panel-title-label': 'setTitleModeFromUi',
            'focusout .panel-title-textbox': 'setTitleModeFromUi',
            'change .panel-title-textbox': 'saveTitle',
            'keypress .panel-title-textbox': 'titleKeypress'
        },
        titleKeypress: function(e) {
            if (e.which == 13) {
                this.getPanelTitleTextbox().blur();
            }
        },
        isTitleEditable: function() {
            var isUserDefinedWorkspace = !Messaging.request('get:current:screen').config.predefined;
            var isStackedGraphApplet = this.model.id === 'stackedGraph';
            var isInRegularViewModeNotInSettingsMode = $('.panel-heading.grid-applet-heading', this.$el).length;
            return isUserDefinedWorkspace && isStackedGraphApplet && isInRegularViewModeNotInSettingsMode;
        },
        saveTitle: function() {
            var isStackedGraph = false;
            var panelTitleTextbox = this.getPanelTitleTextbox();
            var newTitle = panelTitleTextbox.val();
            if (newTitle === '')
                return;
            if (this.appletScreenConfig && this.appletScreenConfig.id.toLowerCase() === 'stackedgraph') {
                isStackedGraph = true;
            }
            this.model.set('title', newTitle);
            var panelTitleLabel = this.getPanelTitleLabel();
            panelTitleLabel.text(newTitle).focus();
            Messaging.trigger('gridster:saveAppletsConfig', isStackedGraph);
        },
        getPanelTitleTextbox: function() {
            return this.$el.find('.panel-title-textbox');
        },
        setVisible: function(el, visible) {
            if (visible) {
                el.removeClass('hidden');
            } else {
                el.addClass('hidden');
            }
        },
        setTitleModeFromUi: function(event) {
            var makeEditible = $(event.target).hasClass('panel-title-label');
            this.setTitleMode(makeEditible);
        },
        getPanelTitleLabel: function() {
            return this.$el.find('.panel-title-label');
        },
        setTitleMode: function(setEditable) {
            if (!this.isTitleEditable()) {
                console.log("Can't edit non-user defined workspaces");
                return;
            }
            setEditable = setEditable === undefined ? true : setEditable;
            var panelTitleLabel = this.getPanelTitleLabel();
            var panelTitleLabelWidth = panelTitleLabel.width();
            this.setVisible(panelTitleLabel, !setEditable);
            var panelTitleTextbox = this.getPanelTitleTextbox();
            this.setVisible(panelTitleTextbox, setEditable);
            panelTitleTextbox.width(350);

            if (setEditable) {
                var currentTitle = this.model.get('title');
                panelTitleTextbox
                    .focus()
                    .val(currentTitle.trim());
            }
        },
        refreshEnabled: function() {
            if (this.eventMapper && this.eventMapper.refresh) {
                var eventMethod = this.eventMapper.refresh;
                if (_.isFunction(this.appletView[eventMethod])) {
                    return true;
                }
            }
            return false;
        },
        helpEnabled: function() {
            var url = getHelpUrl(this.appletView);
            return (url !== "");
        },
        expandApplet: function(event) {
            /* Remove any popover elements on the screen before expanding an applet bug fix*/
            $('.popover').popover('hide');
            $('.tooltip').tooltip('hide');
            var workspaceId = ADK.Messaging.request('get:current:screen').config.id,
                instanceId = this.options.appletConfig.instanceId;

            var filterName = this.$('.applet-filter-title').text();
            ADK.SessionStorage.setAppletStorageModel(instanceId, 'filterName', filterName, true, workspaceId);

            var maximizeScreenId = this.model.get('maximizeScreen');
            var filterText = ADK.SessionStorage.getAppletStorageModel(instanceId, 'filterText', true) || '';

            ADK.Messaging.reply("applet:maximized", function() {
                return new MaximizedAppletModel({
                    instanceId: instanceId,
                    workspaceId: workspaceId,
                    filterName: filterName,
                    filterText: filterText
                });
            });
            SessionStorage.set.sessionModel('lastWorkspace', new Backbone.Model({
                'workspace': workspaceId
            }));
            SessionStorage.set.sessionModel('expandedAppletId', new Backbone.Model({
                'id': this.options.appletConfig.instanceId
            }));

            Navigation.navigate(maximizeScreenId, {fromMinimizedToMaximized: true});
        },
        minimizeApplet: function(event) {
            $('.tooltip').tooltip('hide');
            Messaging.stopReplying('applet:maximized');
            Navigation.back();
        },
        onClickButton: function(type, event) {
            if (this.eventMapper && this.eventMapper[type] && type !== null) {
                var eventMethod = this.eventMapper[type];
                if ((eventMethod === 'onRefresh' || eventMethod === 'refresh') && this.$el.find(CrsUtil.getCrsIconHeaderClassName() + '.hide').length === 0) {
                    CrsUtil.removeStyle(this);
                }
                this.appletView[eventMethod](event);
            }
        },
        toggleClasses_SwitchBoard_show_hide: function() {
            this.$el.find(".grid-applet-heading").toggleClass("optionsPanelStyle panel-heading");
            this.$el.find(".grid-filter, .grid-toolbar").toggleClass("hide");
            _.forEach(this.buttonCollection.models, function(buttonModel) {
                this.$el.find(".grid-" + buttonModel.get('id')).toggleClass("hide");
            }, this);

            if (this.$el.attr("data-appletid") === "stackedGraph") {
                this.$el.find(".stacked-graph-filter-button").toggleClass("hide");
            }

            if (this.$el.find(".panel-title-label").text().indexOf("- Select a View") > -1) {
                this.$el.find(".panel-title-label").text(this.model.attributes.title);
                this.$el.find(".panel-title").removeClass("col-xs-12 text-center");
            } else {
                this.$el.find(".panel-title-label").text(this.model.attributes.title + " - Select a View");
                this.$el.find(".panel-title").addClass("col-xs-12 text-center");
            }
        },
        toolTipHide: function(event) {
            $('.tooltip').tooltip('hide');
        },
        displaySwitchboard: function(event) {
            this.toolTipHide(event);
            var switchboardOptions = {
                appletController: this.viewToDisplay,
                region: this.viewToDisplay.appletRegion,
                containerRegion: this.options.region,
                appletId: this.appletScreenConfig.id,
                appletConfig: this.options.appletConfig,
                switchOnClick: true,
                appletChrome: this
            };
            var SwitchboardView = Messaging.request('switchboard : display', switchboardOptions);
            this.switchboardContainer.show(SwitchboardView);
            this.$el.find(".applet-div-chrome-container").addClass("hide");
            this.$el.find(".switchboard-container").removeClass("hide");
            this.toggleClasses_SwitchBoard_show_hide();
            this.$('.options-panel').append('<li><button type="button" title="Press enter to close." class="applet-exit-options-button btn btn-sm btn-icon"><i class="fa fa-close"></i></button></li>');
            this.$('.options-panel li:first button:first').focus();
        },
        closeSwitchboard: function(event) {
            this.toolTipHide(event);
            this.$el.find(".applet-div-chrome-container").removeClass("hide");
            this.$el.find(".switchboard-container").addClass("hide");
            this.toggleClasses_SwitchBoard_show_hide();
            this.switchboardContainer.reset();
            this.$('.applet-options-button').focus();
        },
        showHelp: function(event) {
            var url = getHelpUrl(this.appletView);
            if (url !== "")
                Utils.helpUtils.popupCenter(url, 'helpIconUniqueWindow', '715', '300');
            event.preventDefault();
        }
    });

    ChromeLayoutView.NotificationView = NotificationView;

    return ChromeLayoutView;
});
