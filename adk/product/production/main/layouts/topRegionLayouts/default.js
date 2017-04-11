define([
    "backbone",
    "marionette",
    "underscore",
    "hbs!main/layouts/topRegionLayouts/templates/default"
], function(Backbone, Marionette, _, Template) {
    "use strict";

    var layoutView = Backbone.Marionette.LayoutView.extend({
        behaviors: {
            ZIndex: {
                eventString: 'show.bs.dropdown',
                cleanupEventString : 'hidden.bs.dropdown'
            }
        },
        template: Template,
        className: "navbar-fixed-top",
        regions: {
            header_region: '#header-region'
        }
    });

    return layoutView;
});
