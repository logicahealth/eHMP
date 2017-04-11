'use strict';

require('../../../../env-setup');

var _ = require('underscore');

var handle = require(global.VX_HANDLERS + 'enterprise-sync-request/enterprise-sync-request-handler');

var jobUtil = require(global.VX_UTILS + 'job-utils');
var DummyRequest = require(global.VX_ROOT + 'tests/frames/dummy-request');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var PtDemographicsUtil = require(global.VX_UTILS + '/ptdemographics-utils');
var patIdCompareUtil = require(global.VX_DUMMIES + 'patient-id-comparator-dummy');

var log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({name: 'enterprise-sync-request-handler-spec', level: 'debug'});
// var inspect = require(global.VX_UTILS + 'inspect');

var patientIdList = [{
    type: 'icn',
    value: '10110V004877'
}, {
    type: 'edipi',
    value: '10110'
}, {
    type: 'pid',
    value: 'C877;8'
}, {
    type: 'pid',
    value: '9E7A;8'
}, {
    type: 'vhicid',
    value: '1111'
}];

var patientIdListVistaHdr = [{
    type: 'icn',
    value: '10110V004877'
}, {
    type: 'edipi',
    value: '10110'
}, {
    type: 'pid',
    value: 'C877;8'
}, {
    type: 'pid',
    value: '9E7A;8'
}, {
    'type': 'pid',
    'value': '3A8B;111',
}, {
    'type': 'pid',
    'value': '8211;222',
}, {
    type: 'vhicid',
    value: '1111'
}];

var patient = {
    name: 'Eight,Patient',
    ids: patientIdList
};

var patientIdentifiers = [{
    type: 'icn',
    value: '10110V004877'
}, {
    type: 'pid',
    value: 'C877;8'
}, {
    type: 'pid',
    value: '9E7A;8'
}, {
    type: 'pid',
    value: 'DOD;10110'
}, {
    type: 'pid',
    value: 'HDR;10110V004877'
}, {
    type: 'pid',
    value: 'VLER;10110V004877'
}, {
    type: 'pid',
    value: 'DAS;10110V004877'
}, {
    type: 'pid',
    value: 'VHICID;1111'
}];

var vistaSites = {
    '9E7A': {
        panorama: 'panorama',
        host: '127.0.0.1',
        port: 10001
    },
    'C877': {
        name: 'kodak',
        host: '127.0.0.1',
        port: 10002
    }
};

function mviLookup(patientIdentifier, callback) {
    callback(null, patient);
}

function mviErrorLookup(patientIdentifier, callback) {
    callback('mvi error');
}

function publish(jobsToPublish, handlerCallback) {
    handlerCallback(null, jobsToPublish);
}

function errorPublish(jobsToPublish, handlerCallback) {
    handlerCallback('router error');
}

function storePatientIdentifier(jdsIdentifiers, callback) {
    callback(null, patientIdentifiers);
}

function storeJdsIdentifiers(job, callback) {
    callback(null, {
        'statusCode': 200
    }, job);
}

var environment = {
    mvi: {
        lookup: function(identifiers, callback) {
            callback(404);
        }
    },
    publisherRouter: {
        publish: publish
    },
    jds: {
        storePatientIdentifier: storeJdsIdentifiers
    },
    jobStatusUpdater: {
        startJobStatus: function(job, callback) {
            job.status = 'started';
            this.writeStatus(job, callback);
        },
        createJobStatus: function(job, callback) {
            job.status = 'created';
            this.writeStatus(job, callback);
        },
        completeJobStatus: function(job, callback) {
            job.status = 'completed';
            this.writeStatus(job, callback);
        },
        writeStatus: jasmine.createSpy().andCallFake(function(job, callback) {
            callback(null, {
                'statusCode': 200
            }, job);
        })
    },
    patientIdComparator : patIdCompareUtil.detectAndResync 
};


environment.patientIdComparator =  patIdCompareUtil.detectAndResync;
var config = {
    'vistaSites': vistaSites,
    'hdr': {
        'operationMode': 'REQ/RES'
    }
};

var vistaHdrConfig = {
    'vistaSites': vistaSites,
    'hdr': {
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
    }
};

function has(jobs, jobType) {
    return _.some(jobs, function(job) {
        return job.type === jobType;
    });
}

