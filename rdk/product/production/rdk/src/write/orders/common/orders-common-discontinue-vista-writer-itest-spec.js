'use strict';

var saveVistaWriter = require('../lab/orders-lab-vista-writer');
var discontinueVistaWriter = require('./orders-common-discontinue-vista-writer');
var discontinueDetailsVistaWriter = require('./orders-common-discontinue-details-vista-writer');
var rpcClientFactory = require('./../../core/rpc-client-factory');
var async = require('async');

var discontinueWritebackContext = {
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
        'provider': '10000000238',
        'location': '285',
        'kind': 'Laboratory',
        'orderList': [
            {'orderId': '0', 'hash': 'foobar'}
        ]
    },
    interceptorResults: {
        patientIdentifiers: {
            'dfn': '3',
        }
    },
    logger: sinon.stub(require('bunyan').createLogger({name: 'discontinue-vista-writer'}))
};

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
        'provider': '10000000271',
        'location': '285',
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
    interceptorResults: {
        patientIdentifiers: {
            'dfn': '100716',
        }
    },
    logger: sinon.stub(require('bunyan').createLogger({
        name: 'check-vista-writer'
    }))
};

describe('write-back orders common discontinue vista writer integration tests', function() {
    afterEach(function() {
        rpcClientFactory.closeRpcClient(discontinueWritebackContext);
    });

    //Test w/o required orderId
    it('tests that discontinue order returns error with no vprResponse & no vprModel', function(done) {
        this.timeout(5000);
        discontinueVistaWriter(discontinueWritebackContext, function(err, result) {
            expect(err).to.be.truthy();
            expect(discontinueWritebackContext.vprResponse).to.be.undefined();
            done();
        });
    });


    //This test will create new lab orders in Vista.  Uncomment to test locally
    it.skip('tests that discontinue order returns successful vprResponse', function(done) {
        this.timeout(20000);
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
                saveWritebackContext.model.orderIds = [orderId];
                discontinueDetailsVistaWriter(saveWritebackContext, function(err, result) {
                    expect(err).not.to.be.truthy();
                    expect(saveWritebackContext.vprResponse).not.to.be.empty();
                    expect(saveWritebackContext.vprResponse[0].orderId).to.equal(orderId);
                    console.log('detail: ' + saveWritebackContext.vprResponse[0].detail);
                    expect(saveWritebackContext.vprResponse[0].detail).not.to.be.null();
                    console.log('hash: ' + saveWritebackContext.vprResponse[0].hash);
                    expect(saveWritebackContext.vprResponse[0].hash).not.to.be.null();
                    discontinueWritebackContext.model.orderList[0].orderId = orderId;
                    discontinueWritebackContext.model.orderList[0].hash = saveWritebackContext.vprResponse[0].hash;
                    discontinueVistaWriter(discontinueWritebackContext, function(err, result) {
                        expect(err).to.be.falsy();
                        expect(discontinueWritebackContext.vprResponse).to.be.truthy();
                        callback('pau');
                    });
                });
            }
        ], function(err, results) {
            done();
        });
    });

});
