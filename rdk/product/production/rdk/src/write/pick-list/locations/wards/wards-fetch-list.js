'use strict';

var _ = require('lodash');
var async = require('async');
var rpcClientFactory = require('../../utils/rpc-client-factory');
var validate = require('./../../utils/validation-util');
var rdk = require('./../../../../core/rdk');
var http = rdk.utils.http;
var locationUtil = rdk.utils.locationUtil;

// constants
var ITERATEE_LIMIT = 5;
var RPC_ELEMENT_DELIMITER = '\r\n';
var RPC_FIELD_DELIMITER = '^';
var WARDS_RPC = 'ORQPT WARDS';
var WARDS_LOCATION_TYPE = 'W';

/**
 * Retrieves a list of wards as returned by the 'ORQPT WARDS' RPC.
 *
 * @param {object} logger The logger object
 * @param {object} configuration Contains the information necessary to connect to VistA and JDS
 * @param {function} callback Function to call with results or error
 * @param {object} params Contains request parameters
 */
module.exports.fetch = function(logger, configuration, callback, params) {
    var site = _.get(params, 'site');
    var rpcClient = rpcClientFactory.getClient(logger, configuration);

    rpcClient.execute(WARDS_RPC, function(err, rpcData) {
        logger.debug({
            wardsRpcData: rpcData
        });

        var wards = [];

        if (err) {
            return callback(err.message || err);
        }
        if (validate.isStringNullish(rpcData)) {
            return callback(null, wards);
        }

        var wardsCollection = _.filter(rpcData.split(RPC_ELEMENT_DELIMITER), Boolean);

        // For each ward returned by the RPC, call JDS to retrieve the mixed-case location name
        async.eachLimit(wardsCollection, ITERATEE_LIMIT, function callJDS(ward, jdsCallback) {
            logger.debug({
                ward: ward
            });
            var wardFields = ward.split(RPC_FIELD_DELIMITER);
            var wardIen = wardFields[0];
            var wardUid = locationUtil.getLocationUid(site, WARDS_LOCATION_TYPE, wardIen);

            var jdsOptions = _.extend({}, configuration.jdsServer, {
                url: '/data/' + wardUid,
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
                        var jdsWard = jdsResponse.data.items[0];
                        wards.push({
                            displayName: jdsWard.displayName,
                            name: jdsWard.name,
                            uid: jdsWard.uid
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

            logger.debug({
                wards: wards
            });
            // Ensure list is ordered after asyncronous calls.
            wards = _.sortBy(wards, 'displayName');
            callback(null, wards);
        });
    });
};
