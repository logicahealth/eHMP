'use strict';

var _ = require('lodash');

require('../../../../env-setup');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var blacklistUtils = require(global.OSYNC_UTILS + 'blacklist-utils');
var PjdsClient = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');
var activeUserRetriever = require(global.OSYNC_UTILS + 'active-user-retriever');

var config = {};
var pjds = new PjdsClient(log, log, config);
var environment = {
    pjds: pjds
};

describe('active-user-retriever', function() {
    describe('removeBlackListedUsers', function () {
        it('User is on the blacklist so the user is removed from the list', function () {
            spyOn(blacklistUtils, 'isBlackListedUser').andCallFake(function(log, environment, user, callback) {
                return callback(null, true);
            });

            activeUserRetriever._removeBlackListedUsers(log, environment,
                [{uid: 'urn:va:user:9E7A:334533', id: 334533, site: '9E7A'}], function(err, results) {
                    expect(results.length).toBe(0);
                });
            });

        it('User is Not on the blacklist so the user is not removed', function () {
            spyOn(blacklistUtils, 'isBlackListedUser').andCallFake(function(llog, environment, user, callback) {
                return callback(null, false);
            });

            activeUserRetriever._removeBlackListedUsers(log, environment,
                [{uid: 'urn:va:user:9E7A:334533', id: 334533, site: '9E7A'}], function(err, results) {
                    expect(results[0].id).toBe(334533);
                });
            });
    });

    describe('getAllActiveUsers', function () {
        it('return users found', function () {
             spyOn(blacklistUtils, 'isBlackListedUser').andCallFake(function(log, environment, user, callback) {
                return callback(null, false);
            });

            spyOn(pjds, 'getActiveUsers').andCallFake(function(callback) {
                callback(null, {statusCode: 200, body: '{"items": [{"uid": "urn:va:user:9E7A:334533", "id": "334533", "site": "9E7A"}]}'});
            });

            activeUserRetriever.getAllActiveUsers(log, config, environment, function(error, result) {
                expect(result.length).toBe(1);
                expect(result[0].id).toBe('334533');
            });
        });

        it('return empty list when no users found', function () {
            spyOn(pjds, 'getActiveUsers').andCallFake(function(callback) {
                callback(null, {statusCode: 200, body: {items: []}});
            });

            activeUserRetriever.getAllActiveUsers(log, config, environment, function(error, result) {
                expect(result.length).toBe(0);
            });
        });

        it('return empty list when there is an error parsing the response body', function () {
            spyOn(pjds, 'getActiveUsers').andCallFake(function(callback) {
                callback(null, {statusCode: 200});
            });

            activeUserRetriever.getAllActiveUsers(log, config, environment, function(error, result) {
                expect(result.length).toBe(0);
            });
        });
    });
});
