'use strict';

var rdk = require('./rdk');
var _ = require('lodash');
var express = require('express');
var async = require('async');
var url = require('url');
var http = require('http');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var morgan = require('morgan');
var session = require('express-session');
var helmet = require('helmet');
var JDSStore = require('../utils/connect-jds')(session);
var metrics = require('../utils/metrics/metrics');
var pidValidator = rdk.utils.pidValidator;
var httpUtil = rdk.utils.http;
var dd = require('drilldown');
var Handlebars = require('handlebars');
var fs = require('fs');
var fspath = require('path');

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
            return rdk.utils.configLoader.loadConfigByCommandLine(_argv, _defaultConfigFilename);
        }
    }
}

module.exports = AppFactory;

var buildApp = function(config, argv, defaultConfigFilename) {
    var app = express();
    config = processAppConfig(config, argv);
    app.config = config;

    app.argv = argv;
    app.defaultConfigFilename = defaultConfigFilename;

    console.log('init app with config:');
    console.dir(config);

    //todo: move logging services to rdk or app
    // rdk for raw logging service
    // app for initialized already with configuration
    app.loggingservice = rdk.logging(config);
    app.logger = app.loggingservice.get('res-server');

    metrics.initialize(app);
    pidValidator.initialize(app);
    setHttpMaxSockets();

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

    setupAppEdition(app);
    setupTrustProxy(app);
    setupAppMiddleware(app);
    registerInterceptors(app);
    registerOuterceptors(app);
    createOuterceptorHandler(app);
    registerDefaultOuterceptors(app);

    //app.systemHealthCheck = rdk.healthcheck.createCompositeHealthCheck('application');

    registerAppSubsystems(app);
    createResourceRegistry(app);
    registerPid(app);
    logCrashes(app);
    reloadConfig(app);
    recordRequestsForContractTests(app);

    app.register('/healthcheck', '../resources/healthcheck-resource');
    app.register(/\/docs\/vx-api.*/, './api-blueprint/api-blueprint-resource');
    registerExternalApiDocumentation(app);

    useStaticDocumentation(app);
    app.use(dd(app)('config')('rootPath').val, app.appRouter);

    return app;
};

/**
 * JDS seems to have connection issues if many requests are made at once.
 * Before removing this, verify that the vx-api documentation loads.
 */
function setHttpMaxSockets() {
    http.globalAgent.maxSockets = Infinity;
}

function processAppConfig(config, argv) {
    if(!argv.port) {
        return config;
    }
    if(!parseInt(argv.port)) {
        return config;
    }
    var port = parseInt(argv.port);
    dd(config)('appServer')('port').set(port);
    return config;
}

function createRouter(app) {
    var rootPath = dd(app)('config')('rootPath').val;
    if(!_.isString(rootPath)) {
        app.logger.fatal('config.rootPath required');
        process.exit(1);
    }
    if(!/(?:^\/$|^\/.*[^\/]$)/.test(rootPath)) {
        app.logger.fatal('config.rootPath must begin with a / and not end with a /');
    }
    return express.Router();
}

function useStaticDocumentation(app) {
    app.appRouter.use('/docs/', express.static(__dirname + '/../../docs'));
}

function logCrashes(app) {
    process.on('uncaughtException', function(err) {
        console.error((new Date()).toUTCString() + 'uncaughtException: ' + err.message);
        console.error(err.stack);
        console.log((new Date()).toUTCString() + 'uncaughtException: ' + err.message);
        console.log(err.stack);
        app.logger.fatal(err);
        process.exit(1);
    });
}

function reloadConfig(app) {
    process.on('SIGHUP', function() {
        app.logger.info('Reloading configuration.');
        var config = rdk.utils.configLoader.loadConfigByCommandLine(app.argv, app.defaultConfigFilename);

        if (_.isObject(config)) {
            app.config = config;
            setupAppEdition(app);
            metrics.initialize(app);
            pidValidator.initialize(app);
        }
    });
}

function recordRequestsForContractTests(app) {
    require('../../versioning-tests/spy-for-versioning')(app);
}

function createResourceRegistry(app) {
    var ResourceRegistry = require('./resource-directory/resource-registry');
    app.resourceRegistry = new ResourceRegistry();
    app.register = registerResourceFamily.bind(null, app);
    app.register('/resourcedirectory', './resource-directory/resource-directory-resource');
}

