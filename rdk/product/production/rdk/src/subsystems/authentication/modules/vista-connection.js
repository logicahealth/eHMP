'use strict';
var _ = require('lodash');
var rdk = require('../../../core/rdk');
var RdkTimer = rdk.utils.RdkTimer;
var RdkError = rdk.utils.RdkError;

/**
 * Call (p)jds to set login properties after (un)successful log in attempts
 * @param {Object} req - typical default Express request object
 * @param {Object} res - typical default Express response object
 * @param {Function} userClassCB - typical callback function
 * @param {Object} params
 * @param {Object} params.rpcClient - vistajs.rpcClient instance
 * @param {Object} params.site - users site instance
 * @return {Object|undefined}
 */
var accessVerifyConnection = function(req, res, connectCB, params) {
    var logger = req.logger;
    var rpcClient = params.rpcClient;
    var site = params.site;
    var division = params.division;
    var vistaSites = _.get(req, 'app.config.vistaSites', {});
    var errorObj;

    var timer = new RdkTimer({
        'name': 'vistaAuthTimer',
        'start': true
    });

    var callback = function(err, data) {
        timer.log(logger, {
            'stop': true
        });
        return connectCB(err, data);
    };
    //This is same as RpcClient instance connect from interceptors/authentication/authentication.
    rpcClient.connect(function(error, vistaJSAuthResult) {
        if (error) {
            var code = 'vista.401.1001';
            var message = error.message || error || '';
            console.log(error);
            if (message.match(/No DUZ returned from login request/) ||
            message.match(/(access code)|(verify code)/gi)) {
                code = 'vista.401.1002';
            } else if (message.match(/MULTIPLE SIGNONS/)) {
                code = 'vista.401.1003';
            } else if (message.match(/context .+ does not exist/)) {
                code = 'vista.401.1004';
            } else if (message.match(/ECONNREFUSED/)) {
                code = 'vista.503.1001';
            }
            //Error Handling for Authentication
            errorObj = new RdkError({
                'error': error,
                'code': code
            });

            logger.trace(errorObj, 'from vistaConnection');
            return callback(errorObj, null);
        }

        if (!vistaJSAuthResult) {
            errorObj = new RdkError({
                'code': 'rdk.401.1001'
            });
            return callback(errorObj, null);
        }

        //Valid user so fill in result
        var obj = {
            duz: {},
            consumerType: 'user'
        };
        obj.username = site + ';' + _.result(vistaJSAuthResult, 'accessCode', '');
        obj.password = _.result(vistaJSAuthResult, 'verifyCode', '');
        obj.facility = _.find(vistaSites[site].division, {id : division}).name;
        obj.duz[site] = _.result(vistaJSAuthResult, 'duz', '');
        obj.infoButtonOid = vistaSites[site].infoButtonOid;
        obj.site = site;
        obj.division = division;
        //set req site property since valid user
        req.site = site;
        //set the audit username
        req.audit.authuser = obj.duz;
        return callback(null, obj);
    });
};

module.exports = accessVerifyConnection;
