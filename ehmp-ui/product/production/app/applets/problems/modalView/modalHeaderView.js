define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/problems/modalView/headerTemplate'
], function(Backbone, Marionette, _, HeaderTemplate) {
    'use strict';

    return Backbone.Marionette.ItemView.extend({
        events: {
            'click #ccdPrevious, #ccdNext': 'navigateModal'
        },

        navigateModal: function(e) {
            var $target = $(e.currentTarget);
            var id = $target.attr('id');
            id === 'ccdPrevious' ? this.theView.getPrevModal() : this.theView.getNextModal();
        },

        template: HeaderTemplate

    });

});
