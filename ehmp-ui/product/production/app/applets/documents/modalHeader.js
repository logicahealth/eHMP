define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/documents/modalHeaderTemplate',
    'app/applets/documents/docDetailsDisplayer'
], function(Backbone, Marionette, _, Handlebars, DocHeaderTemplate, DocDetailsDisplayer) {
    'use strict';

    return Backbone.Marionette.ItemView.extend({
        template: DocHeaderTemplate,
        events: {
            'click #modalPrevious': 'goToPreviousModal',
            'click #modalNext': 'goToNextModal'
        },
        templateHelpers: {
            shouldDisable: function() {
                return !this.hasNext || this.fetchingNextPage;
            }
        },
        modelEvents: {
            'change': 'render'
        },
        goToPreviousModal: function(event) {
            this.model.trigger('user.get.previous');
        },
        goToNextModal: function(event) {
            this.model.trigger('user.get.next');
        }
    });
});
