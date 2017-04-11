'use strict';

var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;
var util = require('util');
var querystring = require('querystring');
var _ = require('lodash');
var jdsFilter = require('jds-filter');
var mask = require('./search-mask-ssn');
var maskPtSelectSsn = mask.maskPtSelectSsn;
var getLoc = mask.getLoc;
var auditUtil = require('../../utils/audit');
var async = require('async');
var patientSearchResource = require('./patient-search-resource');

module.exports = performPatientSearch;

function performPatientSearch(req, res) {
    req.logger.debug('full-name.performPatientSearch entering method');
    var fullName = req.param('name.full');
    var start = req.param('start') || req.param('startIndex') || 0;
    var limit = req.param('limit') || req.param('itemsPerPage');
    var order = req.query.order;
    var maxRows = req.query['rows.max'];

    var site = patientSearchResource.getSite(req.logger, 'full-name.performPatientSearch', '', req);
    if (site === null) {
        req.logger.error('full-name.performPatientSearch ERROR couldn\'t obtain site');
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing site information from session or request');
    }

    req.audit.logCategory = 'SEARCH';
    auditUtil.addAdditionalMessage(req, 'searchCriteriaFullName', util.format('fullName=%s', fullName));

    if (!fullName) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing name.full parameter');
    }
    req.logger.debug('full-name.performPatientSearch retrieving patient data for ' + fullName);

    fullName = jdsNameWorkaround(fullName);

    req.logger.debug('full-name.performPatientSearch fullName: ' + fullName);
    req.logger.debug('full-name.performPatientSearch start: ' + start);
    req.logger.debug('full-name.performPatientSearch limit: ' + limit);
    req.logger.debug('full-name.performPatientSearch order: ' + order);
    req.logger.debug('full-name.performPatientSearch maxRows: ' + maxRows);

    async.waterfall(
        [
            function (callback) {
                patientSearchResource.callVxSyncPatientSearch(req.logger, 'full-name.performPatientSearch', req.app.config.vxSyncServer, req.app.config.jdsServer, site, 'NAME', fullName, function(error, retvalue) {
                    if (error) {
                        return callback(error);
                    }

                    if (retvalue.data.currentItemCount > maxRows) {
                        req.logger.info('full-name.performPatientSearch search retvalue.data.currentItemCount ([%s]) > maxRows ([%s])', retvalue.data.currentItemCount, maxRows);
                        return res.status(rdk.httpstatus.not_acceptable).rdkSend('Item count exceeds max rows.');
                    }

                    //req.logger.debug('rdk.full-name Before sort: ' + JSON.stringify(retvalue, null, 2));
                    patientSearchResource.sort(req.logger, 'full-name.performPatientSearch', order, retvalue);
                    //req.logger.debug('rdk.full-name After sort: ' + JSON.stringify(retvalue, null, 2));

                    //req.logger.debug('rdk.full-name Before limit: ' + JSON.stringify(retvalue, null, 2));
                    patientSearchResource.limit(req.logger, 'full-name.performPatientSearch', start, limit, retvalue);
                    //req.logger.debug('rdk.full-name After limit: ' + JSON.stringify(retvalue, null, 2));

                    callback(null, retvalue);
                });
            },
            getLoc.bind(null, req)
        ],
        function(err, result) {
            if (err) {
                req.logger.error({error: err}, 'full-name error');
                if (err instanceof Error) {
                    return res.status(rdk.httpstatus.internal_server_error).rdkSend('Unable to search for patient');
                }
                return res.status(err.status || rdk.httpstatus.internal_server_error).rdkSend('Unable to search for patient');
            }
            result = maskPtSelectSsn(result);

            if (!_.isObject(result)) {
                req.logger.error({result: result}, 'full-name non-object result');
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(result);
            }
            req.logger.debug('full-name.performPatientSearch returning result');
            return res.status(rdk.httpstatus.ok).rdkSend(result);
        }
    );
}



function jdsNameWorkaround(fullName) {
    // DE274: JDS stores patient names without spaces between family and given name.
    // Get rid of spaces after commas to address this.
    var result = fullName.replace(/(,) +/g, '$1');
    // DE1484: JDS search is performed with "name"* so "* characters can conflict to cause timeout errors.
    // Strip these specific trouble characters before performing search.
    result = result.replace(/["*]/g, '');
    return result;
}
