'use strict';
var rdk = require('../../core/rdk');
var util = require('util');
var _ = require('lodash');
var formatPatientSearchCommonFields = require('./results-parser').formatPatientSearchCommonFields;
var mask = require('./search-mask-ssn');
var getLoc = mask.getLoc;
var auditUtil = require('../../utils/audit');
var patientSearchResource = require('./patient-search-resource');

module.exports = performPatientSearch;

/**
 * Retrieves patient information for any patients that
 * match on a given full or partial name.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
function performPatientSearch(req, res) {
    req.logger.debug('full-name.performPatientSearch entering method');
    var fullName = req.param('name.full');
    var start = req.param('start') || req.param('startIndex') || 0;
    var maxRows = req.query['rows.max'] || 100;
    var limit = req.param('limit') || req.param('itemsPerPage') || maxRows;
    var order = req.query.order;
    var hasDGAccess = _.result(req, 'session.user.dgSensitiveAccess', 'false') === 'true';
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
    req.logger.debug('full-name.performPatientSearch retrieving patient data for %s', fullName);
    fullName = jdsNameWorkaround(fullName);

    var searchOptions = {
        site: site,
        searchType: 'NAME',
        searchString: fullName,
        start: start,
        limit: limit,
        order: order
    };
    patientSearchResource.callPatientSearch(req, 'full-name.performPatientSearch', req.app.config.jdsServer, searchOptions, function(error, retvalue) {
        if (error) {
            req.logger.error(error, 'full-name.performPatientSearch');
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(error);
        }
        if (retvalue.data.totalItems > maxRows) {
            var resultObj = {};
            var totalRowsFound = retvalue.data.currentItemCount;
            resultObj.data = {
                items: [{
                    totalRowsFound: totalRowsFound,
                    maxRowsAllowed: maxRows
                }]
            };
            req.logger.info('full-name.performPatientSearch search retvalue.data.totalItems ([%s]) > maxRows ([%s])', retvalue.data.totalItems, maxRows);
            return res.status(rdk.httpstatus.not_acceptable).rdkSend(resultObj);
        }
        patientSearchResource.sort(req.logger, 'full-name.performPatientSearch', order, retvalue);
        patientSearchResource.limit(req.logger, 'full-name.performPatientSearch', start, limit, retvalue);
        //Attempt to get the roomBed if exists since pt-select data does not have it
        getLoc(req, retvalue, function(error, result) {
            result = formatPatientSearchCommonFields(result, hasDGAccess);
            if (!_.isObject(result)) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(result);
            }
            req.logger.info('full-name.performPatientSearch returning result');
            return res.status(rdk.httpstatus.ok).rdkSend(result);
        });
    });
}

/**
 * Transforms a name into a format that is valid for JDS searches.
 *
 * @param {string} fullName - The name to format.
 * @return {string} result - The name in a JDS searchable format.
 */
function jdsNameWorkaround(fullName) {
    // DE274: JDS stores patient names without spaces between family and given name.
    // Get rid of spaces after commas to address this.
    var result = fullName.replace(/(,) +/g, '$1');
    // DE1484: JDS search is performed with "name"* so "* characters can conflict to cause timeout errors.
    // Strip these specific trouble characters before performing search.
    result = result.replace(/["*]/g, '');
    return result;
}
