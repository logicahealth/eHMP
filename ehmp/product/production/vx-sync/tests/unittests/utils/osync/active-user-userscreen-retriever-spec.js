'use strict';

var _ = require('lodash');
var moment = require('moment');

require('../../../../env-setup');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var blacklistUtils = require(global.OSYNC_UTILS + 'blacklist-utils');
var PjdsClient = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var activeUserUserScreenRetriever = require(global.OSYNC_UTILS + 'active-user-userscreen-retriever');

var config = {'9E7A': {}};
var pjds = new PjdsClient(log, log, config);
var jds = new JdsClient(log, log, config);

var environment = {
    jds: jds,
    pjds: pjds
};

describe('active user handler', function() {
    var user1, user2, usersList;

    beforeEach(function () {
        user1 = {
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
        user2 = {
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
        usersList = [user1, user2];
    });

    describe('getAllActiveUsers', function () {
        it('return active users', function () {
            spyOn(blacklistUtils, 'isBlackListedUser').andCallFake(function(log, environment, user, callback) {
                return callback(null, false);
            });

            spyOn(jds, 'getActiveUsers').andCallFake(function(callback) {
                callback(null, {statusCode: 200, body: '{"users":' + JSON.stringify(usersList) + '}'});
            });

            activeUserUserScreenRetriever.getAllActiveUsers(log, config, environment, function(error, result) {
                expect(result.length).toBe(1);
                expect(result[0].id).toBe('user1');
            });
        });

        it('return no active users because they are on the black list', function () {
            spyOn(blacklistUtils, 'isBlackListedUser').andCallFake(function(log, config, user, callback) {
                return callback(null, true);
            });

            spyOn(jds, 'getActiveUsers').andCallFake(function(callback) {
                callback(null, {statusCode: 200, body: '{"users":' + JSON.stringify(usersList) + '}'});
            });

            activeUserUserScreenRetriever.getAllActiveUsers(log, config, environment, function(error, result) {
                expect(result.length).toBe(0);
            });
        });

        it('return empty list when no users found', function () {
            spyOn(jds, 'getActiveUsers').andCallFake(function(callback) {
                callback(null, {statusCode: 200, body: {items: []}});
            });

            activeUserUserScreenRetriever.getAllActiveUsers(log, config, environment, function(error, result) {
                expect(result.length).toBe(0);
            });
        });

        it('return empty list when there is an error parsing the response body', function () {
            spyOn(jds, 'getActiveUsers').andCallFake(function(callback) {
                callback(null, {statusCode: 200});
            });

            activeUserUserScreenRetriever.getAllActiveUsers(log, config, environment, function(error, result) {
                expect(result.length).toBe(0);
            });
        });
    });
});
