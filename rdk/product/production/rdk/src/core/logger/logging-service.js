'use strict';

var bunyan = require('bunyan');
var _ = require('lodash');

module.exports = function(loggerConfigurations) {
    var loggers = {};

    function createLogger(singleLoggerConfig) {
        var newLogger = bunyan.createLogger(singleLoggerConfig);
        loggers[singleLoggerConfig.name] = newLogger;
    }

    _.each(loggerConfigurations.loggers, function(singleLoggerConfig) {
        createLogger(singleLoggerConfig);
    });

    return {
        get: function(name) {
            return loggers[name];
        },

        // this should take a configuration for
        // a bunyan logger, if it fails, it won't
        // overwrite a previous working logger
        // by the same name
        create: function(singleLoggerConfig) {
            return createLogger(singleLoggerConfig);
        },

        getNames: function() {
            return _.keys(loggers);
        }
    };
};
