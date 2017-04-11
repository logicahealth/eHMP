'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var querystring = require('querystring');
var jdsFilter = require('jds-filter');
var nullchecker = rdk.utils.nullchecker;
var httpUtil = rdk.utils.http;
var mask = require('./search-mask-ssn');
var maskPtSelectSsn = mask.maskPtSelectSsn;
var getLoc = mask.getLoc;
var async = require('async');
var patientSearchResource = require('./patient-search-resource');

module.exports = performPatientLast5Search;

// http://localhost:8888/patient-search/last5/B0008
function performPatientLast5Search(req, res) {
    req.logger.debug('last5.performPatientSearch entering method');
    req.audit.logCategory = 'RETRIEVE';

    var last5 = req.param('last5');
    var start = req.param('start') || 0;
    var limit = req.param('limit');

    var site = patientSearchResource.getSite(req.logger, 'last5.performPatientSearch', '', req);
    if (site === null) {
        req.logger.error('last5.performPatientSearch ERROR couldn\'t obtain site');
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing site information from session or request');
    }

    var order = req.query.order;

    if(nullchecker.isNullish(last5)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing last5 parameter');
    }
    if (!last5.match(/\w\d{4}/)) {  // return 0 results on invalid format for tests and UI compatibility
        return res.rdkSend({
            'data': {
                'totalItems': 0,
                'currentItemCount': 0,
                'items': []
            }
        });
    }
    req.logger.debug('last5.performPatientSearch retrieving patient data for ' + last5);

    async.waterfall(
        [
            function(callback) {
                patientSearchResource.callVxSyncPatientSearch(req.logger, 'last5.performPatientSearch', req.app.config.vxSyncServer, req.app.config.jdsServer, site, 'LAST5', last5, function(error, retvalue) {
                    if (error) {
                        return callback(error);
                    }

                    //req.logger.debug('rdk.last5 Before sort: ' + JSON.stringify(retvalue, null, 2));
                    patientSearchResource.sort(req.logger, 'last5.performPatientSearch', order, retvalue);
                    //req.logger.debug('rdk.last5 After sort: ' + JSON.stringify(retvalue, null, 2));

                    //req.logger.debug('rdk.last5 Before limit: ' + JSON.stringify(retvalue, null, 2));
                    patientSearchResource.limit(req.logger, 'last5.performPatientSearch', start, limit, retvalue);
                    //req.logger.debug('rdk.last5 After limit: ' + JSON.stringify(retvalue, null, 2));

                    callback(null, retvalue);
                });
            },
            getLoc.bind(null, req)
        ],
        function(err, result) {
            result = maskPtSelectSsn(result);
            if (err) {
                if (err instanceof Error) {
                    return res.status(rdk.httpstatus.internal_server_error).rdkSend(err.message);
                } else {
                    return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
                }
            }

            if (!_.isObject(result)) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(result);
            }
            req.logger.debug('last5.performPatientSearch returning result');
            return res.status(rdk.httpstatus.ok).rdkSend(result);
        }
    );
}
