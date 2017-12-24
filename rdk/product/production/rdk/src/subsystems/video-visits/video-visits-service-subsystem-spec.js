'use strict';

describe('video-visits-service-subsystem', function() {
    const videoVisitsServiceSubsystem = require('./video-visits-service-subsystem');
    const rdk = require('../../core/rdk');
    const logger = require('bunyan').createLogger({name: 'video-visits-service-subsystem-spec.js'});
    const _ = require('lodash');

    it('has a properly configured health check', function(done) {
        const app = {};
        _.set(app, 'config.videoVisit.vvService', {
            baseUrl: 'hxxp://foo/bar'
        });

        sinon.stub(rdk.utils.http, 'get').callsFake(function(config, callback) {
            expect(config).to.be.an.object();
            expect(config.baseUrl).to.be.a.string();
            expect(config.uri).to.be.a.string();
            expect(config.logger).to.be.truthy();
            setImmediate(callback);
        });

        videoVisitsServiceSubsystem.getSubsystemConfig(app, logger).healthcheck.check(() => done());
    });
});
