'use strict';

var subsystemCheckInterceptor = require('./subsystem-check-interceptor');
var _ = require('lodash');
var bunyan = require('bunyan');

var logger = sinon.stub(bunyan.createLogger({name: 'subsystem-check-interceptor-spec.js'}));

describe('subsystemCheckInterceptor', function() {
    var req;
    beforeEach(function() {
        req = {};
        req.logger = logger;
    });
    it('allows resources with empty subsystems to run', function(done) {
        _.set(req, '_resourceConfigItem.subsystems', []);
        subsystemCheckInterceptor(req, null, done);
    });
    it('allows resources with null subsystems to run', function(done) {
        _.set(req, '_resourceConfigItem.subsystems', null);
        subsystemCheckInterceptor(req, null, done);
    });
    it('prevents resources with missing subsystems from running', function() {
        _.set(req, '_resourceConfigItem.subsystems', ['mySubsystem']);
        _.set(req, 'app.subsystems', {notMySubsystem: null});
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
        _.set(req, '_resourceConfigItem.subsystems', ['mySubsystem']);
        _.set(req, 'app.subsystems', {mySubsystem: null});
        subsystemCheckInterceptor(req, null, done);
    });
});
