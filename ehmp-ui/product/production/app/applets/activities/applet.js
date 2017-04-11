define([
    'backbone',
    'marionette',
    'moment',
    'jquery',
    'handlebars',
    'backgrid',
    'app/applets/activities/toolbar/toolbarView',
    'app/applets/activities/utils',
    'app/applets/activities/config',
    'app/applets/task_forms/activities/order.consult/utils'
], function(Backbone, Marionette, moment, $, Handlebars, Backgrid, ToolbarView, Util, Config, ConsultUtils) {
    'use strict';

    var fetchOptions = {
        resourceTitle: 'activities-instances-available',
        cache: false,
        pageable: true,
        criteria: {},
        viewModel: {
            parse: function(response){
                Util.parseResponse(response);
                return response;
            }
        }
    };

    var body = Backgrid.Body.extend({
        makeComparator: function(attr, order, func) {
            return function(left, right) {
                var l = func(left, attr, order),
                    r = func(right, attr, order),
                    t;

                if (order === 1) t = l, l = r, r = t;

                if (l === r) return 0;
                else if (l < r) return -1;
                return 1;
            };
        }
    });

    var AppletLayoutView = ADK.AppletViews.GridView.extend({
        _super: ADK.AppletViews.GridView.prototype,
        initialize: function(options){
            var self = this;
            this.contextViewType = ADK.WorkspaceContextRepository.currentContextId;
            this.fullScreen = options.appletConfig.fullScreen;
            this.fetchOptions = {};
            _.extend(this.fetchOptions, fetchOptions);

            this.expandedAppletId = this.options.appletConfig.instanceId;
            if (this.options.appletConfig.fullScreen) {
                this.parentWorkspace = ADK.Messaging.request('get:current:workspace');
                var expandedModel = ADK.SessionStorage.get.sessionModel('expandedAppletId');
                if (!_.isUndefined(expandedModel) && !_.isUndefined(expandedModel.get('id'))) {
                    this.expandedAppletId = expandedModel.get('id');
                }
            }
            var dataGridOptions = {
                body: body,
                formattedFilterFields: {
                    'createdOn': function(model, key) {
                        var val = model.get(key);
                        val = val.replace(/(\d{4})(\d{2})(\d{2})/, '$2/$3/$1');
                        return val;
                    }
                },
                onClickRow: function(model, event){
                    var currentPatient = ADK.PatientRecordService.getCurrentPatient();

                    if(self.contextViewType === 'staff'){
                        ADK.PatientRecordService.setCurrentPatient(model.get('pid'), {
                            navigation: false,
                            callback: function() {
                                ConsultUtils.checkTask(model, function() {
                                    ADK.Messaging.getChannel('task_forms').request('activity_detail', {processId: model.get('processId')});
                                });
                            }
                        });
                    } else {
                        ConsultUtils.checkTask(model, function() {
                            ADK.Messaging.getChannel('task_forms').request('activity_detail', {processId: model.get('processId')});
                        });
                    }
                }
            };

            var filter = ADK.SessionStorage.getAppletStorageModel(this.expandedAppletId, 'filter', true, this.parentWorkspace);

            if (_.isUndefined(filter)) {
                filter = 'intendedForAndCreatedByMe;open';
            }
            if (this.columnsViewType === 'summary') {
                filter = filter.split(';')[0] +  ';' + 'open';
            }

            this.sharedModel = new Backbone.Model({filter: filter});
            this.bindEntityEvents(this.sharedModel, this.sharedModelEvents);

            dataGridOptions.toolbarView = new ToolbarView({
                instanceId: options.appletConfig.instanceId,
                expandedAppletId: this.expandedAppletId,
                parentWorkspace: this.parentWorkspace,
                sharedModel: this.sharedModel,
                viewType: this.columnsViewType,
                contextViewType: this.contextViewType,
            });

            var config = Config.getColumnnsAndFilterFields(this.columnsViewType, this.contextViewType);
            dataGridOptions.columns = config.columns;
            dataGridOptions.filterFields = config.filterFields;

            if(this.columnsViewType === 'expanded'){
                dataGridOptions.filterDateRangeEnabled = true;
                dataGridOptions.filterDateRangeField = {
                    name: "createdOn",
                    label: "Date",
                    format: "YYYYMMDD"
                };

                // Default date picker options when the screen is loaded
                var fromDate, toDate;
                var globalDate = ADK.SessionStorage.getModel('globalDate');
                if (!this.fullScreen && globalDate.get('selectedId') !== undefined && globalDate.get('selectedId') !== null) {
                    fromDate = moment(globalDate.get('fromDate'), 'MM/DD/YYYY').format('YYYYMMDD');

                    if(fromDate.length === 8){
                        fromDate += '0000';
                    }

                    toDate = moment(globalDate.get('toDate'), 'MM/DD/YYYY').format('YYYYMMDD');

                    if(toDate.length === 8){
                        toDate += '2359';
                    }
                } else {
                    toDate = moment().add('months', 6).format('YYYYMMDD') + '2359';
                    fromDate = moment().subtract('months', 18).format('YYYYMMDD') + '0000';
                }

                this.fetchOptions.pageable = true;
                this.sharedModel.set('fromDate', fromDate);
                this.sharedModel.set('toDate', toDate);

                this.listenTo(ADK.Messaging, 'globalDate:selected', function(dateModel) {
                    self.dateRangeRefresh('createdOn', dateModel.toJSON());
                });
            }

            if (this.contextViewType === 'patient' && ADK.PatientRecordService.isPatientInPrimaryVista()){
                dataGridOptions.onClickAdd = function(){
                    var TrayView = ADK.Messaging.request("tray:writeback:actions:trayView");
                    if (TrayView) {
                        TrayView.$el.trigger('tray.show');
                    }
                };
            }

            this.listenTo(ADK.Messaging.getChannel('activities'), 'create:success', this.refresh);
            this.setFetchOptions();
            this.activitiesCollection = ADK.ResourceService.fetchCollection(this.fetchOptions);
            dataGridOptions.collection = this.activitiesCollection;
            this.bindEntityEvents(this.activitiesCollection, this.collectionEvents);
            this.appletOptions = dataGridOptions;
            this._super.initialize.apply(this, arguments);
        },
        setFetchOptions: function(){
            var filter = this.sharedModel.get('filter');
            var filterSplit = filter.split(';');
            var primaryFilter = filterSplit[0];
            var secondaryFilter = filterSplit[1];
            this.fetchOptions.criteria = {};

            if(secondaryFilter === 'open' || secondaryFilter === 'closed'){
                this.fetchOptions.criteria.mode = secondaryFilter;
            }

            if(primaryFilter === 'intendedForAndCreatedByMe'){
                this.fetchOptions.criteria.createdByMe = true;
                this.fetchOptions.criteria.intendedForMeAndMyTeams = true;
            } else if(primaryFilter === 'me'){
                this.fetchOptions.criteria.createdByMe = true;
            } else if(primaryFilter === 'intendedForMe'){
                this.fetchOptions.criteria.intendedForMeAndMyTeams = true;
            }

            if(secondaryFilter !== 'open' && this.sharedModel.has('toDate') && this.sharedModel.has('fromDate')){
                var endDate = moment(this.sharedModel.get('toDate'), 'YYYYMMDDHHmm');
                var startDate = moment(this.sharedModel.get('fromDate'), 'YYYYMMDDHHmm');
                var utcEndDate = moment.utc(endDate).format('YYYYMMDDHHmm');
                var utcStartDate = moment.utc(startDate).format('YYYYMMDDHHmm');
                this.fetchOptions.criteria.endDate = utcEndDate;
                this.fetchOptions.criteria.startDate = utcStartDate;
            }

            if(this.contextViewType === 'patient'){
                this.fetchOptions.criteria.pid = ADK.PatientRecordService.getCurrentPatient().get('pid');
            }

            this.fetchOptions.criteria.context = this.contextViewType;
        },
        sharedModelEvents: {
            'change:filter': 'changeFilter'
        },
        collectionEvents: {
            'fetch:success': 'collectionFinished',
            'fetch:error': 'collectionFinished'
        },
        collectionFinished: function(){
            this.disableFilters(false);
        },
        changeFilter: function(){
            ADK.SessionStorage.setAppletStorageModel(this.expandedAppletId, 'filter', this.sharedModel.get('filter'), true, this.parentWorkspace);

            this.disableFilters(true);
            this.setFetchOptions();
            this.refresh();
        },
        disableFilters: function(disabled){
            var appletId = this.fullScreen ? 'activities' : this.expandedAppletId;
            this.$el.find('#' + appletId + '-primary-filter-options').prop('disabled', disabled);
            this.$el.find('#' + appletId + '-display-only-options').prop('disabled', disabled);
        },
        dateRangeRefresh: function(dateFieldName, filterOptions){
            var toDate = moment(filterOptions.toDate, 'MM/DD/YYYY').format('YYYYMMDD');
            var fromDate = moment(filterOptions.fromDate, 'MM/DD/YYYY').format('YYYYMMDD');

            if(toDate.length === 8){
                toDate += '2359';
            }

            if(fromDate.length === 8){
                fromDate += '0000';
            }
            this.sharedModel.set('fromDate', fromDate);
            this.sharedModel.set('toDate', toDate);
            this.disableFilters(true);
            this.setFetchOptions();
            this.refresh();
        },
        onDestroy: function(){
            this.unbindEntityEvents(this.sharedModel, this.sharedModelEvents);
            this.unbindEntityEvents(this.activitiesCollection, this.collectionEvents);
        }
    });

    var applet = {
        id: "activities",
        viewTypes: [{
            type: 'summary',
            view: AppletLayoutView.extend({
                columnsViewType: "summary"
            }),
            chromeEnabled: true
        }, {
            type: 'expanded',
            view: AppletLayoutView.extend({
                columnsViewType: "expanded"
            }),
            chromeEnabled: true
        }],
        defaultViewType: 'summary'
    };

    return applet;
});
