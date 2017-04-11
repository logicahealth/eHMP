define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/task_forms/activities/order.consult/templates/currentAppointment_Template'
    ], function(Backbone, Marionette, _, Handlebars, currentAppointmentTemplate) {
        'use strict';
        return Backbone.Marionette.ItemView.extend({
            template: currentAppointmentTemplate
        });
    });