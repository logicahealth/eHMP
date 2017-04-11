define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/applets/orders/modalView/orderDetailTemplate',
    'app/applets/orders/util'
], function(Backbone, Marionette, _, Handlebars, OrderDetailTemplate, Util) {
    'use strict';

    //Modal Content Item View
    return Backbone.Marionette.ItemView.extend({
        modelEvents: {
            "change": "render"
        },
        getTemplate: function() {

            //[Edison T.] Keeping this file in case we need to create templates for different types of orders in the future
            return OrderDetailTemplate;
        }
    });
});