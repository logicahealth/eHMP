define([
    'backbone'
], function(Backbone) {
    'use strict';
    return Backbone.Collection.extend({
        initialize: function() {
            this.overallStatusRank = 1000;
            this.on('add', this.onAdd);
        },
        onAdd: function(med, options) {
            // This is only guaranteed to work correctly while we create the collection and re-create it later when we want to modify it
            // So, if we change to creating it once and modify it by adding *and* removing, this will be insufficient
            if (med.getStatusRank() < this.overallStatusRank) {
                this.overallStatusRank = med.getStatusRank();
            }
        },
        comparator: function(med) {
            return -1 * med.getEarlierStopAsMoment().valueOf();
        }
    });
});
