var _ = require('lodash');
var clincialObjectsSubsystem = require('../../subsystems/clinical-objects/clinical-objects-subsystem');
var activityEventProcess = require('../../resources/activitymanagement/activities/eventprocessor/activity-event-process-resource');
var rdk = require('../../core/rdk');
var pidValidator = rdk.utils.pidValidator;

var logger = {
    debug: function(data) { 'use strict'; return; },
    warn: function(data) { 'use strict'; return; },
    error: function(data) { 'use strict'; return; },
    trace: function(data) { 'use strict'; return; }
};

var util = require('./util');

var testJob = {
    type: 'activity-management-event',
    patientIdentifier: { type: 'pid', value: '9E7A;3' },
    jpid: '39b4d293-90dc-442c-aa9c-4c58191340ea',
    rootJobId: '1',
    dataDomain: 'order-lab',
    data: {},
    record: {
        uid: 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
        pid: '9E7A;3',
        patientUid: 'urn:va:patient:9E7A:3:3',
        authorUid: 'urn:va:user:9E7A:123',
        domain: 'order',
        subDomain: 'consult',
        visit: {
            location: 'urn:va:location:9E7A:1',
            serviceCategory: 'E',
            dateTime: '20160203153000'
        },
        ehmpState: 'active',
        displayName: '',
        referenceId: 'urn:va:ehmp-activity:9E7A:3:0e55ec7b-01a2-44e3-867a-343eb33f035d',
        data: '',
        kind: 'Laboratory',
        siteId: '9E7A'
    }
};

var env = {};

var config = {
    'rdk': {
        protocol: 'http',
        host: 'IP_ADDRESS',
        activityPort: 8888,
        writePort:9999,
        timeout: 60000,
        accessCode: 'PW',
        verifyCode: 'PW',
        activityURI: '/resource/activities/startactivityevent',
        writeURI: '/resource/write-health-data/patient'
    },
    'jdsServer': {
        'baseUrl': 'http://IP_ADDRESS:PORT',
        'timeout': 120000
    },
    'generalPurposeJdsServer': {
        'baseUrl': 'http://IP_ADDRESS:PORT',
        'urlLengthLimit': 120
    },
    'jbpm': {
        'baseUrl': 'http://IP_ADDRESS:PORT',
        'apiPath': '/business-central/rest',
        'adminUser': {
            'username': 'PW',
            'password': 'PW'
        },
        'nurseUser': {
            'username': 'PW',
            'password': 'PW'
        },
        'healthcheckEndpoint': '/history/instances',
        'deployments': {
            'All': 'VistaCore:VistaTasks:1.0'
        },
        'activityDatabase': {
            'user': 'activitydbuser',
            'password': 'activitydb$11',
            'connectString': 'IP_ADDRESS:PORT/xe'
        },
        'notifsDatabase': {
            'user': 'notifdb',
            'password': 'notifdb',
            'connectString': 'IP_ADDRESS:PORT/xe'
        }
    }
};

var activityRequestType = 'activity-management-event';

var activityEventProcessResourceRepsonse = {
    'name':'host-logger',
    'hostname':'rdk-jrobinson-master',
    'pid':7919,
    'level':50,
    'message':'No matches',
    'status':200,
    'msg':'',
    'time':'2016-05-16T13:44:19.270Z',
    'v':0
};

