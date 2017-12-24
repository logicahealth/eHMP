define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/task_forms/activities/order.request/utils',
    'hbs!app/applets/task_forms/activities/order.request/templates/activityDetails_Template'
], function(Backbone, Marionette, _, Handlebars, Utils, RequestDetailsTemplate) {
    'use strict';

    return Backbone.Marionette.ItemView.extend({
        template: RequestDetailsTemplate,
        serializeData: function(test) {
            var data = this.model.toJSON();
            var request = data.request;
            data.templateHeadersText = {
                request: 'Request',
                requestedBy: 'Requested by'
            };
            if (data.showHighlights === true) {
                var startedBy = data.startedBy;
                var highlightText = function(text) {
                    return ADK.utils.stringUtils.addSearchResultElementHighlighting(text, data.highlightKeywords);
                };
                request.highlightedRequest = highlightText(request.request);
                request.highlightedSubmittedByName = highlightText(request.submittedByName);
                request.highlightedTitle = highlightText(request.title);
                request.highlightedUrgency = highlightText(request.urgency);

                data.activityName = highlightText(data.activityName);
                data.domain = highlightText(data.domain);
                data.instanceName = highlightText(data.instanceName);
                data.state = highlightText(data.state);
                data.templateHeadersText.request = highlightText(data.templateHeadersText.request);
                data.templateHeadersText.requestedBy = highlightText(data.templateHeadersText.requestedBy);
                data.startedBy = highlightText(startedBy);
            }
            data.request = request;
            return data;
        },
        initialize: function() {
            Utils.setRequest(this.model);
        }
    });
});
