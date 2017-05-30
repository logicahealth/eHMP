'use strict';

require('../../../env-setup');

var clearPatientUtil = require(global.VX_UTILS + 'clear-patient-util');

var log = require(global.VX_DUMMIES + '/dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
// 	name: 'clear-patient-util-spec',
// 	level: 'debug'
// });

var config = {
	documentStorage: {
		publish: {
			path: './abcd-test-directory-dcba'
		}
	},
	vistaSites: {
		AAAA: {},
		BBBB: {}
	},
	hdr: {
		hdrSites: {
			XHDR: {},
			YHDR: {}
		},
		operationMode: 'pub/sub'
	}
};

describe('clearPatientUtil', function() {
	it('Normal path: force = true', function() {
		var environment = {
			jds: {
				removePatientIdentifier: function(jpid, callback) {
					callback(null, {
						statusCode: 200
					});
				}
			},
			solr: {
				deleteByQuery: function(pid, callback) {
					callback(null);
				}
			},
			vistaClient: {
				unsubscribe: function(pid, callback) {
					callback(null, 'success');
				}
			},
			hdrClient: {
				unsubscribe: function(siteId, pid, callback) {
					callback(null, 'success');
				}
			}
		};

		environment.jds.childInstance = function() { return environment.jds; };
		environment.vistaClient.childInstance = function() { return environment.vistaClient; };
		environment.hdrClient.childInstance = function() { return environment.hdrClient; };
		environment.solr.childInstance = function() { return environment.solr; };

		clearPatientUtil.clearPatient(log, config, environment, true, ['AAAA;1', 'BBBB;1', 'XHDR;1', 'YHDR;1', '12345V12345'], 'aaaaaa-bbbbbb-cccccc', function(error) {
			expect(error).toBeFalsy();
		});
	});

	it('Normal path: force = false', function() {
		var environment = {
			jds: {
				removePatientIdentifier: function(jpid, callback) {
					callback(null, {
						statusCode: 200
					});
				}
			},
			solr: {
				deleteByQuery: function(pid, callback) {
					callback(null);
				}
			},
			vistaClient: {
				unsubscribe: function(pid, callback) {
					callback(null, 'success');
				}
			},
			hdrClient: {
				unsubscribe: function(siteId, pid, callback) {
					callback(null, 'success');
				}
			}
		};

		environment.jds.childInstance = function() { return environment.jds; };
		environment.vistaClient.childInstance = function() { return environment.vistaClient; };
		environment.hdrClient.childInstance = function() { return environment.hdrClient; };
		environment.solr.childInstance = function() { return environment.solr; };

		clearPatientUtil.clearPatient(log, config, environment, true, ['AAAA;1', 'BBBB;1', 'XHDR;1', 'YHDR;1', '12345V12345'], 'aaaaaa-bbbbbb-cccccc', function(error) {
			expect(error).toBeFalsy();
		});
	});

	it('Error path: Missing ids', function() {
		var environment = {};

		clearPatientUtil.clearPatient(log, config, environment, false, null, 'aaaaaa-bbbbbb-cccccc', function(error) {
			expect(error).toBeTruthy();
		});
	});


	it('Error path: Empty ids', function() {
		var environment = {};

		clearPatientUtil.clearPatient(log, config, environment, false, [], 'aaaaaa-bbbbbb-cccccc', function(error) {
			expect(error).toBeTruthy();
		});
	});

	it('Error path: Missing jpid', function() {
		var environment = {};

		clearPatientUtil.clearPatient(log, config, environment, false, ['AAAA;1', 'BBBB;1', 'XHDR;1', 'YHDR;1', '12345V12345'], null, function(error) {
			expect(error).toBeTruthy();
		});
	});

	it('Error path: vista returns error', function() {
		var environment = {
			jds: {
				removePatientIdentifier: function(jpid, callback) {
					callback(null, {
						statusCode: 200
					});
				}
			},
			solr: {
				deleteByQuery: function(pid, callback) {
					callback(null);
				}
			},
			vistaClient: {
				unsubscribe: function(pid, callback) {
					callback('error', null);
				}
			},
			hdrClient: {
				unsubscribe: function(siteId, pid, callback) {
					callback(null, 'success');
				}
			}
		};

		environment.jds.childInstance = function() { return environment.jds; };
		environment.vistaClient.childInstance = function() { return environment.vistaClient; };
		environment.hdrClient.childInstance = function() { return environment.hdrClient; };
		environment.solr.childInstance = function() { return environment.solr; };

		clearPatientUtil.clearPatient(log, config, environment, false, ['AAAA;1', 'BBBB;1', '12345V12345'], 'aaaaaa-bbbbbb-cccccc', function(error) {
			expect(error).toBeTruthy();
		});
	});

	it('Error path: vista call returns unexpected response', function() {
		var environment = {
			jds: {
				removePatientIdentifier: function(jpid, callback) {
					callback(null, {
						statusCode: 200
					});
				}
			},
			solr: {
				deleteByQuery: function(pid, callback) {
					callback(null);
				}
			},
			vistaClient: {
				unsubscribe: function(pid, callback) {
					callback(null, 'unexpected');
				}
			},
			hdrClient: {
				unsubscribe: function(siteId, pid, callback) {
					callback(null, 'success');
				}
			}
		};

		environment.jds.childInstance = function() { return environment.jds; };
		environment.vistaClient.childInstance = function() { return environment.vistaClient; };
		environment.hdrClient.childInstance = function() { return environment.hdrClient; };
		environment.solr.childInstance = function() { return environment.solr; };

		clearPatientUtil.clearPatient(log, config, environment, false, ['AAAA;1', 'BBBB;1', '12345V12345'], 'aaaaaa-bbbbbb-cccccc', function(error) {
			expect(error).toBeTruthy();
		});
	});

	it('Error path: vistaHdr returns error', function() {
		var environment = {
			jds: {
				removePatientIdentifier: function(jpid, callback) {
					callback(null, {
						statusCode: 200
					});
				}
			},
			solr: {
				deleteByQuery: function(pid, callback) {
					callback(null);
				}
			},
			vistaClient: {
				unsubscribe: function(pid, callback) {
					callback(null, 'success');
				}
			},
			hdrClient: {
				unsubscribe: function(siteId, pid, callback) {
					callback('error', null);
				}
			}
		};

		environment.jds.childInstance = function() { return environment.jds; };
		environment.vistaClient.childInstance = function() { return environment.vistaClient; };
		environment.hdrClient.childInstance = function() { return environment.hdrClient; };
		environment.solr.childInstance = function() { return environment.solr; };

		clearPatientUtil.clearPatient(log, config, environment, false, ['XHDR;1', 'YHDR;1', '12345V12345'], 'aaaaaa-bbbbbb-cccccc', function(error) {
			expect(error).toBeTruthy();
		});
	});

	it('Error path: vistaHdr call returns unexpected response', function() {
		var environment = {
			jds: {
				removePatientIdentifier: function(jpid, callback) {
					callback(null, {
						statusCode: 200
					});
				}
			},
			solr: {
				deleteByQuery: function(pid, callback) {
					callback(null);
				}
			},
			vistaClient: {
				unsubscribe: function(pid, callback) {
					callback(null, 'unexpected');
				}
			},
			hdrClient: {
				unsubscribe: function(siteId, pid, callback) {
					callback('error', null);
				}
			}
		};

		environment.jds.childInstance = function() { return environment.jds; };
		environment.vistaClient.childInstance = function() { return environment.vistaClient; };
		environment.hdrClient.childInstance = function() { return environment.hdrClient; };
		environment.solr.childInstance = function() { return environment.solr; };

		clearPatientUtil.clearPatient(log, config, environment, false, ['XHDR;1', 'YHDR;1', '12345V12345'], 'aaaaaa-bbbbbb-cccccc', function(error) {
			expect(error).toBeTruthy();
		});
	});

	it('Error path: jds returns error', function() {
		var environment = {
			jds: {
				removePatientIdentifier: function(jpid, callback) {
					callback('ERROR', {
						body: {}
					});
				}
			},
			solr: {
				deleteByQuery: function(pid, callback) {
					callback(null);
				}
			},
			vistaClient: {
				unsubscribe: function(pid, callback) {
					callback(null, 'success');
				}
			},
			hdrClient: {
				unsubscribe: function(siteId, pid, callback) {
					callback(null, 'success');
				}
			}
		};

		environment.jds.childInstance = function() { return environment.jds; };
		environment.vistaClient.childInstance = function() { return environment.vistaClient; };
		environment.hdrClient.childInstance = function() { return environment.hdrClient; };
		environment.solr.childInstance = function() { return environment.solr; };

		clearPatientUtil.clearPatient(log, config, environment, false, ['AAAA;1', 'BBBB;1', '12345V12345'], 'aaaaaa-bbbbbb-cccccc', function(error) {
			expect(error).toBeTruthy();
		});
	});

	it('Error path: jds returns unexpected response', function() {
		var environment = {
			jds: {
				removePatientIdentifier: function(jpid, callback) {
					callback(null, {
						statusCode: 100,
						body: {
							message: 'error!'
						}
					});
				}
			},
			solr: {
				deleteByQuery: function(pid, callback) {
					callback(null);
				}
			},
			vistaClient: {
				unsubscribe: function(pid, callback) {
					callback(null, 'success');
				}
			},
			hdrClient: {
				unsubscribe: function(siteId, pid, callback) {
					callback(null, 'success');
				}
			}
		};

		environment.jds.childInstance = function() { return environment.jds; };
		environment.vistaClient.childInstance = function() { return environment.vistaClient; };
		environment.hdrClient.childInstance = function() { return environment.hdrClient; };
		environment.solr.childInstance = function() { return environment.solr; };

		clearPatientUtil.clearPatient(log, config, environment, false, ['AAAA;1', 'BBBB;1', '12345V12345'], 'aaaaaa-bbbbbb-cccccc', function(error) {
			expect(error).toBeTruthy();
		});
	});

});