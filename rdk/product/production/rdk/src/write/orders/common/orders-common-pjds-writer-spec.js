'use strict';

var pjdsWriter = require('./orders-common-pjds-writer');
var pjds = require('../../../subsystems/clinical-objects/clinical-objects-subsystem');

var writebackContext = {
    pid: 'SITE;100615',
    appConfig: {
        generalPurposeJdsServer: {
            baseUrl: 'foo'
        }
    },
    vistaConfig: {
        host: 'IP        ',
        port: PORT,
        accessCode: 'USER  ',
        verifyCode: 'PW      ',
        localIP: 'IP      ',
        localAddress: 'localhost',
        noReconnect: true
    },
    model: {
        'dfn': '100615',
        'provider': '10000000238',
        'location': '285',
        'orderDialog': 'LR OTHER LAB TESTS',
        'displayGroup': '5',
        'quickOrderDialog': '2',
        'inputList': [{
            'inputKey': '4',
            'inputValue': '350'
        }, {
            'inputKey': '126',
            'inputValue': '1'
        }, {
            'inputKey': '127',
            'inputValue': '72'
        }, {
            'inputKey': '180',
            'inputValue': '9'
        }, {
            'inputKey': '28',
            'inputValue': 'SP'
        }, {
            'inputKey': '6',
            'inputValue': 'TODAY'
        }, {
            'inputKey': '29',
            'inputValue': '28'
        }],
        'kind': 'Laboratory',
        'clinicalObject': {
            'patientUid': 'urn:va:patient:SITE:100615:100615',
            'authorUid': 'urn:va:user:SITE:10000000238',
            'domain': 'ehmp-order',
            'subDomain': 'laboratory',
            'visit': {
                'location': 'urn:va:location:SITE:285',
                'serviceCategory': 'PSB',
                'dateTime': '20160102123040'
            },
            'data': {
                'pastDueDate': '20160101'
            }
        }
    },
    vprModel: {
        uid: 'urn:va:order:SITE:100615:39222'
    },
    logger: sinon.stub(require('bunyan').createLogger({
        name: 'orders-common-pjds-writer-itest'
    }))
};

var clinicalObject = {
    'patientUid': 'urn:va:patient:SITE:100615:100615',
    'authorUid': 'urn:va:user:SITE:10000000238',
    'domain': 'ehmp-order',
    'subDomain': 'laboratory',
    'visit': {
        'location': 'urn:va:location:SITE:285',
        'serviceCategory': 'PSB',
        'dateTime': '20160102123040'
    },
    'data': {
        'pastDueDate': '20160101',
        'annotation': 'comments',
        'problemRelationship': 'urn:va:problem:SITE:100615:183'
    }
};

describe('orders-common-pjds-writer', function() {
    beforeEach(function() {
        delete writebackContext.model.clinicalObject.ehmpState;
        delete writebackContext.model.clinicalObject.referenceId;
    });

    afterEach(function() {
        pjds.create.restore();
    });

    it('tests that pjds writer returns no error', function() {
        sinon.stub(pjds, 'create', function(logger, appConfig, model, callback) {
            callback();
        });

        pjdsWriter(writebackContext, {}, function(err) {
            expect(err).to.be.falsy();
            expect(writebackContext.model.clinicalObject.ehmpState).to.equal('active');
            expect(writebackContext.model.clinicalObject.referenceId).to.equal('urn:va:order:SITE:100615:39222');
            expect(writebackContext.model.clinicalObject.data.pastDueDate).to.equal('20160101');
        });
    });

    it('tests that pjds writer returns error response', function() {
        var pjdsResponse = {};

        sinon.stub(pjds, 'create', function(logger, appConfig, model, callback) {
            callback('error');
        });

        pjdsWriter(writebackContext, pjdsResponse, function(err) {
            expect(err).to.be.falsy();
            expect(pjdsResponse.message).to.equal('Error calling the clinical object subsystem endpoint');
        });
    });

    it('tests that pjds writer returns immediately when VPR model is missing', function() {
        delete writebackContext.vprModel;

        sinon.stub(pjds, 'create', function(logger, appConfig, model, callback) {
            setImmediate(callback);
        });

        pjdsWriter(writebackContext, {}, function(err) {
            expect(err).to.be.falsy();
            expect(writebackContext.model.clinicalObject.ehmpState).to.not.equal('active');
            expect(writebackContext.model.clinicalObject.referenceId).to.equal(undefined);
        });
    });
});
describe('createNoteObject', function() {
    it('tests that create note object returns correct note object', function() {
        var noteObject = pjdsWriter._createNoteObject(clinicalObject, 'urn:va:ehmp:SITE;100615:0babd148-3f0d-4a0f-8c1a-c39ce3be48f4');
        var expectedNoteObject = {
            'patientUid': 'urn:va:patient:SITE:100615:100615',
            'authorUid': 'urn:va:user:SITE:10000000238',
            'domain': 'ehmp-note',
            'subDomain': 'noteObject',
            'visit': {
                'location': 'urn:va:location:SITE:285',
                'serviceCategory': 'PSB',
                'dateTime': '20160102123040'
            },
            'ehmpState': 'active',
            'referenceId': null,
            'data': {
                'sourceUid': 'urn:va:ehmp:SITE;100615:0babd148-3f0d-4a0f-8c1a-c39ce3be48f4',
                'madlib': '',
                'problemRelationship': 'urn:va:problem:SITE:100615:183',
                'annotation': 'comments'
            }
        };
        expect(noteObject).eql(expectedNoteObject);
    });
});
