'use strict';

var workProduct = require('./cds-work-product');

var interceptors = {
    operationalDataCheck: false,
    synchronize: false
};

exports.getResourceConfig = function(app) {

    return [{
        name: 'cds-work-product-cds-work-product-create',
        path: '/product',
        post: workProduct.createWorkProduct,
        interceptors: interceptors,
        requiredPermissions: ['manage-cds-work-product'],
        isPatientCentric: false
    }, {
        name: 'cds-work-product-cds-work-product-retrieve',
        path: '/product',
        get: workProduct.retrieveWorkProduct,
        interceptors: interceptors,
        requiredPermissions: ['read-cds-work-product'],
        isPatientCentric: false
    }, {
        name: 'cds-work-product-cds-work-product-update',
        path: '/product',
        put: workProduct.updateWorkProduct,
        interceptors: interceptors,
        requiredPermissions: ['manage-cds-work-product'],
        isPatientCentric: false
    }, {
        name: 'cds-work-product-cds-work-product-delete',
        path: '/product',
        delete: workProduct.deleteWorkProduct,
        interceptors: interceptors,
        requiredPermissions: ['manage-cds-work-product'],
        isPatientCentric: false
    }, {
        name: 'cds-work-product-cds-work-product-subscription-retrieve',
        path: '/subscriptions',
        get: workProduct.retrieveSubscriptions,
        interceptors: interceptors,
        requiredPermissions: ['read-cds-work-product-subscription'],
        isPatientCentric: false
    }, {
        name: 'cds-work-product-cds-work-product-subscription-update',
        path: '/subscriptions',
        put: workProduct.updateSubscriptions,
        delete: workProduct.deleteSubscriptions,
        interceptors: interceptors,
        requiredPermissions: ['manage-cds-work-product-subscription'],
        isPatientCentric: false
    }, {
        name: 'cds-work-product-cds-work-product-subscription-delete',
        path: '/subscriptions',
        delete: workProduct.deleteSubscriptions,
        interceptors: interceptors,
        requiredPermissions: ['manage-cds-work-product-subscription'],
        isPatientCentric: false
    }, {
        name: 'cds-work-product-inbox',
        path: '/inbox',
        get: workProduct.retrieveInbox,
        interceptors: interceptors,
        requiredPermissions: ['read-cds-work-product-inbox'],
        isPatientCentric: false
    }];
};
