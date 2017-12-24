'use strict';

var saveVistaWriter = require('../lab/orders-lab-vista-writer');
var actionValidVistaWriter = require('./orders-common-action-valid-vista-writer');
var rpcClientFactory = require('./../../core/rpc-client-factory');
var async = require('async');

var saveWritebackContext = {
    pid: 'SITE;100615',
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

describe('write-back orders common action valid vista writer integration tests', function() {

    afterEach(function() {
        rpcClientFactory.closeRpcClient(saveWritebackContext);
    });

    //Test w/o required order ID
    it('tests that check order returns error', function(done) {
        this.timeout(50000);
        actionValidVistaWriter.actionValid(null, 'ES', '10000000271', saveWritebackContext, function(err, result) {
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
                    var orderId;
                    if (resultJson.localId) {
                        orderId = resultJson.localId + ';1';
                        callback(null, orderId, null);
                    } else {
                        callback(null, null, resultJson.orderCheckList);
                    }
                });
            },
            function(orderId, orderCheckList, callback) {
                if (!orderId) {
                    saveWritebackContext.model.orderCheckList = orderCheckList;
                    saveVistaWriter.create(saveWritebackContext, function(err, result) {
                        expect(err).to.be.falsy();
                        expect(saveWritebackContext.vprResponse).to.be.truthy();
                        var resultJson = JSON.parse(saveWritebackContext.vprResponse);
                        callback(null, resultJson.localId + ';1');
                    });
                } else {
                    callback(null, orderId);
                }
            },
            function(orderId, callback) {
                console.log('===== order ID: ' + orderId);
                actionValidVistaWriter.actionValid(orderId, 'ES', '10000000238', saveWritebackContext, function(err, result) {
                    expect(err).not.to.be.truthy();
                    callback('pau');
                });
            }
        ], function(err, results) {
            done();
        });
    });


});
