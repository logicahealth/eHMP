define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'handlebars',
    'api/Messaging'
], function(
    Backbone,
    Marionette,
    $,
    _,
    Handlebars,
    Messaging
) {
    "use strict";

    return Marionette.Region.extend({
        initialize: function(options) {
            //Obscure background content when a modal with a backdrop, alert, workflow, or fullscreen overlay is opened.
            this.listenTo(Messaging, 'obscure:background:content', function(){
                this.$el.attr('aria-hidden', 'true');
            });
            this.listenTo(Messaging, 'reveal:background:content screen:navigate', function(){
                this.$el.removeAttr('aria-hidden');
            });
        },
    });
});