'use strict';

var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;
var dd = require('drilldown');
var util = require('util');
var querystring = require('querystring');
var _ = require('lodash');
var pidValidator = rdk.utils.pidValidator;
var async = require('async');

module.exports.searchJds = function(pid, logger, jdsServer, masterCallback) {
    var jdsResource;
    if (pidValidator.isIcn(pid)) {
        logger.debug('single patient search: using icn');
        jdsResource = '/data/index/pt-select-icn';
    } else if (pidValidator.isSiteDfn(pid)) {
        logger.debug('single patient search: using site;dfn');
        jdsResource = '/data/index/pt-select-pid';
    } else {
        logger.debug('single patient search: pid or icn not detected. using pid');
        jdsResource = '/data/index/pt-select-pid';
    }
    var jdsQuery = {
        range: '"' + pid + '"'
    };
    jdsQuery = querystring.stringify(jdsQuery);
    var jdsPath = jdsResource + '?' + jdsQuery;
    var options = _.extend({}, jdsServer, {
        url: jdsPath,
        logger: logger,
        json: true
    });
    async.waterfall(
        [
            function(callback) {
                httpUtil.get(options, function(error, response, result) {
                    if (error) {
                        logger.error('Error performing jds search', (error.message || error));
                        return callback('There was an error processing your request. The error has been logged.');
                    }
                    callback(null, result);
                });
            },
            function(response, callback) {
                var sensitivePatientExists = _.any(dd(response)('data')('items').val, function(item) {
                    return item.sensitive;
                });
                callback(null, sensitivePatientExists);
            }
        ],
        function(err, sensitivePatientExists) {
            if (err) {
                return masterCallback(err);
            }
            masterCallback(null, !!sensitivePatientExists);
        }
    );
};
