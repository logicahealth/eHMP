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
            initialize: function(){
                
            }
        });
    });