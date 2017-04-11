define([
    'moment',
    'app/applets/task_forms/common/utils/signalNames'
], function(moment, SignalNames) {
    'use strict';

    var ConsultSignals = SignalNames.CONSULT;
    var LabStatusMappings = {
        'urn:va:order-status:comp': 'Complete',
        'urn:va:order-status:hold': 'Hold',
        'urn:va:order-status:flag': 'Flagged',
        'urn:va:order-status:pend': 'Pending',
        'urn:va:order-status:dc': 'Discontinued',
        'urn:va:order-status:actv': 'Active',
        'urn:va:order-status:exp': 'Expired',
        'urn:va:order-status:schd': 'Scheduled',
        'urn:va:order-status:part': 'Partial Results',
        'urn:va:order-status:dlay': 'Delayed',
        'urn:va:order-status:unr': 'Unreleased',
        'urn:va:order-status:dc/e': 'Discontinued/Edit',
        'urn:va:order-status:canc': 'Canceled',
        'urn:va:order-status:laps': 'Lapsed',
        'urn:va:order-status:rnew': 'Renewed',
        'urn:va:order-status:none': 'No Status'
    };

    var Utils = {
        checkTask: function(model, onSuccess) {
            var fetchOptions = {
                resourceTitle: 'tasks-current',
                fetchType: 'POST',
                cache: false,
                criteria: {
                    processInstanceId: model.get('PROCESSID') * 1
                },
                onSuccess: function(collection) {
                    if (collection.length > 0) {
                        var taskModel = collection.models[0];
                        var defId = taskModel.get('DEFINITIONID');

                        var userSession = ADK.UserService.getUserSession().toJSON();
                        var uid = [userSession.site, ';', userSession.duz[userSession.site]].join('');
                        var assignedTo = taskModel.get('ASSIGNEDTO').replace(/,/g, '');
                        var hasPermission = assignedTo === uid;

                        // Complete task if it is a review task then open the detail view
                        if (defId === 'Consult.Review' && hasPermission) {
                            // Complete and refresh
                            var enrichTaskModel = {
                                processInstanceId: taskModel.get('PROCESSINSTANCEID'),
                                deploymentId: taskModel.get('DEPLOYMENTID'),
                                processDefId: taskModel.get('PROCESSID'),
                                patientIcn: model.get('PID'),
                                taskId: taskModel.get('TASKID')
                            };
                            taskModel.set(enrichTaskModel);
                            ADK.Messaging.getChannel('task_forms').trigger(taskModel.get('DEFINITIONID'), {
                                formModel: taskModel
                            });
                        } else {
                            // Not a review task
                            onSuccess();
                        }
                    } else {
                        // There are no tasks left in the activity
                        onSuccess();
                    }
                }
            };

            ADK.ResourceService.fetchCollection(fetchOptions);

        },
        setActions: function(model) {
            var actions = model.get('actions');

            if (!_.isUndefined(actions)) {
                var actionButtons = [];

                _.each(model.get('actions'), function(action) {
                    switch (action) {
                        case ConsultSignals.END:
                            model.set('showDiscontinue', true);
                            break;
                        case ConsultSignals.EDIT:
                            if (ADK.UserService.hasPermission('sign-consult-order')) {
                                actionButtons.push({
                                    signal: action,
                                    label: 'Edit'
                                });
                            }
                            break;
                        case ConsultSignals.APPT.CANCELED:
                            if (ADK.UserService.hasPermission('schedule-consult-order')) {
                                actionButtons.push({
                                    signal: action,
                                    label: 'Cancel Appointment'
                                });
                            }
                            break;
                        case ConsultSignals.APPT.KEPT:
                            if (ADK.UserService.hasPermission('schedule-consult-order')) {
                                actionButtons.push({
                                    signal: action,
                                    label: 'Patient Checked Out of Appointment'
                                });
                            }
                            break;
                        case ConsultSignals.COMPLETE:
                            if (ADK.UserService.hasPermission('complete-consult-order')) {
                                actionButtons.push({
                                    signal: action,
                                    label: 'Mark as Complete'
                                });
                            }
                            break;
                        case ConsultSignals.COMMUNITY.UPDATE.PENDING:
                            actionButtons.push({
                                signal: action,
                                label: 'Update Community Care Appointment - Pending'
                            });
                            break;
                        case ConsultSignals.COMMUNITY.UPDATE.SCHEDULED:
                            actionButtons.push({
                                signal: action,
                                label: 'Update Community Care Appointment - Scheduled'
                            });
                            break;
                        case ConsultSignals.RESCHEDULE:
                            if (ADK.UserService.hasPermission('schedule-consult-order')) {
                                actionButtons.push({
                                    signal: action,
                                    label: 'Update the Scheduled Date'
                                });
                            }
                            break;
                        case ConsultSignals.RELEASE.CONSULT:
                            if (ADK.UserService.hasPermission('complete-consult-order')) {
                                actionButtons.push({
                                    signal: action,
                                    label: 'Disassociate Note'
                                });
                            }
                            break;
                        case ConsultSignals.RELEASE.ECONSULT:
                            if (ADK.UserService.hasPermission('triage-consult-order')) {
                                actionButtons.push({
                                    signal: action,
                                    label: 'Release eConsult'
                                });
                            }
                            break;
                        case ConsultSignals.RELEASE.EWL:
                            if (ADK.UserService.hasPermission('schedule-consult-order')) {
                                actionButtons.push({
                                    signal: action,
                                    label: 'Release from EWL'
                                });
                            }
                            break;
                        case ConsultSignals.RELEASE.COMMUNITY:
                            actionButtons.push({
                                signal: action,
                                label: 'Release from Community Care'
                            });
                            break;
                    }
                });
                model.set('actionButtons', actionButtons);
            }
        },
        enrichConsultModel: function(model) {
            var clinicalObject = model.get('clinicalObject');
            this.setCurrentAppointment(model);

            if (!_.isUndefined(clinicalObject) && !_.isUndefined(clinicalObject.data) && !_.isUndefined(clinicalObject.data.consultOrders) && clinicalObject.data.consultOrders.length > 0) {
                //Newest consult is last in the array
                var consultOrder = clinicalObject.data.consultOrders[clinicalObject.data.consultOrders.length - 1];
                model.set('consultOrder', consultOrder);

                if (!_.isUndefined(consultOrder.conditions) && consultOrder.conditions.length > 0)
                    model.set('consultOrderCondition', consultOrder.conditions[0].name);
                this.setPrerequisiteData(consultOrder);
            }
        },
        setCurrentAppointment: function(model) {
            var appointmentObj = {};
            if (!_.isUndefined(model.get('clinicalObject')) && !_.isUndefined(model.get('clinicalObject').data) && _.isArray(model.get('clinicalObject').data.appointments)) {
                var appointment = model.get('clinicalObject').data.appointments[model.get('clinicalObject').data.appointments.length - 1];

                if (!_.isUndefined(appointment)) {
                    if (!_.isUndefined(appointment.type) && appointment.type.name === 'VA') {
                        appointmentObj.type = 'VA';
                        if (appointment.ewl === false) {
                            if (_.isUndefined(appointment.date)) {
                                appointmentObj.unscheduled = true;
                            } else {
                                appointmentObj.date = appointment.date;
                                appointmentObj.provider = appointment.provider;
                                if (!_.isUndefined(appointment.clinic)) {
                                    appointmentObj.clinic = appointment.clinic.name;
                                }
                            }
                        }
                    } else if (!_.isUndefined(appointment.type) && appointment.ewl === false && !_.isUndefined(appointment.type.name) && (appointment.type.name.toUpperCase() === 'CHOICE' ||
                            appointment.type.name.toUpperCase() === 'DOD' || appointment.type.name.toUpperCase() === 'GEC' || appointment.type.name.toUpperCase() === 'NON-VA CARE' ||
                            appointment.type.name.toUpperCase() === 'SHARING AGREEMENT')) {
                        appointmentObj.type = 'Community Care';
                        appointmentObj.communityCareType = appointment.type.name;
                        if (!_.isUndefined(appointment.status)) {
                            appointmentObj.status = appointment.status.name;
                        }
                    } else if (!_.isUndefined(appointment.type) && !_.isUndefined(appointment.type.name) && appointment.type.name.toUpperCase() === 'ECONSULT') {
                        appointmentObj.type = 'eConsult';
                    } else if (appointment.ewl) {
                        if (!_.isUndefined(model.get('clinicalObject').data.activity) && model.get('clinicalObject').data.activity.state !== 'Scheduling:Underway') {
                            appointmentObj.ewl = true;
                        } else {
                            appointmentObj.unscheduled = true;
                        }
                    }
                }
            } else {
                appointmentObj.unscheduled = true;
            }

            model.set('appointment', appointmentObj);
        },
        setPrerequisiteData: function(consultOrder) {
            var prerequisiteQuestions = [];
            var prerequisiteOrders = [];
            var totalMet = 0;

            if (!_.isUndefined(consultOrder.questions)) {
                _.each(consultOrder.questions, function(question) {
                    var preReqQuestion = {
                        label: question.question
                    };

                    if (!_.isUndefined(question.answer)) {
                        if (question.answer.toUpperCase() === 'C928767E-F519-3B34-BFF2-A2ED3CD5C6C3') {
                            preReqQuestion.value = 'Yes';
                            preReqQuestion.met = true;
                            totalMet++;
                        } else if (question.answer.toUpperCase() === 'D58A8003-B801-3DA2-83C1-E09497C9BB53') {
                            preReqQuestion.value = 'No';
                            preReqQuestion.met = false;
                        } else if (question.answer.toUpperCase() === '3E8DD206-FBDF-4478-9B05-7638682DD102') {
                            preReqQuestion.value = 'Overridden';
                            preReqQuestion.met = true;
                            totalMet++;
                        }
                    }

                    prerequisiteQuestions.push(preReqQuestion);
                });
            }

            if (!_.isUndefined(consultOrder.orderResults)) {
                _.each(consultOrder.orderResults, function(orderResult) {
                    var preReqOrder = {
                        label: orderResult.orderName
                    };

                    if (!_.isUndefined(orderResult.status)) {
                        if (orderResult.status.toUpperCase() === 'ORDER') {
                            preReqOrder.value = 'Ordered';
                            preReqOrder.met = false;
                        } else if (orderResult.status.toUpperCase() === 'OVERRIDE') {
                            preReqOrder.value = 'Overridden';
                            preReqOrder.met = true;
                            totalMet++;
                        } else if (orderResult.status.toUpperCase() === 'SATISFIED') {
                            preReqOrder.value = 'Met by external data';
                            preReqOrder.met = true;
                            totalMet++;
                        } else if (orderResult.status.toUpperCase() === 'PASSED') {
                            preReqOrder.value = 'Complete';
                            preReqOrder.met = true;
                            totalMet++;
                        } else {
                            preReqOrder.value = LabStatusMappings[orderResult.status.toLowerCase()];

                            if (_.isUndefined(preReqOrder.value)) {
                                preReqOrder.value = 'Unknown';
                                preReqOrder.met = false;
                            } else {
                                if (preReqOrder.value === 'Complete') {
                                    preReqOrder.met = true;
                                    totalMet++;
                                } else {
                                    preReqOrder.met = false;
                                }
                            }
                        }
                    }

                    prerequisiteOrders.push(preReqOrder);
                });
            }

            if (prerequisiteQuestions.length > 0) {
                consultOrder.enablePrerequisiteQuestions = true;
            }

            if (prerequisiteOrders.length > 0) {
                consultOrder.enablePrerequisiteOrders = true;
            }

            consultOrder.prerequisiteQuestions = prerequisiteQuestions;
            consultOrder.prerequisiteOrders = prerequisiteOrders;
            consultOrder.totalCount = prerequisiteQuestions.length + prerequisiteOrders.length;
            consultOrder.totalMet = totalMet;
        }
    };
    var channel = ADK.Messaging.getChannel('task_forms');
    channel.reply('get_consult_utils', function() {
        return Utils;
    });
    return Utils;
});