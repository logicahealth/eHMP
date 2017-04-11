'use strict';

var DEFAULT_CONFIG_FILE = '../../../config/ehmp-config';

/**
 * Attempts to find the --ehmp-config configuration parameter from the node startup command and return the configuration file
 * params {Object} argv - node commandline startup parameters
 * return {Object}      - file at the --ehmp-config || DEFAULT_CONFIG_FILE location
 */
function processEhmpConfig(argv) {
    if (!argv['ehmp-config']) {
        return require(DEFAULT_CONFIG_FILE);
    }
    return require(argv['ehmp-config']);
}

var _test = {
    _setConfigFile: function(configFile) {
        DEFAULT_CONFIG_FILE = configFile;
    }
};

module.exports.processEhmpConfig = processEhmpConfig;
module.exports.test = _test;
