'use strict';

var interceptors = {
    operationalDataCheck: false,
    synchronize: false
};

exports.getResourceConfig = function(app) {

    return [{
        name: 'cds-work-product-cds-work-product-create',
        path: '/product',
        post: require('./cds-work-product').createWorkProduct,
        interceptors: interceptors,
        requiredPermissions: ['manage-cds-work-product'],
        isPatientCentric: false
    }, {
        name: 'cds-work-product-cds-work-product-retrieve',
        path: '/product',
        get: require('./cds-work-product').retrieveWorkProduct,
        interceptors: interceptors,
        requiredPermissions: ['read-cds-work-product'],
        isPatientCentric: false
    }, {
        name: 'cds-work-product-cds-work-product-update',
        path: '/product',
        put: require('./cds-work-product').updateWorkProduct,
        interceptors: interceptors,
        requiredPermissions: ['manage-cds-work-product'],
        isPatientCentric: false
    }, {
        name: 'cds-work-product-cds-work-product-delete',
        path: '/product',
        delete: require('./cds-work-product').deleteWorkProduct,
        interceptors: interceptors,
        requiredPermissions: ['manage-cds-work-product'],
        isPatientCentric: false
    }, {
        name: 'cds-work-product-cds-work-product-subscription-retrieve',
        path: '/subscriptions',
        get: require('./cds-work-product').retrieveSubscriptions,
        interceptors: interceptors,
        requiredPermissions: ['read-cds-work-product-subscription'],
        isPatientCentric: false
    }, {
        name: 'cds-work-product-cds-work-product-subscription-update',
        path: '/subscriptions',
        put: require('./cds-work-product').updateSubscriptions,
        delete: require('./cds-work-product').deleteSubscriptions,
        interceptors: interceptors,
        requiredPermissions: ['manage-cds-work-product-subscription'],
        isPatientCentric: false
    }, {
        name: 'cds-work-product-cds-work-product-subscription-delete',
        path: '/subscriptions',
        delete: require('./cds-work-product').deleteSubscriptions,
        interceptors: interceptors,
        requiredPermissions: ['manage-cds-work-product-subscription'],
        isPatientCentric: false
    }, {
        name: 'cds-work-product-inbox',
        path: '/inbox',
        get: require('./cds-work-product').retrieveInbox,
        interceptors: interceptors,
        requiredPermissions: ['read-cds-work-product-inbox'],
        isPatientCentric: false
    }];
};
