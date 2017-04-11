'use strict';

var rdk = require('./rdk');
var _ = require('lodash');
var express = require('express');
var metrics = require('../utils/metrics/metrics');
var pidValidator = rdk.utils.pidValidator;

var rdkSignals = require('./factory-components/rdk-signals');
var rdkSubsystems = require('./factory-components/rdk-subsystems');
var rdkFrameworkMiddleware = require('./factory-components/rdk-framework-middleware');
var rdkConfigLoader = require('./factory-components/rdk-config-loader');
var rdkInterceptors = require('./factory-components/rdk-interceptors');
var rdkOuterceptors = require('./factory-components/rdk-outerceptors');
var rdkResources = require('./factory-components/rdk-resources');
var rdkDocumentation = require('./factory-components/rdk-documentation');
var rdkEhmpConfigLoader = require('./factory-components/rdk-ehmp-config-loader');

function AppFactory() {
    if (!(this instanceof AppFactory)) {
        return new AppFactory();
    }

    var appfactory = this;
    var _argv;
    appfactory.argv = function(argv) {
        _argv = rdk.utils.commandlineparser.parse(argv);
        return appfactory;
    };

    var _config;
    appfactory.config = function(config) {
        _config = config;
        return appfactory;
    };

    var _defaultConfigFilename;
    appfactory.defaultConfigFilename = function(defaultConfigFilename) {
        _defaultConfigFilename = defaultConfigFilename;
        return appfactory;
    };

    appfactory.build = function() {
        console.log('build app');

        if (!_argv) {
            console.log('commandline not passed, extracting from main process');
            _argv = rdk.utils.commandlineparser.argv;
        }

        return buildApp(loadConfig(), _argv, _defaultConfigFilename);
    };

    function loadConfig() {
        if (_config) {
            return _config;
        } else {
            return rdkConfigLoader.loadConfigByCommandLine(_argv, _defaultConfigFilename);
        }
    }
}

module.exports = AppFactory;

var buildApp = function(config, argv, defaultConfigFilename) {
    var app = express();
    config = rdkConfigLoader.processAppConfig(config, argv);
    app.config = config;

    app.argv = argv;
    app.defaultConfigFilename = defaultConfigFilename;

    console.log('init app with config:');
    console.dir(config);

    app.loggingservice = rdk.logging(config);
    app.logger = app.loggingservice.get('res-server');
    logCrashes(app);

    metrics.initialize(app);
    pidValidator.initialize(app);
    app.ehmpConfig = rdkEhmpConfigLoader.processEhmpConfig(argv);

    app.auditer = {};
    app.auditer.logger = app.loggingservice.get('audit');
    app.auditer.save = function(auditInfo) {
        // var serializedAuditInfo = JSON.stringify(auditinfo);
        // app.auditer.logger.info(serializedAuditInfo);
        var audit = {
            audit: auditInfo
        };
        app.auditer.logger.info(audit);
    };

    app.appRouter = createRouter(app);

    rdkConfigLoader.setupAppEdition(app);
    rdkInterceptors.registerInterceptors(app);
    rdkOuterceptors.registerOuterceptors(app);
    rdkOuterceptors.createOuterceptorHandler(app);
    rdkOuterceptors.registerDefaultOuterceptors(app);
    rdkFrameworkMiddleware.setupAppMiddleware(app);

    //app.systemHealthCheck = rdk.healthcheck.createCompositeHealthCheck('application');

    rdkSubsystems.registerAppSubsystems(app);
    rdkResources.createResourceRegistry(app);
    registerPid(app);
    rdkConfigLoader.reloadConfig(app);

    app.register('/healthcheck', '../../resources/healthcheck-resource');
    app.register(/\/docs\/vx-api.*/, '../api-blueprint/api-blueprint-resource');
    rdkDocumentation.registerExternalApiDocumentation(app);

    app.register('/version', '../version/version-resource');

    rdkDocumentation.useStaticDocumentation(app);
    app.use(_.get(app, 'config.rootPath'), app.appRouter);

    addRdkListen(app);
    return app;
};

function addRdkListen(app) {
    app.rdkListen = function(port, callback) {
        var rdkServer = app.listen(port, function() {
            if (_.isFunction(callback)) {
                callback.call(app);
            }
        });
        rdkServer.on('close', function() {
            app.logger.info('express server received close event');
        });
        rdkSignals.logKill(app, rdkServer);
        return rdkServer;
    };
}

function createRouter(app) {
    var rootPath = _.get(app, 'config.rootPath');
    if (!_.isString(rootPath)) {
        console.error('config.rootPath required');
        app.logger.fatal('config.rootPath required');
        process.exit(1);
    }
    if (!/(?:^\/$|^\/.*[^\/]$)/.test(rootPath)) {
        app.logger.fatal('config.rootPath must begin with a / and not end with a /');
    }
    return express.Router();
}

function logCrashes(app) {
    process.on('uncaughtException', function(err) {
        var date = (new Date()).toISOString();
        console.error(date + ' uncaughtException: ' + err.message);
        console.error(err.stack);
        console.log(date + ' uncaughtException: ' + err.message);
        console.log(err.stack);
        app.logger.fatal(err);
        process.exit(1);
    });
}

function registerPid(app) {
    app.use(function(req, res, next) {
        if (req.params.pid || req.body.pid || req.query.pid) {
            return next();
        }
        req.logger.debug('registerPid() ');
        var pid;

        if (_.has(req.query, 'subject.identifier')) {
            pid = req.params['subject.identifier'] || req.body['subject.identifier'] || req.query['subject.identifier'];
        }

        if (pid === undefined) {
            var splitValues = req.originalUrl.split('/');
            if (splitValues.length > 3 && splitValues[splitValues.length - 3] === 'fhir' && splitValues[splitValues.length - 1] !== undefined) {
                var uid = splitValues[splitValues.length - 1];

                var regex = /[^:]+:[^:]+:[^:]+:([^:]+:[^:]+):[^:]*/;
                var match = uid.match(regex);

                if (match && match.length === 2) {
                    pid = match[1];
                } else {
                    if (uid.indexOf('?') >= 0) {
                        uid = uid.slice(0, uid.indexOf('?'));
                    }
                    pid = uid;
                }
            } else if (splitValues.length > 3 && splitValues[splitValues.length - 3] === 'vler' && splitValues[splitValues.length - 1].indexOf('toc') !== -1) {
                pid = splitValues[splitValues.length - 2];
            }
        }

        if (pid) {
            pid = pid.replace(/:/, ';');
            req.query.pid = pid;
        }
        next();
    });
}
