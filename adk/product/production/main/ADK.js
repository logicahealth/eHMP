define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'api/CCOWService',
    'api/ResourceService',
    'api/PatientRecordService',
    'api/UserService',
    'main/Session',
    'main/ui_components/components',
    'main/accessibility/components',
    'main/resources/resources',
    'main/Utils',
    'api/Messaging',
    'api/AutoLogoff',
    'api/SessionStorage',
    'api/ErrorMessaging',
    'api/UserDefinedScreens',
    'api/WorkspaceContextRepository',
    'api/Navigation',
    'api/Checks',
    'api/Enrichment',
    'main/backgrid/datagrid',
    'main/backgrid/filter',
    'main/backgrid/paginator',
    'main/components/views/appletControllerView',
    'main/components/applets/grid_applet/gridAppletView',
    'main/ui_components/workflow/component',
    'main/components/views/loadingView',
    'main/components/views/errorView',
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
    "main/components/appletToolbar/appletToolbarView",
    'main/components/applet_chrome/chromeView',
    'main/components/popup/popup',
    'main/components/views/appletViews/TileSortManager',
    'main/ui_components/tray/views/summary/view',
    'main/ui_components/tray/views/action_summary_list/view',
    'main/ui_components/tray/views/sub_tray_button/view',
    'main/components/behaviors/behaviors',
    'main/ADKApp'
], function(
    Backbone,
    Marionette,
    $,
    _,
    CCOWService,
    resourceService,
    patientRecordService,
    userService,
    session,
    UIComponents,
    Accessibility,
    Resources,
    utils,
    messaging,
    autoLogoff,
    sessionStorage,
    errorMessaging,
    UserDefinedScreens,
    WorkspaceContextRepository,
    navigation,
    checks,
    Enrichment,
    DataGrid,
    Filter,
    Paginator,
    AppletControllerView,
    GridAppletView,
    Workflow,
    LoadingView,
    ErrorView,
    EventsGistView,
    PillGistView,
    InterventionsGistView,
    ObservationsGist,
    baseDisplayApplet,
    gridView,
    pillsGistView,
    interventionsGistView,
    eventsGistView,
    ObservationsGistView,
    AppletToolbarView,
    ChromeView,
    Popup,
    tileSortManager,
    SummaryViewType,
    TrayActionSummaryListView,
    SubTrayButtonView,
    Behaviors,
    ADKApp
) {
    'use strict';

    //ADK is moved to the global namespace in order to facilitate better seperation between ehmp-ui and adk.
    window.ADK = {
        AutoLogoff: autoLogoff,
        ResourceService: resourceService,
        PatientRecordService: patientRecordService,
        UserService: userService,
        Messaging: messaging,
        Navigation: navigation,
        Checks: checks,
        utils: utils,
        SessionStorage: sessionStorage,
        ErrorMessaging: errorMessaging,
        TileSortManager: tileSortManager,
        ADKApp: ADKApp,
        UserDefinedScreens: UserDefinedScreens,
        CCOWService: CCOWService,
        Enrichment: Enrichment,
        WorkspaceContextRepository: WorkspaceContextRepository
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
        EventGist: EventsGistView,
        PillGist: PillGistView,
        AppletToolbarView: AppletToolbarView,
        InterventionsGist: InterventionsGistView,
        VitalsGist: ObservationsGist,
        LabresultsGist: ObservationsGist,
        TrayActionSummaryList: TrayActionSummaryListView,
        TraySummaryList: SummaryViewType,
        SubTrayButton: SubTrayButtonView
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

    var hasPermission = function(permissions) {
        var hasPermission = true;
        _.each(permissions, function(permission) {
            if (!userService.hasPermission(permission)) hasPermission = false;
        });

        return hasPermission;
    };

    ADK.getAppletViews = function(moduleName, viewType) {
        //returns view definition from registry
        var module = this.ADKApp[moduleName] || [],
            permissions = module.appletConfig.permissions,
            obj = {},
            arr = [];

        //check permissions
        if (!hasPermission(permissions)) throw new Error('User does not have permissions to access ' + moduleName);

        var results = _.filter(module.appletConfig.viewTypes, (_.isObject(viewType) || !viewType) ? viewType : {
            'type': viewType
        });
        if (results.length === 1) {
            obj[results[0].type] = results[0].view;
            return obj;
        }

        _.each(results, function(val, index) {
            var obj = {};
            obj[val.type] = val.view;
            arr.push(obj);
        });
        return arr;
    };

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