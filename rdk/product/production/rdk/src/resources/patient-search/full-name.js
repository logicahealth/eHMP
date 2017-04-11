'use strict';
var util = require('util');
var _ = require('lodash');
var formatPatientSearchCommonFields = require('./results-parser').formatPatientSearchCommonFields;
var getLoc = require('./search-mask-ssn').getLoc;
var rdk = require('../../core/rdk');
var RdkError = rdk.utils.RdkError;
var auditUtil = require('../../utils/audit');
var patientSearchUtil = require('./patient-search-util');
var NAME_SEARCH_STRING = 'NAME';

/**
 * Retrieves patient information for any patients that
 * match on a given full or partial name.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
function performPatientSearch(req, res) {
    req.logger.debug('full-name.performPatientSearch entering method');
    req.audit.logCategory = 'SEARCH';
    var fullName = req.param('name.full');
    var start = req.param('start') || req.param('startIndex') || 0;
    var maxRows = req.query['rows.max'] || 100;
    var limit = req.param('limit') || req.param('itemsPerPage') || maxRows;
    var order = req.query.order;
    var hasDGAccess = _.result(req, 'session.user.dgSensitiveAccess', 'false') === 'true';
    var site = patientSearchUtil.getSite(req.logger, 'full-name.performPatientSearch', '', req);
    if (site === null) {
        var siteErr = new RdkError({
            code: 'rdk.400.1003',
            error: 'full-name.performPatientSearch ERROR couldn\'t obtain site',
            logger: req.logger
        });
        return res.status(siteErr.status).rdkSend(siteErr);
    }

    if (!fullName) {
        var fullNameErr = new RdkError({
            code: 'rdk.400.1004',
            logger: req.logger
        });
        return res.status(fullNameErr.status).rdkSend(fullNameErr);
    }
    auditUtil.addAdditionalMessage(req, 'searchCriteriaFullName', util.format('fullName=%s', fullName));
    req.logger.debug('full-name.performPatientSearch retrieving patient data for %s', fullName);
    fullName = jdsNameWorkaround(fullName);

    var searchOptions = {
        site: site,
        searchType: NAME_SEARCH_STRING,
        searchString: fullName,
        start: start,
        limit: limit,
        order: order
    };
    patientSearchUtil.callPatientSearch(req, 'full-name.performPatientSearch', req.app.config.jdsServer, searchOptions, function(error, retvalue) {
        if (error) {
            req.logger.error(error, 'full-name.performPatientSearch');
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(error);
        }
        if (_.isEmpty(_.get(retvalue, 'data.items'))) {
            if (_.isObject(_.get(retvalue, 'data'))) {
                return res.status(200).rdkSend(_.extend({}, retvalue, {
                    message: 'No results found. Verify search criteria.'
                }));
            }
            return res.status(200).rdkSend(retvalue);
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
        patientSearchUtil.sort(req.logger, 'full-name.performPatientSearch', order, retvalue);
        patientSearchUtil.limit(req.logger, 'full-name.performPatientSearch', start, limit, retvalue);
        //Attempt to get the roomBed if exists since pt-select data does not have it
        getLoc(req, retvalue, function(error, result) {
            result = formatPatientSearchCommonFields(result, hasDGAccess);
            if (!_.isObject(result)) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(result);
            }
            req.logger.info('full-name.performPatientSearch returning result');
            if (_.isEmpty(_.get(result, 'data.items'))) {
                return res.status(200).rdkSend(_.extend({}, result, {
                    message: 'No results found. Verify search criteria.'
                }));
            }
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
    var result = fullName.trim();
    // DE274: JDS stores patient names without spaces between family and given name.
    // Get rid of spaces after commas to address this.
    result = result.replace(/(,) +/g, '$1');
    // DE1484: JDS search is performed with "name"* so "* characters can conflict to cause timeout errors.
    // Strip these specific trouble characters before performing search.
    result = result.replace(/["*]/g, '');
    return result;
}

module.exports = performPatientSearch;
module.exports._jdsNameWorkaround = jdsNameWorkaround;
