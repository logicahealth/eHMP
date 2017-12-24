'use strict';

require('../../../../../env-setup');
var _ = require('underscore');
var log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next lines are commented out before pushing
// var logUtil = require(global.VX_UTILS + 'log');
// log = logUtil._createLogger({
//     name: 'patientlist-itest-spec',
//     level: 'debug',
//     child: logUtil._createLogger
// });

var handler = require(global.VX_HANDLERS + 'osync/patientlist/patientlist');

var testHandler = require(global.VX_INTTESTS + 'framework/handler-test-framework').testHandler;
var moment = require('moment');
var PjdsClient = require('jds-cache-api').PjdsClient;
var val = require(global.VX_UTILS + 'object-utils').getProperty;

var config = require(global.VX_ROOT + 'worker-config');


var testConfig = require(global.VX_INTTESTS + 'test-config');
var host = testConfig.vxsyncIP;
var port = PORT;
var tubename = 'sync';

var osyncJobUtils = require(global.OSYNC_UTILS + 'osync-job-utils');

var config = require(global.VX_ROOT + 'worker-config');

var mockConfig = {
    pjds: _.defaults(config.pjds, {
        protocol: 'http',
        host: 'IP        ',
        port: PORT
    }),
    delay: 5,
    rpcContext: 'HMP SYNCHRONIZATION CONTEXT',
    vistaSites: _.defaults(config.vistaSites, {
        'SITE': {
            'name': 'panorama',
            'host': 'IP        ',
            'port': PORT,
            'accessCode': 'USER  ',
            'verifyCode': 'PW      ',
            'localIP': '127.0.0.1',
            'stationNumber': 500,
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 20000
        },
        'SITE': {
            'name': 'kodak',
            'host': 'IP        ',
            'port': PORT,
            'accessCode': 'USER  ',
            'verifyCode': 'PW      ',
            'localIP': '127.0.0.1',
            'stationNumber': 500,
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 20000
        }
    })
};

var user = {
    uid: 'urn:va:user:SITE:10000000002',
    site: 'SITE',
    id: '10000000002',
    lastSuccessfulLogin: moment().format('YYYYMMDDHHmmss')
};

describe('patientlist.handle', function() {
    beforeEach(function(done) {
        var pjds = new PjdsClient(log, log, mockConfig.pjds);
        pjds.addActiveUser(user, function(error, response) {
            log.debug('patientlist-itest-spec.handle: Response from call to pjds.addActiveUser.  error: %s, response: %j', error, response);
            expect(error).toBeFalsy();
            expect(val(response, 'statusCode')).toBe(201);
            done();
        });
    });

    it('should generate sync jobs', function() {
        var environment = {
            pjds: new PjdsClient(log, log, mockConfig.pjds),
            jobStatusUpdater: {
                createJobStatus: function(job, callback) {
                    callback();
                },
                errorJobStatus: function(job, error, callback) {
                    callback();
                }
            },
            metrics: log
        };

        var job = osyncJobUtils.createPatientListJob(log, {
            type: 'patientlist',
            user: user
        });

        var matchJobTypes = {jobTypes: ['sync'], ignoreTotalJobs: true};

        runs(function() {
            testHandler(handler, log, mockConfig, environment, host, port, tubename, job, matchJobTypes, 10000, function(result) {
                expect(result).toBeTruthy();
            });
        });
    });

    afterEach(function(done) {
        var pjds = new PjdsClient(log, log, mockConfig.pjds);
        pjds.removeActiveUser(user.uid, function(error, response) {
            expect(error).toBeFalsy();
            expect(response.statusCode).toBe(200);
            done();
        });
    });
});
