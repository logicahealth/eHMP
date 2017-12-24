define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'moment',
    'backgrid',
    'app/applets/todo_list/eventHandler',
    'app/applets/todo_list/columnsConfig',
    'app/applets/todo_list/util',
    'app/applets/todo_list/toolbar/toolbarView',
    'app/applets/todo_list/statusView',
    'app/applets/todo_list/statusNotCompletedView'
], function(Backbone, Marionette, _, Handlebars, moment, Backgrid, EventHandler, ColumnsConfig, Util, ToolbarView, StatusView, StatusNotCompletedView) {
    'use strict';

    var Config = ColumnsConfig;

    var filterByDueDate = function(collection) {
        return collection.filter(function(model) {
            return model.get('dueTextValue') < 1;
        });
    };

    var MenuItem = Backbone.Model.extend({
        defaults: {
            'displayText': 'Me',
            'value': 'teamroles',
            'show': true
        }
    });
    var MenuItems = Backbone.Collection.extend({
        model: MenuItem
    });

    var assignedToOptions = new MenuItems([{
        'displayText': 'Me',
        'value': 'teamroles'
    }, {
        'displayText': 'My Teams',
        'value': 'teams'
    }, {
        'displayText': 'Anyone',
        'value': 'any',
        'show': function() {
            return !Util.isStaffView();
        }
    }]);

    var statusOptions = new MenuItems([{
        'displayText': 'Active',
        'value': 'Active'
    }, {
        'displayText': 'Inactive',
        'value': 'Inactive'
    }, {
        'displayText': 'All',
        'value': 'All'
    }]);

    var statusMappings = {
        'Active': ['Created', 'Ready', 'Reserved', 'InProgress'],
        'Inactive': ['Completed', 'Failed', 'Exited', 'Suspended'],
        'All': ['All']
    };

    //the following model is shared between the applet and the toolbar view
    var SharedModel = Backbone.Model.extend({
        defaults: {
            assignedTo: 'teamroles',
            status: 'Active',
            dateFilter: {}
        }
    });

    var DataGrid = ADK.Applets.BaseGridApplet.DataGrid;
    var DataGridRow = DataGrid.DataGridRow;
    var tooltip = Handlebars.compile([
        '<div class="row">',
        '<div class="col-xs-12">',
        '<h5 class="top-margin-no bottom-margin-no top-padding-no bottom-padding-no">Task Description</h5>',
        '</div>',
        '</div>',
        '<div class="row">',
        '<div class="col-xs-12">',
        '<p class="top-margin-no bottom-margin-no top-padding-no bottom-padding-no">{{text}}</p>',
        '</div>',
        '</div>'
    ].join('\n'));

    var getDetailsView = function(eventParams) {
        var params = {
            processId: eventParams.model.get('PROCESSINSTANCEID'),
            triggerElement: this.$('.dropdown--quickmenu > button')
        };
        ADK.PatientRecordService.setCurrentPatient(eventParams.model.get('PATIENTICN'), {
            confirmationOptions: {
                navigateToPatient: false,
                reconfirm: Util.isStaffView()
            },
            triggerElement: params.triggerElement,
            callback: function() {
                ADK.Messaging.getChannel('task_forms').request('activity_detail', params);
            }
        });
    };

    var view = ADK.AppletViews.GridView.extend({
        DataGrid: DataGrid.extend({
            DataGridRow: DataGridRow.extend({
                attributes: function() {
                    var orig = DataGridRow.prototype.attributes.apply(this, arguments);
                    if (!_.isString(this.model.get('DESCRIPTION')) || _.isEmpty(this.model.get('DESCRIPTION').trim())) {
                        return orig;
                    }
                    return _.extend({}, orig, {
                        'data-toggle': 'popover',
                        'data-content': tooltip({
                            text: this.model.get('DESCRIPTION')
                        })
                    });
                }
            })
        }),
        _super: ADK.AppletViews.GridView.prototype,
        initialize: function(options) {
            var toolbarView, assignedTo, status, dateFilter;
            this.taskCollection = new ADK.UIResources.Fetch.Tasks.Tasks({
                isClientInfinite: true
            });
            this.expandedAppletId = this.options.appletConfig.instanceId;

            if (this.options.appletConfig.fullScreen) {
                this.parentWorkspace = ADK.Messaging.request('get:current:workspace');
                var expandedModel = ADK.SessionStorage.get.sessionModel('expandedAppletId');
                if (!_.isUndefined(expandedModel) && !_.isUndefined(expandedModel.get('id'))) {
                    this.expandedAppletId = expandedModel.get('id');
                }
            }

            assignedTo = ADK.SessionStorage.getAppletStorageModel(this.expandedAppletId, 'assignedTo', true, this.parentWorkspace) || 'teamroles';
            if (this.columnsViewType === 'summary') {
                status = 'Active';
            } else {
                status = ADK.SessionStorage.getAppletStorageModel(this.expandedAppletId, 'status', true, this.parentWorkspace) || 'Active';
            }
            if (Util.isStaffView()) {
                dateFilter = {
                    fromDate: moment().subtract('years', 2).format('MM/DD/YYYY'),
                    toDate: moment().add('months', 6).format('MM/DD/YYYY')
                };
            } else {
                dateFilter = ADK.SessionStorage.getModel('globalDate').toJSON();
            }

            if (this.sharedModel === undefined) {
                this.sharedModel = new SharedModel({
                    assignedTo: assignedTo,
                    status: status,
                    dateFilter: dateFilter
                });
            }
            this.assignedToOptionChanged = function(model) {
                assignedTo = model.get('assignedTo');
                this.criteria.subContext = assignedTo;
                this.refresh();
            };

            this.statusOptionChanged = function(model) {
                status = model.get('status');
                this.criteria.status = statusMappings[status].toString();
                this.refresh();
            };

            this.dateFilterChanged = function(model) {
                var fromDate, toDate;
                dateFilter = model.get('dateFilter');
                if (!_.isUndefined(dateFilter) && !_.isNull(dateFilter)) {
                    fromDate = moment(dateFilter.fromDate).startOf('day').format('YYYYMMDDHHmm');
                    toDate = moment(dateFilter.toDate).endOf('day').format('YYYYMMDDHHmm');
                }

                this.criteria.startDate = fromDate;
                this.criteria.endDate = toDate;
                if (status !== 'Active') {
                    this.$el.find("[name='assignedTo']").prop('disabled', true);
                    this.$el.find("[name='status']").prop('disabled', true);
                    this.refresh();
                }
            };

            this.listenTo(this.sharedModel, 'change:assignedTo', this.assignedToOptionChanged);
            this.listenTo(this.sharedModel, 'change:status', this.statusOptionChanged);
            this.listenTo(this.sharedModel, 'change:dateFilter', this.dateFilterChanged);
            this.listenTo(ADK.Messaging, 'globalDate:selected', function(dateModel) {
                this.dateRangeRefresh('DUEDATEFORMATTED', dateModel.toJSON());
            });
            if (Util.isStaffView()) {
                //provider data
                this.criteria = {
                    context: "user",
                    subContext: assignedTo,
                    status: statusMappings[status].toString(),
                    getNotifications: true
                };
                this.columns = Config[this.columnsViewType].columns.provider;
                this.filterFields = _.pluck(Config.expanded.columns.provider, 'name');
            } else {
                //patient data
                this.criteria = {
                    context: "patient",
                    pid: ADK.PatientRecordService.getCurrentPatient().getIdentifier(),
                    subContext: assignedTo,
                    status: statusMappings[status].toString(),
                    getNotifications: true
                };
                this.columns = Config[this.columnsViewType].columns.patient;
                this.filterFields = _.pluck(Config.expanded.columns.patient, 'name');
            }
            this.criteria.startDate = moment(dateFilter.fromDate).startOf('day').format('YYYYMMDDHHmm');
            this.criteria.endDate = moment(dateFilter.toDate).endOf('day').format('YYYYMMDDHHmm');

            this.taskCollection.fetchCollection(this.columnsViewType, this.criteria);

            this.listenTo(this.taskCollection, 'fetch:success', function(fetchedModel) {
                if (this.columnsViewType === 'summary') {
                    fetchedModel.fullCollection.reset(filterByDueDate(fetchedModel.fullCollection.models), {
                        silent: true
                    });
                }
                this.$el.find("[name='assignedTo']").removeAttr('disabled');
                this.$el.find("[name='status']").removeAttr('disabled');
            });

            this.listenTo(this.taskCollection, 'fetch:error', function() {
                this.$el.find("[name='assignedTo']").removeAttr('disabled');
                this.$el.find("[name='status']").removeAttr('disabled');
            });

            toolbarView = new ToolbarView({
                instanceId: options.appletConfig.instanceId,
                assignedToOptions: assignedToOptions,
                statusOptions: statusOptions,
                sharedModel: this.sharedModel,
                expandedAppletId: this.expandedAppletId,
                parentWorkspace: this.parentWorkspace,
                isSummaryView: (this.columnsViewType === 'summary'),
                isStaffView: Util.isStaffView()
            });

            var columnsViewType = this.columnsViewType;
            this.appletOptions = {
                columns: this.columns,
                collection: this.taskCollection,
                filterFields: _.union(this.filterFields, ['dueDate'], ['INSTANCENAME']),
                onClickRow: this.onClickRow,
                toolbarView: toolbarView,
                filterDateRangeEnabled: true,
                filterDateRangeField: {
                    name: "DUEDATEFORMATTED",
                    label: "Date",
                    format: "YYYYMMDDHHmm"
                },
                tileOptions: {
                    quickMenu: {
                        enabled: true,
                        buttons: [{
                            type: 'detailsviewbutton',
                            onClick: getDetailsView
                        }, {
                            type: 'gotoactionbutton',
                            actionType: 'task',
                            shouldShow: function() {
                                return this.model.get('actionable') === true;
                            },
                            onClick: function(event, model) {
                                EventHandler.todoListViewOnClickRow.call(this, model, event);
                            }
                        }]
                    },
                    actions: {
                        enabled: true,
                        actionType: 'task',
                        shouldShow: function(model) {
                            return model.get('actionable');
                        },
                        onClickButton: function(event, model) {
                            EventHandler.todoListViewOnClickRow.call(this, model, event);
                            event.currentTarget.focus();
                        }
                    },
                    notifications: {
                        enabled: true,
                        container: '.notification-container',
                        titleAttr: 'NOTIFICATIONTITLE',
                        shouldShow: function(model) {
                            return model.get('NOTIFICATION');
                        }
                    },
                    primaryAction: {
                        enabled: true,
                        onClick: getDetailsView
                    },
                    quickLooks: {
                        enabled: function() {
                            return columnsViewType === 'summary';
                        }
                    }
                }
            };

            this.listenTo(ADK.Messaging.getChannel('activities'), 'create:success', function() {
                ADK.Messaging.trigger('refresh:applet:todo_list');
            });

            this.listenTo(ADK.Messaging, 'refresh:applet:todo_list', _.bind(function() {
                var collection = this.appletOptions.collection;

                if (!_.isUndefined(this.appletContainer)) {
                    this.loading();
                    this.setAppletView();
                }

                if (collection instanceof Backbone.PageableCollection) {
                    collection.fullCollection.reset();
                } else {
                    collection.reset();
                }

                ADK.ResourceService.clearCache(collection.url);
                this.taskCollection.fetchCollection(this.columnsViewType, this.criteria);
            }, this));
            this._super.initialize.apply(this, arguments);
        },
        onBeforeDestroy: function() {
            ADK.Messaging.getChannel('task_forms').off('modal:close');
        },
        onShow: function() {
            if (this.appletOptions.appletConfig.fullScreen) {
                if (Util.isStaffView()) {
                    this.$el.find('#2yr-range-' + this.appletOptions.appletId).addClass('active-range');
                }
                this.$el.find('#filter-from-date-' + this.appletOptions.appletId).val(this.sharedModel.get('dateFilter').fromDate);
                this.$el.find('#filter-to-date-' + this.appletOptions.appletId).val(this.sharedModel.get('dateFilter').toDate);
            }
            this._super.onShow.apply(this, arguments);
        },
        dateRangeRefresh: function(filterParameter, options) {
            this.sharedModel.set('dateFilter', options);
        }
    });

    return view;
});