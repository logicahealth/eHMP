'use strict';

var saveVistaWriter = require('../lab/orders-lab-vista-writer');
var editVistaWriter = require('./orders-common-edit-vista-writer');
var rpcClientFactory = require('./../../core/rpc-client-factory');

var editWritebackContext = {
    pid: '9E7A;100615',
    vistaConfig: {
        host: 'IP        ',
        port: PORT,
        accessCode: 'REDACTED',
        verifyCode: 'REDACTED',
        localIP: 'IP      ',
        localAddress: 'localhost',
        noReconnect: true
    },
    logger: sinon.stub(require('bunyan').createLogger({name: 'edit-vista-writer'}))
};

var saveWritebackContext = {
    pid: '9E7A;100615',
    vistaConfig: {
        host: 'IP        ',
        port: PORT,
        accessCode: 'REDACTED',
        verifyCode: 'REDACTED',
        localIP: 'IP      ',
        localAddress: 'localhost'
    },
    model: {
        'dfn': '100615',
        'provider': '10000000238',
        'location': '285',
        'orderDialog': 'LR OTHER LAB TESTS',
        'displayGroup': '5',
        'quickOrderDialog': '2',
        'inputList': [
            {
                'inputKey': '4',
                'inputValue': '350'
            },
            {
                'inputKey': '126',
                'inputValue': '1'
            },
            {
                'inputKey': '127',
                'inputValue': '72'
            },
            {
                'inputKey': '180',
                'inputValue': '9'
            },
            {
                'inputKey': '28',
                'inputValue': 'SP'
            },
            {
                'inputKey': '6',
                'inputValue': 'TODAY'
            },
            {
                'inputKey': '29',
                'inputValue': '28'
            }
        ],
        'localId': '12519',
        'uid': 'urn:va:order:9E7A:100615:12519',
        'kind': 'Laboratory'
    },
    logger: sinon.stub(require('bunyan').createLogger({name: 'edit-vista-writer'}))
};

describe('write-back orders common edit vista writer integration tests', function() {
    afterEach(function() {
        rpcClientFactory.closeRpcClient(editWritebackContext);
    });

    //Test w/o required resourceId
    it('tests that edit order returns error with no vprResponse', function(done) {
        this.timeout(5000);
        editVistaWriter(editWritebackContext, function(err, result) {
            expect(err).to.be.truthy();
            expect(editWritebackContext.vprResponse).to.be.undefined();
            expect(editWritebackContext.vprModel).to.be.undefined();
            done();
        });
    });


    //This test will create a new lab order in Vista.  Uncomment to test locally
    it.skip('tests that edit order returns successful vprResponse', function(done) {
        this.timeout(10000);
        saveVistaWriter.create(saveWritebackContext, function(err, result) {
            expect(err).to.be.falsy();
            expect(saveWritebackContext.vprResponse).to.be.truthy();
            var resultArray = ('' + saveWritebackContext.vprResponse).split('^');
            var orderId = resultArray[0].substring(1, resultArray[0].length);
            console.log('===== order ID: '+ orderId);
            editWritebackContext.resourceId = orderId;
            editVistaWriter(editWritebackContext, function(err, result) {
                expect(err).to.be.falsy();
                expect(editWritebackContext.vprResponse).to.be.truthy();
                expect(editWritebackContext.vprModel).to.be.undefined();
                done();
            });
        });
    });

});
