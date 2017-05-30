'use strict';

require('../../env-setup');

var _ = require('underscore');

var jobUtil = require(global.OSYNC_UTILS + 'osync-job-utils');

function OsyncAdmissionUtil(log, config, environment) {
	if (!(this instanceof OsyncAdmissionUtil)) {
		return new OsyncAdmissionUtil(log, config);
	}
	this.log = log;
	this.config = config;
	this.environment = environment;
}

OsyncAdmissionUtil.prototype.createAndPublishAdmissionsJob = function(sites, referenceInfo, callback) {
	var self = this;
	self.log.debug('osync-admission-util.createAndPublishAdmissionsJob: entering method');

	var jobsToPublish = _.map(sites, function(site) {
		var meta = {
			siteId: site,
			referenceInfo: referenceInfo
		};

		if(referenceInfo){
			meta.referenceInfo = referenceInfo;
		}

		return jobUtil.createAdmissionsJob(self.log, meta);
	});

	self.log.debug('osync-admission-util.createAndPublishAdmissionsJob: publishing admission handler jobs for sites: %s', sites);
	self.environment.publisherRouter.publish(jobsToPublish, function(error) {
		if (error) {
			self.log.error('osync-admission-util: error publishing admission handler jobs: %j', error);
		} else {
			self.log.debug('osync-admission-util: admission handler jobs successfully published.');
		}

		callback(error);
	});
};

module.exports = OsyncAdmissionUtil;