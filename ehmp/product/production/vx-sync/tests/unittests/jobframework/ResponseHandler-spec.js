'use strict';

require('../../../env-setup');

var _ = require('underscore');

var ResponseHandler = require(global.VX_JOBFRAMEWORK + 'ResponseHandler');
var logger = require(global.VX_DUMMIES + 'dummy-logger');

// NOTE: be sure next lines are commented out before pushing
// logger = require('bunyan').createLogger({
//     name: 'ResponseHandler-spec',
//     level: 'trace'
// });

describe('ResponseHandler.js', function() {
    describe('ResponseHandler()', function() {
        it('Verify ResponseHandler() called as function returns object', function() {
            /* jshint ignore:start */
            var expectedResponse = 'USING';
            var handler = ResponseHandler(logger, expectedResponse);
            expect(handler instanceof ResponseHandler).toBe(true);

            expect(handler.logger).toBe(logger);
            expect(handler.expectedResponse).toBe(expectedResponse);
            /* jshint ignore:end */
        });
    });

    describe('reset()', function() {});

    describe('process()', function() {
        it('Normal process works', function() {
            var expectedResponse = 'RESERVED';
            var handler = new ResponseHandler(logger, expectedResponse);
            var data = new Buffer('RESERVED 22801 205\r\n{"type":"enterprise-sync-request","patientIdentifier":{"type":"icn","value":"5123456789V027402"},"jpid":"ab88d26f-1a1f-4a91-9aca-e654d2f65b41","forceSync":[],"jobId":"55aa4c41-eb61-4619-9e95-afa0ff22d8ce"}\r\n');

            var result = handler.process(data);

            expect(handler.header.toString('utf-8')).toEqual('RESERVED 22801 205');
            expect(handler.body.toString('utf-8')).toEqual('{"type":"enterprise-sync-request","patientIdentifier":{"type":"icn","value":"5123456789V027402"},"jpid":"ab88d26f-1a1f-4a91-9aca-e654d2f65b41","forceSync":[],"jobId":"55aa4c41-eb61-4619-9e95-afa0ff22d8ce"}\r\n');
            expect(_.isArray(handler.args));
            if(_.isArray(handler.args)) {
                expect(handler.args.length).toEqual(2);
                expect(handler.args[0]).toEqual('22801');
                expect(handler.args[1].toString('utf-8')).toEqual('{"type":"enterprise-sync-request","patientIdentifier":{"type":"icn","value":"5123456789V027402"},"jpid":"ab88d26f-1a1f-4a91-9aca-e654d2f65b41","forceSync":[],"jobId":"55aa4c41-eb61-4619-9e95-afa0ff22d8ce"}');
            }

            expect(handler.remainder).toBeUndefined();
            expect(result.toString('utf-8')).toEqual('');

        });

        it('Overrun fix works', function() {
            var expectedResponse = 'RESERVED';
            var handler = new ResponseHandler(logger, expectedResponse);
            var data = new Buffer('RESERVED 22801 205\r\n{"type":"enterprise-sync-request","patientIdentifier":{"type":"icn","value":"5123456789V027402"},"jpid":"ab88d26f-1a1f-4a91-9aca-e654d2f65b41","forceSync":[],"jobId":"55aa4c41-eb61-4619-9e95-afa0ff22d8ce"}\r\nDELETED\r\n');

            var result = handler.process(data);

            expect(handler.header.toString('utf-8')).toEqual('RESERVED 22801 205');
            expect(handler.body.toString('utf-8')).toEqual('{"type":"enterprise-sync-request","patientIdentifier":{"type":"icn","value":"5123456789V027402"},"jpid":"ab88d26f-1a1f-4a91-9aca-e654d2f65b41","forceSync":[],"jobId":"55aa4c41-eb61-4619-9e95-afa0ff22d8ce"}\r\n');
            expect(_.isArray(handler.args));
            if(_.isArray(handler.args)) {
                expect(handler.args.length).toEqual(2);
                expect(handler.args[0]).toEqual('22801');
                expect(handler.args[1].toString('utf-8')).toEqual('{"type":"enterprise-sync-request","patientIdentifier":{"type":"icn","value":"5123456789V027402"},"jpid":"ab88d26f-1a1f-4a91-9aca-e654d2f65b41","forceSync":[],"jobId":"55aa4c41-eb61-4619-9e95-afa0ff22d8ce"}');
            }

            expect(handler.remainder.toString('utf-8')).toEqual('DELETED\r\n');
            expect(result.toString('utf-8')).toEqual('');

        });
    });

    xdescribe('parseBody()', function() {});

    xdescribe('findInBuffer()', function() {});

    describe('test', function() {
        it('Process RESERVED with body: Should complete handler.', function() {
            logger.debug('TEST 1 START');
            var data = new Buffer('RESERVED 22800 200\r\n{"type":"enterprise-sync-request","patientIdentifier":{"type":"icn","value":"10107V395912"},"jpid":"88fe22fb-d0c5-4295-a9de-efd6a4872300","forceSync":[],"jobId":"9be3ea48-10d0-4f33-808e-376acfd53c66"}\r\n', 'utf8');
            var expectedResponse = 'RESERVED';
            var handler = new ResponseHandler(logger, expectedResponse);

            handler.reset();
            handler.process(data);
            expect(handler.complete).toBe(true);
        });
        xit('Process RESERVED with body followed by DELETE: Should complete handler.', function() {
            logger.debug('TEST 2 START');
            var data = new Buffer('RESERVED 22801 205\r\n{"type":"enterprise-sync-request","patientIdentifier":{"type":"icn","value":"5123456789V027402"},"jpid":"ab88d26f-1a1f-4a91-9aca-e654d2f65b41","forceSync":[],"jobId":"55aa4c41-eb61-4619-9e95-afa0ff22d8ce"}\r\nDELETED\r\n', 'utf8');
            var expectedResponse = 'RESERVED';
            var handler = new ResponseHandler(logger, expectedResponse);

            handler.reset();
            handler.process(data);
            expect(handler.complete).toBe(true);
        });
    });
});