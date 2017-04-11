'use strict';
var _ = require('lodash');
var nullUtil = require('../../core/null-utils');
var rpcClientFactory = require('./rpc-client-factory');

//----------------------------------------------------------------------------------------------------------------------
//                               Calling RPC's in a standard way
//----------------------------------------------------------------------------------------------------------------------

/**
 * Calls a VistA RPC and returns the data.  parameters can be zero or more arguments.
 *
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param rpcName the name of the RPC to call
 * @param parameters the parameters to pass to the RPC (can be zero or more parameters).
 * @param parse This will be called with the data retrieved from the RPC to parse into JSON.
 * @param callback This will be called with the parsed json data retrieved from the RPC (or if there's an error).
 */
function standardRPCCall(logger, configuration, rpcName, parameters, parse, callback) {
    callback = arguments[arguments.length - 1];
    parse = arguments[arguments.length - 2];

    //The following code is a close duplication of the code in VistaJS.callRpc for validation.
    if (!rpcName) {
        logger.error('rpc-util.standardRPCCall error no rpcName parameter was passed to standardRPCCall()');
        return callback('no rpc parameter was passed to standardRPCCall()');
    }

    if (!configuration) {
        logger.error('rpc-util.standardRPCCall error RPC (' + rpcName + '): No configuration was passed to standardRPCCall()');
        return callback('No configuration was passed to standardRPCCall()');
    }

    if (!configuration.host) {
        logger.error('rpc-util.standardRPCCall error RPC (' + rpcName + '): No host was found in the configuration');
        return callback('No host was found in the configuration');
    }

    if (arguments.length < 5) {
        logger.error('rpc-util.standardRPCCall error RPC (' + rpcName + '): Invalid number of arguments passed to standardRPCCall()');
        return callback('Invalid number of arguments passed to standardRPCCall()');
    }

    if (!(arguments[arguments.length - 1] instanceof Function)) {
        logger.error('rpc-util.standardRPCCall error RPC (' + rpcName + '): No callback function was passed to standardRPCCall()');
        return callback('No callback function was passed to standardRPCCall()');
    }

    if (!(arguments[arguments.length - 2] instanceof Function)) {
        logger.error('rpc-util.standardRPCCall error RPC (' + rpcName + '): No parse function was passed to standardRPCCall()');
        return callback('No parse function was passed to standardRPCCall()');
    }


    var params = [];
    if (arguments.length > 5) {
        var args = _.toArray(arguments);
        params = _.map(args.slice(3, args.length - 2), function(param) {
            return param;
        });
    }

    logger.debug({params: params}, 'rpc-util.standardRPCCall RPC (' + rpcName + ')');

    params = _.flatten(params, true);
    params = _.filter(params, function(param) {
        return param !== null && param !== undefined;
    });

    logger.debug({params: params}, 'rpc-util.standardRPCCall RPC (' + rpcName + '): params flattened and filtered');
    //End the following code is a close duplication of the code in VistaJS.callRpc for validation.

    var rpcClient = rpcClientFactory.getClient(logger, configuration);

    rpcClient.execute(rpcName, params, function(err, rpcData) {
        if (err) {
            logger.error({error: err}, 'rpc-util.standardRPCCall error RPC (' + rpcName + ')');
            return callback(err);
        }

        var obj;
        try {
            logger.debug({data: rpcData}, 'rpc-util.standardRPCCall RPC (' + rpcName + ') data returned from RPC');
            obj = parse(logger, rpcData, configuration);
        } catch (parseError) {
            logger.error({error: parseError}, 'rpc-util.standardRPCCall error parsing RPC (' + rpcName + ')');
            return callback((parseError.message || parseError));
        }

        if (nullUtil.isNullish(obj)) {
            logger.info('rpc-util.standardRPCCall RPC (' + rpcName + ') parsed JSON: was nullish');
        }
        else {
            logger.debug({json: obj}, 'rpc-util.standardRPCCall RPC (' + rpcName + ') parsed JSON');
        }

        callback(null, obj);
    });
}
module.exports.standardRPCCall = standardRPCCall;
module.exports.standardRpcCall = standardRPCCall;

