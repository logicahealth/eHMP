'use strict';

var lockPatient = require('./orders-common-patient-lock');
var rpcClientFactory = require('./../../core/rpc-client-factory');

var writebackContext = {
    pid: '9E7A;100615',
    vistaConfig: {
        host: 'IP        ',
        port: PORT,
        accessCode: 'REDACTED',
        verifyCode: 'REDACTED',
        localIP: 'IP      ',
        localAddress: 'localhost'
    },
    interceptorResults: {
        patientIdentifiers: {
            dfn: '100615'
        }
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
        'localId': '12519',
        'uid': 'urn:va:order:9E7A:100615:12519',
        'kind': 'Laboratory'
    },
    logger: sinon.stub(require('bunyan').createLogger({
        name: 'patient-lock'
    }))
};

var writebackContext2 = {
    pid: '9E7A;100615',
    vistaConfig: {
        host: 'IP        ',
        port: PORT,
        accessCode: 'REDACTED',
        verifyCode: 'REDACTED',
        localIP: 'IP      ',
        localAddress: 'localhost'
    },
    interceptorResults: {
        patientIdentifiers: {
            dfn: '100615'
        }
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
        'localId': '12519',
        'uid': 'urn:va:order:9E7A:100615:12519',
        'kind': 'Laboratory'
    },
    logger: sinon.stub(require('bunyan').createLogger({
        name: 'patient-lock'
    }))
};

describe('Checks the patient lock functionality', function() {
    afterEach(function() {
        rpcClientFactory.closeRpcClient(writebackContext);
    });

    it('returns 1 if lock is sucessful', function(done) {
        this.timeout(5000);
        lockPatient.lockPatient(writebackContext, function(err, result) {
            expect(result).to.match('1');
            expect(err).to.be.null();
            lockPatient.unlockPatient(writebackContext);
            done();
        });
    });

    it.skip('returns 0 and an error message if lock is unsucessful', function(done) {
        this.timeout(7000);
        lockPatient.lockPatient(writebackContext, function(err, result) {
            //console.log('THIS IS THE ERROR MESSAGE: ' + err);
            //console.log('THIS IS THE RESULT MESSAGE: ' + result);
            expect(result).to.match('1');
            expect(err).to.be.null();
            lockPatient.lockPatient(writebackContext2, function(err2, result2) {
                //console.log('THIS IS THE ERROR MESSAGE: ' + err2);
                //console.log('THIS IS THE RESULT MESSAGE: ' + result2);
                done();
            });
            lockPatient.unlockPatient(writebackContext);
        });
    });
});
