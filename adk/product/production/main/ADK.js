//ADK is moved to the global namespace in order to facilitate better seperation between ehmp-ui and adk.
var ADK = {};

define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'api/CCOWService',
    'api/ResourceService',
    'api/UserService',
    'main/Session',
    'main/ui_components/components',
    'main/accessibility/components',
    'main/resources/resources',
    'main/Utils',
    'api/Messaging',
    'api/Navigation',
    'api/NotificationsManager',
    'api/AutoLogoff',
    'api/NotificationsFetch',
    'api/SessionStorage',
    'api/ErrorMessaging',
    'api/UserDefinedScreens',
    'api/Enrichment',
    'main/backgrid/datagrid',
    'main/backgrid/filter',
    'main/backgrid/paginator',
    'main/components/views/appletControllerView',
    'main/components/applets/grid_applet/gridAppletView',
    'main/ui_components/workflow/component',
    'main/components/views/loadingView',
    'main/components/views/errorView',
    'main/components/views/serverSideErrorView',
    'main/components/sign/signView',
    'main/components/sign/signApi',
    'main/components/views/appletViews/eventsGistView/views/eventsGistView',
    'main/components/views/appletViews/pillsGistView/views/pillGistView',
    'main/components/views/appletViews/interventionsGistView/views/interventionsGistView',
    'main/components/views/appletViews/observationsGistView/views/observationsGistView',
    'main/components/applets/baseDisplayApplet/view',
    'main/components/views/appletViews/gridView/view',
    'main/components/views/appletViews/pillsGistView/view',
    'main/components/views/appletViews/interventionsGistView/view',
    'main/components/views/appletViews/eventsGistView/view',
    'main/components/views/appletViews/observationsGistView/view',
    'main/components/appletToolbar/toolbarView',
    "main/components/appletToolbar/appletToolbarView",
    'main/components/applet_chrome/chromeView',
    'main/components/popup/popup',
    'main/components/views/appletViews/TileSortManager',
    'main/ui_components/tray/views/summary/view',
    'main/ui_components/tray/views/action_summary_list/view',
    'main/components/behaviors/behaviors',
    'main/ADKApp'
], function(Backbone, Marionette, $, _, CCOWService, resourceService, userService, session, UIComponents, Accessibility, Resources, utils, messaging, navigation, notificationsManager, autoLogoff, notificationsFetch, sessionStorage, errorMessaging, UserDefinedScreens, Enrichment, DataGrid, Filter, Paginator, AppletControllerView, GridAppletView, Workflow, LoadingView, ErrorView, ServerSideErrorView, SignView, SignApi, EventsGistView, PillGistView, InterventionsGistView, ObservationsGist, baseDisplayApplet, gridView, pillsGistView, interventionsGistView, eventsGistView, ObservationsGistView, ToolbarView, AppletToolbarView, ChromeView, Popup, tileSortManager, SummaryViewType, TrayActionSummaryListView, Behaviors, ADKApp) {
    'use strict';
    ADK = {
        AutoLogoff: autoLogoff,
        NotificationsFetch: notificationsFetch,
        ResourceService: resourceService,
        PatientRecordService: resourceService.patientRecordService,
        UserService: userService,
        Messaging: messaging,
        Navigation: navigation,
        Notifications: notificationsManager,
        utils: utils,
        SessionStorage: sessionStorage,
        ErrorMessaging: errorMessaging,
        TileSortManager: tileSortManager,
        ADKApp: ADKApp,
        UserDefinedScreens: UserDefinedScreens,
        CCOWService: CCOWService,
        SignApi: SignApi,
        Enrichment: Enrichment
    };

    ADK.Applets = {
        BaseGridApplet: GridAppletView,
        BaseDisplayApplet: baseDisplayApplet
    };

    //ADK View Components
    ADK.Views = {
        AppletControllerView: AppletControllerView,
        DataGrid: DataGrid,
        CollectionFilter: Filter,
        Paginator: Paginator,
        Loading: LoadingView,
        Error: ErrorView,
        ServerSideError: ServerSideErrorView,
        SignForm: SignView,
        EventGist: EventsGistView,
        PillGist: PillGistView,
        AppletToolbarView: AppletToolbarView,
        InterventionsGist: InterventionsGistView,
        VitalsGist: ObservationsGist,
        LabresultsGist: ObservationsGist,
        ToolbarView: ToolbarView,
        TrayActionSummaryList: TrayActionSummaryListView,
        TraySummaryList: SummaryViewType
    };

    ADK.AppletViews = {
        GridView: gridView,
        ChromeView: ChromeView,
        PillsGistView: pillsGistView,
        InterventionsGistView: interventionsGistView,
        EventsGistView: eventsGistView,
        ObservationsGistView: ObservationsGistView,
    };
    ADK.AppletViews.GridView.ADK = ADK;

    ADK.UI = UIComponents;
    ADK.Accessibility = Accessibility;

    ADK.Resources = Resources;

    messaging.once('ResourcesLoaded', function() { //this needs to happen after this file is loaded in it's require
        ADK.UIResources = messaging.request('UIResources');
        messaging.stopReplying('UIResources');
    });


    ADK.getAppletRegionLayoutView = function() {
        return ADK.ADKApp.centerRegion.currentView.appletRegion;
    };

    // { appletId: string, resource: string, viewModel: Backbone.Model, tableTemplate: handleBarsTemplate, rowTemplate: handleBarsTemplate}
    ADK.createSimpleApplet = function(appletDefinition) {

        var applet = {
            id: appletDefinition.appletId,
            hasCSS: appletDefinition.hasCSS,
            getRootView: function() {
                return ADK.AppletLayout.single(appletDefinition);
            }
        };

        return applet;
    };

    ADK.AppletLayout = {
        single: function(appletDefinition) {
            var singleLayoutView = Backbone.Marionette.LayoutView.extend({
                initialize: function() {
                    if (appletDefinition.itemView) {
                        if (appletDefinition.compositeView) {
                            this.appletCompositeView = ADK.CustomCompositeView(appletDefinition);
                        } else {
                            this.appletCompositeView = ADK.CustomItemView(appletDefinition);
                        }
                    } else {
                        this.appletCompositeView = ADK.TableCompositeView(appletDefinition, appletDefinition.rowTemplate, appletDefinition.tableTemplate);
                    }
                },
                onRender: function() {
                    this.appletMain.show(this.appletCompositeView);
                },
                template: _.template('<div id="applet-main"></div>'),
                regions: {
                    appletMain: '#applet-main'
                }
            });



            return singleLayoutView;
        }
    };

    ADK.TableCompositeView = function(appletDefinition, rowTemplate, tableTemplate) {
        var ItemView = Backbone.Marionette.ItemView.extend({
            tagName: 'tr',
            template: rowTemplate
        });

        var CompositeView = Backbone.Marionette.CompositeView.extend({
            initialize: function() {
                var fetchOptions = {};
                fetchOptions.resourceTitle = appletDefinition.resource;
                fetchOptions.viewModel = appletDefinition.viewModel;
                var domainCollection = ADK.PatientRecordService.fetchCollection(fetchOptions);
                this.collection = domainCollection;
            },
            childView: ItemView,
            childViewContainer: 'tbody',
            template: tableTemplate,
            className: 'panel panel-info'
        });
        return new CompositeView();
    };

    ADK.CustomCompositeView = function(appletDefinition) {
        var CompositeView = appletDefinition.compositeView;
        return new CompositeView();
    };

    ADK.CustomItemView = function(appletDefinition) {
        var ItemView = appletDefinition.itemView;

        var CompositeView = Backbone.Marionette.CompositeView.extend({
            initialize: function() {
                var fetchOptions = {};
                fetchOptions.resourceTitle = appletDefinition.resource;
                fetchOptions.viewModel = appletDefinition.viewModel;
                var domainCollection = ADK.PatientRecordService.fetchCollection(fetchOptions);
                this.collection = domainCollection;
            },
            childView: ItemView,
            childViewContainer: 'tbody',
            template: appletDefinition.tableTemplate,
            className: 'panel panel-info'
        });
        return new CompositeView();
    };

    ADK.hideAllModals = function() {
        UIComponents.Modal.hide();
        UIComponents.Workflow.hide();
    };

    return ADK;
});