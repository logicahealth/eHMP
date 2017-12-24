define([
    'backbone',
    'api/Messaging',
    'main/ui_components/obstruction/view'
], function(Backbone, Messaging, View) {
    'use strict';

    return Backbone.Marionette.Region.extend({
        initialize: function() {
            this.listenTo(Messaging, 'obscure:content', this.obstruct);
            this.listenTo(Messaging, 'reveal:content', this.reveal);
        },
        obstruct: function() {
            if (!this.hasView()) {
                this.show(new View());
            }
        },
        reveal: function() {
            if (this.hasView()) {
                this.empty();
            }
        }
    });
});

