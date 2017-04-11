'use strict';

//----------------------------------------------------------------------------------------------------
// This file is an event prioritization rule that prioritizes the job based on the site associated
// with the data.   If the site associated with the daa is the same as the site that triggered the
// sync of the patient, then this is highest priority - it should kee the priority that was passed in,
// if it is another VistA site, it will drop slightly in priority, if it is from a secondary site, it
// will drop again.  (Basically it will spread the priority so that it is processed in three separate
// record enrichment tubes.)
//
// NOTE: site-type-rule MUST BE THE FIRST RULE IN THE SET OF RULES...  It will do the work to go back
// and pick up any priority and my-site infomration  from the sync status that may have been dropped
// along the way
//
// Author: Les Westberg
//----------------------------------------------------------------------------------------------------

var _ = require('underscore');
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var objUtil = require(global.VX_UTILS + 'object-utils');

var PRIORITY_DEFAULT = 1;
var LEVEL_ADJUST_MY_SITE = 0;
var LEVEL_ADJUST_OTHER_VISTA_SITE = 20;
var LEVEL_ADJUST_OTHER_SECONDARY_SITE = 40;

//----------------------------------------------------------------------------------------------------
//  This method is the prioritization rule for site-type.
//
// log: The bunyan logger
// config: The configuration as defined by worker-config.json.
// environment: This contains handles to common utilities and services used across VX-Sync.
// job: The record enrichment job to be prioritized.
// ruleCallback: The callback to call when the prioritization is done.
//   Method Signature: function(err, resultJob)
//     where:  err is an error if one occurs
//             resuiltJob: is the job with the modified priority field.
//----------------------------------------------------------------------------------------------------
function prioritize(log, config, environment, job, ruleCallback) {
	log.debug('site-type-rule.prioritize: Entered function.   job: %j', job);

	// If we have no job - there is nothing to do.  Get out.
	//-------------------------------------------------------
	if (!_.isObject(job)) {
        log.warn('site-type-rule.prioritize: Function called with no job.  No change in priority for this job.  job: %j', job);
		return ruleCallback(null, job);
	}

    var jobSite = extractSite(job);

    // If our job does not even have a site, then we really have nothing we can do here... There is no site to prioritize against.
    //-----------------------------------------------------------------------------------------------------------------------------
    if (_.isEmpty(jobSite)) {
    	log.debug('site-type-rule.prioritize: Failed to extract site from job.patientIdentifier. No change in priority for this job.  job: %j', job);
    	return ruleCallback(null, job);
    }

    // Priority should already be set - but if it is not - then set it to default now.
    //----------------------------------------------------------------------------------
    if (!_.isNumber(job.priority)) {
    	job.priority = PRIORITY_DEFAULT;
    }

	var filterOnlyEnterpriseSyncReq = {
		filter: '?filter=ilike(\"type\",\"enterprise-sync-request\")'
	};
    environment.jds.getJobStatus(job, filterOnlyEnterpriseSyncReq, function(error, response, result) {
    	log.debug('site-type-rule.prioritize: Received enterprise-sync-request job status from JDS: error: %s; response: %j; result: %j ', error, response, result);
        if (error) {
            log.error('site-type-rule.prioritize: Error occurred retrieving enterprise-sync-request job history. error: %s; job: %j; ', error, job);
            return ruleCallback(null, job);		// This is not fatal - we do not want to stop processing things... Worst case it will stay at its original priority.
        }

        // We should have only 1 item...  But we better check... If we get more - then just use the first one.
        //-----------------------------------------------------------------------------------------------------
        var enterpriseSyncStatus = null;
        if ((_.isObject(result)) && (_.isArray(result.items)) && (result.items.length >= 1)) {
        	if (result.items.length > 1)  {
        		log.warn('site-type-rule.prioritize: Received extra enterprise-sync-request status values for this patient.  Using the first one only.  result: %j', result);
        	}
    		enterpriseSyncStatus = result.items[0];
        }

        var initialSite = extractSite(enterpriseSyncStatus);
        var initialPriority = objUtil.getProperty(enterpriseSyncStatus, 'priority');

        // Need to see what enterprise-sync-request thought the initial priority was.  If that is different that what we have now... We need to set it back to that value.
        // There are cases where we cannot propagate the original priority through all handlers to here, and we must go back and get it from there and reset it.
        //-----------------------------------------------------------------------------------------------------------------------------------------------------------------
        if ((initialPriority) && (initialPriority !== job.priority)) {
        	job.priority = initialPriority;
        	fixPriorityRange(job);
        }

        var siteIsPrimary  = idUtil.isVistaDirectSitePid(job.patientIdentifier, config);
        var siteIsVistA = siteIsPrimary || idUtil.isHdr(job.patientIdentifier.value, config);

    	log.debug('site-type-rule.prioritize:  Values used to determine priority. initialSite: %s; jobSite: %s; siteIsPrimary: %s; siteIsVistA: %s ', initialSite, jobSite, siteIsPrimary, siteIsVistA);

        if ((!_.isEmpty(initialSite)) && (siteIsPrimary) && (initialSite === jobSite)) {
        	job.priority += LEVEL_ADJUST_MY_SITE;
        }
        else if (siteIsVistA) {
        	job.priority += LEVEL_ADJUST_OTHER_VISTA_SITE;
        }
        else {							// This means we have a secondary site...
        	job.priority += LEVEL_ADJUST_OTHER_SECONDARY_SITE;
        }

        // Make sure we have not overflowed our boundaries.
        //-------------------------------------------------
        fixPriorityRange(job);

    	log.debug('site-type-rule.prioritize: Successfully exiting rule: %j ', job);

		return ruleCallback(null, job);
    });

}

//--------------------------------------------------------------------------------------------------------------
// This method checks the current settings for priority to make sure they are in range of valid values.
// If they are not - then it fixes them.
//
// job: The job to be checked.
//--------------------------------------------------------------------------------------------------------------
function fixPriorityRange(job) {
    if (job.priority < 1) {
    	job.priority = 1;
    }
    else if (job.priority > 100) {
    	job.priority = 100;
    }
}

//--------------------------------------------------------------------------------------------------------------
// This function extracts the site value from the patientIdentifier field.  It is assumed that the incoming
// object is either a job or a jobStatus object.
//
// jobOrJobStatus: This is either a job object or a job status object.
// return: Returns the site extracted from the patient identifier.
//--------------------------------------------------------------------------------------------------------------
function extractSite(jobOrJobStatus) {
	var site = null;
	if ((_.isObject(jobOrJobStatus)) && (_.isObject(jobOrJobStatus.patientIdentifier)) && (!_.isEmpty(jobOrJobStatus.patientIdentifier.value))) {
		site = idUtil.extractSiteFromPid(jobOrJobStatus.patientIdentifier.value);
	}

	return site;
}

module.exports = prioritize;
prioritize._internalFunctions = {
    '_extractSite': extractSite,
    '_fixPriorityRange': fixPriorityRange
};