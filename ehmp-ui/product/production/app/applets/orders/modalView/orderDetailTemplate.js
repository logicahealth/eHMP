define([
    'main/ADK',
    'backbone',
    'handlebars',
], function(ADK, Backbone, Handlebars) {
    "use strict";

    Handlebars.registerHelper('breaklines', function(text) {
        text = Handlebars.Utils.escapeExpression(text);
        text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
        return new Handlebars.SafeString(text);
    });

    return Handlebars.compile('{{#if errorMessage}}<div class="alert alert-warning alert-dismissible" role="alert"><div>{{errorMessage}}</div></div>{{/if}}<div><div>{{breaklines detailSummary}}</div>');
});