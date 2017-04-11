define(['backbone',
    'marionette',
    'underscore',
    'handlebars'
], function(Backbone, Marionette, _, Handlebars) {
    "use strict";

    var arrToObj = function(array) {
        var obj = {};
        for (var i = 0, l = array.length; i < l; ++i) {
            obj[array[i].name] = array[i].value;
        }

        return obj;
    };
    var checkIfProviderScreen = function(req) {
        return req === 'provider-centric-view' || req === 'todo-list-provider-full';
    };

    var checkForPID = function(session) {
        return session !== undefined && session.attributes !== undefined && session.attributes.hasOwnProperty('pid');
    };

    var eventHandler = {
        modalButtonsOnClick: function(ev) {
            ev.preventDefault();
        },
        todoListViewOnClickRow: function(model, event, session) {
            //if navigation node is present trigger using it's content
            var navigation = model.get('NAVIGATION');

            if (_.isObject(navigation)) {
                navigation.parameters.createdBy = {
                    CREATEDBYNAME: model.get('CREATEDBYNAME')
                };
                ADK.PatientRecordService.setCurrentPatient(model.get('PATIENTICN'), {
                    reconfirm: this.isStaffView,
                    navigation: this.isStaffView,
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