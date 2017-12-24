define(['underscore', 'backbone'], function(_, Backbone) {
    'use strict';

    /**
     * Feature: 1285
     * Original Specification: https://wiki.vistacore.us/x/o4igAQ
     *
     * Holds the correlation between feature sets and permissions.
     *
     * Feature Item Example
     *
     * {
     *   "uid": "discharge",
     *   "description": "discharge follow-up feature category",
     *   "label": "discharge follow-up",
     *   "permissions": [
     *     "read-discharge-followup",
     *     "edit-discharge-followup",
     *     "discontinue-discharge-followup"
     *   ],
     *   "status": "active"
     * }
     */
    var FeaturesCollection = Backbone.Collection.extend({
        fetchOptions: {
            resourceTitle: 'permission-sets-features',
            cache: true,
            pageable: false
        },

        fetchCollection: function fetchCollection(options) {
            return ADK.ResourceService.fetchCollection(_.extend({}, this.fetchOptions, options), this);
        },

        /**
         * Used for Multi Selects
         * Creates an array that represents the collection with additional fields to
         * indicate was was selected and was what preselected.
         */
        toPicklistArray: function toPicklistArray() {
            return this.map(function createItem(model) {
                var data = model.toJSON();
                data.selected = false;
                data.preselected = false;
                return data;
            });
        },

        /**
         * Used for Multi Selects
         * Creates a picklist Collection that with additional fields to
         * indicate was was selected and was what preselected.
         */
        toPicklist: function toPicklist() {
            var array = this.toPicklistArray();
            return new FeaturesCollection(array);
        }
    });

    return FeaturesCollection;
});