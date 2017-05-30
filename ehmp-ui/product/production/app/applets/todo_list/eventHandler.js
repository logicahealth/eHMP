define(['backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/todo_list/util'
], function(Backbone, Marionette, _, Handlebars, Util) {
    "use strict";

    var eventHandler = {
        todoListViewOnClickRow: function(model) {
            //if navigation node is present trigger using it's content
            var navigation = model.get('NAVIGATION');
            var isStaffView = Util.isStaffView();

            if (_.isObject(navigation)) {
                navigation.parameters.createdBy = {
                    CREATEDBYNAME: model.get('CREATEDBYNAME')
                };
                ADK.PatientRecordService.setCurrentPatient(model.get('PATIENTICN'), {
                    reconfirm: isStaffView,
                    navigation: isStaffView,
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
                    clinicalObjectUid: model.get('CLINICALOBJECTUID')
                });
            }
        }
    };

    return eventHandler;
});