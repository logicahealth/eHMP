define([
    "backbone",
    "marionette",
    "underscore",
    "hbs!main/layouts/centerRegionLayouts/templates/fixedLeft"
], function(Backbone, Marionette, _, Template) {
    "use strict";

    var layoutView = Backbone.Marionette.LayoutView.extend({
        template: Template,
        regions: {
            content_left_region: '#content-left-region',
            content_region: '#content-region'
        }
    });

    return layoutView;
});
