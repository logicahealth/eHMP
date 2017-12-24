define([
    'backbone',
    'underscore',
    'app/resources/fetch/permission/permissions-individual-collection',
    'app/resources/fetch/permission/permissions-set-collection'
], function(Backbone, _, PermissionCollection, PermissionSetCollection) {
    'use strict';


    /**
     * Feature: 1285
     * Original Specification: https://wiki.vistacore.us/x/o4igAQ
     *
     * Because the Permission Sets and Individual Permissions have such a heavy overlap,
     * This model is used create a combined set of eventing to notify the views of changes
     * that did not occur in their primary collection.
     *
     * Three applets share on instance of this data on once:
     * User Management
     * Individual Permissions
     * Permission Sets
     *
     * Because of that, it is important to be careful, to not override fetched data
     * or clutter the models with applet specific information.
     */
    return Backbone.Model.extend({

        /**
         * A flag saying both collections are fetched
         */
        isReady: false,

        /**
         * Standard Backbone.Model initialize
         */
        initialize: function initialize() {
            this.set('permissions', new PermissionCollection());
            this.set('permissionSets', new PermissionSetCollection());
            this.addListeners(this.get('permissions'));
            this.addListeners(this.get('permissionSets'));
        },

        /**
         * Creates listeners on a collection to propagate events though this model.
         * @param {Collection} collection
         */
        addListeners: function addListeners(collection) {
            this.listenTo(collection, 'change', function triggerChange(model) {
                this.trigger('child:collection:change', model, collection);
            });
            this.listenTo(collection, 'update', function triggerUpdate(model) {
                this.trigger('child:collection:update', model, collection);
            });
            this.listenTo(collection, 'add', function triggerAdd(model) {
                this.trigger('child:collection:add', model, collection);
            });
            this.listenTo(collection, 'remove', function triggerRemove(model) {
                this.trigger('child:collection:remove', model, collection);
            });
        },

        fetch: function fetch() {
            if (!this.hasAccess()) {
                return;
            }

            var permissions = this.get('permissions');
            var permissionSets = this.get('permissionSets');

            this.listenToOnce(permissions, 'fetch:success', function permissionsFetched() {
                if (!permissionSets.isEmpty()) {
                    this.trigger('fetch:success');
                }
            });

            this.listenToOnce(permissionSets, 'fetch:success', function setsFetched() {
                if (!permissions.isEmpty()) {
                    this.trigger('fetch:success');
                }
            });

            this.listenTo(this, 'fetch:success', function bothFetched() {
                this.isReady = true;
            });

            permissions.fetchCollection({
                parse: true
            });
            permissionSets.fetchCollection({
                parse: true
            });
        },

        /**
         * Checks User Permissions
         * @return {Boolean}
         */
        hasAccess: function hasAccess() {
            return ADK.UserService.hasPermission('read-user-permission-set');
        }
    });
});