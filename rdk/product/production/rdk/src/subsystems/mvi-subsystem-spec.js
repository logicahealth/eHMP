'use strict';

var bunyan = require('bunyan');
var dd = require('drilldown');
var fs = require('fs');
var mviSubsystem = require('./mvi-subsystem');

describe('mvi-subsystem', function () {
    describe('getMVIHttpConfig', function () {
        var appConfig;
        var logger;
        var certificateHeader = /^-+BEGIN.*?(KEY|CERTIFICATE)-+/;
        var certificateContents = new Buffer('-----BEGIN CERTIFICATE-----\nfoo\n-----END CERTIFICATE-----\n');
        beforeEach(function () {
            appConfig = {};
            dd(appConfig)('mvi')('search')('path').set('/mvi');
            dd(appConfig)('mvi')('baseUrl').set('https://localhost:8896');
            logger = sinon.stub(bunyan.createLogger({name: 'mvi-subsystem-spec.js'}));
            sinon.stub(fs, 'readFileSync', function () {
                return certificateContents;
            });
        });
        it('creates a config object', function () {
            var config = mviSubsystem.getMVIHttpConfig(appConfig, logger);
            expect(config).to.eql({
                search: {path: '/mvi'},
                baseUrl: 'https://localhost:8896',
                url: '/mvi',
                logger: logger,
                headers: {'Content-Type': 'text/xml; charset=utf-8'}
            });
        });
        it('replaces key path with key contents', function () {
            dd(appConfig)('mvi')('agentOptions')('key').set('/foo/foo.key');
            var config = mviSubsystem.getMVIHttpConfig(appConfig, logger);
            expect(config.agentOptions.key).to.match(certificateHeader);
        });
        it('replaces crt path with key contents', function () {
            dd(appConfig)('mvi')('agentOptions')('cert').set('/foo/foo.crt');
            var config = mviSubsystem.getMVIHttpConfig(appConfig, logger);
            expect(config.agentOptions.cert).to.match(certificateHeader);
        });
        it('replaces ca path with key contents', function () {
            dd(appConfig)('mvi')('agentOptions')('ca').set('/foo/foo.cer');
            var config = mviSubsystem.getMVIHttpConfig(appConfig, logger);
            expect(config.agentOptions.ca).to.match(certificateHeader);
        });
        it('replaces ca array with key contents', function () {
            dd(appConfig)('mvi')('agentOptions')('ca').set([
                '/foo/foo.cer',
                '/foo/bar.cer',
                '/foo/baz.cer'
            ]);
            var config = mviSubsystem.getMVIHttpConfig(appConfig, logger);
            expect(config.agentOptions.ca[0]).to.match(certificateHeader);
            expect(config.agentOptions.ca[1]).to.match(certificateHeader);
            expect(config.agentOptions.ca[2]).to.match(certificateHeader);
        });
    });
});
