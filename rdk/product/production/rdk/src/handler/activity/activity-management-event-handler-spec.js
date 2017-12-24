'use strict';
var _ = require('lodash');
var activityHelper = require('./activity-management-event-handler-helper');
var clinicalObjectsSubsystem = require('../../subsystems/clinical-objects/clinical-objects-subsystem');
var activityEventProcess = require('../../resources/activitymanagement/activities/eventprocessor/activity-event-process-resource');
var rdk = require('../../core/rdk');
var pidValidator = rdk.utils.pidValidator;

var bunyan = require('bunyan');
var logger = sinon.stub(bunyan.createLogger({
    name: 'test-logger'
}));
logger.child.returnsThis();

var handler = require('./activity-management-event-handler');

var publisherRouter = {};
publisherRouter.publish = function(job, callback) {
    return callback();
};

var env = {publisherRouter: publisherRouter};

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
            'username': 'USER',
            'password': 'PW'
        },
        'nurseUser': {
            'username': 'USER',
            'password': 'PW'
        },
        'healthcheckEndpoint': '/history/instances'
    },
    'oracledb': {
        'activityDatabase': {
            'user': 'USER',
            'password': 'PW',
            'connectString': 'IP             /xe'
        }
    },
    'activityManagementJobRetryLimit': 5
};

var activityEventProcessResourceResponse = {};

var mockVprObject = {
    'type': 'activity-management-event',
    'timestamp': '1465499986878',
    'patientIdentifier': {
        'type': 'pid',
        'value': 'SITE;3'
    },
    'dataDomain': 'order',
    'record': {
        'content': 'HEMOGLOBIN A1C BLOOD   SP *UNSIGNED*\r\n',
        'displayGroup': 'CH',
        'entered': '20160609151900',
        'facilityCode': '507',
        'facilityName': 'CAMP BEE',
        'lastUpdateTime': '20160609151947',
        'localId': '44243',
        'name': 'HEMOGLOBIN A1C',
        'oiCode': 'urn:va:oi:213',
        'oiName': 'HEMOGLOBIN A1C',
        'oiPackageRef': '97;99LRT',
        'providerName': 'USER,PANORAMA',
        'providerUid': 'urn:va:user:SITE:10000000270',
        'locationUid': 'urn:va:location:SITE:158',
        'service': 'LR',
        'stampTime': '20160609151947',
        'start': '',
        'statusCode': 'urn:va:order-status:unr',
        'statusName': 'UNRELEASED',
        'statusVuid': 'urn:va:vuid:4501124',
        'stop': '',
        'uid': 'urn:va:order:SITE:3:44243',
        'pid': 'SITE;3',
        'kind': 'Laboratory',
        'providerDisplayName': 'User,Panorama',
        'summary': 'HEMOGLOBIN A1C BLOOD   SP *UNSIGNED*\r\n'
    },
    'jobId': '546c6eb0-b95c-4c51-b999-e1d62e432f3a'
};

var mockVprObjectWithClinicalObject = {
    'authorUid': 'urn:va:user:SITE:10000000270',
    'creationDateTime': '20160614191226+0000',
    'data': {
        'content': 'HEMOGLOBIN A1C BLOOD   SP *UNSIGNED*\r\n',
        'displayGroup': 'CH',
        'entered': '20160609151900',
        'facilityCode': '507',
        'facilityName': 'CAMP BEE',
        'kind': 'Laboratory',
        'lastUpdateTime': '20160609151947',
        'localId': '44243',
        'name': 'HEMOGLOBIN A1C',
        'oiCode': 'urn:va:oi:213',
        'oiName': 'HEMOGLOBIN A1C',
        'oiPackageRef': '97;99LRT',
        'pid': 'SITE;3',
        'providerDisplayName': 'User,Panorama',
        'providerName': 'USER,PANORAMA',
        'providerUid': 'urn:va:user:SITE:10000000270',
        'locationUid': 'urn:va:location:SITE:158',
        'service': 'LR',
        'stampTime': '20160609151947',
        'start': '',
        'statusCode': 'urn:va:order-status:unr',
        'statusName': 'UNRELEASED',
        'statusVuid': 'urn:va:vuid:4501124',
        'stop': '',
        'summary': 'HEMOGLOBIN A1C BLOOD   SP *UNSIGNED*\r\n',
        'uid': 'urn:va:order:SITE:3:44243'
    },
    'displayName': 'HEMOGLOBIN A1C - ROUTINE',
    'domain': 'ehmp-activity',
    'ehmpState': 'active',
    'patientUid': 'urn:va:patient:SITE:3:3',
    'referenceId': 'urn:va:order:SITE:3:44243',
    'subDomain': 'laboratory',
    'uid': 'urn:va:ehmp-order:SITE:3:0c90c33b-6d28-4113-8f9d-598e392e6e82',
    'visit': {
        'dateTime': '20140814130730',
        'location': 'urn:va:location:SITE:158',
        'serviceCategory': 'X'
    }
};

