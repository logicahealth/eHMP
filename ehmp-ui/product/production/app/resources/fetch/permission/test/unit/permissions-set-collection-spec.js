define([
    'underscore',
    'app/resources/fetch/permission/test/unit/common-spies',
    'app/resources/fetch/permission/test/unit/mock-data',
    'app/resources/fetch/permission/permissions-set-collection'
], function(_, spy, mock, Collection) {
    'use strict';


    /**
     * Blocks the sync function
     */
    function setSyncSpy() {
        spyOn(Collection.prototype, 'sync').and.callFake(_.noop);
    }


    /**
     * Blocks the callback functions
     */
    function setSilentCallback() {
        spyOn(Collection.prototype, 'onSuccessAssign').and.callFake(_.noop);
    }


    describe('Permission Set Collection', function() {
        var collection;

        beforeEach(function() {
            spy.StringFormatter();
            collection = new Collection(mock.setCollection(), {parse: true});
        });

        it('can look up a model by uid', function() {
            var original = mock.setCollection();
            var first = collection.get(original[0].uid);
            var second = collection.get(original[1].uid);
            var check = ['uid', 'description', 'label', 'example', 'permissions', 'note'];

            _.each(check, function(key) {
                expect(first.get(key)).toEqual(original[0][key]);
                expect(second.get(key)).toEqual(original[1][key]);
            });
        });

        it('can find containing permissions', function() {
            var withAddPermissionSet = collection.findContaining('add-permission-set');
            var withAddOtherSet = collection.findContaining('add-other-set');
            var withCommonPermission = collection.findContaining('common-permission');

            expect(withAddPermissionSet.length).toBe(1);
            expect(withAddOtherSet.length).toBe(1);
            expect(withCommonPermission.length).toBe(2);
            expect(withAddPermissionSet[0].get('uid')).toBe('acc');
            expect(withAddOtherSet[0].get('uid')).toBe('other');
        });

        it('can tell if the label already exists', function() {
            var existingLabel = collection.first().get('label');
            var originalLabel = 'This label does not exist';

            expect(collection.isUniqueLabel(existingLabel)).toBe(false);
            expect(collection.isUniqueLabel(originalLabel)).toBe(true);
        });

        it('can create a picklist array without preselected items', function() {
            var array = collection.toPicklistArray();

            collection.each(function(model, index) {
                var item = array[index];
                _.each(model.keys(), function(key) {
                    expect(item[key]).toEqual(model.get(key));
                });
                expect(item.selected).toBe(false);
                expect(item.preselected).toBe(false);
            });
        });

        it('can create a picklist array with preselected items', function() {
            var preselectedIndex = 0;
            var original = mock.setCollection();
            var uid = original[preselectedIndex].permissions[0];
            var array = collection.toPicklistArray(uid);

            collection.each(function(model, index) {
                var item = array[index];
                _.each(model.keys(), function(key) {
                    expect(item[key]).toEqual(model.get(key));
                });
                expect(item.selected).toBe(index === preselectedIndex);
                expect(item.preselected).toBe(index === preselectedIndex);
            });
        });

        it('can create a picklist collection without preselected items', function() {
            var picklist = collection.toPicklist();

            collection.each(function(model) {
                var pModel = picklist.get(model.get('uid'));
                _.each(model.keys(), function(key) {
                    expect(pModel.get(key)).toEqual(model.get(key));
                });
                expect(pModel.get('preselected')).toBe(false);
                expect(pModel.get('selected')).toBe(false);
            });
        });

        it('can create a picklist collection with preselected items', function() {
            var preselectedIndex = 0;
            var original = mock.setCollection();
            var uid = original[preselectedIndex].permissions[0];
            var picklist = collection.toPicklist(uid);

            collection.each(function(model, index) {
                var pModel = picklist.get(model.get('uid'));
                _.each(model.keys(), function(key){
                    expect(pModel.get(key)).toEqual(model.get(key));
                });
                expect(pModel.get('preselected')).toBe(index === preselectedIndex);
                expect(pModel.get('selected')).toBe(index === preselectedIndex);
            });
        });
    });

    describe('Permission Set Collection with Deprecated data', function() {
        var collection;

        beforeEach(function() {
            var original = mock.setCollection();
            var modified = {
                version: {
                    introduced: '1.3.1',
                    deprecated: '2.0.0'
                },
                status: 'deprecated'
            };
            _.extend(original[0], modified);

            spy.StringFormatter();
            collection = new Collection(original, {parse: true});
        });

        it('filters deprecated items in toPicklistArray', function() {
            var array = collection.toPicklistArray();
            expect(array.length).toBe(1);
            expect(array[0].uid).toBe(collection.at(1).get('uid'));
        });

        it('filters deprecated items in toPicklist', function() {
            var picklist = collection.toPicklist();
            expect(picklist.length).toBe(1);
            expect(picklist.first().get('uid')).toBe(collection.at(1).get('uid'));
        });
    });

    describe('Permission Set Collection writeback', function() {
        var collection;
        var permission;
        var added;
        var removed;


        beforeEach(function() {
            spy.StringFormatter();
            spy.buildUrl();
            setSyncSpy();
            setSilentCallback();

            var original = mock.setCollection();

            permission = original[0].permissions[0];
            added = [original[1].uid];
            removed = [original[0].uid];

            collection = new Collection(original, {parse: true});
        });

        it('generates the correct request', function() {
            var expectedData = {
                addSets: added,
                removeSets: removed,
                permission: permission
            };
            var dataStr = JSON.stringify(expectedData);

            collection.assignPermissions(permission, added, removed);

            var args = Collection.prototype.sync.calls.argsFor(0);
            var requestType = args[0];
            var thisArg = args[1];
            var data = args[2];

            expect(requestType).toBe('PUT');
            expect(thisArg).toBe(collection);

            expect(data.url).toBe('permission-set-edit-permissions');
            expect(data.type).toBe('PUT');
            expect(data.contentType).toBe('application/json');
            expect(data.dataType).toBe('json');
            expect(data.data).toBe(dataStr);
        });

        it('triggers the success events correctly', function(done) {
            collection.listenTo(collection, 'put:success:assign', function() {
                expect(true).toBe(true);
                done();
            });
            collection.assignPermissions(permission, added, removed);

            var args = Collection.prototype.sync.calls.argsFor(0);
            var options = args[2];

            options.success();
        });

        it('triggers the error events correctly', function(done) {
            collection.listenTo(collection, 'put:error:assign', function() {
                expect(true).toBe(true);
                done();
            });
            collection.assignPermissions(permission, added, removed);

            var args = Collection.prototype.sync.calls.argsFor(0);
            var options = args[2];

            options.error();
        });
    });

    describe('Permission Set Assign Success', function() {

        var collection;
        var permission;
        var added;
        var removed;

        beforeEach(function() {
            spy.StringFormatter();
            var original = mock.setCollection();

            permission = original[0].permissions[0];
            added = [original[1].uid];
            removed = [original[0].uid];

            collection = new Collection(original, {parse: true});
        });

        it('adds and removes items correctly', function() {
            var first = collection.at(0);
            var second = collection.at(1);

            // before
            expect(first.hasPermission(permission)).toBe(true);
            expect(second.hasPermission(permission)).toBe(false);

            collection.onSuccessAssign(permission, added, removed);

            // after
            expect(first.hasPermission(permission)).toBe(false);
            expect(second.hasPermission(permission)).toBe(true);
        });
    });
});