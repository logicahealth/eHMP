'use strict';

var saveVistaWriter = require('../lab/orders-lab-vista-writer');
var detailVistaWriter = require('./orders-common-detail-vista-writer');
var rpcClientFactory = require('./../../core/rpc-client-factory');
var async = require('async');

var detailWritebackContext = {
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
    logger: sinon.stub(require('bunyan').createLogger({
        name: 'detail-vista-writer'
    }))
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
        name: 'detail-vista-writer'
    }))
};

describe('write-back orders common detail vista writer integration tests', function() {
    afterEach(function() {
        rpcClientFactory.closeRpcClient(detailWritebackContext);
    });

    //Test w/o required resourceId
    it('tests that detail order returns error with no vprResponse', function(done) {
        this.timeout(5000);
        detailVistaWriter(detailWritebackContext, function(err, result) {
            expect(err).to.be.truthy();
            expect(detailWritebackContext.vprResponse).to.be.undefined();
            expect(detailWritebackContext.vprModel).to.be.undefined();
            done();
        });
    });


    //This test will create a new lab order in Vista.  Uncomment to test locally
    it.skip('tests that detail order returns successful detail', function(done) {
        this.timeout(20000);
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
                detailWritebackContext.resourceId = orderId;
                detailVistaWriter(detailWritebackContext, function(err, result) {
                    expect(err).to.be.falsy();
                    expect(detailWritebackContext.vprResponse).to.be.truthy();
                    expect(detailWritebackContext.vprModel).to.be.undefined();
                    callback(null, orderId);
                });
            },
            function(orderId, callback) {
                detailVistaWriter.getDetail(orderId, detailWritebackContext, function(err, result) {
                    expect(err).to.be.falsy();
                    expect(result).not.to.be.null();
                    console.log('detail: ' + result);
                    expect(detailWritebackContext.vprModel).to.be.undefined();
                    callback(null, orderId);
                });
            }
        ], function(err, results) {
            done();
        });
    });

});
