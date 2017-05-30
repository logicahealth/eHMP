'use strict';

var saveVistaWriter = require('../lab/orders-lab-vista-writer');
var checkVistaWriter = require('./orders-common-check-vista-writer');
var rpcClientFactory = require('./../../core/rpc-client-factory');

var saveWritebackContext = {
    interceptorResults: {
        patientIdentifiers: {
            'dfn': '100615',
            'siteDfn': '9E7A;100615',
            'site': '9E7A'
        }
    },
    vistaConfig: {
        host: 'IP        ',
        port: PORT,
        accessCode: 'REDACTED',
        verifyCode: 'REDACTED',
        localIP: 'IP      ',
        localAddress: 'localhost',
        noReconnect: true
    },
    model: {
        'provider': '10000000238',
        'location': '129',
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
        name: 'check-vista-writer'
    }))
};

describe('write-back orders common check vista writer integration tests', function() {

    afterEach(function() {
        rpcClientFactory.closeRpcClient(saveWritebackContext);
    });

    //Test w/o required dfn
    it('tests that check order returns error', function(done) {
        this.timeout(50000);
        checkVistaWriter.check(saveWritebackContext, function(err, result) {
            expect(err).to.be.truthy();
            done();
        });
    });

        //This test will create new lab orders in Vista.  Uncomment to test locally
        it.skip('tests that check order returns successful vprResponse', function(done) {
            this.timeout(10000);
            saveWritebackContext.interceptorResults.patientIdentifiers.dfn = '3';
            saveVistaWriter.create(saveWritebackContext, function(err, result) {
                expect(err).to.be.falsy();
                expect(saveWritebackContext.vprResponse).to.be.truthy();
                saveVistaWriter.create(saveWritebackContext, function(err, result) {
                    expect(err).to.be.falsy();
                    expect(saveWritebackContext.vprResponse).to.be.truthy();
                    var response = JSON.parse(saveWritebackContext.vprResponse);
                    expect(response.orderCheckList).to.exist();
                    expect(response.orderCheckList[0].orderCheck).to.exist();
                    done();
                });
            });
        });
});
