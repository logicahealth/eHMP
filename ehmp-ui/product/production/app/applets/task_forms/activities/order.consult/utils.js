define([
    'moment',
    'app/applets/task_forms/common/utils/signalNames'
], function(moment, SignalNames) {
    'use strict';

    var ConsultSignals = SignalNames.CONSULT;

    var Utils = {
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
                                    label: 'Release Consult'
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
        }
    };

    return Utils;
});