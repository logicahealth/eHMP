'use strict';

var _ = require('lodash');
var bunyan = require('bunyan');
var clinicalObjectsSubsystem = require('../../subsystems/clinical-objects/clinical-objects-subsystem');
var activityEventProcess = require('../../resources/activitymanagement/activities/eventprocessor/activity-event-process-resource');
var rdk = require('../../core/rdk');
var pidValidator = rdk.utils.pidValidator;
var bunyan = require('bunyan');

var logger = sinon.stub(bunyan.createLogger({
    name: 'util-spec.js'
}));

var util = require('./util');

var testJob = {
    type: 'activity-management-event',
    patientIdentifier: {
        type: 'pid',
        value: 'SITE;3'
    },
    jpid: '39b4d293-90dc-442c-aa9c-4c58191340ea',
    rootJobId: '1',
    dataDomain: 'order-lab',
    data: {},
    record: {
        uid: 'urn:va:ehmp:SITE;3:de305d54-75b4-431b-adb2-eb6b9e546014',
        pid: 'SITE;3',
        patientUid: 'urn:va:patient:SITE:3:3',
        authorUid: 'urn:va:user:SITE:123',
        domain: 'order',
        subDomain: 'consult',
        visit: {
            location: 'urn:va:location:SITE:1',
            serviceCategory: 'E',
            dateTime: '20160203153000'
        },
        ehmpState: 'active',
        displayName: '',
        referenceId: 'urn:va:ehmp-activity:SITE:3:0e55ec7b-01a2-44e3-867a-343eb33f035d',
        data: '',
        kind: 'Laboratory',
        siteId: 'SITE'
    }
};


var config = {
    'rdk': {
        protocol: 'http',
        host: 'IP        ',
        activityPort: PORT,
        writePort: PORT,
        timeout: 60000,
        accessCode: 'USER  ',
        verifyCode: 'PW      ',
        activityURI: '/resource/activities/startactivityevent',
        writeURI: '/resource/write-health-data/patient'
    },
    'jdsServer': {
        'baseUrl': 'http://IP             ',
        'timeout': 120000
    },
    'generalPurposeJdsServer': {
        'baseUrl': 'http://IP             ',
        'urlLengthLimit': 120
    },
    'jbpm': {
        'baseUrl': 'http://IP             ',
        'apiPath': '/business-central/rest',
        'adminUser': {
            'username': 'bpmsAdmin',
            'password': 'bpm$@dmin11'
        },
        'nurseUser': {
            'username': 'Susan',
            'password': 'Password1!'
        },
        'healthcheckEndpoint': '/history/instances'
    },
    'oracledb': {
        'activityDatabase': {
            'user': 'activitydbuser',
            'password': 'activitydb$11',
            'connectString': 'IP             /xe'
        }
    }
};

var activityRequestType = 'activity-management-event';

var activityEventProcessResourceResponse = {
    'name': 'host-logger',
    'hostname': 'rdk-jrobinson-master',
    'pid': 7919,
    'level': 50,
    'message': 'No matches',
    'status': 200,
    'msg': '',
    'time': '2016-05-16T13:44:19.270Z',
    'v': 0
};

var mockClinicalObject = {
    'items': [{
        'uid': 'urn:va:ehmp:SITE;3:de305d54-75b4-431b-adb2-eb6b9e546014',
        'referenceId': 'urn:va:ehmp-activity:SITE:3:0e55ec7b-01a2-44e3-867a-343eb33f035d',
        'data': {
            'activity': {
                'deploymentId': 'VistaCore:Order',
                'processDefinitionId': 'Order:Request',
                'processInstanceId': 123,
                'state': 'draft',
                'initiator': 'urn:va:user:SITE:123',
                'timeStamp': '20160420000000',
                'urgency': 'Urgent',
                'assignTo': 'My Teams',
                'routingCode': ''
            },
            'signals': [],
            'requests': [{
                'taskInstanceId': '1234',
                'urgencyId': '10',
                'urgency': 'Urgent',
                'earliestDate': '20160329000000',
                'latestDate': '20160420000000',
                'title': 'Post procedure follow-up',
                'assignTo': 'My Teams',
                'request': 'This is my request',
                'submittedBy': 'urn:va:user:SITE:123',
                'submittedTimeStamp': '20160420000000',
                'visit': {
                    'location': 'urn:va:location:[site]:[IEN]',
                    'serviceCategory': 'PSB',
                    'dateTime': '20160101080000'
                }
            }]
        }
    }]
};

