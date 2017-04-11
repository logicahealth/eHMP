define([
    'backbone'
], function(
    Backbone
) {
    'use strict';

    var SpacerControl = Backbone.View.extend({
        tagName: 'hr',
        attributes: {
            "aria-hidden": "true"
        }
    });

    return SpacerControl;
});
