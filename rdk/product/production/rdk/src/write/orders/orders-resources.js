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


module.exports.getResourceConfig = function() {
    return [{
        name: 'orders-create',
        path: '',
        post: withOrderType('create'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['add-lab-order'], // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: true
    }, {
        name: 'orders-update',
        path: '/:resourceId',
        put: withOrderType('update'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [], // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: true
    }, {
        name: 'orders-edit',
        path: '/:resourceId',
        get: commonOrder('edit'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [], // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: true
    }, {
        name: 'orders-detail',
        path: '/detail/:resourceId',
        get: commonOrder('detail'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [], // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: true
    }, {
        name: 'orders-sign-details',
        path: '/sign-details',
        post: commonOrder('signDetails'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [], // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: true
    }, {
        name: 'orders-discontinue-details',
        path: '/discontinue-details',
        post: commonOrder('discontinueDetails'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [], // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: true
    }, {
        name: 'orders-discontinue',
        path: '/discontinue',
        delete: withOrderType('discontinue'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['discontinue-lab-order'], // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: true
    }, {
        name: 'orders-sign',
        path: '/sign',
        post: commonOrder('signOrders'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['sign-lab-order'], // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: true
    }, {
        name: 'orders-save-draft',
        path: '/save-draft',
        post: commonOrder('saveDraftOrder'),
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['add-lab-order'], // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: true
    }, {
        name: 'orders-find-draft',
        path: '/find-draft',
        post: commonOrder('findDraftOrders'),
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
                writeVprToJds
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
