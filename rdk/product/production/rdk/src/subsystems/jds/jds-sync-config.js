/*jslint node: true */
'use strict';

var _ = require('lodash');
var S = require('string');
var nullchecker = require('../../utils/nullchecker');

module.exports.configureWithPidParam = configureWithPidParam;
module.exports.configureWithPidInPath = configureWithPidInPath;
module.exports.configure = configure;
module.exports.getSyncConfig = getSyncConfig;
module.exports.setupAudit = setupAudit;
module.exports.addForcedParam = addForcedParam;
module.exports.addSiteToPath = addSiteToPath;
module.exports.addPidParam = addPidParam;
module.exports.addParam = addParam;
module.exports.addPidToPath = addPidToPath;
module.exports.replacePidInPath = replacePidInPath;

var httpConfig = {
    loadPatient: {
        url: '/sync/load',
        server: 'vxSyncServer',
        json: true
    },
    clearPatient: {
        url: '/sync/clearPatient',
        server: 'vxSyncServer',
        json: true
    },
    getPatientStatus: {
        url: '/sync/status',
        server: 'vxSyncServer',
        json: true
    },
    getPatientStatusDetail: {
        url: '/status',
        server: 'jdsServer',
        json: true
    },
    syncPatientDemographics: {
        url: '/sync/demographicSync',
        server: 'vxSyncServer'
    },
    getOperationalStatus: {
        url: '/statusod/',
        server: 'jdsServer',
        json: true
    },
    getPatientByPidAllSites: {
        url: '/vpr/mpid',
        server: 'jdsServer',
        json: true
    },
    getJdsStatus: {
        url: '/vpr/:pid/count/collection',
        server: 'jdsServer',
        json: true
    }
};

function configureWithPidParam(configName, pid, req) {
    var config = configure(configName, pid, req);
    addPidParam(config, req, pid);
    return config;
}

function configureWithPidInPath(configName, pid, req) {
    var config = configure(configName, pid, req);
    addPidToPath(config, req, pid);
    return config;
}

function configure(configName, pid, req) {
    setupAudit(pid, req);
    return getSyncConfig(configName, req);
}

function getSyncConfig(configName, req) {
    var config = _.clone(httpConfig[configName]);
    config.logger = req.logger;
    config.timeout = req.app.config.jdsSync.settings.timeoutMillis;

    var serverConfig = req.app.config[config.server];
    config.baseUrl = serverConfig.baseUrl;
    delete config.server;

    return config;
}

function setupAudit(pid, req) {
    req.audit.logCategory = 'SYNC';
    if (pid) {
        req.audit.patientId = pid;
    }
}

function addForcedParam(config, req, forcedSite) {
    forcedSite = forcedSite || req.param('forcedSite') || '';
    if (_.isString(forcedSite)) {
        req.logger.debug(forcedSite);
        if (forcedSite === 'true') {
            config.url += '&forcedSync=true';
        } else {
            config.url += '&forcedSync=' + JSON.stringify(forcedSite.split(','));
        }
    }
}

function addSiteToPath(config, req, site) {
    var configPath = config.url;
    if (configPath.indexOf('/', configPath.length-1) !== -1) {
        if (nullchecker.isNullish(site)) {
            if (req.site) {
                req.logger.debug('adding site information');
                site = req.site;
            }
        }
        config.url = configPath + site;
    }
}

function addPidParam(config, req, pid) {
    if (nullchecker.isNullish(pid)) {
        pid = req.param('pid');
    }
    if (nullchecker.isNotNullish(pid)) {
        var param = S(pid).contains(';') ? 'pid' : 'icn';
        addParam(param, pid, config);
    }
}

function addParam(name, value, config) {
    if (config.url.indexOf('?', config.url.length-1) === -1) {
        config.url += '?';
    } else if (config.url.indexOf('&', config.url.length-1) === -1) {
        config.url += '&';
    }
    config.url += name + '=' + value;
}

function addPidToPath(config, req, pid) {
    if (nullchecker.isNotNullish(pid)) {
        if (!S(config.url).endsWith('/') && !S(config.url).endsWith(':') && !S(config.url).endsWith('=')) {
            config.url += '/';
        }
        config.url = config.url + pid;
    }
}

function replacePidInPath(config, req, pid) {
    config.url = config.url.replace(':pid', pid, 'gi');
}
