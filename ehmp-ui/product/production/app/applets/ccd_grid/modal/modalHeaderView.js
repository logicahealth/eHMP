define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/ccd_grid/modal/headerTemplate'
], function(Backbone, Marionette, _, HeaderTemplate) {
    'use strict';

    //Modal Navigation Item View
    return Backbone.Marionette.ItemView.extend({
        events: {
            'click #ccdPrevious, #ccdNext': 'navigateModal'
        },

        navigateModal: function(e) {
            var $target = this.$(e.currentTarget);
            var id = $target.attr('id');
            if (id === 'ccdPrevious') {
                this.theView.getPrevModal();
            } else {
                this.theView.getNextModal();
            }
        },

        template: HeaderTemplate

    });

});
