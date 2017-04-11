'use strict';

//----------------------------------------------------------------------------------------------------
// This file is an event prioritization rule that prioritizes the job based on the domain of the data.
// Certain domains may increaase or decrease the priority.  These settings are defined in
// worker-config.json.
//
// Author: Les Westberg
//----------------------------------------------------------------------------------------------------


var _ = require('underscore');
var objUtil = require(global.VX_UTILS + 'object-utils');

var PRIORITY_DEFAULT = 1;

//----------------------------------------------------------------------------------------------------
//  This method is the prioritization rule for domain-type.
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
	log.debug('domain-type-rule.prioritize: Entered function.   job: %j', job);

	// If we have no job - there is nothing to do.  Get out.
	//-------------------------------------------------------
	if (!_.isObject(job)) {
        log.warn('domain-type-rule.prioritize: Function called with no job.  No change in priority for this job.  job: %j', job);
		return ruleCallback(null, job);
	}

	var dataDomain = objUtil.getProperty(job, 'dataDomain');
	if ((!_.isString(dataDomain)) || (_.isEmpty(dataDomain))) {
    	log.warn('domain-type-rule.prioritize: Failed to extract dataDomain from job. No change in priority based on domain for this job.  job: %j', job);
    	return ruleCallback(null, job);
	}

    // Priority should already be set - but if it is not - then set it to default now.
    //----------------------------------------------------------------------------------
    if (!_.isNumber(job.priority)) {
    	job.priority = PRIORITY_DEFAULT;
    }

	// Find the configuration for the domain-type-rule.
	//--------------------------------------------------
	var domainConfig = objUtil.getProperty(config, 'eventPrioritizationRules', 'domain-type');
	if ((_.isNull(domainConfig)) || (_.isUndefined(domainConfig))) {
    	log.warn('domain-type-rule.prioritize: Failed to find any domain-type rule configuration in worker-config.json. No change in priority based on domain for this job.  job: %j', job);
    	return ruleCallback(null, job);
	}

	// If we got here - we have a dataDomain and we have configuration information for the domain-type rule.  So now lets get the information we need.
	//-------------------------------------------------------------------------------------------------------------------------------------------------
	var domainAdjust = domainConfig[dataDomain];
	if (_.isNumber(domainAdjust)) {
		job.priority += domainAdjust;
	}

	fixPriorityRange(job);

	return ruleCallback(null, job);
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


module.exports = prioritize;
prioritize._internalFunctions = {
    '_fixPriorityRange': fixPriorityRange
};