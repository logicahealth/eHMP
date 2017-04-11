'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var async = require('async');
var S = require('string');
var dd = require('drilldown');
var http = rdk.utils.http;
var nullchecker = require('../../utils/nullchecker');

function asuProcessor(params) {
    var jsonResult;

    jsonResult = {
        got: params
    };
}

function evaluate(jsonParams, config, httpConfig, res, logger, outerceptor) {
    // pass the JSON POST data as the parameter to the evaluate function
    httpConfig.body = jsonParams;
    httpConfig.logger = logger;

    logger.debug({jsonParams:jsonParams},'asuProcess.evaluate params');

    async.series([function (callback) {
            // call the java ASU rules service (an external POST call)
            http.post(httpConfig, function (err, response, data) {
                logger.debug({response:response}, 'asuProcess.evaluate results');
                if (err) {
                    logger.info(err);
                    return callback(err);
                }

                return callback(false, data);
            });
        }],
        function (err, results) {
            if (err) {
                logger.error(err, 'asuProcess.evaluate: ASU evaluate facade got an error');
            }
            if (_.isUndefined(outerceptor)) {
                return _evaluateFinished(err, results, res, logger);
            }
            logger.info({results:results},'asuProcess.evaluate: results');
            return outerceptor(err, results[0]);
        }); // end of series
}

function _evaluateFinished(err, results, res, logger) {
    if (err) {
        logger.info(err, 'asuProcess._evaluateFinished: Error getting response from ASU service');
        return res.status(500).rdkSend(err);
    }
    logger.debug({results:results},'asuProcess._evaluateFinished: ASU authorize Response');
    var authorizeResponse = {isAuthorized: results[0]};
    return res.json(authorizeResponse);
}

function getDefaultUserClass(req, callback) {
    req.audit.logCategory = 'RETRIEVE';

    var options = _.extend({}, req.app.config.jdsServer, {
        url: '/data/find/asu-class?filter=eq("name","USER")',
        logger: req.logger
    });
    return http.get(options, callback);
}


function extractRolesFromTextSearch(logger, documentDetails, userDetails) {
    var extractedRoles = [];

    _.each(dd(documentDetails)('data')('items').val, function (item) {
        var currentUserUid = 'urn:va:user:' + userDetails.site + ':' + userDetails.duz[userDetails.site];

        if (item.authorUid === currentUserUid) {
            extractedRoles.push('AUTHOR/DICTATOR');
        }
        if (item.signerUid === currentUserUid) {
            extractedRoles.push('SIGNER');
        }
        if (item.cosignerUid === currentUserUid) {
            extractedRoles.push('COSIGNER');
        }
        if (item.attendingUid === currentUserUid) {
            extractedRoles.push('ATTENDING PHYSICIAN');
        }
    });
    return extractedRoles;
}

//populate the parameters that needs to passed to the ASU java end point.
function populateEndPointInput(documentDetails, logger, userDetails) {

    var result = {};
    var extractedRoles = [];

    var possibleRoles = {
        'AUTHOR/DICTATOR': [
            'AUTHOR/DICTATOR',
            'Author (Dictator)',
            'AU'
        ],
        'ATTENDING PHYSICIAN': [
            'ATTENDING PHYSICIAN',
            'Attending Physician',
            'ATT'
        ],
        'TRANSCRIBER': [
            'TRANSCRIBER',
            'Transcriber',
            'TR'
        ],
        'EXPECTED COSIGNER': [
            'EXPECTED COSIGNER',
            'Expected Cosigner',
            'EC'
        ],
        'EXPECTED SIGNER': [
            'EXPECTED SIGNER',
            'Expected Signer',
            'ES'
        ],
        'SURROGATE': [
            'SURROGATE',
            'Surrogate',
            'SUR'
        ],
        'ADDITIONAL SIGNER': [
            'ADDITIONAL SIGNER',
            'Additional Signer',
            'X'
        ],
        'COMPLETER': [
            'COMPLETER',
            'Completer',
            'CP'
        ],
        'INTERPRETER': [
            'INTERPRETER',
            'Interpreter',
            'IN'
        ],
        'ENTERER': [
            'ENTERER',
            'Enterer',
            'E'
        ],
        'SIGNER': [
            'SIGNER',
            'Signer',
            'S'
        ],
        'COSIGNER': [
            'COSIGNER',
            'Cosigner',
            'C'
        ]
    };

    if (!_.isEmpty(dd(documentDetails)('data')('items').val)) {
        _.each(documentDetails.data.items[0].clinicians, function (item) {
            _.each(possibleRoles, function (value, key) {
                if (_.include(value, item.role)) {
                    var currentUserUid = 'urn:va:user:' + userDetails.site + ':' + userDetails.duz[userDetails.site];
                    if (item.uid === currentUserUid) {
                        extractedRoles.push(key);
                    }
                }
            });
        });
        if (_.isEmpty(extractedRoles)) {
            extractedRoles = extractRolesFromTextSearch(logger, documentDetails, userDetails);
        }
        extractedRoles = _.uniq(extractedRoles);
    }
    else {
         logger.debug({items:documentDetails.data.items},'ASU No roles found ');
    }
    result.userClassUids = _.pluck(userDetails.vistaUserClass, 'uid');

    if (!_.isEmpty(dd(documentDetails)('data')('items').val)) {
        result.docDefUid = documentDetails.data.items[0].documentDefUid;
        result.docStatus = documentDetails.data.items[0].status;
    }
    result.roleNames = extractedRoles;
    return result;
}

