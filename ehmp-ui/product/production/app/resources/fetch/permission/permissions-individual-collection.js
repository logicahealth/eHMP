define([
    'backbone',
    'underscore',
    'app/resources/fetch/permission/permissions-individual-model'
], function(Backbone, _, IndividualModel) {
    'use strict';

    /**
     * Feature: 1285
     * Original Specification: https://wiki.vistacore.us/x/o4igAQ
     */
    var IndividualCollection = Backbone.Collection.extend({
        fetchOptions: {
            resourceTitle: 'permissions-list',
            cache: false,
            pageable: false
        },

        model: IndividualModel,

        comparator: 'label',

        fetchCollection: function fetchCollection(options) {
            return ADK.ResourceService.fetchCollection(_.extend({}, this.fetchOptions, options), this);
        },

        /**
         * Used for MultiSelects, will create a new collection with all references to this
         * collection broken, so data can be safely altered.  Additionally it will create two new fields
         * in the models:  selected, preselected
         * @param {Array} selectedArray Array of permission UIDs to mark selected and preselected as true
         */
        toPicklist: function toPicklist(selectedArray) {
            var array = this.toPicklistArray(selectedArray);
            return new IndividualCollection(array);
        },

        /**
         * Used for MultiSelects, will create a new Array with all references to this
         * collection broken, so data can be safely altered.  Additionally it will create two new fields
         * in the models:  selected, preselected
         * @param {Array} selectedArray Array of permission UIDs to mark selected and preselected as true
         */
        toPicklistArray: function(selectedArray) {
            var map = {};
            _.each(selectedArray, function(uid) {
                map[uid] = true;
            });

            return this.map(function detachReferences(model) {
                var data = model.toJSON();
                var isSelected = _.get(map, model.get('uid'), false);
                data.selected = isSelected;
                data.preselected = isSelected;
                return data;
            });
        }
    });

    return IndividualCollection;
});