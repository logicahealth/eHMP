'use strict';

var _ = require('lodash');
var pool = require('../../utils/oracle-connection-pool');
var uidUtils = require('../../utils/uid-utils');
var rdk = require('../../core/rdk');
var RdkError = rdk.utils.RdkError;

var USER_INSERT = 'BEGIN EHMP.EHMP_ROUTING_API.INSERT_USER(:i_user_uid, :i_user_ien, :i_user_site, :i_active_flag, :i_event_type, :i_event_time, :output); END;';
var USER_DELETE = 'BEGIN EHMP.EHMP_ROUTING_API.DELETE_USER(:i_user_uid, :output); END;';

var configQueryParams = function(params) {
    var parts = uidUtils.extractPiecesFromUID(_.get(params, 'i_user_uid'));
    _.set(params, 'i_user_ien', parts.patient);
    _.set(params, 'i_user_site', parts.site);
    _.set(params, 'i_active_flag', 'Y');
    _.set(params, 'i_event_type', 'add');
    _.set(params, 'i_event_time', new Date());
    return params;
};

/**
 * A function to process the results of the attempt to save or delete a user to the Activity Management Active Users Oracle Store
 * @param {(Error|RdkError|null)} error
 * @param {Object|null} results
 * @param {Object} req - default express request object
 * @param {*} activityManagementParams - Parameters used during the processing of the (in)active user
 * @returns {undefined}
 */
var processActiveUsersResponse = function(error, results, req, activityManagementParams) {
    if (error) {
        return req.logger.error({error: error, activityManagementParams: activityManagementParams}, 'Error: Activity Management Active User update failure');
    }
    req.logger.debug({results: results, user: _.get(activityManagementParams, 'i_user_uid')}, 'Activity Management Active User updated');
};

var updateActivityManagementUser = function(req, params, callback){
    var dbConfig = _.get(req, 'app.config.oracledb.ehmpDatabase');
    var logger = req.logger;
    var query = USER_DELETE;
    var queryParams = _.get(params, 'queryParams');
    if (!_.isFunction(callback)) {
        callback = processActiveUsersResponse;
    }
    if (_.get(params, 'status') === 'active') {
        query = USER_INSERT;
        queryParams = configQueryParams(queryParams);
    }
    logger.trace({query: query, parameters: params}, 'activityManagementUsersUtility called with query and parameter assignments.');
    return pool.doExecuteProcWithInOutParams(req, dbConfig, query, queryParams, true, function(error, results) {
        if (error) {
            var rdkError = new RdkError({
                code: '205.500.1001',
                error: error,
                logger: logger
            });
            return callback(rdkError, null, req, params);
        }
        return callback(null, results, req, params);
    });
};

module.exports = updateActivityManagementUser;
module.exports._pool = pool;
