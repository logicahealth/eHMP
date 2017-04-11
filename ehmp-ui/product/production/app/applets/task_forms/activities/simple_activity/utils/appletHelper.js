define([
    'backbone',
    'underscore',
    'moment',
    'app/applets/task_forms/activities/simple_activity/utils/countdown'
], function() {
    "use strict";

    function getRolesTeamService(whatInfo) {
        var user = ADK.UserService.getUserSession().get('pcmm')[0];
        var ret;
        var raw;
        var readyForBackForm;
        switch (whatInfo) {
            case 'roles':
                raw = user.roles;
                readyForBackForm = [{
                    label: 'Select a Role',
                    value: ''
                }];
                _.each(raw, function(roles) {
                    readyForBackForm.push({
                        label: roles,
                        value: roles
                    });
                });

                ret = readyForBackForm;
                break;

            case 'teams':
                raw = user.team;
                readyForBackForm = [{
                    label: 'Select a Team',
                    value: ''
                }];
                _.each(raw, function(teams) {
                    readyForBackForm.push({
                        label: teams,
                        value: teams
                    });
                });

                ret = readyForBackForm;
                break;

            case 'services':
                raw = user.service;
                readyForBackForm = [{
                    label: 'Select a Service',
                    value: ''
                }];
                _.each(raw, function(service) {
                    readyForBackForm.push({
                        label: service,
                        value: service
                    });
                });

                ret = readyForBackForm;
                break;
        }

        return ret;
    }


    var appletHelper = {
        defaults: {
            patientname: ADK.PatientRecordService.getCurrentPatient().get('displayName'),
            patientid: ADK.PatientRecordService.getCurrentPatient().get('pid'),
            service: '',
            team: '',
            role: '',
            duedate: '',
            duetime: '12:10',
            priority: '',
            tasktype: '',
            todonote: '',
            out_completionnote: ''
        },
        setStartDateInterval: function(startDate) {
            var startinterval = countdown(
                new Date(),
                moment(startdate).toDate(),
                countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS
            );
            startinterval = '' + (startinterval.days + 'd') + (startinterval.hours + 'h') + (startinterval.minutes + 'm') + (startinterval.seconds + 's');

            return startinterval;
        },
        fields: function(activityTypes) {
            return [{
                control: 'select',
                // showFilter: true,
                name: 'tasktype',
                label: 'Activity',
                pickList: activityTypes,
                required: true
            }, {
                control: 'container',
                extraClasses: ['row', 'hidden'],
                items: [{
                    control: 'container',
                    items: [{
                        control: 'datepicker',
                        name: 'startdate',
                        label: 'Start Date',
                        extraClasses: ['col-sm-3']
                    }, {
                        control: 'timepicker',
                        name: 'starttime',
                        label: 'Start Time',
                        pickList: {
                            showMeridian: false
                        },
                        extraClasses: ['col-sm-2']
                    }, {
                        control: 'datepicker',
                        name: 'duedate',
                        label: 'Due Date',
                        extraClasses: ['col-sm-3']
                    }, {
                        control: 'timepicker',
                        name: 'duetime',
                        label: 'Due Time',
                        pickList: {
                            showMeridian: false
                        },
                        extraClasses: ['col-sm-2']
                    }, {
                        control: 'select',
                        name: 'priority',
                        label: 'Priority',
                        extraClasses: ['col-sm-2'],
                        pickList: [{

                            label: 'Normal',
                            value: 'Normal'
                        }, {
                            label: 'High',
                            value: 'High'
                        }]
                    }]
                }]
            }, {
                control: 'container',
                extraClasses: ['row', 'hidden'],
                items: [{
                    extraClasses: ["col-sm-12"],
                    control: 'select',
                    name: 'taskname',
                    label: 'Task',
                    pickList: [{


                        label: 'To Do',
                        value: 'To Do'
                    }, {
                        label: 'Education',
                        value: 'Education'
                    }, {
                        label: 'Glucose Management',
                        value: 'Glucose Management'
                    }, {
                        label: 'Fitness',
                        value: 'Fitness'
                    }, {
                        label: 'A1C Lab',
                        value: 'A1C Lab'
                    }, {
                        label: 'Medications',
                        value: 'Medications'
                    }],
                }]
            }, {
                control: 'container',
                extraClasses: ['row', 'hidden'],
                items: [{
                    extraClasses: ['col-sm-12'],
                    control: 'textarea',
                    name: 'todonote',
                    label: 'To Do Notes:',
                    placeholder: 'Enter more information about your task...',
                    rows: 5,
                }],
                required: true

            }];
        },
        columns: [{
                name: 'priorityFormatted',
                label: '!',
                cell: 'string',
                template: _.template('<%= priorityFormatted %>')
            }, {
                name: 'duedatetime',
                label: 'Due Date',
                cell: 'string',
                template: _.template('<%= duedatetime %>')
            }, {
                name: 'service',
                label: 'Service',
                cell: 'string',
                template: _.template('<%= service %>'),
            }, {
                name: 'tasktype',
                label: 'Activity',
                cell: 'string',
                template: _.template('<%= tasktype %>'),
            }, {
                name: 'taskname',
                label: 'Task',
                cell: 'string',
                template: _.template('<%= taskname %>'),
            }, {
                name: 'description',
                label: 'Description',
                cell: 'string',
                template: _.template('<%= description %>')
            }, {
                name: 'status',
                label: 'Status',
                cell: 'string',
                template: _.template('<%= status %>')
            }, {
                name: 'initiator',
                label: 'Created By',
                cell: 'string',
                template: _.template('<%= initiator %>')
            }, {
                name: 'role',
                label: 'Role',
                cell: 'string',
                template: _.template('<%= role %>')
            }, {
                name: 'actualOwnerId',
                label: 'Assigned User',
                cell: 'string',
                template: _.template('<%= actualOwnerId %>')
            }
            /*, {
                        name: 'priority',
                        label: 'Priority',
                        cell: 'String',
                        template: priorityTemplate
                    }, {
                        name: 'createdOn',
                        label: 'Time Created',
                        cell: 'String',
                        template: createdOnTemplate
                    }, {
                        name: 'activationTime',
                        label: 'Time Activated',
                        cell: 'String',
                        template: activationTimeTemplate
                    }, {
                        name: 'expirationTime',
                        label: 'Time Expired',
                        cell: 'String',
                        template: expirationTimeTemplate
                    }*/
        ]
    };

    return appletHelper;
});