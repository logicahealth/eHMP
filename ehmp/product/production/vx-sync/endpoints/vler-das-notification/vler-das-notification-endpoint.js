'use strict';

//------------------------------------------------------------------------------------
// This is the notification endpoint that VLER DAS will call when it is ready with
// documents that we have requested on a patient.
//
// @Author: Les Westberg
//------------------------------------------------------------------------------------

const _ = require('lodash');
const idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
const jobUtil = require(global.VX_UTILS + 'job-utils');
const qs = require('querystring');

//------------------------------------------------------------------------------------
// Register the VLER DAS Notification API with express.
//
// log: The logger to be used for this endpoint.
// config: The worker-config settings to be used.
// environment: The environment variables to be used by this function.
// app: The express object to post the endpoint on.
//-----------------------------------------------------------------------------------
function registerVlerDasNotifyAPI(log, config, environment, app) {
    app.post('/vlerdas/notification', handleVlerDasNotificationPost.bind(null, log, config, environment));
}

//-----------------------------------------------------------------------------------
// This function processes the notification request.
//
// log: The logger to be used for this endpoint.
// config: The worker-config settings to be used.
// environment: The environment variables to be used by this function.
// request: The information associated with the request.
// response: The response object to give to the request.
// returns: The response object.
//-----------------------------------------------------------------------------------
function handleVlerDasNotificationPost(log, config, environment, request, response) {
    log.debug('vler-das-notification-endpoint.retrieveVlerDasSubscribeJobStatus: Received notification request.  request.body: %j', _.get(request, 'body', null));
    const icn = extractIcn(request);

    if (!icn) {
        log.warn('vler-das-notification-endpoint.handleVlerDasNotificationPost: Received notification request without a valid patient identifier in the criteria field.  ' +
            'Rejecting the request.  request.body: %j', _.get(request, 'body', null));
        return response.status(400).send('Invalid request.  Criteria should contain a valid patient ID.');
    }

    retrieveVlerDasSubscribeReqeustJobStatus(icn, log, environment, function(error, vlerDasSubscribeReqeustJobStatus) {
        const referenceInfo = _.get(vlerDasSubscribeReqeustJobStatus, 'referenceInfo', null);
        const childLog = (referenceInfo) ? log.child(referenceInfo) : log;

        createAndPublishVlerDasDocRetrieveJob(vlerDasSubscribeReqeustJobStatus, request, childLog, environment, function(error) {
            if (error) {
                log.error('vler-das-notification-endpoint.handleVlerDasNotificationPost: Failed to create vler-das-doc-retrieve job for icn: %s; error: %j', icn, error);
                return response.status(400).send('Failed to process request.');
            }

            // Close the subscription job.
            //----------------------------
            const jobStatusUpdater = environment.jobStatusUpdater.childInstance(childLog);
            jobStatusUpdater.completeJobStatus(vlerDasSubscribeReqeustJobStatus, function (error) {
                if (error) {
                    log.error('vler-das-notification-endpoint.handleVlerDasNotificationPost: Failed to complete vler-das-subscribe-request job for icn: %s; error: %j', icn, error);
                    return response.status(400).send('Failed to process request.');
                }

                return response.status(200).send();
            });
        });
    });
}


//-------------------------------------------------------------------------------------
// This method creates and publishes the vler-das-doc-retrieve job.
//
// vlerDasSubscribeReqeustJobStatus: The job status object for the vlerDasSubscribeJob.
// request: The request object that the endpoint received.
// log: The logger to use to log messages.
// environment: The environment containing our shared code.
// callback:  The callback function to call after the referenceInfo has been retrieved.
//            function (error) where:
//               error:  The error if one occurs (or null)
//-------------------------------------------------------------------------------------
function createAndPublishVlerDasDocRetrieveJob(vlerDasSubscribeReqeustJobStatus, request, log, environment, callback) {
    const body = (request) ? request.body : null;
    const vlerDasDocRetrieveJob = jobUtil.createVlerDasDocRetrieve(_.get(vlerDasSubscribeReqeustJobStatus, 'patientIdentifier', null),
        _.get(vlerDasSubscribeReqeustJobStatus, 'requestStampTime', null), vlerDasSubscribeReqeustJobStatus);
    vlerDasDocRetrieveJob.postedData = body;

    log.debug('vler-das-notification-endpoint.createAndPublishVlerDasDocRetrieveJob: Publishing job.  vlerDasDocRetrieveJob: %j', vlerDasDocRetrieveJob);
    environment.publisherRouter.publish(vlerDasDocRetrieveJob, callback);
}

