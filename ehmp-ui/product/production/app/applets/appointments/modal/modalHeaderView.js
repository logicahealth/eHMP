define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/appointments/modal/headerTemplate'
], function(Backbone, Marionette, _, HeaderTemplate) {
    'use strict';

    //Modal Navigation Item View
    return Backbone.Marionette.ItemView.extend({
        events: {
            'click #ccdPrevious, #ccdNext': 'navigateModal'
        },

        navigateModal: function(e) {
            var $target = $(e.currentTarget),
                id = $target.attr('id');
            id === 'ccdPrevious' ? this.theView.getPrevModal(id) : this.theView.getNextModal(id);

        },
        template: HeaderTemplate

    });

});
