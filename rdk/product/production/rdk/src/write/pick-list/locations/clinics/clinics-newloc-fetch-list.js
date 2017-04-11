'use strict';

var _ = require('lodash');
var async = require('async');
var rdk = require('./../../../../core/rdk');
var rpcClientFactory = require('../../utils/rpc-client-factory');
var validate = require('./../../utils/validation-util');
var http = rdk.utils.http;
var locationUtil = rdk.utils.locationUtil;

// constants
var ITERATEE_LIMIT = 5;
var CLINICS_LOCATION_TYPE = 'C';
var MAX_RPC_RESULTS_RETURNED = 44; //RPC calls will return no more than 44 records if they support pagination (see JSDoc).
var NEWLOC_RPC = 'ORWU1 NEWLOC';
var RPC_ELEMENT_DELIMITER = '\r\n';
var RPC_FIELD_DELIMITER = '^';
var SORT_ORDER_DESC = '1';

/**
 * Calls the RPC 'ORWU1 NEWLOC' repeatedly and parses out the data. (Special implementation due to non-standard parser structure.)<br/><br/>
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
 * @param logger The logger
 * @param configuration This contains the information necessary to connect to the RPC.
 * @param retValue An array that will be populated by the recursive function - this array will be passed to the callback.
 * @param searchString The location to start returning data from - call with an empty String to retrieve all of the data.
 * @param callback This will be called with the array of data retrieved from multiple calls to the RPC (or if there's an error).
 * @param params Object which can contain optional and/or required parameters.
 */
function callRpcRecursively(logger, configuration, retValue, searchString, callback, params) {
    var site = _.get(params, 'site');

    var rpcClient = rpcClientFactory.getClient(logger, configuration);

    rpcClient.execute(NEWLOC_RPC, searchString, SORT_ORDER_DESC, function(err, rpcData) {
        if (err) {
            return callback(err.message || err);
        }

        var clinicsCollection = _.filter(rpcData.split(RPC_ELEMENT_DELIMITER), Boolean);
        var clinics = [];

        // For each clinic returned by the RPC, call JDS to retrieve the mixed-case location name
        async.eachLimit(clinicsCollection, ITERATEE_LIMIT, function callJDS(clinic, jdsCallback) {
            logger.debug({
                clinic: clinic
            });
            var clinicFields = clinic.split(RPC_FIELD_DELIMITER);
            var clinicIen = clinicFields[0];
            var clinicUid = locationUtil.getLocationUid(site, CLINICS_LOCATION_TYPE, clinicIen);
            var jdsOptions = _.extend({}, configuration.jdsServer, {
                url: '/data/' + clinicUid,
                timeout: 120000,
                logger: logger,
                json: true
            });

            http.get(jdsOptions, function processJDSResponse(jdsError, jdsResponseCode, jdsResponse) {
                if (jdsError) {
                    logger.debug({error: jdsError}, 'JDS returned an error');
                    return jdsCallback(jdsError);
                }

                if (_.isObject(jdsResponse)) {
                    if (jdsResponse.error) {
                        logger.debug({error: jdsResponse.error}, 'The JDS response object contained an error');
                        return jdsCallback(jdsResponse.error);
                    }

                    if (jdsResponse.data && jdsResponse.data.items) {
                        var jdsClinic = jdsResponse.data.items[0];
                        clinics.push({
                            displayName: jdsClinic.displayName,
                            name: jdsClinic.name,
                            uid: jdsClinic.uid
                        });
                        return jdsCallback();
                    }
                    return jdsCallback('The JDS response was not formatted as expected.');
                }
                return jdsCallback('JDS response was not a JSON object.');
            });
        }, function (err) {
            if (err) {
                callback(err);
            }

            var localStartName = clinics.length > 0 ? _.last(clinics).name : null;
            if (!validate.isStringNullish(localStartName)) {
                localStartName = localStartName.toUpperCase();
            }

            var callAgain = false;
            if (clinics.length >= MAX_RPC_RESULTS_RETURNED) {
                callAgain = true;
            }

            retValue = retValue.concat(clinics);

            if (callAgain) {
                callRpcRecursively(logger, configuration, retValue, localStartName, callback, params);
                return;
            }

            // Ensure list is ordered after asyncronous calls.
            retValue = _.sortBy(retValue, 'displayName');
            callback(null, retValue);
        });
    });
}

module.exports.fetch = function(logger, configuration, callback, params) {
    var retValue = [];
    var initialSearchString = '';
    callRpcRecursively(logger, configuration, retValue, initialSearchString, callback, params);
};