//-------------------------------------------------------------------------------------
// This function extracts the ICN value from the request object.
//
// request: The data posted to the resource.
// returns: ICN of the patient.
//-------------------------------------------------------------------------------------
function extractIcn(request) {
    if (!_.get(request, 'body.criteria', null)) {
        return null;
    }

    const criteria = request.body.criteria;
    const query = qs.parse(_.last(criteria.split('DocumentReference?')));
    const icn = query['subject:Patient.identifier'] || query['subject.Patient.identifier'];

    return icn;

}

//-------------------------------------------------------------------------------------
// This method retrieves the referenceInfo from the vler-das-subscribe-request job
// status record and returns it in the callback.
//
// icn: The icn of the patient.
// log: The logger to use to log messages.
// environment: The environment containing our shared code.
// callback:  The callback function to call after the referenceInfo has been retrieved.
//            function (error, retrieveVlerDasSubscribeJobStatus) where:
//               error:  The error if one occurs (or null)
//               retrieveVlerDasSubscribeJobStatus: The job status for the
//                                                  vler-das-subscribe-request job.
//-------------------------------------------------------------------------------------
function retrieveVlerDasSubscribeReqeustJobStatus(icn, log, environment, callback) {
    const filterOnlyVlerDasSubscribeRequest = {
        filter: '?filter=eq(\"type\",\"vler-das-subscribe-request\")'
    };
    const job = {
        patientIdentifier: idUtil.create('icn', icn)
    };
    environment.jds.getJobStatus(job, filterOnlyVlerDasSubscribeRequest, function(error, response, result) {
        log.debug('vler-das-notification-endpoint.retrieveVlerDasSubscribeJobStatus: Received vler-das-subscribe-request job status from JDS: error: %s; response: %j; result: %j ', error, response, result);
        if (error) {
            log.error('vler-das-notification-endpoint.retrieveVlerDasSubscribeJobStatus: Error occurred retrieving vler-das-subscribe-request job history. ' +
                      'Downstream jobs will not have referenceInfo and other root level fields.  error: %s; job: %j; ', error, job);
            return callback(null, null);		// This is not fatal - we do not want to stop processing things... It just means we have no reference information on the trailing jobs..
        }

        // We should have only 1 item...  But we better check... If we get more - then just use the first one.
        //-----------------------------------------------------------------------------------------------------
        let vlerDasSubscribeRequestJobStatus = null;
        if ((_.isObject(result)) && (_.isArray(result.items)) && (result.items.length >= 1)) {
            if (result.items.length > 1)  {
                log.warn('vler-das-notification-endpoint.retrieveVlerDasSubscribeJobStatus: Received extra vler-das-subscribe-request status values for this patient.  Using the first one only.  result: %j', result);
            }
            vlerDasSubscribeRequestJobStatus = result.items[0];
        }

        return callback(null, vlerDasSubscribeRequestJobStatus);
    });
}

module.exports = registerVlerDasNotifyAPI;
module.exports._handleVlerDasNotificationPost = handleVlerDasNotificationPost;
module.exports._createAndPublishVlerDasDocRetrieveJob = createAndPublishVlerDasDocRetrieveJob;
module.exports._extractIcn = extractIcn;
module.exports._retrieveVlerDasSubscribeReqeustJobStatus = retrieveVlerDasSubscribeReqeustJobStatus;
