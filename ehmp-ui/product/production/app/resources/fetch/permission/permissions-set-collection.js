define([
    'backbone',
    'underscore',
    'moment',
    'app/resources/fetch/permission/permissions-set-model'
], function(Backbone, _, Moment, SetModel) {
    'use strict';

    var EDIT_RESOURCE = 'permission-set-edit-permissions';

    /**
     * Feature: 1285
     * Original Specification: https://wiki.vistacore.us/x/o4igAQ
     */
    var PermissionSetsCollection = Backbone.Collection.extend({
        fetchOptions: {
            resourceTitle: 'permission-sets-list',
            cache: false,
            pageable: false,
            criteria: {
                filter: 'or(eq(status,active),eq(status,deprecated),eq(status,inactive))'
            }
        },

        comparator: 'label',

        model: SetModel,

        initialize: function() {
            this.listenTo(this, 'update change', this._updateOriginal);
        },

        _updateOriginal: function() {
            this.originalModels = this.toJSON();
        },

        fetchCollection: function fetchCollection(options) {
            return ADK.ResourceService.fetchCollection(_.extend({}, this.fetchOptions, options), this);
        },

        /**
         * Finds all models in this collection that contains the uid
         * @param {String} uid
         */
        findContaining: function findContaining(uid) {
            return this.filter(function(model) {
                return model.hasPermission(uid);
            });
        },

        /**
         * Checks if any permission sets already contain the label
         * @param labelText
         * @return {boolean}
         */
        isUniqueLabel: function(labelText) {
            var lowercaseLabel = labelText.toLowerCase();

            var isUnique = true;
            this.each(function(model) {
                var label = model.get('label');
                var lowercase = label.toLowerCase();
                if (lowercase === lowercaseLabel) {
                    isUnique = false;
                    return false;
                }
            });
            return isUnique;
        },

        /**
         * Write back for adding/removing a single permission from multiple sets.
         * @param {String} uid The permission uid
         * @param {Array} added Array of string uid of permission sets to add
         * @param {Array} removed Array of string uid of permission sets to remove
         */
        assignPermissions: function assignPermissionToSets(uid, added, removed) {
            var self = this;

            var data = {
                addSets: added,
                removeSets: removed,
                permission: uid
            };

            var options = {
                url: ADK.ResourceService.buildUrl(EDIT_RESOURCE),
                type: 'PUT',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(data),
                success: function() {
                    self.onSuccessAssign(uid, added, removed);
                    self.trigger('put:success:assign', self, data);
                },
                error: function(xhr, textStatus, error) {
                    self.trigger('put:error:assign', xhr, textStatus, error);
                }
            };

            this.sync('PUT', this, options);
        },

        /**
         * Called after a assignPermissionsToSets returns in success
         * @param {String} uidPermission The permission uid
         * @param {Array} added Array of string uid of permission sets to add
         * @param {Array} removed Array of string uid of permission sets to remove
         */
        onSuccessAssign: function onSuccessAssign(uidPermission, added, removed) {
            _.each(removed, function(uid) {
                var model = this.get(uid);
                model.removePermission(uidPermission);
            }, this);

            _.each(added, function(uid) {
                var model = this.get(uid);
                model.addPermission(uidPermission);
            }, this);
        },

        /**
         * Will return a collection with all the same values as this collection,
         * but can be safely modified without affecting other applets
         * @param uid
         */
        toPicklist: function toPicklist(uid) {
            var array = this.toPicklistArray(uid);
            return new PermissionSetsCollection(array);
        },

        /**
         * Converts a collection into an array of data resembling a picklist.
         * @param uid
         */
        toPicklistArray: function(uid) {
            var array = [];
            this.each(function(model) {
                if (!model.isDeprecated()) {
                    var isSelected = model.hasPermission(uid);
                    var data = model.toJSON();
                    data.selected = isSelected;
                    data.preselected = isSelected;
                    array.push(data);
                }
            });

            return array;
        }
    });

    return PermissionSetsCollection;
});