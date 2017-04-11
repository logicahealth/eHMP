'use strict';

var S = require('string');
var _ = require('lodash');

var metrics = require('../../utils/metrics/metrics');
var rdk = require('../rdk');
var pidValidator = rdk.utils.pidValidator;

module.exports.loadConfigByCommandLine = loadConfigByCommandLine;
module.exports.reloadConfig = reloadConfig;
module.exports.setupAppEdition = setupAppEdition;
module.exports.processAppConfig = processAppConfig;

/*
    Support function to load a configuration file.  Currently support both json and javascript files.
 */
function loadConfigByCommandLine(commandline, defaultConfigFile) {
    var config = null;

    if (defaultConfigFile) {
        config = reloadFile(defaultConfigFile);
    }

    if (commandline.config) {
        var customConfigFile = buildFileName(commandline.config);
        var customConfig = reloadFile(customConfigFile);

        config = _.defaults(customConfig, config);
    }
    return config;
}

function reloadFile(fileName) {
    delete require.cache[require.resolve(fileName)];
    return require(fileName);
}

function buildFileName(configName) {
    return S(configName).startsWith('/') ? configName : '../' + configName;
}

function reloadConfig(app) {
    process.on('SIGHUP', function() {
        app.logger.info('Reloading configuration.');
        var config = loadConfigByCommandLine(app.argv, app.defaultConfigFilename);

        if (_.isObject(config)) {
            app.config = config;
            setupAppEdition(app);
            metrics.initialize(app);
            pidValidator.initialize(app);
        }
    });
}

function setupAppEdition(app) {
    app.edition = app.argv.edition !== null && app.argv.edition !== undefined ? app.argv.edition : app.config.edition;
    app.logger.info('app edition: %s', app.edition);
}

function processAppConfig(config, argv) {
    if (!argv.port) {
        return config;
    }
    if (!parseInt(argv.port)) {
        return config;
    }
    var port = parseInt(argv.port);
    _.set(config, 'appServer.port', port);
    return config;
}
