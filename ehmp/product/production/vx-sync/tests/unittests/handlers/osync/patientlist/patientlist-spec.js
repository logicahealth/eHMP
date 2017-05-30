'use strict';

require('../../../../../env-setup');

var _ = require('underscore');
var log = require(global.VX_DUMMIES + 'dummy-logger');
// var log = require('bunyan').createLogger({
//     name: 'patientlist-spec',
//     level: 'debug'
// });

var handle = require(global.VX_HANDLERS + 'osync/patientlist/patientlist');
var validate = require(global.VX_HANDLERS + 'osync/patientlist/patientlist')._validate;
var createAndPublishPatientSyncJobs = require(global.VX_HANDLERS + 'osync/patientlist/patientlist')._createAndPublishPatientSyncJobs;
var createPatientSyncJobs = require(global.VX_HANDLERS + 'osync/patientlist/patientlist')._createPatientSyncJobs;

var ERROR_MESSAGE = 'AnErrorOcurred';

var referenceInfo = {
    sessionId: 'patientlist-sessionId',
    utilityType: 'Osync Patient List Handler Unit Test'
};

//-----------------------------------------------------------------------------
// Return an instance of the osyncConfig variable.
//
// returns: The osyncConfig variable that was created.
//-----------------------------------------------------------------------------
function createOsyncConfig() {
    var osyncConfig = {};

    return osyncConfig;
}

//---------------------------------------------------------------------------------------------
// Create an environment variable and fill in with needed handles to shared objects.
//
// mockPublisherRouter: A handle to the mock interface for publisherRouter.
// mockPatientListVistaRetriever: A handle to the mock interface for patientListVistaRetriever
// returns: The environment variable that was created
//----------------------------------------------------------------------------------------------
function createEnvironment(mockPublisherRouter, mockPatientListVistaRetriever) {
    var environment = {};

    if (mockPublisherRouter) {
        environment.publisherRouter = mockPublisherRouter;
        spyOn(environment.publisherRouter, 'publish').andCallThrough();
    }

    if (mockPatientListVistaRetriever) {
        environment.patientListVistaRetriever = mockPatientListVistaRetriever;
        spyOn(environment.patientListVistaRetriever, 'getPatientListForOneUser').andCallThrough();
    }

    return environment;
}

//--------------------------------------------------------------------------
// Create a list of patients to be used in the test.
//
// returns: The array of patients.
//--------------------------------------------------------------------------
function createPatientList() {
    var patients = [{
        'dfn': '3',
        'name': 'EIGHT,PATIENT',
        'roomBed': '722-B',
        'siteId': '9E7A'
    }, {
        'dfn': '100162',
        'name': 'TWOHUNDREDSIXTEEN,PATIENT',
        'roomBed': '',
        'siteId': '9E7A'
    }];

    return patients;
}

//-------------------------------------------------------------------------------------------------------------
// Verify that the jobs that will be published were correct.
//
// jobs: The jobs to be verified.
//-------------------------------------------------------------------------------------------------------------
function verifyJobs(jobs) {
    expect(_.isArray(jobs)).toBe(true);
    expect(jobs.length).toBe(2);
    expect(jobs).toContain({
        type: 'sync',
        jpid: jasmine.any(String),
        source: 'patient lists',
        patient: {
            dfn: '3',
            name: 'EIGHT,PATIENT',
            roomBed: '722-B',
            siteId: '9E7A'
        },
        siteId: '9E7A',
        referenceInfo: referenceInfo
    });
    expect(jobs).toContain({
        type: 'sync',
        jpid: jasmine.any(String),
        source: 'patient lists',
        patient: {
            dfn: '100162',
            name: 'TWOHUNDREDSIXTEEN,PATIENT',
            roomBed: '',
            siteId: '9E7A'
        },
        siteId: '9E7A',
        referenceInfo: referenceInfo
    });
}


//-------------------------------------------------------------------------------------------------------------
// Verify that the jobs sent to the publisher were correct.
//
// environment: The environment variable that contains the handle to the publisher
//-------------------------------------------------------------------------------------------------------------
function verifyJobPublishArgs(environment) {
    expect(environment.publisherRouter.publish).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Function));
    var args = environment.publisherRouter.publish.calls[0].args;
    expect(_.isArray(args)).toBe(true);
    expect(args.length).toBe(2);
    verifyJobs(args[0]);
}



