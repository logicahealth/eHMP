'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var pidValidator = rdk.utils.pidValidator;

function getResourceConfig(app) {
    var config = [
        patientLoad(app),
        patientDemographicsLoad(app),
        patientClear(app),
        patientStatus(app),
        patientDataStatus(app),
        patientSyncStatusDetail(app),
        operationalStatus(app)
    ];
    config.healthcheck = {
        dependencies: ['patientrecord','authorization']
    };
    return config;
}

var patientLoad = function(app) {
    return {
        name: 'synchronization-load',
        path: '/load',
        interceptors: {
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        //healthcheck: [app.subsystems.jdsSync],
        get: patientLoadEndpoint.bind(null, app),
        subsystems: ['patientrecord','jdsSync']
    };
};

var patientDemographicsLoad = function(app) {
    return {
        name: 'synchronization-demographics-load',
        path: '/demographics-load',
        interceptors: {
            synchronize: false,
            validatePid: false  // because the pid validator demands a `DOD;` prefix edipi's
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        post: patientDemographicsLoadEndpoint.bind(null, app),
        subsystems: ['patientrecord', 'jdsSync']
    };
};

var patientClear = function(app) {
    return {
        name: 'synchronization-clear',
        path: '/clear',
        interceptors: {
            synchronize: false
        },
        requiredPermissions: ['clear-patient-sync'],
        isPatientCentric: false,
        get: patientClearEndpoint.bind(null, app),
        subsystems: ['patientrecord','jdsSync']
    };
};

var patientStatus = function(app) {
    return {
        name: 'synchronization-status',
        path: '/status',
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        get: patientStatusEndpoint.bind(null, app),
        subsystems: ['patientrecord','jdsSync']
    };
};

var patientDataStatus = function(app) {
    return {
        name: 'synchronization-datastatus',
        path: '/data-status',
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        get: patientDataStatusEndpoint.bind(null, app),
        subsystems: ['patientrecord','jdsSync']
    };
};

var patientSyncStatusDetail = function(app) {
    return {
        name: 'synchronization-syncStatusDetail',
        path: '/status-detail',
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        get: patientSyncStatusDetailEndpoint.bind(null, app),
        subsystems: ['patientrecord','jdsSync']
    };
};

var operationalStatus = function(app) {
    return {
        name: 'synchronization-operationalstatus',
        path: '/operational-status',
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        get: operationalStatusEndpoint.bind(null, app),
        subsystems: ['patientrecord','jdsSync']
    };
};

function patientLoadEndpoint(app, req, res) {
    var pid = req.param('pid') || req.param('dfn') || '';
    var prioritySite = req.param('prioritySite');
    var forcedSite = req.param('forcedSite');
    var immediate = (req.param('immediate') === 'true');
    if (!immediate) {
        // make sure the response doesn't time out before we're done waiting for sync
        var timeout = Number(req.app.config.jdsSync.settings.timeoutMillis || 30000) + 3000;
        req.logger.debug({timeout: timeout}, 'Overriding response timeout to account for patient sync');
        res.setTimeout(timeout);
    }
    if (forcedSite) {
        app.subsystems.jdsSync.loadPatientForced(pid, forcedSite, immediate, req, toResponseCallback.bind(null, res));
    } else if (prioritySite) {
        app.subsystems.jdsSync.loadPatientPrioritized(pid, prioritySite, req, toResponseCallback.bind(null, res));
    } else {
        app.subsystems.jdsSync.loadPatient(pid, immediate, req, toResponseCallback.bind(null, res));
    }
}

function patientDemographicsLoadEndpoint(app, req, res) {
    if (_.isUndefined(req.param('demographics'))){
        return toResponseCallback(res, 500,{status:500, data:{error:{code:500, message:'Demographics are required'}}} );
    }
    if (pidValidator.isPidEdipi(req.body.edipi|| req.body.pid ||'')){
        return toResponseCallback(res, 500, {status:500, data:{error:{code:500, message:'A dod pid is invalid, please use an edipi or icn.'}}});
    }
    app.subsystems.jdsSync.syncPatientDemographics(req.body, req, toResponseCallback.bind(null, res));
}

function patientClearEndpoint(app, req, res) {
    var pid = req.param('pid') || req.param('dfn') || '';
    app.subsystems.jdsSync.clearPatient(pid, req, toResponseCallback.bind(null, res));
}

function patientStatusEndpoint(app, req, res) {
    var pid = req.param('pid') || req.param('dfn') || '';
    app.subsystems.jdsSync.getPatientStatus(pid, req, toResponseCallback.bind(null, res));
}

function patientDataStatusEndpoint(app, req, res) {
    var pid = req.param('pid') || req.param('dfn') || '';
    app.subsystems.jdsSync.getPatientDataStatusSimple(pid, req, toResponseCallback.bind(null, res));
}

function patientSyncStatusDetailEndpoint(app, req, res) {
    var pid = req.param('pid') || req.param('dfn') || '';
    app.subsystems.jdsSync.getPatientStatusDetail(pid, req, toResponseCallback.bind(null, res));
}

function operationalStatusEndpoint(app, req, res) {
    app.subsystems.jdsSync.getOperationalStatus(null, req, toResponseCallback.bind(null, res));
}

function toResponseCallback(res, error, result) {
    var status, response;
    if (!_.isUndefined(result) && !_.isUndefined(result.data) && !_.isUndefined(result.status)) {
        status = result.status;
        response = result.data;
    } else {
        status = _.isNumber(error) ? error : 500;
        if (result) {
            response = result;
        } else if (_.isString(error) || _.isObject(error)) {
            response = error;
        } else {
            response = {
                error: {
                    code: status,
                    message: 'There was an error processing your request. The error has been logged.'
                }
            };
        }
    }
    res.status(status).rdkSend(response);
}

module.exports.getResourceConfig = getResourceConfig;
module.exports._patientLoadEndpoint = patientLoadEndpoint;
module.exports._patientClearEndpoint = patientClearEndpoint;
module.exports._patientStatusEndpoint = patientStatusEndpoint;
module.exports._patientDataStatusEndpoint = patientDataStatusEndpoint;
module.exports._patientSyncStatusDetailEndpoint = patientSyncStatusDetailEndpoint;
module.exports._patientDemographicsLoadEndpoint = patientDemographicsLoadEndpoint;
module.exports._operationalStatusEndpoint = operationalStatusEndpoint;
module.exports._toResponseCallback = toResponseCallback;
