'use strict';
var async = require('async');
var _ = require('lodash');
var querystring = require('querystring');
var jdsFilter = require('jds-filter');
var rdk = require('../../core/rdk');
var utils = rdk.utils;
var httpUtil = utils.http;
var dd = require('drilldown');
var pidValidator = utils.pidValidator;

/**
 * This function searches JDS for the the patient identifier [pid] and then checks if any 
 * of the entries are sensitive and returns true or false
 * @param - pid - the patient identifier
 * @param - logger - the req.logger in order to log to the resource server
 * @param - jdsServer - the configuration for the jds server calls
 * @param - masterCallback
 * @returns - undefined 
 */
module.exports.hasSensitivityFlag = function(req, searchOptions, jdsServer, masterCallback) {
    var logger = req.logger;
    var jdsPath = getJdsPath(logger, searchOptions);
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
                //changed _.any to _.some since any was listed as an alias in 3.10 but not moving forward.
                var sensitivePatientExists = _.some(dd(response)('data')('items').val, function(item) {
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

/**
 * This function searches JDS for the the patient identifier [pid] and then returns that patient
 * @param {Object} req - the req of the resource server
 * @param {Object} searchOptions - the options needed for searching
 * @param {string} searchOptions.site - The site for this call
 * @param {string} searchOptions.searchType -  The type of search we are going to perform
 * @param {string} searchOptions.searchString -  The thing being searched for
 * @param {Object} jdsServer - the configuration for the jds server calls
 * @param {Function} masterCallback
 * @returns undefined
 */
module.exports.getPatients = function(req, searchOptions, jdsServer, masterCallback) {
    var logger = req.logger;
    var jdsPath = getJdsPath(logger, searchOptions);
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
                        return callback('There was an error processing your request. The error has been logged.', null);
                    }
                    callback(null, result);
                });
            }
        ],
        function(err, patient) {
            if (err) {
                return masterCallback(err, null);
            }
            logger.trace(patient, 'searchJds.getPatients returning patient');
            masterCallback(null, patient);
        }
    );
};

var getJdsResource = function(logger, options) {
    var jdsResource = '/data/index/';
    var searchType = options.searchType;
    var identifier = options.searchString;
    if (searchType === 'ICN' && pidValidator.isIcn(identifier)) {
        logger.debug('patient search: using icn of %s', identifier);
        jdsResource += 'pt-select-icn';
    } else if (searchType === 'PID' && pidValidator.isSiteDfn(identifier)) {
        logger.debug('patient search: using site;dfn of %s', identifier);
        jdsResource += 'pt-select-pid';
    } else if (searchType === 'LAST5' && identifier) {
        logger.debug('patient search: using last-5 of %s', identifier);
        jdsResource += 'pt-select-last5';
    } else if (searchType === 'NAME' && identifier) {
        logger.debug('patient search: using partial name of patient %s', identifier);
        jdsResource += 'pt-select-name';
    } else {
        logger.debug('patient search: pid or icn %s not detected. using pid', identifier);
        jdsResource += 'pt-select-pid';
    }
    return jdsResource;
};

/**
 * Builds the query parameters for the jdsPath
 * @param {Object} logger - the logger object for the request
 * @param {Object} options - options needed for building the query
 * @param {string} options.searchType - the type of search we are going to perform
 * @param {string} options.searchString - the string we will be searching on in JDS
 * @param {string} options.site - the site we will be filtering our JDS search on
 * @param {string} options.filter - the filter we will be using to filter our JDS search on - optional
 * @param {string | number} options.start - the starting increment of the search
 * @param {string | number} options.limit - the max amount of items to obtain on the search
 * @param {string | number} options.order - the direction to sort the results in
 */
var getJdsQuery = function(logger, options) {
    var jdsQuery = {};
    var searchType = options.searchType;
    var identifier = options.searchString;
    jdsQuery.range = '"' + identifier + '"';
    if (searchType === 'NAME') {
        jdsQuery.range += '*';
    }
    if (options.filter && _.isString(options.filter)) {
        jdsQuery.filter = options.filter;
    } else if (options.site) {
        var jdsSiteSelector = options.site + '%';
        jdsQuery.filter = jdsFilter.build([
            ['ilike', 'pid', jdsSiteSelector]
        ]);
    }
    if (options.start) {
        jdsQuery.start = options.start;
    }
    if (options.limit) {
        jdsQuery.limit = options.limit;
    }
    if (options.order) {
        jdsQuery.order = options.order;
    }
    jdsQuery = querystring.stringify(jdsQuery);
    return jdsQuery;
};

var getJdsPath = function(logger, options) {
    var resource = getJdsResource(logger, options);
    var query = getJdsQuery(logger, options);
    return resource + '?' + query;
};