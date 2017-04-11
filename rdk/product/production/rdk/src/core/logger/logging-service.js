'use strict';

var bunyan = require('bunyan');
var _ = require('lodash');

module.exports = function(loggerConfigurations) {
    var loggers = {};

    function createLogger(singleLoggerConfig) {
        var newLogger = bunyan.createLogger(singleLoggerConfig);
        addStandardSerializers(newLogger);
        loggers[singleLoggerConfig.name] = newLogger;
        return newLogger;
    }

    function addStandardSerializers(logger) {
        logger.addSerializers(_.defaults({
            // don't log the logger
            logger: function () {
                return '[logger]';
            },
            error: bunyan.stdSerializers.err
        }, bunyan.stdSerializers));

        if (logger.level() >= bunyan.DEBUG) {
            // avoid logging large objects
            logger.addSerializers({
                user: userSerializer,
                session: sessionSerializer,
                body: bodySerializer
            });
        }        
    }

    function userSerializer(user) {
        return _.pick(user, ['accessCode', 'duz', 'expires', 'facility', 'firstname', 'lastname', 'site', 'uid', 'username']);
    }

    function sessionSerializer(session) {
        session = _.clone(session);
        if (session.session) {
            session.session = sessionSerializer(session.session);
        } else if (session.user) {
            session.user = userSerializer(session.user);
        }
        return session;
    }

    function bodySerializer(body) {
        if (body.session) {
            body = _.clone(body);
            body.session = sessionSerializer(body.session);
        }
        // TODO: avoid logging big bodies?
        return body;
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
