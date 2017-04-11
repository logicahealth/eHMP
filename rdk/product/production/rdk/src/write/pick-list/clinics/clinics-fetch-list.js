'use strict';

var _ = require('lodash');
var async = require('async');
var parse = require('./clinics-fetch-parser').parse;
var rpcClientFactory = require('../utils/rpc-client-factory');
var nullUtil = require('../../core/null-utils');

function searchRPCCall(logger, configuration, rpcClient, rpcName, params, callback) {
    var seedString = _.get(params, 'seedString');
    var searchDirection = _.get(params, 'searchDirection');

    if (_.isUndefined(seedString) || _.isEmpty(seedString)) {
        seedString = '';
    }

    // in all other cases than 1 or -1, make it an ascending order
    searchDirection = parseInt(searchDirection, 10);
    if (searchDirection !== 1 && searchDirection !== -1) {
        searchDirection = 1;
    }

    rpcClient.execute(rpcName, seedString, searchDirection, function (err, rpcData) {
        if (err) {
            logger.error('rpc-util.standardRPCCall error RPC (' + rpcName + '): ' + err);
            return callback(err);
        }

        try {
            logger.debug('rpc-util.standardRPCCall RPC (' + rpcName + ') data returned from RPC: ' + rpcData);
            var obj = parse(logger, rpcData, configuration);

            if (nullUtil.isNullish(obj)) {
                logger.info('rpc-util.standardRPCCall RPC (' + rpcName + ') parsed JSON: was nullish');
            }
            else {
                logger.debug('rpc-util.standardRPCCall RPC (' + rpcName + ') parsed JSON: ' + JSON.stringify(obj, null, 2));
            }

            return callback(null, obj);
        }
        catch (parseError) {
            logger.error('rpc-util.standardRPCCall error parsing RPC (' + rpcName + '): ' + (parseError.message || parseError));
            return callback((parseError.message || parseError));
        }
    });
}
function getClinicsFromBeginning(logger, configuration, rpcClient, params, callback){
    return searchRPCCall(logger, configuration, rpcClient, 'ORWU CLINLOC', params, callback)

}

function getClinicsFromEnd(logger, configuration, rpcClient, params, callback){
    return searchRPCCall(logger, configuration, rpcClient, 'ORWU CLINLOC', params, callback)

}

/**
 * Calls the RPC 'ORWU CLINLOC' and parses out the data.<br/>
 * to retrieve a list of clinics<br/><br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>REQUIRED PARAMS</b></th></tr>
 * 	<tr><td colspan=2><b>NONE</b></td></tr>
 * </table>
 * <br/>
 * <br/>
 *
 * <table border="1">
 * 	<tr><th colspan=2><b>OPTIONAL PARAMS</b></th></tr>
 * 	<tr>
 * 		<td>seedString</td>
 * 		<td>
 * 			seed string for search, defaulting to A to get the complete list (same as CPRS)
 * 		</td>
 * 	</tr>
 * 	 * 	<tr>
 * 		<td>searchtDirection</td>
 * 		<td>
 * 			direction of search, 1 for forward and -1 for backward, defaulting to 1 (same as CPRS)
 * 		</td>
 * 	</tr>
 * </table>
 * <br/><br/>
 *
 *  *
 * Returns the following data for Problems:<br/>
 * ien<br/>
 * clinic
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param outerCallback This will be called with the data retrieved from the RPC (or if there's an error).
 * @param params object which can contain optional parameters as described above.
 */
module.exports.fetch = function(logger, configuration, outerCallback, params) {
    var rpcClient = rpcClientFactory.getClient(logger, configuration);

    async.series([
        function firstCall(callback){
            getClinicsFromBeginning(logger, configuration, rpcClient, params, callback);
        },
        function secondCall(callback) {
            params = {};
            params.seedString = '';
            params.searchDirection = -1;
            getClinicsFromEnd(logger, configuration, rpcClient, params, callback);
    }], function (err, results) {
        if (err) {
            logger.error(err);
            return outerCallback(err);
        }

        if (!_.isArray(results) && results.length !== 2) {
            logger.error("unexpected results received from this call.");
            return outerCallback(err);
        }

        results = results[0].concat(results[1]);
        return outerCallback(null, results);
    });
};