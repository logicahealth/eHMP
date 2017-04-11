define([
    'underscore',
    'backbone',
    'marionette',
    'moment'
], function(_, Backbone, Marionette, moment) {
    'use strict';
    return Backbone.Marionette.Controller.extend({
        initialize: function(options) {
            this.view = options.view;
            this.unfilteredCollection = options.collection;
            this.filteredCollection = new Backbone.Collection();
            this.setDateModel(options.dateModel);

            this.view.listenTo(this.unfilteredCollection, 'update', _.bind(this.onUpdateUnfilteredCollection, this));
        },
        onUpdateUnfilteredCollection: function() {
            this.filterByDate();
        },
        setDateModel: function(dateModel) {
            this.dateModel = dateModel;
            this.fromDateAsMoment = moment(this.dateModel.get('fromDate'), 'MM/DD/YYYY');
            this.toDateAsMoment = moment(this.dateModel.get('toDate'), 'MM/DD/YYYY');
        },
        onDateChange: function(dateModel) {
            var update = _.bind(function() {
                this.setDateModel(dateModel);
                this.filterByDate();
            }, this);
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(update);
                return;
            }
            update();
        },
        filterByDate: function() {
            var filteredModels;
            if (!this.dateModel || this.dateModel.get('selectedId') === 'allRangeGlobal') {
                filteredModels = this.unfilteredCollection.models;
            } else {
                filteredModels = this.unfilteredCollection.filter(function(medModel) {
                    return medModel.fallsWithinRange(this.fromDateAsMoment, this.toDateAsMoment);
                }, this);
            }

            if (filteredModels.length !== this.filteredCollection.length) {
                this.filteredCollection.set(filteredModels);
                return;
            }
            for (var i = 0; i < filteredModels.length; i++) {
                // This identity check is fast - so no performance concern on this loop
                if (filteredModels[i] !== this.filteredCollection.at(i)) {
                    this.filteredCollection.set(filteredModels);
                    return;
                }
            }

            ADK.Messaging.trigger('meds-review-date-change', this.dateModel);
        }
    });
});