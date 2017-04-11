define([
    "backbone",
    "marionette",
    "hbs!app/applets/patient_search/templates/common/blankTemplate"
], function(Backbone, Marionette, blankTemplate) {
    "use strict";

    var BlankView = Backbone.Marionette.ItemView.extend({
        template: blankTemplate
    });

    return BlankView;

});
