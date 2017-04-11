'use strict';
var util = require('util');
var _ = require('lodash');
var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var RdkError = rdk.utils.RdkError;
var auditUtil = require('../../utils/audit');
var formatPatientSearchCommonFields = require('./results-parser').formatPatientSearchCommonFields;
var getLoc = require('./search-mask-ssn').getLoc;
var patientSearchUtil = require('./patient-search-util');

module.exports = performPatientLast5Search;

/**
 * Retrieves patient information for a patients that
 * matches on a given string that equals the first letter
 * of a patient's last name concatenated with the last
 * four digits of their SSN.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
function performPatientLast5Search(req, res) {
    req.logger.debug('last5.performPatientSearch entering method');
    req.audit.logCategory = 'SEARCH';
    var last5 = req.param('last5');
    var start = req.param('start') || 0;
    var maxRows = req.query['rows.max'] || 100;
    var limit = req.param('limit') || req.param('itemsPerPage') || maxRows;
    var hasDGAccess = _.result(req, 'session.user.dgSensitiveAccess', 'false') === 'true';
    var site = patientSearchUtil.getSite(req.logger, 'last5.performPatientSearch', '', req);
    if (site === null) {
        var siteErr = new RdkError({
            code: 'rdk.400.1003',
            error: 'last5.performPatientSearch ERROR couldn\'t obtain site',
            logger: req.logger
        });
        return res.status(siteErr.status).rdkSend(siteErr);
    }

    var order = req.query.order;
    if (nullchecker.isNullish(last5)) {
        var last5Error = new RdkError({
            code: 'rdk.400.1005',
            logger: req.logger
        });
        return res.status(last5Error.status).rdkSend(last5Error);
    }
    if (!last5.match(/\w\d{4}/)) { // return 0 results on invalid format for tests and UI compatibility
        return res.rdkSend({
            'data': {
                'totalItems': 0,
                'currentItemCount': 0,
                'items': []
            }
        });
    }
    var searchOptions = {
        site: site,
        searchType: 'LAST5',
        searchString: last5,
        start: start,
        limit: limit,
        order: order
    };
    auditUtil.addAdditionalMessage(req, 'searchCriteriaLast5', util.format('last5=%s', last5));
    req.logger.debug('last5.performPatientSearch retrieving patient data for %s', last5);

    patientSearchUtil.callPatientSearch(req, 'last5.performPatientSearch', req.app.config.jdsServer, searchOptions, function(error, retvalue) {
        if (error) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(error);
        }
        patientSearchUtil.sort(req.logger, 'last5.performPatientSearch', order, retvalue);
        patientSearchUtil.limit(req.logger, 'last5.performPatientSearch', start, limit, retvalue);
        //Attempt to get the roomBed if exists since pt-select data does not have it
        getLoc(req, retvalue, function(error, result) {
            result = formatPatientSearchCommonFields(result, hasDGAccess);
            if (!_.isObject(result)) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(result);
            }
            req.logger.info('last5.performPatientSearch returning result');
            return res.status(rdk.httpstatus.ok).rdkSend(result);
        });
    });
}
