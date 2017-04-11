define([
    "backbone",
    "marionette",
    "hbs!app/applets/medication_review_v2/templates/ordersTemplate"
], function(Backbone, Marionette, ordersTemplate) {
    "use strict";

    var OrderDetailView = Backbone.Marionette.ItemView.extend({
        template: ordersTemplate,
    });

    return OrderDetailView;
});