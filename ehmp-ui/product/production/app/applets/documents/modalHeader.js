define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'hbs!app/applets/documents/modalHeaderTemplate',
    'app/applets/documents/docDetailsDisplayer'
], function(Backbone, Marionette, _, Handlebars, DocHeaderTemplate, DocDetailsDisplayer) {
    'use strict';

    var theView;
    var resultDocCollection;
    var childDocCollection;

    return Backbone.Marionette.ItemView.extend({
        template: DocHeaderTemplate,
        events: {
            'click #modalPrevious, #modalNext': 'navigateModal'
        },
        initialize: function(){
            this.model.set('title', DocDetailsDisplayer.getTitle(this.model, this.model.get('kind')));
        },
        navigateModal: function(e) {
            var region = this.theView.getRegion('view');
            if(!region.hasView()) return;
            var theView = region.currentView;
            var $target = $(e.currentTarget),
                id = $target.attr('id');

            if(id === 'modalPrevious') {
                theView.getPrevModal(this.model, theView, this.resultDoCollection, this.childDocCollection);
            } else {
                theView.getNextModal(this.model, theView, this.resultDoCollection, this.childDocCollection);
            }
        },
        onAttach: function() {
            this.checkIfModalIsEnd();
        },
        checkIfModalIsEnd: function() {
            var modals = this.model.collection.models;
            var next = _.indexOf(modals, this.model) + 1;
            if (next >= modals.length) {
                this.$el.closest('.modal').find('#modalNext').attr('disabled', true);
            }

            next = _.indexOf(modals, this.model) - 1;
            if (next < 0) {
                this.$el.closest('.modal').find('#modalPrevious').attr('disabled', true);
            }
        }
    });
});