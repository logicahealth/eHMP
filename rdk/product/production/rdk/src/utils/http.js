'use strict';

var util = require('util');
var fs = require('fs');
var request = require('request');
var metrics = require('./metrics/metrics');
var cache = require('memory-cache');
var now = require('performance-now');
var http = require('http');
var https = require('https');
var _ = require('lodash');

/**
 * This wrapper exports the following functions: get, post, put and delete. It also can be
 * called directly, e.g. rdk.utils.http(options, callback). In this case options.method must be
 * populated.
 *
 * options should have the following properties:
 *
 * options.url => the URL to make the request to, including the protocol. Required.
 * options.logger => a logger object with standard logging calls (trace, debug, info, warn,
 *      error, fatal). If logger.fields.requestId exists it will be added to the request as
 *      a X-Request-ID header. options.logger is required.
 * options.method => the HTTP method for the request. Required if calling this wrapper directly
 *      instead of using one of the convenience functions like get, put, post and delete.
 * options.timeout => the request timeout in milliseconds. Defaults to 120000 if undefined.
 * options.cacheTimeout => if provided for GET requests, successful responses are cached and
 *      subsequent calls with the same options return the cached response instead of making the
 *      request again.
 * options.body => a request body to send to the server. May be a string, a Buffer or an object.
 *      If options.body is an object, this function behaves as if the options.json flag is true.
 * options.json => if true, parses the response body as a JSON object.
 * options supports all other properties that
 *      {@link https://github.com/request/request#requestoptions-callback|request supports}.
 *
 * If options has any of the following properties:
 * options.key
 * options.cert
 * options.pfx
 * options.ca
 * options.agentOptions.key
 * options.agentOptions.cert
 * options.agentOptions.pfx
 * options.agentOptions.ca
 * And if the property is a string starting with `/`, that property is
 * assumed to be a file path to a certificate and that property is replaced
 * with the certificate's contents.
 * options.ca and options.agentOptions.ca may be an array, and the same
 * behavior applies to all elements of the array.
 * If a certificate can't be read, the process exits with status code 1.
 *
 * callback => a function that takes an error, the response of type
 *      {@link http://nodejs.org/api/http.html#http_http_incomingmessage|httpIncomingMessage},
 *      and the response body text.
 *
 * returns a {@link https://github.com/request/request|request} object which you can configure
 *      further if desired.
 */

module.exports = wrapRequest(withRequestContext, withLogging, withMetrics, withCertificates, withJSON, withForever);
module.exports.get = wrapRequest(withMethod('GET'), withRequestContext, withLogging, withCaching, withMetrics, withCertificates, withForever);
module.exports.patch = wrapRequest(withMethod('PATCH'), withRequestContext, withLogging, withMetrics, withCertificates, withJSON, withForever);
module.exports.post = wrapRequest(withMethod('POST'), withRequestContext, withLogging, withMetrics, withCertificates, withJSON, withForever);
module.exports.put = wrapRequest(withMethod('PUT'), withRequestContext, withLogging, withMetrics, withCertificates, withJSON, withForever);
module.exports.delete = wrapRequest(withMethod('DELETE'), withRequestContext, withLogging, withMetrics, withCertificates, withForever);
module.exports.initializeTimeout = initializeTimeout;
module.exports.setMaxSockets = setMaxSockets;
module.exports._withCertificates = withCertificates;

var defaultTimeout = 120000;

function initializeTimeout(timeout) {
    defaultTimeout = timeout;
}

/**
 * @param {Number} maxSockets -1 will be treated as Infinity
 */
function setMaxSockets(maxSockets) {
    if (maxSockets === -1) {
        maxSockets = Infinity;
    }
    http.globalAgent.maxSockets = maxSockets || http.globalAgent.maxSockets;
    https.globalAgent.maxSockets = maxSockets || https.globalAgent.maxSockets;
}

function wrapRequest() {
    var next = request;
    _.eachRight(arguments, function(wrapper) {
        next = wrapper.bind(null, next);
    });

    return function(options, callback) {
        if (!_.isObject(options)) {
            return reportConfigurationError('options must be an object', callback);
        }
        options = _.clone(options);
        if (!options.timeout) {
            options.timeout = defaultTimeout;
        }
        return next(options, callback);
    };
}

function withMethod(method) {
    return function(next, options, callback) {
        if (options.method && options.method !== method) {
            return reportConfigurationError(util.format('http.%s called with an options.method of %s; must be %s or left unspecified', method.toLowerCase(), options.method, method), callback);
        }
        options.method = method;
        return next(options, callback);
    };
}

