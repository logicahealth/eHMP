'use strict';
var rdk = require('../../../core/rdk');
var _ = require('lodash');
var moment = require('moment');
var solrSmartClient = require('solr-smart-client');
var ForeverAgent = require('forever-agent');

module.exports.executeSolrQuery = executeSolrQuery;
module.exports.compileQueryParameters = compileQueryParameters;
module.exports.emulatedHmpGetRelativeDate = emulatedHmpGetRelativeDate;
module.exports.escapeQueryChars = escapeQueryChars;

var solrClient = null;
var foreverAgent = new ForeverAgent();

function initSolr(solrConfig, req) {
    //initClient only needs to be called once.
    if (solrClient === null){
        req.logger.info('SolrSmartClient.InitClient called');
        solrClient = solrSmartClient.initClient(solrConfig.core, solrConfig.zooKeeperConnection, req.logger, foreverAgent);
    }
}

function executeSolrQuery(queryString, method, req, callback) {

    var solrConfig = req.app.config.solrClient;
    initSolr(solrConfig, req);

    solrClient.get(method, queryString, function(error, solrResult){
        if (error) {
            req.logger.error('Error performing search', (error.message || error));
            return callback(error);
        } else {
            return callback(null, solrResult);
        }
    })
}


/**
 * Final individual query parameter manipulations before assembling the full query string
 * @param queryParameters
 * @returns {*}
 */
function compileQueryParameters(queryParameters) {
    if (queryParameters.hasOwnProperty('fl')) {
        queryParameters.fl = queryParameters.fl.join(',');
    }
    if (queryParameters.hasOwnProperty('hl.fl')) {
        queryParameters['hl.fl'] = queryParameters['hl.fl'].join(',');
    }
    return queryParameters;
}


/**
 * Reverse engineered RelativeDateTimeFormat.parse()
 *
 * @see RelativeDateTimeFormat.java:31
 * @param teeMinus "T-{number}{h|d|m|y}" (hour, day, month, year)
 * @returns "YYYYMMDD"
 */
function emulatedHmpGetRelativeDate(teeMinus) {
    teeMinus = teeMinus.toLowerCase();
    var match = teeMinus.match(/^(t-)(\d+)(h|d|m|y)$/);
    // T-72h = ['T-72h', 'T-', '72', 'h']
    if (match === null) {
        return;
    }
    // must be valid
    var count = parseInt(match[2]);
    var unit = match[3];
    var calculatedDate = moment();
    var timeType = {
        h: 'hours',
        d: 'days',
        m: 'months',
        y: 'years'
    };
    calculatedDate.subtract(count, timeType[unit]);
    var response = calculatedDate.format('YYYYMMDD');
    return response;
}


/**
 * Named to be the same as solr's ClientUtils java method, escapeQueryChars
 * @param unescaped
 */
function escapeQueryChars(unescaped) {
    var buffer = '';
    _.each(unescaped.split(''), function(c) {
        if (c.match(/[\\\+\-\!\(\)\:\^\[\]\"\{\}\~\*\?\|\&\;\/\s]/)) {
            // match the comment below and any whitespace
            // \+-!():^[]"{}~*?|&;
            buffer += '\\'; // friendly reminder that \\ in JS strings escapes to a single \
        }
        buffer += c;
    });
    return buffer;
}
