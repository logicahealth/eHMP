define(['backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/discharge_followup/util',
    'app/applets/task_forms/common/utils/utils'
], function(Backbone, Marionette, _, Handlebars, Util, TaskUtils) {
    'use strict';

    var eventHandler = {
        onClickActionButton: function(model) {
            var navigation = model.get('NAVIGATION');

            if (_.isObject(navigation)) {
                navigation.parameters.createdBy = {
                    CREATEDBYNAME: model.get('CREATEDBYNAME')
                };
                ADK.PatientRecordService.setCurrentPatient(model.get('PATIENTICN'), {
                    confirmationOptions: {
                        navigateToPatient: true,
                        reconfirm: true
                    },
                    workspaceId: TaskUtils.getWorkspaceId(navigation),
                    staffnavAction: {
                        channel: navigation.channel,
                        event: navigation.event,
                        data: navigation.parameters
                    }
                });
            } else {
                ADK.Messaging.getChannel('activity-management').trigger('show:form', {
                    taskId: model.get('TASKID'),
                    taskDefinitionId: model.get('DEFINITIONID'),
                    clinicalObjectUid: model.get('CLINICALOBJECTUID')
                });
            }
        }
    };

    return eventHandler;
});