//This method is used to call the ASU java end point - asu/rules/accessDocument. This end point returns the permission of a single document
//for 'VIEW' action name.
function getAsuPermission(req, documentDetails, callback) {

    var result = {};
    var userDetails = req.session.user;

    var logger = req.logger;
    var httpConfig = _.extend({}, req.app.config.asuServer, {
        url: '/asu/rules/accessDocument',
        logger: req.logger,
        json: true
    });

    logger.debug({userDetails: userDetails},'asu-process.getAsuPermission user details');
    logger.debug({documentDetails: documentDetails},'asu-process.getAsuPermission document details');

    if (nullchecker.isNullish(documentDetails)) {
        return callback('No document to check ASU permissions for');
    }

    if (_.isUndefined(documentDetails.data) || nullchecker.isNullish(documentDetails.data.items)) {
       return callback('Cannot check ASU permissions on a document without data.items', documentDetails);
    }

    // If error getting document any way return
    if (!_.isEmpty(documentDetails.error)) {
        return callback('Cannot check ASU permissions on a document that has an error', documentDetails);
    }

    result = populateEndPointInput(documentDetails,logger, userDetails);
    logger.debug({endpointData:result},'asu-process.getAsuPermission endpoint data');

    // If No user class we default to USER class

    var configVistaSites = req.app.config.vistaSites;
    var sites = _.keys(configVistaSites);

    logger.debug('asuProcess.getAsuPermission: get user class for all sites from config');
    async.series({
        defaultUser: function(cb) {
            logger.debug({result: result},'asu-process.getAsuPermission result');

            getDefaultUserClass(req, function (error, response, body) {
                cb(error, body);
            });
        }
    }, function (error, response) {
        if (!_.isUndefined(error)) {
            logger.debug(error,'asu-process.getAsuPermission Got an error fetching default USER class from JDS');
            return callback(error, null);
        }


        logger.debug({response:response}, 'asuProcess.getAsuPermission: getDefaultUserClass response');

        var items = JSON.parse(response.defaultUser).data.items;
        if (_.isEmpty(items)) {
            logger.debug({'response.defaultUser': response.defaultUser},'asuProcess.getAsuPermission: Could NOT find default USER class in JDS');
            return callback(error, null);
        }
        if (_.isEmpty(userDetails.vistaUserClass)) {
            result.userClassUids = [];
        }
        _.each(items, function (item) {
            var add = false;
            if (S(item.uid).contains(req.session.user.site)) {
                add = true;
            } else {
                _.each(sites, function (site) {
                    if (S(item.uid).contains(site)) {
                        add = true;
                    }
                });
            }
            if (!_.contains(result.userClassUids, item.uid) && add) {
                result.userClassUids.push(item.uid);
            }
        });

        evaluate(result, req.app.config, httpConfig, null, logger, callback);
    });
}