var mockVprObjectWithFakeClinicalObject = {
    'patientUid': 'urn:va:patient:SITE:3:3',
    'authorUid': 'urn:va:user:SITE:10000000270',
    'domain': 'ehmp-activity',
    'subDomain': 'laboratory',
    'referenceId': 'urn:va:order:SITE:3:44243',
    'pid': 'SITE;3',
    'ehmpState': 'active',
    'visit': {
        'serviceCategory': 'LR',
        'dateTime': '20160609151900',
        'location': 'urn:va:location:SITE:158'
    },
    'createdDateTime': '20160609151947',
    'data': {
        'content': 'HEMOGLOBIN A1C BLOOD   SP *UNSIGNED*\r\n',
        'displayGroup': 'CH',
        'entered': '20160609151900',
        'facilityCode': '507',
        'facilityName': 'CAMP BEE',
        'lastUpdateTime': '20160609151947',
        'localId': '44243',
        'name': 'HEMOGLOBIN A1C',
        'oiCode': 'urn:va:oi:213',
        'oiName': 'HEMOGLOBIN A1C',
        'oiPackageRef': '97;99LRT',
        'providerName': 'USER,PANORAMA',
        'providerUid': 'urn:va:user:SITE:10000000270',
        'locationUid': 'urn:va:location:SITE:158',
        'service': 'LR',
        'stampTime': '20160609151947',
        'start': '',
        'statusCode': 'urn:va:order-status:unr',
        'statusName': 'UNRELEASED',
        'statusVuid': 'urn:va:vuid:4501124',
        'stop': '',
        'uid': 'urn:va:order:SITE:3:44243',
        'pid': 'SITE;3',
        'kind': 'Laboratory',
        'providerDisplayName': 'User,Panorama',
        'summary': 'HEMOGLOBIN A1C BLOOD   SP *UNSIGNED*\r\n'
    }
};

var mockNonVprObject = {
    'type': 'activity-management-event',
    'timestamp': '1465500110058',
    'patientIdentifier': {
        'type': 'pid',
        'value': 'SITE;3'
    },
    'rootJobId': '3f580ed5-af33-4e67-8326-7f5dee399987',
    'dataDomain': 'ehmp-order',
    'record': {
        'authorUid': 'urn:va:user:SITE:10000000270',
        'patientUid': 'urn:va:patient:SITE:3:3',
        'domain': 'ehmp-order',
        'subDomain': 'laboratory',
        'visit': {
            'serviceCategory': 'X',
            'dateTime': '20140814130730',
            'location': 'urn:va:location:SITE:158'
        },
        'referenceId': 'urn:va:order:SITE:3:44243',
        'data': {
            'availableLabTests': '213',
            'labTestText': 'HEMOGLOBIN A1C',
            'collectionDate': '06/09/2016',
            'collectionType': 'SP',
            'collectionSample': '3',
            'specimen': '70',
            'urgency': '9',
            'urgencyText': 'ROUTINE',
            'notificationDate': '',
            'pastDueDate': '',
            'collectionTime': '',
            'otherCollectionSample': '',
            'immediateCollectionDate': '',
            'immediateCollectionTime': '',
            'collectionDateTimePicklist': '',
            'howOften': '',
            'howLong': '',
            'otherSpecimen': '',
            'forTest': '',
            'doseDate': '',
            'doseTime': '',
            'drawDate': '',
            'drawTime': '',
            'orderComment': '',
            'anticoagulant': '',
            'sampleDrawnAt': '',
            'urineVolume': '',
            'additionalComments': '',
            'annotation': '',
            'problemRelationship': '',
            'activity': '',
            'isActivityEnabled': ''
        },
        'ehmpState': 'active',
        'displayName': 'HEMOGLOBIN A1C - ROUTINE',
        'creationDateTime': '20160609192149+0000',
        'uid': 'urn:va:ehmp-order:SITE:3:0c1cd1e6-9e24-4825-b020-703f485eedce'
    },
    'jobId': '015ac5da-4d6c-4fba-8cfa-818c5c721bec'
};

