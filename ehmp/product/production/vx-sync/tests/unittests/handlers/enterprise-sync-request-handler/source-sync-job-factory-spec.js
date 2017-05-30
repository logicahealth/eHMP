'use strict';

require('../../../../env-setup');

var _ = require('underscore');

var jobUtil = require(global.VX_UTILS + 'job-utils');

var log = require(global.VX_DUMMIES + 'dummy-logger');
var timeUtil = require(global.VX_UTILS + 'time-utils');

// log = require('bunyan').createLogger({
//     name: 'source-sync-job-factory-spec',
//     level: 'debug'
// });

var mvi = require(global.VX_ROOT + 'mocks/mvi/mvi-mock');
var jobStates = require(global.VX_ROOT + 'mocks/jds/jds-mock-job-data');
var JobMiddleware = require(global.VX_UTILS + 'middleware/job-middleware');

var SourceSyncJobFactory = require(global.VX_HANDLERS + 'enterprise-sync-request/source-sync-job-factory');

var dodIdentifier = {
    type: 'pid',
    value: 'DOD;1234567'
};

var hdrIdentifier = {
    type: 'pid',
    value: 'HDR;111111'
};

var vistaHdrPidIdentifier1 = {
    'type': 'pid',
    'value': '3A8B;111',
};

var vistaHdrPidIdentifier2 = {
    'type': 'pid',
    'value': '8211;222',
};

var vlerIdentifier = {
    type: 'pid',
    value: 'VLER;222222'
};

var pgdIdentifier = {
    type: 'pid',
    value: 'DAS;333333'
};

var icnIdentifier = {
    'type': 'icn',
    'value': '10101V420870'
};

var pidIdentifier = {
    'type': 'pid',
    'value': '9E7A;42',
};

var otherPidIdentifier = {
    'type': 'pid',
    'value': 'C877;12',
};

var dummyPatientIdentifiersUsingHdrSecondary = [icnIdentifier, pidIdentifier, otherPidIdentifier, dodIdentifier, hdrIdentifier, vlerIdentifier, pgdIdentifier];
var dummyPatientIdentifiersUsingVistaHdr = [icnIdentifier, pidIdentifier, otherPidIdentifier, dodIdentifier, vlerIdentifier, pgdIdentifier, vistaHdrPidIdentifier1, vistaHdrPidIdentifier2];

var dummyMviResponse = {
    name: 'Eight,Patient',
    ids: [{
        type: 'icn',
        value: '10108V420871'
    }, {
        type: 'edipi',
        value: '000000003'
    }, {
        type: 'pid',
        value: '9E7A;3'
    }]
};

var hdrConfigForPubSub = {
    'operationMode' : 'PUB/SUB',
    'hdrSites' : {
        '3A8B': {
            'stationNumber': 42
        },
        'CF2A': {
            'stationNumber': 101
        },
        '72A0': {
            'stationNumber': 13
        },
        '8211': {
            'stationNumber': 1337
        },
        '84F0': {
            'stationNumber': 578
        }
    }
};

var jpidValue = '21EC2020-3AEA-4069-A2DD-CCCCCCCCCCCC';
var rootJobIdValue = '5';

function dummyJob(pid, jpid) {
    return {
        'type': 'enterprise-sync-request',
        'patientIdentifier': {
            'type': 'pid',
            'value': pid
        },
        'jpid': jpid || 'jpid',
        'jobId': '5',
        'rootJobId': rootJobIdValue,
        'force': true,
        'timestamp': Date.now()
    };
}

// function dummyMviResponse(pid) {
//     return _.find(mvi.patients, function(patient) {
//         return _.some(patient.ids, function(id) {
//             return id.type === 'pid' && id.value === pid;
//         });
//     });
// }

var options = {
    'config': {
        'vistaSites': {
            '9E7A': {
                'name': 'panorama',
                'stationNumber': 500,
            },
            'C877': {
                'name': 'kodak',
                'stationNumber': 500,
            }
        },
        'hdr': {
            'operationMode': 'REQ/RES'
        },
        'synchronizationRules': ['accept-all-rule']
    }
};

function _cloneOptions(job) {
    var opts = JSON.parse(JSON.stringify(options));
    opts.log = log;
    opts.job = job;
    opts.jobStatus = jobStates;
    return opts;
}

