'use strict';

exports.getResourceConfig = function() {
    return [{
        name: 'cds-advice-list',
        path: '/list',
        get: require('./get-cds-advice-list').getCDSAdviceList,
        //subsystems: ['cds'],
        requiredPermissions: ['read-clinical-reminder'],
        isPatientCentric: false
    }, {
        name: 'cds-advice-detail',
        path: '/detail',
        get: require('./get-cds-advice-detail').getCDSAdviceDetail,
        requiredPermissions: ['read-clinical-reminder'],
        isPatientCentric: false
    }, {
        name: 'cds-advice-read-status',
        path: '/read-status',
        put: require('./get-cds-advice-list').setReadStatus,
        requiredPermissions: [],
        isPatientCentric: false
    }];
};