var mockResponse = [{
    'authorUid': 'urn:va:user:SITE:10000000270',
    'creationDateTime': '20160614191226+0000',
    'data': {
        'content': 'HEMOGLOBIN A1C BLOOD   SP *UNSIGNED*\r\n',
        'displayGroup': 'CH',
        'entered': '20160609151900',
        'facilityCode': '507',
        'facilityName': 'CAMP BEE',
        'kind': 'Laboratory',
        'lastUpdateTime': '20160609151947',
        'localId': '44243',
        'name': 'HEMOGLOBIN A1C',
        'oiCode': 'urn:va:oi:213',
        'oiName': 'HEMOGLOBIN A1C',
        'oiPackageRef': '97;99LRT',
        'pid': 'SITE;3',
        'providerDisplayName': 'User,Panorama',
        'providerName': 'USER,PANORAMA',
        'providerUid': 'urn:va:user:SITE:10000000270',
        'locationUid': 'urn:va:location:SITE:158',
        'service': 'LR',
        'stampTime': '20160609151947',
        'start': '',
        'statusCode': 'urn:va:order-status:unr',
        'statusName': 'UNRELEASED',
        'statusVuid': 'urn:va:vuid:4501124',
        'stop': '',
        'summary': 'HEMOGLOBIN A1C BLOOD   SP *UNSIGNED*\r\n',
        'uid': 'urn:va:order:SITE:3:44243'
    },
    'displayName': 'HEMOGLOBIN A1C - ROUTINE',
    'domain': 'ehmp-order',
    'ehmpState': 'active',
    'patientUid': 'urn:va:patient:SITE:3:3',
    'referenceId': 'urn:va:order:SITE:3:44243',
    'subDomain': 'laboratory',
    'uid': 'urn:va:ehmp-order:SITE:3:0c90c33b-6d28-4113-8f9d-598e392e6e82',
    'visit': {
        'dateTime': '20140814130730',
        'location': 'urn:va:location:SITE:158',
        'serviceCategory': 'X'
    }
}];

