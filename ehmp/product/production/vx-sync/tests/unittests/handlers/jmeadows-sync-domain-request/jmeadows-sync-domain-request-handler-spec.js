'use strict';

require('../../../../env-setup');
var _ = require('underscore');
var realConfig = require(global.VX_ROOT + 'worker-config');
var handle = require(global.VX_HANDLERS + 'jmeadows-sync-domain-request/jmeadows-sync-domain-request-handler');
var PublisherRouterDummy = require(global.VX_DUMMIES + 'publisherRouterDummy');
var dummyLogger = require(global.VX_DUMMIES + '/dummy-logger');
var nock = require('nock');

var config = {
    'jmeadows': {
        'domains': ['allergy'],
        'allergy': {
            'host': '0.0.0.0',
            'port': 5432,
            'path': '/dod/allergy',
            'method': 'GET'
        }
    },
};

var jmeadowsHostAndPort = 'http://0.0.0.0:5432';
var jmeadowsQueryString = config.jmeadows.allergy.path + '?edipi=0000000003';

// NOTE: be sure next line is commented out before pushing
// var logUtil = require(global.VX_UTILS + 'log');
// dummyLogger = logUtil._createLogger({
//     name: 'hdr-sync-request-handler-spec',
//     level: 'debug'
// });

describe('jmeadows-sync-domain-request-handler.js', function() {
    function createEnvironment() {
        return {
            publisherRouter: new PublisherRouterDummy(),
            metrics: dummyLogger
        };
    }

    describe('handle', function() {
        var patientIdentifier = {
            type: 'pid',
            value: 'DOD;0000000003'
        };

        it('Bad Patient ID 1', function() {
            var environment = createEnvironment();
            var callback = jasmine.createSpy('callback');
            runs(function() {
                handle(dummyLogger, config, environment, {
                    type: 'pid',
                    value: '9E7A;3'
                }, callback);
            });

            waitsFor(function() {
                return (callback.callCount > 0);
            }, 'Handler never invoked', 750);

            runs(function() {
                expect(callback).toHaveBeenCalled();
                expect(callback.mostRecentCall.args[0]).toBeTruthy();
            });

        });

        it('Bad Patient ID 2', function() {
            var environment = createEnvironment();
            var callback = jasmine.createSpy('callback');
            runs(function() {
                handle(dummyLogger, config, environment, '3', callback);
            });

            waitsFor(function() {
                return (callback.callCount > 0);
            }, 'Handler never invoked', 750);

            runs(function() {
                expect(callback).toHaveBeenCalled();
                expect(callback.mostRecentCall.args[0]).toBeTruthy();
            });

        });

        it('Bad domain', function() {
            var environment = createEnvironment();
            var callback = jasmine.createSpy('callback');
            runs(function() {
                handle(dummyLogger, config, environment, {
                    patientIdentifier: {
                        type: 'pid',
                        value: 'DOD;0000000003'
                    },
                    dataDomain: 'stuff'
                }, callback);
            });

            waitsFor(function() {
                return (callback.callCount > 0);
            }, 'Handler never invoked', 750);

            runs(function() {
                expect(callback).toHaveBeenCalled();
                expect(callback.mostRecentCall.args[0]).toBeTruthy();
            });

        });

        it('Error path: error response', function(done) {
            nock(jmeadowsHostAndPort)
                .get(jmeadowsQueryString)
                .replyWithError('Error!');

            var environment = createEnvironment();
            spyOn(environment.publisherRouter, 'publish').andCallThrough();
            var job = {
                patientIdentifier: patientIdentifier,
                dataDomain: 'allergy'
            };

            handle(dummyLogger, config, environment, job, function(error, result) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                done();
            });

        });

        it('Error path: null response', function(done) {
            nock(jmeadowsHostAndPort)
                .get(jmeadowsQueryString)
                .reply(200);

            var environment = createEnvironment();
            spyOn(environment.publisherRouter, 'publish').andCallThrough();
            var job = {
                patientIdentifier: patientIdentifier,
                dataDomain: 'allergy'
            };

            handle(dummyLogger, config, environment, job, function(error, result) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                done();
            });

        });

        it('Error path: non-200 response', function(done) {
            nock(jmeadowsHostAndPort)
                .get(jmeadowsQueryString)
                .reply(204);

            var environment = createEnvironment();
            spyOn(environment.publisherRouter, 'publish').andCallThrough();
            var job = {
                patientIdentifier: patientIdentifier,
                dataDomain: 'allergy'
            };

            handle(dummyLogger, config, environment, job, function(error, result) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                done();
            });

        });

        it('Error path: publish error', function(done) {
            nock(jmeadowsHostAndPort)
                .get(jmeadowsQueryString)
                .reply(200, {
                    record: 'Mock record'
                });

            var environment = createEnvironment();
            spyOn(environment.publisherRouter, 'publish').andCallFake(function(job, callback){
                callback('Publisher error');
            });
            var job = {
                patientIdentifier: patientIdentifier,
                dataDomain: 'allergy'
            };

            handle(dummyLogger, config, environment, job, function(error, result) {
                expect(error).toBeTruthy();
                expect(result).toBeFalsy();
                done();
            });

        });

        it('Normal path', function(done) {
            nock(jmeadowsHostAndPort)
                .get(jmeadowsQueryString)
                .reply(200, {
                    record: 'Mock record'
                });

            var environment = createEnvironment();
            spyOn(environment.publisherRouter, 'publish').andCallThrough();
            var referenceInfo = {
                sessionId: 'test-session-id',
                requestId: 'test-request-id'
            };
            var job = {
                patientIdentifier: patientIdentifier,
                dataDomain: 'allergy',
                referenceInfo: referenceInfo
            };

            handle(dummyLogger, config, environment, job, function(error, result) {
                expect(error).toBeFalsy();
                expect(result).toBeTruthy();
                expect(environment.publisherRouter.publish).toHaveBeenCalledWith(jasmine.objectContaining({
                    'type': 'jmeadows-xform-allergy-vpr',
                    'timestamp': jasmine.any(String),
                    'patientIdentifier': patientIdentifier,
                    'dataDomain': 'allergy',
                    'record': {
                        'record': 'Mock record'
                    },
                    referenceInfo: referenceInfo,
                    'jobId': jasmine.any(String)
                }), jasmine.any(Function));
                done();
            });

        });
    });

    describe('getDomainConfiguration', function() {
        it('All Configured domains are OK', function() {
            var dummyJob = {
                patientIdentifier: {
                    value: '123'
                }
            };
            _.each(realConfig.jmeadows.domains, function(value) {
                var domainJob = _.extend({}, dummyJob);
                domainJob.dataDomain = value;
                var domainConfig = handle._getDomainConfiguration(dummyLogger, realConfig, domainJob);
                expect(domainConfig).toBeTruthy();
            });
        });
    });
});