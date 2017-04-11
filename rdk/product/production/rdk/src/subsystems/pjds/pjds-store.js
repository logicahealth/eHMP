'use strict';

/**
 * TODO: put this in pjds subsystem
 */

var _ = require('lodash');
var querystring = require('querystring');
var util = require('util');
var async = require('async');
var rdk = require('../../core/rdk');
var RdkError = rdk.utils.RdkError;
var httpUtil = rdk.utils.http;
var jdsFilter = require('jds-filter');

function buildPath(req, httpOptions, callback) {
    var key = '';
    if (httpOptions.type === 'PUT' || !_.isUndefined(httpOptions.key)) {
        key = httpOptions.key;
    }
    var jdsResource = util.format('/' + httpOptions.store + '/' + key);
    if (!_.isUndefined(httpOptions.indexName)) {
        jdsResource = util.format('/' + httpOptions.store + '/index/' + httpOptions.indexName);
    }
    var jdsPath = jdsResource;
    if (!_.isEmpty(httpOptions.parameters)) {
        var jdsQueryString = querystring.stringify(httpOptions.parameters);
        jdsPath += '?' + jdsQueryString;
    }
    return callback(null, jdsPath, httpOptions);
}

function callPJDS(req, res, httpOptions, callback) {
    async.waterfall(
        [
            buildPath.bind(null, req, httpOptions),
            getResponse.bind(null, req)
        ],
        callback
    );
}

function getResponse(req, path, httpOptions, callback) {
    var persistantJdsServer = req.app.config.generalPurposeJdsServer;
    var options = _.extend({}, persistantJdsServer, {
        url: path,
        logger: req.logger,
        json: true
    });
    var resultObj = {};
    options.body = httpOptions.data;
    httpUtil[httpOptions.type](options, function(error, response, data) {
        resultObj.statusCode = _.get(response, 'statusCode');
        resultObj.data = data;
        if (error || resultObj.statusCode > 204) {
            req.logger.error('Error in pjds-store: at Path: ' + path);
            var rdkError = new RdkError({
                'error': error,
                'status': resultObj.statusCode,
                'message': 'Error in pjds-store' + httpOptions.errorMessageHeader + httpOptions.store,
                'logger': req.logger
            });
            callback(rdkError, resultObj, _.get(response, 'headers'));
        } else {
            callback(null, resultObj, _.get(response, 'headers'));
        }
    });
}

function buildHttpOptions(callType, config, errorMessageHeader) {
    var httpOptions = {
        store: config.store,
        type: callType,
        parameters: {},
        data: '',
        errorMessageHeader: errorMessageHeader
    };
    if (!_.isUndefined(config.parameters)) {
        httpOptions.parameters = config.parameters;
    }
    if (!_.isUndefined(config.filterList)) {
        httpOptions.parameters.filter = jdsFilter.build(config.filterList);
    }
    if (!_.isUndefined(config.key)) {
        if (_.isArray(config.key)) {
            if (!_.isUndefined(config.indexName)) {
                httpOptions.indexName = config.indexName;
            } else {
                httpOptions.indexName = config.store + '_uid';
            }
            httpOptions.parameters.range = config.key.join();
        } else {
            httpOptions.key = config.key;
        }
    } else {
        if (!_.isUndefined(config.indexName)) {
            httpOptions.indexName = config.indexName;
        }
    }
    if (!_.isUndefined(config.data)) {
        httpOptions.data = config.data;
    }
    return httpOptions;
}

var get = function(req, res, config, callback) {
    var httpOptions = buildHttpOptions('get', config, 'Error retrieving data from ');
    callPJDS(req, res, httpOptions, callback);
};
var patch = function(req, res, config, callback) {
    if (_.isUndefined(config.key)) {
        res.status(rdk.httpstatus.bad_request).rdkSend('Missing pJDS key');
        return;
    }
    if (_.isUndefined(config.data)) {
        res.status(rdk.httpstatus.bad_request).rdkSend('Missing pJDS JSON data');
        return;
    }
    if (_.isUndefined(config.data.uid)) {
        config.data.uid = config.key;
    }
    var httpOptions = buildHttpOptions('patch', config, 'Error writing data to ');
    callPJDS(req, res, httpOptions, callback);
};
var post = function(req, res, config, callback) {
    if (_.isUndefined(config.data)) {
        res.status(rdk.httpstatus.bad_request).rdkSend('Missing pJDS JSON data');
        return;
    }
    var httpOptions = buildHttpOptions('put', config, 'Error writing data to ');
    callPJDS(req, res, httpOptions, callback);
};
var put = function(req, res, config, callback) {
    if (_.isUndefined(config.key)) {
        res.status(rdk.httpstatus.bad_request).rdkSend('Missing pJDS key');
        return;
    }
    if (_.isUndefined(config.data)) {
        res.status(rdk.httpstatus.bad_request).rdkSend('Missing pJDS JSON data');
        return;
    }
    if (_.isUndefined(config.data.uid)) {
        config.data.uid = config.key;
    }
    var httpOptions = buildHttpOptions('put', config, 'Error writing data to ');
    callPJDS(req, res, httpOptions, callback);
};
var remove = function(req, res, config, callback) {
    if (_.isUndefined(config.key)) {
        res.status(rdk.httpstatus.bad_request).rdkSend('Missing pJDS key');
        return;
    }
    var httpOptions = buildHttpOptions('delete', config, 'Error deleting data from ');
    callPJDS(req, res, httpOptions, callback);
};

var parseUid = function(location) {
    return location.substr(location.lastIndexOf('/') + 1);
};

var pjdsStore = {
    get: get,
    put: put,
    post: post,
    patch: patch,
    delete: remove,
    parseUid: parseUid
};

function createHealthcheck(storename, app, logger) {
    return {
        name: 'pjds_' + storename,
        interval: 100000,
        check: function(callback) {
            var pjdsOptions = _.extend({}, app.config.generalPurposeJdsServer, {
                url: '/' + storename,
                timeout: 5000,
                logger: logger
            });

            httpUtil.get(pjdsOptions, function(err, res) {
                if (err) {
                    return callback(false);
                }
                var body;
                try {
                    body = JSON.parse(res.body);
                } catch (e) {
                    logger.warn('pjds_%s returned an unparsable result', storename);
                    callback(false);
                }
                if (_.get(res, 'statusCode', 0) < 300 && (body.db_name === storename)) {
                    return callback(true);
                }
                callback(false);
            });
        }
    };
}

module.exports = pjdsStore;
module.exports.createHealthcheck = createHealthcheck;
