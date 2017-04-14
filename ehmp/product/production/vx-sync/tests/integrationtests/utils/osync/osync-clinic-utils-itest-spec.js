'use strict';

require('../../../../env-setup');

var _ = require('underscore');
var val = require(global.VX_UTILS + 'object-utils').getProperty;
var log = require(global.VX_DUMMIES + '/dummy-logger');
// NOTE: be sure next lines are commented out before pushing
// var logUtil = require(global.VX_UTILS + 'log');
// log = logUtil._createLogger({
// 	name: 'test',
// 	level: 'debug',
// 	child: logUtil._createLogger
// });

var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var PjdsClient = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');
var OsyncClinicUtils = require(global.VX_UTILS + 'osync/osync-clinic-utils');

var config = JSON.parse(JSON.stringify(require(global.VX_ROOT + 'worker-config')));

var getBeanstalkConfig = require(global.VX_INTTESTS + 'framework/handler-test-framework').getBeanstalkConfig;
var updateTubenames = require(global.VX_INTTESTS + 'framework/handler-test-framework').updateTubenames;
var getTubenames = require(global.VX_INTTESTS + 'framework/handler-test-framework').getTubenames;
var clearTubes = require(global.VX_INTTESTS + 'framework/handler-test-framework').clearTubes;
var grabJobs = require(global.VX_INTTESTS + 'framework/job-grabber');

var BeanstalkClient = require(global.VX_JOBFRAMEWORK).BeanstalkClient;
var host = require(global.VX_INTTESTS + 'test-config');
var port = 5000;

var PublisherRouter = require(global.VX_JOBFRAMEWORK).PublisherRouter;

function buildEnvironment(log, config) {
	return {
		jds: new JdsClient(log, log, config),
		pjds: new PjdsClient(log, log, config),
		jobStatusUpdater: {
			createJobStatus: function(job, callback) {
				callback();
			},
			errorJobStatus: function(job, error, callback) {
				callback();
			}
		}
	};
}

var beanstalkConfig = getBeanstalkConfig(config, host, port, tubePrefix + '-' + jobType);
updateTubenames(beanstalkConfig);

tubenames = getTubenames(beanstalkConfig, [jobType]);

config.beanstalk = beanstalkConfig;

var site1 = 'ABAB';
var clinic1 = {
	name: 'TEST1',
	type: 'Z',
	site: 'ABAB',
	oos: false,
	stampTime: '20161107151143',
	uid: 'urn:va:location:ABAB:100'
};

var clinic2 = {
	name: 'TEST2',
	type: 'Z',
	site: 'ABAB',
	oos: false,
	stampTime: '20161107151143',
	uid: 'urn:va:location:ABAB:121'
};

var site2 = 'BABA';
var clinic3 = {
	name: 'TEST3',
	type: 'Z',
	site: 'BABA',
	oos: false,
	stampTime: '20161107151143',
	uid: 'urn:va:location:BABA:10'
};

var numericSite = 1234;
var clinic4 = {
	name: 'TESTNUMERIC',
	type: 'Z',
	site: '1234',
	oos: false,
	stampTime: '20161107151143',
	uid: 'urn:va:location:1234:10'
};

var tubePrefix = 'osync-clinic-utils-test';
var jobType = 'appointments';
var tubenames;

