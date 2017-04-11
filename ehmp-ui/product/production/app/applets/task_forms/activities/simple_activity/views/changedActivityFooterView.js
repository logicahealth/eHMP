define([
    "backbone",
    "marionette",
    "underscore",
    "hbs!app/applets/task_forms/activities/simple_activity/templates/changedActivityFooterTemplate"

], function(Backbone, Marionette, _, ChangedActivityFooterTemplate) {
    'use strict';
    return Backbone.Marionette.ItemView.extend({
        template: ChangedActivityFooterTemplate,

        events: {
            'click .btn-primary': 'onContinue',
            'click .btn-default': function() {
                this.model.set('tasktype', this.model.previous('tasktype'));
                ADK.UI.Alert.hide();
            }
        },
        onContinue: function() {
            var self = this;
            _.each([
                'startdate',
                'duedate',
                'starttime',
                'duetime',
                'taskname',
                'priority'
            ], function(e) {
                switch(e){
                    case 'startdate':
                    self.model.set('startdate', moment().format('MM/DD/YYYY'));
                    break;
                    case 'duedate':
                    self.model.set('startdate', moment().format('MM/DD/YYYY'));
                    break;
                    case 'priority':
                    self.model.set('priority', 'Normal');
                    break;
                    case 'taskname':
                    self.model.set('taskname', 'To do');
                    break;
                    default:
                    self.model.set(e, '');
                    break;

                }
            });
            self.model.set('todonote', '');
            ADK.UI.Alert.hide();

        }
    });
});
