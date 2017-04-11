define([
    "backbone",
    "marionette",
    "hbs!app/applets/patient_search/templates/common/errorMessageTemplate"
], function(Backbone, Marionette, errorMessageTemplate) {
    "use strict";

    var ErrorMessageView = Backbone.Marionette.ItemView.extend({
        model: new Backbone.Model(),
        template: errorMessageTemplate,
        tagName: "p"
    });

    return ErrorMessageView;

});
