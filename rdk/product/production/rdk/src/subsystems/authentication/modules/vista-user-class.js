'use strict';
var _ = require('lodash');
var rdk = require('../../../core/rdk');
var RdkTimer = rdk.utils.RdkTimer;
var RdkError = rdk.utils.RdkError;

var USERCLASS_RPC = 'HMPCRPC RPC';
var DG_RECORD_ACCESS = 'DG RECORD ACCESS';
var DG_SENSITIVITY = 'DG SENSITIVITY';
var DG_SECURITY_OFFICER = 'DG SECURITY OFFICER';
var PROVIDER = 'PROVIDER';

/**
 * Call (p)jds to set login properties after (un)successful log in attempts
 * @param {Object} req - typical default Express request object
 * @param {Object} res - typical default Express response object
 * @param {Function} userClassCB - typical callback function
 * @param {Object} params
 * @param {Object} params.rpcClient - vistajs.rpcClient instance
 * @param {Object} params.site - users site instance
 * @param {Object} params.data - data from the other calls
 * @return {Object|undefined}
 */
var userClassRPC = function(req, res, userClassCB, params) {
    var logger = req.logger;
    var rpcClient = params.rpcClient;
    var site = params.site;
    var data = params.data;
    //call to get User Classes
    var timer = new RdkTimer({
        'name': 'userClassRPCCallTimer',
        'start': true
    });

    var callback = function(err, data) {
        timer.log(logger, {
            'stop': true
        });
        return userClassCB(err, data);
    };
    var errorObj;
    rpcClient.execute(USERCLASS_RPC, {
            '"command"': 'getUserInfo',
            '"userId"': data.duz[site]
        },
        function(error, result) {
            if (error) {
                //Error Handling for Authentication
                errorObj = new RdkError({
                    'error': error,
                    'code': 'vista.401.1005'
                });
                return callback(errorObj, null);
            }

            if (!_.isString(result)) {
                errorObj = new RdkError({
                    'code': 'vista.401.1006'
                });
                return callback(errorObj, null);
            }

            try {
                result = JSON.parse(result);
            } catch (e) {
                errorObj = new RdkError({
                    'error': e,
                    'code': 'vista.401.1007'
                });
                return callback(errorObj, null);
            }
            logger.trace(result, 'user class rpc parsed result');
            var returnObj = {};
            returnObj.vistaUserClass = _.result(result, 'vistaUserClass', []);
            returnObj.vistaKeys = _.keys(_.result(result, 'vistaKeys', {}));
            returnObj.title = _.result(result, 'vistaPositions.role') || '';
            returnObj.dgRecordAccess = (returnObj.vistaKeys.indexOf(DG_RECORD_ACCESS) > -1).toString();
            returnObj.dgSensitiveAccess = (returnObj.vistaKeys.indexOf(DG_SENSITIVITY) > -1).toString();
            returnObj.dgSecurityOfficer = (returnObj.vistaKeys.indexOf(DG_SECURITY_OFFICER) > -1).toString();
            returnObj.provider = (returnObj.vistaKeys.indexOf(PROVIDER) > -1);

            return callback(null, returnObj);
        });
};

module.exports = userClassRPC;
