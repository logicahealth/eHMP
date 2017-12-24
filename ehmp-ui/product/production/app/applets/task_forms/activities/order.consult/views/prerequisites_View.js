define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/task_forms/activities/order.consult/templates/prerequisites_Template'
], function(Backbone, Marionette, _, Handlebars, prerequisitesTemplate) {
    'use strict';
    return Backbone.Marionette.ItemView.extend({
        template: prerequisitesTemplate,
        serializeData: function() {
            var data = this.model.toJSON();
            if (data.showHighlights === true) {
                data.templateHeadersText = {
                    prerequisitesExternalData: 'Comment on prerequisites met by external data',
                    prerequisitesOverridden: 'Comment on prerequisites overridden',
                    prerequisites: 'Prerequisites'
                };
                var fieldsToHighlight = ['consultOrder.orderResultComment', 'consultOrder.overrideReason', 
                'templateHeadersText.prerequisitesExternalData', 'templateHeadersText.prerequisitesOverridden', 
                'templateHeadersText.prerequisites'];
                data = ADK.Messaging.getChannel('task_forms').request('serialize_data', data, fieldsToHighlight);
                var highlightText = function(text) {
                    return ADK.utils.stringUtils.addSearchResultElementHighlighting(text, data.highlightKeywords);
                };
                data.domain = highlightText(data.domain);
                _.each(data.consultOrder.prerequisiteQuestions, function(question, index) {
                    question.label = highlightText(question.label);
                    question.value = highlightText(question.value);
                    data.consultOrder.prerequisiteQuestions[index] = question;
                });
                _.each(data.consultOrder.prerequisiteOrders, function(order, index) {
                    order.label = highlightText(order.label);
                    order.value = highlightText(order.value);
                    data.consultOrder.prerequisiteOrders[index] = order;
                });
            }
            return data;
        }
    });
});