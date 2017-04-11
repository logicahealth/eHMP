'use strict';

var rdk = require('../core/rdk');
var httpUtil = rdk.utils.http;
var _ = require('lodash');
var patientSearchResource = require('./patient-search/patient-search-resource');

function getResourceConfig() {
    return [{
        name: 'vergencevaultproxy-geticnforccow',
        path: '/getICNForCCOW',
        post: getICNForCCOW,
        permitResponseFormat: true,
        interceptors: {
            authentication: false,
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false
    }, {
        name: 'vergencevaultproxy-getSiteInfo',
        path: '/getSiteInfo',
        get: getSiteInfo,
        permitResponseFormat: true,
        interceptors: {
            authentication: false,
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        isPatientCentric: false
    }];
}

function getSiteInfo(req, res) {
    var vistaSiteCollection = req.app.config.vistaSites;
    var site = req.param('site');
    if (_.isUndefined(site)) {
        return res.status(rdk.httpstatus.bad_request).json({
            msg: 'Site Id is missing'
        });
    }
    res.status(rdk.httpstatus.ok).json({
        'Site': vistaSiteCollection[site] || 'Not Found'
    });
}

function getICNForCCOW(req, res, next) {
    if (!req.body.site || !req.body.dfn) {
        return res.status(400).json({
            msg: 'Invalid body; must include site and dfn in JSON format'
        });
    }
    var props = {
        site: req.body.site,
        pid: req.body.dfn
    };
    ensureICNforSelectedPatient(req, props, function(error, pid) {
        if (error) {
            res.status(500).rdkSend(error);
        } else {
            res.json(props);
        }
    });
}

function ensureICNforSelectedPatient(req, props, callback) {
    props.pid = props.site + ';' + props.pid;
    var searchOptions = {
        site: props.site,
        searchType: 'PID',
        searchString: props.pid
    };
    patientSearchResource.callPatientSearch(req, 'vergence-vault-proxy', req.app.config.jdsServer, searchOptions, function(error, result) {
        if (error) {
            return callback(error);
        }

        req.logger.debug('ICN RESULT', result);
        if (result && result.data && result.data.items) {
            var icn = result.data.items[0] && result.data.items[0].icn;

            if (icn) {
                props.pid = icn;
            }
        }

        req.logger.debug('PID', props.pid);
        callback(null, props.pid);
    });
}

module.exports.getResourceConfig = getResourceConfig;