function registerAppSubsystems(app) {
    app.subsystems = {};
    app.subsystems.register = registerSubsystem.bind(null, app);

    var jdsSubsystem = require('../subsystems/jds/jds-subsystem');
    var jdsSyncSubsystem = require('../subsystems/jds/jds-sync-subsystem');
    var solrSubsystem = require('../subsystems/solr-subsystem');
    var patientrecordSubsystem = require('../subsystems/patient-record-subsystem');
    var mviSubsystem = require('../subsystems/mvi-subsystem');
    var vxSyncSubsystem = require('../subsystems/vx-sync-subsystem');
    var asuSubsystem= require('../subsystems/asu/asu-subsystem');
    var jbpmSubsystem = require('../subsystems/jbpm-subsystem');
    var pjdsSubsystem = require('../subsystems/pjds/pjds-subsystem');
    var cdsSubsystem = require('../subsystems/cds/cds-subsystem');
    var pepSubsystem = require('../subsystems/pep/pep-subsystem');

    app.subsystems.register('jds', jdsSubsystem);
    app.subsystems.register('jdsSync', jdsSyncSubsystem);
    app.subsystems.register('solr', solrSubsystem);
    app.subsystems.register('patientrecord', patientrecordSubsystem);
    app.subsystems.register('mvi', mviSubsystem);
    app.subsystems.register('vxSync', vxSyncSubsystem);
    app.subsystems.register('asu', asuSubsystem);
    app.subsystems.register('authorization', pepSubsystem);
    if(dd(app)('config')('jbpm').exists) {
        app.subsystems.register('jbpm', jbpmSubsystem);
    }
    app.subsystems.register('pjds', pjdsSubsystem);
    if(dd(app)('config')('cdsInvocationServer').exists || dd(app)('config')('cdsMongoServer').exists) {
        app.subsystems.register('cds', cdsSubsystem);
    }
}

function registerSubsystem(app, subsystemName, subsystem) {
    app.subsystems[subsystemName] = subsystem;
    rdk.health.registerSubsystem(subsystem.getSubsystemConfig(app), subsystemName, app.logger);
}

function setupAppEdition(app) {
    app.edition = app.argv.edition !== null && app.argv.edition !== undefined ? app.argv.edition : app.config.edition;
    app.logger.info('app edition: %s', app.edition);
}

function setupTrustProxy(app) {
    app.use(function(req, res, next) {
        var clientIsBalancer = (req.headers['x-forwarded-host'] === 'IP        ');
        if (app.config.environment === 'development') {
            app[clientIsBalancer ? 'enable' : 'disable']('trust proxy');
        } else {
            app.enable('trust proxy');
        }
        app.logger.info('trust proxy [enabled=%s][%s]', app.enabled('trust proxy'), req.ips);
        next();
    });
}

function setupAppMiddleware(app) {
    setupCors(app);
    enableHelmet(app);
    addAppToRequest(app);
    addInterceptorRequestObject(app);
    addLoggerToRequest(app);
    setAppTimeout(app);
    enableMorgan(app);
    enableSession(app);
    enableBodyParser(app);
    initializeHttpWrapper(app);
    addRdkSendToResponse(app);
}

function enableBodyParser(app) {
    app.use(bodyParser.json({limit: '1mb'}));
}

function initializeHttpWrapper(app) {
    httpUtil.initializeTimeout(app.config.timeoutMillis);
}

function addRdkSendToResponse(app) {
    app.use(function(req, res, next) {
        res.rdkSend = function(body) {
            if (body === null || body === undefined) {
                body = {};
            } else if (_.isObject(body) || this.get('Content-Type') === 'application/json') {
                if (_.isString(body)) {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {
                        body = {message: body};
                    }
                }
                if ((!_.has(body, 'data') || !_.isObject(body.data)) &&
                    !_.has(body, 'message') &&
                    (_.isArray(body) || !_.isEmpty(body))) {
                    body = {data: body};
                }
            } else {
                body = {message: String(body)};
            }
            if (res.statusCode) {
                body.status = res.statusCode;
            } else {
                body.status = 200;
            }
            req._rdkSendUsed = true;
            return this.send(body);
        };
        next();
    });
}

function enableHelmet(app) {
    app.use(helmet.hidePoweredBy());
    app.use(helmet.noCache());
    app.use(helmet.hsts());
    app.use(helmet.ieNoOpen());
    app.use(helmet.noCache());
    app.use(helmet.noSniff());
    app.use(helmet.frameguard());
    app.use(helmet.xssFilter());
}

