'use strict';

var _ = require('underscore');

var ErrorPublisher = require('../../src/error-publisher');

var logger = {
    trace: _.noop,
    debug: _.noop,
    info: _.noop,
    warn: _.noop,
    error: _.noop,
    fatal: _.noop
};


var errorJobType = 'error-request';

var publisher = {
    errorJobType: errorJobType,
    logger: logger,
    publish: function() {}
};

describe('error-publisher.js', function() {
    describe('createErrorRecord()', function() {
        it('tests all fields created', function() {
            var record = ErrorPublisher._createErrorRecord(errorJobType, 'classification', {
                error: 'error'
            });

            expect(record).toEqual(jasmine.objectContaining({
                jpid: jasmine.any(String),
                type: errorJobType,
                classification: jasmine.any(String),
                timestamp: jasmine.any(String),
                error: jasmine.any(Object)
            }));
        });
    });

    describe('publishHandlerError()', function() {
        it('test publish creates ErrorRecord', function() {
            spyOn(publisher, 'publish');
            ErrorPublisher.prototype.publishHandlerError.call(publisher, {
                job: 'job'
            }, {
                error: 'error'
            }, 'fatal', function() {});
            expect(publisher.publish).toHaveBeenCalledWith(jasmine.objectContaining({
                jpid: jasmine.any(String),
                type: errorJobType,
                classification: 'job',
                timestamp: jasmine.any(String),
                error: jasmine.any(Object),
                job: jasmine.any(Object),
                severity: jasmine.any(String)
            }), jasmine.any(Function));
        });
    });

    describe('publishPollerError()', function() {
        it('test publish creates ErrorRecord without chunk', function() {
            spyOn(publisher, 'publish');
            ErrorPublisher.prototype.publishPollerError.call(publisher, 'SITE', {
                error: 'error'
            }, function() {});
            expect(publisher.publish).toHaveBeenCalledWith(jasmine.objectContaining({
                jpid: jasmine.any(String),
                type: errorJobType,
                classification: 'poller',
                timestamp: jasmine.any(String),
                error: jasmine.any(Object),
                system: 'SITE'
            }), jasmine.any(Function));
        });

        it('test publish creates ErrorRecord with chunk', function() {
            spyOn(publisher, 'publish');
            ErrorPublisher.prototype.publishPollerError.call(publisher, 'SITE', {
                chunk: {}
            }, {
                error: 'error'
            }, function() {});
            expect(publisher.publish).toHaveBeenCalledWith(jasmine.objectContaining({
                jpid: jasmine.any(String),
                type: errorJobType,
                classification: 'poller',
                timestamp: jasmine.any(String),
                error: jasmine.any(Object),
                system: 'SITE',
                chunk: jasmine.any(Object)
            }), jasmine.any(Function));
        });
    });

    describe('createErrorRecord()', function() {
        it('test createErrorRecord creates proper error record', function() {
            var errorRecord = ErrorPublisher._createErrorRecord(errorJobType, 'system', {error: 'error'});
            expect(errorRecord).not.toBeUndefined();
            expect(errorRecord).not.toBeNull();
            if(errorRecord) {
                expect(errorRecord.jpid).toBeTruthy();
                expect(errorRecord.type).toEqual(errorJobType);
                expect(errorRecord.classification).toEqual('system');
                expect(errorRecord.timestamp).toBeTruthy();
                expect(errorRecord.error).toBeTruthy();
            }
        });
    });

    describe('createHandlerErrorRecord()', function() {
        it('test createHandlerErrorRecord creates proper error record', function() {
            var errorRecord = ErrorPublisher._createHandlerErrorRecord(errorJobType, {job: 'job'}, {error: 'error'}, 'fatal-exception');
            expect(errorRecord).not.toBeUndefined();
            expect(errorRecord).not.toBeNull();
            if(errorRecord) {
                expect(errorRecord.jpid).toBeTruthy();
                expect(errorRecord.type).toEqual(errorJobType);
                expect(errorRecord.classification).toEqual('job');
                expect(errorRecord.timestamp).toBeTruthy();
                expect(errorRecord.error).toBeTruthy();
                expect(errorRecord.job).toBeTruthy();
                expect(errorRecord.severity).toEqual('fatal-exception');
            }
        });
    });

    describe('publishSubsystemError()', function() {
        it('test publish creates ErrorRecord without patientIdentifier', function() {
            spyOn(publisher, 'publish');
            ErrorPublisher.prototype.publishSubsystemError.call(publisher, 'MVI', {
                error: 'error'
            }, function() {});
            expect(publisher.publish).toHaveBeenCalledWith(jasmine.objectContaining({
                jpid: jasmine.any(String),
                type: errorJobType,
                classification: 'system',
                timestamp: jasmine.any(String),
                error: jasmine.any(Object),
                system: 'MVI'
            }), jasmine.any(Function));
        });

        it('test publish creates ErrorRecord with patientIdentifier', function() {
            spyOn(publisher, 'publish');
            ErrorPublisher.prototype.publishSubsystemError.call(publisher, 'MVI', {
                type: 'pid',
                value: 'SITE;3'
            }, {
                error: 'error'
            }, function() {});
            expect(publisher.publish).toHaveBeenCalledWith(jasmine.objectContaining({
                jpid: jasmine.any(String),
                type: errorJobType,
                classification: 'system',
                timestamp: jasmine.any(String),
                patientIdentifier: jasmine.any(Object),
                error: jasmine.any(Object),
                system: 'MVI'
            }), jasmine.any(Function));
        });
    });
});