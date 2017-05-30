'use strict';
var _ = require('lodash');
var activityHelper = require('./activity-management-event-handler-helper');
var clincialObjectsSubsystem = require('../../subsystems/clinical-objects/clinical-objects-subsystem');
var activityEventProcess = require('../../resources/activitymanagement/activities/eventprocessor/activity-event-process-resource');
var rdk = require('../../core/rdk');
var pidValidator = rdk.utils.pidValidator;

var bunyan = require('bunyan');
var logger = sinon.stub(bunyan.createLogger({
    name: 'test-logger'
}));
logger.child.returnsThis();

var handler = require('./activity-management-event-handler');
var util = require('../common/util');

var env = {};

var config = {
    'rdk': {
        protocol: 'http',
        host: 'REDACTED',
        activityPort: PORT,
        writePort: PORT,
        timeout: 60000,
        accessCode: 'IP    ',
        verifyCode: 'REDACTED',
        activityURI: '/resource/activities/startactivityevent',
        writeURI: '/resource/write-health-data/patient'
    },
    'jdsServer': {
        'baseUrl': 'http://REDACTED     ',
        'timeout': 120000
    },
    'generalPurposeJdsServer': {
        'baseUrl': 'http://REDACTED     ',
        'urlLengthLimit': 120
    },
    'jbpm': {
        'baseUrl': 'http://REDACTED     ',
        'apiPath': '/business-central/rest',
        'adminUser': {
            'username': 'REDACTED',
            'password': 'REDACTED'
        },
        'nurseUser': {
            'username': 'REDACTED',
            'password': 'REDACTED'
        },
        'healthcheckEndpoint': '/history/instances',
        'activityDatabase': {
            'user': 'activitydbuser',
            'password': 'REDACTED',
            'connectString': 'REDACTED     /xe'
        },
        'notifsDatabase': {
            'user': 'REDACTED',
            'password': 'REDACTED',
            'connectString': 'REDACTED     /xe'
        }
    },
    'activityManagementJobRetryLimit': 5,
};

var activityEventProcessResourceRepsonse = {
    'name': 'host-logger',
    'hostname': 'rdk-system-master',
    'pid': 7919,
    'level': 50,
    'message': 'No matches',
    'status': 200,
    'msg': '',
    'time': '2016-05-16T13:44:19.270Z',
    'v': 0
};

var mockVprObject = {
    'type': 'activity-management-event',
    'timestamp': '1465499986878',
    'patientIdentifier': {
        'type': 'pid',
        'value': 'C877;3'
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
        'providerUid': 'urn:va:user:C877:10000000270',
        'service': 'LR',
        'stampTime': '20160609151947',
        'start': '',
        'statusCode': 'urn:va:order-status:unr',
        'statusName': 'UNRELEASED',
        'statusVuid': 'urn:va:vuid:4501124',
        'stop': '',
        'uid': 'urn:va:order:C877:3:44243',
        'pid': 'C877;3',
        'kind': 'Laboratory',
        'providerDisplayName': 'User,Panorama',
        'summary': 'HEMOGLOBIN A1C BLOOD   SP *UNSIGNED*\r\n'
    },
    'jobId': '546c6eb0-b95c-4c51-b999-e1d62e432f3a'
};

var mockVprObjectWithClinicalObject = {
    'authorUid': 'urn:va:user:C877:10000000270',
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
        'pid': 'C877;3',
        'providerDisplayName': 'User,Panorama',
        'providerName': 'USER,PANORAMA',
        'providerUid': 'urn:va:user:C877:10000000270',
        'service': 'LR',
        'stampTime': '20160609151947',
        'start': '',
        'statusCode': 'urn:va:order-status:unr',
        'statusName': 'UNRELEASED',
        'statusVuid': 'urn:va:vuid:4501124',
        'stop': '',
        'summary': 'HEMOGLOBIN A1C BLOOD   SP *UNSIGNED*\r\n',
        'uid': 'urn:va:order:C877:3:44243'
    },
    'displayName': 'HEMOGLOBIN A1C - ROUTINE',
    'domain': 'ehmp-activity',
    'ehmpState': 'active',
    'patientUid': 'urn:va:patient:C877:3:3',
    'referenceId': 'urn:va:order:C877:3:44243',
    'subDomain': 'laboratory',
    'uid': 'urn:va:ehmp-order:C877:3:0c90c33b-6d28-4113-8f9d-598e392e6e82',
    'visit': {
        'dateTime': '20140814130730',
        'location': 'urn:va:location:C877:158',
        'serviceCategory': 'X'
    }
};

