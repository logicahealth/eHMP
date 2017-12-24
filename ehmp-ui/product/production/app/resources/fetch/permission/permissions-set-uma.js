define([
    'underscore',
    'app/resources/fetch/permission/permissions-set-collection'
], function(_, PermissionSetsCollection) {
    'use strict';

    var UMAPermissionSetsCollection = PermissionSetsCollection.extend({
        /**
         * Used for MultiSelects and Select components, will create a new collection with all references to this
         * collection broken, so data can be safely altered.  Additionally it will create two new fields
         * in the models:  selected, preselected
         * @param {Array} preselectedValues Array of permission set UIDs to mark selected and preselected as true
         * @param {Backbone.Collection} [permissions] (optional) collection instance to fetch permission label data from
         */
        toPicklist: function toPicklist(preselectedValues, permissions) {
            var array = this.toPicklistArray(preselectedValues, permissions);
            return new UMAPermissionSetsCollection(array);
        },
        /**
         * Used for MultiSelects and Select components, will create a new Array with all references to this
         * collection broken, so data can be safely altered.  Additionally it will create two new fields
         * in the models:  selected, preselected
         * @param {Array} preselectedValues Array of permission set UIDs to mark selected and preselected as true
         * @param {Backbone.Collection} [permissionsCollection] (optional) collection instance to fetch permission label data from
         */
        toPicklistArray: function(preselectedValues, permissionsCollection) {
            var array = [];
            this.each(function(model) {
                var isSelected = _.indexOf(preselectedValues, model.get('uid')) !== -1;
                if (model.get('status') === 'active' || isSelected) {
                    var data = model.toJSON();
                    data.selected = isSelected;
                    data.preselected = isSelected;
                    if (permissionsCollection) {
                        data.permissionsLabels = permissionsCollection.getLabels(data.permissions);
                    }
                    array.push(data);
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
        },
        /**
         * Creates a new unique Array of permissions with all references to this
         * collection broken, so data can be safely altered.
         * @param {Array} idList Array of permission set model attributes
         * @param {String} [idField='uid'] (optional) selected model attribute to find permissions with
         */
        getPermissions: function(idList, idField) {
            if (!_.isArray(idList) || _.isEmpty(idList)) {
                return [];
            }
            idField = idField || 'uid';
            var array = [];
            var permissionsModels = this.where(function(model) {
                return _.indexOf(idList, model.get(idField)) >= 0;
            });
            _.each(permissionsModels, function(model) {
                array = array.concat(model.get('permissions'));
            });
            return _.uniq(array).sort();
        },
        /**
         * Creates a new unique Array of selected permissions with all references to this
         * collection broken, so data can be safely altered.
         */
        getSelectedPermissions: function() {
            return this.getPermissions(this.getSelected());
        }
    });
    return UMAPermissionSetsCollection;
});