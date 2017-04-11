'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var uidUtils = require('../../utils/uid-utils');
var dd = require('drilldown');
var httpUtil = rdk.utils.http;
var uuid = require('node-uuid');
var jdsFilter = require('jds-filter');
var moment = require('moment');
var querystring = require('querystring');
var async = require('async');
var clinicalObjectsValidator = require('./clinical-objects-validator');

module.exports.create = createClinicalObject;
module.exports.read = readClinicalObject;
module.exports.update = updateClinicalObject;
module.exports.find = findClinicalObject;
module.exports.getList = getClinicalObjectList;
module.exports.loadReference = dereferenceClinicalObject;
module.exports.postActivityManagementEvent = postActivityManagementEvent;
module.exports.transformPatientUid = transformPatientUid;

var CLINICAL_OBJECT_NOT_FOUND = module.exports.CLINICAL_OBJECT_NOT_FOUND = 'Clinical object not found';
var REFERENCE_ID_NOT_FOUND = module.exports.REFERENCE_ID_NOT_FOUND = 'Reference ID';
var PJDS_CONNECTION_ERROR = module.exports.PJDS_CONNECTION_ERROR = 'Unable to reach pJDS';
var JDS_CONNECTION_ERROR = module.exports.JDS_CONNECTION_ERROR = 'Unable to reach JDS';
var UTC_STANDARD = module.exports.UTC_STANDARD = 'YYYYMMDDHHmmss+0000';

function getSubsystemConfig(app) {
    return {
        healthcheck: {
            name: 'pjds',
            interval: 100000,
            check: function(callback) {
                var jdsOptions = _.extend({}, app.config.generalPurposeJdsServer, {
                    url: '/ping',
                    timeout: 5000,
                    logger: app.logger
                });

                httpUtil.get(jdsOptions, function(err) {
                    if (err) {
                        return callback(false);
                    }
                    callback(true);
                });
            }
        }
    };
}

function createClinicalObject(logger, appConfig, model, callback) {
    logger.info('createClinicalObject');
    clinicalObjectsValidator.validateCreate([], model, appConfig, function(errorMessages) {
        if (!_.isEmpty(errorMessages)) {
            logger.info({
                validationErrors: errorMessages
            }, 'createClinicalObject');
            return callback(errorMessages);
        }

        //replace VLER or HDR site with ICN.
        transformPatientUid(model);

        var clinicObjectCreateTimeUTC = moment().utc().format(UTC_STANDARD);

        model = _.pick(model, 'authorUid', 'patientUid', 'domain', 'subDomain', 'visit', 'referenceId', 'data', 'ehmpState', 'displayName', 'addendum');
        model = _.set(model, 'creationDateTime', clinicObjectCreateTimeUTC);

        var site = uidUtils.extractSiteFromUID(model.patientUid, ':');
        var localId = uidUtils.extractLocalIdFromUID(model.patientUid, ':');
        model.uid = 'urn:va:' + model.domain + ':' + site + ':' + localId + ':' + uuid.v4();

        var createTask = function(taskCallback) {
            var requestConfig = _.extend({}, appConfig.generalPurposeJdsServer, {
                logger: logger,
                url: '/clinicobj',
                body: model,
                json: true
            });

            httpUtil.post(requestConfig, function(err, response, body) {
                if (err) {
                    logger.error({
                        err: err
                    }, 'Failed to create clinical object.');
                    return taskCallback(err);
                }
                return taskCallback(null, response);
            });
        };

        async.series({
            createTask: createTask,
            postActivityManagementEvent: function(callback) {
                postActivityManagementEvent(logger, appConfig, model, function(err, resp) {
                    //silent activity management service failure
                    return callback(null, resp);
                });
            }
        }, function(err, results) {
            if (err) {
                return callback(err);
            }
            return callback(null, results.createTask);
        });
    });
}

function readClinicalObject(logger, appConfig, uid, loadReference, callback) {
    logger.info('readClinicalObject');
    var errorMessages = [];
    clinicalObjectsValidator.validateRead(errorMessages, uid);
    if (!_.isEmpty(errorMessages)) {
        logger.info({
            validationErrors: errorMessages
        }, 'readClinicalObject');
        return callback(errorMessages);
    }

    return getClinicalObjectList(logger, appConfig, [uid], loadReference, function(err, listResponse) {
        if (err) {
            return callback(err);
        }
        var clinicalObjectExists = _.isObject(dd(listResponse)('items')(0).val);
        if (!clinicalObjectExists) {
            errorMessages.push(CLINICAL_OBJECT_NOT_FOUND);
            return callback(errorMessages);
        }
        return callback(null, listResponse.items[0]);
    });
}

