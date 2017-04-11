define([
    'backbone',
    'marionette',
    'underscore',
    'moment',
    'backgrid',
    'app/applets/todo_list/eventHandler',
    'hbs!app/applets/todo_list/templates/duedateRow',
    'hbs!app/applets/todo_list/templates/priorityTemplate'
], function(Backbone, Marionette, _, moment, Backgrid, EventHandler, duedateRow, priorityTemplate) {
    "use strict";

    var customPrioritySort = function(model, sortKey) {
        if (model instanceof Backbone.Model) {
            return model.get("PRIORITY");
        } else return model.priority;
    };
    var customDateSort = function(model, sortKey) {
        if (model instanceof Backbone.Model) {
            return model.get("expirationUnixMilliseconds");
        } else return model.expirationUnixMilliseconds;
    };
    var Config = {
        summary: {
            columns: {
                provider: [{
                    name: 'priority',
                    label: 'Priority',
                    cell: 'handlebars',
                    template: priorityTemplate,
                    sortValue: customPrioritySort,
                    direction: 'ascending'
                }, {
                    name: 'dueText',
                    label: 'Due Date',
                    cell: 'handlebars',
                    template: duedateRow,
                    sortValue: customDateSort
                }, {
                    name: 'PATIENTNAME',
                    label: 'Patient Name',
                    cell: 'string'
                }, {
                    name: 'TASKNAME',
                    label: 'Task',
                    cell: 'string'
                }],
                patient: [{
                    name: 'priority',
                    label: 'Priority',
                    cell: 'handlebars',
                    template: priorityTemplate,
                    sortValue: customPrioritySort,
                    direction: 'ascending'
                }, {
                    name: 'dueText',
                    label: 'Due Date',
                    cell: 'handlebars',
                    template: duedateRow,
                    sortValue: customDateSort
                }, {
                    name: 'PROCESSNAME',
                    label: 'Activity',
                    cell: 'string'
                }, {
                    name: 'TASKNAME',
                    label: 'Task',
                    cell: 'string'
                }]
            }
        },
        expanded: {
            columns: {
                provider: [{
                    name: 'priority',
                    label: 'Priority',
                    cell: 'handlebars',
                    template: priorityTemplate,
                    sortValue: customPrioritySort,
                    direction: 'ascending'
                }, {
                    name: 'dueText',
                    label: 'Due Date',
                    cell: 'handlebars',
                    template: duedateRow,
                    sortValue: customDateSort
                }, {
                    name: 'PATIENTNAME',
                    label: 'Patient Name',
                    cell: 'string'
                }, {
                    name: 'SERVICE',
                    label: 'Service',
                    cell: 'string'
                }, {
                    name: 'PROCESSNAME',
                    label: 'Activity',
                    cell: 'string'
                }, {
                    name: 'TASKNAME',
                    label: 'Task',
                    cell: 'string'
                }, {
                    name: 'DESCRIPTION',
                    label: 'Notes',
                    cell: 'string'
                }, {
                    name: 'CREATEDBYNAME',
                    label: 'Created By',
                    cell: 'string'
                }],
                patient: [{
                    name: 'priority',
                    label: 'Priority',
                    cell: 'handlebars',
                    template: priorityTemplate,
                    sortValue: customPrioritySort,
                    direction: 'ascending'
                }, {
                    name: 'dueText',
                    label: 'Due Date',
                    cell: 'handlebars',
                    template: duedateRow,
                    sortValue: customDateSort
                }, {
                    name: 'SERVICE',
                    label: 'Service',
                    cell: 'string'
                }, {
                    name: 'PROCESSNAME',
                    label: 'Activity',
                    cell: 'string'
                }, {
                    name: 'TASKNAME',
                    label: 'Task',
                    cell: 'string'
                }, {
                    name: 'DESCRIPTION',
                    label: 'Notes',
                    cell: 'string'
                }, {
                    name: 'CREATEDBYNAME',
                    label: 'Created By',
                    cell: 'string'
                }]
            }
        }
    };

    var columns, collection;
    var session;

    var TaskCollection = Backbone.PageableCollection.extend({});

    var taskCollection = new TaskCollection();

    var priority = {
        0: 'High',
        1: 'High',
        2: 'High',
        3: 'High',
        4: 'Medium',
        5: 'Medium',
        6: 'Medium',
        7: 'Low',
        8: 'Low',
        9: 'Low',
        10: 'Low'
    };

    var fetchOptions = {
        resourceTitle: 'tasks-tasks',
        fetchType: 'POST',
        pageable: false,
        cache: false,
        viewModel: {
            parse: function(response) {
                _.each(response.variables, function(item) {
                    response[item.name] = item.value;
                });

                if (response.TASKID) {
                    response.TASKID += '';
                }

                if (response.TASKCREATEDON) {
                    response.TASKCREATEDON = moment(response.TASKCREATEDON).format('MM/DD/YYYY HH:mm:ss');
                }

                var highlight;

                if (response.EXPIRATIONTIME) {
                    response.dueDate = moment(response.EXPIRATIONTIME).format(ADK.utils.dateUtils.defaultOptions().placeholder);
                    highlight = dueOverdue(response.EXPIRATIONTIME);
                    response.dueText = highlight.text;
                    response.dueTextClass = highlight.class;
                    response.expirationUnixMilliseconds = moment(response.EXPIRATIONTIME).valueOf();
                } else {
                    response.dueText = 'N/A';
                }

                if (response.PRIORITY !== undefined) {
                    response.priorityFormatted = priority[response.PRIORITY];
                }

                return response;

            }
        }
    };

    fetchOptions.onSuccess = function(response) {
        response.reset(_.sortBy(response.models, function(obj) {
            return obj.attributes.PRIORITY;
        }));
    };

    var view = ADK.AppletViews.GridView.extend({
        _super: ADK.AppletViews.GridView.prototype,
        sites: [],
        initialize: function(options) {
            var self = this;
            this.viewType = options.appletConfig.viewType;
            this.requestView = ADK.Messaging.request('get:current:screen').config.id;
            if (this.requestView === 'provider-centric-view' || this.requestView === 'todo-list-provider-full') {
                //provider data
                fetchOptions.criteria = {
                    context: "user"
                };
                columns = Config[this.viewType].columns.provider;
            } else {
                //patient data
                fetchOptions.criteria = {
                    context: "patient",
                    patientICN: ADK.PatientRecordService.getCurrentPatient().get('pid')

                };
                columns = Config[this.viewType].columns.patient;
            }
            taskCollection = ADK.ResourceService.fetchCollection(fetchOptions);

            this.appletOptions = {
                columns: columns,
                collection: taskCollection,
                onClickRow: this.onClickRow,
                parent: self
            };
            this._super.initialize.apply(this, arguments);

            var siteOptions = {
                resourceTitle: 'authentication-list',
                cache: false
            };
            siteOptions.onError = function(resp) {};
            siteOptions.onSuccess = function(collection, resp) {
                self.sites = collection;
            };
            ADK.ResourceService.fetchCollection(siteOptions);

            //end of initialize
        },
        onBeforeDestroy: function() {
            ADK.Messaging.getChannel('task_forms').off('modal:close');
        },
        onShow: function() {
            if (this.requestView === 'provider-centric-view' || this.requestView === 'todo-list-provider-full') {
                this.$el.parents('[data-appletid="todo_list"]').find('.panel-title').html('<h5 class="panel-title-label">My tasks</h5>');
            } else {
                this.$el.parents('[data-appletid="todo_list"]').find('.panel-title').html('<h5 class="panel-title-label">All tasks</h5>');
            }
        },
        onRender: function() {
            this._super.onRender.apply(this, arguments);
        },
        onClickRow: function(model, event) {
            var req = ADK.Messaging.request('get:current:screen').config.id;
            if (req === 'provider-centric-view' || req === 'todo-list-provider-full') {
                session = new Backbone.Model({});
                session.attributes = _.cloneDeep(ADK.SessionStorage.get.sessionModel("patient").attributes);
            }
            EventHandler.todoListViewOnClickRow.call(this.parent, model, event, session);
            event.currentTarget.focus();
        }
    });


    return view;

    function dueOverdue(dueDate) {
        //reset times to start of day so day differences work correctly
        var now = moment().startOf('day');
        dueDate = moment(dueDate).startOf('day');
        var highlight = {
            text: '',
            class: undefined
        };
        var diff = 0;
        diff = moment(dueDate).diff(now, 'days');
        switch (diff) {
            case 0:
                highlight.text = 'Due today';
                highlight.class = 'abnormal';
                break;
            case 1:
                highlight.text = 'Due tomorrow';
                highlight.class = 'abnormal';
                break;
            case -1:
                highlight.text = '1 day overdue';
                highlight.class = 'critical';
                break;
            default:
                if (diff > 0) {
                    highlight.text = '';
                    highlight.class = undefined;
                } else {
                    highlight.text = '' + Math.abs(diff) + ' days overdue';
                    highlight.class = 'critical';
                }
                break;
        }

        return highlight;
    }


    //end of function
});
