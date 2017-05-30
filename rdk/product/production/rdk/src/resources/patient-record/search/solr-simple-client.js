'use strict';
var _ = require('lodash');
var moment = require('moment');
var solrSmartClient = require('solr-smart-client');
var querystring = require('querystring');
var ForeverAgent = require('forever-agent');

module.exports.executeSolrQuery = executeSolrQuery;
module.exports.compileQueryParameters = compileQueryParameters;
module.exports.emulatedHmpGetRelativeDate = emulatedHmpGetRelativeDate;
module.exports.escapeQueryChars = escapeQueryChars;

var solrClient = null;
var foreverAgent = new ForeverAgent();

function initSolr(solrConfig, req) {
    if (solrClient === null) {
        req.logger.info('SolrSmartClient.InitClient called');
        solrClient = solrSmartClient.initClient(solrConfig.core, solrConfig.zooKeeperConnection, req.logger, foreverAgent);
    }

    return solrClient;
}

/**
 * @param {Object|String} [query] - the query data to use in the Solr query
 * @param {String} method - The type of Solr `handler` or path to execute
 * @param {Object} req - A standard Express request Object
 * @param {Function} callback(err,obj) - function to execute when Solr server responds
 * @param {Error} callback().err
 * @param {Object} callback().obj - JSON response sent by the Solr server deserialized
 */
function executeSolrQuery(query, method, req, callback) {
    var solrConfig = req.app.config.solrClient;
    var client = initSolr(solrConfig, req);
    //US17315: adding requestId to solr query for logging at solr
    if (typeof query === 'string') {
        query = querystring.parse(query);
    }
    query.requestId = req.id;
    req.logger.debug({ 'query': query }, 'Solr Request query object');
    // test client was injected for testing
    if(_.has(req, 'solrTestClient')) {
        client = req.solrTestClient;
    }
    client.get(method, query, function(error, solrResult) {
        if (error) {
            req.logger.error('Error performing search', (error.message || error));
            return callback(error);
        }
        return callback(null, solrResult);
    });
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
function escapeQueryChars(unescaped, preserveWhitespace) {
    if (!unescaped) {
        return '';
    }
    // match the comment below and (if requested) any whitespace
    // \+-!():^[]"{}~*?|&;
    // see http://lucene.apache.org/core/5_1_0/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#Escaping_Special_Characters
    if (preserveWhitespace) {
        return unescaped.replace(/([\\\+\-\!\(\)\:\^\[\]\"\{\}\~\*\?\|\&\;\/])/g, '\\$1');
    } else {
        return unescaped.replace(/([\\\+\-\!\(\)\:\^\[\]\"\{\}\~\*\?\|\&\;\/\s])/g, '\\$1');
    }
}