function enableSession(app) {
    app.use(function(req, res, next) {
        session({
            store: new JDSStore({
                    jdsServer: {
                        baseUrl: req.app.config.jdsServer.baseUrl
                    }
                }, req.logger, req.app
            ),
            secret: app.config.secret,
            name: 'rdk.sid',
            cookie: {
                maxAge: app.config.sessionLength
            },
            resave: true,
            rolling: true, //this allows the session and token to refresh each time
            saveUninitialized: true
        })(req, res, next);
    });
}

function setupCors(app) {
    //CORS not setup on reload of configuration since CORS is only used for development.
    var corsEnabled = dd(app)('config')('corsEnabled').val;
    var isDevelopmentEnvironment = dd(app)('config')('environment').val === 'development';
    if(!corsEnabled || !isDevelopmentEnvironment) {
        return;
    }
    var cors = require('cors');
    app.use(cors({
        credentials: true,
        // HACK
        // this is a temp fix to allow the ADK to contact the RDK without errors
        origin: function(origin, callback) {
            callback(null, true);
        }
    }));
}

function addAppToRequest(app) {
    app.use(function(req, res, next) {
        req.app = app;
        next();
    });
}

function addInterceptorRequestObject(app) {
    app.use(function(req, res, next) {
        req.interceptorResults = {};
        next();
    });
}

function addLoggerToRequest(app) {
    app.use(function(req, res, next) {
        var requestId = uuid.v4();
        var idLogger = app.logger.child({requestId: requestId});
        idLogger.info('New Request: %s %s', req.method, req.originalUrl || req.url);
        idLogger.debug({remote: req.ip || req.connection.remoteAddress});
        req.logger = idLogger;
        res.set('requestId', requestId);
        next();
    });
}

function addResourceConfigToRequest(app, configItem) {
    app.appRouter.use(configItem.path, function(req, res, next) {
        //only if someone tried to turn pep off by interceptors.pep = false
        if(_.result(configItem, 'interceptors.pep', true) === false){
            req.logger.warn('WARNING: %s SHOULD NOT ATTEMPT TO TURN OFF THE PEP. THE RESOURCE CONFIGURATION NEEDS TO BE FIXED.', configItem.path);
            configItem.interceptors.pep = true;
        }
        configItem.interceptors = _.defaults((configItem.interceptors || {}), getDefaultInterceptors());
        req._resourceConfigItem = configItem;
        next();
    });
}

function getDefaultInterceptors() {
    return {
        audit: true,
        authentication: true,
        validatePid: true,
        assignRequestSite: true,
        synchronize: true,
        convertPid: true,
        pep: true,
        metrics: true,
        subsystemCheck: true,
        operationalDataCheck: true,
        validateRequestParameters: true
    };
}

function setAppTimeout(app) {
    app.use(function(req, res, next) {
        var timeoutMillis = Number(req.app.config.responseTimeoutMillis || 300000);
        res.setTimeout(timeoutMillis);
        req.logger.info('response timeout=%s ms', timeoutMillis);
        next();
    });
}

function enableMorgan(app) {
    app.use(morganBunyanLogger);
}

function morganBunyanLogger(req, res, next) {
    var logger = req.logger || req.app.logger;
    var morganFormat = req.app.config.morganFormat || 'dev';
    var morganToBunyan = morgan({
        format: morganFormat,
        stream: {
            write: function(string) {
                logger.info(string);
            }
        }
    });
    return morganToBunyan (req, res, next);
}

function registerDefaultOuterceptors(app) {
    var defaultOuterceptors = ['whitelistJson', 'validateResponseFormat'];

    registerPathOuterceptors(app, {
        name: '_default',
        path: '_default',
        outerceptors: defaultOuterceptors
    });
}

function mount(app, resourceConfiguration) {
    var mountpoint = resourceConfiguration.path;
    var resourceName = resourceConfiguration.title;

    var httpMethods = _.pick(resourceConfiguration, 'get', 'post', 'put', 'delete', 'use');
    _.each(httpMethods, function(mountFunction, methodName) {
        app.logger.info('mounting resource [resourceName=%s][mountpoint=%s][action=%s]',resourceName, mountpoint, methodName);
        app.appRouter[methodName](mountpoint, mountFunction);
    });
}