describe('source-sync-job-factory.js', function() {
    describe('_createJobs', function() {
        var module = SourceSyncJobFactory._test._createJobs;

        it('Creates a Jmeadows job from a DOD identifier', function() {
            var forcedJob = dummyJob('9E7A;42', jpidValue);
            forcedJob.referenceInfo = {
                requestId: 'source-sync-job-factory-jmeadows-requestId',
                sessionId: 'source-sync-job-factory-jmeadows-sessionId'
            };
            var opts = _cloneOptions(forcedJob);
            var job = module._createJmeadowsJob(opts, dodIdentifier);

            expect(jobUtil.isValid(jobUtil.jmeadowsSyncRequestType(), job)).toBe(true);

            expect(job.rootJobId).toEqual(forcedJob.jobId);
            expect(job.jpid).toEqual(forcedJob.jpid);

            expect(job.patientIdentifier.type).toEqual(dodIdentifier.type);
            expect(job.patientIdentifier.value).toEqual(dodIdentifier.value);

            expect(job.referenceInfo).toBeDefined();
            expect(job.referenceInfo.requestId).toBe('source-sync-job-factory-jmeadows-requestId');
            expect(job.referenceInfo.sessionId).toBe('source-sync-job-factory-jmeadows-sessionId');
        });

        it('Creates a HDR job from a HDR identifier', function() {
            var forcedJob = dummyJob('9E7A;42', jpidValue);
            forcedJob.referenceInfo = {
                requestId: 'source-sync-job-factory-hdr-requestId',
                sessionId: 'source-sync-job-factory-hdr-sessionId'
            };
            var opts = _cloneOptions(forcedJob);
            var job = module._createHdrJob(opts, hdrIdentifier);

            expect(jobUtil.isValid(jobUtil.jmeadowsSyncRequestType(), job)).toBe(true);

            expect(job.rootJobId).toEqual(forcedJob.jobId);
            expect(job.jpid).toEqual(forcedJob.jpid);

            expect(job.patientIdentifier.type).toEqual(hdrIdentifier.type);
            expect(job.patientIdentifier.value).toEqual(hdrIdentifier.value);

            expect(job.referenceInfo).toBeDefined();
            expect(job.referenceInfo.requestId).toBe('source-sync-job-factory-hdr-requestId');
            expect(job.referenceInfo.sessionId).toBe('source-sync-job-factory-hdr-sessionId');
        });

        it('Creates a VLER job from a VLER identifier', function() {
            var forcedJob = dummyJob('9E7A;42', jpidValue);
            forcedJob.referenceInfo = {
                requestId: 'source-sync-job-factory-vler-requestId',
                sessionId: 'source-sync-job-factory-vler-sessionId'
            };
            var opts = _cloneOptions(forcedJob);
            var job = module._createVlerJob(opts, vlerIdentifier);

            expect(jobUtil.isValid(jobUtil.jmeadowsSyncRequestType(), job)).toBe(true);

            expect(job.rootJobId).toEqual(forcedJob.jobId);
            expect(job.jpid).toEqual(forcedJob.jpid);

            expect(job.patientIdentifier.type).toEqual(vlerIdentifier.type);
            expect(job.patientIdentifier.value).toEqual(vlerIdentifier.value);

            expect(job.referenceInfo).toBeDefined();
            expect(job.referenceInfo.requestId).toBe('source-sync-job-factory-vler-requestId');
            expect(job.referenceInfo.sessionId).toBe('source-sync-job-factory-vler-sessionId');
        });

        it('Creates a PGD job from a PGD identifier', function() {
            var forcedJob = dummyJob('9E7A;42', jpidValue);
            forcedJob.referenceInfo = {
                requestId: 'source-sync-job-factory-pgd-requestId',
                sessionId: 'source-sync-job-factory-pgd-sessionId'
            };
            var opts = _cloneOptions(forcedJob);
            var job = module._createPgdJob(opts, pgdIdentifier);

            expect(jobUtil.isValid(jobUtil.jmeadowsSyncRequestType(), job)).toBe(true);

            expect(job.rootJobId).toEqual(forcedJob.jobId);
            expect(job.jpid).toEqual(forcedJob.jpid);

            expect(job.patientIdentifier.type).toEqual(pgdIdentifier.type);
            expect(job.patientIdentifier.value).toEqual(pgdIdentifier.value);

            expect(job.referenceInfo).toBeDefined();
            expect(job.referenceInfo.requestId).toBe('source-sync-job-factory-pgd-requestId');
            expect(job.referenceInfo.sessionId).toBe('source-sync-job-factory-pgd-sessionId');
        });

        it('Removes PIDs for unknown primary sources', function() {
            var forcedJob = dummyJob('9E7A;42', jpidValue);
            var opts = _cloneOptions(forcedJob);
            var pidList = [pidIdentifier];

            pidList.push({
                'type': 'pid',
                'value': 'ABCD;1'
            });
            pidList.push({
                'type': 'pid',
                'value': 'ABCE;1'
            });
            pidList.push({
                'type': 'pid',
                'value': 'ABCF;1'
            });
            pidList.push({
                'type': 'pid',
                'value': 'ABCG;1'
            });

            var filteredList = SourceSyncJobFactory.removeNonPrimaryVistaSites(opts, pidList);

            expect(filteredList.length).toBe(1);

            expect(filteredList[0].value).toEqual(pidIdentifier.value);

            pidList.push(otherPidIdentifier);

            filteredList = SourceSyncJobFactory.removeNonPrimaryVistaSites(opts, pidList);

            expect(filteredList.length).toBe(2);

            expect(filteredList[1].value).toEqual(otherPidIdentifier.value);
        });

        it('Creates primary source jobs from a list of PIDs', function() {
            var forcedJob = dummyJob('9E7A;42', jpidValue);
            forcedJob.referenceInfo = {
                requestId: 'source-sync-job-factory-primary-requestId',
                sessionId: 'source-sync-job-factory-primary-sessionId'
            };
            var opts = _cloneOptions(forcedJob);
            var pidList = [pidIdentifier, otherPidIdentifier];

            var jobs = module._createVistaJobs(opts, pidList);

            expect(jobs.length).toBe(2);

            // var type0 = jobUtil.vistaSubscribeRequestType(pidIdentifier._hash);
            // expect(jobUtil.isValid(type0, jobs[0], pidIdentifier._hash)).toBe(true);
            // var type1 = jobUtil.vistaSubscribeRequestType(otherPidIdentifier._hash);
            // expect(jobUtil.isValid(type1, jobs[1], otherPidIdentifier._hash)).toBe(true);

            expect(jobs[0].patientIdentifier.value).toEqual(pidIdentifier.value);
            expect(jobs[1].patientIdentifier.value).toEqual(otherPidIdentifier.value);

            _.each(jobs, function(job) {
                expect(job.rootJobId).toEqual(forcedJob.jobId);
                expect(job.jpid).toEqual(forcedJob.jpid);
                expect(job.patientIdentifier.type).toEqual('pid');
                expect(job.referenceInfo).toBeDefined();
                expect(job.referenceInfo.requestId).toBe('source-sync-job-factory-primary-requestId');
                expect(job.referenceInfo.sessionId).toBe('source-sync-job-factory-primary-sessionId');
            });
        });

        it('Creates VistaHdr source jobs from a list of PIDs', function() {
            var forcedJob = dummyJob('9E7A;42', jpidValue);
            forcedJob.referenceInfo = {
                requestId: 'source-sync-job-factory-vistahdr-requestId',
                sessionId: 'source-sync-job-factory-vistahdr-sessionId'
            };
            var opts = _cloneOptions(forcedJob);

            // Set up for HDR Pub/Sub mode
            //-----------------------------
            opts.config.hdr = hdrConfigForPubSub;

            var hdrPidIdentifiers = [vistaHdrPidIdentifier1, vistaHdrPidIdentifier2];

            var pidList = hdrPidIdentifiers;

            var jobs = module._createVistaHdrJobs(opts, pidList);

            expect(jobs.length).toBe(2);

            // var type0 = jobUtil.vistaSubscribeRequestType(pidIdentifier._hash);
            // expect(jobUtil.isValid(type0, jobs[0], pidIdentifier._hash)).toBe(true);
            // var type1 = jobUtil.vistaSubscribeRequestType(otherPidIdentifier._hash);
            // expect(jobUtil.isValid(type1, jobs[1], otherPidIdentifier._hash)).toBe(true);

            expect(jobs[0].patientIdentifier.value).toEqual(hdrPidIdentifiers[0].value);
            expect(jobs[1].patientIdentifier.value).toEqual(hdrPidIdentifiers[1].value);

            _.each(jobs, function(job) {
                expect(job.rootJobId).toEqual(forcedJob.jobId);
                expect(job.jpid).toEqual(forcedJob.jpid);
                expect(job.patientIdentifier.type).toEqual('pid');
                expect(job.referenceInfo).toBeDefined();
                expect(job.referenceInfo.requestId).toBe('source-sync-job-factory-vistahdr-requestId');
                expect(job.referenceInfo.sessionId).toBe('source-sync-job-factory-vistahdr-sessionId');
            });
        });
    });

    describe('_steps', function() {
        var module = SourceSyncJobFactory._test._steps;
        describe('_createJobsToPublishUsingHdrAsSecondary()', function() {
            it('Creates all jobs for a list of patient identifiers from MVI', function() {
                var forcedJob = dummyJob('9E7A;42', jpidValue);
                forcedJob.referenceInfo = {
                    requestId: 'create-jobs-to-publish-hdr-requestId',
                    sessionId: 'create-jobs-to-publish-hdr-sessionId'
                };
                var opts = _cloneOptions(forcedJob);
                var jobs = module._createJobsToPublish(opts, dummyPatientIdentifiersUsingHdrSecondary);

                expect(jobs.length).toBe(5);
                expect(jobs).toContain(jasmine.objectContaining({
                    type: 'vista-9E7A-subscribe-request',
                    patientIdentifier: {
                        type: 'pid',
                        value: '9E7A;42'
                    },
                    jpid: jpidValue,
                    rootJobId: rootJobIdValue,
                    referenceInfo: {
                        requestId: 'create-jobs-to-publish-hdr-requestId',
                        sessionId: 'create-jobs-to-publish-hdr-sessionId'
                    }
                }));
                expect(jobs).toContain(jasmine.objectContaining({
                    type: 'vista-C877-subscribe-request',
                    patientIdentifier: {
                        type: 'pid',
                        value: 'C877;12'
                    },
                    jpid: jpidValue,
                    rootJobId: rootJobIdValue,
                    referenceInfo: {
                        requestId: 'create-jobs-to-publish-hdr-requestId',
                        sessionId: 'create-jobs-to-publish-hdr-sessionId'
                    }
                }));
                expect(jobs).toContain(jasmine.objectContaining({
                    type: 'jmeadows-sync-request',
                    patientIdentifier: {
                        type: 'pid',
                        value: 'DOD;1234567'
                    },
                    jpid: jpidValue,
                    rootJobId: rootJobIdValue,
                    referenceInfo: {
                        requestId: 'create-jobs-to-publish-hdr-requestId',
                        sessionId: 'create-jobs-to-publish-hdr-sessionId'
                    }
                }));
                expect(jobs).toContain(jasmine.objectContaining({
                    type: 'hdr-sync-request',
                    patientIdentifier: {
                        type: 'pid',
                        value: 'HDR;111111'
                    },
                    jpid: jpidValue,
                    rootJobId: rootJobIdValue,
                    referenceInfo: {
                        requestId: 'create-jobs-to-publish-hdr-requestId',
                        sessionId: 'create-jobs-to-publish-hdr-sessionId'
                    }
                }));
                expect(jobs).toContain(jasmine.objectContaining({
                    type: 'vler-sync-request',
                    patientIdentifier: {
                        type: 'pid',
                        value: 'VLER;222222'
                    },
                    jpid: jpidValue,
                    rootJobId: rootJobIdValue,
                    referenceInfo: {
                        requestId: 'create-jobs-to-publish-hdr-requestId',
                        sessionId: 'create-jobs-to-publish-hdr-sessionId'
                    }
                }));
                // expect(jobs).toContain(jasmine.objectContaining({
                //     type: 'pgd-sync-request',
                //     patientIdentifier: {
                //         type: 'pid',
                //         value: 'DAS;333333'
                //     },
                //     jpid: jpidValue,
                //     rootJobId: rootJobIdValue
                // }));
            });
        });
        describe('_createJobsToPublishUsingVistaHdr()', function() {
            it('Creates all jobs for a list of patient identifiers from MVI', function() {
                var forcedJob = dummyJob('9E7A;42', jpidValue);
                forcedJob.referenceInfo = {
                    requestId: 'create-jobs-to-publish-vistahdr-requestId',
                    sessionId: 'create-jobs-to-publish-vistahdr-sessionId'
                };
                var opts = _cloneOptions(forcedJob);
                // Set up for HDR Pub/Sub mode
                //-----------------------------
                opts.config.hdr = hdrConfigForPubSub;

                var jobs = module._createJobsToPublish(opts, dummyPatientIdentifiersUsingVistaHdr);

                expect(jobs.length).toBe(6);
                expect(jobs).toContain(jasmine.objectContaining({
                    type: 'vista-9E7A-subscribe-request',
                    patientIdentifier: {
                        type: 'pid',
                        value: '9E7A;42'
                    },
                    jpid: jpidValue,
                    rootJobId: rootJobIdValue,
                    referenceInfo: {
                        requestId: 'create-jobs-to-publish-vistahdr-requestId',
                        sessionId: 'create-jobs-to-publish-vistahdr-sessionId'
                    }
                }));
                expect(jobs).toContain(jasmine.objectContaining({
                    type: 'vista-C877-subscribe-request',
                    patientIdentifier: {
                        type: 'pid',
                        value: 'C877;12'
                    },
                    jpid: jpidValue,
                    rootJobId: rootJobIdValue,
                    referenceInfo: {
                        requestId: 'create-jobs-to-publish-vistahdr-requestId',
                        sessionId: 'create-jobs-to-publish-vistahdr-sessionId'
                    }
                }));
                expect(jobs).toContain(jasmine.objectContaining({
                    type: 'jmeadows-sync-request',
                    patientIdentifier: {
                        type: 'pid',
                        value: 'DOD;1234567'
                    },
                    jpid: jpidValue,
                    rootJobId: rootJobIdValue,
                    referenceInfo: {
                        requestId: 'create-jobs-to-publish-vistahdr-requestId',
                        sessionId: 'create-jobs-to-publish-vistahdr-sessionId'
                    }
                }));
                expect(jobs).toContain(jasmine.objectContaining({
                    type: 'vler-sync-request',
                    patientIdentifier: {
                        type: 'pid',
                        value: 'VLER;222222'
                    },
                    jpid: jpidValue,
                    rootJobId: rootJobIdValue,
                    referenceInfo: {
                        requestId: 'create-jobs-to-publish-vistahdr-requestId',
                        sessionId: 'create-jobs-to-publish-vistahdr-sessionId'
                    }
                }));

                // expect(jobs).toContain(jasmine.objectContaining({
                //     type: 'pgd-sync-request',
                //     patientIdentifier: {
                //         type: 'pid',
                //         value: 'DAS;333333'
                //     },
                //     jpid: jpidValue,
                //     rootJobId: rootJobIdValue
                // }));
                expect(jobs).toContain(jasmine.objectContaining({
                    type: 'vistahdr-3A8B-subscribe-request',
                    patientIdentifier: {
                        type: 'pid',
                        value: '3A8B;111'
                    },
                    jpid: jpidValue,
                    rootJobId: rootJobIdValue,
                    referenceInfo: {
                        requestId: 'create-jobs-to-publish-vistahdr-requestId',
                        sessionId: 'create-jobs-to-publish-vistahdr-sessionId'
                    }
                }));
                expect(jobs).toContain(jasmine.objectContaining({
                    type: 'vistahdr-8211-subscribe-request',
                    patientIdentifier: {
                        type: 'pid',
                        value: '8211;222'
                    },
                    jpid: jpidValue,
                    rootJobId: rootJobIdValue,
                    referenceInfo: {
                        requestId: 'create-jobs-to-publish-vistahdr-requestId',
                        sessionId: 'create-jobs-to-publish-vistahdr-sessionId'
                    }
                }));
            });
        });
    });

    describe('_utilityFunctions', function() {
        describe('isSecondarySiteDisabled()', function() {
            var testConfig = { /**  test config for secondary site disable state **/
                jmeadows: {
                    disabled: true
                },
                vler: {},
                hdr: {}
            };
            it('Verify DoD Site is disabled', function() {
                var result = SourceSyncJobFactory.isSecondarySiteDisabled(testConfig, 'jmeadows');
                expect(result).toBe(true);
            });
            it('Verify Vler is enabled.', function() {
                var result = SourceSyncJobFactory.isSecondarySiteDisabled(testConfig, 'vler');
                expect(result).toBe(false);
            });
            it('Verify HDR is enabled.', function() {
                var result = SourceSyncJobFactory.isSecondarySiteDisabled(testConfig, 'hdr');
                expect(result).toBe(false);
            });
            it('Verify By Default a site is enabled.', function() {
                var result = SourceSyncJobFactory.isSecondarySiteDisabled(testConfig, '#$##%%');
                expect(result).toBe(false);
            });
            it('Verify DoD Site is now enabled ', function() {
                testConfig.jmeadows.disabled = false;
                var result = SourceSyncJobFactory.isSecondarySiteDisabled(testConfig, 'jmeadows');
                expect(result).toBe(false);
            });
            it('Verify Vler Site is now disabled ', function() {
                testConfig.vler.disabled = true;
                var result = SourceSyncJobFactory.isSecondarySiteDisabled(testConfig, 'vler');
                expect(result).toBe(true);
            });
            it('Verify HDR Site is now disabled ', function() {
                testConfig.hdr.disabled = true;
                var result = SourceSyncJobFactory.isSecondarySiteDisabled(testConfig, 'hdr');
                expect(result).toBe(true);
            });
        });
    });

    describe('SourceSyncJobFactory', function() {
        it('Creates all of the necessary jobs based on an MVI response', function() {
            var patientIdentifiers = dummyPatientIdentifiersUsingHdrSecondary;
            var filteredChildJobs;
            var forcedJob = dummyJob('9E7A;42', jpidValue);
            var opts = _cloneOptions(forcedJob);

            // var jobMiddleware = new JobMiddleware(opts.log, options.config, {});
            // var myOpts = _.clone(options);
            // myOpts.primaryJobVerifier = jobMiddleware.jobVerification.bind(null, [], {});
            // myOpts.secondaryJobVerifier = jobMiddleware.jobVerification.bind(null, ['completed'], {});
            // myOpts.jobStatus = function(jobHistoryObj, callback) {
            //     jobHistoryObj.jobStates = [{
            //         type: 'vista-9E7A-subscribe-request',
            //         jobId: '100',
            //         rootJobId: rootJobIdValue,
            //         jpid: jpidValue,
            //         timestamp: timeUtil.createStampTime(),
            //         pid: pidIdentifier.value,
            //         status: 'completed'
            //     }];
            //     callback();
            // };

            var jobStatusFunctionValue = function(jobHistoryObj, callback) {
                jobHistoryObj.jobStates = [{
                    type: 'vista-9E7A-subscribe-request',
                    jobId: '100',
                    rootJobId: rootJobIdValue,
                    jpid: jpidValue,
                    timestamp: timeUtil.createStampTime(),
                    pid: pidIdentifier.value,
                    status: 'completed'
                }];
                callback();
            };
            var job = dummyJob(pidIdentifier.value, jpidValue);
            var environment = {
                jobStatusFunction: jobStatusFunctionValue,
                metrics: opts.log,
                jds: {},
                jobStatusUpdater: {}
            };
            environment.jds.childInstance = function() { return environment.jds; };
            environment.jobStatusUpdater.childInstance = function() { return environment.jobStatusUpdater; };

            var sourceSyncJobFactory = new SourceSyncJobFactory(opts.log, opts.config, job, environment);
            //sourceSyncJobFactory.engine.rules = [require(global.VX_SYNCRULES + '/accept-all-rule')];

            runs(function() {
                sourceSyncJobFactory.createVerifiedJobs(patientIdentifiers, function(asyncError, jobs) {
                    filteredChildJobs = jobs;
                });
            });

            waitsFor(function() {
                return !_.isUndefined(filteredChildJobs);
            });

            runs(function() {
                expect(filteredChildJobs.length).toBe(5);
            });


        });
    });
    describe('removeNonPrimaryVistaSites()', function() {
        it('Create identfiers based on the results from MVI', function() {
            var opts = _cloneOptions();
            var patientIdList = [{
                type: 'icn',
                value: '10110V004877'
            }, {
                type: 'pid',
                value: 'C877;8'
            }, {
                type: 'pid',
                value: '9E7A;8'
            }];
            var newPatientIdList = patientIdList.concat([{
                type: 'pid',
                value: 'AAAA;111'
            }, {
                type: 'pid',
                value: 'DOD;111'
            }]);
            var expectedResult = SourceSyncJobFactory.removeNonPrimaryVistaSites(opts, newPatientIdList);


            expect(expectedResult.length).toBe(2);
            expect(expectedResult).toContain(jasmine.objectContaining({
                type: 'pid',
                value: '9E7A;8'
            }));
            expect(expectedResult).toContain(jasmine.objectContaining({
                type: 'pid',
                value: 'C877;8'
            }));
        });
    });

    describe('removeNonVistaHdrSites()', function() {
        it('Create identfiers based on the results from MVI', function() {
            var opts = _cloneOptions();

            // Set up for HDR Pub/Sub Mode
            //----------------------------
            opts.config.hdr = hdrConfigForPubSub;

            var expectedResult = SourceSyncJobFactory.removeNonVistaHdrSites(opts, dummyPatientIdentifiersUsingVistaHdr);

            expect(expectedResult.length).toBe(2);
            expect(expectedResult).toContain(jasmine.objectContaining(vistaHdrPidIdentifier1));
            expect(expectedResult).toContain(jasmine.objectContaining(vistaHdrPidIdentifier2));
        });
    });
});
