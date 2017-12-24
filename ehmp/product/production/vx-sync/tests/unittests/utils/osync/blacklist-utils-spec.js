'use strict';

var _ = require('lodash');

require('../../../../env-setup');
var log = require(global.VX_DUMMIES + 'dummy-logger');
var blacklistUtils = require(global.OSYNC_UTILS + 'blacklist-utils');
var PjdsClient = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');


var config = {};
var pjds = new PjdsClient(log, log, config);

var environment = {
    pjds: pjds
};

describe('blacklist-utils', function() {
    describe('isBlackListedPatient', function () {
        it('Patient is on the blacklist', function () {
            spyOn(pjds, 'getOsyncBlistByUid').andCallFake(function(uid, callback) {
                expect(uid).toBe('urn:va:patient:SITE:3:3');
                callback(null, {statusCode: 200});
            });

            blacklistUtils.isBlackListedPatient(log, environment, '3', 'SITE', function(error, result) {
                expect(result).toBeTruthy();
            });
        });

        it('Patient is on the blacklist because JDS returned an error', function () {
            spyOn(pjds, 'getOsyncBlistByUid').andCallFake(function(uid, callback) {
                expect(uid).toBe('urn:va:patient:SITE:3:3');
                callback('Connection Refused');
            });

            blacklistUtils.isBlackListedPatient(log, environment, '3', 'SITE', function(error, result) {
                expect(result).toBeTruthy();
            });
        });

        it('Patient is on the blacklist because JDS returned an error response', function () {
            spyOn(pjds, 'getOsyncBlistByUid').andCallFake(function(uid, callback) {
                expect(uid).toBe('urn:va:patient:SITE:3:3');
                callback(null, {statusCode: 500, body: {error: 'No instance.'}});
            });

            blacklistUtils.isBlackListedPatient(log, environment, '3', 'SITE', function(error, result) {
                expect(result).toBeTruthy();
            });
        });

        it('Patient is NOT on the blacklist', function () {
            spyOn(pjds, 'getOsyncBlistByUid').andCallFake(function(uid, callback) {
                expect(uid).toBe('urn:va:patient:SITE:3:3');
                callback(null, {statusCode: 404});
            });

            blacklistUtils.isBlackListedPatient(log, environment, '3', 'SITE', function(error, result) {
                expect(result).toBeFalsy();
            });
        });
    });

    describe('isBlackListedUser', function () {
        it('User is on the blacklist', function () {
            spyOn(pjds, 'getOsyncBlistByUid').andCallFake(function(uid, callback) {
                expect(uid).toBe('urn:va:user:SITE:334533');
                callback(null, {statusCode: 200});
            });

            blacklistUtils.isBlackListedUser(log, environment, {uid: 'urn:va:user:SITE:334533'}, function(error, result) {
                expect(result).toBeTruthy();
            });
        });

        it('User is on the blacklist because JDS returned an error', function () {
            spyOn(pjds, 'getOsyncBlistByUid').andCallFake(function(uid, callback) {
                expect(uid).toBe('urn:va:user:SITE:334533');
                callback('Connection Refused');
            });

            blacklistUtils.isBlackListedUser(log, environment, {uid: 'urn:va:user:SITE:334533'}, function(error, result) {
                expect(result).toBeTruthy();
            });
        });

        it('User is on the blacklist because JDS returned an error response', function () {
            spyOn(pjds, 'getOsyncBlistByUid').andCallFake(function(uid, callback) {
                expect(uid).toBe('urn:va:user:SITE:334533');
                callback(null, {statusCode: 500, body: {error: 'No instance.'}});
            });

            blacklistUtils.isBlackListedUser(log, environment, {uid: 'urn:va:user:SITE:334533'}, function(error, result) {
                expect(result).toBeTruthy();
            });
        });

        it('User is NOT on the blacklist', function () {
            spyOn(pjds, 'getOsyncBlistByUid').andCallFake(function(uid, callback) {
                expect(uid).toBe('urn:va:user:SITE:334533');
                callback(null, {statusCode: 404});
            });

            blacklistUtils.isBlackListedUser(log, environment, {uid: 'urn:va:user:SITE:334533'}, function(error, result) {
                expect(result).toBeFalsy();
            });
        });
    });
});