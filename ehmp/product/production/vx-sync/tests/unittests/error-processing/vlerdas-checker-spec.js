'use strict';

//---------------------------------------------------------------------------------------------------
// Unit tests for vler-das-sync-request-handler.
//
// @Author: Les Westberg
//---------------------------------------------------------------------------------------------------

require('../../../env-setup');
const log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'vlerdas-checker-spec',
//     level: 'debug'
// });

let vlerdasChecker = require(global.VX_ERROR_PROCESSING + 'vlerdas-checker');

//------------------------------------------------------------------------------------------------------
// This function returns an instance of worker-config.json with the settings we need for our unit tests.
//
// returns: The worker-config settings.
//------------------------------------------------------------------------------------------------------
function getConfig() {
    let config = {
        'handlerMaxSockets': 10,
        'vlerdas': {
            'domains': [
                'vlerdocument'
            ],
            'disabled': false,
            'defaults': {
                'host': 'IP        ',
                'port': 'PORT',
                'protocol': 'http',
                'timeout': 60000
            },
            'vlerdocument': {
                'subscribe': '/HealthData/v1/Subscribe',
                'readDocPath': '/HealthData/v1/readDocument/DocumentReference',
                'ping': '/ping'
            },
            'vlerFormData': {
                'org': 'eHMP',
                'roleCode': '112247003',
                'purposeCode': 'TREATMENT',
                'vaFacilityCode': '459CH',
                'familyName': 'May',
                'givenName': 'John'
            },
            'notificationCallback': {
                'protocol': 'http',
                'host': 'IP      ',
                'port': 'PORT',
                'path': '/vlerdas/notification'
            },
            'queryDurationDays': 180
        }
    };
    return config;
}


describe('vler-das-checker.js', function () {
    describe('check()', function () {
        it('Happy Path', function () {
            const config = getConfig();
            const request = function (url, callback) {
                return callback(null, { statusCode: 200 }, {});
            };

            let finished = false;
            vlerdasChecker(log, config, function(error, systemUpFlag) {
                expect(error).toBeNull();
                expect(systemUpFlag).toBe(true);
                finished = true;
            }, { _request: request });

            waitsFor(function() {
                return finished;
            }, 'calling vlerdasChecker method', 100);
        });
        it('Error returned from request', function () {
            const config = getConfig();
            const request = function (url, callback) {
                return callback('SomeError', { statusCode: 200 }, {});
            };

            let finished = false;
            vlerdasChecker(log, config, function(error, systemUpFlag) {
                expect(error).toBeNull();
                expect(systemUpFlag).toBe(false);
                finished = true;
            }, { _request: request });

            waitsFor(function() {
                return finished;
            }, 'calling vlerdasChecker method', 100);
        });
        it('Request returns something other than statusCode of 200', function () {
            const config = getConfig();
            const request = function (url, callback) {
                return callback(null, { statusCode: 500 }, {});
            };

            let finished = false;
            vlerdasChecker(log, config, function(error, systemUpFlag) {
                expect(error).toBeNull();
                expect(systemUpFlag).toBe(false);
                finished = true;
            }, { _request: request });

            waitsFor(function() {
                return finished;
            }, 'calling vlerdasChecker method', 100);
        });
    });
});
