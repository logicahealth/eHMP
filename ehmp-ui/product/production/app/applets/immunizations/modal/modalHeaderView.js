define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/immunizations/modal/headerTemplate'
], function(Backbone, Marionette, _, HeaderTemplate) {
    'use strict';

    var theView;

    return Backbone.Marionette.ItemView.extend({
        events: {
            'click #immunizationsPrevious, #immunizationsNext': 'navigateModal'
        },

        navigateModal: function(e) {
            var $target = $(e.currentTarget),
                id = $target.attr('id');
            //The purpose of this is to execute the functions and do the check on the id
            id === 'immunizationsPrevious' ? this.theView.getPrevModal(id) : this.theView.getNextModal(id);
        },

        template: HeaderTemplate

    });

});
