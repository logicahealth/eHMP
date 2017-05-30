'use strict';
var _ = require('lodash');
var path = require('path');

function getOracleConfig(config, defaultObject, callback) {
    var configObject;
    var configPath = path.resolve(config);
    try {
        configObject = require(configPath);
    } catch (err) {
        return callback('Problem getting config: ' + err);
    }

    var connectionObject = _.get(configObject, defaultObject);
    if (_.isUndefined(connectionObject)) {
        return callback('Unable to find connection object ' +  defaultObject + ' in config: ' + configPath);
    }
    return callback(null, connectionObject);
}

exports.getOracleConfig = getOracleConfig;
