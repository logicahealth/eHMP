// TODO EVENT HANDLER - MAKE GENERIC
define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/task_forms/common/templates/activityOverview_Template'
],
function(Backbone, Marionette, _, Handlebars, ActivityOverviewTemplate) {
    "use strict";

    return Backbone.Marionette.LayoutView.extend({
        template: ActivityOverviewTemplate,
        regions: {
            task_specific_section: '#task-specific-section'
        },
        templateHelpers: function() {
            return {
                showUrgency: function() {
                    var urgency = this.taskVariables.urgency.toLowerCase();
                    return urgency === 'urgent' || urgency === 'emergent' ? true : false;
                },
                urgencyTag: function() {
                    var urgency = this.taskVariables.urgency.toLowerCase();
                    return urgency === 'emergent' ? 'label-danger' : 'label-warning';
                }
            };
        },
        initialize: function(options) {
            // Get task specific view
            this.taskView = options.taskView;

            // TODO: Query for currentTask related to this task
            //  Template needs 'priority', 'dueDate', and 'type' for each task
            var currentTasks = [
                { priority: 'Low', dueDate: '04/05/2016', type: 'Physical Therapy' },
                { priority: 'High', dueDate: '05/06/2016', type: 'Physical Therapy' },
                { priority: 'Med', dueDate: '06/07/2016', type: 'Physical Therapy' }
            ];
            this.model.set('currentTasks', currentTasks);

            // TODO: Query for this tasks history
            //  Template needs all fields below
            var taskHistory = [
                {
                    providerName: 'Ten, Vehu',
                    actionDate: '2015-12-11 10:36',
                    actionTitle: 'SCHEDULING REQUEST - Patient did not respond',
                    actionComment: 'Consult order created for Patient,Eight.'
                },
                {
                    providerName: 'Dr.Sherlock Holmes',
                    actionDate: '2016-22-12 08:14',
                    actionTitle: 'CONSULT REQUEST - Receive & send to scheduling',
                    actionComment: 'The patient is lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
                }
            ];
            this.model.set('taskHistory', taskHistory);
        },
        onShow: function() {
            this.task_specific_section.show(this.taskView);
        }
    });
});