function registerResourceFamily(app, mountpoint, resourcePath) {
    app.logger.info('registering resource [mountpoint=%s][resourcePath=%s]', mountpoint, resourcePath);
    var resourceConfig = require(resourcePath).getResourceConfig(app);
    var msg;
    _.each(resourceConfig, function(configItem) {
        //todo: handle if parts contain/don't contain slashes
        app.logger.info('registering resource [name=%s][mountpoint=%s][path=%s]',
            configItem.name, mountpoint, configItem.path);

        //requiredPermissions has to be defined in the resource configuration item as an array
        if(!_.isArray(_.result(configItem, 'requiredPermissions', null))){
            msg = 'IMPROPERLY CONFIGURED RESOURCE [name=%s] requires a requiredPermissions array parameter.';
            console.error(msg, configItem.name);
            app.logger.error(msg, configItem.name);
            process.exit(1);
        }
        //isPatientCentric has to be defined in the resource confituration item as a boolean
        if(!_.isBoolean(_.result(configItem, 'isPatientCentric', null))){
            msg = 'IMPROPERLY CONFIGURED RESOURCE [name=%s] requires an isPatientCentric boolean parameter.';
            console.error(msg, configItem.name);
            app.logger.error(msg, configItem.name);
            process.exit(1);
        }

        processConfigItem(configItem, mountpoint);

        logPepPermissions(app, configItem);

        addResourceConfigToRequest(app, configItem);
        registerPathInterceptors(app, configItem);
        registerPathOuterceptors(app, configItem);
        mount(app, configItem);

        var registryItem = _.pick(configItem, 'title', 'path', 'parameters', 'description', 'rel');
        app.resourceRegistry.register(registryItem);

        rdk.health.registerResource(configItem, app.logger);
        if (!configItem.undocumented) {
            var path = mountpoint.length > 1 ? mountpoint : configItem.path;
            var markdownPath = configItem.apiBlueprintFile || resourcePath + '.md';
            if (_.startsWith(markdownPath, '.')) {
                markdownPath = fspath.resolve(__dirname, markdownPath);
            }
            rdk.apiBlueprint.registerResource(path, markdownPath, logApiBlueprintIssues.bind(null, app, configItem, markdownPath));
        }
    });
}

function logPepPermissions(app, configItem) {
    if(configItem.requiredPermissions) {
        app.logger.info(configItem.title + ' requiredPermissions: [%s]', configItem.requiredPermissions);
    }
}

function processConfigItem(configItem, mountpoint) {
    configItem.title = configItem.name;
    configItem.mountpoint = mountpoint;
    if (_.isString(mountpoint)) {
        configItem.path = rdk.utils.uriBuilder.fromUri(mountpoint).path(configItem.path).build();
    } else {
        configItem.path = mountpoint;
    }
    //configItem.parameters = configItem.parameters || null;
    var crud = {
        post: 'vha.create',
        get: 'vha.read',
        put: 'vha.update',
        delete: 'vha.delete'
    };
    var method = _(configItem).pick(_.keys(crud)).keys().first();
    configItem.rel = crud[method];
}

function createOuterceptorHandler(app) {
    var _send = app.response.send;
    app.response.send = function(body) {
        var self = this;
        if (self.headersSent) {
            return app.logger.error({send: arguments}, 'Tried to send to a response that was already sent; aborting.');
        }
        if (self._ranOuterceptors) {
            return _send.call(self, body);
        }
        self._ranOuterceptors = true;
        //body = 'foo';
        if (arguments.length === 2) {
            // res.send(body, status) backwards compat
            if (typeof arguments[0] !== 'number' && typeof arguments[1] === 'number') {
                app.logger.warn('res.send(body, status): Use res.status(status).send(body) instead');
                self.statusCode = arguments[1];
            } else {
                app.logger.warn('res.send(status, body): Use res.status(status).send(body) instead');
                self.statusCode = arguments[0];
                body = arguments[1];
            }
        }
        // disambiguate res.send(status) and res.send(status, num)
        if (typeof body === 'number' && arguments.length === 1) {
            // res.send(status) will set status message as text string
            if (!self.get('Content-Type')) {
                self.type('txt');
            }
            app.logger.warn('res.send(status): Use res.status(status).end() instead');
            self.statusCode = body;
            body = http.STATUS_CODES[body];
        }

        var defaultOuterceptors = self.app.outerceptorPathRegistry._default || [];
        var path = dd(self.req)('_resourceConfigItem')('path').val || url.parse(self.req.originalUrl).pathname;
        var pathOuterceptors = self.app.outerceptorPathRegistry[path] || [];

        var bootstrapOuterceptor = [

            function(callback) {
                callback(null, self.req, self, body);
            }
        ];
        var outerceptors = bootstrapOuterceptor.concat(defaultOuterceptors).concat(pathOuterceptors);
        async.waterfall(outerceptors,
            function(err, req, res, body) {
                if (self._headerSent) {
                    return 'Response already sent';
                }
                if (err) {
                    if (_.isString(err)) {
                        err = {message: err};
                    }
                    err.status = 406;
                    self.status(406);
                    return _send.call(self, err);
                }
                return _send.call(self, body);
            }
        );
    };
}

