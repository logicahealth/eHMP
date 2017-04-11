define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/appointments/modal/modalTemplate',

], function(Backbone, Marionette, _, modalTemplate) {
    'use strict';

    var ModalView = Backbone.Marionette.ItemView.extend({
        template: modalTemplate,
    });

    return ModalView;
});
