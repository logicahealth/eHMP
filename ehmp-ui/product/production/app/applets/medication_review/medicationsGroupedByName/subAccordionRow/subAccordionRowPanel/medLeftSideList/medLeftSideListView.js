define([
    'backbone',
    'marionette',
    'app/applets/medication_review/medicationsGroupedByName/subAccordionRow/subAccordionRowPanel/medLeftSideRow/medLeftSideRowView'
], function(Backbone, Marionette, MedLeftSideRowView) {
    'use strict';
    return Backbone.Marionette.CollectionView.extend({
        initialize: function(options) {
            this.collection = options.collection;
            this.parent = options.parent;
        },
        childView: MedLeftSideRowView,
        childEvents: {
            'on:click': function(clickedView) {
                this.$('.selected-order').removeClass('selected-order');
                clickedView.$el.addClass('selected-order');

                this.parent.updateDetailView(clickedView.model);
            }
        },
        onAddChild: function(childView) {
            if (childView.model.get('uid') === this.model.get('uid')) {
                childView.$el.addClass('selected-order');
            }
        }
    });
});