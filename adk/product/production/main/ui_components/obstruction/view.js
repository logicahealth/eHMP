define(['underscore', 'backbone'], function(_, Backbone) {
    'use strict';


    return Backbone.Marionette.ItemView.extend({
        behaviors: {
            ZIndex: {
                eventString: 'show:obstruction'
            }
        },
        className: 'modal-backdrop in',
        template: false,
        onRender: function(){
            this.$el.trigger('show:obstruction');
        }
    });
});