describe('osync-clinic-utils integration test', function() {
	beforeEach(function() {
		var done = 0;
		var jds = new JdsClient(log, log, config);
		var environment = buildEnvironment(log, config);
		var osyncClinicUtil = new OsyncClinicUtils(log, config, environment);

		runs(function() {
			_.each([clinic1, clinic2, clinic3, clinic4], function(clinic) {
				jds.storeOperationalData(clinic, function(error, response) {
					expect(error).toBeFalsy();
					expect(response).toBeTruthy();
					expect(val(response, 'statusCode')).toEqual(201);
					done++;
				});
			});

			osyncClinicUtil.osyncClinicRemove(site1 + ',' + site2 + ',' + numericSite, null, function(error, response) {
				//Will return an error if the clinic does not exist
				done++;
			});
		});

		waitsFor(function() {
			return done === 5;
		},'setup to complete');
	});

	it('osyncClinicAdd, osyncClinicGet, osyncClinicRun, osyncClinicRemove', function() {
		var environment = buildEnvironment(log, config);
		environment.beanstalk = new BeanstalkClient(log, host, config.beanstalk.repoDefaults.port);
		environment.publisherRouter = new PublisherRouter(log, config, log, environment.jobStatusUpdater);
		var osyncClinicUtil = new OsyncClinicUtils(log, config, environment);

		var osyncClinicAddDone = 0;
		runs(function() {
			//osyncClinicAdd - by uid - override
			//							   site clinic uid          type override
			osyncClinicUtil.osyncClinicAdd(null, null, clinic1.uid, null, true, function(error, result) {
				expect(error).toBeFalsy();
				expect(result).toContain('UID ' + clinic1.uid + ' added to osynclinic store');
				osyncClinicAddDone++;
			});

			//osyncClinicAdd - by uid - no override
			//							   site clinic uid         type override
			osyncClinicUtil.osyncClinicAdd(null, null, clinic2.uid, 'Z', false, function(error, result) {
				expect(error).toBeFalsy();
				expect(result).toContain('UID ' + clinic2.uid + ' added to osynclinic store');
				osyncClinicAddDone++;
			});

			//osyncClinicAdd - by site and clinic
			//							   site    clinic       uid   type override
			osyncClinicUtil.osyncClinicAdd(site2, clinic3.name, null, 'Z', false, function(error, result) {
				expect(error).toBeFalsy();
				expect(result).toContain('UID ' + clinic3.uid + ' added to osynclinic store');
				osyncClinicAddDone++;
			});

			//osyncClinicAdd - by site and clinic (all-numeric site hash)
			//							   site    clinic       uid   type override
			osyncClinicUtil.osyncClinicAdd(numericSite, clinic4.name, null, 'Z', false, function(error, result) {
				expect(error).toBeFalsy();
				expect(result).toContain('UID ' + clinic4.uid + ' added to osynclinic store');
				osyncClinicAddDone++;
			});
		});
		waitsFor(function() {
			return osyncClinicAddDone === 4;
		}, 'osyncClinicAddDone');

		var osyncClinicGetDone = 0;
		runs(function() {
			//osyncClinicGet - single site
			osyncClinicUtil.osyncClinicGet(site1, function(error, response, result) {
				expect(error).toBeFalsy();
				expect(response).toBeTruthy();
				expect(result).toContain(clinic1.uid);
				expect(result).toContain(clinic2.uid);
				osyncClinicGetDone++;
			});

			//osyncClinicGet - multi site
			osyncClinicUtil.osyncClinicGet(site1 + ',' + site2, function(error, response, result) {
				expect(error).toBeFalsy();
				expect(response).toBeTruthy();
				expect(result).toContain(clinic1.uid);
				expect(result).toContain(clinic2.uid);
				expect(result).toContain(clinic3.uid);
				osyncClinicGetDone++;
			});

			//osyncClinicGet - numeric site
			osyncClinicUtil.osyncClinicGet(numericSite, function(error, response, result) {
				expect(error).toBeFalsy();
				expect(response).toBeTruthy();
				expect(result).toContain(clinic4.uid);
				osyncClinicGetDone++;
			});
		});
		waitsFor(function() {
			return osyncClinicGetDone === 3;
		}, 'osyncClinicGetDone');

		var osyncClinicRunByUidDone = false;
		runs(function() {
			//osyncClinicRun - by uid
			//						       site  uid
			osyncClinicUtil.osyncClinicRun(null, clinic3.uid, function(error, response) {
				expect(error).toBeFalsy();
				expect(response).toContain('Published');

				if (error) {
					osyncClinicRunByUidDone = true;
					return;
				}

				grabJobs(log, host, port, tubenames, 0, function(error, jobs) {
					expect(error).toBeFalsy();

					var resultJobTypes = _.chain(jobs).map(function(result) {
						return result.jobs;
					}).flatten().pluck('type').value();

					expect(val(resultJobTypes, 'length')).toEqual(1);
					expect(resultJobTypes).toContain(jobType);

					osyncClinicRunByUidDone = true;
					return;
				});
			});
		});
		waitsFor(function() {
			return osyncClinicRunByUidDone;
		}, 'osyncClinicRunByUidDone');

		var osyncClinicRunBySiteDone = false;
		runs(function() {
			//osyncClinicRun - by site
			//						       site  uid
			osyncClinicUtil.osyncClinicRun(site1, null, function(error, response) {
				expect(error).toBeFalsy();
				expect(response).toContain('published');

				if (error) {
					osyncClinicRunBySiteDone = true;
					return;
				}

				grabJobs(log, host, port, tubenames, 0, function(error, jobs) {
					expect(error).toBeFalsy();

					var resultJobTypes = _.chain(jobs).map(function(result) {
						return result.jobs;
					}).flatten().pluck('type').value();

					expect(val(resultJobTypes, 'length')).toEqual(2);
					expect(resultJobTypes).toContain(jobType);

					osyncClinicRunBySiteDone = true;
					return;
				});
			});
		});
		waitsFor(function() {
			return osyncClinicRunBySiteDone;
		}, 'osyncClinicRunBySiteDone');

		var osyncClinicRunByNumericSiteDone = false;
		runs(function() {
			//osyncClinicRun - by site
			//						       site  uid
			osyncClinicUtil.osyncClinicRun(numericSite, null, function(error, response) {
				expect(error).toBeFalsy();
				expect(response).toContain('published');

				if (error) {
					osyncClinicRunByNumericSiteDone = true;
					return;
				}

				grabJobs(log, host, port, tubenames, 0, function(error, jobs) {
					expect(error).toBeFalsy();

					var resultJobTypes = _.chain(jobs).map(function(result) {
						return result.jobs;
					}).flatten().pluck('type').value();

					expect(val(resultJobTypes, 'length')).toEqual(1);
					expect(resultJobTypes).toContain(jobType);

					osyncClinicRunByNumericSiteDone = true;
					return;
				});
			});
		});
		waitsFor(function() {
			return osyncClinicRunByNumericSiteDone;
		}, 'osyncClinicRunByNumericSiteDone');

		var osyncClinicRemoveDone = 0;
		runs(function() {
			//osyncClinicRemove - by uid
			osyncClinicUtil.osyncClinicRemove(null, clinic3.uid, function(error, response) {
				expect(error).toBeFalsy();
				expect(response).toBeTruthy();
				osyncClinicRemoveDone++;
			});
			//osyncClinicRemove - by site
			osyncClinicUtil.osyncClinicRemove(site1, null, function(error, response) {
				expect(error).toBeFalsy();
				expect(response).toBeTruthy();
				osyncClinicRemoveDone++;
			});
			//osyncClinicRemove - by site - numeric
			osyncClinicUtil.osyncClinicRemove(numericSite, null, function(error, response) {
				expect(error).toBeFalsy();
				expect(response).toBeTruthy();
				osyncClinicRemoveDone++;
			});
		});
		waitsFor(function() {
			return osyncClinicRemoveDone === 3;
		}, 'osyncClinicRemoveDone');

		var verifyClinicRemoved = 0;
		runs(function() {
			//Verify clinic was removed
			osyncClinicUtil.osyncClinicGet(site2, function(error, response, result) {
				expect(error).toBeFalsy();
				expect(response).toBeTruthy();
				expect(result).not.toContain(clinic3.uid);
				verifyClinicRemoved++;
			});
			//Verify clinics were removed
			osyncClinicUtil.osyncClinicGet(site1, function(error, response, result) {
				expect(error).toBeFalsy();
				expect(response).toBeTruthy();
				expect(result).not.toContain(clinic1.uid);
				expect(result).not.toContain(clinic2.uid);
				verifyClinicRemoved++;
			});
			//Verify numeric site clinic was removed
			osyncClinicUtil.osyncClinicGet(numericSite, function(error, response, result) {
				expect(error).toBeFalsy();
				expect(response).toBeTruthy();
				expect(result).not.toContain(clinic4.uid);
				verifyClinicRemoved++;
			});
		});
		waitsFor(function() {
			return verifyClinicRemoved === 3;
		}, 'verifyClinicRemoved');
		runs(function(){
			environment.publisherRouter.close();
		});
	});

	afterEach(function(){
		//Clean up after testing
		log.debug('patient-record-retirement-util-itest-spec: Cleaning up...');

		var jds = new JdsClient(log, log, config);
		var cleared = 0;

		grabJobs(log, host, port, tubenames, 0, function() {
			cleared++;
			log.debug('patient-record-retirement-util-itest-spec: **** grabJobs callback was called.');
		});

		clearTubes(log, host, port, tubenames, function() {
			cleared++;
			log.debug('patient-record-retirement-util-itest-spec: **** clearTube callback was called.');
		});

		_.each([clinic1.uid, clinic2.uid, clinic3.uid, clinic4.uid], function(uid) {
			jds.deleteOperationalDataByUid(uid, function(error, response) {
				expect(error).toBeFalsy();
				expect(response).toBeTruthy();
				expect(val(response, 'statusCode')).toEqual(200);
				cleared++;
			});
		});

		waitsFor(function() {
			return cleared === 6;
		}, 'clean up timed out', 10000);

		runs(function() {
			log.debug('patient-record-retirement-util-itest-spec: **** test complete.');
		});
	});
});