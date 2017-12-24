define([
    'underscore',
    'app/resources/fetch/permission/permissions-individual-collection'
], function(_, PermissionsCollection) {
    'use strict';

    var UMAPermissionsCollection = PermissionsCollection.extend({
        /**
         * Used for MultiSelects and Select components, will create a new collection with all references to this
         * collection broken, so data can be safely altered.  Additionally it will create two new fields
         * in the models:  selected, preselected
         * @param {Array} preselectedValues Array of permission UIDs to mark selected and preselected as true
         * @param {Array} [omittedValues] (optional) Array of permission UIDs to skip over and not add to the picklist
         */
        toPicklist: function toPicklist(preselectedValues, omittedValues) {
            var array = this.toPicklistArray(preselectedValues, omittedValues);
            return new UMAPermissionsCollection(array);
        },
        /**
         * Used for MultiSelects and Select components, will create a new Array with all references to this
         * collection broken, so data can be safely altered.  Additionally it will create two new fields
         * in the models:  selected, preselected
         * @param {Array} preselectedValues Array of permission UIDs to mark selected and preselected as true
         * @param {Array} [omittedValues] (optional) Array of permission UIDs to skip over and not add to the picklist
         */
        toPicklistArray: function(preselectedValues, omittedValues) {
            var array = [];
            omittedValues = omittedValues || [];
            this.each(function(model) {
                var isSelected = _.indexOf(preselectedValues, model.get('uid')) !== -1;
                var isOmitted = _.indexOf(omittedValues, model.get('uid')) !== -1;
                if (model.get('status') === 'active' || isSelected) {
                    var data = model.toJSON();
                    data.selected = isSelected;
                    data.preselected = isSelected;
                    if (!isOmitted) {
                        array.push(data);
                    }
                }
            });
            return array;
        },
        /**
         * Creates a new Array with all references to this
         * collection broken, so data can be safely altered.
         * @param {Array} uids Array of permission set UIDs to get label data for
         */
        getLabels: function(uids) {
            return _.map(uids, function(uid) {
                if (!_.isUndefined(this.get(uid))) {
                    return this.get(uid).get('label');
                }
            }.bind(this));
        },
        /**
         * Creates a new Array of models with all references to this
         * collection broken, so data can be safely altered.
         * @param {String} [field='uid'] (optional) selected model attribute to return
         */
        getSelected: function(field) {
            field = field || 'uid';
            var selected = this.where({
                selected: true
            });
            return _.map(selected, function(model) {
                return model.get(field);
            });
        }
    });
    return UMAPermissionsCollection;
});