function updateClinicalObject(logger, appConfig, uid, model, callback) {
    logger.info('updateClinicalObject');
    clinicalObjectsValidator.validateUpdate([], uid, model, appConfig, function(errorMessages) {
        if (!_.isEmpty(errorMessages)) {
            logger.info({
                validationErrors: errorMessages
            }, 'updateClinicalObject');
            return callback(errorMessages);
        }

        //replace VLER or HDR site with ICN.
        transformPatientUid(model);

        var updateTask = function(taskCallback) {
            var requestConfig = _.extend({}, appConfig.generalPurposeJdsServer, {
                logger: logger,
                url: '/clinicobj/' + uid,
                body: model,
                json: true
            });

            httpUtil.put(requestConfig, function(err, response, body) {
                if (err) {
                    logger.error({
                        err: err,
                        uid: uid
                    }, 'Failed to update clinical object');
                    return taskCallback(err);
                }
                return taskCallback(null, response);
            });
        };

        async.series({
            updateTask: updateTask,
            postActivityManagementEvent: function(callback) {
                postActivityManagementEvent(logger, appConfig, model, function(err, resp) {
                    //silent activity management service failure
                    return callback(null, resp);
                });
            }
        }, function(err, results) {
            if (err) {
                return callback(err);
            }
            return callback(null, results.updateTask);
        });
    });
}

function findClinicalObject(logger, appConfig, model, loadReference, callback) {
    logger.info('findClinicalObject');
    var errorMessages = [];

    clinicalObjectsValidator.validateFind(errorMessages, model);
    if (!_.isEmpty(errorMessages)) {
        logger.info({
            validationErrors: errorMessages
        }, 'findClinicalObject');
        return callback(errorMessages);
    }

    //replace VLER or HDR site with ICN.
    transformPatientUid(model);

    var jdsQuery = {};
    jdsQuery.filter = createFindQueryString(model);

    getAndDereferenceClinicalObjects(logger, appConfig, jdsQuery, loadReference, callback);
}

function getClinicalObjectsFromPjds(logger, appConfig, jdsQuery, callback) {
    var errorMessages = [];

    var requestConfig = _.extend({}, appConfig.generalPurposeJdsServer, {
        logger: logger,
        url: '/clinicobj/?' + querystring.stringify(jdsQuery),
        json: true
    });

    httpUtil.get(requestConfig, function(err, response, body) {
        if (err) {
            logger.error({
                err: err
            }, 'Error getting clinical object from pJDS');
            errorMessages.push(PJDS_CONNECTION_ERROR);
            return callback(errorMessages);
        }

        var errors = _.get(body, 'error.errors', []);
        if (!_.isEmpty(errors)) {
            _.each(errors, function(errorObj) {
                errorMessages.push(errorObj.domain + ':' + errorObj.message);
            });
            return callback(errorMessages);
        }

        if (!_.isArray(_.get(body, 'items'))) {
            errorMessages.push(CLINICAL_OBJECT_NOT_FOUND);
            return callback(errorMessages);
        }

        return callback(null, body);
    });
}

function createFindQueryString(model) {
    var queryList = ['patientUid', 'authorUid', 'domain', 'subDomain', 'ehmpState', 'displayName', 'referenceId'];
    var queryStr = '';
    _.each(model, function(value, key) {
        if (_.includes(queryList, key) && (!_.isEmpty(value))) {
            queryStr = queryStr + 'eq("' + key + '","' + value + '"),';
        }
        if (key === 'visit') {
            if (!_.isEmpty(value.location)) {
                queryStr = queryStr + 'eq("visit.location","' + value.location + '"),';
            }
            if (!_.isEmpty(value.serviceCategory)) {
                queryStr = queryStr + 'eq("visit.serviceCategory","' + value.serviceCategory + '"),';
            }
            if (!_.isEmpty(value.dateTime)) {
                queryStr = queryStr + 'eq("visit.dateTime","' + value.dateTime + '"),';
            }
        }
    });
    return queryStr.slice(0, -1);
}

