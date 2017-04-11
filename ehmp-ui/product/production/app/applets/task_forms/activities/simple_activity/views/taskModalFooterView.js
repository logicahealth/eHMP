define([
    "backbone",
    "marionette",
    "underscore",
    'app/applets/task_forms/activities/simple_activity/utils/eventHandler',
    "hbs!app/applets/task_forms/activities/simple_activity/templates/taskModalFooterTemplate",

], function(Backbone, Marionette, _, EventHandler, TaskModalFooterTemplate) {
    'use strict';

    return Backbone.Marionette.ItemView.extend({
        template: TaskModalFooterTemplate,
        templateHelpers: function() {
            var self = this;
            return {
                isReady: function() {
                    if (self.model.get('status').toLowerCase() === 'ready') {
                        return true;
                    }
                    return false;
                },
                inProgress: function() {
                    if (self.model.get('status').toLowerCase() === 'inprogress') {
                        return true;
                    }
                    return false;
                },
                isComplete: function() {
                    if (self.model.get('status').toLowerCase() === 'complete') {
                        return true;
                    }
                    return false;
                },
                isFollowUp: function() {
                    if (self.model.get('followup') === true && self.model.get('status').toLowerCase() !== 'complete') {
                        return true;
                    }
                    return false;
                }

            };
        },
        modelEvents: {
            'change:followup': 'rerender'
        },
        rerender: function(){
            this.render();
        },
        events: {
            'click  .doSomething': 'doSomethingWithTask'
        },
        doSomethingWithTask: function(e) {
            EventHandler.editSimpleTask.call(this, e, this.taskListView);
        },
        initialize: function(options) {
            this.parentView = options.parentView;
            this.model = this.parentView.model;
            this.taskListView = options.taskListView;
        }
    });
});