var mockClinicalObject = {
    'items': [{
        'uid': 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014',
        'referenceId': 'urn:va:ehmp-activity:9E7A:3:0e55ec7b-01a2-44e3-867a-343eb33f035d',
        'data': {
            'activity': {
                'deploymentId': 'VistaCore:Order',
                'processDefinitionId': 'Order:Request',
                'processInstanceId': 123,
                'state': 'draft',
                'initiator': 'urn:va:user:9E7A:123',
                'timeStamp': '20160420000000',
                'urgency': 'Urgent',
                'assignTo': 'My Teams',
                'routingCode': ''
             },
            'signals': [
            ],
            'requests': [{
                'taskInstanceId': '1234',
                'urgencyId': '10',
                'urgency': 'Urgent',
                'earliestDate':'20160329000000',
                'latestDate': '20160420000000',
                'title': 'Post procedure follow-up',
                'assignTo': 'My Teams',
                'request': 'This is my request',
                'submittedBy': 'urn:va:user:9E7A:123',
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
    'use strict';

    var mockActivityEventProcess;
    beforeEach(function() {
        logger._level = 50;
        mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function (req, res) {
            return null, activityEventProcessResourceRepsonse;
        });
    });

    afterEach(function(){
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
            var badTypeJob = {type: 'definitely-not-an-activity-management-event'};
            var done = false;
            util.isValidRequest(badTypeJob, activityRequestType, logger, function(error, result) {
                expect(error).to.eql('Incorrect job type');
            });
        });

        it('throws an error if job record is undefined', function() {
            var badRecordJob =  {type : testJob.type};
            util.isValidRequest(badRecordJob, activityRequestType, logger, function(error, result) {
                expect(error).to.eql('post data is undefined!');
            });
        });

        it('throws an error if job record is empty', function() {
            var badRecordJob =  {record : {}};
            badRecordJob.type = testJob.type;
            util.isValidRequest(badRecordJob, activityRequestType, logger, function(error, result) {
                expect(error).to.eql('post data is empty');
            });
        });

        it('Passes validation', function() {
            util.isValidRequest(testJob, activityRequestType, logger, function(error, result) {
                expect(error).to.eql(null);
            });
        });
    });

    describe('isSecondarySitePid', function() {
        it('Should return false because isPrimarySite and isIcn will be true.', function() {
            var mockIsPrimarySite = sinon.stub(pidValidator, 'isPrimarySite', function() {
                return true;
            });
            var mockIsIcn = sinon.stub(pidValidator, 'isIcn', function() {
                return true;
            });
            var response = util.isSecondarySitePid({'patientIdentifier': {'value': '3877;3'}}, logger);
            expect(response).to.eql(false);
            mockIsPrimarySite.restore();
            mockIsIcn.restore();
        });

        it('Should return false because isPrimarySite is true and isIcn is false.', function() {
            var mockIsPrimarySite = sinon.stub(pidValidator, 'isPrimarySite', function() {
                return true;
            });
            var mockIsIcn = sinon.stub(pidValidator, 'isIcn', function() {
                return false;
            });
            var response = util.isSecondarySitePid({'patientIdentifier': {'value': '3877;3'}}, logger);
            expect(response).to.eql(false);
            mockIsPrimarySite.restore();
            mockIsIcn.restore();
        });

        it('Should return false because isPrimarySite is false and isIcn is true.', function() {
            var mockIsPrimarySite = sinon.stub(pidValidator, 'isPrimarySite', function() {
                return false;
            });
            var mockIsIcn = sinon.stub(pidValidator, 'isIcn', function() {
                return true;
            });
            var response = util.isSecondarySitePid({'patientIdentifier': {'value': '3877;3'}}, logger);
            expect(response).to.eql(false);
            mockIsPrimarySite.restore();
            mockIsIcn.restore();
        });

        it('Should return true because isPrimarySite and isIcn will be false.', function() {
            var mockIsPrimarySite = sinon.stub(pidValidator, 'isPrimarySite', function() {
                return false;
            });
            var mockIsIcn = sinon.stub(pidValidator, 'isIcn', function() {
                return false;
            });
            var response = util.isSecondarySitePid({'patientIdentifier': {'value': '3877;3'}}, logger);
            expect(response).to.eql(true);
            mockIsPrimarySite.restore();
            mockIsIcn.restore();
        });
    });

    describe('isVPRObject ', function() {
        it('Should return true', function() {
            var uid = 'urn:va:order:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014';
            expect(util.isVPRObject(uid, activityRequestType, logger)).to.eql(true);
        });

        it('Should return false', function() {
            var uid = 'urn:va:ehmp:9E7A;3:de305d54-75b4-431b-adb2-eb6b9e546014';
            expect(util.isVPRObject(uid, activityRequestType, logger)).to.eql(false);
        });
    });

    describe('findClinicalObject ', function() {
        it('Should return null, {} because there were no clinical objects found.', function() {
            var mockClincialObjectsSubsystem = sinon.stub(clincialObjectsSubsystem, 'find', function (logger, appConfig, model, loadReference, callback) {
                return callback(['Clinical Object Not Found']);
            });
            util.findClinicalObject(testJob.record.referenceId, testJob.record.patientUid, config, activityRequestType, logger, true, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql({});
            });
            mockClincialObjectsSubsystem.restore();
        });

        it('Should return error null because there was an error other than clinical object not found.', function() {
            var mockClincialObjectsSubsystem = sinon.stub(clincialObjectsSubsystem, 'find', function (logger, appConfig, model, loadReference, callback) {
                return callback('Oracle is not responding');
            });
            util.findClinicalObject(testJob.record.referenceId, testJob.record.patientUid, config, activityRequestType, logger, true, function(error, result) {
                expect(error).to.eql('Oracle is not responding');
                expect(result).to.eql(null);
            });
            mockClincialObjectsSubsystem.restore();
        });

        it('Should return null, {notes:[]} because response.items is null', function() {
            var mockClincialObjectsSubsystem = sinon.stub(clincialObjectsSubsystem, 'find', function (logger, appConfig, model, loadReference, callback) {
                return callback(null, {'items': null});
            });
            util.findClinicalObject(testJob.record.referenceId, testJob.record.patientUid, config, activityRequestType, logger, true, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql({'notes': []});
            });
            mockClincialObjectsSubsystem.restore();
        });

        it('Should return null, {notes:[]} because response.items is undefined', function() {
            var mockClincialObjectsSubsystem = sinon.stub(clincialObjectsSubsystem, 'find', function (logger, appConfig, model, loadReference, callback) {
                return callback(null, {'items': undefined});
            });
            util.findClinicalObject(testJob.record.referenceId, testJob.record.patientUid, config, activityRequestType, logger, true, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql({'notes': []});
            });
            mockClincialObjectsSubsystem.restore();
        });

        it('Should return success', function() {
            var mockClincialObjectsSubsystem = sinon.stub(clincialObjectsSubsystem, 'find', function (logger, appConfig, model, loadReference, callback) {
                return callback(null, mockClinicalObject);
            });
            util.findClinicalObject(testJob.record.referenceId, testJob.record.patientUid, config, activityRequestType, logger, true, function(error, result) {
                expect(error).to.eql(null);
                expect(result[0].referenceId).to.eql('urn:va:ehmp-activity:9E7A:3:0e55ec7b-01a2-44e3-867a-343eb33f035d');
            });
            mockClincialObjectsSubsystem.restore();
        });
    });

    describe('buildClinicalObject', function() {
        it('Should have a domain of Laboratory', function() {
            var mockIsPrimarySite = sinon.stub(pidValidator, 'isPrimarySite', function() {
                return true;
            });
            var clonedJob = _.cloneDeep(testJob);
            clonedJob.dataDomain = 'order';
            var response = util.buildClinicalObject(clonedJob, logger);
            expect(response.subDomain).to.eql('Laboratory');
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
    });

    describe('constructPatientUid', function() {
        var pid = 'urn:va:patient:9E7A:3:3';
        it('Should be a pid Uid', function() {
            var mockIsPrimarySite = sinon.stub(pidValidator, 'isPrimarySite', function() {
                return true;
            });
            var response = util.constructPatientUid(pid, logger);
            mockIsPrimarySite.restore();
        });

        it('Should be an ICN Uid', function() {
            var mockIsPrimarySite = sinon.stub(pidValidator, 'isPrimarySite', function() {
                return false;
            });
            var response = util.constructPatientUid(pid, logger);
            mockIsPrimarySite.restore();
        });
    });
});
