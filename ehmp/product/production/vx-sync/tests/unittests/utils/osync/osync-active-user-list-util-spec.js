'use strict';

//-----------------------------------------------------------------
// This will test the osync-active-user-list-util module.
//
// Author: Les Westberg
//-----------------------------------------------------------------

require('../../../../env-setup');
var _ = require('underscore');

var log = require(global.VX_DUMMIES + 'dummy-logger');
var OsyncActiveUserListUtil = require(global.VX_UTILS + 'osync/osync-active-user-list-util');

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
// activeUserRetrieverMock - If a mock method is desired for activeUserRetriever - then this is
//                           the mock.
// activeUserScreenRetrieverMock - If a mock method is desired for activeUserScreenRetriever -
//                                 then this is the mock.
// publisherRouterMock - If a mock method is desired for publisherRouter then this is the mock.
//------------------------------------------------------------------------------------------------
function createEnvironment(activeUserRetrieverMock, activeUserScreenRetrieverMock, publisherRouterMock) {
	var environment = {};

	if (activeUserRetrieverMock) {
		environment.activeUserRetriever = activeUserRetrieverMock;
		spyOn(environment.activeUserRetriever, 'getAllActiveUsers').andCallThrough();
	}

	if (activeUserScreenRetrieverMock) {
		environment.activeUserScreenRetriever = activeUserScreenRetrieverMock;
		spyOn(environment.activeUserScreenRetriever, 'getAllActiveUsers').andCallThrough();
	}

	if (publisherRouterMock) {
		environment.publisherRouter = publisherRouterMock;
		spyOn(environment.publisherRouter, 'publish').andCallThrough();
	}

	return environment;
}

