'use strict';

var _ = require('lodash');
var dd = require('drilldown');
var writebackWorkflow = require('../core/writeback-workflow');
var writeVprToJds = require('../core/jds-direct-writer');
var getCommonOrderTasks = require('./common/orders-common-tasks');

var validateOrders = {};
validateOrders['Medication, Outpatient'] = require('./med/orders-med-validator');
validateOrders['Laboratory'] = require('./lab/orders-lab-validator');
validateOrders['Common'] = require('./common/orders-common-validator');

var writeOrderToVista = {};
writeOrderToVista['Medication, Outpatient'] = require('./med/orders-med-vista-writer');
writeOrderToVista['Laboratory'] = require('./lab/orders-lab-vista-writer');

var writeToPjds = require('./common/orders-common-pjds-writer');

module.exports.getResourceConfig = function() {
    return [{
        name: 'orders-lab-create',
        path: '/lab',
        post: withOrderType('create'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['add-lab-order'],
        isPatientCentric: true
    }, {
        name: 'orders-lab-update',
        path: '/lab/:resourceId',
        put: withOrderType('update'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [], // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: true
    }, {
        name: 'orders-lab-edit',
        path: '/lab/:resourceId',
        get: commonOrder('editLab'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [], // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: true
    }, {
        name: 'orders-lab-detail',
        path: '/detail-lab/:resourceId',
        get: commonOrder('detailLab'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [], // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: true
    }, {
        name: 'orders-lab-sign-details',
        path: '/sign-details-lab',
        post: commonOrder('signDetailsLab'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [], // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: true
    }, {
        name: 'orders-lab-discontinue-details',
        path: '/discontinue-details-lab',
        post: commonOrder('discontinueDetailsLab'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [], // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: true
    }, {
        name: 'orders-lab-discontinue',
        path: '/discontinue-lab',
        delete: withOrderType('discontinueLab'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['discontinue-lab-order'],
        isPatientCentric: true
    }, {
        name: 'orders-lab-sign',
        path: '/sign-lab',
        post: commonOrder('signOrdersLab'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['sign-lab-order'],
        isPatientCentric: true
    }, {
        name: 'orders-lab-save-draft',
        path: '/save-draft-lab',
        post: commonOrder('saveDraftLabOrder'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['add-lab-order'],
        isPatientCentric: true
    },
    {
        name: 'orders-lab-find-draft',
        path: '/find-draft-lab',
        post: commonOrder('findDraftLabOrders'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [], // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: true
    }];
};

/**
 * Invoke writebackWorkflow with Order type specific tasks
 *
 * @param {string} order action
 * @returns {Function} writebackWorkflow
 */
function withOrderType(action) {
    return function(req, res) {
        var orderType = identifyOrderType(req);
        var tasks;
        if (orderType === 'Unhandled Order Type') {
            tasks = [handleUnhandledOrder];
            return writebackWorkflow(req, res, tasks);
        }
        var commonOrderTasks = getCommonOrderTasks(action, req.body);
        if (commonOrderTasks) {
            tasks = []
                .concat(validateOrders[orderType][action])
                .concat(commonOrderTasks)
                .concat(writeVprToJds);
        } else {
            tasks = [
                validateOrders[orderType][action],
                writeOrderToVista[orderType][action],
                writeVprToJds,
                writeToPjds
            ];
        }
        writebackWorkflow(req, res, tasks);
    };
}

/**
 * Invoke writebackWorkflow with common order tasks
 *
 * @param {string} order action
 * @returns {Function} writebackWorkflow
 */
function commonOrder(action) {
    return function(req, res) {
        var tasks;
        var commonOrderTasks = getCommonOrderTasks(action, req.body);
        if (commonOrderTasks) {
            tasks = []
                .concat(validateOrders['Common'][action])
                .concat(commonOrderTasks)
                .concat(writeVprToJds);
        } else {
            tasks = [handleInvalidAction];
        }
        writebackWorkflow(req, res, tasks);
    };
}

/**
 * Returns valid order type
 *
 * @returns {string} valid order type or invalid order type
 */
function identifyOrderType(req) {
    //var orderType = dd(req.body)('kind').val;
    var orderType = req.body.kind;
    /*
     Known order types:
     Allergy/Adverse Reaction
     Consult
     Dietetics Order
     Laboratory
     Medication, Infusion
     Medication, Inpatient
     Medication, Non-VA
     Medication, Outpatient
     Nursing Order
     Radiology
     ZZVITALS Order
     */
    req.logger.info({
        orderType: orderType
    });
    var handledOrderTypes = [
        'Medication, Outpatient',
        'Laboratory'
    ];
    if (_.include(handledOrderTypes, orderType)) {
        return orderType;
    }
    req.logger.info('Unhandled order type');
    return 'Unhandled Order Type';
}

function handleUnhandledOrder(vistaContext, callback) {
    return setImmediate(callback, 'Unhandled order type supplied');
}

function handleInvalidAction(vistaContext, callback) {
    return setImmediate(callback, 'Unhandled action requested');
}

var medOrder = {
    // VPR+ template model for med order
};

var labOrder = {
    // VPR+ template model for lab order
};

module.exports._identifyOrderType = identifyOrderType;
