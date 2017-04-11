'use strict';

var validator = require('./clinical-objects-validator-activity');
var requestSubdomainValidator = require('./clinical-objects-validator-request');

describe('activity clinical object validator', function() {
    var json;

    beforeEach(function() {
        var early = new Date();
        var late = new Date();
        early.setDate(early.getDate() + 1);
        late.setDate(late.getDate() + 4);

        json = {
            'patientUid': 'urn:va:patient:9E7A:3:3',
            'authorUid': 'urn:va:user:9E7A:123',
            'domain': 'ehmp-activity',
            'subDomain': 'request',
            'visit': {
                'location': 'location UID',
                'serviceCategory': 'serviceCategoryCode',
                'dateTime': 'timestamp'
            },
            'ehmpState': 'active',
            'displayName': 'title',
            'data': {
                'activity': {
                    'deploymentId': 'VistaCore:Order',
                    'processDefinitionId': 'Order.Request',
                    'processInstanceId': '123'
                }
            }
        };

        validator._setConfiguration({
            'domains': {
                'ehmp-activity': {
                    'modulePath': 'clinical-objects-validator-activity',
                    'subdomains': {
                        'request': {
                            'modulePath': 'clinical-objects-validator-request',
                            'deploymentId': 'VistaCore:Order',
                            'processDefinitionId': 'Order.Request'
                        }
                    }
                }
            }
        });

        sinon.stub(requestSubdomainValidator, 'validateModel', function(errorMessages, model, appConfig, callback) {
            callback(errorMessages);
        });
    });

    afterEach(function() {
        requestSubdomainValidator.validateModel.restore();
        validator._setConfiguration();
    });

    it('validates for happy path', function(done) {
        validator._validateActivityModel([], json, null, function(errorMessages) {
            expect(errorMessages.length).to.be(0);
            done();
        });
    });

    it ('rejects if data.activity is missing', function(done) {
        json.data.activity = undefined;

        validator._validateActivityModel([], json, null, function(errorMessages) {
            expect(errorMessages.length).to.be(3);
            done();
        });
    });

    it('rejects if deploymentId is missing', function(done) {
        json.data.activity.deploymentId = undefined;

        validator._validateActivityModel([], json, null, function(errorMessages) {
            expect(errorMessages.length).to.be(1);
            done();
        });
    });

    it('rejects if deploymentId is empty', function(done) {
        json.data.activity.deploymentId = '';

        validator._validateActivityModel([], json, null, function(errorMessages) {
            expect(errorMessages.length).to.be(1);
            done();
        });
    });

    it('rejects if deploymentId is wrong', function(done) {
        json.data.activity.deploymentId = 'bogus:value';

        validator._validateActivityModel([], json, null, function(errorMessages) {
            expect(errorMessages.length).to.be(1);
            done();
        });
    });

    it('rejects if processDefinitionId is missing', function(done) {
        json.data.activity.processDefinitionId = undefined;

        validator._validateActivityModel([], json, null, function(errorMessages) {
            expect(errorMessages.length).to.be(1);
            done();
        });
    });

    it('rejects if processDefinitionId is empty', function(done) {
        json.data.activity.processDefinitionId = '';

        validator._validateActivityModel([], json, null, function(errorMessages) {
            expect(errorMessages.length).to.be(1);
            done();
        });
    });

    it('rejects if processDefinitionId is wrong', function(done) {
        json.data.activity.processDefinitionId = 'bogus:value';

        validator._validateActivityModel([], json, null, function(errorMessages) {
            expect(errorMessages.length).to.be(1);
            done();
        });
    });

    it('rejects if processInstanceId is missing', function(done) {
        json.data.activity.processInstanceId = undefined;

        validator._validateActivityModel([], json, null, function(errorMessages) {
            expect(errorMessages.length).to.be(1);
            done();
        });
    });

    it('rejects if processInstanceId is empty', function(done) {
        json.data.activity.processInstanceId = '';

        validator._validateActivityModel([], json, null, function(errorMessages) {
            expect(errorMessages.length).to.be(1);
            done();
        });
    });
});
