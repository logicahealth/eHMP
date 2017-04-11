'use strict';
var _ = require('lodash');

var parse = require('./orqqpl4-lex-lookup-parser').parse;
var rpcUtil = require('./../utils/rpc-util');
var validate = require('./../utils/validation-util');
var nullUtil = require('../../core/null-utils');
var rpcClientFactory = require('../utils/rpc-client-factory');


/**
 * Calls the RPC 'ORQQPL4 LEX' and parses out the data<br/><br/>
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param searchString The string that you want the RPC to perform the search with.<br/>
 * searchString is used when an RPC call requires a minimum of 3 characters in order to return data<br/>
 * This is not a filter - it is a search string.  For example, searching for RAD may return RADIACARE; however, searching for
 * DIA will not return RADIACARE.  Also, the search term may not always be the first 3 characters.  For example,
 * DIA will also return 'CONTRAST MEDIA <DIAGNOSTIC DYES>'.
 * @param view the type of data to return - known values we've seen used elsewhere are:<br/>
 * CLF (unknown what this is used for)<br/>
 * PLS (Problem Listing)
 * @param date 0=today
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 */
module.exports.getOrqqpl4LexLookUp = function(logger, configuration, searchString, view, date, synonym, noMinimumLength, callback) {
    if (_.isUndefined(noMinimumLength) && validate.isStringLessThan3Characters(searchString)) {
        return callback('searchString is a required parameter and must contain 3 or more characters');
    }

    if (validate.isStringNullish(view)) {
        return callback('view cannot be empty');
    }

    if (nullUtil.isNullish(date)) {
        date = 0;
    }

    //the calling function has already defaulted this parameter...
    //if (nullUtil.isNullish(synonym)) {
    //    synonym = 0;
    //}

    searchString = searchString.toUpperCase();
    view = view.toUpperCase();

    var rpcClient = rpcClientFactory.getClient(logger, configuration);

    rpcClient.execute('ORWLEX GETFREQ', searchString, function(error, recordCount) {
        if (error) {
            return callback(error);
        }

        if (recordCount >= 5000) {
            return callback('Your search ' + searchString + ' matched ' + recordCount + ' records, too many to Display. Refine your search',
                null, 456);
        }

        return rpcUtil.standardRPCCall(logger, configuration, 'ORQQPL4 LEX', searchString, view, date, synonym, parse, callback);
    });
};
