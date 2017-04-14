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

var PjdsClient = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var wConfig = require(global.VX_ROOT + 'worker-config');
var val = require(global.VX_UTILS + 'object-utils').getProperty;

var ActiveUserCleanupUtil = require(global.OSYNC_UTILS + 'active-user-cleanup-util');

describe('osync-active-user-list-util-itest-spec.js', function() {
	function setUpUsers(environment, pjdsUser, userScreenUser) {
		var pjdsDone = !pjdsUser;
		var jdsDone = !userScreenUser;

		runs(function() {
			if (!pjdsDone) {
				environment.pjds.addActiveUser(pjdsUser, function(error, response) {
					if (error) {
						expect(error).toBeFalsy();
					}

					expect(response.statusCode).toBe(201);
					pjdsDone = true;
				});
			}

			if (!jdsDone) {
				environment.jds.getActiveUsers(function(error, response, result) {
					if (error) {
						expect(error).toBeFalsy();
					}

					expect(response.statusCode).toBe(200);
					expect(_.isEmpty(result)).toBeFalsy();

					var users = result.users || [];
					users.push(userScreenUser);

					environment.jds.saveActiveUsers(users, function(error, response) {
						if (error) {
							expect(error).toBeFalsy();
						}

						expect(response.statusCode).toBe(200);
						jdsDone++;
					});
				});
			}
		});

		waitsFor(function() {
			return pjdsDone && jdsDone;
		}, 'set up', 20000);
	}

	function verifyUsersRemoved(environment, pjdsUser, userScreenUser){
		var pjdsDone = !pjdsUser;
		var jdsDone = !userScreenUser;

		runs(function() {
			if (!pjdsDone) {
				environment.pjds.getActiveUsers(function(error, response, result) {
					if (error) {
						expect(error).toBeFalsy();
					}

					expect(response.statusCode).toBe(200);

					var users = val(result, 'items') || [];
					var uids = _.pluck(users, 'uid');

					expect(uids).not.toContain(pjdsUser.uid);

					pjdsDone = true;
				});
			}

			if (!jdsDone) {
				environment.jds.getActiveUsers(function(error, response, result) {
					if (error) {
						expect(error).toBeFalsy();
					}

					expect(response.statusCode).toBe(200);
					expect(_.isEmpty(result)).toBeFalsy();

					var users = val(result, 'users') || [];
					var uids = _.pluck(users, 'uid');

					expect(uids).not.toContain(userScreenUser.uid);

					jdsDone = true;
				});
			}
		});

		waitsFor(function() {
			return pjdsDone && jdsDone;
		}, 'verify users removed', 20000);
	}

	it('removeInactiveUsers', function() {
		var config = {
			pjds: _.defaults(wConfig.pjds, {
				protocol: 'http',
				host: '10.2.2.110',
				port: 9080
			}),
			jds: _.defaults(wConfig.jds, {
				protocol: 'http',
				host: '10.2.2.110',
				port: 9080
			}),
			osync: {
				mixedEnvironmentMode: true,
				activeUserThresholdDays: 30
			}
		};

		var pjds = new PjdsClient(logger, logger, config);
		var jds = new JdsClient(logger, logger, config);

		var environment = {
			jds: jds,
			pjds: pjds
		};

		var pjdsUser = {
			uid: 'urn:va:user:ZYXW:45',
			site: 'ZYXW',
			id: '45',
			lastSuccessfulLogin: moment().subtract(config.osync.activeUserThresholdDays + 1, 'd').format('YYYYMMDDHHmmss')
		};

		var userScreenUser = {
			duz: {
				'ZYXW': '46'
			},
			uid: 'urn:va:user:ZYXW:46',
			site: 'ZYXW',
			id: '46',
			lastlogin: moment().subtract(config.osync.activeUserThresholdDays + 1, 'd').format()
		};

		var activeUserCleanupUtil = new ActiveUserCleanupUtil(logger, config, environment);

		setUpUsers(environment, pjdsUser, userScreenUser);

		var cleanUpDone = false;
		runs(function() {
			activeUserCleanupUtil.removeInactiveUsers(function(error) {
				expect(error).toBeFalsy();
				cleanUpDone = true;
			});
		});

		waitsFor(function(){
			return cleanUpDone === true;
		});

		verifyUsersRemoved(environment, pjdsUser, userScreenUser);
	});
});