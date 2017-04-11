'use strict';

var util = require('util');
var request = require('request');
var metrics = require('./metrics/metrics');
var cache = require('memory-cache');
var now = require('performance-now');
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
 *      error, fatal). Required.
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
 * callback => a function that takes an error, the response of type
 *      {@link http://nodejs.org/api/http.html#http_http_incomingmessage|httpIncomingMessage},
 *      and the response body text.
 *
 * returns a {@link https://github.com/request/request|request} object which you can configure
 *      further if desired.
 */

module.exports = wrapRequest(withLogging, withMetrics, withJSON);
module.exports.get = wrapRequest(withMethod('GET'), withLogging, withCaching, withMetrics);
module.exports.post = wrapRequest(withMethod('POST'), withLogging, withMetrics, withJSON);
module.exports.put = wrapRequest(withMethod('PUT'), withLogging, withMetrics, withJSON);
module.exports.delete = wrapRequest(withMethod('DELETE'), withLogging, withMetrics);
module.exports.initializeTimeout = initializeTimeout;

var defaultTimeout = 120000;

function initializeTimeout(timeout) {
    defaultTimeout = timeout;
}

function wrapRequest() {
    var next = request;
    _.eachRight(arguments, function(wrapper) {
        next = wrapper.bind(null, next);
    });


    return function(options, callback) {
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
        _.merge(logOptions, {'elapsed milliseconds': now() - begin});

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
    return {'http options': _.merge({}, options, {logger: true})};
}