//-----------------------------------------
// Create a local copy of the environment.
//-----------------------------------------
function createEnvironment() {
    var env = JSON.parse(JSON.stringify(environment));
    env.publisherRouter.publish = publish;
    env.jds.storePatientIdentifier = storeJdsIdentifiers;
    env.mvi.lookup = jasmine.createSpy().andCallFake(mviLookup);
    env.patientIdComparator =  patIdCompareUtil.detectAndResync;
    env.jds.storePatientIdentifier = jasmine.createSpy().andCallFake(storeJdsIdentifiers);
    return env;
}

//------------------------------------------------
// Create a local copy of the options.
//------------------------------------------------
function createOptions(log, config, env) {
    var requestJob = new DummyRequest({
        'pid': '9E7A;3'
    });

    requestJob.jpid = '00000000-0000-0000-0000-000000000000';
    requestJob.patientIdentifier = {
        'type': 'pid',
        'value': '9E7A;3'
    };
    var job = jobUtil.createEnterpriseSyncRequest(requestJob.patientIdentifier, requestJob.jpid, requestJob.force);
    job.jobId = 1;

    var opts = {
        'log': log,
        'config': config,
        'environment': env,
        'job': job,
        'jobStatusUpdater': env.jobStatusUpdater,
     //   'patientIdComparator' : patIdCompareUtil.detectAndResync ,
        'sourceSyncJobFactory': {},
        'handlerCallback': function(error) {
            console.log('TEST ERROR:', error);
        }
    };
    return opts;
}