describe('handler-util-spec.js', function() {

    var mockActivityEventProcess;
    beforeEach(function() {
        logger._level = 50;
        mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(req, res) {
            return null, activityEventProcessResourceResponse;
        });
    });

    afterEach(function() {
        mockActivityEventProcess.restore();
        logger._level = 40;
    });

    describe('isValidRequest', function() {
        it('throws an error if job is null', function() {
            var job = null;
            util.isValidRequest(job, activityRequestType, logger, function(error, result) {
                expect(error).to.eql('Job was empty, null, or undefined');
            });
        });

        it('throws an error if given incorrect job type', function() {
            var badTypeJob = {
                type: 'definitely-not-an-activity-management-event'
            };
            util.isValidRequest(badTypeJob, activityRequestType, logger, function(error, result) {
                expect(error).to.eql('Incorrect job type');
            });
        });

        it('throws an error if job record is undefined', function() {
            var badRecordJob = {
                type: testJob.type
            };
            util.isValidRequest(badRecordJob, activityRequestType, logger, function(error, result) {
                expect(error).to.eql('job record is undefined');
            });
        });

        it('throws an error if job record is empty', function() {
            var badRecordJob = {
                record: {}
            };
            badRecordJob.type = testJob.type;
            util.isValidRequest(badRecordJob, activityRequestType, logger, function(error, result) {
                expect(error).to.eql('job record is empty');
            });
        });

        it('Passes validation', function() {
            util.isValidRequest(testJob, activityRequestType, logger, function(error, result) {
                expect(error).to.eql(null);
            });
        });
    });

    describe('setupIdLogger', function() {
        it('does not modify the logger when an invalid job is passed', function() {
            var originalLogger = {
                child: sinon.spy()
            };
            var testLogger = util.setupIdLogger(null, originalLogger);
            expect(testLogger).to.eql(originalLogger);
            expect(testLogger.child.called).to.be.false();
        });

        it('creates a logger with requestId and sid when available', function() {
            var loggerTestJob = _.cloneDeep(testJob);
            _.assign(loggerTestJob, {
                'referenceInfo': {
                    'requestId': 'abc',
                    'sessionId': '123'
                }
            });
            var dummyLogger = {
                child: function() {}
            };
            var childStub = sinon.stub(dummyLogger, 'child', function(childObj) {
                return childObj;
            });
            util.setupIdLogger(loggerTestJob, dummyLogger);
            expect(childStub.calledOnce).to.be.true();
            expect(childStub.calledWith({
                'requestId': 'abc',
                'sid': '123'
            })).to.be.true();
        });

        it('creates a logger without requestId and sid when unavailable', function() {
            var loggerTestJob = _.cloneDeep(testJob);

            var dummyLogger = {
                child: function() {}
            };
            var childStub = sinon.stub(dummyLogger, 'child', function(childObj) {
                return childObj;
            });
            util.setupIdLogger(loggerTestJob, dummyLogger);
            expect(childStub.calledOnce).to.be.true();
            expect(childStub.calledWith({
                'requestId': undefined,
                'sid': undefined
            })).to.be.true();
        });
    });

    describe('isVPRObject ', function() {
        it('Should return true', function() {
            var uid = 'urn:va:order:SITE;3:de305d54-75b4-431b-adb2-eb6b9e546014';
            expect(util.isVPRObject(uid, activityRequestType, logger)).to.eql(true);
        });

        it('Should return false', function() {
            var uid = 'urn:va:ehmp:SITE;3:de305d54-75b4-431b-adb2-eb6b9e546014';
            expect(util.isVPRObject(uid, activityRequestType, logger)).to.eql(false);
        });
    });

    describe('findClinicalObject ', function() {
        it('Should return null, {} because there were no clinical objects found.', function() {
            var mockClinicalObjectsSubsystem = sinon.stub(clinicalObjectsSubsystem, 'find', function(logger, appConfig, model, loadReference, callback) {
                return callback(['Clinical Object Not Found']);
            });
            util.findClinicalObject(testJob.record.referenceId, testJob.record.patientUid, config, activityRequestType, logger, true, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql({});
            });
            mockClinicalObjectsSubsystem.restore();
        });

        it('Should return error null because there was an error other than clinical object not found.', function() {
            var mockClinicalObjectsSubsystem = sinon.stub(clinicalObjectsSubsystem, 'find', function(logger, appConfig, model, loadReference, callback) {
                return callback('Oracle is not responding');
            });
            util.findClinicalObject(testJob.record.referenceId, testJob.record.patientUid, config, activityRequestType, logger, true, function(error, result) {
                expect(error).to.eql('Oracle is not responding');
                expect(result).to.eql(null);
            });
            mockClinicalObjectsSubsystem.restore();
        });

        it('Should return null, {notes:[]} because response.items is null', function() {
            var mockClinicalObjectsSubsystem = sinon.stub(clinicalObjectsSubsystem, 'find', function(logger, appConfig, model, loadReference, callback) {
                return callback(null, {
                    'items': null
                });
            });
            util.findClinicalObject(testJob.record.referenceId, testJob.record.patientUid, config, activityRequestType, logger, true, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql({
                    'notes': []
                });
            });
            mockClinicalObjectsSubsystem.restore();
        });

        it('Should return null, {notes:[]} because response.items is undefined', function() {
            var mockClinicalObjectsSubsystem = sinon.stub(clinicalObjectsSubsystem, 'find', function(logger, appConfig, model, loadReference, callback) {
                return callback(null, {
                    'items': undefined
                });
            });
            util.findClinicalObject(testJob.record.referenceId, testJob.record.patientUid, config, activityRequestType, logger, true, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql({
                    'notes': []
                });
            });
            mockClinicalObjectsSubsystem.restore();
        });

        it('Should return success', function() {
            var mockClinicalObjectsSubsystem = sinon.stub(clinicalObjectsSubsystem, 'find', function(logger, appConfig, model, loadReference, callback) {
                return callback(null, mockClinicalObject);
            });
            util.findClinicalObject(testJob.record.referenceId, testJob.record.patientUid, config, activityRequestType, logger, true, function(error, result) {
                expect(error).to.eql(null);
                expect(result[0].referenceId).to.eql('urn:va:ehmp-activity:SITE:3:0e55ec7b-01a2-44e3-867a-343eb33f035d');
            });
            mockClinicalObjectsSubsystem.restore();
        });
    });

    describe('buildClinicalObject', function() {
        it('Should have a domain of laboratory', function() {
            var mockIsPrimarySite = sinon.stub(pidValidator, 'isPrimarySite', function() {
                return true;
            });
            var clonedJob = _.cloneDeep(testJob);
            clonedJob.dataDomain = 'order';
            var response = util.buildClinicalObject(clonedJob, logger);
            expect(response.subDomain).to.eql('laboratory');
            mockIsPrimarySite.restore();
        });

        it('Should have a domain of lab-order', function() {
            var mockIsPrimarySite = sinon.stub(pidValidator, 'isPrimarySite', function() {
                return true;
            });
            var response = util.buildClinicalObject(testJob, logger);
            expect(response.subDomain).to.eql('order-lab');
            mockIsPrimarySite.restore();
        });

        it('Should not set a subDomain when not provided a kind', function() {
            var mockIsPrimarySite = sinon.stub(pidValidator, 'isPrimarySite', function() {
                return true;
            });
            var clonedJob = _.cloneDeep(testJob);
            clonedJob.dataDomain = 'order';
            delete clonedJob.record.kind;
            var response = util.buildClinicalObject(clonedJob, logger);
            expect(_.get(response, 'subDomain', 'INVALID')).to.eql('INVALID');
            mockIsPrimarySite.restore();
        });
        it('Should not set a subDomain when provided invalid kind value', function() {
            var mockIsPrimarySite = sinon.stub(pidValidator, 'isPrimarySite', function() {
                return true;
            });
            var clonedJob = _.cloneDeep(testJob);
            clonedJob.dataDomain = 'order';
            clonedJob.record.kind = ['bad', 'data'];
            var response = util.buildClinicalObject(clonedJob, logger);
            expect(_.get(response, 'subDomain', 'INVALID')).to.eql('INVALID');
            mockIsPrimarySite.restore();
        });
    });

    describe('constructPatientUid', function() {
        var pid = 'urn:va:patient:SITE:3:3';
        it('Should be a pid Uid', function() {
            var mockIsPrimarySite = sinon.stub(pidValidator, 'isPrimarySite', function() {
                return true;
            });
            util.constructPatientUid(pid, logger);
            mockIsPrimarySite.restore();
        });

        it('Should be an ICN Uid', function() {
            var mockIsPrimarySite = sinon.stub(pidValidator, 'isPrimarySite', function() {
                return false;
            });
            util.constructPatientUid(pid, logger);
            mockIsPrimarySite.restore();
        });
    });
});