var mockVprObjectWithFakeClinicalObject = {
    'patientUid': 'urn:va:patient:C877:3:3',
    'authorUid': 'urn:va:user:C877:10000000270',
    'domain': 'ehmp-activity',
    'subDomain': 'laboratory',
    'referenceId': 'urn:va:order:C877:3:44243',
    'pid': 'C877;3',
    'ehmpState': 'active',
    'visit': {
        'serviceCategory': null,
        'dateTime': '20160609151900',
        'location': null
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
        'providerUid': 'urn:va:user:C877:10000000270',
        'service': 'LR',
        'stampTime': '20160609151947',
        'start': '',
        'statusCode': 'urn:va:order-status:unr',
        'statusName': 'UNRELEASED',
        'statusVuid': 'urn:va:vuid:4501124',
        'stop': '',
        'uid': 'urn:va:order:C877:3:44243',
        'pid': 'C877;3',
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
        'value': 'C877;3'
    },
    'rootJobId': '3f580ed5-af33-4e67-8326-7f5dee399987',
    'dataDomain': 'ehmp-order',
    'record': {
        'authorUid': 'urn:va:user:C877:10000000270',
        'patientUid': 'urn:va:patient:C877:3:3',
        'domain': 'ehmp-order',
        'subDomain': 'laboratory',
        'visit': {
            'serviceCategory': 'X',
            'dateTime': '20140814130730',
            'location': 'urn:va:location:C877:158'
        },
        'referenceId': 'urn:va:order:C877:3:44243',
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
        'uid': 'urn:va:ehmp-order:C877:3:0c1cd1e6-9e24-4825-b020-703f485eedce'
    },
    'jobId': '015ac5da-4d6c-4fba-8cfa-818c5c721bec'
};

