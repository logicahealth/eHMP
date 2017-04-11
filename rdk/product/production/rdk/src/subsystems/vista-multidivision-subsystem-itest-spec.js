'use strict';

var multidivisionalSubsystem = require('./vista-multidivision-subsystem');
var _ = require('lodash');

describe('vista-multidivision-subsystem', function() {
    var logger = sinon.stub(require('bunyan').createLogger({
        name: 'vista-multidivision-subsystem'
    }));

    // uncomment to allow for real console output
    // var logger = require('bunyan').createLogger({
    //     name: 'vista-multidivision-subsystem'
    // });

    var app = {};
    app.config = getAppConfig();

    it('is in good health', function(done) {
        this.timeout(20000);

        var config = multidivisionalSubsystem.getSubsystemConfig(app, logger);
        config.healthcheck.check(function(returnValue) {
            expect(returnValue).to.be.true();
            done();
        });
    });

    it('fails on misconfigured divisions', function(done) {
        this.timeout(20000);

        var misconfiguredApp = _.cloneDeep(app);
        var invalidDivision = {
            id: '999',
            name: 'BADDIVISION'
        };

        var siteKeys = _.keys(_.get(misconfiguredApp, 'config.vistaSites'));
        var siteDivisions = _.get(misconfiguredApp, ['config', 'vistaSites', _.get(siteKeys, '0'), 'division'], []);
        siteDivisions.push(invalidDivision);

        var config = multidivisionalSubsystem.getSubsystemConfig(misconfiguredApp, logger);
        config.healthcheck.check(function(returnValue) {
            expect(returnValue).to.be.false();
            done();
        });
    });
});