function registerPathOuterceptors(app, configItem) {
    app.outerceptorPathRegistry = app.outerceptorPathRegistry || {};
    _.each(configItem.outerceptors, function(outerceptorName) {
        if (!(outerceptorName in app.outerceptors)) {
            app.logger.warn('No interceptor named %s exists in the app object. Unable to register outerceptor for resource %s', outerceptorName, configItem.name);
            return;
        }
        app.outerceptorPathRegistry[configItem.path] = app.outerceptorPathRegistry[configItem.path] || [];
        app.outerceptorPathRegistry[configItem.path].push(app.outerceptors[outerceptorName]);
    });
}

function registerPathInterceptors(app, configItem) {
    var httpMethods = _.pick(configItem, 'get', 'post', 'put', 'delete');
    _.each(httpMethods, function(chaff, httpMethod) {
        var pathInterceptors = _.defaults((configItem.interceptors || {}), getDefaultInterceptors());
        var pathInterceptorsWhitelisted = _.keys(_.pick(pathInterceptors, _.identity));
        var pathInterceptorsWhitelistedSorted = sortWhitelistedInterceptors(app, pathInterceptorsWhitelisted);
        warnIfInterceptorNotFound(app, configItem, pathInterceptorsWhitelisted);

        _.each(pathInterceptorsWhitelistedSorted, function(interceptorName) {
            registerPathInterceptor(app, configItem, httpMethod, interceptorName);
        });
    });
}

function warnIfInterceptorNotFound(app, configItem, interceptorNames) {
    var appInterceptorNames = _.flatten(_.map(app.interceptors, function(interceptorObject) {
        return _.keys(interceptorObject);
    }));
    var unknownInterceptors = _.difference(interceptorNames, appInterceptorNames);
    if(unknownInterceptors.length) {
        app.logger.warn({unknownInterceptors: unknownInterceptors}, 'Unknown interceptors configured in %s', configItem.name);
    }
}

/**
 * @param {object} app
 * @param {array} whitelistedInterceptors
 * @returns {array} of {interceptorName: function} in the order of app.interceptors
 */
function sortWhitelistedInterceptors(app, whitelistedInterceptors) {
    var pathInterceptorsWhitelistedSorted = _.filter(app.interceptors,
        function(orderedInterceptorObject) {
            var interceptorExists = _.any(orderedInterceptorObject, function(value, key) {
                return _.contains(whitelistedInterceptors, key);
            });
            return interceptorExists;
        }
    );
    return pathInterceptorsWhitelistedSorted;
}

function registerPathInterceptor(app, configItem, httpMethod, interceptorObject) {
    app.logger.info('registering interceptor %s for %s %s ( resource name: %s )',
        _.keys(interceptorObject)[0],
        httpMethod.toUpperCase(),
        configItem.path,
        configItem.name);
    var interceptorHandler = _.first(_.values(interceptorObject));
    interceptorHandler.isInterceptor = true;
    app.appRouter[httpMethod](configItem.path, interceptorHandler);
}

function registerOuterceptors(app) {
    app.outerceptors = {
        emulateJdsResponse: require('../outerceptors/emulate-jds-response'),
        asu: require('../outerceptors/asu'),
        whitelistJson: require('../outerceptors/whitelist-json'),
        validateResponseFormat: require('../outerceptors/validate-response-format')
    };
}

