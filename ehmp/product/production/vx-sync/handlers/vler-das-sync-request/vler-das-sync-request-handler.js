'use strict';

//-------------------------------------------------------------------------------------
// This is the implementation of the vler-das-sync-request handler.
//
// @Author: Les Westberg
//-------------------------------------------------------------------------------------

let _ = require('lodash');
let jobUtil = require(global.VX_UTILS + 'job-utils');
let idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
let format = require('util').format;
let inspect = require(global.VX_UTILS + 'inspect');
let timeUtil = require(global.VX_UTILS + 'time-utils');
let errorUtil = require(global.VX_UTILS + 'error');
let uuid = require('node-uuid');
let moment = require('moment');

const DEFAULT_QUERY_DURATION_DAYS = 180;

//-----------------------------------------------------------------------------------------------------------
// The handler's main function.  This is called when a job is retrieved that this handler can service.
//
// log: The logger to use for log messages.
// config: The properties to use (worker-config.json)
// job: The job that was pulled from the Beanstalk tube
// handlerCallback: The call back to call when the handler is done.
//------------------------------------------------------------------------------------------------------------
function handle(log, config, environment, job, handlerCallback) {
    log.debug('vler-das-sync-request-handler.handle : received request to VLER DAS job: %j', job);

    if (!job) {
        log.debug('vler-das-sync-request-handler.handle : Job was null or undefined');
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('No job given to handle'));
    }

    if (!job.type || job.type !== jobUtil.vlerDasSyncRequestType()) {
        log.debug('vler-das-sync-request-handler..handle : job type was invalid: %s', job.type);
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('Incorrect job type', job.type));
    }

    if (!jobUtil.isValid(jobUtil.vlerDasSyncRequestType(), job)) {
        log.debug('vler-das-sync-request-handler.handle : job was invalid jpid=%s', job.jpid);
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('Invalid job', job.type));
    }

    let subscribeServiceConfig = getVlerDasSubscribeConfiguration(log, config, job);
    if (subscribeServiceConfig === null) {
        log.warn('vler-das-sync-request-handler.handle: No configuration for job: %j', job);
        return setTimeout(handlerCallback, 0, errorUtil.createFatal('VLER DAS has no configuration', job.type));
        // return handlerCallback('vler-das-sync-request-handler.handle: No configuration');
    }

    // Create an ability to test this through a unit test...    By allowing us to pass in a request object to be used
    // in place of the real one.
    //----------------------------------------------------------------------------------------------------------------
    let request;
    if (environment.request) {
        log.debug('vler-das-sync-request-handler.handle: Setting request to dummy value for unit test.');
        request = environment.request;
    } else {
        request = require('request');
    }

    let metricsObj = {
        'timer': 'start',
        'process': uuid.v4(),
        'pid': job.patientIdentifier.value,
        'subsystem': 'VLERDAS',
        'action': 'sync',
        'jobId': job.jobId,
        'rootJobId': job.rootJobId,
        'jpid': job.jpid
    };
    environment.metrics.debug('VLERDAS domain sync', metricsObj);
    metricsObj.timer = 'stop';

    const requestStampTime = timeUtil.createStampTime();

    log.debug('vler-das-sync-request-handler.handle: creating and sending vler-das-subscribe-request job to JDS');
    createSubscribeJobStatus(job, uuid.v4(), environment.jobStatusUpdater.createJobStatus.bind(environment.jobStatusUpdater), requestStampTime, log, function(error, response) {
        if (error) {
            let statusCode = _.get(response, 'statusCode');
            let errorMessage = format('vler-das-sync-request-handler.handle: Failed to store vler-das-subscribe-request job to jds.  patient: %s, error: %s, response.statusCode: %s', inspect(job.patientIdentifier), inspect(error), statusCode);
            log.error(errorMessage);

            return setTimeout(handlerCallback, 0, errorUtil.createTransient(errorMessage));
        }

        log.debug('vler-das-sync-request-handler.handle: sending request to VLER DAS for icn: %s; config: %j.', idUtil.extractIcnFromPid(job.patientIdentifier.value, config), subscribeServiceConfig);
        request.post(subscribeServiceConfig, function(error, response, body) {
            log.debug('vler-das-sync-request-handler,handle: Received VLER DAS subscribe response.  error: %s; ', error);
            if ((!error) && (response) && (response.statusCode === 200) && (body)) {
                environment.metrics.debug('VLERDAS domain sync', metricsObj);
                log.debug('vler-das-sync-request-handler.handle: response body (string form): %s', body);

                // Create our special job status record that will stay open until we receive and process the notification.
                //--------------------------------------------------------------------------------------------------------
                return setTimeout(handlerCallback, 0, null, 'success');
            } else {
                environment.metrics.debug('VLERDAS domain sync in Error', metricsObj);
                let statusCode = _.get(response, 'statusCode');

                let errorMessage = format('vler-das-sync-request-handler.handle: Failed to subscribe to VLERDAS documents. patient: %s, error: %s, response.statusCode: %s', inspect(job.patientIdentifier), inspect(error), statusCode);
                log.error(errorMessage);
                return setTimeout(handlerCallback, 0, errorUtil.createTransient(errorMessage));
            }
        });
    });
}

