define([
    'underscore',
    'app/resources/fetch/labs/permission/permissionCollection'
], function(_, Collection) {
    'use strict';

    // These test won't run in this folder, I moved them here anyways.

    describe('Permission Collection', function() {

        var userService = _.get(window, 'ADK.UserService.getUserSession', _.noop);
        _.set(window, 'ADK.UserService.getUserSession', userService);
        var model;

        var order = [
            'add-consult-order',
            'complete-consult-order',
            'discontinue-consult-order',
            'edit-consult-order',
            'review-result-consult-order',
            'schedule-consult-order',
            'sign-consult-order',
            'triage-consult-order'
        ];

        var request = [
            'add-coordination-request',
            'respond-coordination-request',
            'edit-coordination-request'
        ];
        var labs = [
            'add-lab-order',
            'discontinue-lab-order',
            'edit-lab-order',
            'enable-lab-order-collect-option',
            'sign-lab-order',
            'follow-up-incomplete-lab-order'
        ];

        beforeEach(function() {
            model = new Backbone.Model({permission: []});
            spyOn(ADK.UserService, 'getUserSession').and.returnValue(model);
        });

        it('has a static method that gets patient permissions', function() {
            var permissions = ['test-permission'];
            model.set('permissions', permissions);
            var checkPermission = Collection.getUserPermission();
            expect(ADK.UserService.getUserSession).toHaveBeenCalled();
            expect(checkPermission).toEqual(permissions);
        });

        it('can create itself without passing an array of models', function() {
            var permissions = 'test-permission';
            model.set('permissions', [permissions]);

            var collection = new Collection();
            var first = collection.first();
            var checkPermission = first.get('permission');
            expect(ADK.UserService.getUserSession).toHaveBeenCalled();
            expect(checkPermission).toEqual(permissions);
        });

        it('can create itself from an array of strings', function() {
            var permission = ['test-one', 'test-two'];
            var collection = new Collection(permission);
            expect(ADK.UserService.getUserSession).not.toHaveBeenCalled();
            expect(collection.length).toBe(2);
            expect(collection.first().get('permission')).toEqual(permission[0]);
            expect(collection.at(1).get('permission')).toEqual(permission[1]);
        });

        it('can add a permission after creation', function() {
            var collection = new Collection(['test-one']);
            collection.add('test-two');
            expect(collection.length).toBe(2);
        });

        it('keeps only unique permissions', function() {
            var permission = 'test-one';
            var array = [permission, permission];
            var collection = new Collection(array);
            expect(collection.length).toBe(1);
            collection.add(permission);
            expect(collection.length).toBe(1);
            collection.add('different-permission');
            expect(collection.length).toBe(2);
        });

        it('its has methods return false when there is no orders or requests data', function() {
            var collection = new Collection();
            expect(collection.hasOrderPermissions()).toBe(false);
            expect(collection.hasLabPermissions()).toBe(false);
            expect(collection.hasRequestPermissions()).toBe(false);
            expect(collection.hasActions()).toBe(false);
        });

        it('can recognize an orders permission', function() {
            _.each(order, function(v) {
                var collection = new Collection([v]);
                expect(collection.hasOrderPermissions()).toBe(true);
                expect(collection.hasActions()).toBe(true);
                expect(collection.hasOrderPermissions(v)).toBe(true);
            });
        });

        it('can recognize a labs permission', function() {
            _.each(labs, function(v) {
                var collection = new Collection([v]);
                expect(collection.hasLabPermissions()).toBe(true);
                expect(collection.hasActions()).toBe(true);
                expect(collection.hasLabPermissions(v)).toBe(true);
            });
        });

        it('can recognize a request permission', function() {
            _.each(request, function(v) {
                var collection = new Collection([v]);
                expect(collection.hasRequestPermissions()).toBe(true);
                expect(collection.hasActions()).toBe(true);
                expect(collection.hasRequestPermissions(v)).toBe(true);
                expect(collection.get(v).get('permission')).toEqual(v);
            });
        });

        it('can be reset', function() {
            var allPermission = [];
            allPermission = allPermission.concat(request);
            allPermission = allPermission.concat(order);
            allPermission = allPermission.concat(labs);
            var collection = new Collection(allPermission);
            expect(collection.length > 0).toBe(true);
            expect(collection.hasRequestPermissions()).toBe(true);
            expect(collection.hasOrderPermissions()).toBe(true);
            expect(collection.hasLabPermissions()).toBe(true);
            collection.reset();
            expect(collection.length === 0).toBe(true);
            expect(collection.hasRequestPermissions()).toBe(false);
            expect(collection.hasOrderPermissions()).toBe(false);
            expect(collection.hasLabPermissions()).toBe(false);
        });

        it('can remove permission', function() {
           var permission = [request[0], labs[0], order[0], 'extra'];
           var collection = new Collection(permission);
            expect(collection.hasRequestPermissions()).toBe(true);
            expect(collection.hasOrderPermissions()).toBe(true);
            expect(collection.hasLabPermissions()).toBe(true);
            collection.remove(request[0]);
            expect(collection.hasRequestPermissions()).toBe(false);
            collection.remove(labs[0]);
            expect(collection.hasLabPermissions()).toBe(false);
            collection.remove(order[0]);
            expect(collection.hasLabPermissions()).toBe(false);
            expect(collection.first().get('permission')).toEqual('extra');
        });

    });
});