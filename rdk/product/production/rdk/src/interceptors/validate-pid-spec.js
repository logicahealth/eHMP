'use strict';
var rdk = require('../core/rdk');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'validate-pid'
}));
var validatePid = require('./validate-pid');
var RdkError = rdk.utils.RdkError;


describe('validatePid Interceptor', function() {
    var expectedErrors;
    beforeEach(function () {
        expectedErrors = null;
    });

    it('pass an ICN - validation passes', function(done) {
        var req = mockRequest('10108V420871');
        validatePid(req, mockResponse(done), mockNext(done));
    });

    it('pass an HDR - validation passes', function(done) {
        var req = mockRequest('HDR;10108V420871');
        validatePid(req, mockResponse(done), mockNext(done));
    });

    it('pass a DOD site pid - validation succeeds', function(done) {
        var req = mockRequest('DOD;1010');
        validatePid(req, mockResponse(done), mockNext(done));
    });

    it('pass a primary site id - validation passes', function(done) {
        var req = mockRequest('SITE;3');
        validatePid(req, mockResponse(done), mockNext(done));
    });

    it('pass an empty pid - validation passes', function(done) {
        var req = mockRequest('');
        validatePid(req, mockResponse(done), mockNext(done));
    });

    it('pass a primary site pid that is on the users logged in site - validation passes', function(done) {
        var req = mockRequest('SITE;3');
        validatePid(req, mockResponse(done), mockNext(done));
    });

    it('pass a primary site pid that is not on the users logged in site - validation passes', function(done) {
        var req = mockRequest('SITE;3');
        validatePid(req, mockResponse(done), mockNext(done));
    });

    it('pass an invalid secondary site pid - validation fails', function(done) {
        var req = mockRequest('site;345v346');
        expectedErrors = new RdkError({
            code: '200.400.1027',
            logger: req.logger
        });
        validatePid(req, mockResponse(done), mockNext(done));
    });

    function mockRequest(pid) {
        return {
            logger: logger,
            param: function() {
                return this.query.pid;
            },
            query: {
                pid: pid
            },
            session: {
                user: {
                    site: 'SITE'
                }
            }
        };
    }

    function mockResponse(done) {
        return {
            rdkSend: function(response) {
                var sentErrors = response;
                if (expectedErrors) {
                    expect(sentErrors.code).to.match(expectedErrors.code);
                } else {
                    expect(sentErrors).to.be.falsy();
                }
                done();
            },
            status: function(status) {
                return this;
            }
        };
    }

    function mockNext(done) {
        return function() {
            expect(expectedErrors).to.be.falsy();
            done();
        };
    }
});
