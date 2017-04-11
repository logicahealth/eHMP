'use strict';

var _ = require('lodash');
var RpcClient = require('vista-js').RpcClient;
var async = require('async');

function getSubsystemConfig(app, logger) {
    return {
        healthcheck: {
            name: 'vista-multidivision-subsystem',
            check: function(callback) {
                    return checkProxyAccount(app, logger, callback);
                }
                //interval value intentionally undefined - this healthcheck should only be called on-demand
        }
    };
}

function checkProxyAccount(app, logger, healthcheckCallback) {
    var vistaConfigs = _.cloneDeep(_.get(app, ['config', 'vistaSites']));
    var asyncVistaChecks = {};

    if (!_.isObject(vistaConfigs)) {
        //invalid rdk config
        logger.error('vista-multidivision-subsystem:checkProxyAccount - unable to parse config to check for multidivisional sites');
        return healthcheckCallback(false);
    }

    _.each(vistaConfigs, function(vistaConfig, vistaName) {
        var configDivisions = _.get(vistaConfig, 'division', []);
        //check if site is multidivisional
        // it is multidivisional -> query that site for which divisions our proxy user has access to
        // not multivisional -> ignore site
        if (_.isArray(configDivisions) && _.size(configDivisions) > 1) {
            logger.debug({
                vistaName: vistaName
            }, 'vista-multidivision-subsystem:checkProxyAccount - configured multidivisional site found');

            //remove division information from configuration
            // else vistaJS will try to log into a specific division - we want the default
            vistaConfig.division = null;

            //XUS DIVISION GET RPC does not exist in HMP contexts - use SIGNON context
            vistaConfig.context = 'XUS SIGNON';

            //log into site and retrieve list of configured divisions for proxy user
            asyncVistaChecks[vistaName] = function(asyncCallback) {
                RpcClient.callRpc(logger, vistaConfig, 'XUS DIVISION GET', function(err, divisionResult) {
                    var siteIsHealthy = true;
                    if (err) {
                        siteIsHealthy = false;
                        logger.error({
                            vistaName: vistaName,
                            err: err
                        }, 'vista-multidivision-subsystem:checkProxyAccount - error retreiving proxy user divisions for site');
                    } else {
                        //Borrowed from RpcClient.divisionCommand
                        if (divisionResult === '0\r\n') {
                            // This follows the pattern CPRS/RPC Broker Client has.
                            // This is the case that the user doesn't have any configured divisions and the kernel default is used.
                            logger.error({
                                vistaName: vistaName
                            }, 'vista-multidivision-subsystem:checkProxyAccount - proxy user to multidivisional site had no access to configured divisions');
                            siteIsHealthy = false;
                        } else {
                            var vistaDivisions = parseVistaDivisionResults(divisionResult);

                            siteIsHealthy = compareDivisionValues(configDivisions, vistaDivisions, vistaName, logger);
                        }
                    }
                    return asyncCallback(null, siteIsHealthy);
                });
            };
        }
    });

    //only call up to 5 vista instance checks in parallel
    async.parallelLimit(asyncVistaChecks, 5, function(err, asyncVistaResults) {
        if (err) {
            return healthcheckCallback(false);
        } else {
            return healthcheckCallback(_.every(asyncVistaResults, Boolean));
        }
    });
}

function parseVistaDivisionResults(divisionResult) {
    // Delete the first and last array element to remove the count and rpc broker footer
    // and only get division responses
    var rawVistaDivisions = divisionResult.split('\r\n');
    rawVistaDivisions.splice(0, 1);
    rawVistaDivisions.splice(divisionResult.length - 1, 1);

    var vistaDivisions = [];
    _.each(rawVistaDivisions, function(rawDivision) {
        var pieces = rawDivision.split('^');
        if (pieces.length > 2) {
            vistaDivisions.push(String(pieces[2]));
        }
    });

    return vistaDivisions;
}

function compareDivisionValues(configDivisions, vistaDivisions, vistaName, logger) {
    var siteIsHealthy = true;

    //loop through comparing vista-configured divisions vs. those in config
    // in config but not in vista -> error
    // in vista but not in config -> ignore
    // in both -> good, continue on
    _.each(configDivisions, function(configDivision) {
        var configDivisionId = _.get(configDivision, 'id');
        //if malformed config value, ignore
        if (configDivisionId) {
            if (siteIsHealthy) {
                siteIsHealthy = _.some(vistaDivisions, function(vistaDivision) {
                    return vistaDivision === configDivisionId;
                });
            }
        }
        if (!siteIsHealthy) {
            logger.error({
                vistaName: vistaName,
                configDivisionId: configDivisionId
            }, 'vista-multidivision-subsystem:compareDivisionValues - proxy user to multidivisional site did not have access to configured division');
            //short circuit _each if not healthy
            return false;
        }
    });

    return siteIsHealthy;
}

module.exports.getSubsystemConfig = getSubsystemConfig;
module.exports._parseVistaDivisionResults = parseVistaDivisionResults;
module.exports._compareDivisionValues = compareDivisionValues;
