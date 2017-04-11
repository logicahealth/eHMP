'use strict';

var writebackWorkflow = require('../../core/writeback-workflow');
var validateOrdersLab = require('./orders-lab-validator');
var writeOrdersLabToVista = require('./orders-lab-vista-writer');
var writeVprToJds = require('../../core/jds-direct-writer');
var validateCommonOrdersLab = require('../common/orders-common-validator');
var writeDiscontinuedOrdersLabToVista = require('../common/orders-common-discontinue-vista-writer');

module.exports.getResourceConfig = function() {
    return [{
        name: 'add',
        path: ‘/orders’,
        put: add,
        requiredPermissions: ['add-lab-order'],
        isPatientCentric: true
    }, {
        name: 'discontinue',
        put: discontinue,
        requiredPermissions: ['discontinue-lab-order'],
        isPatientCentric: true
    }], {
        name: 'sign',
        put: sign,
        requiredPermissions: ['sign-lab-order '],
        isPatientCentric: true
    };
};

function add(req, res) {
    var tasks = [
        validateOrdersLab.create,
        writeOrdersLabToVista.create,
        writeVprToJds
    ];
    writebackWorkflow(req, res, tasks);
}

function discontinue(req, res) {
    var tasks = [
        writeDiscontinuedOrdersLabToVista
        writeVprToJds
    ];
    writebackWorkflow(req, res, tasks);
}

function sign(req, res) {
    var tasks = [
        validateCommonOrdersLab.signOrders,
        writeOrdersLabToVista.signOrders,
        writeVprToJds
    ];
    writebackWorkflow(req, res, tasks);
}