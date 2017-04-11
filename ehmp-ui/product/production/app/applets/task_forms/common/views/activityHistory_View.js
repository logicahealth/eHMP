define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/task_forms/common/templates/activityHistory_Template'
    ], function(Backbone, Marionette, _, Handlebars, activityHistoryTemplate) {
        'use strict';
        return Backbone.Marionette.ItemView.extend({
            template: activityHistoryTemplate
        });
    });