function withLogging(next, options, callback) {
    if (!options.logger) {
        return reportConfigurationError('You must populate options.logger.', callback);
    }

    var logger = options.logger;
    var begin = now();
    var logOptions = createLogOptions(options);

    logger.debug(logOptions);

    return next(options, function(error, response, body) {
        logOptions['elapsed milliseconds'] = now() - begin;

        if (error) {
            if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
                logger.warn(logOptions, 'Timed out');
            } else {
                logger.error(error);
                logger.error(logOptions, 'Call failed');
            }
        } else {
            logger.debug(logOptions, 'Received response');
        }

        if (callback) {
            return callback(error, response, body);
        }
    });
}

function withRequestContext(next, options, callback) {
    var requestId = _.get(options, 'logger.fields.requestId');
    var sessionId = _.get(options, 'logger.fields.sid');
    if (_.isString(requestId)) {
        options.headers = options.headers || {};
        _.defaults(options.headers, { 'X-Request-ID': requestId });
    }
    if (_.isString(sessionId)) {
        options.headers = options.headers || {};
        _.defaults(options.headers, { 'X-Session-ID': sessionId });
    }
    return next(options, callback);
}

function withMetrics(next, options, callback) {
    var metricData = metrics.handleOutgoingStart(options, options.logger);

    return next(options, function(error, response, body) {
        if (error) {
            metrics.handleError(metricData, options.logger);
        } else {
            metrics.handleFinish(metricData, options.logger);
        }

        if (callback) {
            return callback(error, response, body);
        }
    });
}

var tlsProperties = [
    ['key'],
    ['cert'],
    ['ca'],
    ['pfx'],
    ['agentOptions', 'key'],
    ['agentOptions', 'cert'],
    ['agentOptions', 'ca'],
    ['agentOptions', 'pfx']
];

function withCertificates(next, options, callback) {
    _.each(tlsProperties, function(pemProperty) {
        var tlsPropertyValue = _.get(options, pemProperty);
        if (isFilePath(tlsPropertyValue)) {
            next = readKey.bind(null, tlsPropertyValue, pemProperty, next);
        } else if (_.isArray(tlsPropertyValue)) {
            _.each(tlsPropertyValue, function(pemFile, index) {
                if (isFilePath(pemFile)) {
                    var propertyPath = pemProperty.concat(index);
                    next = readKey.bind(null, pemFile, propertyPath, next);
                }
            });
        }
    });
    return next(options, callback);

    function isFilePath(string) {
        // Keys may not be ascii armored so it is easier to check if
        // the value might be a path to a certificate than to check if the
        // value is already a certificate.
        return _.isString(string) && /^\//.test(string);
    }

    function readKey(file, property, next) {
        return fs.readFile(file, function(err, data) {
            if (err) {
                return reportConfigurationError(util.format('Error reading file %s from HTTPS configuration, property %s. (assuming property values that start with / are file paths)', file, property, err));
            }
            _.set(options, property, data);
            return next(options, callback);
        });
    }
}

function withJSON(next, options, callback) {
    if (_.isObject(options.body)) {
        options.json = true;
    }
    return next(options, callback);
}

function withForever(next, options, callback) {
    if (_.isUndefined(options.forever)) {
        options.forever = true;
    }
    return next(options, callback);
}

function withCaching(next, options, callback) {
    if (!options.cacheTimeout || !callback) {
        return next(options, callback);
    }

    var logOptions = createLogOptions(options);
    var cacheKey = 'http-wrapper' + JSON.stringify(logOptions);

    var cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
        options.logger.info(logOptions, 'Cache: using cached response');
        return callback(null, cachedResponse.response, cachedResponse.body);
    }

    return next(options, function(error, response, body) {
        if (response && response.statusCode === 200) {
            var cachedResponse = {
                body: body,
                response: response
            };
            cache.put(cacheKey, cachedResponse, options.cacheTimeout);
            options.logger.info(logOptions, 'Cache: caching response');
        } else {
            options.logger.info(logOptions, 'Cache: not caching response because the status code was not 200');
        }

        return callback(error, response, body);
    });
}

function reportConfigurationError(error, callback) {
    if (callback) {
        return callback(new Error(error));
    }

    console.log(error);
    console.error(error);
    process.exit(1);
}

function createLogOptions(options) {
    return {
        'http options': _.defaults({logger: true}, options)
    };
}
