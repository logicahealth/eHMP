'use strict';

var rdk = require('../../core/rdk');
var http = rdk.utils.http;
var nullchecker = rdk.utils.nullchecker;
var uidUtils = require ('../../utils/uid-utils');
var RpcClient = require('vista-js').RpcClient;
var _ = require('lodash');
var moment = require('moment');
var async = require('async');

module.exports._vixServerConfigured = false;

/**
 * This verifies the config is properly set and sets the global vixServerConfigured
 * to true if it is.
 * @param  {Object} app    Express app passed in as part of the setup from app-factory
 * @param  {Object} logger Bunyan logger passed in as part of the setup from app-factory
 * @return {null}
 */
module.exports._init = function(app, logger) {
    logger.debug('Starting VIX Configurations Verification');

    var vixConfigBaseUrlSet = !_.isEmpty(_.get(app, 'config.vix.baseUrl'));
    this._vixServerConfigured = vixConfigBaseUrlSet;
};

/**
 * Initial subsystem function called by app-factory during RDK init.
 * @param  {Object} app    Express app passed in as part of the setup from app-factory
 * @param  {Object} logger Bunyan logger passed in as part of the setup from app-factory
 * @return {Object}        healthcheck object with check function
 */
module.exports.getSubsystemConfig = function(app, logger) {
    this._init(app, logger);
    return {
        healthcheck: {
            name: 'vix',
            interval: 100000,
            check: function(callback) {
                var httpConfig = _.extend({}, app.config.vix, {
                    logger: logger,
                    url: '/ping'
                });

                http.get(httpConfig, function(err) {
                    if (err) {
                        return callback(false);
                    }
                    return callback(true);
                });
            }
        }
    };
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 *                                       Queries
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/**
 * Adds images to document records passed in from JDS
 * @param {Object}   req         Typical default Express request object
 * @param {Object}   jdsResponse JDS Object containing the records to add images to
 * @param {Function} callback    Typical callback function
 * @return {Object}              JDS Object enriched with image contextId's or image
 *                               thumbnail objects if the record is DOD
 */
module.exports.addImagesToDocument = function(req, jdsResponse, callback) {
    var self = this;
    var logger = req.logger;
    // all patient records
    var patientRecords = jdsResponse.data.items;
    var pid = _.get(req, 'interceptorResults.patientIdentifiers.siteDfn');
    if (!rdk.utils.pidValidator.isSiteDfn(pid)) {
        logger.info({location: 'vix-subsystem.getImagesForDocument', pid: pid, error: 'pid is a not valid site;dfn - returning error'});
        return callback('pid is not a valid site;dfn');
    }
    var icn = _.get(req, 'interceptorResults.patientIdentifiers.icn');
    var queryRecords = {
        patientICN: icn,
        studies: []
    };

    _.each(patientRecords, function(record) {
        if (record.hasImages || record.images > 0) {
            record.contextId = self._buildContextId(req, record);
        }

        if (record.facilityName === 'DOD') {
            record.thumbnails = [];
            record.viewerUrl = '';
            record.detailsUrl = '';
            record.studyId = '';
            record.contextId = '';

            var rec = {};

            rec.patientICN = icn;
            rec.contextId = self._buildContextId(req, record);
            rec.siteNumber = record.facilityCode;
            record.contextId = rec.contextId;

            queryRecords.studies.push(rec);
        }
    });

    logger.trace({
        patientRecords: patientRecords
    });

    async.waterfall(
        [
            // get the security token required by VIX
            function(callback) {
                return self._waterfallGetToken(req, callback);
            },
            // query vix with our list of records
            function(token, callback) {
                logger.debug({bseToken: token});
                return self._getStudyQuery(req, token, queryRecords, callback);
            },
            // process the returned data
            function(vixBody, callback) {
                logger.debug({preLoopVixBody: vixBody});
                if (_.isEmpty(vixBody.studies)) {
                    logger.error({location: 'vix-subsystem.getImagesForDocument', error: 'Empty response from VIX'});
                    return callback(null, 'done');
                }
                _.each(patientRecords, function(patientRecord) {
                    if (_.isEmpty(vixBody.studies)) {
                        return false;
                    }
                    var studyDataIndex = _.findIndex(vixBody.studies, function(studies) {
                        return _.startsWith(studies.contextId, patientRecord.contextId);
                    });
                    if (-1 !== studyDataIndex && _.get(vixBody, ['studies', studyDataIndex, 'imageCount']) > 0) {
                        var studyData = vixBody.studies[studyDataIndex];
                        patientRecord.hasImages = true;
                        patientRecord.viewerUrl = studyData.viewerUrl;
                        patientRecord.detailsUrl = studyData.detailsUrl;
                        patientRecord.studyId = studyData.studyId;
                        patientRecord.thumbnails.push(studyData.thumbnailUrl);
                        patientRecord.imageCount = studyData.imageCount;
                        vixBody.studies.splice(studyDataIndex, 1);
                    }
                });
                logger.debug({postLoopVixBody: vixBody});
                return callback(null, 'done');
            }
        ],
        function(error, result) {
            if (error) {
                logger.debug({error: error}, 'vix not available');
            }
            jdsResponse.data.items = patientRecords;
            return callback(null, jdsResponse);
        }
    );
};

/**
 * Gets the image meta data for a single document
 * @param  {Object}   req      Typical default Express request object
 * @param  {Function} callback Typical callback function
 * @return {Object}            VIX response containing image meta data
 */
module.exports.getImagesForDocument = function(req, callback) {
    var logger = req.logger;
    var pid = req.interceptorResults.patientIdentifiers.siteDfn;
    if (!rdk.utils.pidValidator.isSiteDfn(pid)) {
        logger.info({location: 'vix-subsystem.getImagesForDocument', pid: pid, error: 'pid is a not valid site;dfn - returning error'});
        return callback('pid is not a valid site;dfn');
    }

    var icn = req.interceptorResults.patientIdentifiers.icn;
    if (!rdk.utils.pidValidator.isIcn(icn)) {
        logger.info({location: 'vix-subsystem.getImagesForDocument', icn: icn, error: 'icn is not valid - returning error'});
        return callback('icn is not valid');
    }

    var siteNumber = req.query.siteNumber;
    if (nullchecker.isNullish(siteNumber)) {
        logger.info({location: 'vix-subsystem.getImagesForDocument', siteNumber: siteNumber, error: 'siteNumber is nullish - returning error'});
        return callback('siteNumber is nullish');
    }

    var contextId = req.query.contextId;
    if (nullchecker.isNullish(contextId)) {
        logger.info({location: 'vix-subsystem.getImagesForDocument', contextId: contextId, error: 'contextId is nullish - returning error'});
        return callback('contextId is nullish');
    }

    var query = {
        patientICN: icn,
        siteNumber: siteNumber,
        studies: [{
            contextId: contextId
        }]
    };

    var self = this;
    async.waterfall(
        [
            // get the security token required by VIX
            function(callback) {
                return self._waterfallGetToken(req, callback);
            },
            //query vix with our list of records
            function(token, callback) {
                logger.debug({bseToken: token});
                return self._getStudyQuery(req, token, query, callback);
            },
            //process the returned data
            function(vixBody, callback) {
                logger.debug({vixBody: vixBody});
                if (_.isEmpty(vixBody.studies)) {
                    var vixError = 'Empty response from VIX';
                    logger.error({location: 'vix-subsystem.getImagesForDocument', error: vixError});
                    return callback(vixError);
                }

                vixBody.items = vixBody.studies || [];
                delete vixBody.studies;

                return callback(null, vixBody);
            }
        ],
        function(error, result) {
            if (error) {
                logger.debug({location: 'vix-subsystem.getImagesForDocument', error: error});
            }
            return callback(null, result);
        }
    );
};

module.exports._waterfallGetToken = function(req, callback) {
    this._checkBseToken(req, function(error, response){
        if (error) {
            req.logger.debug({location: 'vix-subsystem.waterfallGetToken', error: error});
            return callback(error);
        }

        return callback(null, response);
    });
};

/**
 * Queries the VIX for the Study meta data.  Can be a single contextId or an
 * array of contextIds
 * @param  {Object}   req      Typical default Express req object
 * @param  {String}   bseToken VistA BSE Security Token
 * @param  {Object}   query    Object containing patientICN, siteNumber, and
 *                             an array of studies containing an objects with
 *                             a single or arry of string contextIds
 * @param  {Function} callback Typical callback function
 * @return {Object}            Response body from the VIX
 */
module.exports._getStudyQuery = function(req, bseToken, query, callback) {
    // Get the VIX HTTP configuration
    var config = this._getQueryConfig(req.app.config, req.logger, 'studyQuery');

    req.logger.debug(config, 'VIX CONFIG');

    if (nullchecker.isNullish(config)) {
        return callback({error: 'vix is not configured'});
    }

    // build the header info
    var user = req.session.user;
    var fullName = user.lastname + ',' + user.firstname;
    var ssn = user.ssn;
    var siteName = user.facility;
    var siteNumber = user.site;
    var duz = _.get(user, ['duz', siteNumber]);

    var stationNumber = req.session.user.division;

    config.headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'xxx-securityToken': bseToken,
        'xxx-fullname': fullName,
        'xxx-duz': duz,
        'xxx-ssn': ssn,  //-- eHMP Image Viewer SDD lists this as a required
                         // field to identify user to rVix, this is passed
                         // through TLS , https headers are encrypted
                         // https://tools.ietf.org/html/rfc2818#section-2.1 -jreightler
        'xxx-sitename': siteName,
        'xxx-sitenumber': stationNumber
    };
    config.body = query;

    return http.post(config, function(vixError, vixResponse) {
        if (vixError) {
            req.logger.debug({location: 'vix-subsystem._getStudyQuery', error: vixError});
            return callback(vixError);
        }
        return callback(null, vixResponse.body);
    });
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 *                                       Utilities
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/**
 * Returns the Query Configuration for the VIX call based on which API key is
 * sent in. Current options are studyQuery and studyDetails.
 * @param  {Object} appConfig Config object, normally req.app.config
 * @param  {Object} logger    Bunyan logger
 * @param  {String} query     Which API key within the VIX Config you want to
 *                            connect to, current options are studyQuery and
 *                            studyDetails
 * @return {Object}           httpConfig object to connect with the VIX
 */
module.exports._getQueryConfig = function(appConfig, logger, query) {
    if (!this._vixServerConfigured) {
        return null;
    }
    if (!_.get(appConfig, ['vix', 'api', query])) {
        return null;
    }
    var httpConfig = _.extend({}, appConfig.vix, {
        logger: logger,
        uri: appConfig.vix.api[query],
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    });
    return httpConfig;
};

/**
 * Converts the JDS category into a category the VIX will accept
 * @param  {String} category JDS category for the domain
 * @return {String}          Category the VIX expects
 */
module.exports._convertCategory = function(category) {
    if (nullchecker.isNullish(category)) {
        return 'TIU';
    }
    switch (category) {
        case 'PN': // "Progress Note"
        case 'DS': // "Discharge Summary"
        case 'CP': // "Clinical Procedure"
        case 'SR': // "Surgery Report"
        case 'LR': // "Laboratory Report"
        case 'CR': // "Consult Report"
        case 'C': // "Crisis Note"
        case 'W': // "Clinical Warning"
        case 'A': // "Allergy/Adverse Reaction"
        case 'D': // "Advance Directive"
        // Commenting out Radiology Report because it is supported by the VIX independently
        // case 'RA': // Radiology Report"
            category = 'TIU';
            break;

        default:
            break;
    }
    return category;
};

/**
 * Create the full contextId needed for the VIX to find the image meta data
 * @param  {Object} req    Typical default Express request object
 * @param  {Object} record JDS Patient record
 * @return {String}        VIX/VistA formated contextID
 */
module.exports._buildContextId = function(req, record) {
    var hasImages = '0';
    // Check if the record hasImages or has an image count and set hasImages to 1
    if (record.hasImages || record.images > 0) {
        hasImages = '1';
    }

    // build the CPRS style contextID which is used to by VIX to search for images
    var dfn = req.interceptorResults.patientIdentifiers.dfn;
    var category = this._convertCategory(record.category);
    var localId = nullchecker.isNotNullish(record.localId) ? record.localId : uidUtils.extractLocalIdFromUID(record.uid);
    var caseNum = nullchecker.isNullish(record.case) ? '' : record.case;
    var facilityName = nullchecker.isNullish(record.facilityName) ? '' : record.facilityName;

    var contextId = 'RPT^CPRS^' + dfn + '^' + category + '^' + localId + '^' + caseNum + '^' + facilityName + '^^^^^^' + hasImages;

    return contextId;
};

/**
 * Checks the pJDS data store to see if there is a VistA BSE Security token
 * saved to the user object, if there isn't it generates one, if there is
 * and it's expired it generates a new one, otherwise it returns it.
 * @param  {Object}   req      Typical default Express request object
 * @param  {Function} callback Typical callback function
 * @return {String}            VistA BSE Security token
 */
module.exports._checkBseToken = function(req, callback) {
    var self = this;
    var user = _.get(req, 'session.user', {});

    if (nullchecker.isNullish(user)) {
        req.logger.error({location: 'vix-subsystem._saveBseToken', error: 'User object is empty'});
        return callback('User object is empty');
    }

    if (nullchecker.isNullish(user.vixBseToken) || nullchecker.isNullish(user.vixBseTokenExpires)) {
        req.logger.debug({location: 'vix-subsystem._checkBseToken', error: 'There is a problem with token or token expiration'});
        return self._regenerateBseToken(req, callback);
    }

    if (moment().format('X') > user.vixBseTokenExpires) {
        req.logger.debug({location: 'vix-subsystem._checkBseToken', error: 'BSE token has expired'});
        return self._regenerateBseToken(req, callback);
    }

    return callback(null, user.vixBseToken);
};

/**
 * Helper method to regenerate the VistA BSE token
 * @param  {Object}   req      Typical default Express request object
 * @param  {Function} callback Typical callback function
 * @return {String}            VistA BSE Security token
 */
module.exports._regenerateBseToken = function(req, callback) {
    var self = this;
    this._getBseToken(req, function(error, response) {
        if (error) {
            req.logger.debug({location: 'vix-subsystem._regenerateBseToken', error: error});
            return callback(error);
        }

        return self._saveBseToken(req, response, callback);
    });
};

/**
 * Gets a new BSE Security Token from the VistA the user is signed into
 * @param  {Object}   req      Typical default Express request object
 * @param  {Function} callback Typical callback function
 * @return {String}            VistA BSE Security Token
 */
module.exports._getBseToken = function(req, callback) {
    var user = _.get(req, 'session.user', {});

    if (nullchecker.isNullish(user)) {
        req.logger.error({location: 'vix-subsystem._saveBseToken', error: 'User object is empty'});
        return callback('User object is empty');
    }

    var site = _.get(req, ['app', 'config', 'vistaSites', user.site]);
    if (!site) {
        return callback({error: 'user site not configured'});
    }

    // Extend onto an empty object to prevent overwriting the
    // running configuration with our custom values in the
    // last object
    var vistaConfig = _.extend({}, site, {
        context: req.app.config.rpcConfig.context,
        accessCode: req.session.user.accessCode,
        verifyCode: req.session.user.verifyCode,
        division: req.session.user.division
    });
    var parameters = [];
    var rpcName = 'XUS GET TOKEN';


    return RpcClient.callRpc(
        req.logger, vistaConfig, rpcName, parameters,
        function(error, rpcData) {
            if (error) {
                req.logger.error({location: 'vix-subsystem._getBseToken', error: error, rpcName: rpcName});
                return callback(error);
            }

            return callback(null, rpcData);
        });
};

/**
 * Save the BSE Token to the user's session, valid for for 22 hours
 * @param  {Object}   req      Typical default Express request object
 * @param  {String}   token    BSE Token obtained from VistA
 * @param  {Function} callback Typical callback function
 * @return {Object}            Error or Data Object will be returned to verify the process
 */
module.exports._saveBseToken = function(req, token, callback) {
    var logger = req.logger;
    var user = _.get(req, 'session.user', null);

    if (nullchecker.isNullish(token)) {
        logger.debug({location: 'vix-subsystem._saveBseToken', error: 'Token not provided from VistA'});
        return callback('Token not provided from VistA');
    }

    if (nullchecker.isNullish(user)) {
        logger.error({location: 'vix-subsystem._saveBseToken', error: 'User object is empty'});
        return callback('User object is empty');
    }

    logger.debug({location: 'vix-subsystem._saveBseToken', token: token});
    _.set(req, 'session.user.vixBseToken', token);
    _.set(req, 'session.user.vixBseTokenExpires', moment().add(22, 'hours').format('X'));
    return callback(null, token);
};