function validateJobObject(key, job) {
    describe('validateJobObject for ' + key, function() {
        var isVpr = _.isUndefined(job.record);
        it(key + ' should return an error because the visit key is missing', function() {
            var missingVisit = isVpr ? _.omit(job, 'visit') : _.omit(job.record, 'visit');
            activityHelper.validateJobObject(missingVisit, logger, function(result) {
                expect(result).to.eql('job does not have a visit key');
            });
        });

        it(key + ' should return an error because the data is empty a value for a required data field', function() {
            var missingData = isVpr ? _.cloneDeep(job) : _.cloneDeep(job.record);
            missingData.ehmpState = '';

            activityHelper.validateJobObject(missingData, logger, function(result) {
                expect(result).to.eql('model is missing a value for the ehmpState field');
            });
        });

        it(key + ' should return an error because the data is empty a value for a required visit field', function() {
            var missingVisitData = isVpr ? _.cloneDeep(job) : _.cloneDeep(job.record);
            missingVisitData.visit.dateTime = '';

            activityHelper.validateJobObject(missingVisitData, logger, function(result) {
                expect(result).to.eql('model is missing a value for the dateTime field');
            });
        });

        it(key + ' should return an error because the data is null a value for a required data field', function() {
            var missingData = isVpr ? _.cloneDeep(job) : _.cloneDeep(job.record);
            missingData.ehmpState = null;

            activityHelper.validateJobObject(missingData, logger, function(result) {
                expect(result).to.eql('model is missing a value for the ehmpState field');
            });
        });

        it(key + ' should return an error because the data is null a value for a required visit field', function() {
            var missingVisitData = isVpr ? _.cloneDeep(job) : _.cloneDeep(job.record);
            missingVisitData.visit.dateTime = null;

            activityHelper.validateJobObject(missingVisitData, logger, function(result) {
                expect(result).to.eql('model is missing a value for the dateTime field');
            });
        });

        it(key + ' should not return an error a value is a number for a required visit field', function() {
            var numberVisitData = isVpr ? _.cloneDeep(job) : _.cloneDeep(job.record);
            numberVisitData.visit.dateTime = 201706230000;

            activityHelper.validateJobObject(numberVisitData, logger, function(result) {
                expect(result).to.eql(null);
            });
        });

        it(key + ' should return no error', function() {
            var jobObject = isVpr ? job : job.record;
            activityHelper.validateJobObject(jobObject, logger, function(result) {
                expect(result).to.eql(null);
            });
        });
    });
}

