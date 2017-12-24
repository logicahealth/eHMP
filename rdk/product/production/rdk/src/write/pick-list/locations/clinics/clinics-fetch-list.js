'use strict';

var _ = require('lodash');
var async = require('async');
var rdk = require('./../../../../core/rdk');
var rpcClientFactory = require('../../utils/rpc-client-factory');
var http = rdk.utils.http;
var locationUtil = rdk.utils.locationUtil;

var ITERATE_LIMIT = 5;
var CLINIC_LIST_RPC = 'ORWU CLINLOC';
var CLINIC_LOCATION_TYPE = '';
var RPC_ELEMENT_DELIMITER = '\r\n';
var RPC_FIELD_DELIMITER = '^';

//RPC calls will return no more than 44 records if they support pagination (see javadoc).
var MAX_RPC_RESULTS_RETURNED = 44;

//This is the default search direction required for the rpc.
var SEARCH_DIRECTION = 1;

/**
 * Calls the RPC 'ORWU CLINLOC' repeatedly and parses out the data. (Special implementation due to non-standard parser structure.)<br/><br/>
 *
 * If the RPC supports pagination, and there are more than 44 results in VistA, you typically get back exactly 44 records
 * (though you can get more - see below).
 * At that point, we call the exact same RPC call again passing in the value of the name from the last record
 * (typically the 44th record).<br/>
 * This will continue until we receive less than 44 records.<br/>
 * Typically, you will receive exactly 44 records back; however, it is possible to get more than 44 records
 * back when making the same RPC call with some searchString's but not others.<br/>
 * Suppose you had 113 records all with the same name in VistA and you requested a record that was the one prior to this, you'd
 * probably expect to get 44 records back (with 43 of them having identical names) but would in fact receive 114 records
 * (the one before plus the 113 with the same name).<br/>
 * Suppose record 44 was the start of those 113 records, you'd get 157 records back.<br/><br/>
 *
 * FOR MORE INFORMATION ON RPC PAGINATION WITH 44+ RECORDS, LOOK AT &quot;rpc-util.removeExistingEntriesFromRPCResult&quot;<br/><br/>
 *
 * Because of pagination with this RPC call, it is a recursive function.<br/>
 * For those worried about recursive functions, it took 2283 recursive calls to an RPC before it blew up
 * with the Maximum call stack size exceeded on my machine (tested multiple times). That means 100,452 individual records
 * would need to be coming back to a pick list before you would ever run into an issue (something that would never happen).
 *
 * @param {object} logger The logger
 * @param {object} rpcClient The rpc client which will be used to fetch the original list of clinics
 * @param {object} jdsOptions Contains the information necessary to connect to jds
 * @param {array} retValue An array that will be populated by the recursive function - this array will be passed to the callback.
 * @param {string} searchString The location to start returning data from - call with an empty String to retrieve all of the data.
 * @param {function} callback This will be called with the array of data retrieved from multiple calls to the RPC (or if there's an error).
 * @param {object} params Object which can contain optional and/or required parameters.
 */

function callRpcRecursively(logger, rpcClient, jdsOptions, retValue, searchString, callback, params) {
    var site = _.get(params, 'site');

    rpcClient.execute(CLINIC_LIST_RPC, searchString, SEARCH_DIRECTION, function(err, rpcData) {
        if (err) {
            return callback(err.message || err);
        }

        var clinicsCollection = _.filter(rpcData.split(RPC_ELEMENT_DELIMITER), Boolean);
        var clinics = [];

        // For each clinic returned by the RPC, call JDS to retrieve the mixed-case location name
        async.eachLimit(clinicsCollection, ITERATE_LIMIT, module.exports.getClinicFromJds.bind(this, logger, site, clinics, jdsOptions), function(err) {
            if (err) {
                callback(err);
            }

            var localStartName = clinicsCollection.length > 0 ? (_.last(clinicsCollection)).split(RPC_FIELD_DELIMITER)[1] : null;

            var callAgain = false;

            if (clinicsCollection.length >= MAX_RPC_RESULTS_RETURNED) {
                callAgain = true;
            }

            retValue = retValue.concat(clinics);

            if (callAgain) {
                callRpcRecursively(logger, rpcClient, jdsOptions, retValue, localStartName, callback, params);
                return;
            }


            // Ensure list is ordered after asyncronous calls.
            retValue = _.sortBy(retValue, 'displayName');

            callback(null, retValue);
        });
    });
}

/**
 *  Parses the rpc response and converts it to a jds query.
 *
 * @param {object} logger The logger
 * @param {string} site The site at which the RPC was called to populate the list of clinics
 * @param {array} clinicList Contains the list of clinics to be sent to the client
 * @param {object} jdsOptions Contains the information necessary to connect to jds
 * @param {string} clinic The clinic to fetch from jds
 * @param {function} callback This will signal t`he successful completion or error of the function
 */

function getClinicFromJds(logger, site, clinicList, jdsOptions, clinic, jdsCallback) {
    logger.debug({
        clinic: clinic
    });
    var clinicFields = clinic.split(RPC_FIELD_DELIMITER);
    var clinicIen = clinicFields[0];
    var clinicUid = locationUtil.getLocationUid(site, CLINIC_LOCATION_TYPE, clinicIen);
    jdsOptions.url = '/data/' + clinicUid;

    http.get(jdsOptions, processJDSResponse.bind(null, logger, clinicList, jdsCallback));
}

/**
 * Gets the displayName, name, and uid of a clinic from its corresponding JDS object.  If the object is found,
 * it will be pushed to the list of clinics passed to this function.  If it is not found, nothing will be added to the response.
 *
 * @param {object} logger The logger
 * @param {array} clinicList Contains the list of clinics to be sent to the client
 * @param {function} callback This will signal the successful completion or error of the function
 * @param {object} jdsError The error response from jds
 * @param {object} jdsResponseCode The response code from jds
 * @param {object} jdsResponse The response from jds
 */

function processJDSResponse(logger, clinicList, jdsCallback, jdsError, jdsResponseCode, jdsResponse) {

    if (jdsError) {
        logger.debug({
            error: jdsError
        }, 'JDS returned an error');
        return jdsCallback(jdsError);
    }
    if (_.isObject(jdsResponse)) {
        if (jdsResponse.error) {
            logger.debug({
                error: jdsResponse.error
            }, 'The JDS response object contained an error');
            return jdsCallback();
        }

        if (jdsResponse.data && jdsResponse.data.items) {
            var jdsClinic = jdsResponse.data.items[0];

            clinicList.push({
                displayName: jdsClinic.displayName,
                name: jdsClinic.name,
                uid: jdsClinic.uid
            });

            return jdsCallback();
        }
        return jdsCallback('The JDS response was not formatted as expected.');
    }
    return jdsCallback('JDS response was not a JSON object.');
}

module.exports.fetch = function(logger, configuration, callback, params) {
    var retValue = [];
    var initialSearchString = '';

    var jdsOptions = _.extend({}, configuration.jdsServer, {
        timeout: 120000,
        logger: logger,
        json: true
    });

    var rpcClient = rpcClientFactory.getClient(logger, configuration);
    callRpcRecursively(logger, rpcClient, jdsOptions, retValue, initialSearchString, callback, params);
};
module.exports.callRpcRecursively = callRpcRecursively;
module.exports.processJDSResponse = processJDSResponse;
module.exports.getClinicFromJds = getClinicFromJds;
