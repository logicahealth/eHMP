'use strict';

require('../../../../../env-setup');
var _ = require('underscore');
var log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next lines are commented out before pushing
// var logUtil = require(global.VX_UTILS + 'log');
// log = logUtil._createLogger({
//     name: 'test',
//     level: 'debug',
//     child: logUtil._createLogger
// });

var handler = require(global.VX_HANDLERS + 'osync/patientlist/patientlist');

var testHandler = require(global.VX_INTTESTS + 'framework/handler-test-framework').testHandler;
var moment = require('moment');
var PjdsClient = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');

var config = require(global.VX_ROOT + 'worker-config');

var host = require(global.VX_INTTESTS + 'test-config');
var port = 5001;
var tubename = 'sync';

var osyncJobUtils = require(global.OSYNC_UTILS + 'osync-job-utils');

var config = require(global.VX_ROOT + 'worker-config');

var mockConfig = {
    pjds: _.defaults(config.pjds, {
        protocol: 'http',
        host: '10.2.2.110',
        port: 9080
    }),
    delay: 5,
    rpcContext: 'HMP SYNCHRONIZATION CONTEXT',
    vistaSites: _.defaults(config.vistaSites, {
        '9E7A': {
            'name': 'panorama',
            'host': '10.2.2.101',
            'port': 9210,
            'accessCode': 'ep1234',
            'verifyCode': 'ep1234!!',
            'localIP': '127.0.0.1',
            'stationNumber': 500,
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 20000
        },
        'C877': {
            'name': 'kodak',
            'host': '10.2.2.102',
            'port': 9210,
            'accessCode': 'ep1234',
            'verifyCode': 'ep1234!!',
            'localIP': '127.0.0.1',
            'stationNumber': 500,
            'localAddress': 'localhost',
            'connectTimeout': 3000,
            'sendTimeout': 20000
        }
    })
};

var user = {
    uid: 'urn:va:user:9E7A:10000000002',
    site: '9E7A',
    id: '10000000002',
    lastSuccessfulLogin: moment().format('YYYYMMDDHHmmss')
};

describe('patientlist.handle', function() {
    beforeEach(function(done) {
        var pjds = new PjdsClient(log, log, mockConfig);
        pjds.addActiveUser(user, function(error, response) {
            expect(error).toBeFalsy();
            expect(response.statusCode).toBe(201);
            done();
        });
    });

    it('should generate sync jobs', function() {
        var environment = {
            pjds: new PjdsClient(log, log, mockConfig),
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
        var pjds = new PjdsClient(log, log, mockConfig);
        pjds.removeActiveUser(user.uid, function(error, response) {
            expect(error).toBeFalsy();
            expect(response.statusCode).toBe(200);
            done();
        });
    });
});