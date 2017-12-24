/* global expect, describe, it, spyOn, beforeEach */
define([
    'underscore',
    'backbone',
    'moment',
    'app/resources/fetch/permission/test/unit/common-spies',
    'app/resources/fetch/permission/test/unit/mock-data',
    'app/resources/fetch/permission/permissions-set-model'
], function(_, Backbone, Moment, spy, mock, Model) {
    'use strict';


    /**
     * Blocks the sync function
     */
    function setSyncSpy() {
        spyOn(Model.prototype, 'sync').and.callFake(_.noop);
    }


    /**
     * Listens to the purge function
     */
    function setPurgeSpy() {
        spyOn(Model.prototype, 'purge').and.callThrough();
    }


    /**
     * Blocks the callback functions
     */
    function setSilentCallbacks() {
        spyOn(Model.prototype, 'onSaveSuccess').and.callFake(_.noop);
        spyOn(Model.prototype, 'onSaveError').and.callFake(_.noop);
        spyOn(Model.prototype, 'onDeprecateSuccess').and.callFake(_.noop);
        spyOn(Model.prototype, 'onDeprecateError').and.callFake(_.noop);
    }


    describe('Permission Set Model', function() {
        var model;

        beforeEach(function() {
            spy.StringFormatter();
            model = new Model(mock.setItem(), {
                parse: true
            });
        });

        it('parses correctly', function() {
            var original = mock.setItem();

            // Same as original
            expect(model.get('uid')).toBe(original.uid);
            expect(model.get('description')).toBe(original.description);
            expect(model.get('example')).toBe(original.example);
            expect(model.get('label')).toBe(original.label);
            expect(model.get('note')).toBe(original.note);
            expect(model.get('permissions')).toEqual(original.permissions);
            expect(model.get('status')).toBe(original.status);
            expect(model.get('version')).toEqual(original.version);
            expect(model.get('authorUid')).toBe(original.authorUid);
            expect(model.get('authorName')).toBe(original.authorName);
            expect(model.get('lastUpdatedName')).toBe(original.lastUpdatedName);
            expect(model.get('createdDateTime')).toBe(original.createdDateTime);
            expect(model.get('lastUpdatedUid')).toBe(original.lastUpdatedUid);
            expect(model.get('lastUpdatedDateTime')).toBe(original.lastUpdatedDateTime);
            expect(model.get('sub-sets')).toEqual(original['sub-sets']);

            // Generated
            expect(model.get('createdOn')).toBe('01/30/2017');
            expect(model.get('editedOn')).toBe('01/30/2017');

            // Modified
            expect(model.get('nationalAccess')).toBe(original.nationalAccess ? 'Yes' : 'No');
        });

        it('displays pass through items correctly', function() {
            expect(model.display('uid')).toEqual(model.get('uid'));
            expect(model.display('description')).toEqual(model.get('description'));
            expect(model.display('example')).toEqual(model.get('example'));
            expect(model.display('label')).toEqual(model.get('label'));
            expect(model.display('note')).toEqual(model.get('note'));
            expect(model.display('status')).toEqual(model.get('status'));
            expect(model.display('authorUid')).toEqual(model.get('authorUid'));
            expect(model.display('authorName')).toEqual(model.get('authorName'));
            expect(model.display('lastUpdatedName')).toEqual(model.get('lastUpdatedName'));
            expect(model.display('createdDateTime')).toEqual(model.get('createdDateTime'));
            expect(model.display('lastUpdatedUid')).toEqual(model.get('lastUpdatedUid'));
            expect(model.display('lastUpdatedDateTime')).toEqual(model.get('lastUpdatedDateTime'));
            expect(model.display('createdOn')).toEqual(model.get('createdOn'));
            expect(model.display('editedOn')).toEqual(model.get('editedOn'));
            expect(model.display('sub-sets')).toEqual(model.get('sub-sets'));
            expect(model.display('nationalAccess')).toEqual(model.get('nationalAccess'));
        });

        it('alters items with a display function', function() {
            var original = mock.setItem();
            var permissions = _.sortBy(_.get(original, 'permissions')).join(', ');
            var category = _.get(original, 'sub-sets[0]');
            var introduced = _.get(original, 'version.introduced');
            var deprecated = 'N/A';

            expect(model.display('permissions')).toBe(permissions);
            expect(model.display('category')).toBe(category);
            expect(model.display('introduced')).toBe(introduced);
            expect(model.display('deprecated')).toBe(deprecated);
        });

        it('purges extra data', function() {
            model.set('example', '123');
            model.set('abc', '123');
            model.purge();
            expect(model.get('example')).toBe('123');
            expect(model.get('abc')).toBe(undefined);
        });

        it('determines correctly if it has permission', function() {
            //noinspection UnnecessaryLocalVariableJS
            var justin = model;
            var original = mock.setItem();

            var isTrue = model.hasPermission(original.permissions[0]);

            // You won't get this joke a year from now, but i really wanted to rewrite
            // user management as a part of this feature :(
            var isFalse = justin.hasPermission('to-fix-user-management');

            expect(isTrue).toBe(true);
            expect(isFalse).toBe(false);
        });

        it('correctly adds a new permission', function() {
            var permission = 'sudo';
            var before = model.hasPermission(permission);
            var after;

            model.addPermission(permission);
            after = model.hasPermission(permission);

            expect(before).toBe(false);
            expect(after).toBe(true);
        });

        it('will not add a permission it already has', function() {
            var beforePermission = model.get('permissions');
            var beforeLength = beforePermission.length;
            var first = _.first(beforePermission);
            var afterPermission;
            var afterLength;

            model.addPermission(first);
            afterPermission = model.get('permissions');
            afterLength = afterPermission.length;

            expect(beforeLength).toBe(afterLength);
        });

        it('removes a permission correctly', function() {
            var beforePermission = model.get('permissions');
            var beforeLength = beforePermission.length;
            var first = _.first(beforePermission);
            var afterPermission;
            var afterLength;
            var hasFirst;

            model.removePermission(first);
            afterPermission = model.get('permissions');
            afterLength = afterPermission.length;
            hasFirst = model.hasPermission(first);

            expect(beforeLength - 1).toBe(afterLength);
            expect(hasFirst).toBe(false);
        });

        it('checks if it is deprecated correctly', function() {
            var before = model.isDeprecated();
            var after;

            model.set('status', 'deprecated');
            after = model.isDeprecated();
            expect(before).toBe(false);
            expect(after).toBe(true);
        });


    });


    describe('Permission Set Model modifiedByCurrentUser', function() {
        var model;

        beforeEach(function() {
            spy.StringFormatter();
            spy.getUserSession();
            model = new Model(mock.setItem(), {
                parse: true
            });
        });

        it('passes false for isAuthor', function() {
            var today = new Moment().format('MM/DD/YYYY');
            var currentUser = spy.getUserSessionCallback();

            var firstName = currentUser.get('firstname');
            var lastName = currentUser.get('lastname');
            var userUID = currentUser.get('uid');
            var fullName = lastName + ', ' + firstName;

            var before = {
                authorName: model.get('authorName'),
                authorUid: model.get('authorUid'),
                createdOn: model.get('createdOn'),
                createdDateTime: model.get('createdDateTime'),
                lastUpdatedUid: model.get('lastUpdatedUid')
            };

            model.modifiedByCurrentUser(false);

            // Should not change
            expect(model.get('authorName')).toBe(before.authorName);
            expect(model.get('createdDateTime')).toBe(before.createdDateTime);
            expect(model.get('createdOn')).toBe(before.createdOn);
            expect(model.get('authorUid')).toBe(before.authorUid);

            // Should change
            expect(model.get('lastUpdatedName')).toBe(fullName);
            expect(model.get('lastUpdatedUid')).toBe(userUID);
            expect(model.get('editedOn')).toBe(today);
            expect(model.get('lastUpdatedDateTime')).not.toBe(before.lastUpdatedUid);
        });

        it('passes true for isAuthor', function() {
            var today = new Moment().format('MM/DD/YYYY');
            var currentUser = spy.getUserSessionCallback();

            var firstName = currentUser.get('firstname');
            var lastName = currentUser.get('lastname');
            var userUID = currentUser.get('uid');
            var fullName = lastName + ', ' + firstName;

            model.modifiedByCurrentUser(true);

            expect(model.get('authorName')).toBe(fullName);
            expect(model.get('createdOn')).toBe(today);
            expect(model.get('authorUid')).toBe(userUID);
            expect(model.get('lastUpdatedName')).toBe(fullName);
            expect(model.get('lastUpdatedUid')).toBe(userUID);
            expect(model.get('editedOn')).toBe(today);
        });
    });


    describe('Permissions set Model writeback', function() {
        var model;

        beforeEach(function() {
            spy.StringFormatter();
            spy.buildUrl();
            setSyncSpy();
            setPurgeSpy();
            setSilentCallbacks();
            model = new Model(mock.setItem(), {
                parse: true
            });
        });

        it('uses save to create a new model correctly', function() {
            model.unset('uid');
            model.save();

            var args = Model.prototype.sync.calls.argsFor(0);
            var requestType = args[0];
            var thisArg = args[1];
            var data = args[2];

            expect(requestType).toBe('POST');
            expect(thisArg).toEqual(model);
            expect(data.url).toBe('permission-set-add');
            expect(data.type).toBe('POST');
            expect(data.contentType).toBe('application/json');
            expect(data.dataType).toBe('json');
            expect(data.data).toEqual(JSON.stringify(model.toJSON()));
            expect(Model.prototype.purge).toHaveBeenCalled();
        });

        it('uses save to edit a model correctly', function() {
            model.save();

            var args = Model.prototype.sync.calls.argsFor(0);
            var requestType = args[0];
            var thisArg = args[1];
            var data = args[2];

            expect(requestType).toBe('PUT');
            expect(thisArg).toEqual(model);
            expect(data.url).toBe('permission-set-update');
            expect(data.type).toBe('PUT');
            expect(data.contentType).toBe('application/json');
            expect(data.dataType).toBe('json');
            expect(data.data).toEqual(JSON.stringify(model.toJSON()));
            expect(Model.prototype.purge).toHaveBeenCalled();
        });

        it('sets the callbacks correctly for save', function() {
            model.save();

            var args = Model.prototype.sync.calls.argsFor(0);
            var data = args[2];

            expect(Model.prototype.onSaveSuccess).not.toHaveBeenCalled();
            data.success();
            expect(Model.prototype.onSaveSuccess).toHaveBeenCalled();

            expect(Model.prototype.onSaveError).not.toHaveBeenCalled();
            data.error();
            expect(Model.prototype.onSaveError).toHaveBeenCalled();
        });

        it('deprecates a model correctly', function() {
            var version = '2.0.10';
            var expectedData = {
                uid: model.get('uid'),
                deprecatedVersion: version,
                deprecate: true
            };
            var dataStr = JSON.stringify(expectedData);

            model.deprecate(version);

            var args = Model.prototype.sync.calls.argsFor(0);
            var requestType = args[0];
            var thisArg = args[1];
            var data = args[2];

            expect(requestType).toBe('PUT');
            expect(thisArg).toEqual(model);
            expect(data.url).toBe('permission-set-deprecate');
            expect(data.type).toBe('PUT');
            expect(data.contentType).toBe('application/json');
            expect(data.dataType).toBe('json');
            expect(data.data).toEqual(dataStr);
            expect(Model.prototype.purge).toHaveBeenCalled();
        });

        it('sets the callbacks correctly for deprecate', function() {
            model.deprecate('2.1.1');

            var args = Model.prototype.sync.calls.argsFor(0);
            var data = args[2];

            expect(Model.prototype.onDeprecateSuccess).not.toHaveBeenCalled();
            data.success();
            expect(Model.prototype.onDeprecateSuccess).toHaveBeenCalled();

            expect(Model.prototype.onDeprecateError).not.toHaveBeenCalled();
            data.error();
            expect(Model.prototype.onDeprecateError).toHaveBeenCalled();
        });
    });


    describe('Permission Set Model callbacks', function() {
        var model;

        beforeEach(function() {
            spy.StringFormatter();
            spy.getUserSession();
            spy.request();
            model = new Model(mock.setItem(), {
                parse: true
            });
        });

        it('triggers error on failed save', function(done) {
            model.listenTo(model, 'save:error', function() {
                expect(true).toBe(true);
                done();
            });
            model.onSaveError();
        });

        it('triggers error on failed deprecate', function(done) {
            model.listenTo(model, 'deprecate:error', function() {
                expect(true).toBe(true);
                done();
            });
            model.onDeprecateError();
        });

        it('trigger success on save', function(done) {
            model.listenTo(model, 'save:success', function() {
                expect(true).toBe(true);
                done();
            });
            model.onSaveSuccess();
        });

        it('triggers success on deprecate', function(done) {
            model.listenTo(model, 'deprecate:success', function() {
                expect(true).toBe(true);
                done();
            });
            model.onDeprecateSuccess('');
        });

        it('updates the model correctly on saving a new model', function() {
            model.onSaveSuccess();

            var originalData = mock.setItem();
            var currentUser = spy.getUserSessionCallback();

            expect(model.get('authorName')).toBe(originalData.authorName);
            expect(model.get('lastUpdatedUid')).toBe(currentUser.get('uid'));
        });

        it('updates the model correctly on saving an edited model', function() {
            var response = {
                data: {
                    uid: 'fake uid'
                }
            };
            model.onSaveSuccess(response);

            var currentUser = spy.getUserSessionCallback();
            var uid = currentUser.get('uid');

            expect(model.get('authorUid')).toBe(uid);
            expect(model.get('lastUpdatedUid')).toBe(uid);
        });

        it('sets model to deprecated when passing an older version', function() {
            model.onDeprecateSuccess('1.0.0');
            expect(model.isDeprecated()).toBe(true);
        });

        it('does not set the model to deprecated when passing a future version', function() {
            model.onDeprecateSuccess('3.0.0');
            expect(model.isDeprecated()).toBe(false);
        });
    });
});