'use strict';

//-----------------------------------------------------------------
// This will test the osync-active-user-list-util module.
//
// Author: Les Westberg
//-----------------------------------------------------------------

require('../../../../env-setup');
var _ = require('underscore');
var moment = require('moment');

var log = require(global.VX_DUMMIES + 'dummy-logger');
// var log = require('bunyan').createLogger({
// 	name: 'active-user-cleanup-util-spec',
// 	level: 'debug'
// });
var ActiveUserCleanupUtil = require(global.VX_UTILS + 'osync/active-user-cleanup-util');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var ERROR_RESPONSE = 'An error occurred.';

//-------------------------------------------------------------------------------------------------
// Create the config variable.
//
// mixedEnvironmentMode: The value to be used for this setting.  Note if it is undefined - it will
//                       not be placed at all in config.
//-------------------------------------------------------------------------------------------------
function createConfig(mixedEnvironmentMode) {
	var config = {
		'osync': {}
	};

	if (mixedEnvironmentMode !== undefined) {
		config.osync.mixedEnvironmentMode = mixedEnvironmentMode;
	}

	return config;
}

//------------------------------------------------------------------------------------------------
// Create the environment variable.
//
// jdsUtilMock - If a mock method is desired for jdsUtil - then this is the mock.
// pjdsMock - If a mock method is desired for pJds - then this is the mock.
//------------------------------------------------------------------------------------------------
function createEnvironment(jdsUtilMock, pjdsMock) {
	var environment = {};

	if (jdsUtilMock) {
		// environment.jdsUtil = jdsUtilMock;
		// spyOn(environment.jdsUtil, 'getFromJDS').andCallThrough();
		// spyOn(environment.jdsUtil, 'saveToJDS').andCallThrough();

		environment.jds = jdsUtilMock;
		spyOn(environment.jds, 'getActiveUsers').andCallThrough();
		spyOn(environment.jds, 'saveActiveUsers').andCallThrough();
	}

	if (pjdsMock) {
		environment.pjds = pjdsMock;
		spyOn(environment.pjds, 'getActiveUsers').andCallThrough();
		spyOn(environment.pjds, 'removeActiveUser').andCallThrough();
	}

	return environment;
}

