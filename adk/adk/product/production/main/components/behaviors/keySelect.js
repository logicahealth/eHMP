define([
    'backbone',
    'marionette'
], function(Backbone, Marionette) {
    "use strict";

    var KeySelect = Backbone.Marionette.Behavior.extend({
        events: {
            'keydown a,button,.btn,[type=button],[type=submit]': 'select'
        },
        select: function(e) {
            if(e.isDefaultPrevented() || !/(13|32)/.test(e.which)) return;
            e.stopImmediatePropagation();
            e.preventDefault();
            e.target.click();
        }
    });

    return KeySelect;
});