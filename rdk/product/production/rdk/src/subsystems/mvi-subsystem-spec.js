'use strict';

var bunyan = require('bunyan');
var _ = require('lodash');
var mviSubsystem = require('./mvi-subsystem');

describe('mvi-subsystem', function () {
    describe('getMVIHttpConfig', function () {
        var appConfig;
        var logger;
        beforeEach(function () {
            appConfig = {};
            _.set(appConfig, 'mvi.search.path', '/mvi');
            _.set(appConfig, 'mvi.baseUrl', 'https://localhost:8896');
            logger = sinon.stub(bunyan.createLogger({name: 'mvi-subsystem-spec.js'}));
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
    });
});
