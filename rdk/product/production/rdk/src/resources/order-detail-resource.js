'use strict';

var rdk = require('../core/rdk');
var _ = require('lodash');
var RpcClient = require('vista-js').RpcClient;
var vistaRpcConfiguration = require('../utils/rpc-config');
var nullchecker = rdk.utils.nullchecker;
var errorMessage = 'There was an error processing your request. The error has been logged.';
var errorVistaJSCallback = 'VistaJS RPC callback error: ';
var uidUtils = rdk.utils.uidUtils;

function getResourceConfig(app) {
    return [{
        name: 'order-detail',
        path: '/detail/:uid',
        interceptors: {
            convertPid: true
        },
        get: getOrderDetail,
        subsystems: ['patientrecord', 'jdsSync', 'authorization'],
        requiredPermissions: ['read-order'],
        isPatientCentric: true
    }];
}

/**
* Retrieves details about an order given an order UID.
*
* @param {Object} req - The default Express request that contains the
                        URL parameters needed to retrieve order details.
* @param {Object} res - The default Express response that will contain
                        order details.
* @param {function} next - The middleware to be executed after this
                        function has finished executing.
*/
function getOrderDetail(req, res) {

    var uid = req.params.uid;
    if (nullchecker.isNullish(uid)) {
        return res.status(rdk.httpstatus.precondition_failed).rdkSend('Missing uid parameter');
    }
    var uidPieces = uidUtils.extractPiecesFromUID(uid);
    var orderId = uidPieces.localId + ';1';
    var dfn = uidPieces.patient;
    var site = uidPieces.site;

    var config = {
        site: site
    };
    var vistaConfig = vistaRpcConfiguration.getVistaRpcConfiguration(req.app.config, config);
    if (_.isUndefined(vistaConfig.host)) {     // If vista host is undefined
        res.rdkSend({                          // then this order is from a non-connected site.
            'data': 'Details for order #' + uidPieces.localId + ' are not available from the remote location at this time.'
        });
    } else {
        vistaConfig = _.omit(vistaConfig, 'division');    // Use default division
        RpcClient.callRpc(req.logger, vistaConfig, 'ORQOR DETAIL', [orderId,dfn], function(error, result) {
            if (error) {
                req.logger.error({
                    error: error
                }, errorVistaJSCallback);
                res.status(rdk.httpstatus.internal_server_error).rdkSend(errorMessage);
            } else {
                if (result) {
                    req.logger.info('Successfully retrieved order detail from VistA.');
                    res.rdkSend({
                        'data': result
                    });
                } else {
                    req.logger.error({
                        result: result
                    }, errorVistaJSCallback + ' no result');
                    res.status(rdk.httpstatus.internal_server_error).rdkSend(errorMessage);
                }
            }
        });
    }
}

module.exports.getResourceConfig = getResourceConfig;
module.exports.getOrderDetail = getOrderDetail;
