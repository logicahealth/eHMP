'use strict';

var writebackWorkflow = require('../core/writeback-workflow');
var validatePrintOrder = require('./orders-print-validator');
var printOrder = require('./orders-print-vista-printer');

module.exports.getResourceConfig = function() {
    return [{
        name: 'orders-print-print',
        path: '',
        post: printOrders,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],  // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        undocumented: true,
        isPatientCentric: true
    }];
};

function printOrders(req, res) {
    var tasks = [
        validatePrintOrder,
        printOrder
    ];
    writebackWorkflow(req, res, tasks);
}
