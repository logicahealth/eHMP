define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/problems/modalView/headerTemplate'
], function(Backbone, Marionette, _, HeaderTemplate) {
    'use strict';

    return Backbone.Marionette.ItemView.extend({
        events: {
            'click #ccdPrevious': function() {
                this.theView.getPrevModal();
            },
            'click #ccdNext': function() {
                this.theView.getNextModal();
            }
        },
        template: HeaderTemplate

    });

});