describe('active-user-cleanup-util unit test', function() {
	describe('removeUsersFromGenericStore method', function() {
		it('Verify correct behavior when error occurs from pjds.getActiveUsers', function() {
			var config = createConfig();
			var pjdsMock = {
				'getActiveUsers': function(filter, callback) {
					return callback(ERROR_RESPONSE);
				},
				'removeActiveUser': function(uid, callback) {
					return callback(null);
				}
			};
			var environment = createEnvironment(null, pjdsMock);

			var activeUserCleanupUtil = new ActiveUserCleanupUtil(log, config, environment);
			var finished;

			runs(function() {
				activeUserCleanupUtil.removeUsersFromGenericStore(function(error) {
					expect(error).toContain(ERROR_RESPONSE);
					expect(environment.pjds.getActiveUsers).toHaveBeenCalled();
					expect(environment.pjds.removeActiveUser).not.toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);

		});
		it('Verify correct behavior when no error and no response are received from pjds.getActiveUsers', function() {
			var config = createConfig();
			var pjdsMock = {
				'getActiveUsers': function(filter, callback) {
					return callback(null);
				},
				'removeActiveUser': function(uid, callback) {
					return callback(null);
				}
			};
			var environment = createEnvironment(null, pjdsMock);

			var activeUserCleanupUtil = new ActiveUserCleanupUtil(log, config, environment);
			var finished;

			runs(function() {
				activeUserCleanupUtil.removeUsersFromGenericStore(function(error) {
					expect(error).toContain('No response received from JDS');
					expect(environment.pjds.getActiveUsers).toHaveBeenCalled();
					expect(environment.pjds.removeActiveUser).not.toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);

		});
		it('Verify correct behavior when no body in response is received from pjds.getActiveUsers', function() {
			var config = createConfig();
			var pjdsMock = {
				'getActiveUsers': function(filter, callback) {
					return callback(null, {});
				},
				'removeActiveUser': function(uid, callback) {
					return callback(null);
				}
			};
			var environment = createEnvironment(null, pjdsMock);

			var activeUserCleanupUtil = new ActiveUserCleanupUtil(log, config, environment);
			var finished;

			runs(function() {
				activeUserCleanupUtil.removeUsersFromGenericStore(function(error) {
					expect(error).toContain('No response body message received from JDS.');
					expect(environment.pjds.getActiveUsers).toHaveBeenCalled();
					expect(environment.pjds.removeActiveUser).not.toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);

		});
		it('Verify correct behavior when bad json response is received from pjds.getActiveUsers', function() {
			var config = createConfig();
			var pjdsMock = {
				'getActiveUsers': function(filter, callback) {
					return callback(null, {
						'body': '{ x:'
					});
				},
				'removeActiveUser': function(uid, callback) {
					return callback(null);
				}
			};
			var environment = createEnvironment(null, pjdsMock);

			var activeUserCleanupUtil = new ActiveUserCleanupUtil(log, config, environment);
			var finished;

			runs(function() {
				activeUserCleanupUtil.removeUsersFromGenericStore(function(error) {
					expect(error).toContain('Error parsing response from active user generic store');
					expect(environment.pjds.getActiveUsers).toHaveBeenCalled();
					expect(environment.pjds.removeActiveUser).not.toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);

		});
		it('Verify correct behavior when items is undefined from pjds.getActiveUsers', function() {
			var config = createConfig();
			var pjdsMock = {
				'getActiveUsers': function(filter, callback) {
					return callback(null, {
						'body': '{}'
					});
				},
				'removeActiveUser': function(uid, callback) {
					return callback(null);
				}
			};
			var environment = createEnvironment(null, pjdsMock);

			var activeUserCleanupUtil = new ActiveUserCleanupUtil(log, config, environment);
			var finished;

			runs(function() {
				activeUserCleanupUtil.removeUsersFromGenericStore(function(error) {
					expect(error).toBeFalsy();
					expect(environment.pjds.getActiveUsers).toHaveBeenCalled();
					expect(environment.pjds.removeActiveUser).not.toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);

		});
		it('Verify correct behavior when items is empty array from pjds.getActiveUsers', function() {
			var config = createConfig();
			var pjdsMock = {
				'getActiveUsers': function(filter, callback) {
					return callback(null, {
						'body': '{ "items": []}'
					});
				},
				'removeActiveUser': function(uid, callback) {
					return callback(null);
				}
			};
			var environment = createEnvironment(null, pjdsMock);

			var activeUserCleanupUtil = new ActiveUserCleanupUtil(log, config, environment);
			var finished;

			runs(function() {
				activeUserCleanupUtil.removeUsersFromGenericStore(function(error) {
					expect(error).toBeFalsy();
					expect(environment.pjds.getActiveUsers).toHaveBeenCalled();
					expect(environment.pjds.removeActiveUser).not.toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);

		});
		it('Verify correct behavior when error is returned from pjds.removeActiveUser', function() {
			var config = createConfig();
			var pjdsMock = {
				'getActiveUsers': function(filter, callback) {
					var body = {
						'items': [{
							'id': '10000000001',
							'lastSuccessfulLogin': '20161110132725',
							'site': '9E7A',
							'uid': 'urn:va:user:9E7A:10000000001'
						}, {
							'id': '10000000016',
							'lastSuccessfulLogin': '20161110132729',
							'site': '9E7A',
							'uid': 'urn:va:user:9E7A:10000000016'
						}]
					};
					var response = {
						'body': JSON.stringify(body)
					};
					return callback(null, response);
				},
				'removeActiveUser': function(uid, callback) {
					return callback(ERROR_RESPONSE);
				}
			};
			var environment = createEnvironment(null, pjdsMock);

			var activeUserCleanupUtil = new ActiveUserCleanupUtil(log, config, environment);
			var finished;

			runs(function() {
				activeUserCleanupUtil.removeUsersFromGenericStore(function(error) {
					expect(error).toContain(ERROR_RESPONSE);
					expect(environment.pjds.getActiveUsers).toHaveBeenCalled();
					expect(environment.pjds.removeActiveUser).toHaveBeenCalledWith('urn:va:user:9E7A:10000000001', jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);

		});

		it('Verify correct behavior when users are returned and successfully removed', function() {
			var config = createConfig();
			var pjdsMock = {
				'getActiveUsers': function(filter, callback) {
					var body = {
						'items': [{
							'id': '10000000001',
							'lastSuccessfulLogin': '20161110132725',
							'site': '9E7A',
							'uid': 'urn:va:user:9E7A:10000000001'
						}, {
							'id': '10000000016',
							'lastSuccessfulLogin': '20161110132729',
							'site': '9E7A',
							'uid': 'urn:va:user:9E7A:10000000016'
						}]
					};
					var response = {
						'body': JSON.stringify(body)
					};
					return callback(null, response);
				},
				'removeActiveUser': function(uid, callback) {
					return callback(null);
				}
			};
			var environment = createEnvironment(null, pjdsMock);

			var activeUserCleanupUtil = new ActiveUserCleanupUtil(log, config, environment);
			var finished;

			runs(function() {
				activeUserCleanupUtil.removeUsersFromGenericStore(function(error) {
					expect(error).toBeFalsy();
					expect(environment.pjds.getActiveUsers).toHaveBeenCalled();
					expect(environment.pjds.removeActiveUser).toHaveBeenCalledWith('urn:va:user:9E7A:10000000001', jasmine.any(Function));
					expect(environment.pjds.removeActiveUser).toHaveBeenCalledWith('urn:va:user:9E7A:10000000016', jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);

		});
	});
	describe('removeUsersFromUserScreen method', function() {
		it('Verify correct behavior when mixedEnvironmentMode is not set.', function() {
			var config = createConfig();
			var jds = new JdsClientDummy(log, config);

			var environment = createEnvironment(jds, null);

			var activeUserCleanupUtil = new ActiveUserCleanupUtil(log, config, environment);
			var finished;

			runs(function() {
				activeUserCleanupUtil.removeUsersFromUserScreen(function(error) {
					expect(error).toBeFalsy();
					expect(environment.jds.getActiveUsers).not.toHaveBeenCalled();
					expect(environment.jds.saveActiveUsers).not.toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Verify correct behavior when error returned from jds.getActiveUsers.', function() {
			var config = createConfig(true);
			var jds = new JdsClientDummy(log, config);
			jds._setResponseData([ERROR_RESPONSE], [null], [null]);

			var environment = createEnvironment(jds, null);

			var activeUserCleanupUtil = new ActiveUserCleanupUtil(log, config, environment);
			var finished;

			runs(function() {
				activeUserCleanupUtil.removeUsersFromUserScreen(function(error) {
					expect(error).toContain(ERROR_RESPONSE);
					expect(environment.jds.getActiveUsers).toHaveBeenCalled();
					expect(environment.jds.saveActiveUsers).not.toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Verify correct behavior when no error and no response are returned from jds.getActiveUsers.', function() {
			var config = createConfig(true);
			var jds = new JdsClientDummy(log, config);
			jds._setResponseData([null], [null], [null]);

			var environment = createEnvironment(jds, null);

			var activeUserCleanupUtil = new ActiveUserCleanupUtil(log, config, environment);
			var finished;

			runs(function() {
				activeUserCleanupUtil.removeUsersFromUserScreen(function(error) {
					expect(error).toContain('No response received from JDS.');
					expect(environment.jds.getActiveUsers).toHaveBeenCalled();
					expect(environment.jds.saveActiveUsers).not.toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Verify correct behavior when no error and no response.body are returned from jds.getActiveUsers.', function() {
			var config = createConfig(true);
			var jds = new JdsClientDummy(log, config);
			jds._setResponseData([null], [{statusCode: 200}], [null]);

			var environment = createEnvironment(jds, null);

			var activeUserCleanupUtil = new ActiveUserCleanupUtil(log, config, environment);
			var finished;

			runs(function() {
				activeUserCleanupUtil.removeUsersFromUserScreen(function(error) {
					expect(error).toContain('No response body message received from JDS.');
					expect(environment.jds.getActiveUsers).toHaveBeenCalled();
					expect(environment.jds.saveActiveUsers).not.toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Verify correct behavior when no error and response.body is corupted JSON from jds.getActiveUsers.', function() {
			var config = createConfig(true);
			var jds = new JdsClientDummy(log, config);
			jds._setResponseData([null], [{statusCode: 200, body: '{xxx'}], [null]);

			var environment = createEnvironment(jds, null);

			var activeUserCleanupUtil = new ActiveUserCleanupUtil(log, config, environment);
			var finished;

			runs(function() {
				activeUserCleanupUtil.removeUsersFromUserScreen(function(error) {
					expect(error).toContain('Error parsing response from active user user screen.');
					expect(environment.jds.getActiveUsers).toHaveBeenCalled();
					expect(environment.jds.saveActiveUsers).not.toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Verify correct behavior when no error response.body has no users from jds.getActiveUsers.', function() {
			var config = createConfig(true);
			var body = {
				'_id': 'osyncusers',
				'users': [{
					'duz': {
						'9E7A': '10000000016'
					},
					'lastlogin': '2016-10-27T20:01:38-04:00'
				}, {
					'duz': {
						'C877': '10000000272'
					},
					'lastlogin': '2016-10-26T20:16:47-04:00'
				}]
			};
			var jds = new JdsClientDummy(log, config);
			jds._setResponseData([null], [{statusCode: 200, body: '{}'}], [null]);

			var environment = createEnvironment(jds, null);

			var activeUserCleanupUtil = new ActiveUserCleanupUtil(log, config, environment);
			var finished;

			runs(function() {
				activeUserCleanupUtil.removeUsersFromUserScreen(function(error) {
					expect(error).toBeFalsy();
					expect(environment.jds.getActiveUsers).toHaveBeenCalled();
					expect(environment.jds.saveActiveUsers).not.toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Verify correct behavior when error is returned from jds.saveActiveUsers.', function() {
			var config = createConfig(true);
			var now = moment().format();
			var fortyDaysAgo = moment().subtract(40, 'd');
			var body = {
				'_id': 'osyncusers',
				'users': [{
					'duz': {
						'9E7A': '10000000016'
					},
					'lastlogin': now
				}, {
					'duz': {
						'C877': '10000000272'
					},
					'lastlogin': fortyDaysAgo
				}]
			};
			var jds = new JdsClientDummy(log, config);
			jds._setResponseData([null, ERROR_RESPONSE], [{statusCode: 200, body: JSON.stringify(body)}, null], [null, null]);

			var environment = createEnvironment(jds, null);

			var activeUserCleanupUtil = new ActiveUserCleanupUtil(log, config, environment);
			var finished;

			runs(function() {
				activeUserCleanupUtil.removeUsersFromUserScreen(function(error) {
					expect(error).toContain('Error trying to save active user userscreen.');
					expect(error).toContain(ERROR_RESPONSE);
					expect(environment.jds.getActiveUsers).toHaveBeenCalled();
					expect(environment.jds.saveActiveUsers).toHaveBeenCalled();
					var activeUsers = [{
							'duz': {
								'9E7A': '10000000016'
							},
							'lastlogin': now
						}];
					expect(environment.jds.saveActiveUsers).toHaveBeenCalledWith(activeUsers, jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Verify correct behavior when everything runs correctly...', function() {
			var config = createConfig(true);
			var now = moment().format();
			var fortyDaysAgo = moment().subtract(40, 'd');
			var body = {
				'_id': 'osyncusers',
				'users': [{
					'duz': {
						'9E7A': '10000000016'
					},
					'lastlogin': now
				}, {
					'duz': {
						'C877': '10000000272'
					},
					'lastlogin': fortyDaysAgo
				}]
			};
			var jds = new JdsClientDummy(log, config);
			jds._setResponseData([null, null], [{statusCode: 200, body: JSON.stringify(body)}, {statusCode:200}], [null, null]);

			var environment = createEnvironment(jds, null);

			var activeUserCleanupUtil = new ActiveUserCleanupUtil(log, config, environment);
			var finished;

			runs(function() {
				activeUserCleanupUtil.removeUsersFromUserScreen(function(error) {
					expect(error).toBeFalsy();
					expect(environment.jds.getActiveUsers).toHaveBeenCalled();
					expect(environment.jds.saveActiveUsers).toHaveBeenCalled();
					var activeUsers = [{
							'duz': {
								'9E7A': '10000000016'
							},
							'lastlogin': now
						}];
					expect(environment.jds.saveActiveUsers).toHaveBeenCalledWith(activeUsers, jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
	});
	describe('removeInactiveUsers method', function() {
		it('Verify correct behavior when one of the underlying methods returns an error...', function() {
			var config = createConfig(true);
			var now = moment().format();
			var fortyDaysAgo = moment().subtract(40, 'd');
			var body = {
				'_id': 'osyncusers',
				'users': [{
					'duz': {
						'9E7A': '10000000016'
					},
					'lastlogin': now
				}, {
					'duz': {
						'C877': '10000000272'
					},
					'lastlogin': fortyDaysAgo
				}]
			};
			var pjdsMock = {
				'getActiveUsers': function(filter, callback) {
					return callback(ERROR_RESPONSE);
				},
				'removeActiveUser': function(uid, callback) {
					return callback(null);
				}
			};

			var jds = new JdsClientDummy(log, config);
			jds._setResponseData([null, null], [{statusCode: 200, body: JSON.stringify(body)}, null], [null, null]);

			var environment = createEnvironment(jds, pjdsMock);

			var activeUserCleanupUtil = new ActiveUserCleanupUtil(log, config, environment);
			var finished;

			runs(function() {
				activeUserCleanupUtil.removeInactiveUsers(function(error) {
					expect(error).toContain(ERROR_RESPONSE);
					expect(environment.pjds.getActiveUsers).toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Verify correct behavior when everything runs correctly...', function() {
			var config = createConfig(true);
			var now = moment().format();
			var fortyDaysAgo = moment().subtract(40, 'd');
			var body = {
				'_id': 'osyncusers',
				'users': [{
					'duz': {
						'9E7A': '10000000016'
					},
					'lastlogin': now
				}, {
					'duz': {
						'C877': '10000000272'
					},
					'lastlogin': fortyDaysAgo
				}]
			};

			var pjdsMock = {
				'getActiveUsers': function(filter, callback) {
					var body = {
						'items': [{
							'id': '10000000001',
							'lastSuccessfulLogin': '20161110132725',
							'site': '9E7A',
							'uid': 'urn:va:user:9E7A:10000000001'
						}, {
							'id': '10000000016',
							'lastSuccessfulLogin': '20161110132729',
							'site': '9E7A',
							'uid': 'urn:va:user:9E7A:10000000016'
						}]
					};
					var response = {
						'body': JSON.stringify(body)
					};
					return callback(null, response);
				},
				'removeActiveUser': function(uid, callback) {
					return callback(null);
				}
			};
			var jds = new JdsClientDummy(log, config);
			jds._setResponseData([null, null], [{statusCode: 200, body: JSON.stringify(body)}, null], [null, null]);

			var environment = createEnvironment(jds, pjdsMock);

			var activeUserCleanupUtil = new ActiveUserCleanupUtil(log, config, environment);
			var finished;

			runs(function() {
				activeUserCleanupUtil.removeInactiveUsers(function(error) {
					expect(error).toBeFalsy();
					expect(environment.pjds.getActiveUsers).toHaveBeenCalled();
					expect(environment.pjds.removeActiveUser).toHaveBeenCalledWith('urn:va:user:9E7A:10000000001', jasmine.any(Function));
					expect(environment.pjds.removeActiveUser).toHaveBeenCalledWith('urn:va:user:9E7A:10000000016', jasmine.any(Function));
					expect(environment.jds.getActiveUsers).toHaveBeenCalled();
					expect(environment.jds.saveActiveUsers).toHaveBeenCalled();
					var activeUsers = [{
							'duz': {
								'9E7A': '10000000016'
							},
							'lastlogin': now
						}];
					expect(environment.jds.saveActiveUsers).toHaveBeenCalledWith(activeUsers, jasmine.any(Function));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
	});
});