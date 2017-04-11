'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var writebackWorkflow = require('../core/writeback-workflow');
var encryptSig = require('../orders/common/orders-sig-code-encryptor');
var signatureValidator = require('./consult-order-validator');

module.exports.getResourceConfig = function() {
    return [{
        name: 'consult-orders-sign',
        path: '/consult-sign',
        post: signConsultOrder,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['sign-consult-order'],
        isPatientCentric: true
    }];
};

function signConsultOrder(req, res) {
    req.logger.debug('Signing Orders');

    var tasks = [
        signatureValidator.validateSignature
    ];
    writebackWorkflow(req, res, tasks);
}
