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

var rdk = require('../rdk');
var rdkJwt = require('./rdk-jwt');
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

function setupAppMiddleware(app) {
    setupTrustProxy(app);
    setupCors(app);
    enableHelmet(app);
    addAppToRequest(app);
    addRdkSendToResponse(app);
    addInterceptorRequestObject(app);
    addRequestId(app);
    addRequestedSessionId(app);
    addLoggerToRequest(app);
    setAppTimeout(app);
    enableMorgan(app);
    enableSession(app);
    enableBodyParser(app);
    initializeHttpWrapper(app);
    rdkJwt.enableJwt(app);
    enableResponseTimeHeader(app);
    recordRequestsForContractTests(app);
}

function setupTrustProxy(app) {
    app.use(function(req, res, next) {
        var clientIsBalancer = (req.headers['x-forwarded-host'] === '10.1.1.149');
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
        idLogger.info('New Request: %s %s', req.method, req.originalUrl || req.url);
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
            saveUninitialized: true
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

function enableResponseTimeHeader(app) {
    app.use(responseTime());
}

function recordRequestsForContractTests(app) {
    require('../../../versioning-tests/spy-for-versioning')(app);
}
