define([
    'main/ADK',
    'backbone',
    'handlebars',
], function(ADK, Backbone, Handlebars) {
    "use strict";

    return Handlebars.compile('{{#if errorMessage}}<div class="alert alert-warning alert-dismissible" role="alert"><div>{{errorMessage}}</div></div>{{/if}}<div><div>{{breaklines detailSummary}}</div>');
});