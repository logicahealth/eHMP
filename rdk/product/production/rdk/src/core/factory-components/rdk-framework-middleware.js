'use strict';

var _ = require('lodash');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var morgan = require('morgan');
var onFinished = require('on-finished');
var onHeaders = require('on-headers');
var responseTime = require('response-time');
var session = require('express-session');
var uuid = require('node-uuid');
var methodOverride = require('method-override');

var rdk = require('../rdk');
var rdkJwt = require('./rdk-jwt');
var RdkRequestTimers = require('./rdk-request-timers');
var JDSStore = require('../../utils/connect-jds')(session);

var httpUtil = rdk.utils.http;
var RdkError = rdk.utils.RdkError;

module.exports.setupAppMiddleware = setupAppMiddleware;

// Private exports
module.exports._addRdkSendToResponse = addRdkSendToResponse;
module.exports._extractSessionId = extractSessionId;
module.exports._addLoggerToRequest = addLoggerToRequest;
module.exports._addRequestedSessionId = addRequestedSessionId;
module.exports._addRequestId = addRequestId;
module.exports._enableMethodOverride = enableMethodOverride;
module.exports._ensureQueryMatchesBody = ensureQueryMatchesBody;

function setupAppMiddleware(app) {
    setupTrustProxy(app);
    setupCors(app);
    enableHelmet(app);
    addAppToRequest(app);
    addRdkSendToResponse(app);
    addInterceptorRequestObject(app);
    addRequestId(app);
    addRequestedSessionId(app);
    enableMethodOverride(app);
    addLoggerToRequest(app);
    enableRequestTimers(app);
    setAppTimeout(app);
    enableMorgan(app);
    enableSession(app);
    enableResponseTimeHeader(app);
    enableBodyParser(app);
    initializeHttpWrapper(app);
    ensureQueryMatchesBody(app);
    rdkJwt.enableJwt(app);
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

function setupCors(app) {
    //CORS not setup on reload of configuration since CORS is only used for development.
    var corsEnabled = _.get(app, 'config.corsEnabled');
    var isDevelopmentEnvironment = _.get(app, 'config.environment') === 'development';
    if (!corsEnabled || !isDevelopmentEnvironment) {
        return;
    }
    var cors = require('cors');
    app.use(cors({
        credentials: true,
        // FUTURE-TODO: allow configurable whitelist of origins
        origin: function(origin, callback) {
            callback(null, true);
        }
    }));
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

function addAppToRequest(app) {
    // Express.js sets req.app, but not as an own property
    // Some resources clone req but only with own properties
    app.use(function(req, res, next) {
        req.app = app;
        next();
    });
}

function addRdkSendToResponse(app) {
    app.use(function(req, res, next) {
        res.rdkSend = function(body) {
            logRdkRequestTimers(req);
            var error = getRdkErrorFromBody(body, req.logger);

            if (!_.isEmpty(error)) {
                body = error;
            }

            if (res.statusCode === 204) {
                body = undefined;
            } else {
                if (body === null || body === undefined) {
                    body = {};
                } else if (_.isObject(body) || this.get('Content-Type') === 'application/json') {
                    if (_.isString(body)) {
                        try {
                            body = JSON.parse(body);
                        } catch (e) {
                            body = {
                                message: body
                            };
                        }
                    }
                    if ((!_.has(body, 'data') || !_.isObject(body.data)) &&
                        !_.has(body, 'message') &&
                        (_.isArray(body) || !_.isEmpty(body))) {
                        body = {
                            data: body
                        };
                    }
                } else {
                    body = {
                        message: String(body)
                    };
                }
                if (res.statusCode) {
                    body.status = res.statusCode;
                } else {
                    body.status = 200;
                }
            }

            req._rdkSendUsed = true;
            if (body) {
                res.data = body.data;
            }
            return this.send(body);
        };
        next();
    });
}

function getRdkErrorFromBody(body, logger) {
    var item = {};
    if (body instanceof RdkError) {
        if (!body.logged) {
            body.log(logger);
        }
        item = body.sanitize();
    }
    return item;
}

function addInterceptorRequestObject(app) {
    app.use(function(req, res, next) {
        req.interceptorResults = {};
        next();
    });
}

function addRequestId(app) {
    app.use(function(req, res, next) {
        Object.defineProperty(req, 'id', {
            value: uuid.v4(),
            writable: false
        });
        res.set('X-Request-ID', req.id);
        next();
    });
}

function addRequestedSessionId(app) {
    app.use(function(req, res, next) {
        var requestedSessionId = extractSessionId(req);
        Object.defineProperty(req, '_requestedSessionId', {
            value: requestedSessionId,
            writable: false
        });
        next();
    });
}

function addLoggerToRequest(app) {
    app.use(function(req, res, next) {
        var idLogger = app.logger.child({
            requestId: req.id,
            sid: req._requestedSessionId
        });
        if (req.url === req.app.config.rootPath + '/version') { // Hack. TODO: fix up the version resource and move it to the rdk core
            idLogger = idLogger.child({versionResource: true});
        }
        if (req.method === req.originalMethod) {
            idLogger.info('New Request: %s %s', req.method, req.originalUrl || req.url);
        } else {
            idLogger.info('New Request: (via %s) %s %s', req.originalMethod, req.method, req.originalUrl || req.url);
        }
        idLogger.debug({
            remote: req.ip || req.connection.remoteAddress
        });
        req.logger = idLogger;
        next();
    });
}

function extractSessionId(req) {
    var cookieHeader = req.get('cookie');
    var rdkSessionRegex = new RegExp(_.escapeRegExp(getCookieName(req.app.config)) + '=(.*?)(?:;|$)');
    var match = rdkSessionRegex.exec(cookieHeader);
    if (match === null) {
        return null;
    }
    var rawCookie = match[1];
    var decodedCookie;
    try {
        decodedCookie = decodeURIComponent(rawCookie);
    } catch (ex) {
        decodedCookie = rawCookie;
    }
    var isSignedCookie = decodedCookie.substr(0, 2) === 's:';
    if (isSignedCookie) {
        decodedCookie = stripCookieSignature(decodedCookie);
    }
    return decodedCookie;
}

function stripCookieSignature(signedCookie) {
    return signedCookie.slice(2, signedCookie.lastIndexOf('.'));
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
    var morganFormat = req.app.config.morganFormat || 'bunyan';
    if (morganFormat === 'bunyan') {
        // Make bunyan a special case instead of morgan.format('bunyan') to avoid extra JSON.parse
        req._remoteAddress = getIp(req);
        recordStartTime.call(req);
        onHeaders(res, recordStartTime);
        onFinished(res, function() {
            var responseInfo = {
                remoteAddress: getIp(req),
                remoteUser: _.get(req, 'session.user.accessCode'),
                method: req.method,
                originalMethod: req.originalMethod,
                path: req.originalUrl,
                httpVersion: req.httpVersion,
                status: res.statusCode,
                contentLength: res.getHeader('content-length'),
                referer: req.get('referer'),
                userAgent: req.get('user-agent')
            };
            if (req._startAt && res._startAt) {
                responseInfo.responseTimeMs = (
                    (res._startAt[0] - req._startAt[0]) * 1e3 + // seconds
                    (res._startAt[1] - req._startAt[1]) * 1e-6 // nanoseconds
                );
                logger.info({
                    sid: _.get(req, 'session.id', req._requestedSessionId),
                    responseInfo: responseInfo
                });
            }
        });
        return next();
    } else {
        var morganToBunyan = morgan(morganFormat, {
            stream: {
                write: function(string) {
                    logger.info(string);
                }
            }
        });
        return morganToBunyan(req, res, next);
    }

    function getIp(req) {
        return req.ip || req._remoteAddress || (req.connection && req.connection.remoteAddress);
    }

    function recordStartTime() {
        this._startAt = process.hrtime(); // jshint ignore:line
        this._startTime = new Date(); // jshint ignore:line
    }
}

function getCookieName(config) {
    var prefix = _.result(config, 'cookiePrefix', null);
    var cookieName = 'rdk.sid';
    if (prefix) {
        cookieName = prefix + '.' + cookieName;
    }
    return cookieName;
}

function enableSession(app) {
    app.use(function(req, res, next) {
        session({
            store: new JDSStore({
                jdsServer: {
                    baseUrl: req.app.config.jdsServer.baseUrl
                }
            }, req.logger, req.app),
            secret: app.config.secret,
            name: getCookieName(app.config),
            cookie: {
                maxAge: app.config.sessionLength
            },
            resave: true,
            rolling: true, //this allows the session and token to refresh each time
            saveUninitialized: false
        })(req, res, next);
    });
    app.use(function(req, res, next) {
        var currentSessionId = _.get(req, 'session.id', req._requestedSessionId);
        if (currentSessionId !== req._requestedSessionId) {
            var loggerWithSessionId = req.logger.child({ sid: currentSessionId });
            loggerWithSessionId.info('New session created');
            req.logger = loggerWithSessionId;
        }
        return next();
    });
}

function enableBodyParser(app) {
    app.use(bodyParser.json({
        limit: '1mb'
    }));
}

function initializeHttpWrapper(app) {
    httpUtil.initializeTimeout(app.config.timeoutMillis);
    httpUtil.setMaxSockets(app.config.maxSockets);
}

function enableMethodOverride(app) {
    var methodOverrideHeaderMiddleware = methodOverride('X-HTTP-Method-Override');
    app.use(function(req, res, next) {
        // FHIR resources already contain their own version of method overriding
        // Hack away the duplicate method overriding functionality
        if (isFhirResource(req)) {
            req.originalMethod = req.method;
            return next();
        }
        return methodOverrideHeaderMiddleware(req, res, next);
    });

    function isFhirResource(req) {
        return _.startsWith(req.path, req.app.config.rootPath + '/fhir');
    }
}

function ensureQueryMatchesBody(app) {
    app.use(function(req, res, next) {
        if (req.method === req.originalMethod) {
            return next();
        }
        var queryIsValid = doesQueryMatchBody(req);
        if (!queryIsValid) {
            var rdkError = new RdkError({
                code: 'rdk.400.1008',
                logger: req.logger
            });
            return res.status(400).rdkSend(rdkError);
        }
        req.query = req.body;
        return next();
    });

    function doesQueryMatchBody(req) {
        // Ensure that every query parameter is in the body
        // Ensure that no query parameter conflicts with a body parameter
        var queryMatchesBody = _.every(req.query, function(queryValue, queryKey) {
            if (_.isUndefined(req.body[queryKey])) {
                return false;
            }
            try {
                return _.isEqual(stringifyValues(req.body[queryKey]), queryValue);
            } catch (ex) {
                // Maximum call stack size exceeded
                req.logger.error(ex);
                req.logger.error('Error stringifying body values');
                return false;
            }
        });
        return queryMatchesBody;
    }

    function stringifyValues(object, _recursed) {
        // query parameter values are always strings
        if (!_recursed) {
            object = _.cloneDeep(object);
        }
        if (_.isObject(object)) {
            _.each(object, function(value, key) {
                if (_.isObject(value)) {
                    object[key] = stringifyValues(value, true);
                } else {
                    object[key] = String(value);
                }
            });
        } else {
            object = String(object);
        }
        return object;
    }
}

function enableResponseTimeHeader(app) {
    app.use(responseTime());
}

function enableRequestTimers(app) {
    app.use(function(req, res, next) {
        _.set(req, 'timers', new RdkRequestTimers(req.logger));
        return next();
    });
}

function logRdkRequestTimers(req) {
    var timers = _.get(req, 'timers.list');
    if (_.size(timers) > 0) {
        _.forEach(timers.reverse(), function(timer) {
            if (!timer.logged) {
                timer.log(req.logger);
            }
        });
    }
}