describe('osync-active-user-list-util unit test', function() {
	describe('mergeUsers method', function() {
		it('Verify when both lists are null', function() {
			var pjdsUsers = null;
			var jdsUserScreenUsers = null;
			var config = createConfig();
			var environment = createEnvironment();

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var result = osyncActiveUserListUtil.mergeUsers(pjdsUsers, jdsUserScreenUsers);

			expect(_.isArray(result)).toBe(true);
			expect(result.length).toBe(0);
		});
		it('Verify when both lists are undefined', function() {
			var pjdsUsers;
			var jdsUserScreenUsers;
			var config = createConfig();
			var environment = createEnvironment();

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var result = osyncActiveUserListUtil.mergeUsers(pjdsUsers, jdsUserScreenUsers);

			expect(_.isArray(result)).toBe(true);
			expect(result.length).toBe(0);
		});
		it('Verify when we have pJds users and no Jds user screen users', function() {
			var pjdsUsers = [{
				'id': '10000000016',
				'lastSuccessfulLogin': '20161027134433',
				'site': '9E7A',
				'uid': 'urn:va:user:9E7A:10000000016'
			}];
			var jdsUserScreenUsers;
			var config = createConfig();
			var environment = createEnvironment();

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var result = osyncActiveUserListUtil.mergeUsers(pjdsUsers, jdsUserScreenUsers);

			expect(_.isArray(result)).toBe(true);
			expect(result.length).toBe(1);
			expect(result).toBe(pjdsUsers);
		});
		it('Verify when we have jds user screeen users and no PJds users', function() {
			var pjdsUsers;
			var jdsUserScreenUsers = [{
				'uid': 'urn:va:user:9E7A:10000000271',
				'id': '10000000271',
				'site': '9E7A',
				'lastSuccessfulLogin': '2016-10-31T16:00:28-04:00'
			}, {
				'uid': 'urn:va:user:9E7A:10000000016',
				'id': '10000000016',
				'site': '9E7A',
				'lastSuccessfulLogin': '2016-10-27T20:01:38-04:00'
			}];
			var config = createConfig();
			var environment = createEnvironment();

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var result = osyncActiveUserListUtil.mergeUsers(pjdsUsers, jdsUserScreenUsers);

			expect(_.isArray(result)).toBe(true);
			expect(result.length).toBe(2);
			expect(result).toBe(jdsUserScreenUsers);
		});
		it('Verify when we have both jds user screeen users and pJds users - with one that is the same from both lists', function() {
			var pjdsUsers = [{
				'id': '10000000016',
				'lastSuccessfulLogin': '20161027134433',
				'site': '9E7A',
				'uid': 'urn:va:user:9E7A:10000000016'
			}];
			var jdsUserScreenUsers = [{
				'uid': 'urn:va:user:9E7A:10000000271',
				'id': '10000000271',
				'site': '9E7A',
				'lastSuccessfulLogin': '2016-10-31T16:00:28-04:00'
			}, {
				'uid': 'urn:va:user:9E7A:10000000016',
				'id': '10000000016',
				'site': '9E7A',
				'lastSuccessfulLogin': '2016-10-27T20:01:38-04:00'
			}];
			var config = createConfig();
			var environment = createEnvironment();

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var result = osyncActiveUserListUtil.mergeUsers(pjdsUsers, jdsUserScreenUsers);

			expect(_.isArray(result)).toBe(true);
			expect(result.length).toBe(2);
			expect(result).toContain(jasmine.objectContaining({
				'uid': 'urn:va:user:9E7A:10000000016'
			}));
			expect(result).toContain(jasmine.objectContaining({
				'uid': 'urn:va:user:9E7A:10000000271'
			}));
		});
	});
	describe('retreiveActiveUsersFromPJds method', function() {
		it('Test when error is returned.', function() {
			var config = createConfig();
			var activeUserRetrieveMock = {
				'getAllActiveUsers': function(log, config, environment, callback) {
					return callback(ERROR_RESPONSE);
				}
			};
			var environment = createEnvironment(activeUserRetrieveMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var finished;

			runs(function() {
				osyncActiveUserListUtil.retreiveActiveUsersFromPJds(function(error, result) {
					expect(error).toContain(ERROR_RESPONSE);
					expect(_.isArray(result)).toBe(true);
					expect(result.length).toBe(0);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);

		});
		it('Test when result is undefined.', function() {
			var config = createConfig();
			var activeUserRetrieveMock = {
				'getAllActiveUsers': function(log, config, environment, callback) {
					return callback(null);
				}
			};
			var environment = createEnvironment(activeUserRetrieveMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var finished;

			runs(function() {
				osyncActiveUserListUtil.retreiveActiveUsersFromPJds(function(error, result) {
					expect(error).toBeFalsy();
					expect(_.isArray(result)).toBe(true);
					expect(result.length).toBe(0);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);

		});
		it('Test when result is not an array.', function() {
			var config = createConfig();
			var activeUserRetrieveMock = {
				'getAllActiveUsers': function(log, config, environment, callback) {
					return callback(null, {});
				}
			};
			var environment = createEnvironment(activeUserRetrieveMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var finished;

			runs(function() {
				osyncActiveUserListUtil.retreiveActiveUsersFromPJds(function(error, result) {
					expect(error).toBeFalsy();
					expect(_.isArray(result)).toBe(true);
					expect(result.length).toBe(0);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);

		});
		it('Test when result is not an empty array.', function() {
			var config = createConfig();
			var activeUserRetrieveMock = {
				'getAllActiveUsers': function(log, config, environment, callback) {
					return callback(null, []);
				}
			};
			var environment = createEnvironment(activeUserRetrieveMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var finished;

			runs(function() {
				osyncActiveUserListUtil.retreiveActiveUsersFromPJds(function(error, result) {
					expect(error).toBeFalsy();
					expect(_.isArray(result)).toBe(true);
					expect(result.length).toBe(0);
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);

		});
		it('Test when result is valid array of results.', function() {
			var config = createConfig();
			var activeUserRetrieveMock = {
				'getAllActiveUsers': function(log, config, environment, callback) {
					return callback(null, [{
						'id': '10000000016',
						'lastSuccessfulLogin': '20161027134433',
						'site': '9E7A',
						'uid': 'urn:va:user:9E7A:10000000016'
					}]);
				}
			};
			var environment = createEnvironment(activeUserRetrieveMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var finished;

			runs(function() {
				osyncActiveUserListUtil.retreiveActiveUsersFromPJds(function(error, result) {
					expect(error).toBeFalsy();
					expect(_.isArray(result)).toBe(true);
					expect(result.length).toBe(1);
					expect(result).toContain(jasmine.objectContaining({
						'uid': 'urn:va:user:9E7A:10000000016'
					}));
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);

		});
	});
	describe('retrieveActiveUsersFromJdsUserScreen method', function() {
		it('Test when when mixedEnvironmentMode is missing from config file.', function() {
			var config = createConfig(undefined);
			var activeUserScreenRetrieverMock = {
				'getAllActiveUsers': function(log, osyncConfig, environment, callback) {
					return callback(null, []);
				}
			};
			var environment = createEnvironment(null, activeUserScreenRetrieverMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var finished;

			runs(function() {
				osyncActiveUserListUtil.retrieveActiveUsersFromJdsUserScreen(function(error, result) {
					expect(error).toBeFalsy();
					expect(_.isArray(result)).toBe(true);
					expect(result.length).toBe(0);
					expect(environment.activeUserScreenRetriever.getAllActiveUsers).not.toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);

		});
		it('Test when when mixedEnvironmentMode is null in config file.', function() {
			var config = createConfig(null);
			var activeUserScreenRetrieverMock = {
				'getAllActiveUsers': function(log, osyncConfig, environment, callback) {
					return callback(null, []);
				}
			};
			var environment = createEnvironment(null, activeUserScreenRetrieverMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var finished;

			runs(function() {
				osyncActiveUserListUtil.retrieveActiveUsersFromJdsUserScreen(function(error, result) {
					expect(error).toBeFalsy();
					expect(_.isArray(result)).toBe(true);
					expect(result.length).toBe(0);
					expect(environment.activeUserScreenRetriever.getAllActiveUsers).not.toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);

		});
		it('Test when when mixedEnvironmentMode is false in config file.', function() {
			var config = createConfig(false);
			var activeUserScreenRetrieverMock = {
				'getAllActiveUsers': function(log, osyncConfig, environment, callback) {
					return callback(null, []);
				}
			};
			var environment = createEnvironment(null, activeUserScreenRetrieverMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var finished;

			runs(function() {
				osyncActiveUserListUtil.retrieveActiveUsersFromJdsUserScreen(function(error, result) {
					expect(error).toBeFalsy();
					expect(_.isArray(result)).toBe(true);
					expect(result.length).toBe(0);
					expect(environment.activeUserScreenRetriever.getAllActiveUsers).not.toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);

		});
		it('Test when error is returned.', function() {
			var config = createConfig(true);
			var activeUserScreenRetrieverMock = {
				'getAllActiveUsers': function(log, osyncConfig, environment, callback) {
					return callback(ERROR_RESPONSE);
				}
			};
			var environment = createEnvironment(null, activeUserScreenRetrieverMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var finished;

			runs(function() {
				osyncActiveUserListUtil.retrieveActiveUsersFromJdsUserScreen(function(error, result) {
					expect(error).toContain(ERROR_RESPONSE);
					expect(_.isArray(result)).toBe(true);
					expect(result.length).toBe(0);
					expect(environment.activeUserScreenRetriever.getAllActiveUsers).toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Test when result is undefined.', function() {
			var config = createConfig(true);
			var activeUserScreenRetrieverMock = {
				'getAllActiveUsers': function(log, osyncConfig, environment, callback) {
					return callback(null);
				}
			};
			var environment = createEnvironment(null, activeUserScreenRetrieverMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var finished;

			runs(function() {
				osyncActiveUserListUtil.retrieveActiveUsersFromJdsUserScreen(function(error, result) {
					expect(error).toBeFalsy();
					expect(_.isArray(result)).toBe(true);
					expect(result.length).toBe(0);
					expect(environment.activeUserScreenRetriever.getAllActiveUsers).toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Test when result is not an array.', function() {
			var config = createConfig(true);
			var activeUserScreenRetrieverMock = {
				'getAllActiveUsers': function(log, osyncConfig, environment, callback) {
					return callback(null, {});
				}
			};
			var environment = createEnvironment(null, activeUserScreenRetrieverMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var finished;

			runs(function() {
				osyncActiveUserListUtil.retrieveActiveUsersFromJdsUserScreen(function(error, result) {
					expect(error).toBeFalsy();
					expect(_.isArray(result)).toBe(true);
					expect(result.length).toBe(0);
					expect(environment.activeUserScreenRetriever.getAllActiveUsers).toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Test when result is an empty array.', function() {
			var config = createConfig(true);
			var activeUserScreenRetrieverMock = {
				'getAllActiveUsers': function(log, osyncConfig, environment, callback) {
					return callback(null, []);
				}
			};
			var environment = createEnvironment(null, activeUserScreenRetrieverMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var finished;

			runs(function() {
				osyncActiveUserListUtil.retrieveActiveUsersFromJdsUserScreen(function(error, result) {
					expect(error).toBeFalsy();
					expect(_.isArray(result)).toBe(true);
					expect(result.length).toBe(0);
					expect(environment.activeUserScreenRetriever.getAllActiveUsers).toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Test when result is valid array of results.', function() {
			var config = createConfig(true);
			var activeUserScreenRetrieverMock = {
				'getAllActiveUsers': function(log, osyncConfig, environment, callback) {
					return callback(null, [{
						'uid': 'urn:va:user:9E7A:10000000271',
						'id': '10000000271',
						'site': '9E7A',
						'lastSuccessfulLogin': '2016-10-31T16:00:28-04:00'
					}, {
						'uid': 'urn:va:user:9E7A:10000000016',
						'id': '10000000016',
						'site': '9E7A',
						'lastSuccessfulLogin': '2016-10-27T20:01:38-04:00'
					}]);
				}
			};
			var environment = createEnvironment(null, activeUserScreenRetrieverMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var finished;

			runs(function() {
				osyncActiveUserListUtil.retrieveActiveUsersFromJdsUserScreen(function(error, result) {
					expect(error).toBeFalsy();
					expect(_.isArray(result)).toBe(true);
					expect(result.length).toBe(2);
					expect(result).toContain(jasmine.objectContaining({
						'uid': 'urn:va:user:9E7A:10000000016'
					}));
					expect(result).toContain(jasmine.objectContaining({
						'uid': 'urn:va:user:9E7A:10000000271'
					}));
					expect(environment.activeUserScreenRetriever.getAllActiveUsers).toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
	});
	describe('getActiveUsers method', function() {
		it('Test when error is returned from activeUserRetriever.', function() {
			var config = createConfig(true);
			var activeUserRetrieveMock = {
				'getAllActiveUsers': function(log, config, environment, callback) {
					return callback(ERROR_RESPONSE);
				}
			};
			var activeUserScreenRetrieverMock = {
				'getAllActiveUsers': function(log, osyncConfig, environment, callback) {
					return callback(null, []);
				}
			};
			var environment = createEnvironment(activeUserRetrieveMock, activeUserScreenRetrieverMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var finished;

			runs(function() {
				osyncActiveUserListUtil.getActiveUsers(function(error, result) {
					expect(error).toContain(ERROR_RESPONSE);
					expect(_.isArray(result)).toBe(true);
					expect(result.length).toBe(0);
					expect(environment.activeUserRetriever.getAllActiveUsers).toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Test when error is returned from activeUserScreenRetriever.', function() {
			var config = createConfig(true);
			var activeUserRetrieveMock = {
				'getAllActiveUsers': function(log, config, environment, callback) {
					return callback(null, []);
				}
			};
			var activeUserScreenRetrieverMock = {
				'getAllActiveUsers': function(log, osyncConfig, environment, callback) {
					return callback(ERROR_RESPONSE);
				}
			};
			var environment = createEnvironment(activeUserRetrieveMock, activeUserScreenRetrieverMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var finished;

			runs(function() {
				osyncActiveUserListUtil.getActiveUsers(function(error, result) {
					expect(error).toContain(ERROR_RESPONSE);
					expect(_.isArray(result)).toBe(true);
					expect(result.length).toBe(0);
					expect(environment.activeUserScreenRetriever.getAllActiveUsers).toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Test when result is returned from pJds only.', function() {
			var config = createConfig(true);
			var activeUserRetrieveMock = {
				'getAllActiveUsers': function(log, config, environment, callback) {
					return callback(null, [{
						'id': '10000000016',
						'lastSuccessfulLogin': '20161027134433',
						'site': '9E7A',
						'uid': 'urn:va:user:9E7A:10000000016'
					}]);
				}
			};
			var activeUserScreenRetrieverMock = {
				'getAllActiveUsers': function(log, osyncConfig, environment, callback) {
					return callback(null, []);
				}
			};
			var environment = createEnvironment(activeUserRetrieveMock, activeUserScreenRetrieverMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var finished;

			runs(function() {
				osyncActiveUserListUtil.getActiveUsers(function(error, result) {
					expect(error).toBeFalsy();
					expect(_.isArray(result)).toBe(true);
					expect(result.length).toBe(1);
					expect(result).toContain(jasmine.objectContaining({
						'uid': 'urn:va:user:9E7A:10000000016'
					}));
					expect(environment.activeUserRetriever.getAllActiveUsers).toHaveBeenCalled();
					expect(environment.activeUserScreenRetriever.getAllActiveUsers).toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Test when result is returned from JDS user screen only.', function() {
			var config = createConfig(true);
			var activeUserRetrieveMock = {
				'getAllActiveUsers': function(log, config, environment, callback) {
					return callback(null, []);
				}
			};
			var activeUserScreenRetrieverMock = {
				'getAllActiveUsers': function(log, osyncConfig, environment, callback) {
					return callback(null, [{
						'uid': 'urn:va:user:9E7A:10000000271',
						'id': '10000000271',
						'site': '9E7A',
						'lastSuccessfulLogin': '2016-10-31T16:00:28-04:00'
					}, {
						'uid': 'urn:va:user:9E7A:10000000016',
						'id': '10000000016',
						'site': '9E7A',
						'lastSuccessfulLogin': '2016-10-27T20:01:38-04:00'
					}]);
				}
			};
			var environment = createEnvironment(activeUserRetrieveMock, activeUserScreenRetrieverMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var finished;

			runs(function() {
				osyncActiveUserListUtil.getActiveUsers(function(error, result) {
					expect(error).toBeFalsy();
					expect(_.isArray(result)).toBe(true);
					expect(result.length).toBe(2);
					expect(result).toContain(jasmine.objectContaining({
						'uid': 'urn:va:user:9E7A:10000000016'
					}));
					expect(result).toContain(jasmine.objectContaining({
						'uid': 'urn:va:user:9E7A:10000000271'
					}));
					expect(environment.activeUserRetriever.getAllActiveUsers).toHaveBeenCalled();
					expect(environment.activeUserScreenRetriever.getAllActiveUsers).toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Test when result is returned from both pJds and JDS user screen.', function() {
			var config = createConfig(true);
			var activeUserRetrieveMock = {
				'getAllActiveUsers': function(log, config, environment, callback) {
					return callback(null, [{
						'id': '10000000016',
						'lastSuccessfulLogin': '20161027134433',
						'site': '9E7A',
						'uid': 'urn:va:user:9E7A:10000000016'
					}]);
				}
			};
			var activeUserScreenRetrieverMock = {
				'getAllActiveUsers': function(log, osyncConfig, environment, callback) {
					return callback(null, [{
						'uid': 'urn:va:user:9E7A:10000000271',
						'id': '10000000271',
						'site': '9E7A',
						'lastSuccessfulLogin': '2016-10-31T16:00:28-04:00'
					}, {
						'uid': 'urn:va:user:9E7A:10000000016',
						'id': '10000000016',
						'site': '9E7A',
						'lastSuccessfulLogin': '2016-10-27T20:01:38-04:00'
					}]);
				}
			};
			var environment = createEnvironment(activeUserRetrieveMock, activeUserScreenRetrieverMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var finished;

			runs(function() {
				osyncActiveUserListUtil.getActiveUsers(function(error, result) {
					expect(error).toBeFalsy();
					expect(_.isArray(result)).toBe(true);
					expect(result.length).toBe(2);
					expect(result).toContain(jasmine.objectContaining({
						'uid': 'urn:va:user:9E7A:10000000016'
					}));
					expect(result).toContain(jasmine.objectContaining({
						'uid': 'urn:va:user:9E7A:10000000271'
					}));
					expect(environment.activeUserRetriever.getAllActiveUsers).toHaveBeenCalled();
					expect(environment.activeUserScreenRetriever.getAllActiveUsers).toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
	});
	describe('createJobsForUsers method', function() {
		it('Test when users array does not contain any users.', function() {
			var config = createConfig(true);
			var environment = createEnvironment(null, null);
			var users = null;

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var resultJobs = osyncActiveUserListUtil.createJobsForUsers(users, null);
			expect(_.isArray(resultJobs)).toBe(true);
			expect(resultJobs.length).toBe(0);
		});
		it('Test when result when users array contains items.', function() {
			var config = createConfig(true);
			var environment = createEnvironment(null, null);
			var users = [{
				'uid': 'urn:va:user:9E7A:10000000271',
				'id': '10000000271',
				'site': '9E7A',
				'lastSuccessfulLogin': '2016-10-31T16:00:28-04:00'
			}, {
				'uid': 'urn:va:user:9E7A:10000000016',
				'id': '10000000016',
				'site': '9E7A',
				'lastSuccessfulLogin': '2016-10-27T20:01:38-04:00'
			}];

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var resultJobs = osyncActiveUserListUtil.createJobsForUsers(users, null);
			expect(_.isArray(resultJobs)).toBe(true);
			expect(resultJobs.length).toBe(2);
			expect(resultJobs).toContain(jasmine.objectContaining({
				'type': 'patientlist',
				'source': 'active-users',
				'user': jasmine.objectContaining({
					'uid': 'urn:va:user:9E7A:10000000016'
				})
			}));
			expect(resultJobs).toContain(jasmine.objectContaining({
				'type': 'patientlist',
				'source': 'active-users',
				'user': jasmine.objectContaining({
					'uid': 'urn:va:user:9E7A:10000000271'
				})
			}));
		});
		it('Verify referenceInfo is passed into jobs', function(){
			var config = createConfig(true);
			var environment = createEnvironment(null, null);
			var users = [{
				'uid': 'urn:va:user:9E7A:10000000271',
				'id': '10000000271',
				'site': '9E7A',
				'lastSuccessfulLogin': '2016-10-31T16:00:28-04:00'
			}, {
				'uid': 'urn:va:user:9E7A:10000000016',
				'id': '10000000016',
				'site': '9E7A',
				'lastSuccessfulLogin': '2016-10-27T20:01:38-04:00'
			}];

			var referenceInfo = {
				sessionId: 'TEST',
				utilityType: 'osync-active-user-list'
			};

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			var resultJobs = osyncActiveUserListUtil.createJobsForUsers(users, referenceInfo);
			expect(_.isArray(resultJobs)).toBe(true);
			expect(resultJobs.length).toBe(2);
			expect(resultJobs).toContain(jasmine.objectContaining({
				'type': 'patientlist',
				'source': 'active-users',
				'user': jasmine.objectContaining({
					'uid': 'urn:va:user:9E7A:10000000016'
				}),
				'referenceInfo': jasmine.objectContaining(referenceInfo)
			}));
			expect(resultJobs).toContain(jasmine.objectContaining({
				'type': 'patientlist',
				'source': 'active-users',
				'user': jasmine.objectContaining({
					'uid': 'urn:va:user:9E7A:10000000271'
				}),
				'referenceInfo': jasmine.objectContaining(referenceInfo)
			}));
		});
	});
	describe('retrieveAndProcessActiveUserList method', function() {
		it('Test when error is returned from getActiveUsers.', function() {
			var config = createConfig(true);
			var environment = createEnvironment(null, null);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			spyOn(osyncActiveUserListUtil, 'getActiveUsers').andCallFake(function(callback) {
				return callback(ERROR_RESPONSE);
			});

			var finished;

			runs(function() {
				osyncActiveUserListUtil.retrieveAndProcessActiveUserList(null, function(error, numProcessed) {
					expect(error).toBe(ERROR_RESPONSE);
					expect(numProcessed).toBe(0);
					expect(osyncActiveUserListUtil.getActiveUsers).toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Test when empty result is returned from getActiveUsers.', function() {
			var config = createConfig(true);
			var environment = createEnvironment(null, null);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			spyOn(osyncActiveUserListUtil, 'getActiveUsers').andCallFake(function(callback) {
				return callback(null, null);
			});

			var finished;

			runs(function() {
				osyncActiveUserListUtil.retrieveAndProcessActiveUserList(null, function(error, numProcessed) {
					expect(error).toBeFalsy();
					expect(numProcessed).toBe(0);
					expect(osyncActiveUserListUtil.getActiveUsers).toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Test when error is returned from publishRouter.publish.', function() {
			var config = createConfig(true);
			var publisherRouterMock = {
				'publish': function(jobsToPublish, callback) {
					return callback(ERROR_RESPONSE);
				}
			};
			var environment = createEnvironment(null, null, publisherRouterMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			spyOn(osyncActiveUserListUtil, 'getActiveUsers').andCallFake(function(callback) {
				return callback(null, [{
					'uid': 'urn:va:user:9E7A:10000000271',
					'id': '10000000271',
					'site': '9E7A',
					'lastSuccessfulLogin': '2016-10-31T16:00:28-04:00'
				}, {
					'uid': 'urn:va:user:9E7A:10000000016',
					'id': '10000000016',
					'site': '9E7A',
					'lastSuccessfulLogin': '2016-10-27T20:01:38-04:00'
				}]);
			});

			var finished;

			runs(function() {
				osyncActiveUserListUtil.retrieveAndProcessActiveUserList(null, function(error, numProcessed) {
					expect(error).toBe(ERROR_RESPONSE);
					expect(numProcessed).toBe(0);
					expect(osyncActiveUserListUtil.getActiveUsers).toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Test when users are retrieved and successfully published.', function() {
			var config = createConfig(true);
			var publisherRouterMock = {
				'publish': function(jobsToPublish, callback) {
					return callback(null);
				}
			};
			var environment = createEnvironment(null, null, publisherRouterMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			spyOn(osyncActiveUserListUtil, 'getActiveUsers').andCallFake(function(callback) {
				return callback(null, [{
					'uid': 'urn:va:user:9E7A:10000000271',
					'id': '10000000271',
					'site': '9E7A',
					'lastSuccessfulLogin': '2016-10-31T16:00:28-04:00'
				}, {
					'uid': 'urn:va:user:9E7A:10000000016',
					'id': '10000000016',
					'site': '9E7A',
					'lastSuccessfulLogin': '2016-10-27T20:01:38-04:00'
				}]);
			});

			var finished;

			runs(function() {
				osyncActiveUserListUtil.retrieveAndProcessActiveUserList(null, function(error, numProcessed) {
					expect(error).toBeFalsy();
					expect(numProcessed).toBe(2);
					expect(osyncActiveUserListUtil.getActiveUsers).toHaveBeenCalled();
					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
		it('Verify referenceInfo is passed into resulting jobs', function(){
			var config = createConfig(true);

			var resultingReferenceInfo = [];

			var publisherRouterMock = {
				'publish': function(jobsToPublish, callback) {
					_.each(jobsToPublish, function(job){
						resultingReferenceInfo.push(job.referenceInfo);
					});
					return callback(null);
				}
			};
			var environment = createEnvironment(null, null, publisherRouterMock);

			var osyncActiveUserListUtil = new OsyncActiveUserListUtil(log, config, environment);
			spyOn(osyncActiveUserListUtil, 'getActiveUsers').andCallFake(function(callback) {
				return callback(null, [{
					'uid': 'urn:va:user:9E7A:10000000271',
					'id': '10000000271',
					'site': '9E7A',
					'lastSuccessfulLogin': '2016-10-31T16:00:28-04:00'
				}, {
					'uid': 'urn:va:user:9E7A:10000000016',
					'id': '10000000016',
					'site': '9E7A',
					'lastSuccessfulLogin': '2016-10-27T20:01:38-04:00'
				}]);
			});

			var referenceInfo = {
				sessionId: 'TEST',
				utilityType: 'osync-active-user-list'
			};

			var finished;

			runs(function() {
				osyncActiveUserListUtil.retrieveAndProcessActiveUserList(referenceInfo, function(error, numProcessed) {
					expect(error).toBeFalsy();
					expect(numProcessed).toBe(2);
					expect(osyncActiveUserListUtil.getActiveUsers).toHaveBeenCalled();

					expect(resultingReferenceInfo.length).toEqual(2);

                	_.each(resultingReferenceInfo, function(item){
                    	expect(item).toEqual(jasmine.objectContaining(referenceInfo));
               		});

					finished = true;
				});
			});

			waitsFor(function() {
				return finished;
			}, 'Callback not called', 100);
		});
	});

});