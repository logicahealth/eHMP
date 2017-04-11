define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/ccd_grid/modal/headerTemplate'
], function(Backbone, Marionette, _, HeaderTemplate) {
    'use strict';

    var theView;

    //Modal Navigation Item View
    return Backbone.Marionette.ItemView.extend({
        events: {
            'click #ccdPrevious, #ccdNext': 'navigateModal'
        },

        navigateModal: function(e) {
            var $target = $(e.currentTarget),
                id = $target.attr('id');

            id === 'ccdPrevious' ? this.theView.getPrevModal() : this.theView.getNextModal();
        },

        template: HeaderTemplate

    });

});