//This method is used to call the ASU java end point - /asu/rules/getDocPermissions. This end point returns an array of permission of a single document
//for an array of passed action names.
function getAsuPermissionForActionNames(req, details, callback) {

    var result = {};
    var userDetails = details.userdetails;

    if (nullchecker.isNullish(userDetails)) {
        userDetails = req.session.user;
    }
    var logger = req.logger;

    logger.debug({details: details},'asu-process.getAsuPermissionForActionNames details');
    logger.debug({userDetails: userDetails},'asu-process.getAsuPermissionForActionNames userDetails');

    var httpConfig = _.extend({}, req.app.config.asuServer, {
        url: '/asu/rules/getDocPermissions',
        logger: req.logger,
        json: true
    });
    logger.debug({httpConfig:httpConfig}, 'asu-process.getAsuPermissionForActionNames httpConfig');

    if (_.isEmpty(dd(details)('data')('items').val)) {
        return callback('Document details cannot be empty.');
    }

    if (details.error) {
        return callback('Cannot check ASU permissions on a document that has an error', details);
    }

    result = populateEndPointInput(details,logger,userDetails);
    result.actionNames=details.actionNames;
    logger.debug({result:result},'asu-process.getAsuPermissionForActionNames. populateEndPointInput');

     // If No user class we default to USER class

    var configVistaSites = req.app.config.vistaSites;
    var sites = _.keys(configVistaSites);

    // If No user class we default to USER class
    logger.info('asuProcess.getAsuPermission: get user class for all sites from config');

    async.series({
        defaultUser: function (cb) {
            logger.debug({result:result},'asuProcess.getAsuPermissionForActionNames');
            getDefaultUserClass(req, function (error, response, body) {
                cb(error, body);
            });
        }
    }, function (error, response) {
        if (!_.isUndefined(error)) {
            logger.debug(error,'asuProcess.getAsuPermissionForActionNames: Got an error fetching default USER class from JDS');
            return callback(error, null);
        }
        logger.debug({response:response},'asuProcess.getAsuPermission: getDefaultUserClass response');

        var items = JSON.parse(response.defaultUser).data.items;

        if (_.isEmpty(items)) {
            logger.debug({'response.defaultUser':response.defaultUser},'asuProcess.getAsuPermissionForActionNames: Could NOT find default USER class in JDS');
            return callback(error, null);
        }

        if (_.isEmpty(userDetails.vistaUserClass)) {
            result.userClassUids = [];
        }
        _.each(items, function (item) {
            var add = false;
            if (S(item.uid).contains(userDetails.site)) {
                add = true;
            } else {
                _.each(sites, function (site) {
                    if (S(item.uid).contains(site)) {
                        add = true;
                    }
                });
            }
            if (!_.contains(result.userClassUids, item.uid) && add) {
                result.userClassUids.push(item.uid);
            }
        });

        evaluate(result, req.app.config, httpConfig, null, logger, callback);
    });
}

/**
 * This is a modified getAsuPermission and getAsuPermissionForActionNames that depends on the default user information
 * already being passed to it. This will result in less request being made to the asu when batches of document permissions
 * are being requested.  It can handle both cases: with and without action names.
 *
 * @Note: asu-utils.js -  applyAsuRules() and applyAsuRulesWithActionNames() have been modified to use this code.
 *
 * @param req
 * @param details
 * @param {Object} items - The parsed results of getDefaultUserClass
 * @param {Function} callback
 */
function getPermission(req, details, items, callback) {
    var result = {};
    var userDetails = details.userdetails;

    if (nullchecker.isNullish(userDetails)) {
        userDetails = req.session.user;
    }
    var logger = req.logger;

    logger.debug({details: details}, 'asu-process.getPermission details');
    logger.debug({userDetails: userDetails}, 'asu-process.getPermission userDetails');

    if (_.isEmpty(dd(details)('data')('items').val)) {
        return callback('Document details cannot be empty.');
    }

    if (details.error) {
        return callback('Cannot check ASU permissions on a document that has an error', details);
    }

    result = populateEndPointInput(details, logger, userDetails);
    if (details.hasOwnProperty('actionNames')) {
        result.actionNames = details.actionNames;
    }

    logger.debug({result: result}, 'asu-process.getPermission. populateEndPointInput');

    var configVistaSites = req.app.config.vistaSites;
    var sites = _.keys(configVistaSites);

    logger.info('asuProcess.getPermission: get user class for all sites from config');

    if (_.isEmpty(userDetails.vistaUserClass)) {
        result.userClassUids = [];
    }

    _.each(items, function (item) {
        var add = false;
        if (S(item.uid).contains(userDetails.site)) {
            add = true;
        } else {
            _.each(sites, function (site) {
                if (S(item.uid).contains(site)) {
                    add = true;
                }
            });
        }
        if (!_.contains(result.userClassUids, item.uid) && add) {
            result.userClassUids.push(item.uid);
        }
    });

    callback(null, result);
}


module.exports._evaluateFinished = _evaluateFinished;
module.exports.asuProcessor = asuProcessor;
module.exports.evaluate = evaluate;
module.exports.getAsuPermission = getAsuPermission;
module.exports.getAsuPermissionForActionNames = getAsuPermissionForActionNames;
module.exports.getPermission = getPermission;

module.exports.getDefaultUserClass = getDefaultUserClass;