var mockResponse = [{
    'authorUid': 'urn:va:user:C877:10000000270',
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
        'pid': 'C877;3',
        'providerDisplayName': 'User,Panorama',
        'providerName': 'USER,PANORAMA',
        'providerUid': 'urn:va:user:C877:10000000270',
        'service': 'LR',
        'stampTime': '20160609151947',
        'start': '',
        'statusCode': 'urn:va:order-status:unr',
        'statusName': 'UNRELEASED',
        'statusVuid': 'urn:va:vuid:4501124',
        'stop': '',
        'summary': 'HEMOGLOBIN A1C BLOOD   SP *UNSIGNED*\r\n',
        'uid': 'urn:va:order:C877:3:44243'
    },
    'displayName': 'HEMOGLOBIN A1C - ROUTINE',
    'domain': 'ehmp-order',
    'ehmpState': 'active',
    'patientUid': 'urn:va:patient:C877:3:3',
    'referenceId': 'urn:va:order:C877:3:44243',
    'subDomain': 'laboratory',
    'uid': 'urn:va:ehmp-order:C877:3:0c90c33b-6d28-4113-8f9d-598e392e6e82',
    'visit': {
        'dateTime': '20140814130730',
        'location': 'urn:va:location:C877:158',
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
    var mockIsSecondarySitePid;
    var mockClincialObjectsSubsystem;
    var mockPidValidator;
    beforeEach(function() {
        logger._level = 50;
        mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(req, res) {
            return res.status(200).rdkSend(activityEventProcessResourceRepsonse);
        });
        mockIsSecondarySitePid = sinon.stub(util, 'isSecondarySitePid');
        mockIsSecondarySitePid.returns(false);
        var clonedMockResponse = _.cloneDeep(mockResponse);
        mockClincialObjectsSubsystem = sinon.stub(clincialObjectsSubsystem, 'find', function(logger, appConfig, model, loadReference, callback) {
            return callback(null, {
                'items': clonedMockResponse
            });
        });
        mockPidValidator = sinon.stub(pidValidator, 'isPrimarySite');
        mockPidValidator.returns(true);
    });

    afterEach(function() {
        mockActivityEventProcess.restore();
        mockIsSecondarySitePid.restore();
        mockClincialObjectsSubsystem.restore();
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
            mockIsSecondarySitePid.restore();
            mockIsSecondarySitePid = sinon.stub(util, 'isSecondarySitePid');
            mockIsSecondarySitePid.returns(true);
            handler(logger, config, env, mockVprObject, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql(null);
            });
        });

        it('Should not error because the site is primary', function() {
            handler(logger, config, env, mockNonVprObject, function(error, result) {
                expect(false).to.eql(mockIsSecondarySitePid.returnValues[0]);
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
            mockClincialObjectsSubsystem.restore();
            mockClincialObjectsSubsystem = sinon.stub(clincialObjectsSubsystem, 'find', function(logger, appConfig, model, loadReference, callback) {
                return callback('Failed to read the notes from pJDS.');
            });
            handler(logger, config, env, mockNonVprObject, function(error, result) {
                expect(error).to.eql('Failed to read the notes from pJDS.');
            });
        });

        it('Should be a generated clinicalObject', function() {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(req, res) {
                return res.status(200).rdkSend(req.body);
            });
            mockClincialObjectsSubsystem.restore();
            mockClincialObjectsSubsystem = sinon.stub(clincialObjectsSubsystem, 'find', function(logger, appConfig, model, loadReference, callback) {
                return callback(['Clinical object not found']);
            });
            handler(logger, config, env, mockVprObject, function(error, result) {
                delete result.data.activityRetry;
                expect(error).to.eql(null);
                expect(_.omit(result, 'status')).to.eql(mockVprObjectWithFakeClinicalObject);
            });
        });

        it('Should change a VPR object domain to ehmp-activity', function() {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(req, res) {
                return res.status(200).rdkSend(req.body);
            });
            handler(logger, config, env, mockVprObject, function(error, result) {
                delete result.data.activityRetry;
                expect(error).to.eql(null);
                expect(_.omit(result, 'status')).to.eql(mockVprObjectWithClinicalObject);
            });
        });

        it('Should return null because the response was empty and it got a Non-VPR object', function() {
            mockClincialObjectsSubsystem.restore();
            mockClincialObjectsSubsystem = sinon.stub(clincialObjectsSubsystem, 'find', function(logger, appConfig, model, loadReference, callback) {
                return callback(['Clinical object not found']);
            });
            handler(logger, config, env, mockNonVprObject, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql(null);
            });
        });

        it('Should have the response (VPR) data in the newrecord.data key', function() {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(req, res) {
                return res.status(200).rdkSend(req.body);
            });
            handler(logger, config, env, mockVprObject, function(error, result) {
                expect(error).to.eql(null);
                expect(result.data).to.eql(mockVprObject.record);
            });
        });

        it('Should have the record (Non-VPR) data in the newrecord.data key', function() {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(req, res) {
                return res.status(200).rdkSend(req.body);
            });
            handler(logger, config, env, mockNonVprObject, function(error, result) {
                expect(error).to.eql(null);
                expect(result.data).to.eql(mockResponse[0].data);
            });
        });

        it('Should return callback', function() {
            handler(logger, config, env, mockVprObject, function(error, result) {
                expect(error).to.eql(null);
                expect(result.message).to.eql('No matches');
            });
        });
    });

    describe('cleanClinicalObjectResponseArray', function() {
        var clonedResponse = _.cloneDeep(mockResponse[0]);
        clonedResponse.domain = 'ehmp-activity';

        it('Should only return one object with domain of ehmp-order; single response', function() {
            var response = activityHelper.cleanClinicalObjectResponseArray(mockResponse, logger, {});
            expect(response).to.eql(mockResponse[0]);
        });

        it('Should only return one object with domain of ehmp-order; multiple response only one ehmp-order', function() {
            var response = activityHelper.cleanClinicalObjectResponseArray(mockResponse, logger, {});
            expect(response).to.eql(mockResponse[0]);
        });

        it('Should error out because no ehmp-order domain found in responses; single responses', function() {
            activityHelper.cleanClinicalObjectResponseArray(clonedResponse, logger, function(error, response) {
                expect(response).to.eql(null);
                expect(response).to.eql(null);
            });
        });

        it('Should error out because no ehmp-order domain found in responses; multiple responses', function() {
            activityHelper.cleanClinicalObjectResponseArray(mockResponse, logger, function(error, response) {
                expect(response).to.eql(null);
                expect(response).to.eql(null);
            });
        });
    });

    describe('createRequestObject', function() {
        var body = {
            'data': {
                'a': 'b',
                'x': 'y'
            },
            'group': ['one', 2, '3'],
            'id': 'xxx:xx:xxxx-xxx'
        };
        var config = {
            'database': {
                'user': 'abcd',
                'pass': '1234'
            },
            'log': 'warn'
        };
        var req = activityHelper.createRequestObject(body, config, logger);
        it('Should have 3 keys, the first key is an object and the second key is an array, and the third is a string', function() {
            expect(Object.keys(req.body).length).to.eql(3);
            expect(typeof req.body.data).to.eql('object');
            expect(req.body.data.a).to.eql('b');
            expect(_.isArray(req.body.group)).to.eql(true);
            expect(req.body.group[1]).to.eql(2);
            expect(typeof req.body.id).to.eql('string');
            expect(req.body.id).to.eql('xxx:xx:xxxx-xxx');
        });

        it('Should have 2 keys, the first is an object and the second is a string', function() {
            expect(Object.keys(req.app.config).length).to.eql(2);
            expect(typeof req.app.config.database).to.eql('object');
            expect(req.app.config.database.user).to.eql('abcd');
            expect(typeof req.app.config.log).to.eql('string');
            expect(req.app.config.log).to.eql('warn');
        });
    });

    describe('createResponseObject', function() {
        var error, response;
        var res = activityHelper.createResponseObject(logger, function(err, data) {
            error = err;
            response = data;
        });
        it('Should set status to 800 and return that with the callback', function() {
            res.status(800).send(res.statusCode);
            expect(error).to.eql(800);
        });

        it('Should return the callback when res.send() is called', function() {
            res.status(200).send(null, 'Testing callback');
            expect(response).to.eql('Testing callback');
        });

        it('Should send back the message as an error', function() {
            res.status(204).rdkSend('This should come back undefined');
            expect(error.message).to.eql('This should come back undefined');
        });

        it('Should send an error that the body is null but the status is 200.', function() {
            res.status(200).rdkSend(null, null);
            expect(error.message).to.eql('Error - Activity Event Processor return an empty or null body.');
        });

        it('Should send an error that the body is undefined but the status is 200.', function() {
            res.status(200).rdkSend(null, undefined);
            expect(error.message).to.eql('Error - Activity Event Processor return an empty or null body.');
        });

        it('Should have the content in the data key', function() {
            res.status(200).rdkSend({
                'user': 'pass'
            });
            expect(response).to.eql({
                'data': {
                    'user': 'pass'
                }
            });
        });

        it('Should get processed into JSON and have the content in the data key', function() {
            res.status(200).set('Content-Type', 'application/json').rdkSend('{"userString": "passString"}');
            expect(response).to.eql({
                'data': {
                    'userString': 'passString'
                }
            });
        });

        it('Should get passed back as a string because the JSON is invalid', function() {
            res.status(200).set('Content-Type', 'application/json').rdkSend('{\'userString\': \'passString\'}');
            expect(response).to.eql({
                'message': '{\'userString\': \'passString\'}'
            });
        });

        it('Should come back in {message: body} format where body is a string', function() {
            res.status(200).rdkSend('This should come back in the message key');
            expect(response).to.eql({
                message: 'This should come back in the message key'
            });
        });
    });

    describe('passOrderToProcessor', function() {
        it('Should pass into req creation as an object', function() {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(req, res) {
                return res.status(200).rdkSend(req.body);
            });
            activityHelper.passOrderToProcessor({
                data: {
                    user: 'pass'
                }
            }, mockVprObject, config, logger, env, function() {
                return;
            }, function(error, result) {
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
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(req, res) {
                return res.status(200).rdkSend(req.body);
            });
            activityHelper.passOrderToProcessor('{"data": {"user": "pass"}}', mockVprObject, config, logger, env, function() {
                return;
            }, function(error, result) {
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
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(req, res) {
                return res.status(200).rdkSend('ignored for this test');
            });
            activityHelper.passOrderToProcessor('{\'data\': {\'user\': \'pass\'}}', mockVprObject, config, logger, env, function() {
                return;
            }, function(error, result) {
                expect(error.message).to.eql('Unexpected token \'');
                expect(result).to.eql(null);
            });
        });

        it('Should return a working request object', function() {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(req, res) {
                return res.status(200).rdkSend(req);
            });
            activityHelper.passOrderToProcessor({
                data: {
                    user: 'pass'
                }
            }, mockVprObject, config, logger, env, function() {
                return;
            }, function(error, result) {
                expect(error).to.eql(null);
                expect(Object.keys(result)).to.eql(['data']);
            });
        });

        it('Should return the input because it is an object', function() {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(req, res) {
                return res.send(null, {
                    data: {
                        user: 'pass'
                    }
                });
            });
            activityHelper.passOrderToProcessor({
                'this': 'is ignored'
            }, mockVprObject, config, logger, env, function() {
                return;
            }, function(error, result) {
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
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(req, res) {
                return res.send(null, '{"data": {"user": "pass"}}');
            });
            activityHelper.passOrderToProcessor({
                'this': 'is ignored'
            }, mockVprObject, config, logger, env, function() {
                return;
            }, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql({
                    data: {
                        user: 'pass'
                    }
                });
            });
        });

        it('Should catch the bad JSON and return an error', function() {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(req, res) {
                return res.send(null, '{\'data\': {\'user\': \'pass\'}}');
            });
            activityHelper.passOrderToProcessor({
                'this': 'is ignored'
            }, mockVprObject, config, logger, env, function() {
                return;
            }, function(error, result) {
                expect(error.message).to.eql('Unexpected token \'');
                expect(result).to.eql(null);
            });
        });

        it('Should return the body.message if status is not 200', function() {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(req, res) {
                return res.status(204).rdkSend({
                    message: '245 - Bad response'
                });
            });
            activityHelper.passOrderToProcessor({
                'this': 'is ignored'
            }, mockVprObject, config, logger, env, function() {
                return;
            }, function(error, result) {
                expect(error.message).to.eql('245 - Bad response');
                expect(result).to.eql(null);
            });
        });

        it('Should return success', function() {
            mockActivityEventProcess.restore();
            mockActivityEventProcess = sinon.stub(activityEventProcess, 'startActivityEvent', function(req, res) {
                return res.status(200).rdkSend(req.body);
            });
            activityHelper.passOrderToProcessor({
                'data': {
                    'this': 'Passed through mockAEP'
                }
            }, mockVprObject, config, logger, env, function() {
                return;
            }, function(error, result) {
                expect(error).to.eql(null);
                expect(result).to.eql({
                    'data': {
                        'this': 'Passed through mockAEP'
                    }
                });
            });
        });
    });
});
