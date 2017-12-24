'use strict';

require('../../../../env-setup');

var _ = require('underscore');
var log = require(global.VX_DUMMIES + '/dummy-logger');
// NOTE: be sure next lines are commented out before pushing
// var logUtil = require(global.VX_UTILS + 'log');
// log = logUtil._createLogger({
// 	name: 'test',
// 	level: 'debug',
// 	child: logUtil._createLogger
// });
var wConfig = require(global.VX_ROOT + 'worker-config');
var testConfig = require(global.VX_INTTESTS + 'test-config');
var host = testConfig.vxsyncIP;
var hostPort = testConfig.vxsyncPort;
var handler = require(global.VX_HANDLERS + 'sync-notification/sync-notification-handler');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var testHandler = require(global.VX_INTTESTS + 'framework/handler-test-framework').testHandler;
const VistaClient = require(global.VX_SUBSYSTEMS + 'vista/vista-client');

describe('sync-notification-handler', function() {
	it('successfully calls sync doLoad', function() {
		var config = {
			retrySync: {
				maxRetries: 3
			},
			syncRequestApi: {
				protocol: 'http',
				host: host,
				port: hostPort,
				patientSyncPath: '/sync/doLoad',
				patientUnsyncPath: '/sync/clearPatient',
				patientStatusPath: '/sync/status',
				patientSyncDemoPath: '/sync/demographicSync',
				method: 'POST'
			},
            'vistaSites': {
                'SITE': _.defaults(wConfig.vistaSites['SITE'], {
                    'name': 'panorama',
                    'host': 'IP        ',
                    'port': PORT,
                    'accessCode': 'USER  ',
                    'verifyCode': 'PW      ',
                    'localIP': '127.0.0.1',
                    'localAddress': 'localhost',
                    'connectTimeout': 3000,
                    'sendTimeout': 10000
                }),
                'SITE': _.defaults(wConfig.vistaSites.SITE, {
                    'name': 'kodak',
                    'host': 'IP        ',
                    'port': PORT,
                    'accessCode': 'USER  ',
                    'verifyCode': 'PW      ',
                    'localIP': '127.0.0.1',
                    'localAddress': 'localhost',
                    'connectTimeout': 3000,
                    'sendTimeout': 10000
                })
            },
			jds: _.defaults(wConfig.jds, {
				protocol: 'http',
				host: 'IP        ',
				port: PORT
			})
		};

		var environment = {
			metrics: log,
			jds: new JdsClient(log, log, config),
            vistaClient: new VistaClient(log, log, config, null)
        };

		var job = {
			type: 'sync-notification',
			timestamp: '20170517094313',
			patientIdentifier: {
				type: 'pid',
				value: 'SITE;24'
			},
			dataDomain: 'discharge',
			record: {},
			jobId: '234ae-45a7c-293da-acd2a-4dab5',
			priority: 1,
			referenceInfo: {
				requestId: 'sync-notification-handler-itest'
			}
		};

		var port = PORT;
		var tubename = 'sync-notification-handler-itest';
		var matchingJobTypes = ['publish-data-change-event'];
		testHandler(handler, log, config, environment, host, port, tubename, job, matchingJobTypes);
	});
});