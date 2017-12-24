define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/task_forms/common/templates/activityHistory_Template'
], function(Backbone, Marionette, _, Handlebars, activityHistoryTemplate) {
    'use strict';
    return Backbone.Marionette.ItemView.extend({
        template: activityHistoryTemplate,
        serializeData: function() {
            var data = this.model.toJSON();
            if (data.showHighlights === true) {
                var highlightText = function(text) {
                    return ADK.utils.stringUtils.addSearchResultElementHighlighting(text, data.highlightKeywords);
                };
                data.domain = highlightText(data.domain);
                _.each(data.taskHistory, function(task, index) {
                    var filteredTask = _.omit(task, ['signalStatusTimestamp', 'formattedStatusTimestamp']);
                    _.each(filteredTask, function(value, key) {
                        task[key] = highlightText(value);
                    });
                    data.taskHistory[index] = task;
                });
            }
            return data;
        }
    });
});