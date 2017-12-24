define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/task_forms/activities/order.consult/templates/request_Template'
], function(Backbone, Marionette, _, Handlebars, requestTemplate) {
    'use strict';
    return Backbone.Marionette.ItemView.extend({
        template: requestTemplate,
        serializeData: function() {
            var data = this.model.toJSON();
            var fieldsToHighlight = ['consultOrder.request', 'consultOrder.comment'];
            return ADK.Messaging.getChannel('task_forms').request('serialize_data', data, fieldsToHighlight);
        }
    });
});