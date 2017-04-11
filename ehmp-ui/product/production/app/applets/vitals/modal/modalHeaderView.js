define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/vitals/modal/headerTemplate'
], function(Backbone, Marionette, _, HeaderTemplate) {
    'use strict';

    var theView;

    return Backbone.Marionette.ItemView.extend({
        events: {
            'click #vitalsPrevious, #vitalsNext': 'navigateModal'
        },

        navigateModal: function(e) {
            var $target = $(e.currentTarget),
                id = $target.attr('id');
            id === 'vitalsPrevious' ? this.theView.getPrevModal() : this.theView.getNextModal();
        },

        template: HeaderTemplate

    });

});
