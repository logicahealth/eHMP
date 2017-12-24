/*jslint node: true */
'use strict';
var pidUtils = require(global.VX_UTILS + 'patient-identifier-utils');
var uidUtils = require(global.VX_UTILS + 'uid-utils');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var HttpHeaderUtils = require(global.VX_UTILS + 'http-header-utils');
var solrHandler = require(global.VX_HANDLERS + 'solr-record-storage/solr-record-storage-handler');
var async = require('async');
var _ = require('underscore');

/**
 * Register the Clinical Object API into express' router
 * @param {object} log - The bunyan logger to use
 * @param {object} config - The worker-config object to use
 * @param {object} environment - The environment object to use
 * @param {object} app - The express application to use
 **/
function registerClinicalObjectAPI(log, config, environment, app) {
    app.post('/clinicalObject', handleClinicalObjectPost.bind(null, log, config, environment));
}

/**
 * Handle a POST request to the /clinicalObject endpoint
 * @param {object} log - The bunyan logger to use
 * @param {object} config - The worker-config object to use
 * @param {object} environment - The environment object to use
 * @param {object} req - The request object
 * @param {object} res - The response object
 **/
function handleClinicalObjectPost(log, config, environment, req, res, next) {
    var referenceInfo = (new HttpHeaderUtils(log)).extractReferenceInfo(req);
    var childLog = log.child(referenceInfo);
    childLog.debug('clinical-object-endpoint.handleClinicalObjectPost(): Request body: %j', req.body);

    var record = req.body;

    // make sure the request is in a format that we can understand
    var isValid = validateRequest(record);
    if (isValid !== null) {
        childLog.warn('clinical-object-endpoint.handleClinicalObjectPost(): Posted data is invalid. Received error %s', isValid);
        res.status(400).json({'error': isValid});
        return next();
    }

    // Perform all of the steps to store a clinical object:
    // 1. Store to pJDS (stop on Error)
    // 2. Publish to activity management (Continue on error)
    // 3. Store to Solr (Continue on error)
    async.series([
        storeToPJDS.bind(null, childLog, environment, config, record),
        // steps 2 and 3 combined into one to ensure errors are captured but both operations are attempted
        publishToActivityManagementAndStoreToSolr.bind(null, childLog, environment, config, referenceInfo, record)
    ], function (err) {
        if (err) {
            childLog.error('clinical-object-endpoint.handleClinicalObjectPost(): Error occurred during clinical object processing: %s', err);
            res.status(500).json({'error': err});
            return next();
        } else {
            // return a header that contains the uid of the record we just stored.
            res.setHeader('location', req.protocol + '://' + req.get('host') + req.url + '/' + record.uid);
            res.status(201).json({'status': 'OK'});
            return next();
        }
    });
}

// private utility functions

/**
 * Validate a clinical object record is well formed
 * @param {object} record - The clinical object record to validate
 * @returns {Array} - An array of errors OR null if no errors found
 **/
function validateRequest(record) {
    // validation rules:
    // record must exist
    // required attributes for saving to pJDS:
    // - uid
    // - patientUid
    // - authorUid
    // - domain
    // - subDomain
    // - visit (including location, serviceCategory, dateTime)
    // - ehmpState
    var errors = [];

    if (_.isUndefined(record) || _.isEmpty(record)) {
        errors.push('No data provided');
        // Return here as there is no reason to continue.
        return errors;
    }

    _.each(['uid', 'patientUid', 'authorUid', 'domain', 'subDomain', 'ehmpState', 'visit', 'visit.location', 'visit.serviceCategory', 'visit.dateTime'], function (field) {
        if (field.split('.').length === 2) {
            var fields = field.split('.');
            if (_.isUndefined(record[fields[0]]) || _.isEmpty(record[fields[0]]) || _.isNull(record[fields[0]]) || _.isUndefined(record[fields[0]][fields[1]]) || _.isEmpty(record[fields[0]][fields[1]]) || _.isNull(record[fields[0]][fields[1]])) {
                errors.push('Required field ' + field + ' is missing');
            }
        } else {
            // Assume there is only one piece for the field
            if (_.isUndefined(record[field]) || _.isEmpty(record[field]) || _.isNull(record[field])) {
                errors.push('Required field ' + field + ' is missing');
            }
        }
    });
    return errors.length > 0 ? errors : null;
}