function registerInterceptors(app) {
    /* This is an array of objects with one value instead of one object
    with an array of values so that the order of the interceptors can
    be preserved.
    */
    app.interceptors = [
        { fhirPid: require('../interceptors/fhir-pid') },
        { audit: require('../interceptors/audit/audit') },
        { validatePid: require('../interceptors/validate-pid') },
        { assignRequestSite: require('../interceptors/assign-request-site') },
        { synchronize: require('../interceptors/synchronize') },
        { convertPid: require('../interceptors/convert-pid') },
        { metrics: require('../interceptors/metrics') },
        { operationalDataCheck: require('../interceptors/operational-data-check') },
        { authentication: require('../interceptors/authentication/authentication') },
        { systemAuthentication: require('../interceptors/authentication/system-authentication') },
        { pep: require('../interceptors/authorization/pep') },
        { subsystemCheck: require('../interceptors/subsystem-check-interceptor') },
        { validateRequestParameters: require('../interceptors/validate-request-parameters') },
        { jdsFilter: require('../interceptors/jds-filter-interceptor') }
    ];
}

function registerPid(app) {
    app.use(function(req, res, next) {
        if(req.param('pid')) {
            return next();
        }
        req.logger.debug('registerPid() ');
        var pid;

        if (_.has(req.query, 'subject.identifier')) {
            pid = req.param('subject.identifier');
        }

        if (pid === undefined) {
            var splitValues = req.originalUrl.split('/');
            if (splitValues.length > 3 && splitValues[splitValues.length - 3] === 'fhir' && splitValues[splitValues.length-1] !== undefined) {
                var uid = splitValues[splitValues.length-1];

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
            }
            else if(splitValues.length > 3 && splitValues[splitValues.length - 3] === 'vler' && splitValues[splitValues.length-1].indexOf('toc') !== -1) {
                pid = splitValues[splitValues.length-2];
            }
        }

        if (pid) {
            pid = pid.replace(/:/, ';');
            req.query.pid = pid;
        }
        next();
    });
}

function registerExternalApiDocumentation(app) {
    _.each(app.config.externalApiDocumentation, function(entry) {
        rdk.apiBlueprint.registerExternalUrlOnPrefix(entry.baseUrl, entry.prefix);

        var options = {
            url: entry.indexUrl,
            json: true,
            logger: app.logger
        };
        httpUtil.get(options, function(error, response, body) {
            if (error) {
                app.logger.error({error: error, url: entry.indexUrl}, 'Unable to load index of external markdown');
                return;
            }
            _.each(body.data, function(url) {
                var mountpoint = url.substring(entry.baseUrl.length);
                mountpoint = _.trimRight(entry.prefix, '/') + '/' + _.trimLeft(mountpoint, '/');
                rdk.apiBlueprint.registerResource(mountpoint, url, logApiBlueprintIssues.bind(null, app, null, url));
            });
        })
    });
}

function logApiBlueprintIssues(app, configItem, markdownPath, error, json) {
    if (app.config.environment !== 'development') {
        return;
    }

    if (error) {
        if (error.code === 'ENOENT') {
            app.logger.error('Please write API Blueprint docs for ' + markdownPath);
        } else {
            app.logger.error(error, 'Error preloading JSON from API Blueprint docs ' + markdownPath);
        }
    } else {
        if (configItem) {
            var method = _(configItem).pick(['get', 'post', 'put', 'delete']).keys().first().toUpperCase();
            if (!rdk.apiBlueprint.matchAction(json, configItem.path, method)) {
                var resource = _.first(_.first(json.ast.resourceGroups).resources);
                resource.__id = resource.__id || _.uniqueId();
                json.warnings = json.warnings || [];
                json.warnings.unshift({
                    message: 'please document the ' + method + ' request to ' + configItem.path,
                    location: [{
                        index: 0,
                        line: 1,
                        length: 0,
                        file: markdownPath,
                        resourceId: resource.__id
                    }]
                });
            }
        }

        _.each(json.warnings, function(warning) {
            var location = _.first(warning.location);
            app.logger.error(location, 'API Blueprint warning: ' + warning.message);
        });
    }
}

// private exports
module.exports._sortWhitelistedInterceptors = sortWhitelistedInterceptors;
module.exports._warnIfInterceptorNotFound = warnIfInterceptorNotFound;
module.exports._addRdkSendToResponse = addRdkSendToResponse;
module.exports._registerInterceptors = registerInterceptors;
module.exports._processConfigItem = processConfigItem;
module.exports._createOuterceptorHandler = createOuterceptorHandler;
