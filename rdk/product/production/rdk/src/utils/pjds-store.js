'use strict';

var _ = require('lodash');
var querystring = require('querystring');
var util = require('util');
var async = require('async');
var dd = require('drilldown');
var rdk = require('../core/rdk');
var httpUtil = rdk.utils.http;
var jdsFilter = require('jds-filter');

function buildPath(req, httpOptions, callback) {
    var key = '';
    if (httpOptions.type === 'PUT' || !_.isUndefined(httpOptions.key)) {
        key = httpOptions.key;
    }
    var jdsResource = util.format('/' + httpOptions.store + '/' + key);
    var jdsPath = jdsResource;
    if (!_.isEmpty(httpOptions.filterList)) {
        var jdsQuery = {
            filter: jdsFilter.build(httpOptions.filterList)
        };
        var jdsQueryString = querystring.stringify(jdsQuery);
        jdsPath += '?' + jdsQueryString;
    }
    //req.logger.info('pjds buildPath called with : ' + jdsPath);
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
        resultObj.statusCode = dd(response)('statusCode').val;
        resultObj.data = data;
        if ((!_.isUndefined(error) && !_.isNull(error)) || resultObj.statusCode > 204) {
            var getError = new ParameterError(httpOptions.errorMessageHeader + httpOptions.store);
            callback(getError, resultObj, dd(response)('headers').val);
        } else {
            callback(null, resultObj, response.headers);
        }
    });
}

function ParameterError(message) {
    this.message = message;
}
ParameterError.prototype = Error.prototype;

function buildHttpOptions(callType, config, errorMessageHeader) {
    var httpOptions = {
        store: config.store,
        type: callType,
        getMutipleKeys: false,
        filterList: [],
        data: '',
        errorMessageHeader: errorMessageHeader
    };
    if (!_.isUndefined(config.filterList)) {
        httpOptions.filterList = config.filterList;
    }
    if (!_.isUndefined(config.key)) {
        if (_.isArray(config.key)) {
            httpOptions.getMutipleKeys = true;
            var filterList = ['or'];
            _.each(config.key, function(key) {
                filterList.push(['eq', 'uid', key]);
            });
            httpOptions.filterList.push(filterList);
        } else {
            httpOptions.key = config.key;
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
var put = function(req, res, config, callback) {
    if (_.isUndefined(config.key)) {
        res.status(rdk.httpstatus.bad_request).rdkSend('Missing pJDS key');
        return;
    }
    if (_.isUndefined(config.data)) {
        res.status(rdk.httpstatus.bad_request).rdkSend('Missing pJDS JSON data');
        return;
    }
    var httpOptions = buildHttpOptions('put', config, 'Error writting data to ');
    callPJDS(req, res, httpOptions, callback);
};
var post = function(req, res, config, callback) {
    if (_.isUndefined(config.data)) {
        res.status(rdk.httpstatus.bad_request).rdkSend('Missing pJDS JSON data');
        return;
    }
    var httpOptions = buildHttpOptions('put', config, 'Error writting data to ');
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
    delete: remove,
    parseUid: parseUid
};
module.exports = pjdsStore;
