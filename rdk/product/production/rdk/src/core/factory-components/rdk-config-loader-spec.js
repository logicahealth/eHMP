'use strict';

var configLoader = require('./rdk-config-loader');

describe('Config loader spec', function() {
    var DEFAULT_CONFIG = '../../../src/core/factory-components/rdk-config-loader-default-spec-data.js';
    var COMMAND_LINE_CONFIG = '../../src/core/factory-components/rdk-config-loader-command-line-spec-data.js';

    afterEach(function() {
        delete require.cache[require.resolve(DEFAULT_CONFIG)];
        delete require.cache[require.resolve('../' + COMMAND_LINE_CONFIG)];
    });

    it('load default config', function() {
        var config = configLoader.loadConfigByCommandLine({}, DEFAULT_CONFIG);
        expect(config.name).to.equal('The default configuration');
    });

    it('load command line config', function() {
        var config = configLoader.loadConfigByCommandLine({config : COMMAND_LINE_CONFIG});
        expect(config.name).to.equal('The command line configuration');
    });

    it('load merged command line and default configs', function() {
        var config = configLoader.loadConfigByCommandLine({config : COMMAND_LINE_CONFIG}, DEFAULT_CONFIG);
        expect(config.name).to.equal('The command line configuration');
        expect(config.extra).to.equal('addition');
    });

    it('return null config when no config info provided', function() {
        var config = configLoader.loadConfigByCommandLine({});
        expect(config).to.be.null();
    });
});