describe('activity-management-event-handler-spec.js', function() {

    var mockActivityEventProcess;
    var mockIsSecondarySite;
    var mockClinicalObjectsSubsystem;
    var mockPidValidator;
    beforeEach(function() {
        logger._level = 50;
        mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(rawEventRequest, logger, config, activityEventCallback) {
            return activityEventCallback(null, activityEventProcessResourceResponse);
        });
        mockIsSecondarySite = sinon.stub(pidValidator, 'isSecondarySite');
        mockIsSecondarySite.returns(false);
        var clonedMockResponse = _.cloneDeep(mockResponse);
        mockClinicalObjectsSubsystem = sinon.stub(clinicalObjectsSubsystem, 'find', function(logger, appConfig, model, loadReference, callback) {
            return callback(null, {
                'items': clonedMockResponse
            });
        });
        mockPidValidator = sinon.stub(pidValidator, 'isPrimarySite');
        mockPidValidator.returns(true);
    });

    afterEach(function() {
        mockActivityEventProcess.restore();
        mockIsSecondarySite.restore();
        mockClinicalObjectsSubsystem.restore();
        mockPidValidator.restore();
        logger._level = 40;
    });

    describe('validateJobObject', function() {
        var testableObjects = {
            'mockVprObjectWithClinicalObject': mockVprObjectWithClinicalObject,
            'mockVprObjectWithFakeClinicalObject': mockVprObjectWithFakeClinicalObject,
            'mockNonVprObject': mockNonVprObject
        };
        var testableObjectsKeys = Object.keys(testableObjects);
        for (var i = 0; i < testableObjectsKeys.length; i++) {
            var key = testableObjectsKeys[i];
            validateJobObject(key, testableObjects[key]);
        }
    });

    describe('handle', function() {
        it('Should error because of an empty job', function() {
            handler(logger, config, env, null, function(error, result) {
                expect(error).to.eql('Job was empty, null, or undefined');
            });
        });

        it('Should error because the site is not primary', function() {
            mockIsSecondarySite.restore();
            mockIsSecondarySite = sinon.stub(pidValidator, 'isSecondarySite');
            mockIsSecondarySite.returns(true);
            handler(logger, config, env, mockVprObject, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql(null);
            });
        });

        it('Should not error because the site is primary', function() {
            handler(logger, config, env, mockNonVprObject, function(error, result) {
                expect(false).to.eql(mockIsSecondarySite.returnValues[0]);
            });
        });

        it('Should error because the Non-VPR Object referenceId is empty', function() {
            var nonVprEmptyReferenceId = _.cloneDeep(mockNonVprObject);
            nonVprEmptyReferenceId.record.referenceId = '';
            handler(logger, config, env, nonVprEmptyReferenceId, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql(null);
            });
        });

        it('Should error because the Non-VPR Object referenceId is undefined', function() {
            var nonVprRecordNoReferenceId = _.omit(mockNonVprObject.record, 'referenceId');
            var nonVprNoReferenceId = _.cloneDeep(mockNonVprObject);
            nonVprNoReferenceId.record = nonVprRecordNoReferenceId;
            handler(logger, config, env, nonVprNoReferenceId, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql(null);
            });
        });

        it('Should error because findClinicalObject returned an error', function() {
            mockClinicalObjectsSubsystem.restore();
            mockClinicalObjectsSubsystem = sinon.stub(clinicalObjectsSubsystem, 'find', function(logger, appConfig, model, loadReference, callback) {
                return callback('Failed to read the notes from pJDS.');
            });
            handler(logger, config, env, mockNonVprObject, function(error, result) {
                expect(error).to.eql('Failed to read the notes from pJDS.');
            });
        });

        it('Should be a generated clinicalObject', function(done) {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(rawEventRequest, logger, config, activityEventCallback) {
                return activityEventCallback(null, rawEventRequest);
            });
            mockClinicalObjectsSubsystem.restore();
            mockClinicalObjectsSubsystem = sinon.stub(clinicalObjectsSubsystem, 'find', function(logger, appConfig, model, loadReference, callback) {
                return callback(['Clinical object not found']);
            });
            handler(logger, config, env, mockVprObject, function(error, result) {
                delete result.data.activityRetry;
                expect(error).to.eql(null);
                expect(_.omit(result, 'status')).to.eql(mockVprObjectWithFakeClinicalObject);
                done();
            });
        });

        it('Should change a VPR object domain to ehmp-activity', function(done) {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(rawEventRequest, logger, config, activityEventCallback) {
                return activityEventCallback(null, rawEventRequest);
            });
            handler(logger, config, env, mockVprObject, function(error, result) {
                delete result.data.activityRetry;
                expect(error).to.eql(null);
                expect(_.omit(result, 'status')).to.eql(mockVprObjectWithClinicalObject);
                done();
            });
        });

        it('Should add the deceased property to VPR object for discharge domain when missing', function(done) {
            mockActivityEventProcess.restore();

            var noDeceasedVPR = _.cloneDeep(mockVprObject);
            noDeceasedVPR.dataDomain = 'discharge';

            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(rawEventRequest, logger, config, activityEventCallback) {
                expect(rawEventRequest.data.deceased).to.be.false();
                return activityEventCallback(null, rawEventRequest);
            });

            handler(logger, config, env, noDeceasedVPR, function(error, result) {
                expect(error).to.eql(null);
                expect(result.data.deceased).to.be.false();
                done();
            });
        });

        it('Should add the authorUid property to eventRequest object for discharge domain when missing, prioritizing the primaryProvider object', function(done) {
            mockActivityEventProcess.restore();

            var noAuthorVPR = _.cloneDeep(mockVprObject);
            noAuthorVPR.dataDomain = 'discharge';
            delete noAuthorVPR.record.authorUid;
            noAuthorVPR.record.primaryProvider = {
                    'primary': 'true',
                    'providerDisplayName': 'Provider,Eightyfive',
                    'providerName': 'PROVIDER,EIGHTYFIVE',
                    'providerUid': 'urn:va:user:SITE:9010',
                    'role': 'P',
                    'summary': 'EncounterProvider'
                };

            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(rawEventRequest, logger, config, activityEventCallback) {
                expect(rawEventRequest.authorUid).to.equal('urn:va:user:SITE:9010');
                return activityEventCallback(null, rawEventRequest);
            });

            handler(logger, config, env, noAuthorVPR, function(error, result) {
                expect(error).to.eql(null);
                done();
            });
        });

        it('Should add the authorUid property to eventRequest object for discharge domain when missing, defaulting to the providers array', function(done) {
            mockActivityEventProcess.restore();

            var noAuthorVPR = _.cloneDeep(mockVprObject);
            noAuthorVPR.dataDomain = 'discharge';
            delete noAuthorVPR.record.authorUid;
            noAuthorVPR.record.primaryProvider = {};
            noAuthorVPR.record.providers = [{
                'providerName': 'PROVIDER,EIGHTYONE',
                'providerUid': 'urn:va:user:SITE:9006',
                'role': 'A'
            },
            {
                'primary': true,
                'providerName': 'PROVIDER,EIGHTY',
                'providerUid': 'urn:va:user:SITE:9005',
                'role': 'P'
            }];

            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(rawEventRequest, logger, config, activityEventCallback) {
                expect(rawEventRequest.authorUid).to.equal('urn:va:user:SITE:9005');
                return activityEventCallback(null, rawEventRequest);
            });

            handler(logger, config, env, noAuthorVPR, function(error, result) {
                expect(error).to.eql(null);
                done();
            });
        });

        it('Should return null because the response was empty and it got a Non-VPR object', function() {
            mockClinicalObjectsSubsystem.restore();
            mockClinicalObjectsSubsystem = sinon.stub(clinicalObjectsSubsystem, 'find', function(logger, appConfig, model, loadReference, callback) {
                return callback(['Clinical object not found']);
            });
            handler(logger, config, env, mockNonVprObject, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql(null);
            });
        });

        it('Should have the response (VPR) data in the newrecord.data key', function() {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(rawEventRequest, logger, config, activityEventCallback) {
                return activityEventCallback(null, rawEventRequest);
            });
            handler(logger, config, env, mockVprObject, function(error, result) {
                expect(error).to.eql(null);
                expect(result.data).to.eql(mockVprObject.record);
            });
        });

        it('Should have the record (Non-VPR) data in the newrecord.data key', function() {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(rawEventRequest, logger, config, activityEventCallback) {
                return activityEventCallback(null, rawEventRequest);
            });
            handler(logger, config, env, mockNonVprObject, function(error, result) {
                expect(error).to.eql(null);
                expect(result.data).to.eql(mockResponse[0].data);
            });
        });

        it('Should return callback', function(done) {
            handler(logger, config, env, mockVprObject, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql({});
                done();
            });
        });
    });

    describe('cleanClinicalObjectResponseArray', function() {
        var clonedResponse = _.cloneDeep(mockResponse[0]);
        clonedResponse.domain = 'ehmp-activity';

        it('Should only return one object with domain of ehmp-order; single response', function() {
            var response = activityHelper.cleanClinicalObjectResponseArray(mockResponse, logger);
            expect(response).to.eql(mockResponse[0]);
        });

        it('Should only return one object with domain of ehmp-order; multiple response only one ehmp-order', function() {
            var response = activityHelper.cleanClinicalObjectResponseArray(mockResponse, logger);
            expect(response).to.eql(mockResponse[0]);
        });

        it('Should error out because no ehmp-order domain found in responses; single responses', function() {
            var response = activityHelper.cleanClinicalObjectResponseArray(clonedResponse, logger);
            expect(response).to.eql(undefined);
        });

        it('Should error out because no ehmp-order domain found in responses; multiple responses', function() {
            var response = activityHelper.cleanClinicalObjectResponseArray([mockVprObject, mockVprObjectWithClinicalObject, mockVprObjectWithFakeClinicalObject], logger);
            expect(response).to.eql(undefined);
        });
    });

    describe('passOrderToProcessor', function() {
        it('Should pass into req creation as an object', function() {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(rawEventRequest, logger, config, activityEventCallback) {
                return activityEventCallback(null, rawEventRequest);
            });
            activityHelper.passOrderToProcessor({
                data: {
                    user: 'pass'
                }
            }, mockVprObject, config, logger, env, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql({
                    data: {
                        user: 'pass'
                    }
                });
            });
        });

        it('Should convert the string to a JSON object', function() {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(rawEventRequest, logger, config, activityEventCallback) {
                return activityEventCallback(null, rawEventRequest);
            });
            activityHelper.passOrderToProcessor('{"data": {"user": "pass"}}', mockVprObject, config, logger, env, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql({
                    data: {
                        user: 'pass'
                    }
                });
            });
        });

        it('Should error because of bad string JSON', function() {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(rawEventRequest, logger, config, activityEventCallback) {
                return activityEventCallback(null, 'ignored for this test');
            });
            activityHelper.passOrderToProcessor('{\'data\': {\'user\': \'pass\'}}', mockVprObject, config, logger, env, function(error, result) {
                expect(error.message).to.match(/Unexpected token/);
                expect(result).to.eql(null);
            });
        });

        it('Should return a working request object', function() {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(rawEventRequest, logger, config, activityEventCallback) {
                return activityEventCallback(null, rawEventRequest);
            });
            activityHelper.passOrderToProcessor({
                data: {
                    user: 'pass'
                }
            }, mockVprObject, config, logger, env, function(error, result) {
                expect(error).to.eql(null);
                expect(Object.keys(result)).to.eql(['data']);
            });
        });

        it('Should return the input because it is an object', function() {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(rawEventRequest, logger, config, activityEventCallback) {
                return activityEventCallback(null, {
                    data: {
                        user: 'pass'
                    }
                });
            });
            activityHelper.passOrderToProcessor({
                'this': 'is ignored'
            }, mockVprObject, config, logger, env, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql({
                    data: {
                        user: 'pass'
                    }
                });
            });
        });

        it('Should try to JSONify the response', function() {
            mockActivityEventProcess.restore();

            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(rawEventRequest, logger, config, activityEventCallback) {
                return activityEventCallback(null, '{"data": {"user": "pass"}}');
            });
            activityHelper.passOrderToProcessor({
                'this': 'is ignored'
            }, mockVprObject, config, logger, env, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql({
                    data: {
                        user: 'pass'
                    }
                });
            });
        });

        it('Should catch the bad JSON and return an error', function(done) {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(rawEventRequest, logger, config, activityEventCallback) {
                return activityEventCallback(null, '{da{{ta\': {\'user\': \'pass\'}}');
            });
            activityHelper.passOrderToProcessor({
                'this': 'is ignored'
            }, mockVprObject, config, logger, env, function(error, result) {
                expect(error).to.match(/Unexpected token/);
                expect(result).to.eql(null);
                done();
            });
        });

        it('Should return the body.message if status is not 200', function() {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(rawEventRequest, logger, config, activityEventCallback) {
                return activityEventCallback('245 - Bad response');
            });

            activityHelper.passOrderToProcessor({
                'this': 'is ignored'
            }, mockVprObject, config, logger, env, function(error, result) {
                expect(error).to.eql('245 - Bad response');
                expect(result).to.eql(null);
            });
        });

        it('Should return success', function() {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(rawEventRequest, logger, config, activityEventCallback) {
                return activityEventCallback(null, rawEventRequest);
            });

            activityHelper.passOrderToProcessor({
                'data': {
                    'this': 'Passed through mockAEP'
                }
            }, mockVprObject, config, logger, env, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql({
                    'data': {
                        'this': 'Passed through mockAEP'
                    }
                });
            });
        });

        it('Transit error should publish new job (re-try)', function(done) {
            var publishRouterSpy = sinon.spy(publisherRouter, 'publish');

            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(rawEventRequest, logger, config, activityEventCallback) {
                return activityEventCallback('101 - Error Reason');
            });

            activityHelper.passOrderToProcessor({
                'data': {
                    'this': 'Passed through mockAEP'
                }
            }, mockVprObject, config, logger, env, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql('Re-queued job');

                publishRouterSpy.restore();
                expect(publishRouterSpy.calledOnce).to.be.true();
                expect(publishRouterSpy.calledWithMatch({record: {activityRetry: 0}}, sinon.match.any)).to.be.true();

                done();
            });
        });
    });
});
