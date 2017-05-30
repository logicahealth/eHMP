'use strict';

require('../../../../env-setup');

var _ = require('underscore');
var moment = require('moment');

var logger = require(global.VX_DUMMIES + 'dummy-logger');
var wConfig = require(global.VX_ROOT + 'worker-config');
var PjdsClient = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');

var retriever = require(global.OSYNC_UTILS + 'active-user-userscreen-retriever');

var user1 = {
    'duz': {
        '9E7A': 'user1'
    },
    'lastlogin': moment().format(),
    'patientList': [{
        'pid': 'patient1',
        'data': 'some data',
        'information': 'some more data'
    }, {
        'pid': 'patient2',
        'data': 'some different data',
        'information': 'some more different data'
    }]
};
var user2 = {
    'duz': {
        'C877': 'user2'
    },
    'lastlogin': '2014-01-11',
    'patientList': [{
        'pid': 'patient2',
        'data': 'some different data',
        'information': 'some more different data'
    }, {
        'pid': 'patient3',
        'data': 'some information',
        'information': 'some more information'
    }]
};
var usersList = [user1, user2];

describe('active-user-userscreen-retriever.js', function() {
    var config = {jds: _.defaults(wConfig.jds, {
        protocol: 'http',
        host: 'IP        ',
        port: PORT
    }),
        pjds: _.defaults(wConfig.pjds, {
            protocol: 'http',
            host: 'IP        ',
            port: PORT
        })
    };

    var pjds = new PjdsClient(logger, logger, config);
    var jds = new JdsClient(logger, logger, config);

    var environment = {
        jds: jds,
        pjds: pjds
    };

    var testDone;

    beforeEach(function() {
        testDone = false;
        var setUpDone = false;

        runs(function () {
            jds.saveActiveUsers(usersList, function(err) {
                expect(err).toBeFalsy();
                setUpDone = true;
            });
        });

        waitsFor(function () {return setUpDone;}, 'set up', 20000);
    });

    afterEach(function() {
        var tearDown = false;

        runs(function () {
            jds.saveActiveUsers([], function(err) {
                expect(err).toBeFalsy();
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
            expect(users.length).toBe(1);
        });
    });

    it('active user found but on blacklist and not returned', function() {
        var initBlacklist = false;

        runs(function () {
            pjds.addToOsyncBlist('user1', '9E7A', 'user', function (error, response) {
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
            expect(users.length).toBe(0);
        });
    });

    var clearBlacklist = false;

    runs(function () {
        pjds.removeFromOsyncBlist('user1', '9E7A', 'user', function (error, response) {
            if (error) {
                expect(error).toBeFalsy();
            }

            expect(response.statusCode).toBe(200);
            clearBlacklist = true;
        });
    });

    waitsFor(function () {return clearBlacklist;}, 'clear black list', 20000);
});