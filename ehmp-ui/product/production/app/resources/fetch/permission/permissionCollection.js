/* global ADK */
define([
    'backbone',
    'underscore'
], function(Backbone, _) {
    'use strict';

    /**
     * Helper method to get permission from the ADK
     */
    function getUserPermissions() {
        var session = ADK.UserService.getUserSession() || new Backbone.Model();
        return session.get('permissions');
    }

    var SimpleCollection = Backbone.Collection.extend({
        model: Backbone.Model.extend({idAttribute: 'permission'})
    });

    var Collection = Backbone.Collection.extend({
        orders: [
            'add-consult-order',
            'complete-consult-order',
            'discontinue-consult-order',
            'edit-consult-order',
            'review-result-consult-order',
            'schedule-consult-order',
            'sign-consult-order',
            'triage-consult-order'
        ],
        request: [
            'add-coordination-request',
            'respond-coordination-request',
            'edit-coordination-request'
        ],
        labs: [
            'add-lab-order',
            'discontinue-lab-order',
            'edit-lab-order',
            'enable-lab-order-collect-option',
            'sign-lab-order',
            'follow-up-incomplete-lab-order'
        ],
        model: Backbone.Model.extend({idAttribute: 'permission'}),

        /**
         * Overriding the constructor to ensure eventing on collection creation
         */
        constructor: function constructor(models, options) {
            var _models = models || getUserPermissions();
            var _options  = _.extend({}, options, {silent: false});
            Backbone.Collection.prototype.constructor.call(this, _models, _options);
        },

        /**
         * Creating two nested collections which will hold which permissions the user has
         */
        initialize: function initialize() {
            this._ordersPermissions = new SimpleCollection();
            this._requestPermissions = new SimpleCollection();
            this._labsPermissions = new SimpleCollection();
            this.listenTo(this, 'add', this._onAdd);
            this.listenTo(this, 'remove', this._onRemove);
        },

        /**
         * Since this collection will be built from array strings, parse wraps the string into an object
         * where the string is under the key {parse: permission}
         */
        parse: function parse(response) {
            return _.map(response, function(v) {
                return {permission: v};
            });
        },

        /**
         * Letting set take a string with the just the permission name
         * @param {Backbone.Model|String} models
         * @param {*} [options]
         */
        set: function set(models, options) {
            if (_.isArray(models)) {
                var _models = this.parse(models);
                return Backbone.Collection.prototype.set.call(this, _models, options);
            } else if (_.isString(models)) {
                return Backbone.Collection.prototype.set.call(this, {permission: models}, options);
            }
            return Backbone.Collection.prototype.set.apply(this, arguments);
        },

        /**
         * Allowing remove to work of string.
         * @param {Backbone.Model|String} permission
         * @param {*} [options]
         */
        remove: function remove(permission, options) {
            if (_.isString(permission)) {
                var model = this.get(permission);
                return Backbone.Collection.prototype.remove.call(this, model, options);
            }
            return Backbone.Collection.prototype.remove.apply(this, arguments);
        },

        /**
         * Checks if the user has order permissions
         * @param {String} [permissionName] If provided it will check a specific permission.
         * @returns {boolean}
         */
        hasOrderPermissions: function hasOrderPermissions(permissionName) {
            if (permissionName) {
                var permission = this._ordersPermissions.get(permissionName);
                return !_.isUndefined(permission);
            }
            return this._ordersPermissions.length > 0;
        },

        /**
         * Checks if the user has request permissions
         * @param {String} [permissionName] If provided will check a specific permission
         * @returns {boolean}
         */
        hasRequestPermissions: function hasRequestPermissions(permissionName) {
            if (permissionName) {
                var permission = this._requestPermissions.get(permissionName);
                return !_.isUndefined(permission);
            }
            return this._requestPermissions.length > 0;
        },


        /**
         * Checks if the user has labs permissions
         * @param {String} [permissionName] If provided will check a specific permission
         * @returns {boolean}
         */
        hasLabPermissions: function hasRequestPermissions(permissionName) {
            if (permissionName) {
                var permission = this._labsPermissions.get(permissionName);
                return !_.isUndefined(permission);
            }
            return this._labsPermissions.length > 0;
        },

        /**
         * Checks if the user has a permission that will allow them complete an action
         * @returns {*|boolean}
         */
        hasActions: function hasActions() {
            return this.hasRequestPermissions() ||
                    this.hasOrderPermissions() ||
                    this.hasLabPermissions();
        },

        reset: function() {
            this._ordersPermissions.reset();
            this._requestPermissions.reset();
            this._labsPermissions.reset();
            return Backbone.Collection.prototype.reset.apply(this, arguments);
        },

        _onAdd: function onAdd(model) {
            var permissionName = model.get('permission');
            if (_.contains(this.orders, permissionName)) {
                this._ordersPermissions.add(model);
            }
            if (_.contains(this.request, permissionName)) {
                this._requestPermissions.add(model);
            }
            if (_.contains(this.labs, permissionName)) {
                this._labsPermissions.add(model);
            }
        },
        _onRemove: function onRemove(model) {
            this._ordersPermissions.remove(model);
            this._requestPermissions.remove(model);
            this._labsPermissions.remove(model);
        }
    });

    /**
     * Wrapper for getting permissions from the ADK
     * @static
     */
    Collection.getUserPermission = getUserPermissions;

    return Collection;
});