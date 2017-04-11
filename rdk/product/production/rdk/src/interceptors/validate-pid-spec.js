'use strict';
var _ = require('lodash');
var validatePid = require('./validate-pid');


describe('validatePid Interceptor', function() {
    var expectedErrors;
    beforeEach(function () {
        expectedErrors = null;
    });

    it('pass an ICN - validation passes', function(done) {
        var req = mockRequest('10108V420871');

        validatePid(req, mockResponse(done), mockNext(done));
    });

    it('pass a primary site id - validation passes', function(done) {
        var req = mockRequest('9E7A;3');
        validatePid(req, mockResponse(done), mockNext(done));
    });

    it('pass an empty pid - validation passes', function(done) {
        var req = mockRequest('');
        validatePid(req, mockResponse(done), mockNext(done));
    });

    it('pass a primary site pid that is on the users logged in site - validation passes', function(done) {
        var req = mockRequest('9E7A;3');
        validatePid(req, mockResponse(done), mockNext(done));
    });

    it('pass a primary site pid that is not on the users logged in site - validation passes', function(done) {
        var req = mockRequest('C877;3');
        validatePid(req, mockResponse(done), mockNext(done));
    });

    it('pass a secondary site pid - validation fails', function(done) {
        var req = mockRequest('/some/url');
        expectedErrors = 'Invalid Pid. Please pass either ICN, EDIPI or Primary Site ID.';
        validatePid(req, mockResponse(done), mockNext(done));
    });

    function mockRequest(pid) {
        return {
            logger: {
                info: function() {},
                debug: function() {},
            },
            param: function() {
                return this.query.pid;
            },
            query: {
                pid: pid
            },
            session: {
                user: {
                    site: '9E7A'
                }
            }
        };
    }

    function mockResponse(done) {
        return {
            rdkSend: function(response) {
                var sentErrors = _.isString(response) ? response : response.data.errors;
                if (expectedErrors) {
                    expect(sentErrors).to.match(expectedErrors);
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
