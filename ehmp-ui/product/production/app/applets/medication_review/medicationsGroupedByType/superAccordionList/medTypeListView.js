define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars',
    'app/applets/medication_review/medicationsGroupedByType/superAccordionRow/medTypeRowView'
], function(_, Backbone, Marionette, Handlebars, MedTypeRowView) {
    'use strict';
    var LoadingView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<p class="loading"><i class="fa fa-spinner fa-spin"></i> Loading...</p>')
    });
    return Backbone.Marionette.CollectionView.extend({
        childView: MedTypeRowView,
        emptyView: LoadingView,
        setEmptyMessage: function(errorMessage) {
            this.emptyView = Backbone.Marionette.ItemView.extend({
                template: _.template('<p class="emptyMedsList">No Records Found</p>')
            });
        },
        className: "panel-group medsReviewApplet_mainContentArea",
        childViewOptions: function() {
            return {
                appletInstanceId: this.appletInstanceId
            };
        },
        initialize: function(options) {
            this.appletInstanceId = options.appletInstanceId;
            if (options.collection.length > 0) {
                this.collection = options.collection;
            } else {
                this.setEmptyMessage();
            }
        },
        onRender: function() {
            this.$el.attr('id', 'accordion-' + this.appletInstanceId);
        }
    });
});