'use strict';
require('../../../../env-setup');
var _ = require('underscore');

var log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
// 	name: 'osync-admission-util-spec',
// 	level: 'debug'
// });

var OsyncAdmissionUtil = require(global.VX_UTILS + 'osync/osync-admission-util');

describe('OsyncAdmissionUtil', function() {
	var config = {};
	describe('createAndPublishAdmissionsJob', function() {
		it('verify referenceInfo is passed into created job', function(done) {
			var resultJobs = [];
			var environment = {
				publisherRouter: {
					publish: function(jobs, callback) {
						resultJobs = jobs;
						callback();
					}
				}
			};

			var sites = ['AAAA', 'BBBB'];

			var referenceInfo = {
				sessionId: 'TEST',
				utilityType: 'osync-admission-run'
			};

			var osyncAdmissionUtil = new OsyncAdmissionUtil(log, config, environment);

			osyncAdmissionUtil.createAndPublishAdmissionsJob(sites, referenceInfo, function(error) {
				expect(error).toBeFalsy();
				expect(_.isArray(resultJobs)).toBe(true);
				expect(resultJobs.length).toBe(2);
				expect(resultJobs).toContain(jasmine.objectContaining({
					'type': 'admissions',
					'siteId': 'AAAA',
					'referenceInfo': jasmine.objectContaining(referenceInfo)
				}));
				expect(resultJobs).toContain(jasmine.objectContaining({
					'type': 'admissions',
					'siteId': 'BBBB',
					'referenceInfo': jasmine.objectContaining(referenceInfo)
				}));
				done();
			});
		});

		it('Error path: callback with error', function(done){
			var environment = {
				publisherRouter: {
					publish: function(jobs, callback) {
						callback('Error!');
					}
				}
			};

			var sites = ['AAAA', 'BBBB'];

			var osyncAdmissionUtil = new OsyncAdmissionUtil(log, config, environment);

			osyncAdmissionUtil.createAndPublishAdmissionsJob(sites, null, function(error) {
				expect(error).toBeTruthy();
				done();
			});
		});
	});
});