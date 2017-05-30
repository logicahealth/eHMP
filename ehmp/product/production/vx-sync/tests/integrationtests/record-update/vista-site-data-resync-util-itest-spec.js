'use strict';

require('../../../env-setup');

var VistaResyncUtil = require(global.VX_ROOT + 'record-update/utils/vista-site-data-resync-util');
var log = require(global.VX_DUMMIES + '/dummy-logger');

// Be sure next lines are commented out before pushing
// var logUtil = require(global.VX_UTILS + 'log');
// log = logUtil._createLogger({
// 	name: 'vista-site-data-resync-util-itest',
// 	level: 'debug'
// });

var VistaClient = require(global.VX_SUBSYSTEMS + 'vista/vista-client');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var _ = require('underscore');

var val = require(global.VX_UTILS + 'object-utils').getProperty;
var syncAndWaitForPatient = require(global.VX_INTTESTS + 'framework/handler-test-framework').syncAndWaitForPatient;
var getBeanstalkConfig = require(global.VX_INTTESTS + 'framework/handler-test-framework').getBeanstalkConfig;
var updateTubenames = require(global.VX_INTTESTS + 'framework/handler-test-framework').updateTubenames;
var getTubenames = require(global.VX_INTTESTS + 'framework/handler-test-framework').getTubenames;
var clearTubes = require(global.VX_INTTESTS + 'framework/handler-test-framework').clearTubes;
var grabJobs = require(global.VX_INTTESTS + 'framework/job-grabber');
var moment = require('moment');

var host = require(global.VX_INTTESTS + 'test-config');

//Use the main vxsync beanstalk for testing, since the record-update environment is run separately
var port = PORT;

var wConfig = require(global.VX_ROOT + 'worker-config');
var config = {
	syncRequestApi: _.defaults({
		host: host
	}, wConfig.syncRequestApi),
	vistaSites: {
		'9E7A': _.clone(wConfig.vistaSites['9E7A'])
	},
	jds: _.clone(wConfig.jds)
};

var tubePrefix = 'vista-site-data-resync-util-test';
var jobType = 'record-update';
var tubenames;

/*
	*** Note ***
	This test requires a patient to be synced before it can test the utility.
	The patient used here is 9E7A;24.
	This patient will remain synced after the test runs.
 */

describe('VistaResyncUtil integration test', function() {
	it('Verify utility runs without error', function() {
		var pid = '9E7A;24';

		var pids = [pid];
		var sites = ['9E7A'];
		var updateTime = moment().format('YYYYMMDDHHmmss');
		var domains = ['vital'];
		var referenceInfo = {
			sessionId: 'Test',
			utilityType: 'Vista Site Data Resync Util Integration Test'
		};

		var vistaClient = new VistaClient(log, log, config, null);
		var jds = new JdsClient(log, log, config);

		syncAndWaitForPatient(log, config, pid);

		var beanstalkConfig = getBeanstalkConfig(config, host, port, tubePrefix + '-' + jobType);
		updateTubenames(beanstalkConfig);

		tubenames = getTubenames(beanstalkConfig, [jobType]);

		config.beanstalk = beanstalkConfig;

		var handlerDone = false;
		runs(function() {
			log.debug('vista-site-data-resync-util-itest-spec: now testing handler');
			var vistaResyncUtil = new VistaResyncUtil(log, vistaClient, jds, config, _.first(tubenames));

			vistaResyncUtil.runUtility(sites, pids, updateTime, domains, referenceInfo, function(error) {
				expect(error).toBeFalsy();

				if (error) {
					handlerDone = true;
					return;
				}

				grabJobs(log, host, port, tubenames, 2, function(error, jobs) {
					expect(error).toBeFalsy();
					expect(jobs).toBeTruthy();

					var resultJobTypes = _.chain(jobs).map(function(result) {
						return result.jobs;
					}).flatten().pluck('type').value();

					expect(val(resultJobTypes, 'length')).toBeGreaterThan(0);
					expect(resultJobTypes).toContain(jobType);

					//Check every job for referenceInfo
					_.each(val(jobs, ['0', 'jobs']), function(job) {
						expect(job.referenceInfo).toEqual(jasmine.objectContaining({
							sessionId: referenceInfo.sessionId,
							utilityType: referenceInfo.utilityType,
							requestId: jasmine.any(String)
						}));
					});

					handlerDone = true;
				});
			});
		});

		waitsFor(function() {
			return handlerDone;
		}, 'waiting for handler', 10000);
	});

	afterEach(function() {
		log.debug('vista-site-data-resync-util-itest-spec: Cleaning up...');

		var cleared = false;

		clearTubes(log, host, port, tubenames, function() {
			cleared = true;
			log.debug('vista-site-data-resync-util-itest-spec: **** clearTube callback was called.');
		});

		waitsFor(function() {
			return cleared;
		}, 'clear jobs timed out', 10000);

		runs(function() {
			log.debug('vista-site-data-resync-util-itest-spec: **** test complete.');
		});
	});
});