describe('patientlist', function() {
    describe('validate method', function() {
        it('Null job fails validation.', function() {
            var job = null;
            var errorMessage = validate(job);
            expect(errorMessage).toBe('patientlist.validate: Job did not exist.');
        });
        it('Undefined job fails validation.', function() {
            var job;
            var errorMessage = validate(job);
            expect(errorMessage).toBe('patientlist.validate: Job did not exist.');
        });
        it('Missing job type fails validation.', function() {
            var job = {};
            var errorMessage = validate(job);
            expect(errorMessage).toBe('patientlist.validate: Could not find job type');
        });
        it('Incorrect job type fails validation.', function() {
            var job = {
                'type': 'something-else'
            };
            var errorMessage = validate(job);
            expect(errorMessage).toBe('patientlist.validate: job type was not patientlist');
        });
        it('Null user fails validation.', function() {
            var job = {
                'type': 'patientlist',
                'user': null
            };
            var errorMessage = validate(job);
            expect(errorMessage).toBe('patientlist.validate: User did not exist in the job.');
        });
        it('Undefined user fails validation.', function() {
            var job = {
                'type': 'patientlist'
            };
            var errorMessage = validate(job);
            expect(errorMessage).toBe('patientlist.validate: User did not exist in the job.');
        });
        it('Undefined user id fails validation.', function() {
            var job = {
                'type': 'patientlist',
                'user': {}
            };
            var errorMessage = validate(job);
            expect(errorMessage).toBe('patientlist.validate: User id was not in the job.');
        });
        it('Null user id fails validation.', function() {
            var job = {
                'type': 'patientlist',
                'user': {
                    'id': null
                }
            };
            var errorMessage = validate(job);
            expect(errorMessage).toBe('patientlist.validate: User id was not in the job.');
        });
        it('Undefined user site fails validation.', function() {
            var job = {
                'type': 'patientlist',
                'user': {
                    'id': '12345'
                }
            };
            var errorMessage = validate(job);
            expect(errorMessage).toBe('patientlist.validate: Site was not in the job.');
        });
        it('Null user site fails validation.', function() {
            var job = {
                'type': 'patientlist',
                'user': {
                    'id': '12345',
                    'site': null
                }
            };
            var errorMessage = validate(job);
            expect(errorMessage).toBe('patientlist.validate: Site was not in the job.');
        });
        it('Valid job passes validation.', function() {
            var job = {
                'type': 'patientlist',
                'user': {
                    'id': '12345',
                    'site': '9E7A'
                }
            };
            var errorMessage = validate(job);
            expect(errorMessage).toBeFalsy();
        });
    });
    describe('createAndPublishPatientSyncJobs method', function() {
        it('Undefined patients array works correctly', function() {
            var job = {};
            var mockPublisherRouter = {
                'publish': function(jobsToPublish, callback) {
                    return callback(null);
                },
                'childInstance': function() {
                    return this;
                }
            };
            var environment = createEnvironment(mockPublisherRouter);
            var patients;

            var finished;
            runs(function() {
                createAndPublishPatientSyncJobs(log, environment, patients, job, function(error) {
                    expect(error).toBeFalsy();
                    expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'createAndPublishSyncJobs', 100);
        });
        it('Empty patients array works correctly', function() {
            var job = {};
            var mockPublisherRouter = {
                'publish': function(jobsToPublish, callback) {
                    return callback(null);
                },
                'childInstance': function() {
                    return this;
                }
            };
            var environment = createEnvironment(mockPublisherRouter);
            var patients = [];

            var finished;
            runs(function() {
                createAndPublishPatientSyncJobs(log, environment, patients, job, function(error) {
                    expect(error).toBeFalsy();
                    expect(environment.publisherRouter.publish).not.toHaveBeenCalled();
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'createAndPublishSyncJobs', 100);
        });

        it('Valid patients array but publisher returns an error.', function() {
            var job = {referenceInfo: referenceInfo};
            var mockPublisherRouter = {
                'publish': function(jobsToPublish, callback) {
                    return callback(ERROR_MESSAGE);
                },
                'childInstance': function() {
                    return this;
                }
            };
            var environment = createEnvironment(mockPublisherRouter);
            var patients = createPatientList();

            var finished;
            runs(function() {
                createAndPublishPatientSyncJobs(log, environment, patients, job, function(error) {
                    expect(error).toBe(ERROR_MESSAGE);
                    verifyJobPublishArgs(environment);
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'createAndPublishSyncJobs', 100);
        });
        it('Valid patients array publisher returns success.', function() {
            var job = {referenceInfo: referenceInfo};
            var mockPublisherRouter = {
                'publish': function(jobsToPublish, callback) {
                    return callback(null);
                },
                'childInstance': function() {
                    return this;
                }
            };
            var environment = createEnvironment(mockPublisherRouter);
            var patients = createPatientList();

            var finished;
            runs(function() {
                createAndPublishPatientSyncJobs(log, environment, patients, job, function(error) {
                    expect(error).toBeFalsy();
                    verifyJobPublishArgs(environment);
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'createAndPublishSyncJobs', 100);
        });
    });
    describe('createPatientSyncJobs method', function() {
        it('Create empty array if patient list is null.', function() {
            var job = {referenceInfo: referenceInfo};
            var patients = null;
            var jobsToPublish = createPatientSyncJobs(log, patients, job);
            expect(_.isEmpty(jobsToPublish)).toBe(true);
        });
        it('Create valid set of sync jobs for patient list array.', function() {
            var job = {referenceInfo: referenceInfo};
            var patients = createPatientList();
            var jobsToPublish = createPatientSyncJobs(log, patients, job);
            verifyJobs(jobsToPublish);
        });
    });
    describe('handle method', function() {
        it('Test for invalid job.', function() {
            var mockPatientListVistaRetriever = {
                'getPatientListForOneUser': function(log, osyncConfig, user, callback) {
                    return callback(null);
                }
            };
            var osyncConfig = createOsyncConfig();
            var environment = createEnvironment(null, mockPatientListVistaRetriever);
            var job = {};

            var finished;
            runs(function() {
                handle(log, osyncConfig, environment, job, function(error) {
                    expect(error).toBeTruthy();
                    expect(environment.patientListVistaRetriever.getPatientListForOneUser).not.toHaveBeenCalled();
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'handle', 100);
        });
        it('Test for error from patientListVistaRetriever.', function() {
            var mockPatientListVistaRetriever = {
                'getPatientListForOneUser': function(log, osyncConfig, user, callback) {
                    return callback(ERROR_MESSAGE);
                }
            };
            var osyncConfig = createOsyncConfig();
            var environment = createEnvironment(null, mockPatientListVistaRetriever);
            var job = {
                'type': 'patientlist',
                'user': {
                    'id': '12345',
                    'site': '9E7A'
                }
            };

            var finished;
            runs(function() {
                handle(log, osyncConfig, environment, job, function(error) {
                    expect(error).toBe(ERROR_MESSAGE);
                    expect(environment.patientListVistaRetriever.getPatientListForOneUser).toHaveBeenCalledWith(log, osyncConfig, job.user, jasmine.any(Function));
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'handle', 100);
        });
        it('Test for processing where createAndPublishPatientSyncJobs returns an error.', function() {
            var mockPublisherRouter = {
                'publish': function(jobsToPublish, callback) {
                    return callback(ERROR_MESSAGE);
                },
                'childInstance': function() {
                    return this;
                }
            };
            var mockPatientListVistaRetriever = {
                'getPatientListForOneUser': function(log, osyncConfig, user, callback) {
                    var patients = createPatientList();
                    return callback(null, patients);
                }
            };
            var osyncConfig = createOsyncConfig();
            var environment = createEnvironment(mockPublisherRouter, mockPatientListVistaRetriever);
            var job = {
                'type': 'patientlist',
                'user': {
                    'id': '12345',
                    'site': '9E7A'
                },
                'referenceInfo': referenceInfo
            };

            var finished;
            runs(function() {
                handle(log, osyncConfig, environment, job, function(error) {
                    expect(error).toBe(ERROR_MESSAGE);
                    expect(environment.patientListVistaRetriever.getPatientListForOneUser).toHaveBeenCalledWith(log, osyncConfig, job.user, jasmine.any(Function));
                    verifyJobPublishArgs(environment);
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'handle', 100);
        });
        it('Test for processing where everything works correctly.', function() {
            var mockPublisherRouter = {
                'publish': function(jobsToPublish, callback) {
                    return callback(null);
                },
                'childInstance': function() {
                    return this;
                }
            };
            var mockPatientListVistaRetriever = {
                'getPatientListForOneUser': function(log, osyncConfig, user, callback) {
                    var patients = createPatientList();
                    return callback(null, patients);
                }
            };
            var osyncConfig = createOsyncConfig();
            var environment = createEnvironment(mockPublisherRouter, mockPatientListVistaRetriever);
            var job = {
                'type': 'patientlist',
                'user': {
                    'id': '12345',
                    'site': '9E7A'
                },
                'referenceInfo': referenceInfo
            };

            var finished;
            runs(function() {
                handle(log, osyncConfig, environment, job, function(error) {
                    expect(error).toBeFalsy();
                    expect(environment.patientListVistaRetriever.getPatientListForOneUser).toHaveBeenCalledWith(log, osyncConfig, job.user, jasmine.any(Function));
                    verifyJobPublishArgs(environment);
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            }, 'handle', 100);
        });
    });
});