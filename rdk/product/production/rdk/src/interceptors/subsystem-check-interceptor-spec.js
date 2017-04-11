'use strict';

var subsystemCheckInterceptor = require('./subsystem-check-interceptor');
var dd = require('drilldown');
var bunyan = require('bunyan');

var logger = sinon.stub(bunyan.createLogger({name: 'subsystem-check-interceptor-spec.js'}));

describe('subsystemCheckInterceptor', function() {
    var req;
    beforeEach(function() {
        req = {};
        req.logger = logger;
    });
    it('allows resources with empty subsystems to run', function(done) {
        dd(req)('_resourceConfigItem')('subsystems').set([]);
        subsystemCheckInterceptor(req, null, done);
    });
    it('allows resources with null subsystems to run', function(done) {
        dd(req)('_resourceConfigItem')('subsystems').set(null);
        subsystemCheckInterceptor(req, null, done);
    });
    it('prevents resources with missing subsystems from running', function() {
        dd(req)('_resourceConfigItem')('subsystems').set(['mySubsystem']);
        dd(req)('app')('subsystems').set({notMySubsystem: null});
        var res = {
            status: function(code) {
                expect(code).to.equal(503);
                return this;
            },
            rdkSend: function(response) {
                expect(response).to.match('not currently deployed');
            }
        };
        subsystemCheckInterceptor(req, res);
    });
    it('allows resources with deployed subsystems to run', function(done) {
        dd(req)('_resourceConfigItem')('subsystems').set(['mySubsystem']);
        dd(req)('app')('subsystems').set({mySubsystem: null});
        subsystemCheckInterceptor(req, null, done);
    });
});
