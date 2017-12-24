define([
    'backbone',
    'underscore',
    'backgrid',
    'hbs!app/applets/todo_list/templates/dueStatusTemplateSummary',
    'hbs!app/applets/todo_list/templates/dueStatusTemplateExpanded',
    'hbs!app/applets/todo_list/templates/taskNameSummaryTemplate',
    'hbs!app/applets/todo_list/templates/activityTemplateExpanded',
    'hbs!app/applets/todo_list/templates/actionHeaderTemplate',
    'hbs!app/applets/todo_list/templates/notificationHeaderTemplate',
    'hbs!app/applets/todo_list/templates/notificationTemplate'
], function(Backbone, _, Backgrid, dueStatusSummary, dueStatusExpanded, taskNameSummaryTemplate, activityExpanded, actionHeaderTemplate, notificationHeaderTemplate, notificationTemplate) {
    'use strict';

    var customPrioritySort = function(model) {
        if (model instanceof Backbone.Model) {
            return -model.get("PRIORITY");
        }
        return -model.priority;
    };
    var customDueDateSort = function(model) {
        if (model instanceof Backbone.Model) {
            if (!model.get('ACTIVE')) {
                return '';
            } else {
                return parseInt('' + (model.get('dueTextValue') * 1 + 1) + model.get("earliestDateMilliseconds"));
            }
        } else if (!model.ACTIVE) {
            return '';
        } else {
            return parseInt('' + (model.dueTextValue + 1) + model.earliestDateMilliseconds);
        }
    };
    var customEarliestDateSort = function(model) {
        if (model instanceof Backbone.Model) {
            return model.get("earliestDateMilliseconds");
        }
        return model.earliestDateMilliseconds;
    };
    var customPastDueDateSort = function(model) {
        if (model instanceof Backbone.Model) {
            return model.get("dueDateMilliseconds");
        }
        return model.dueDateMilliseconds;
    };
    var customArrowSort = function(model) {
        if (model instanceof Backbone.Model) {
            return !model.get('actionable');
        }
        return !model.actionable;
    };

    var actionColumn = {
        name: 'ACTION',
        label: '->',
        headerCellTemplate: actionHeaderTemplate,
        flexWidth: 'left-padding-no flex-width-0_5 text-center',
        cell: Backgrid.HandlebarsCell.extend({
            className: 'handlebars-cell flex-width-0_5 left-padding-no action-container valign-middle'
        }),
        template: '',
        sortValue: customArrowSort
    };

    var notificationColumn = {
        name: 'NOTIFICATION',
        label: '',
        headerCellTemplate: notificationHeaderTemplate,
        flexWidth: 'flex-width-comment left-padding-no right-padding-no',
        cell: Backgrid.HandlebarsCell.extend({
            className: 'handlebars-cell flex-width-comment left-padding-no right-padding-no',
            render: function() {
                this.$el.empty();
                this.$el.html(this.column.get('template')(this.model.toJSON()));
                this.delegateEvents();
                return this;
            }
        }),
        template: notificationTemplate,
        sortable: false
    };

    var taskNameColumnExpanded = {
        name: 'TASKNAMEFORMATTED',
        label: 'Task Name',
        flexWidth: 'flex-width-4',
        cell: Backgrid.StringCell.extend({
            className: 'string-cell flex-width-4'
        })
    };

    var taskNameColumnSummary = {
        name: 'TASKNAMEFORMATTED',
        label: 'Task Name',
        flexWidth: 'flex-width-3',
        cell: Backgrid.HandlebarsCell.extend({
            className: 'handlebars-cell flex-width-3'
        }),
        template: taskNameSummaryTemplate
    };

    var createdOn = {
        name: 'createdOn',
        label: 'Created On',
        flexWidth: 'flex-width-4',
        cell: Backgrid.HandlebarsCell.extend({
            className: 'handlebars-cell flex-width-4'
        }),
        template: '{{createdOnDate}}{{#if createdOnTime}}<br>{{createdOnTime}}{{/if}}',
        sortValue: function(model) {
            return model.get('createdOnDate') + model.get('createdOnTime');
        }
    };

    var Config = {
        summary: {
            columns: {
                provider: [notificationColumn, {
                        name: 'priorityFormatted',
                        label: 'Priority',
                        cell: Backgrid.StringCell.extend({
                            className: 'string-cell'
                        }),
                        sortValue: customPrioritySort
                    }, {
                        name: 'dueText',
                        label: 'Due',
                        cell: Backgrid.HandlebarsCell.extend({
                            className: 'handlebars-cell'
                        }),
                        template: dueStatusSummary,
                        sortValue: customDueDateSort
                    }, {
                        name: 'PATIENTNAMESSN',
                        label: 'Patient Name',
                        cell: Backgrid.StringCell.extend({
                            className: 'string-cell'
                        })
                    },
                    taskNameColumnSummary,
                    actionColumn
                ],
                patient: [notificationColumn, {
                        name: 'priorityFormatted',
                        label: 'Priority',
                        cell: Backgrid.StringCell.extend({
                            className: 'string-cell'
                        }),
                        sortValue: customPrioritySort
                    }, {
                        name: 'dueText',
                        label: 'Due',
                        cell: Backgrid.HandlebarsCell.extend({
                            className: 'handlebars-cell'
                        }),
                        template: dueStatusSummary,
                        sortValue: customDueDateSort
                    },
                    taskNameColumnSummary,
                    actionColumn
                ]
            }
        },
        expanded: {
            columns: {
                provider: [notificationColumn, {
                        name: 'priorityFormatted',
                        label: 'Priority',
                        cell: Backgrid.StringCell.extend({
                            className: 'string-cell'
                        }),
                        sortValue: customPrioritySort
                    }, {
                        name: 'dueText',
                        label: 'Due',
                        flexWidth: 'flex-width-1_5',
                        cell: Backgrid.HandlebarsCell.extend({
                            className: 'handlebars-cell flex-width-1_5'
                        }),
                        template: dueStatusExpanded,
                        sortValue: customDueDateSort
                    }, {
                        name: 'DUEDATEFORMATTED',
                        label: 'Earliest Date',
                        flexWidth: 'flex-width-1_5',
                        cell: Backgrid.StringCell.extend({
                            className: 'string-cell flex-width-1_5'
                        }),
                        sortValue: customEarliestDateSort
                    }, {
                        name: 'EXPIRATIONTIMEFORMATTED',
                        label: 'Latest Date',
                        flexWidth: 'flex-width-1_5',
                        cell: Backgrid.StringCell.extend({
                            className: 'string-cell flex-width-1_5'
                        }),
                        sortValue: customPastDueDateSort
                    }, {
                        name: 'PATIENTNAMESSN',
                        label: 'Patient Name',
                        flexWidth: 'flex-width-2',
                        cell: Backgrid.StringCell.extend({
                            className: 'string-cell flex-width-2'
                        })
                    },
                    taskNameColumnExpanded, {
                        name: 'DESCRIPTION',
                        label: 'Description',
                        flexWidth: 'flex-width-4_5',
                        cell: Backgrid.StringCell.extend({
                            className: 'string-cell flex-width-4_5'
                        })
                    }, {
                        name: 'INTENDEDFOR',
                        label: 'Assigned To',
                        flexWidth: 'flex-width-2',
                        cell: Backgrid.StringCell.extend({
                            className: 'string-cell flex-width-2'
                        })
                    }, {
                        name: 'statusFormatted',
                        label: 'Status',
                        cell: Backgrid.StringCell.extend({
                            className: 'string-cell'
                        })
                    }, {
                        name: 'ACTIVITYDOMAIN',
                        label: 'Activity',
                        flexWidth: 'flex-width-2',
                        cell: Backgrid.StringCell.extend({
                            className: 'string-cell flex-width-2 transform-text-capitalize'
                        })
                    }, createdOn, {
                        name: 'ACTIVITYNAME',
                        label: 'Go to',
                        flexWidth: 'flex-width-3',
                        cell: Backgrid.HandlebarsCell.extend({
                            className: 'handlebars-cell flex-width-3',
                            events: {
                                'click button': "onClickAction"
                            },
                            onClickAction: function(event) {
                                event.stopPropagation();
                                showActivityModal(this.model);
                            }
                        }),
                        template: activityExpanded
                    },
                    actionColumn
                ],
                patient: [notificationColumn, {
                        name: 'priorityFormatted',
                        label: 'Priority',
                        flexWidth: 'flex-width-2_5',
                        cell: Backgrid.StringCell.extend({
                            className: 'string-cell flex-width-2_5'
                        }),
                        sortValue: customPrioritySort
                    }, {
                        name: 'dueText',
                        label: 'Due',
                        flexWidth: 'flex-width-3',
                        cell: Backgrid.HandlebarsCell.extend({
                            className: 'handlebars-cell flex-width-3'
                        }),
                        template: dueStatusExpanded,
                        sortValue: customDueDateSort
                    }, {
                        name: 'DUEDATEFORMATTED',
                        label: 'Earliest Date',
                        flexWidth: 'flex-width-4',
                        cell: Backgrid.StringCell.extend({
                            className: 'string-cell flex-width-4'
                        }),
                        sortValue: customEarliestDateSort
                    }, {
                        name: 'EXPIRATIONTIMEFORMATTED',
                        label: 'Latest Date',
                        flexWidth: 'flex-width-3_5',
                        cell: Backgrid.StringCell.extend({
                            className: 'string-cell flex-width-3_5'
                        }),
                        sortValue: customPastDueDateSort
                    },
                    taskNameColumnExpanded, {
                        name: 'DESCRIPTION',
                        label: 'Description',
                        flexWidth: 'flex-width-4',
                        cell: Backgrid.StringCell.extend({
                            className: 'string-cell flex-width-4',
                        })
                    }, {
                        name: 'INTENDEDFOR',
                        label: 'Assigned To',
                        flexWidth: 'flex-width-3_5',
                        cell: Backgrid.StringCell.extend({
                            className: 'string-cell flex-width-3_5'
                        })
                    }, {
                        name: 'statusFormatted',
                        label: 'Status',
                        flexWidth: 'flex-width-2',
                        cell: Backgrid.StringCell.extend({
                            className: 'string-cell flex-width-2'
                        })
                    }, {
                        name: 'ACTIVITYDOMAIN',
                        label: 'Activity',
                        flexWidth: 'flex-width-5',
                        cell: Backgrid.StringCell.extend({
                            className: 'string-cell flex-width-5 transform-text-capitalize'
                        })
                    },
                    createdOn,
                    {
                        name: 'ACTIVITYNAME',
                        label: 'Go to',
                        flexWidth: 'flex-width-3',
                        cell: Backgrid.HandlebarsCell.extend({
                            className: 'handlebars-cell flex-width-3',
                            events: {
                                'click button': "onClickAction"
                            },
                            onClickAction: function(event) {
                                event.stopPropagation();
                                showActivityModal(this.model);
                            }
                        }),
                        template: activityExpanded
                    },
                    actionColumn
                ]
            }
        }
    };

    return Config;

    function isStaffView() {
        var requestView = ADK.Messaging.request('get:current:screen').config.id;
        return (requestView === 'provider-centric-view' || requestView === 'todo-list-provider-full');
    }

    function showActivityModal(model) {
        var params = {
            processId: model.get('PROCESSINSTANCEID')
        };
        ADK.PatientRecordService.setCurrentPatient(model.get('PATIENTICN'), {
            confirmationOptions: {
                navigateToPatient: false,
                reconfirm: isStaffView()
            },
            callback: function() {
                ADK.Messaging.getChannel('task_forms').request('activity_detail', params);
            }
        });
    }
});