/**
 * Store a clinical object to pJDS
 * @param {object} childLog - The bunyan logger to use
 * @param {object} environment - The environment object to use
 * @param {object} config - The worker-config object to use
 * @param {object} record -  The clinical object to store to pJDS
 * @param {function} callback - The function to run after the clinical object is attempted to be stored to pJDS
 * @returns {string} - An error message OR null if no errors found
 **/
function storeToPJDS(childLog, environment, config, record, callback) {
    const pjdsClient = environment.pjdsHttp;

    pjdsClient.createClinicalObject(record, function (error) {
        return callback(error);
    });
}

/**
 * Publish a clinical object to Activity Management and Store the clinical object to SOLR
 * @param {object} childLog - The bunyan logger to use
 * @param {object} environment - The environment object to use
 * @param {object} config - The worker-config object to use
 * @param {object} referenceInfo - The extracted reference information from the original request
 * @param {object} record -  The clinical object to store to pJDS
 * @param {function} callback - The function to run after the clinical object is attempted to be sent to Activity Management and SOLR
 * @returns {Array} - An array of error messages OR null if no errors found
 **/
function publishToActivityManagementAndStoreToSolr(childLog, environment, config, referenceInfo, record, callback) {
    // setup error array to capture errors from activity management and solr
    var errors = [];

    publishActivity(childLog, environment, referenceInfo, record, function (error) {
        if (error) {
            childLog.error('clinical-object-endpoint.publishToActivityManagementAndStoreToSolr(): error publishing to activity management: %j', error);
            // capture the error, but attempt storing to solr
            errors.push(error);
        }

        // Always attempt to store to Solr ignoring any error from publishActivity
        storeToSolr(childLog, environment, config, record, function (error) {
            if (error) {
                childLog.error('clinical-object-endpoint.publishToActivityManagementAndStoreToSolr(): error storing object to SOLR: %j', error);
                errors.push(error);
            }
            // call the callback with any errors
            return callback(errors.length > 0 ? errors : null);
        });
    });
}

/**
 * Publish a clinical object to Activity Management and Store the clinical object to SOLR
 * @param {object} childLog - The bunyan logger to use
 * @param {object} environment - The environment object to use
 * @param {object} referenceInfo - The extracted reference information from the original request
 * @param {object} record -  The clinical object to store to pJDS
 * @param {function} callback - The function to run after the clinical object is attempted to be sent to Activity Management
 * @returns {string} - An error message OR null if no errors found
 **/
function publishActivity(childLog, environment, referenceInfo, record, callback) {
    //extract pid based on uid
    var pid = uidUtils.extractPidFromUID(record.patientUid);
    var patientIdentifier = pidUtils.create('pid', pid);

    // Publish event to activity management tube
    var job = jobUtil.createActivityManagementEvent(patientIdentifier, record.domain, record, referenceInfo);
    environment.publisherRouter.childInstance(childLog).publish(job, function (error) {
        if (error) {
            return callback(error);
        } else {
            return callback(null);
        }
    });
}

/**
 * Publish a clinical object to Activity Management and Store the clinical object to SOLR
 * @param {object} childLog - The bunyan logger to use
 * @param {object} environment - The environment object to use
 * @param {object} config - The worker-config object to use
 * @param {object} record -  The clinical object to store to pJDS
 * @param {function} callback - The function to run after the clinical object is attempted to be sent to SOLR
 * @returns {Array} - An array of error messages OR null if no errors found
 **/
function storeToSolr(childLog, environment, config, record, callback) {
    // store to solr if storeToSolr flag exists in the body
    if (record.storeToSolr) {
        solrHandler.writebackWrapper(childLog, config, environment, record.domain, record, function (error) {
            if (error) {
                return callback(error);
            } else {
                return callback(null);
            }
        });
    } else {
        childLog.debug('clinical-object-endpoint.storeToSolr(): storeToSolr flag not passed. Not storing to solr and not returning an error');
        return callback(null);
    }
}

module.exports = registerClinicalObjectAPI;

// export handle method only for unit tests
module.exports._handleClinicalObjectPost = handleClinicalObjectPost;
module.exports._storeToSolr = storeToSolr;
module.exports._publishActivity = publishActivity;
module.exports._publishToActivityManagementAndStoreToSolr = publishToActivityManagementAndStoreToSolr;
module.exports._storeToPJDS = storeToPJDS;
module.exports._validateRequest = validateRequest;
