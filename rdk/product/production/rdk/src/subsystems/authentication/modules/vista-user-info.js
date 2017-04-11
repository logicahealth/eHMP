'use strict';
var _ = require('lodash');
var rdk = require('../../../core/rdk');
var RdkTimer = rdk.utils.RdkTimer;
var RdkError = rdk.utils.RdkError;

var USERINFO_RPC = 'ORWU USERINFO';
var CORTABS_INDEX = 21;
var RPC_INDEX = 22;
var NAME_INDEX = 1;

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
var vistaUserInfo = function(req, res, userInfoCB, params) {
    var logger = req.logger;
    var rpcClient = params.rpcClient;
    //call to get corsTabs and rptTabs
    var timer = new RdkTimer({
        'name': 'userInfoRPCCallTimer',
        'start': true
    });

    var callback = function(err, data) {
        timer.log(logger, {
            'stop': true
        });
        return userInfoCB(err, data);
    };
    var errorObj;
    return rpcClient.execute(USERINFO_RPC, function(error, result) {
        if (error) {
            //Error Handling for Authentication
            errorObj = new RdkError({
                'error': error,
                'code': 'rdk.401.1008'
            });
            return callback(errorObj, null);
        }

        if (!_.isString(result)) {
            errorObj = new RdkError({
                'code': 'vista.401.1009'
            });
            return callback(errorObj, null);
        }

        result = result.split('^');
        logger.trace(result, 'user info rpc split result');

        var obj = {
            firstname: '',
            lastname: ''
        };
        obj.corsTabs = (result[CORTABS_INDEX] === '1') ? 'true' : 'false';
        obj.rptTabs = (result[RPC_INDEX] === '1') ? 'true' : 'false';

        if (obj.corsTabs === 'false' && obj.rptTabs === 'false') {
            errorObj = new RdkError({
                'code': 'vista.401.1010'
            });
            return callback(errorObj, null);
        }
        //set the name parts to be used later
        var nameParts = (result[NAME_INDEX]).split(',');
        if (_.size(nameParts) > 1) {
            obj.firstname = nameParts[1];
            obj.lastname = nameParts[0];
        }

        return callback(null, obj);
    });
};

module.exports = vistaUserInfo;
