'use strict';

describe('patient-profile-service-subsystem', function() {
    const patientProfileServiceSubsystem = require('./patient-profile-service-subsystem');
    const rdk = require('../../core/rdk');
    const logger = require('bunyan').createLogger({name: 'patient-profile-service-subsystem-spec.js'});
    const _ = require('lodash');

    it('has a properly configured health check', function(done) {
        const app = {};
        _.set(app, 'config.videoVisit.pvPatientProfileService', {
            baseUrl: 'hxxp://foo/bar'
        });

        sinon.stub(rdk.utils.http, 'get').callsFake(function(config, callback) {
            expect(config).to.be.an.object();
            expect(config.baseUrl).to.be.a.string();
            expect(config.uri).to.be.a.string();
            expect(config.logger).to.be.truthy();
            setImmediate(callback);
        });

        patientProfileServiceSubsystem.getSubsystemConfig(app, logger).healthcheck.check(() => done());
    });
});
