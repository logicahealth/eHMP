'use strict';

require('../../../../env-setup');

var _ = require('underscore');
var moment = require('moment');

var logger = require(global.VX_DUMMIES + 'dummy-logger');
var wConfig = require(global.VX_ROOT + 'worker-config');
var PjdsClient = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');

var retriever = require(global.OSYNC_UTILS + 'active-user-retriever');

describe('active-user-retriever.js', function() {
    var config = {pjds: _.defaults(wConfig.pjds, {
        protocol: 'http',
        host: 'IP        ',
        port: PORT
    })};

    var pjds = new PjdsClient(logger, logger, config);

    var environment = {
        pjds: pjds
    };

    var testDone;

    beforeEach(function() {
        testDone = false;
        var setUpDone = false;

        runs(function () {
            var user = {uid: 'urn:va:user:9E7A:34534543', site: '9E7A', id: '34534543', lastSuccessfulLogin: moment().format()};

            pjds.addActiveUser(user, function (error, response) {
                if (error) {
                    expect(error).toBeFalsy();
                }

                expect(response.statusCode).toBe(201);
                setUpDone = true;
            });
        });

        waitsFor(function () {return setUpDone;}, 'set up', 20000);
    });

    afterEach(function() {
        var tearDown = false;

        runs(function () {
            pjds.removeActiveUser('urn:va:user:9E7A:34534543', function (error, response) {
                expect(error).toBeFalsy();
                expect(response.statusCode).toBe(200);
                tearDown = true;
            });
        });

        waitsFor(function () {return tearDown;}, 'tear down', 20000);
    });

    it('active user found and returned', function() {
        var users;

        runs(function () {
            retriever.getAllActiveUsers(logger, config, environment, function(error, results) {
                users = results;
                testDone = true;
            });
        });

        waitsFor(function () {return testDone;}, 'test done', 20000);

        runs(function () {
            expect(users.length).toBeTruthy();
            expect(users).toContain(jasmine.objectContaining({uid: 'urn:va:user:9E7A:34534543'}));
        });
    });

    it('active user found but on blacklist and not returned', function() {
        var initBlacklist = false;

        runs(function () {
            pjds.addToOsyncBlist('34534543', '9E7A', 'user', function (error, response) {
                if (error) {
                    expect(error).toBeFalsy();
                }

                expect(response.statusCode).toBe(201);
                initBlacklist = true;
            });
        });

        waitsFor(function () {return initBlacklist;}, 'init black list', 20000);

        var users;

        runs(function () {
            retriever.getAllActiveUsers(logger, config, environment, function(error, results) {
                users = results;
                testDone = true;
            });
        });

        waitsFor(function () {return testDone;}, 'test done', 20000);

        runs(function () {
            expect(users || []).not.toContain(jasmine.objectContaining({uid: 'urn:va:user:9E7A:34534543'}));
        });
        var clearBlacklist = false;

        runs(function () {
            pjds.removeFromOsyncBlist('34534543', '9E7A', 'user', function (error, response) {
                if (error) {
                    expect(error).toBeFalsy();
                }

                expect(response.statusCode).toBe(200);
                clearBlacklist = true;
            });
        });

        waitsFor(function () {return clearBlacklist;}, 'clear black list', 20000);
    });
});