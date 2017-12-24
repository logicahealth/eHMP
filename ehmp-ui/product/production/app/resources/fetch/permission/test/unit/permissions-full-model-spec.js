define([
    'underscore',
    'app/resources/fetch/permission/test/unit/common-spies',
    'app/resources/fetch/permission/test/unit/mock-data',
    'app/resources/fetch/permission/permissions-full-model'
], function(_, spy, mock, Model) {
    'use strict';


    function _eventChecker(model, event, done) {
        var broadcast = 'child:collection:' + event;

        var permissions = model.get('permissions');
        var sets = model.get('permissionSets');
        var counter = 0;

        model.listenTo(model, broadcast, function() {
            counter += 1;
            if (counter === 2) {
                expect(counter).toBe(2);
                done();
            }
        });
        permissions.trigger(event);
        sets.trigger(event);
    }


    describe('Permissions Combined Model', function() {
        var model;
        var eventChecker = _.noop;

        beforeEach(function() {
            model = new Model();

            spy.StringFormatter();

            var permissions = model.get('permissions');
            var permissionSets = model.get('permissionSets');

            permissions.set(mock.permissionCollection(), {parse: true});
            permissionSets.set(mock.setCollection(), {parse: true});

            eventChecker = _.partial(_eventChecker, model);
        });

        it('fires child:collection:change event when child collection changes', function(done) {
            eventChecker('change', done);
        });

        it('fires child:collection:update event when child collection updates', function(done) {
            eventChecker('update', done);
        });

        it('fires child:collection:add event when child collection adds', function(done) {
            eventChecker('add', done);
        });

        it('fires child:collection:remove event when child collection removes', function(done) {
            eventChecker('remove', done);
        });
    });

    describe('Permission Collection fetch with permission', function() {
        var model;

        beforeEach(function() {
            model = new Model();

            spy.StringFormatter();
            spy.hasPermission(function() {
                return true;
            });

            var permissions = model.get('permissions');
            var permissionSets = model.get('permissionSets');
            spyOn(permissions, 'fetchCollection').and.callFake(function() {
                permissions.set(mock.permissionCollection(), {silent: true});
                permissions.trigger('fetch:success');
            });
            spyOn(permissionSets, 'fetchCollection').and.callFake(function() {
                permissionSets.set(mock.setCollection(), {silent: true});
                permissionSets.trigger('fetch:success');
            });
        });

        it('triggers a fetch success after both collections are full', function(done) {
            model.listenTo(model, 'fetch:success', function() {
                // Let the models fetch success listener fire first
                setTimeout(function() {
                    expect(model.isReady).toBe(true);
                    done();
                }, 0);
            });
            model.fetch();
        });
    });

    describe('Permission Collection fetch without permission', function() {
        var model;
        var called;

        beforeEach(function() {
            model = new Model();
            called = false;

            spy.StringFormatter();
            spy.hasPermission(function() {
                return false;
            });

            var permissions = model.get('permissions');
            var permissionSets = model.get('permissionSets');
            spyOn(permissions, 'fetchCollection').and.callFake(function() {
                called = true;
            });
            spyOn(permissionSets, 'fetchCollection').and.callFake(function() {
                called = true;
            });
        });

        it('triggers a fetch success after both collections are full', function(done) {
            model.fetch();
            setTimeout(function() {
                expect(called).toBe(false);
                done();
            }, 0);
        });
    });

});