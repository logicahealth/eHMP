'use strict';

var saveVistaWriter = require('../lab/orders-lab-vista-writer');
var checkSessionVistaWriter = require('./orders-common-check-session-vista-writer');
var rpcClientFactory = require('./../../core/rpc-client-factory');
var async = require('async');

var saveWritebackContext = {
    pid: '9E7A;100615',
    vistaConfig: {
        host: '10.2.2.101',
        port: 9210,
        accessCode: 'mx1234',
        verifyCode: 'mx1234!!',
        localIP: '10.2.2.1',
        localAddress: 'localhost',
        noReconnect: true
    },
    model: {
        'dfn': '100716',
        'provider': '10000000271',
        'location': '129',
        'orderDialog': 'LR OTHER LAB TESTS',
        'displayGroup': '5',
        'quickOrderDialog': '2',
        'inputList': [{
            'inputKey': '4',
            'inputValue': '299'
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
            'inputValue': 'WC'
        }, {
            'inputKey': '6',
            'inputValue': 'NOW'
        }, {
            'inputKey': '29',
            'inputValue': '28'
        }],
        'kind': 'Laboratory'
    },
    logger: sinon.stub(require('bunyan').createLogger({
        name: 'check-vista-writer'
    }))
};

describe('write-back orders common check session vista writer integration tests', function() {

    afterEach(function() {
        rpcClientFactory.closeRpcClient(saveWritebackContext);
    });

    //Test w/o required order ID
    it('tests that check session returns error', function(done) {
        this.timeout(50000);
        checkSessionVistaWriter.check(null, saveWritebackContext, function(err, result) {
            expect(err).to.be.truthy();
            done();
        });
    });

    //This test will create new lab orders in Vista.  Uncomment to test locally
    it.skip('tests that action valid returns no error', function(done) {
        this.timeout(15000);
        async.waterfall([
            function(callback) {
                saveVistaWriter.create(saveWritebackContext, function(err, result) {
                    expect(err).to.be.falsy();
                    expect(saveWritebackContext.vprResponse).to.be.truthy();
                    var resultJson = JSON.parse(saveWritebackContext.vprResponse);
                    callback(null, resultJson.orderCheckList);
                });
            },
            function(orderCheckList, callback) {
                if (!orderCheckList) {
                    saveVistaWriter.create(saveWritebackContext, function(err, result) {
                        expect(err).to.be.falsy();
                        expect(saveWritebackContext.vprResponse).to.be.truthy();
                        var resultJson = JSON.parse(saveWritebackContext.vprResponse);
                        callback(null, resultJson.orderCheckList);
                    });
                } else {
                    callback(null, orderCheckList);
                }
            },
            function(orderCheckList, callback) {
                saveWritebackContext.model.orderCheckList = orderCheckList;
                saveVistaWriter.create(saveWritebackContext, function(err, result) {
                    expect(err).to.be.falsy();
                    expect(saveWritebackContext.vprResponse).to.be.truthy();
                    var resultJson = JSON.parse(saveWritebackContext.vprResponse);
                    callback(null, resultJson.localId + ';1');
                });
            },
            function(orderId, callback) {
                console.log('===== order ID: ' + orderId);
                checkSessionVistaWriter.check(orderId, saveWritebackContext, function(err, result) {
                    expect(err).not.to.be.truthy();
                    callback('pau');
                });
            }
        ], function(err, results) {
            done();
        });
    });


});
