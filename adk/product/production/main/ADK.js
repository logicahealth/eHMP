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
    'main/UILibrary',
    'main/accessibility/components',
    'main/resources/resources',
    'main/collections/collections',
    'main/models/models',
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
    'api/Errors',
    'main/backgrid/datagrid',
    'main/backgrid/filter',
    'main/backgrid/paginator',
    'main/components/views/appletControllerView',
    'main/components/applets/grid_applet/gridAppletView',
    'main/components/views/loadingView', // remove and use UILibrary.Loading when "create" pattern is removed
    'main/components/views/errorView', // remove and use UILibrary.Error when "create" pattern is removed
    "main/components/appletToolbar/appletToolbarView",
    'main/components/popup/popup',
    'main/components/views/appletViews/TileSortManager',
    'main/components/behaviors/behaviors',
    'main/ADKApp',
    'main/layouts/layouts',
    'main/tracker'
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
    UILibrary,
    Accessibility,
    Resources,
    Collections,
    Models,
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
    Errors,
    DataGrid,
    Filter,
    Paginator,
    AppletControllerView,
    GridAppletView,
    LoadingView,
    ErrorView,
    AppletToolbarView,
    Popup,
    tileSortManager,
    Behaviors,
    ADKApp,
    Layouts,
    Tracker
) {
    'use strict';

    //ADK is moved to the global namespace in order to facilitate better separation between ehmp-ui and adk.
    window.ADK = {
        AutoLogoff: autoLogoff,
        ResourceService: resourceService,
        PatientRecordService: patientRecordService,
        UserService: userService,
        Messaging: messaging,
        Navigation: navigation,
        Checks: checks,
        Errors: Errors,
        utils: utils,
        SessionStorage: sessionStorage,
        ErrorMessaging: errorMessaging,
        TileSortManager: tileSortManager,
        ADKApp: ADKApp,
        UserDefinedScreens: UserDefinedScreens,
        CCOWService: CCOWService,
        Enrichment: Enrichment,
        WorkspaceContextRepository: WorkspaceContextRepository,
        Collections: Collections,
        UserTracker: Tracker,
        UI: UILibrary,
        Accessibility: Accessibility,
        Resources: Resources,
        Models: Models
    };

    ADK.Applets = {
        BaseGridApplet: GridAppletView,
        BaseDisplayApplet: UILibrary.BaseDisplayApplet
    };

    //ADK View Components
    ADK.Views = {
        AppletControllerView: AppletControllerView,
        DataGrid: DataGrid,
        CollectionFilter: Filter,
        Paginator: Paginator,
        Loading: LoadingView,
        Error: ErrorView,
        EventGist: UILibrary.EventsGistApplet.prototype.AppletView,
        PillGist: UILibrary.PillsGistApplet.prototype.AppletView,
        AppletToolbarView: AppletToolbarView,
        InterventionsGist: UILibrary.InterventionsGistApplet.prototype.AppletView,
        VitalsGist: UILibrary.ObservationsGistApplet.prototype.AppletView,
        LabresultsGist: UILibrary.ObservationsGistApplet.prototype.AppletView,
        TrayActionSummaryList: UILibrary.TrayActionSummaryList,
        TraySummaryList: UILibrary.TraySummaryList,
        SubTrayButton: UILibrary.SubTrayButton,
        ServerPagingView: UILibrary.ServerPagingApplet
    };

    ADK.AppletViews = {
        GridView: UILibrary.GridApplet,
        ChromeView: UILibrary.Chrome,
        PillsGistView: UILibrary.PillsGistApplet,
        InterventionsGistView: UILibrary.InterventionsGistApplet,
        EventsGistView: UILibrary.EventsGistApplet,
        ObservationsGistView: UILibrary.ObservationsGistApplet
    };
    ADK.AppletViews.GridView.ADK = ADK;

    Tracker.start();

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
        UILibrary.Modal.hide();
        UILibrary.Workflow.hide();
    };

    return ADK;
});
