define([
    "backbone",
    "marionette",
    "underscore",
    "hbs!main/components/navigation/navigationTemplate"
], function(Backbone, Marionette, _, PatientHeaderTemplate) {
    "use strict";

    var PatientHeaderView = Backbone.Marionette.ItemView.extend({
        template: PatientHeaderTemplate,
        modelEvents: {
            "change": "render"
        }
    });

    return PatientHeaderView;
});