/**
 * Calls an RPC repeatedly and parses out the data.<br/><br/>
 *
 * If there are more than 44 results, we get back exactly 44 records. At that point, we call the exact same RPC call
 * again passing in the value of the name from the last record (the 44th record).<br/>
 * This will continue until we receive less than 44 records.<br/><br/>
 *
 * FOR MORE INFORMATION ON RPC PAGINATION WITH 44 RECORDS, LOOK AT &quot;rpc-util.removeExistingEntriesFromRPCResult&quot;<br/><br/>
 *
 * Because of pagination with this RPC call, it is a recursive function.<br/>
 * For those worried about recursive functions, it took 2283 recursive calls to an RPC before it blew up
 * with the Maximum call stack size exceeded on my machine (tested multiple times). That means 100,452 individual records
 * would need to be coming back to a pick list before you would ever run into an issue (something that would never happen).
 *
 * @param logger The logger.
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param rpcName The RPC to call.
 * @param parse The parser function to handle the data returned.
 * @param retValue An array that will be populated by the recursive function - this array will be passed to the callback.
 * @param searchString The location to start returning data from - call with an empty String to retrieve all of the data.
 * @param searchStringFieldName Field name associated with the searchString.
 * @param callback This will be called with the array of data retrieved from multiple calls to the RPC (or if there's an error).
 * @param parameters Additional parameters for the RPC (if any).
 */
function callRPCRecursively(logger, configuration, rpcName, parse, retValue, searchString, searchStringFieldName, callback, parameters) {
    logger.trace('callRPCRecursively - entering method for rpc ' + rpcName + ': searchString=' + searchString);
    var rpcClient = rpcClientFactory.getClient(logger, configuration);

    var rpcCall = [rpcName, searchString, '1'];
    if (parameters) {
        if (_.isArray(parameters)) {
            //parameters contains multiple parameters.
            _.each(parameters, function(param) {
                rpcCall.push(param);
            });
        } else {
            //parameters contains (is) only one parameter.
            rpcCall.push(parameters);
        }
    }

    rpcClient.execute(rpcCall, function(err, rpcData) {
        if (err) {
            return callback(err.message || err);
        }

        var MAX_RPC_RESULTS_RETURNED = 44;
        try {
            logger.trace(rpcData);
            var obj;
            if (parse && _.isFunction(parse)) {
                obj = parse(logger, rpcData);
            } else {
                logger.trace('No parse function for RPC ' + rpcName);
                obj = rpcData;
            }

            var localStartName = obj.length > 0 ? _.get(_.last(obj), searchStringFieldName).toUpperCase() : null;

            var callAgain = false;
            if (obj.length >= MAX_RPC_RESULTS_RETURNED) {
                callAgain = true;
            }

            obj = removeExistingEntriesFromRPCResult(logger, retValue, obj);

            retValue = retValue.concat(obj);

            if (callAgain) {
                callRPCRecursively(logger, configuration, rpcName, parse, retValue, localStartName, searchStringFieldName, callback, parameters);
                return;
            }
        }
        catch (parseAndRpcUtilError) {
            return callback(parseAndRpcUtilError.message || parseAndRpcUtilError);
        }

        callback(null, retValue);
    });
}
module.exports.callRPCRecursively = callRPCRecursively;
module.exports.callRpcRecursively = callRPCRecursively;

//----------------------------------------------------------------------------------------------------------------------
//                               Duplicate Entry Removal Functions
//----------------------------------------------------------------------------------------------------------------------

