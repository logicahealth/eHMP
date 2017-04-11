'use strict';
var bunyan = require('bunyan');
var RdkError = require('./rdk-error');
var logger = bunyan.createLogger({
    name: 'rdk-error'
});
var ERROR_CODE = '200.401.1001';
var SERVICE_ERROR_CODE = 'rdk.401.1001';

describe('Error utility', function() {
    beforeEach(function(done) {
        logger.error = sinon.stub(logger, 'error');
        done();
    });

    afterEach(function(done) {
        logger.error.restore();
        done();
    });

    it('returns an Error object with numeric error code', function() {
        var rdkError = new RdkError({
            code: SERVICE_ERROR_CODE
        });
        expect(rdkError.code).to.eql(ERROR_CODE);
    });

    it('returns an Error object with prototyped parts', function() {
        var rdkError = new RdkError({
            code: SERVICE_ERROR_CODE
        });
        expect(rdkError).to.have.ownKeys(['name', 'originalCode', 'code', 'status', 'error', 'message', 'logged', 'fileName', 'lineNumber']);
        expect(rdkError.code).to.eql(ERROR_CODE);
    });

    it('logs an error when a log is sent in the constructor', function() {
        var rdkError = new RdkError({
            code: SERVICE_ERROR_CODE,
            logger: logger
        });
        expect(rdkError).to.have.ownKeys(['name', 'originalCode', 'code', 'status', 'error', 'message', 'logged', 'fileName', 'lineNumber']);
        expect(logger.error.called).to.be.true();
    });

    it('doesn\'t call the logger until log function is called if a logger is not sent on construction', function() {
        var rdkError = new RdkError({
            code: SERVICE_ERROR_CODE
        });
        expect(rdkError).to.have.ownKeys(['name', 'originalCode', 'code', 'status', 'error', 'message', 'logged', 'fileName', 'lineNumber']);
        expect(rdkError.code).to.match(new RegExp(ERROR_CODE));
        expect(logger.error.called).to.be.false();
        rdkError.log(logger);
        expect(logger.error.called).to.be.true();
    });
});
