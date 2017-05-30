define([
    'backbone',
    'marionette',
    'handlebars'
], function (Backbone, Marionette, Handlebars) {
    'use strict';

    return Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('{{ error }}')
    });
});