//--------------------------------------------------------------------------------------------
// This method creates the JDS job status for the VLER DAS Subscribe job.
//
// job - The Job that is being processed.
// subscribeJobId - The job ID for the job that will be logged in JDS to represent the subscribe
//                  job.
// jobStatusUpdaterFunction - The handle to the function that updates the job status record.
//                            this will be either jobStatusUpdater.createJobStatus
// requestStampTime - The stamptime that this request is being made.
// log - The logger to be used to log messages.
// callback - This is the callback that is called back after the job status has been created.
//--------------------------------------------------------------------------------------------
function createSubscribeJobStatus(job, subscribeJobId, jobStatusUpdaterFunction, requestStampTime, log, callback) {
    log.debug('vler-das-subscribe-request-handler.createSubscribeJobStatus: Entering method. subscribeJobId: %s; job: %j', subscribeJobId, job);
    let patientIdentifier = job.patientIdentifier;
    let meta = {
        rootJobId: job.rootJobId,
        jpid: job.jpid,
        priority: job.priority,
        jobId: subscribeJobId
    };
    if (job.referenceInfo) {
        meta.referenceInfo = job.referenceInfo;
    }
    let subscribeJob = jobUtil.createVlerDasSubscribeRequest(patientIdentifier, requestStampTime, meta);

    jobStatusUpdaterFunction(subscribeJob, function(error, response) {
        // Note - right now JDS is returning an error 200 if things worked correctly.   So
        // we need to absorb that error.
        //--------------------------------------------------------------------------------
        if ((error) && (String(error) === '200')) {
            callback(null, response);
        } else {
            callback(error, response);
        }
    });
}


//---------------------------------------------------------------------------------------------------------
// This method creates the form data that will be sent to DAS to subscribe to VLER documents.
//
// log: The logger for log messages.
// config: The configuration settings
// job: The job that we received that triggered this work.
// returns: The JSON form data.
//---------------------------------------------------------------------------------------------------------
function getVlerDasSubscribeFormData(log, config, job) {
    if (!_.get(config, 'vlerdas', null)) {
        log.error('vler-das-sync-request-handler.getVlerDasSubscribeFormData: Missing VLERDAS configuration');
        return null;
    }

    let icn = idUtil.extractIcnFromPid(job.patientIdentifier.value, config);

    let queryDurationDays = _.get(config, 'vlerdas.queryDurationDays', DEFAULT_QUERY_DURATION_DAYS);
    let startDate = moment().subtract(queryDurationDays, 'days').format('YYYYMMDDHHmmss');
    let endDate = timeUtil.createStampTime();

    let org = _.get(config, 'vlerdas.vlerFormData.org', '');
    let roleCode = _.get(config, 'vlerdas.vlerFormData.roleCode', '');
    let purposeCode = _.get(config, 'vlerdas.vlerFormData.purposeCode', '');
    let vaFacilityCode = _.get(config, 'vlerdas.vlerFormData.vaFacilityCode', '');
    let familyName = _.get(config, 'vlerdas.vlerFormData.familyName', '');
    let givenName = _.get(config, 'vlerdas.vlerFormData.givenName', '');
    let notificationConfig = _.get(config, 'vlerdas.notificationCallback', {});
    let notificationProtocol = _.get(notificationConfig, 'protocol', '');
    let notificationIp = _.get(notificationConfig, 'host', '');
    let notificatinPort = _.get(notificationConfig, 'port', '');
    let notificationPath = _.get(notificationConfig, 'path', '');
    let notificationUrl = notificationProtocol + '://' + notificationIp + ':' + notificatinPort + notificationPath;


    let formData = {
        'id': uuid.v4(),
        'resourceType': 'Subscription',
        'criteria': 'DocumentReference?subject:Patient.identifier=' + icn + '&startDate=' + startDate + '&endDate=' + endDate + '&_format=application/json+fhir',
        'reason': 'Subscription?Org=' + org + '&RoleCode=' + roleCode + '&PurposeCode=' + purposeCode + '&VaFacilityCode=' + vaFacilityCode +
            '&FamilyName=' + familyName + '&GivenName=' + givenName,
        'status': 'Active',
        'text': {
            'status': 'Active',
            'div': '<documents>Null</documents>'
        },
        'channel': {
            'type': 'rest-hook',
            'endpoint': notificationUrl,
            'payload': 'application/json+fhir'
        }
    };

    return formData;
}

//-----------------------------------------------------------------------------------------------------
// Create the config object that will be passed to request.
//
// log: The logger for log messages.
// config: The configuration settings.
// job: The job that we received that triggered this work.
// returns: The request config object that will be passed to request for this service call.
//-----------------------------------------------------------------------------------------------------
function getVlerDasSubscribeConfiguration(log, config, job) {
    if (!_.get(config, 'vlerdas', null)) {
        log.error('vler-das-sync-request-handler.getVlerDasSubscribeConfiguration: Missing VLERDAS configuration');
        return null;
    }

    let dasProtocol = _.get(config, 'vlerdas.defaults.protocol', '');
    let dasHost = _.get(config, 'vlerdas.defaults.host', '');
    let dasPort = _.get(config, 'vlerdas.defaults.port', '');
    let dasSubscribePath = _.get(config, 'vlerdas.vlerdocument.subscribe', '');

    let vlerConfig = {};
    vlerConfig.url = format('%s://%s:%s%s', dasProtocol, dasHost, dasPort, dasSubscribePath);
    vlerConfig.forever = true;
    vlerConfig.agentOptions = {
        maxSockets: config.handlerMaxSockets || 5
    };
    vlerConfig.form = getVlerDasSubscribeFormData(log, config, job);

    return vlerConfig;
}

module.exports = handle;
module.exports._getVlerDasSubscribeConfiguration = getVlerDasSubscribeConfiguration;
module.exports._getVlerDasSubscribeFormData = getVlerDasSubscribeFormData;
module.exports._createSubscribeJobStatus = createSubscribeJobStatus;