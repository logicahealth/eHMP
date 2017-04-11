define([
    'backbone',
    'marionette',
    'moment',
    'jquery',
    'handlebars',
    'backgrid',
    'app/applets/activities/toolbar/toolbarView',
    'app/applets/activities/utils'
], function(Backbone, Marionette, moment, $, Handlebars, Backgrid, ToolbarView, Util, ActivityOverview) {
    'use strict';

    function getSortValueForMode(model, order){
        var value;
        if(model.get('mode') === 'Open'){
            if(order === -1){
                value += '1';
            } else {
                value += '2';
            }
        } else {
            if(order === -1){
                value += '2';
            } else {
                value += '1';
            }
        }

        return value;
    }

    var sortValueWithMode = function(model, sortKey, order){
        return model.get(sortKey) + '-' + getSortValueForMode(model, order);
    };

    var urgencySortValueWithMode = function(model, sortKey, order){
        var urgencyValue = model.get(sortKey);
        var value;

        if(urgencyValue){
            if(urgencyValue.toLowerCase() === 'emergent'){
                value = '1';
            } else if(urgencyValue.toLowerCase() === 'urgent'){
                value = '2';
            } else {
                value = '3';
            }
        } else {
            value = '99';
        }

        return value + '-' + getSortValueForMode(model, order);
    };

    var urgencyColumn = {
        name: 'urgency',
        label: 'Urgency',
        cell: 'string',
        sortValue: urgencySortValueWithMode,
        sortType: 'cycle'
    };

    var flagColumn = {
        name: 'isActivityHealthy',
        label: 'Flag',
        flexWidth: 'flex-width-0_5',
        cell: Backgrid.HandlebarsCell.extend({
            className: 'handlebars-cell flex-width-0_5',
            render: function() {
                this.$el.empty();
                this.$el.html(this.column.get('template')(this.model.toJSON()));
                this.delegateEvents();

                this.$el.find('[data-toggle="tooltip"]').tooltip();
                return this;
            },
            remove: function(){
                this.$el.find('[data-toggle="tooltip"]').tooltip('destroy');
            }
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle',
        template: Handlebars.compile('{{#if isActivityHealthy}}{{else}}<i class="fa fa-flag fa-lg color-primary" data-toggle="tooltip" data-placement="auto" title="{{activityHealthDescription}}"><span class="sr-only">{{activityHealthDescription}}</span></i>{{/if}}')
    };

    var activityNameColumn = {
        name: 'name',
        label: 'Activity Name',
        flexWidth: 'flex-width-1_5',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-1_5'
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle'
    };

    var domainColumn = {
        name: 'domain',
        label: 'Domain',
        cell: 'string',
        sortValue: sortValueWithMode,
        sortType: 'cycle'
    };

    var createdByColumn = {
        name: 'createdByName',
        label: 'Created by',
        flexWidth: 'flex-width-1',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-1'
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle'
    };

    var modeColumn = {
        name: 'mode',
        label: 'Mode',
        cell: 'string',
        sortType: 'cycle'
    };

    var taskStateColumn = {
        name: 'taskState',
        label: 'State',
        flexWidth: 'flex-width-0_5',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-0_5'
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle'
    };

    var intendedForColumn = {
        name: 'intendedFor',
        label: 'Intended for',
        flexWidth: 'flex-width-1_5',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-1_5'
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle'
    };

    var assignedFacilityColumn = {
        name: 'assignedFacilityName',
        label: 'Assigned Facility',
        flexWidth: 'flex-width-2',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-2'
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle'
    };

    var createdAtColumn = {
        name: 'createdAtName',
        label: 'Created at',
        cell: 'string',
        sortValue: sortValueWithMode,
        sortType: 'cycle'
    };

    var createdOnColumn = {
        name: 'createdOn',
        label: 'Created on',
        cell: 'handlebars',
        type: 'date',
        sortValue: sortValueWithMode,
        sortType: 'cycle',
        template: Handlebars.compile('{{formatDate createdOn "MM/DD/YYYY"}}')
    };

    var patientNameColumn = {
        name: 'patientName',
        label: 'Patient Name',
        flexWidth: 'flex-width-2',
        cell: Backgrid.HandlebarsCell.extend({
            className: 'handlebars-cell flex-width-2'
        }),
        sortValue: sortValueWithMode,
        sortType: 'cycle',
        template: Handlebars.compile('{{patientName}} {{#if patientSsnLastFour}}({{patientSsnLastFour}}){{/if}}')
    };

    var GridApplet = ADK.AppletViews.GridView;
    var _super = GridApplet.prototype;
    var AppletLayoutView = GridApplet.extend({
        initialize: function(options){
            var self = this;
            this.contextViewType = ADK.WorkspaceContextRepository.currentContext.get('id');
            this.expandedAppletId = this.options.appletConfig.instanceId;
            this.parentWorkspace = ADK.Messaging.request('get:current:workspace');
            this.fullScreen = options.appletConfig.fullScreen;

            var patientViewSummaryColumns = [urgencyColumn, flagColumn, activityNameColumn, domainColumn, taskStateColumn];
            var staffViewSummaryColumns = [urgencyColumn, patientNameColumn, flagColumn, activityNameColumn, domainColumn];
            var patientViewExpandedColumns = [urgencyColumn, flagColumn, activityNameColumn, domainColumn, taskStateColumn, intendedForColumn, assignedFacilityColumn, createdByColumn, createdAtColumn, createdOnColumn, modeColumn];
            var staffViewExpandedColumns = [urgencyColumn, patientNameColumn, flagColumn, activityNameColumn, domainColumn, taskStateColumn, intendedForColumn, assignedFacilityColumn, createdByColumn, createdAtColumn, createdOnColumn, modeColumn];

            var existingFilter;

            if(this.fullScreen){
                existingFilter = ADK.SessionStorage.getAppletStorageModel('activities', this.contextViewType + 'Filter', false);
            } else {
                existingFilter = ADK.SessionStorage.getAppletStorageModel(this.expandedAppletId, this.columnsViewType + 'Filter', true, this.parentWorkspace);
            }
            if (_.isUndefined(existingFilter)) {
                var initializedFilter;
                if(this.contextViewType === 'patient'){
                    initializedFilter = 'intendedForAndCreatedByMe;open';
                } else {
                    initializedFilter = 'none;open';
                }

                this.sharedModel = new Backbone.Model({filter: initializedFilter});
            } else {
                this.sharedModel = new Backbone.Model({filter: existingFilter});
            }

            if(this.columnsViewType === 'expanded'){
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

                this.sharedModel.set('fromDate', fromDate);
                this.sharedModel.set('toDate', toDate);

                this.listenTo(ADK.Messaging, 'globalDate:selected', function(dateModel) {
                    self.dateRangeRefresh('createdOn', dateModel.toJSON());
                });
            }

            var fetchOptions = {
                resourceTitle: 'activities-instances-available',
                cache: false,
                collectionConfig: {
                    comparator: Util.compareActivityModels
                },
                viewModel: {
                    parse: function(response){
                        Util.parseResponse(response);
                        return response;
                    }
                },
                criteria: {
                    context: this.contextViewType
                },
                onSuccess: function(collection, response){
                    if(_.has(response, 'data.teams')){
                        self.userTeams = response.data.teams;
                    }

                    self.filterCollection(collection, self.sharedModel);
                }
            };

            if(this.columnsViewType === 'summary'){
                fetchOptions.criteria.mode = 'open';
            }

            if(this.contextViewType === 'patient'){
                this.collection = ADK.PatientRecordService.fetchCollection(fetchOptions);
            } else {
                this.collection = ADK.ResourceService.fetchCollection(fetchOptions);
            }

            var toolbarView = new ToolbarView({
                instanceId: options.appletConfig.instanceId,
                expandedAppletId: this.expandedAppletId,
                parentWorkspace: this.parentWorkspace,
                sharedModel: this.sharedModel,
                collection: this.collection,
                viewType: this.columnsViewType,
                contextViewType: this.contextViewType
            });

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

            var dataGridOptions = {
                collection: this.collection,
                toolbarView: toolbarView,
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
                                ADK.Messaging.getChannel('task_forms').request('activity_detail', {processId: model.get('processId')});
                            }
                        });
                    } else {
                        ADK.Messaging.getChannel('task_forms').request('activity_detail', {processId: model.get('processId')});
                    }
                }
            };

            if(this.columnsViewType === 'expanded'){
                dataGridOptions.filterDateRangeEnabled = true;
                dataGridOptions.filterDateRangeField = {
                    name: "createdOn",
                    label: "Date",
                    format: "YYYYMMDD"
                };
            }

            if (this.columnsViewType === "summary") {
                var summaryFilterFields = ['urgency', 'name', 'domain'];

                if(this.contextViewType === 'patient'){
                    summaryFilterFields.push('taskState');
                } else {
                    summaryFilterFields.push('patientName');
                    summaryFilterFields.push('patientSsnLastFour');
                }
                dataGridOptions.filterFields = summaryFilterFields;
                dataGridOptions.columns = this.contextViewType === 'patient' ? patientViewSummaryColumns : staffViewSummaryColumns;
            } else if (this.columnsViewType === "expanded") {
                var expandedFilterFields = ['urgency', 'name', 'domain', 'createdByName', 'mode', 'taskState', 'intendedFor', 'createdAtName', 'assignedFacilityName', 'createdOn'];

                if(this.contextViewType === 'staff'){
                    expandedFilterFields.push('patientName');
                    expandedFilterFields.push('patientSsnLastFour');
                }

                dataGridOptions.columns = this.contextViewType === 'patient' ? patientViewExpandedColumns : staffViewExpandedColumns;
                dataGridOptions.filterFields = expandedFilterFields;
            }

            if (this.contextViewType === 'patient'){
                dataGridOptions.onClickAdd = function(){
                    var TrayView = ADK.Messaging.request("tray:writeback:actions:trayView");
                    if (TrayView) {
                        TrayView.$el.trigger('tray.show');
                    }
                };
            }

            this.listenTo(this.sharedModel, 'change:filter', function(){
                if(self.fullScreen){
                    ADK.SessionStorage.setAppletStorageModel('activities', self.contextViewType + 'Filter', self.sharedModel.get('filter'), false);
                } else {
                    ADK.SessionStorage.setAppletStorageModel(self.expandedAppletId, self.columnsViewType + 'Filter', self.sharedModel.get('filter'), true, self.parentWorkspace);
                }
                self.filterCollection(self.collection, self.sharedModel);
            });

            this.listenTo(ADK.Messaging.getChannel('activities'), 'create:success', this.refresh);

            this.appletOptions = dataGridOptions;
            _super.initialize.apply(this, arguments);
        },
        onRender: function() {
            _super.onRender.apply(this, arguments);
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
            this.filterCollection(this.collection, this.sharedModel);
        },
        filterCollection: function(collection, sharedModel){
            var self = this;
            ADK.utils.resetCollection(collection);
            var user = ADK.UserService.getUserSession();
            var displaySplit = this.sharedModel.get('filter').split(';');
            var primaryDisplay = displaySplit[0];
            var secondaryDisplay = displaySplit[1];
            var momentFromDate, momentToDate;
            if(self.columnsViewType === 'expanded' && sharedModel.get('fromDate') && sharedModel.get('toDate')){
                momentFromDate = moment(sharedModel.get('fromDate'), 'YYYYMMDDHHmm');
                momentToDate = moment(sharedModel.get('toDate'), 'YYYYMMDDHHmm');
            }

            var filterFunction = function(model) {
                var userSite = user.get('site');
                var userId = userSite + ';' + user.get('duz')[userSite];

                // Check the date range first if necessary
                if(momentFromDate && momentToDate){
                    if(!_.isUndefined(model.get('createdOn'))){
                        if(self.columnsViewType === 'expanded' && model.get('mode') === 'Closed'){
                            var momentCreatedOnDate = moment(model.get('createdOn'), 'YYYYMMDD');
                            if(momentCreatedOnDate.isBefore(momentFromDate) || momentCreatedOnDate.isAfter(momentToDate)){
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                }

                var primaryConditionMet = false;
                var secondaryConditionMet = false;
                if(primaryDisplay === 'me'){
                    if(model.get('createdById') === userId){
                        primaryConditionMet = true;
                    }
                } else if(primaryDisplay === 'intendedForMe'){
                    if((_.isArray(model.get('intendedForUsers')) && _.contains(model.get('intendedForUsers'), userId)) || Util.matchTeams(self.userTeams, model.get('teams'), model.get('teamFoci'))){
                        primaryConditionMet = true;
                    }
                } else if(primaryDisplay === 'intendedForAndCreatedByMe'){
                    if(model.get('createdById') === userId || ((_.isArray(model.get('intendedForUsers')) && _.contains(model.get('intendedForUsers'), userId)) || Util.matchTeams(self.userTeams, model.get('teams'), model.get('teamFoci')))){
                        primaryConditionMet = true;
                    }
                }else {
                    // primary display is none
                    primaryConditionMet = true;
                }

                if(secondaryDisplay === 'open' || secondaryDisplay === 'closed'){
                    if(!_.isUndefined(model.get('mode')) && secondaryDisplay === model.get('mode').toLowerCase()){
                        secondaryConditionMet = true;
                    }
                } else {
                    secondaryConditionMet = true;
                }

                return primaryConditionMet && secondaryConditionMet;
            };

            ADK.utils.setCollection(collection, filterFunction);
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