/**
 * This method will create a duplicate of arrFromRPC by comparing the records in arrFromRPC to the records in
 * arrExistingEntries.  If it finds any duplicates, it will not include them in the results returned.<br/>
 * If arrExistingEntries is null or not an array an exception will be thrown<br/>
 * If arrFromRPC is null or not an array an exception will be thrown<br/>
 * If arrExistingEntries is empty, arrFromRPC will be returned unaltered<br/>
 * If arrFromRPC is empty, an empty array will be returned<br/><br/>
 *
 * Note, this function does NOT ensure there are no duplicates in the arrFromRPC array - it only makes sure
 * the entries in arrFromRPC don't already exist in arrExistingEntries.<br/><br/>
 *
 * <font color="red">NOTE: It is important that you retrieve the name from the 44th+ record (to give to the recursive
 * RPC call) before calling this function in case that record is one that is removed.</font><br/><br/><br/><br/>
 *
 *
 * The RPC call will not return everything from the call but will only return 44+ records starting at (or after) the
 * string you pass in (it's not an exact match of that string but the record closest to what you passed in).<br/><br/>
 *
 * Many of the RPC's that support pagination allow you to pass in an empty String to start at the beginning of the list.
 * However, some of them require you to pass in a minimum of 3 characters.<br/><br/>
 *
 * When it comes to anything that involves pagination in CPRS (ex. searching for a patient) if there are more than 44
 * results in VistA, you typically get back exactly 44 records (though you can get more - see below).
 * At that point, we call the exact same RPC call again passing in the value of the name from the last record
 * (typically the 44th record). This would continue until we receive less than 44 records.<br/><br/>
 *
 * Typically, you will receive exactly 44 records back; however, it is possible to get more than 44 records
 * back when making the same RPC call with some searchString's but not others.<br/>
 * Suppose you had 113 records all with the same name in VistA and you requested a record that was the one prior to this, you'd
 * probably expect to get 44 records back (with 43 of them having identical names) but would in fact receive 114 records
 * (the one before plus the 113 with the same name).<br/>
 * Suppose record 44 was the start of those 113 records, you'd get 157 records back.<br/><br/>
 *
 * Pagination here is similar to a lookup in a phone book. If you want to find someones name, you pick the first name in the
 * book that is similar to the name you are looking for and put your finger on the name. Then, start scanning down the
 * list of names from there for 44 names total.  You haven't reached the end of the book. If you want 44 more names,
 * move your finger 44 names down in the book. Then look at the next 44 names starting at your finger.<br/><br/>
 *
 * <u>Note</u> (handled by this method)<br/>
 * There are instances where calling an RPC with a searchString returns the same record; however, most of the time it
 * returns the next record. See "Duplicates with Allergy Symptoms RPC Calls.txt" for an example of this happening in calls
 * from CPRS - the 1st record of that new search is identical to the 44th result (last record of the previous search).<br/><br/>
 *
 * @param log The logger
 * @param arrExistingEntries An array with at le
 * @param arrFromRPC
 */
function removeExistingEntriesFromRPCResult(log, arrExistingEntries, arrFromRPC) {
    if (nullUtil.isNullish(arrExistingEntries)) {
        throw new Error('arrExistingEntries cannot be null');
    }
    if (nullUtil.isNullish(_.isArray(arrExistingEntries))) {
        throw new Error('arrExistingEntries must be an array');
    }
    if (nullUtil.isNullish(arrFromRPC)) {
        throw new Error('arrFromRPC cannot be null');
    }
    if (nullUtil.isNullish(_.isArray(arrFromRPC))) {
        throw new Error('arrFromRPC must be an array');
    }

    if (_.isEmpty(arrExistingEntries)) {
        return arrFromRPC;
    }
    if (_.isEmpty(arrFromRPC)) {
        return [];
    }

    return _.filter(arrFromRPC, function(n) {
        var add = true;
        _.each(arrExistingEntries, function(item) {
            var json1 = JSON.stringify(n);
            var json2 = JSON.stringify((item));
            if (json1 === json2) {
                add = false;
                return false; //break out of the loop.
            }
        });
        return add;
    });
}
module.exports.removeExistingEntriesFromRPCResult = removeExistingEntriesFromRPCResult;

//----------------------------------------------------------------------------------------------------------------------
//                               Conversion Functions
//----------------------------------------------------------------------------------------------------------------------

/**
 * Converts a boolean value to the characters 'Y' or 'N' as the RPC needs those specific characters to work.
 */
module.exports.convertBooleanToYN = function(myBool) {
    return myBool ? 'Y' : 'N';
};

/**
 * Removes all empty strings from the given array
 */
module.exports.removeEmptyValues = function(arr) {
    return _.filter(arr, Boolean);
};

module.exports.getBooleanValue = function(value) {
    if (_.isBoolean(value)) {
        return Boolean(value);
    }
    else if (_.isString(value)) {
        if (value.toLowerCase() === 'true') {
            return true;
        }
        if (value.toLowerCase() === 'false') {
            return false;
        }
        else {
            throw new Error('getBooleanValue: String "' + value + '" was not a boolean value');
        }
    }
    else {
        throw new Error('getBooleanValue: Was not a boolean value it was a: ' + typeof value);
    }
};
