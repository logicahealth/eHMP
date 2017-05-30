'use strict';

require('../../../../env-setup');

var _ = require('underscore');

require('../../../../env-setup');
var endpoint = require(global.VX_ENDPOINTS + 'error-handling/error-endpoint');

var logger = require(global.VX_DUMMIES + 'dummy-logger');
var config = {};

function returnError(value, callback) {
    setTimeout(callback, 0, 'ERROR', value);
}

function returnResult(value, callback) {
    setTimeout(callback, 0, null, value);
}

var response = {
    status: function(code) {
        return this;
    },
    send: function(value) {}
};

describe('error-endpoint.js', function() {
    describe('_buildJdsFilter()', function() {
        //buildJdsFilter(logger, query)
        it('test simple parameters', function() {
            var query = {
                type: 'error-request',
                classification: 'job'
            };

            var filter = endpoint._buildJdsFilter(logger, query);

            expect(filter).toEqual('eq(type,"error-request"),eq(classification,"job")');
        });

        it('test multi-parameters', function() {
            var query = {
                patientIdentifierValue: ['9E7A;3', 'C877']
            };

            var filter = endpoint._buildJdsFilter(logger, query);

            expect(filter).toEqual('in(patientIdentifierValue,["9E7A;3","C877"])');
        });
    });

    describe('_fetchErrors()', function() {
        var environment = {
            jds: {}
        };
        environment.jds.childInstance = function() { return environment.jds; };

        var request = {
            query: {
                patientIdentifierValue: ['9E7A;3', 'C877']
            },
            headers: {
                'x-session-id': 'sessionId',
                'x-request-id': 'requestId'
            }
        };

        it('test error', function() {
            environment.jds.findErrorRecordsByFilter = returnError;

            endpoint._fetchErrors(logger, config, environment, request, response);
        });

        it('uses referenceInfo', function() {
            environment.jds.findErrorRecordsByFilter = returnResult;
            spyOn(logger, 'child').andCallThrough();
            spyOn(response, 'send');
            runs(function() {
                endpoint._fetchErrors(logger, config, environment, request, response);
            });
            waitsFor(function() {
                return response.send.calls;
            });
            runs(function() {
                expect(logger.child).toHaveBeenCalled();
                expect(logger.child).toHaveBeenCalledWith(jasmine.objectContaining({
                    'sessionId': 'sessionId',
                    'requestId': 'requestId'
                }));
            });
        });
    });

    describe('_submitById()', function() {
        var environment = {
            jds: {},
            publisherRouter: {}
        };
        environment.jds.childInstance = function() { return environment.jds; };
        environment.publisherRouter.childInstance = function() { return environment.publisherRouter; };

        var request = {
            params: {
                id: 1
            },
            headers: {
                'x-request-id': 'requestId',
                'x-session-id': 'sessionId'
            }
        };

        it('uses referenceInfo', function() {
            environment.jds.findErrorRecordById = returnResult;
            spyOn(logger, 'child').andCallThrough();
            spyOn(response, 'send');
            runs(function() {
                endpoint._submitById(logger, config, environment, request, response);
            });
            waitsFor(function() {
                return response.send.calls;
            });
            runs(function() {
                expect(logger.child).toHaveBeenCalled();
                expect(logger.child).toHaveBeenCalledWith(jasmine.objectContaining({
                    'sessionId': 'sessionId',
                    'requestId': 'requestId'
                }));
            });
        });
    });
});