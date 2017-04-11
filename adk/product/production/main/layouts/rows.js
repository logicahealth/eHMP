define([
    "backbone",
    "marionette",
    "underscore",
    "hbs!main/layouts/templates/rows"
], function(Backbone, Marionette, _, Template) {
    "use strict";

    var layoutView = Backbone.Marionette.LayoutView.extend({
        template: Template,
        regions: {
            rowOne: "#rowOne",
            rowTwo: "#rowTwo"
        },
        className: "contentPadding"
    });

    return layoutView;
});
