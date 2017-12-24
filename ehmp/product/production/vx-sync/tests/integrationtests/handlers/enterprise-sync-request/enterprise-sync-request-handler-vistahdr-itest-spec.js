'use strict';

var _ = require('underscore');
// var inspect = _.partial(require('util').inspect, _, {
//     depth: null
// });

require('../../../../env-setup');

var logger = require(global.VX_DUMMIES + 'dummy-logger');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var testHandler = require(global.VX_INTTESTS + 'framework/handler-test-framework').testHandler;
var patientIdUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var handler = require(global.VX_HANDLERS + 'enterprise-sync-request/enterprise-sync-request-handler');
var VistaClient = require(global.VX_SUBSYSTEMS + 'vista/vista-client');
// var queueConfig = require(global.VX_JOBFRAMEWORK).QueueConfig;
var val = require(global.VX_UTILS + 'object-utils').getProperty;

var testConfig = require(global.VX_INTTESTS + 'test-config');
var vx_sync_ip = testConfig.vxsyncIP;

// var PublisherRouter = require(global.VX_JOBFRAMEWORK).PublisherRouter;
var MviClient = require(global.VX_SUBSYSTEMS + 'mvi/mvi-client');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var JobStatusUpdater = require(global.VX_SUBSYSTEMS + 'jds/JobStatusUpdater');
var wConfig = require(global.VX_ROOT + 'worker-config');

// logger = require('bunyan').createLogger({
//     name: 'dummy-log',
//     level: 'debug'
// });

