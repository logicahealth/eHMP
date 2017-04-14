define([
    "backbone",
    "marionette",
    "underscore",
    "hbs!main/layouts/templates/gridOne"
], function(Backbone, Marionette, _, Template) {
    "use strict";

    var layoutView = Backbone.Marionette.LayoutView.extend({
        template: Template,
        regions: {
            center: "#center"
        }
    });

    return layoutView;
});
