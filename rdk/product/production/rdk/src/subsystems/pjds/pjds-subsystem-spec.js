'use strict';

var _ = require('lodash');
var pjds = require('./pjds-subsystem');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'pjds-subsystem'
}));

describe('pJDS Subsystem Store', function() {
    var app;
    it('tests that getResourceConfig() is setup correctly', function() {
        var resources = pjds.getSubsystemConfig(app, logger);
        expect(resources.healthcheck.name).to.equal('pjds');
        expect(resources.healthcheck.check).to.be.a.function();
    });
});
