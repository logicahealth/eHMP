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
                this.$('.selectedOrder').removeClass('selectedOrder');
                clickedView.$el.addClass('selectedOrder');

                this.parent.updateDetailView(clickedView.model);
            }
        },
        onAddChild: function(childView) {
            if (childView._index === 0) {
                childView.$el.addClass('selectedOrder');
            }
        }
    });
});