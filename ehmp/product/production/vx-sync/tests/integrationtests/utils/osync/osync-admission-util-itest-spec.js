'use strict';

require('../../../../env-setup');

var _ = require('underscore');
var moment = require('moment');

var logger = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next lines are commented out before pushing
// var logUtil = require(global.VX_UTILS + 'log');
// logger = logUtil._createLogger({
//     name: 'test',
//     level: 'debug',
//     child: logUtil._createLogger
// });

var OsyncAdmissionUtil = require(global.VX_UTILS + 'osync/osync-admission-util');

var getBeanstalkConfig = require(global.VX_INTTESTS + 'framework/handler-test-framework').getBeanstalkConfig;
var updateTubenames = require(global.VX_INTTESTS + 'framework/handler-test-framework').updateTubenames;
var getTubenames = require(global.VX_INTTESTS + 'framework/handler-test-framework').getTubenames;
var clearTubes = require(global.VX_INTTESTS + 'framework/handler-test-framework').clearTubes;
var grabJobs = require(global.VX_INTTESTS + 'framework/job-grabber');
//var wConfig = require(global.VX_ROOT + 'worker-config');
var val = require(global.VX_UTILS + 'object-utils').getProperty;
var PublisherRouter = require(global.VX_JOBFRAMEWORK).PublisherRouter;

var testConfig = require(global.VX_INTTESTS + 'test-config');
var host = testConfig.vxsyncIP;
var port = PORT;

var tubePrefix = 'osync-admission-util-itest';
var jobType = 'admissions';
var tubenames;
var publisherRouter;

function cleanUpTubes() {
	logger.debug('osync-admission-util-itest-spec: Cleaning up...');
	if (publisherRouter) {
		publisherRouter.close();
	}

	var cleared = 0;

	grabJobs(logger, host, port, tubenames, 0, function() {
		cleared++;
		logger.debug('osync-admission-util-itest-spec: **** grabJobs callback was called.');
	});

	clearTubes(logger, host, port, tubenames, function() {
		cleared++;
		logger.debug('osync-admission-util-itest-spec: **** clearTube callback was called.');
	});

	waitsFor(function() {
		return cleared === 2;
	}, 'clear jobs timed out', 10000);

	runs(function() {
		logger.debug('osync-admission-util-itest-spec: **** test complete.');
	});
}

var referenceInfo = {
	sessionId: 'TEST',
	utilityType: 'osync-admission'
};

describe('osynnc-admission-util itest', function() {
	it('verify job is created', function(done) {
		var config = {};

		var beanstalkConfig = getBeanstalkConfig(config, host, port, tubePrefix + '-' + jobType);
		updateTubenames(beanstalkConfig);

		tubenames = getTubenames(beanstalkConfig, [jobType]);

		config.beanstalk = beanstalkConfig;

		var jobStatusUpdater = {
			createJobStatus: function(job, callback) {
				callback();
			},
			errorJobStatus: function(job, error, callback) {
				callback();
			}
		};

		var environment = {
			publisherRouter: new PublisherRouter(logger, config, logger, jobStatusUpdater)
		};

		publisherRouter = environment.publisherRouter;

		runs(function() {
			var sites = ['AAAA', 'BBBB'];
			var osyncAdmissionUtil = new OsyncAdmissionUtil(logger, config, environment);

			osyncAdmissionUtil.createAndPublishAdmissionsJob(sites, referenceInfo, function(error) {
				expect(error).toBeFalsy();

				if (error) {
					return done();
				}

				grabJobs(logger, host, port, tubenames, 1, function(error, jobs) {
					expect(error).toBeFalsy();

					var resultJobTypes = _.chain(jobs).map(function(result) {
						return result.jobs;
					}).flatten().pluck('type').value();

					expect(val(resultJobTypes, 'length')).toEqual(2);
					expect(resultJobTypes).toContain(jobType);

					var resultJobReferenceInfo = _.map(val(jobs, ['0', 'jobs']), function(job) {
						return job.referenceInfo;
					});

					expect(resultJobReferenceInfo.length).toEqual(2);
					_.each(resultJobReferenceInfo, function(item) {
						expect(item).toEqual(jasmine.objectContaining(referenceInfo));
					});

					done();
				});
			});
		});
	});
	afterEach(function() {
		cleanUpTubes();
	});
});