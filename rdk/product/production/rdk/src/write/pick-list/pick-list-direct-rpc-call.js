'use strict';

var _ = require('lodash');
var nullUtil = require('../core/null-utils');
var pickListUtil = require('./pick-list-utils');
var getDatabaseConfigFromRequest = require('../../resources/activitymanagement/activity-utils').getDatabaseConfigFromRequest;

var pickListRoot = './';


/**
 * These RPC's must be called directly rather than being loaded from an in-memory database as they will expect a
 * certain number of characters to be submitted before the call can even be made (usually a minimum of 3 characters).
 * In these cases, you will NOT be able to retrieve the entire set of data.
 * When it comes to these kinds of RPC calls, "It polls several sources and pulls the returns from all of them - literally many thousands."
 *
 * @param req The request object - we will be retrieving the param's from it.
 * @param site The site as retrieved from req.param('site') and converted to uppercase.
 * @param type The site as retrieved from req.param('type') and converted to lowercase.
 * @param callback The method that will send this data back to the person calling it.
 * @returns {boolean} True if this processed the call, false otherwise.
 */
module.exports.directRpcCall = function(req, site, type, callback) {
    var pickListConfig = pickListUtil.directConfig(req.app);
    module.exports.config = pickListConfig;

    var i = _.indexOf(_.pluck(pickListConfig, 'name'), type);
    if (i === -1) {
        return false; //We don't call this RPC directly
    }

    var params = {
        'pickList': type,
        'site': site
    };

    if (_.has(pickListConfig[i], 'requiredParams')) {
        var aborted = false;
        _.each(pickListConfig[i].requiredParams, function(paramName) {
            if (nullUtil.isNullish(req.param(paramName)) || _.isEmpty(req.param(paramName))) {
                callback('Parameter \'' + paramName + '\' cannot be null or empty');
                aborted = true;
                return false; //Break out of _.each
            }
            _.set(params, paramName, req.param(paramName).toUpperCase());
        });
        if (aborted) {
            return true; //The request was unsuccessful, but this was still the correct function to handle it.
        }
    }
    if (_.has(pickListConfig[i], 'optionalParams')) {
        _.each(pickListConfig[i].optionalParams, function(paramName) {
            if (!(nullUtil.isNullish(req.param(paramName)) || _.isEmpty(req.param(paramName)))) {
                _.set(params, paramName, req.param(paramName).toUpperCase());
            } else {
                _.set(params, paramName, null);
            }
        });
    }
    if (pickListConfig[i].isUserSpecific) {
        _.set(params, 'userId', req.session.user.uid);
    }
    if (pickListConfig[i].needsPcmm) {
        var dbConfig = getDatabaseConfigFromRequest(req);
        if (!dbConfig) {
            return callback('Activity/PCMM database was not found in the configuration');
        }
        _.set(params, 'pcmmDbConfig', dbConfig);
        _.set(params, 'ehmpDatabase', _.get(req, 'app.config.oracledb.ehmpDatabase'));
    }
    if (pickListConfig[i].needsFullConfig) {
        _.set(params, 'fullConfig', req.app.config);
    }

    var siteConfig = req.app.config.vistaSites[site];
    if (nullUtil.isNullish(siteConfig)) {
        return callback('The site (' + site + ') was not found in the configuration');
    }

    if (!pickListConfig[i].vistaContext) {
        return callback('The vistaContext was not found in the pick-list-config-in-memory-rpc-call.json configuration');
    }
    // work on a copy of site config to avoid mutating the original
    siteConfig = _.extend({}, siteConfig, {
        context: pickListConfig[i].vistaContext,
        vxSyncServer: req.app.config.vxSyncServer,
        generalPurposeJdsServer: req.app.config.generalPurposeJdsServer,
        site: site,
        rootPath: req.app.config.rootPath,
        // RDK configs have site division arrays. RPCs have a configuration property of the same name. Setting
        // to null otherwise the RPC calls will attempt to set division context to it (an Array) and fail.
        division: null
    });

    require(pickListRoot + pickListConfig[i].modulePath).fetch(req.logger, siteConfig, function(err, result, statusCode, headers) {
        callback(err, result, statusCode, headers);
    }, params);

    return true;
};
