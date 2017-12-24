'use strict';
const _ = require('lodash');
const errorUtil = require(global.VX_UTILS + 'error');
const loadPatient = require(global.VX_HANDLERS + 'resync-request/load-patient');
const jobUtils = require(global.VX_UTILS + 'job-utils');
const idUtils = require(global.VX_UTILS + 'patient-identifier-utils');
const util = require('util');

function handle(log, config, environment, job, handlerCallback) {
	log.debug('sync-notification-handler.handle(): Entering method with job %j', job);

	if (!_.has(job, 'patientIdentifier')) {
	    let errorMessage = util.format('Invalid job: missing patientIdentifier. job: %j', job);
		log.error('sync-notification-handler.handle(): %s', errorMessage);
		return setTimeout(handlerCallback, 0, errorUtil.createFatal(errorMessage, job));
	}

	loadPatient(log, config.syncRequestApi, job, function(error) {
		if (error) {
		    let errorMessage = util.format('loadPatient returned error: %s', error);
			log.error('sync-notification-handler.handle(): %s', errorMessage);
			return handlerCallback(errorUtil.createTransient(errorMessage, job));
		}

		retrieveIcn(log, environment, job, function(error, icn) {
		    if (error) {
		        return handlerCallback(error);
            }

            publishVxDataChangeJob(log, environment, job, icn, handlerCallback);
        });
    });
}


//------------------------------------------------------------------------------------------------------------
// This function will publish the job.
//
// log: The bunyan logger to log messages to.
// environment: The shared environment object.
// job: The job that was received.
// icn: the icn of the patient.
// callback: The callback handler that is called when this is complete.  Its signature will be:
//        function (error):
//           where: Error is an error that occurred
//------------------------------------------------------------------------------------------------------------
function publishVxDataChangeJob(log, environment, job, icn, callback) {
    const meta = {
        jpid: job.jpid,
        rootJobId: job.rootJobId,
        priority: job.priority,
        param: job.param
    };

    if (job.referenceInfo) {
        meta.referenceInfo = job.referenceInfo;
    }

    if (icn) {
        if (!job.record) {
            job.record = {};
        }
        job.record.icn = icn;
    }

    const jobToPublish = jobUtils.createPublishVxDataChange(job.patientIdentifier, job.dataDomain, job.record, meta);

    log.debug('sync-notification-handler.publishVxDataChangeJob(): Publishing job: %j', jobToPublish);
    return environment.publisherRouter.publish(jobToPublish, callback);
}

//-----------------------------------------------------------------------------------------------------------
// This function returns the ICN for the given patientIdentifier.  It tries to first obtain it from JDS.  If
// it is not there - it will try to get it from Vista.
//
// log: The bunyan logger to log messages to.
// environment: The shared environment object.
// job: The job that was received.
// callback: The callback handler that is called when this is complete.  Its signature will be:
//        function (error, icn):
//           where: Error is an error that occurred
//                  icn: is the icn of the patient.
//------------------------------------------------------------------------------------------------------------
function retrieveIcn(log, environment, job, callback) {
    log.debug('sync-notification-handler.retrieveIcn: Retrieving ICN for job: %j', job);

    const patientIdentifier = job.patientIdentifier;

    // It should never happen - but if it does happen that the icn is in the patientIdentifier - then return
    // it and get out of here...
    //------------------------------------------------------------------------------------------------------
    if ((patientIdentifier.type === 'icn') && (patientIdentifier.value)) {
        return setTimeout(callback, 0, null, patientIdentifier.value);
    }

    // If we do not have a valid patientIdentifier PID, then return with an error.
    //-----------------------------------------------------------------------------
    if ((patientIdentifier.type !== 'pid') || (! patientIdentifier.value)) {
        const errorMessage = util.format('The job did not contain a patientIdentifier with a valid pid.  patientIdentifier: %j', patientIdentifier);
        log.error('sync-notification-handler.retrieveIcn: %s', errorMessage);
        return setTimeout(callback, 0, errorUtil.createFatal(errorMessage, job), null);
    }

    environment.jds.getPatientIdentifier(job, function (error, response, result) {
        if (error) {
            const errorMessage = util.format('Error occurred retrieving identifiers from JDS.  error: %j', error);
            log.error('sync-notification-handler.retrieveIcn: %s', errorMessage);
            return callback(errorUtil.createTransient(errorMessage, job));
        }

        // If we have the ICN in JDS Identifiers, then get it and we are done.
        //--------------------------------------------------------------------
        const statusCode = (response) ? _.get(response, 'statusCode', 0) : 0;
        if ((statusCode === 200) && (result)) {
            const patientIdentifiers = _.get(result, 'patientIdentifiers', []);
            const icn = _.find(patientIdentifiers, function(patientIdentifier) {
                return idUtils.isIcn(patientIdentifier);
            });
            if (icn) {
                log.debug('sync-notification-handler.retrieveIcn: Found ICN in JDS. patientIdentifier: %j icn: %s', job.patientIdentifier, icn);
                return callback(null, icn);
            }
        }

        // If we got here - we did not find the ICN in JDS - so we need to get it from Vista.
        //------------------------------------------------------------------------------------
        return retrieveIcnFromVista(log, environment, job, callback);

    });
}

//-----------------------------------------------------------------------------------------------------------
// This function returns the ICN for the given patientIdentifier by making an RPC call to Vista.
//
// log: The bunyan logger to log messages to.
// environment: The shared environment object.
// job: The job that was received.
// callback: The callback handler that is called when this is complete.  Its signature will be:
//        function (error, icn):
//           where: Error is an error that occurred
//                  icn: is the icn of the patient.
//------------------------------------------------------------------------------------------------------------
function retrieveIcnFromVista(log, environment, job, callback) {
    const patientIdentifier = job.patientIdentifier;

    // If we do not have a valid patientIdentifier PID, then return with an error.
    //-----------------------------------------------------------------------------
    if ((patientIdentifier.type !== 'pid') || (! patientIdentifier.value)) {
        log.error('sync-notification-handler.retrieveIcnFromVista: The job did not contain a patientIdentifier with a valid pid.  patientIdentifier: %j', patientIdentifier);
        return setTimeout(callback, 0, errorUtil.createFatal('The job did not contain a patientIdentifier with a valid pid.', job), null);
    }

    const siteHash = idUtils.extractSiteFromPid(patientIdentifier.value);
    const dfn = idUtils.extractDfnFromPid(patientIdentifier.value);

    environment.vistaClient.getDemographics(siteHash, dfn, function(error, result){
        if (error) {
            const errorMessage = util.format('Error occurred retrieving identifiers from Vista.  siteHash: %s; dfn: %s; error: %j', siteHash, dfn, error);
            log.error('sync-notification-handler.retrieveIcnFromVista: %s', errorMessage);
            return callback(errorUtil.createTransient(errorMessage, job));
        }

        if ((result) && (result.icn)) {
            log.debug('sync-notification-handler.retrieveIcnFromVista: Retrieved ICN from Vista. pid: %s icn: %s', patientIdentifier.value, result.icn);
            return callback(null, result.icn);
        }

        // If we got here - there was no ICN in the record...
        //---------------------------------------------------
        log.debug('sync-notification-handler.retrieveIcnFromVista: Vista did not have ICN for patient. pid: %s icn: %s', patientIdentifier.value, result.icn);
        return callback(null, null);

    });

}

module.exports = handle;
module.exports._publishVxDataChangeJob = publishVxDataChangeJob;
module.exports._retrieveIcn = retrieveIcn;
module.exports._retrieveIcnFromVista = retrieveIcnFromVista;