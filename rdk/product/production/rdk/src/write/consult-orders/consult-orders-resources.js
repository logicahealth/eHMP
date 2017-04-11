'use strict';

var writebackWorkflow = require('../core/writeback-workflow');
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
