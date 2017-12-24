define(['backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/todo_list/util',
    'app/applets/task_forms/common/utils/utils',
    'app/applets/task_forms/activities/order.dischargefollowup/utils'
], function(Backbone, Marionette, _, Handlebars, Util, TaskUtils, DischargeFollowUpUtils) {
    "use strict";

    var eventHandler = {
        todoListViewOnClickRow: function(model) {
            //if navigation node is present trigger using it's content
            var navigation = model.get('NAVIGATION');
            var isStaffView = Util.isStaffView();
            var isDischargeFollowUp = model.get('DEFINITIONID') === DischargeFollowUpUtils.DISCHARGE_PROCESS_DEFINITION_ID;

            if (_.isObject(navigation)) {
                navigation.parameters.createdBy = {
                    CREATEDBYNAME: model.get('CREATEDBYNAME')
                };
                navigation.parameters.triggerElement = this.$('.dropdown--quickmenu > button');
                ADK.PatientRecordService.setCurrentPatient(model.get('PATIENTICN'), {
                    confirmationOptions: {
                        navigateToPatient: isStaffView || isDischargeFollowUp,
                        reconfirm: isStaffView
                    },
                    workspaceId: TaskUtils.getWorkspaceId(navigation),
                    staffnavAction: {
                        channel: navigation.channel,
                        event: navigation.event,
                        data: navigation.parameters
                    }
                });
            } else {
                //Temporary fallback until all tasks have a navigation node
                //Trigger the activity management form router to open the appropriate form.
                ADK.Messaging.getChannel('activity-management').trigger('show:form', {
                    taskId: model.get('TASKID'),
                    taskDefinitionId: model.get('DEFINITIONID'),
                    clinicalObjectUid: model.get('CLINICALOBJECTUID'),
                    triggerElement: this.$('.dropdown--quickmenu > button')
                });
            }
        }
    };

    return eventHandler;
});