describe('enterprise-sync-request-handler.js', function() {
    it('verify has()', function() {
        var env = createEnvironment();
        var opts = createOptions(log, config, env);
        var job2 = jobUtil.createVistaSubscribeRequest('C877', {
            type: 'pid',
            value: 'C877;8'
        });
        var job3 = jobUtil.createVistaSubscribeRequest('9E7A', {
            type: 'pid',
            value: '9E7A;8'
        });

        expect(has([opts.job], jobUtil.enterpriseSyncRequestType())).toBe(true);
        expect(has([job2], jobUtil.vistaSubscribeRequestType('C877'))).toBe(true);
        expect(has([opts.job], jobUtil.hdrXformVprType())).toBe(false);
        expect(has([job2, job3], jobUtil.vistaSubscribeRequestType('00A0'))).toBe(false);
    });

    describe('_validateJob()', function() {
        it('Errors on an invalid job', function() {
            var called = false;
            var expectedError;
            var expectedResult;
            var env = createEnvironment();
            var opts = createOptions(log, config, env);
            opts.job.patientIdentifier = {};
            runs(function() {
                handle(log, config, environment, opts.job, function(error, result) {
                    called = true;
                    expectedError = error;
                    expectedResult = result;
                });
            });

            waitsFor(function() {
                return called;
            }, 'should be called', 100);

            runs(function() {
                expect(expectedError).not.toBeUndefined();
                expect(expectedResult).toBeUndefined();
            });
        });
    });

    describe('_mviSteps', function() {
        describe('_queryMVI()', function() {
            it('Queries MVI against the job\'s PID', function() {
                var called = false;
                var env = createEnvironment();
                var opts = createOptions(log, config, env);

                runs(function() {
                    handle._steps._mviSteps._queryMVI.call(opts, function() {
                        called = true;
                    });
                });

                waitsFor(function() {
                    return called;
                }, 'should be called', 100);

                runs(function() {
                    expect(opts.environment.mvi.lookup).toHaveBeenCalled();
                });
            });

            it('Throws an error when MVI throws a weird error', function() {
                var called = false;
                var expectedError;
                var env = createEnvironment();
                var opts = createOptions(log, config, env);
                env.mvi = {
                    lookup: mviErrorLookup
                };
                opts.environment = env;

                runs(function() {
                    handle._steps._mviSteps._queryMVI.call(opts, function(error) {
                        called = true;
                        expectedError = error;
                    });
                });

                waitsFor(function() {
                    return called;
                }, 'should be called', 100);

                runs(function() {
                    expect(expectedError).not.toBeUndefined();
                });
            });

            it('Gets the MVI response and saves it to JDS when it is available', function() {
                var called = false;
                var expectedError;
                var expectedResult;
                var env = createEnvironment();
                var opts = createOptions(log, config, env);
                env.mvi = {
                    lookup: mviLookup
                };
                env.jds.storePatientIdentifier = jasmine.createSpy().andCallFake(storePatientIdentifier);
                opts.environment = env;

                runs(function() {
                    handle._steps._mviSteps._queryMVI.call(opts, function(error, result) {
                        called = true;
                        expectedError = error;
                        expectedResult = result;
                    });
                });

                waitsFor(function() {
                    return called;
                }, 'should be called', 100);

                runs(function() {
                    //                    expect(expectedResult.length).toBe(7);
                    expect(expectedResult.length).toBe(7);
                    expect(expectedResult).toContain(jasmine.objectContaining({
                        type: 'icn',
                        value: '10110V004877'
                    }));
                    expect(expectedResult).toContain(jasmine.objectContaining({
                        type: 'pid',
                        value: '9E7A;8'
                    }));
                    expect(expectedResult).toContain(jasmine.objectContaining({
                        type: 'pid',
                        value: 'C877;8'
                    }));
                    expect(expectedResult).toContain(jasmine.objectContaining({
                        type: 'pid',
                        value: 'DOD;10110'
                    }));
                    expect(expectedResult).toContain(jasmine.objectContaining({
                        type: 'pid',
                        value: 'HDR;10110V004877'
                    }));
                    expect(expectedResult).toContain(jasmine.objectContaining({
                        type: 'pid',
                        value: 'VHICID;1111'
                    }));
                    // expect(expectedResult).toContain(jasmine.objectContaining({ type: 'pid', value: 'VLER;10110V004877'}));
                    // expect(expectedResult).toContain(jasmine.objectContaining({ type: 'pid', value: 'DAS;10110V004877'}));
                    expect(opts.environment.jds.storePatientIdentifier).toHaveBeenCalled();
                });
            });
        });

        describe('_saveMviResults()', function() {
            it('Saves MVI results to JDS when asked', function() {
                var called = false;
                var expectedError;
                var expectedResult;
                var env = createEnvironment();
                var opts = createOptions(log, config, env);

                runs(function() {
                    handle._steps._mviSteps._saveMviResults.call(opts, {
                        'ids': patientIdList
                    }, function(error, result) {
                        called = true;
                        expectedError = error;
                        expectedResult = result;
                    });
                });

                waitsFor(function() {
                    return called;
                }, 'should be called', 100);

                runs(function() {
                    expect(expectedError).toBeNull();
                    expect(expectedResult).not.toBeUndefined();
                });
            });
        });

        describe('_createValidIdentifiers()', function() {
            it('Create identfiers based on the results from MVI using HDR as secondary site', function() {
                var env = createEnvironment();
                var opts = createOptions(log, config, env);

                var expectedResult = handle._steps._mviSteps._createValidIdentifiers.call(opts, {
                    'ids': patientIdList
                });

                expect(expectedResult.length).toBe(7);
                // expect(expectedResult.length).toBe(7);
                expect(expectedResult).toContain(jasmine.objectContaining({
                    type: 'icn',
                    value: '10110V004877'
                }));
                expect(expectedResult).toContain(jasmine.objectContaining({
                    type: 'pid',
                    value: '9E7A;8'
                }));
                expect(expectedResult).toContain(jasmine.objectContaining({
                    type: 'pid',
                    value: 'C877;8'
                }));
                expect(expectedResult).toContain(jasmine.objectContaining({
                    type: 'pid',
                    value: 'DOD;10110'
                }));
                expect(expectedResult).toContain(jasmine.objectContaining({
                    type: 'pid',
                    value: 'HDR;10110V004877'
                }));
                expect(expectedResult).toContain(jasmine.objectContaining({
                    type: 'pid',
                    value: 'VLER;10110V004877'
                }));
                expect(expectedResult).toContain(jasmine.objectContaining({
                    type: 'pid',
                    value: 'VHICID;1111'
                }));
                // expect(expectedResult).toContain(jasmine.objectContaining({ type: 'pid', value: 'DAS;10110V004877'}));
            });
            it('Create identfiers based on the results from MVI using VistaHdr', function() {
                var env = createEnvironment();
                var opts = createOptions(log, vistaHdrConfig, env);

                var expectedResult = handle._steps._mviSteps._createValidIdentifiers.call(opts, {
                    'ids': patientIdListVistaHdr
                });

                expect(expectedResult.length).toBe(8);
                // expect(expectedResult.length).toBe(7);
                expect(expectedResult).toContain(jasmine.objectContaining({
                    type: 'icn',
                    value: '10110V004877'
                }));
                expect(expectedResult).toContain(jasmine.objectContaining({
                    type: 'pid',
                    value: '9E7A;8'
                }));
                expect(expectedResult).toContain(jasmine.objectContaining({
                    type: 'pid',
                    value: 'C877;8'
                }));
                expect(expectedResult).toContain(jasmine.objectContaining({
                    type: 'pid',
                    value: 'DOD;10110'
                }));
                expect(expectedResult).toContain(jasmine.objectContaining({
                    type: 'pid',
                    value: '3A8B;111'
                }));
                expect(expectedResult).toContain(jasmine.objectContaining({
                    type: 'pid',
                    value: '8211;222'
                }));
                expect(expectedResult).toContain(jasmine.objectContaining({
                    type: 'pid',
                    value: 'VLER;10110V004877'
                }));
                expect(expectedResult).toContain(jasmine.objectContaining({
                    type: 'pid',
                    value: 'VHICID;1111'
                }));
                // expect(expectedResult).toContain(jasmine.objectContaining({ type: 'pid', value: 'DAS;10110V004877'}));
            });
        });
    });

    describe('_publishJobs()', function() {
        it('Successfully publishes subscribe and sync jobs', function() {
            var expectedError;
            var expectedResult;
            var env = createEnvironment();
            var opts = createOptions(log, config, env);
            var completed = false;
            var job2 = jobUtil.createVistaSubscribeRequest('C877', {
                type: 'pid',
                value: 'C877;8'
            });
            var job3 = jobUtil.createVistaSubscribeRequest('9E7A', {
                type: 'pid',
                value: '9E7A;8'
            });

            runs(function() {
                handle._steps._publishJobs.call(opts, [job2, job3], function(error, result) {
                    completed = true;
                    expectedError = error;
                    expectedResult = result;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'should be called', 100);

            runs(function() {
                expect(expectedError).toBeNull();
                expect(expectedResult.length).toBe(2);
            });
        });
    });

    describe('_createDemographics()', function() {
        it('Successfully publishes subscribe and sync jobs', function() {
            var expectedError;
            var expectedResult;
            var env = createEnvironment();
            var opts = createOptions(log, config, env);
            env.jds = new JdsClientDummy(opts.log, opts.config);
            opts.ptDemographicsUtil = new PtDemographicsUtil(opts.log, opts.config, opts.environment);

            spyOn(env.jds, 'getPtDemographicsByPid').andCallThrough();

            var demographicsFromVista = {
                'pid': '9E7A;3',
                'birthDate': '19350407',
                'last4': '0008',
                'last5': 'E0008',
                'icn': '10108V420871',
                'familyName': 'EIGHT',
                'givenNames': 'PATIENT',
                'fullName': 'EIGHT,PATIENT',
                'displayName': 'Eight,Patient',
                'genderCode': 'urn:va:pat-gender:M',
                'genderName': 'Male',
                'sensitive': false,
                'uid': 'urn:va:patient:9E7A:3:3',
                'summary': 'Eight,Patient',
                'ssn': '666000008',
                'localId': 3
            };
            var pidDod = 'DOD;10108V420871';
            var uidDod = 'urn:va:patient:DOD:10108V420871:10108V420871';

            var demographicsDod = _.clone(demographicsFromVista);
            demographicsDod.pid = pidDod;
            demographicsDod.uid = uidDod;
            opts.job.demographics = demographicsFromVista;

            var expectedJdsError = [null, null];
            var expectedJdsResponse = [{
                statusCode: 200
            }, {
                statusCode: 200
            }];
            var expectedJdsResult = [{
                data: {
                    items: [demographicsFromVista]
                }
            }, {
                data: {
                    items: [demographicsDod]
                }
            }];
            env.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

            var completed;
            var job2 = jobUtil.createJmeadowsSyncRequest({
                type: 'pid',
                value: pidDod
            });

            runs(function() {
                handle._steps._createDemographics.call(opts, [job2], function(error, result) {
                    completed = true;
                    expectedError = error;
                    expectedResult = result;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'should be called', 100);

            runs(function() {
                expect(expectedError).toBeNull();
                expect(expectedResult).not.toBeNull();
                if (expectedResult) {
                    expect(expectedResult.length).toBe(1);
                }
                expect(env.jds.getPtDemographicsByPid.calls.length).toEqual(2);
                expect(env.jds.getPtDemographicsByPid).toHaveBeenCalledWith(demographicsFromVista.pid, jasmine.any(Function));
                expect(env.jds.getPtDemographicsByPid).toHaveBeenCalledWith(pidDod, jasmine.any(Function));
            });
        });
        it('When initial syncJobs array is empty.', function() {
            var expectedError;
            var expectedResult;
            var env = createEnvironment();
            var opts = createOptions(log, config, env);
            env.jds = new JdsClientDummy(opts.log, opts.config);
            opts.ptDemographicsUtil = new PtDemographicsUtil(opts.log, opts.config, opts.environment);

            spyOn(env.jds, 'getPtDemographicsByPid').andCallThrough();

            var demographicsFromVista = {
                'pid': '9E7A;3',
                'birthDate': '19350407',
                'last4': '0008',
                'last5': 'E0008',
                'icn': '10108V420871',
                'familyName': 'EIGHT',
                'givenNames': 'PATIENT',
                'fullName': 'EIGHT,PATIENT',
                'displayName': 'Eight,Patient',
                'genderCode': 'urn:va:pat-gender:M',
                'genderName': 'Male',
                'sensitive': false,
                'uid': 'urn:va:patient:9E7A:3:3',
                'summary': 'Eight,Patient',
                'ssn': '666000008',
                'localId': 3
            };
            var pidDod = 'DOD;10108V420871';
            var uidDod = 'urn:va:patient:DOD:10108V420871:10108V420871';

            var demographicsDod = _.clone(demographicsFromVista);
            demographicsDod.pid = pidDod;
            demographicsDod.uid = uidDod;


            var expectedJdsError = [null, null];
            var expectedJdsResponse = [{
                statusCode: 200
            }, {
                statusCode: 200
            }];
            var expectedJdsResult = [{
                data: {
                    items: [demographicsFromVista]
                }
            }, {
                data: {
                    items: [demographicsDod]
                }
            }];
            env.jds._setResponseData(expectedJdsError, expectedJdsResponse, expectedJdsResult);

            var completed;
            runs(function() {
                handle._steps._createDemographics.call(opts, [], function(error, result) {
                    completed = true;
                    expectedError = error;
                    expectedResult = result;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'should be called', 100);

            runs(function() {
                expect(expectedError).toBeNull();
                expect(expectedResult.length).toBe(0);
                expect(env.jds.getPtDemographicsByPid.calls.length).toEqual(0);
            });
        });
    });

    describe('_validateDemographics()', function() {
        it('DOD only patient with no demographics will error', function() {
            var expectedError;
            var expectedResult;
            var env = createEnvironment();
            var opts = createOptions(log, config, env);

            var pidDod = 'DOD;10108V420871';
            var job2 = {
                type: 'pid',
                value: pidDod
            };
            var jobs = [job2];
            var completed = false;
            runs(function() {
                handle._steps._validateDemographics.call(opts, jobs, function(error, result) {
                    completed = true;
                    expectedError = error;
                    expectedResult = result;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'should be called', 100);

            runs(function() {
                expect(expectedError).not.toBeUndefined();
                expect(expectedResult).toBeNull();
            });
        });
        it('ICN Only with no HDR patient with no demographics will error', function() {
            var expectedError;
            var expectedResult;
            var env = createEnvironment();
            var opts = createOptions(log, config, env);

            var job1 = {
                type: 'pid',
                value: 'DOD;10108V420871'
            };
            var job2 = {
                type: 'pid',
                value: 'VLER;10108V420871'
            };
            var jobs = [job1, job2];
            var completed = false;
            runs(function() {
                handle._steps._validateDemographics.call(opts, jobs, function(error, result) {
                    completed = true;
                    expectedError = error;
                    expectedResult = result;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'should be called', 100);

            runs(function() {
                expect(expectedError).not.toBeUndefined();
                expect(expectedResult).toBeNull();
            });
        });
        it('ICN Only with HDR patient and no demographics will error', function() {
            var expectedError;
            var expectedResult;
            var env = createEnvironment();
            var opts = createOptions(log, config, env);

            var jobs = [{
                type: 'icn',
                value: '4325679V4325679'
            }, {
                type: 'pid',
                value: 'HDR;4325679V4325679'
            }, {
                type: 'pid',
                value: 'VLER;4325679V4325679'
            }];
            var completed = false;
            runs(function() {
                handle._steps._validateDemographics.call(opts, jobs, function(error, result) {
                    completed = true;
                    expectedError = error;
                    expectedResult = result;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'should be called', 100);

            runs(function() {
                expect(expectedError).not.toBeUndefined();
                expect(expectedResult).toBeNull();
            });
        });
        it('Patient with primary site', function() {
            var expectedError;
            var expectedResult;
            var env = createEnvironment();
            var opts = createOptions(log, config, env);

            var jobs = [{
                type: 'pid',
                value: '9E7A;432'
            }, {
                type: 'pid',
                value: 'HDR;4325679V4325679'
            }, {
                type: 'pid',
                value: 'VLER;4325679V4325679'
            }];
            var completed = false;
            runs(function() {
                handle._steps._validateDemographics.call(opts, jobs, function(error, result) {
                    completed = true;
                    expectedError = error;
                    expectedResult = result;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'should be called', 100);

            runs(function() {
                expect(expectedResult).not.toBeUndefined();
                expect(expectedError).toBeNull();
            });
        });
        it('Patient with out primary site but demographics are provided', function() {
            var expectedError;
            var expectedResult;
            var env = createEnvironment();
            var opts = createOptions(log, config, env);

            opts.job = {};
            opts.job.demographics = { /* anything in here */ };
            var jobs = [{
                type: 'icn',
                value: '4325679V4325679'
            }, {
                type: 'pid',
                value: 'HDR;4325679V4325679'
            }, {
                type: 'pid',
                value: 'VLER;4325679V4325679'
            }];
            var completed = false;
            runs(function() {
                handle._steps._validateDemographics.call(opts, jobs, function(error, result) {
                    completed = true;
                    expectedError = error;
                    expectedResult = result;
                });
            });

            waitsFor(function() {
                return completed;
            }, 'should be called', 100);

            runs(function() {
                expect(expectedResult).not.toBeUndefined();
                expect(expectedError).toBeNull();
            });
        });
    });

    describe('handle()', function() {
        it('verify mvi error', function() {
            var called = false;
            var expectedError;
            var expectedResult;
            var env = createEnvironment();
            var opts = createOptions(log, config, env);

            opts.environment.jds.getJobStatus = function(job, callback) {
                callback(200, []);
            };

            opts.environment.mvi.lookup = mviErrorLookup;

            runs(function() {
                handle(opts.log, opts.config, opts.environment, opts.job, function(error, result) {
                    called = true;
                    expectedError = error;
                    expectedResult = result;
                });
            });

            waitsFor(function() {
                return called;
            }, 'should return an error that is ', 1000);

            runs(function() {
                expect(expectedError.message).toEqual('mvi error');
            });
        });

        xit('verify publish error', function() {
            var called = false;
            var expectedError;
            var expectedResult;
            var env = createEnvironment();
            var opts = createOptions(log, config, env);

            opts.environment.jds.getJobStatus = function(job, callback) {
                callback(null, {
                    'statusCode': 200
                }, []);
            };

            opts.environment.publisherRouter.publish = errorPublish;

            runs(function() {
                handle(opts.log, opts.config, opts.environment, opts.job, function(error, result) {
                    called = true;
                    expectedError = error;
                    expectedResult = result;
                });
            });

            waitsFor(function() {
                return called;
            }, 'should return an error that is defined and not null', 1000);

            runs(function() {
                expect(expectedError).toEqual('router error');
            });
        });

        xit('verify success', function() {
            var called = false;
            var expectedResult;
            var env = createEnvironment();
            var opts = createOptions(log, config, env);

            opts.environment.mvi.lookup = function(identifier, callback) {
                callback(null, {
                    'ids': patientIdList
                });
            };
            opts.environment.publisherRouter.publish = publish;

            handle(opts.log, opts.config, opts.environment, opts.job, function(error, result) {
                called = true;
                expectedResult = result;
            });

            waitsFor(function() {
                return called;
            }, 'should return an error or result that is not undefined', 1000);

            runs(function() {
                expect(expectedResult.length).not.toBeUndefined();
            });
        });
    });
});