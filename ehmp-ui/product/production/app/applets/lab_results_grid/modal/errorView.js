define([
    "backbone",
    "marionette",
    'handlebars'
], function(Backbone, Marionette, Handlebars) {
    'use strict';

    var ErrorView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ error }}')
    });

    return ErrorView;
});