function createUidListQueryObject(uidList) {
    var jdsQuery = {};
    var uidListFilter = [];
    if (_.isString(uidList)) {
        uidListFilter.push(uidList);
    } else {
        uidListFilter = uidList;
    }
    var jdsFilters = ['in', 'uid', uidListFilter];
    jdsQuery.filter = jdsFilter.build(jdsFilters);
    return jdsQuery;
}

function dereferenceClinicalObjects(logger, appConfig, clinicalObjectResponse, callback) {
    async.map(clinicalObjectResponse.items, function(clinicalObject, callback) {
        if (!clinicalObject.referenceId) {
            return setImmediate(callback, null, clinicalObject);
        }
        dereferenceClinicalObject(logger, appConfig, clinicalObject, callback);
    }, function handleDereferencedObjects(err, dereferencedObjects) {
        if (err) {
            return callback(err);
        }
        clinicalObjectResponse.items = dereferencedObjects;
        return callback(null, clinicalObjectResponse);
    });
}

function dereferenceClinicalObject(logger, appConfig, clinicalObject, callback) {
    logger.info('dereferenceClinicalObject');
    var errorMessages = [];

    if (!_.isObject(clinicalObject)) {
        errorMessages.push(CLINICAL_OBJECT_NOT_FOUND);
        return setImmediate(callback, errorMessages);
    }
    var referenceId = clinicalObject.referenceId;
    var jdsPath = '/vpr/uid/' + referenceId;
    var requestConfig = _.extend({}, appConfig.jdsServer, {
        logger: logger,
        url: jdsPath,
        json: true
    });
    httpUtil.get(requestConfig, function(err, response, body) {
        if (err) {
            logger.error({
                err: err
            }, 'Failed to loadReference on a clinical object.');
            errorMessages.push(JDS_CONNECTION_ERROR);
            return callback(errorMessages);
        }

        var errors = _.get(body, 'error.errors', []);
        if (!_.isEmpty(errors)) {
            _.each(errors, function(errorObj) {
                errorMessages.push(errorObj.domain + ':' + errorObj.message);
            });
            return callback(errorMessages);
        }
        var jdsUidExists = _.isObject(dd(body)('data')('items')(0).val);
        if (!jdsUidExists) {
            errorMessages.push(REFERENCE_ID_NOT_FOUND);
            return callback(errorMessages);
        }
        if(clinicalObject.data && _.isUndefined(clinicalObject.ehmpData)){
            clinicalObject.ehmpData = clinicalObject.data;
        }
        clinicalObject.data = body.data.items[0];
        return callback(null, clinicalObject);
    });
}

function getClinicalObjectList(logger, appConfig, uidList, loadReference, callback) {
    logger.info('getClinicalObjectList');
    var jdsQuery = createUidListQueryObject(uidList);
    getAndDereferenceClinicalObjects(logger, appConfig, jdsQuery, loadReference, callback);
}

function getAndDereferenceClinicalObjects(logger, appConfig, jdsQuery, loadReference, callback) {
    if (!loadReference) {
        return getClinicalObjectsFromPjds(logger, appConfig, jdsQuery, callback);
    }
    async.waterfall([
        getClinicalObjectsFromPjds.bind(null, logger, appConfig, jdsQuery),
        dereferenceClinicalObjects.bind(null, logger, appConfig)
    ], function handler(err, body) {
        if (err) {
            return callback(err);
        }
        return callback(null, body);
    });
}

function postActivityManagementEvent(logger, appConfig, clinicalObject, callback) {
    var requestConfig = _.extend({}, appConfig.vxSyncServer, {
        logger: logger,
        url: '/activity-management-event',
        body: clinicalObject,
        json: true
    });

    httpUtil.post(requestConfig, function(err, resp, body) {
        var ERR_LOG_MSG = 'Failed to post activity management event.';

        var isErr = err || (resp && resp.statusCode !== 200);
        if (isErr) {
            if (!err) {
                err = new Error(resp ? resp.body : ERR_LOG_MSG);
            }

            logger.error({
                err: err
            }, ERR_LOG_MSG);

            return callback(err);
        }

        return callback(null, resp);
    });
}

/**
 * Transforms patientUid site piece from VLER or HDR to ICN.
 *
 * @param clinicalObj Valid clinical object with patient unique identifier (patientUid).
 */
function transformPatientUid(clinicalObj) {

    if (!clinicalObj || !clinicalObj.patientUid) {
        return;
    }

    clinicalObj.patientUid = clinicalObj.patientUid.replace(/VLER|HDR/gi, 'ICN');
}
