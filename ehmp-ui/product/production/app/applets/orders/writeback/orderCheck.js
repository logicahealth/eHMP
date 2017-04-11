define([
    'main/ADK',
    'backbone',
    'handlebars',
], function(ADK, Backbone, Handlebars) {
    "use strict";

    var orderFields = [{
        control: "container",
        template: Handlebars.compile('<strong>Duplicate Order:</strong>{{#each orderCheckResponse}}<div>{{this.orderCheck}}</div>{{/each}}'),
        modelListeners: ["orderCheckResponse"],
    }];

    var formView = ADK.UI.Form.extend({
        model: new Backbone.Model.extend({}),
        fields: orderFields,
    });

    return formView;
});