'use strict';
var _ = require('lodash');
var parse = require('./hmp-patient-select-parser').parse;
var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var rpcUtil = require('../../write/pick-list/utils/rpc-util');
var getVistaRpcConfiguration = require('../../utils/rpc-config').getVistaRpcConfiguration;

module.exports.apiDocs = {
    spec: {
        summary: 'Selects patients by search criteria and returns basic patient and demographic information for patients found in search.',
        notes: 'HMP PATIENT SELECT',
        parameters: [{
            name: 'searchType',
            description: 'The type of search to perform. May be one of the following values: ' +
                'LAST5 - "last5" format of ssn (i.e., patient\'s last intial + last4 of ssn) ' +
                'NAME - search by patient name, can be partial name ' +
                'ICN - select patient by ICN ' +
                'PID - select patient by PID',
            type: 'string',
            required: true,
            paramType: 'query'
        }, {
            name: 'searchString',
            description: 'Term to search for when looking up patient. Should match type specified in searchType.',
            type: 'string',
            required: true,
            paramType: 'query'
        }],
        responseMessages: []
    }
};

/**
 * Checks to see if value is null, empty, or is not a String.  If any of those are true, this will return true.
 *
 * @param value The string to check for null, empty, or not a String
 * @returns {boolean} returns true if value is null, empty, or is not a String
 */
function isStringNullish(value) {
    return (nullchecker.isNullish(value) || value === '' || !_.isString(value) || _.isEmpty(value));
}

/**
 * Calls the RPC 'HMP PATIENT SELECT' and parses out the data - Selects patients by search criteria and returns basic
 * patient and demographic information for patients found in search.
 *
 * @param req The req
 * @param params object which can contain optional and/or required parameters as described above.
 * @param site
 * @param callback This will be called with the data retrieved from the RPC (or if there's an error).
 */
module.exports.fetch = function(req, params, site, callback) {
    //This RPC is found in the following context - this context does not change and is specific to this RPC call.
    var rpcConfig = getVistaRpcConfiguration(req.app.config, req.session.user);
    rpcConfig.context = 'HMP UI CONTEXT';
    var searchString = params.searchString;
    var searchType = params.searchType;
    if (isStringNullish(searchString)) {
        return callback('searchString cannot be empty');
    }
    if (isStringNullish(searchType)) {
        return callback('searchType cannot be empty');
    }
    if (searchType !== 'LAST5' && searchType !== 'NAME' && searchType !== 'ICN' && searchType !== 'PID') {
        return callback('searchType must be "LAST5", "NAME", "ICN", or "PID"');
    }
    return rpcUtil.standardRPCCall(req.logger, rpcConfig, 'HMP PATIENT SELECT', searchType, searchString, parse, callback);
};