xdescribe('enterprise-sync-request-handler.js', function() {
    var patientIdentifier = patientIdUtil.create('icn', '5000000123V015819');
    var jpid;
    var job;
    var host = vx_sync_ip;
    var port = PORT;
    var tubename = 'vx-sync-test';

    var beanstalkConfig = ({
        repoUniversal: {
            priority: 10,
            delay: 0,
            ttr: 60,
            timeout: 10,
            initMillis: 1000,
            maxMillis: 15000,
            incMillis: 1000
        },
        repoDefaults: {
            host: host,
            port: port,
            tubename: tubename,
            tubePrefix: 'vxs-',
            jobTypeForTube: false
        },
        jobTypes: {
            'enterprise-sync-request': {},
            'vista-operational-subscribe-request': {},

            'vista-SITE-subscribe-request': {},
            'vista-SITE-subscribe-request': {},
            'vistahdr-SITE-subscribe-request': {},
            'vistahdr-SITE-subscribe-request': {},

            'hdr-sync-request': {},
            'vler-sync-request': {},
            'pgd-sync-request': {},
            'jmeadows-sync-request': {},

            'hdr-xform-vpr': {},
            'vler-xform-vpr': {},
            'pgd-xform-vpr': {},

            'jmeadows-sync-allergy-request': {},
            'jmeadows-sync-appointment-request': {},
            'jmeadows-sync-consult-request': {},
            'jmeadows-sync-demographics-request': {},
            'jmeadows-sync-dischargeSummary-request': {},
            'jmeadows-sync-encounter-request': {},
            'jmeadows-sync-immunization-request': {},
            'jmeadows-sync-lab-request': {},
            'jmeadows-sync-medication-request': {},
            'jmeadows-sync-note-request': {},
            'jmeadows-sync-order-request': {},
            'jmeadows-sync-problem-request': {},
            'jmeadows-sync-progressNote-request': {},
            'jmeadows-sync-radiology-request': {},
            'jmeadows-sync-vital-request': {},

            'jmeadows-xform-allergy-vpr': {},
            'jmeadows-xform-appointment-vpr': {},
            'jmeadows-xform-consult-vpr': {},
            'jmeadows-xform-demographics-vpr': {},
            'jmeadows-xform-dischargeSummary-vpr': {},
            'jmeadows-xform-encounter-vpr': {},
            'jmeadows-xform-immunization-vpr': {},
            'jmeadows-xform-lab-vpr': {},
            'jmeadows-xform-medication-vpr': {},
            'jmeadows-xform-note-vpr': {},
            'jmeadows-xform-order-vpr': {},
            'jmeadows-xform-problem-vpr': {},
            'jmeadows-xform-progressNote-vpr': {},
            'jmeadows-xform-radiology-vpr': {},
            'jmeadows-xform-vital-vpr': {},

            'jmeadows-pdf-document-transform': {},
            'jmeadows-document-retrieval': {},

            'record-enrichment': {},
            'store-record': {},
            'event-prioritization-request': {},
            'operational-store-record': {},
            'publish-data-change-event': {},
            'patient-data-state-checker': {}
        }
    });

    var vistaHdrConfig = {
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
                'sendTimeout': 10000,
                'stationNumber': 500
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
                'sendTimeout': 10000,
                'stationNumber':507
            })
        },
        beanstalkConfig: beanstalkConfig,
        mvi: {
            protocol: 'http',
            host: vx_sync_ip,
            port: 5400,
            path: '/mvi/correspondingIds'
        },
        jds: _.defaults(wConfig.jds, {
            protocol: 'http',
            host: 'IP        ',
            port: PORT
        }),
        rules: {
            'accept-all': {},
            'rapid-fire': {},
            // 'operational-data-sync': {},
            'expiration': {
                'default': 3600000,
                'dod': 3600000
            }
        },
        synchronizationRules: ['accept-all-rule'],
        'hdr': {
            'operationMode': 'PUB/SUB',
            'hdrSites': {
                'SITE': {
                    'stationNumber': '536'
                },
                'SITE': {
                    'stationNumber': '551'
                },
                'SITE': {
                    'stationNumber': '547'
                }
            }
        },
        'vistaSitesByStationCombined': {
            '500': _.defaults(wConfig.vistaSites['SITE'], {
                'name': 'panorama',
                'host': 'IP        ',
                'port': PORT,
                'accessCode': 'USER  ',
                'verifyCode': 'PW      ',
                'localIP': '127.0.0.1',
                'localAddress': 'localhost',
                'connectTimeout': 3000,
                'sendTimeout': 10000,
                'stationNumber': 500,
                'siteHash': 'SITE'
            }),
            '507': _.defaults(wConfig.vistaSites.SITE, {
                'name': 'kodak',
                'host': 'IP        ',
                'port': PORT,
                'accessCode': 'USER  ',
                'verifyCode': 'PW      ',
                'localIP': '127.0.0.1',
                'localAddress': 'localhost',
                'connectTimeout': 3000,
                'sendTimeout': 10000,
                'stationNumber':507,
                'siteHash': 'SITE'
            }),
            '536': _.defaults(wConfig.hdr.hdrSites.SITE, {
                'name': 'panorama',
                'host': 'IP        ',
                'port': PORT,
                'accessCode': 'USER  ',
                'verifyCode': 'PW      ',
                'localIP': '127.0.0.1',
                'localAddress': 'localhost',
                'connectTimeout': 3000,
                'sendTimeout': 10000,
                'stationNumber': 536,
                'siteHash': 'SITE'
            }),
            '551': _.defaults(wConfig.hdr.hdrSites['SITE'], {
                'name': 'panorama',
                'host': 'IP        ',
                'port': PORT,
                'accessCode': 'USER  ',
                'verifyCode': 'PW      ',
                'localIP': '127.0.0.1',
                'localAddress': 'localhost',
                'connectTimeout': 3000,
                'sendTimeout': 10000,
                'stationNumber': 551,
                'siteHash': 'SITE'
            }),
            '547': {
                'stationNumber': 547,
                'siteHash': 'SITE'
            }
        }
    };

    var vistaHdrEnvironment = {
        // publisherRouter: {},
        mvi: new MviClient(logger, logger, vistaHdrConfig),
        jds: new JdsClient(logger, logger, vistaHdrConfig),
        metrics: logger,
        vistaClient: new VistaClient(logger, logger, vistaHdrConfig, null)
    };
    vistaHdrEnvironment.jobStatusUpdater = new JobStatusUpdater(logger, vistaHdrConfig, vistaHdrEnvironment.jds);
    // vistaHdrEnvironment.publisherRouter = new PublisherRouter(logger, vistaHdrConfig, vistaHdrEnvironment.jobStatusUpdater);

    var vistaHdrMatchingJobTypes = [
        jobUtil.vistaSubscribeRequestType('SITE'),
        jobUtil.vistaSubscribeRequestType('SITE'),
        jobUtil.vistahdrSubScribeRequestType('SITE'),
        jobUtil.vistahdrSubScribeRequestType('SITE'),
        jobUtil.vistahdrSubScribeRequestType('SITE'),
        // jobUtil.pgdSyncRequestType(),
        jobUtil.vlerSyncRequestType(),
        // jobUtil.jmeadowsSyncRequestType()    //5000000123V015819 does not have a DOD record
    ];

    it('Set up and run test', function() {

        var setUpDone = false;

        runs(function() {
            vistaHdrEnvironment.jds.storePatientIdentifier({
                patientIdentifiers: [patientIdentifier.value]
            }, function(error, response) {
                expect(error).toBeFalsy();

                jpid = val(response, ['headers', 'location']).replace(/(^http:\/\/.*\/vpr\/jpid\/)/, '');
                job = jobUtil.createEnterpriseSyncRequest(patientIdentifier, jpid, false);

                setUpDone = true;
            });
        });

        waitsFor(function() {
            return setUpDone;
        }, 'set up', 20000);

        runs(function() {
            testHandler(handler, logger, vistaHdrConfig, vistaHdrEnvironment, host, port, tubename, job, vistaHdrMatchingJobTypes, 90000, function(result) {
                expect(result).toBeTruthy();
            });
        });
    });

    afterEach(function() {
        var checkIdentifiersDone = false;
        // var expectedPatientIdentifierValues = [ '5000000123V015819', 'SITE;100625', 'SITE;100625', 'HDR;5000000123V015819', 'DAS;5000000123V015819', 'VLER;5000000123V015819' ];
        var expectedPatientIdentifierValues = ['SITE;258', '5000000123V015819', 'SITE;268', 'SITE;100622', 'SITE;100622', 'SITE;249', 'JPID;' + jpid, 'VLER;5000000123V015819'];
        var jdsError, jdsResponse;
        runs(function() {
            vistaHdrEnvironment.jds.getPatientIdentifier(job, function(error, response) {
                checkIdentifiersDone = true;
                jdsError = error;
                jdsResponse = response;
            });
        });

        waitsFor(function() {
            return checkIdentifiersDone;
        }, 'response from JDS', 10000);

        var teardownDone = false;

        runs(function() {
            expect(jdsError).toBeFalsy();
            expect(jdsResponse).toBeTruthy();
            expect(val(jdsResponse, 'statusCode')).toEqual(200);

            var body;
            try {
                body = JSON.parse(jdsResponse.body);
            } catch (error) {
                // Do nothing
            }

            expect(val(body, 'patientIdentifiers')).toEqual(expectedPatientIdentifierValues);
            vistaHdrEnvironment.jds.deletePatientByPid(patientIdentifier.value, function() {
                teardownDone = true;
            });
        });

        waitsFor(function() {
            return teardownDone;
        }, 'clear test patient from JDS');
    });

});