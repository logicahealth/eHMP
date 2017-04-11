'use strict';

var configLoader = require('./rdk-ehmp-config-loader');

describe('eHMP Config loader spec', function() {
    var DEFAULT_CONFIG = '../../../src/core/factory-components/rdk-ehmp-config-loader-default-spec-data.js';
    var COMMAND_LINE_CONFIG = '../../../src/core/factory-components/rdk-ehmp-config-loader-command-line-spec-data.js';
    beforeEach(function() {
        //set the internal default config path
        configLoader.test._setConfigFile(DEFAULT_CONFIG);
    });

    afterEach(function() {
        delete require.cache[require.resolve(DEFAULT_CONFIG)];
        delete require.cache[require.resolve(COMMAND_LINE_CONFIG)];
    });

    it('load default config', function() {
        var config = configLoader.processEhmpConfig({});
        expect(config.featureFlags.trackSolrStorage).to.be.false();
    });

    it('load command line config', function() {
        var config = configLoader.processEhmpConfig({
            'ehmp-config': COMMAND_LINE_CONFIG
        });
        expect(config.featureFlags.trackSolrStorage).to.be.true();
    });
});
