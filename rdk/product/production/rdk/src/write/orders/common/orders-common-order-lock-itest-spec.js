'use strict';

var orderLock = require('./orders-common-order-lock');
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
    logger: sinon.stub(require('bunyan').createLogger({name: 'patient-lock'}))
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
    logger: sinon.stub(require('bunyan').createLogger({name: 'patient-lock'}))
};

var orderId = '100615;12519'; 


describe('Checks the order lock functionality', function() {
    afterEach(function() {
        rpcClientFactory.closeRpcClient(writebackContext);
    });

    it('returns 1 if lock is sucessful', function(done) {
        this.timeout(50000);
        orderLock.lockOrder(orderId, writebackContext, function(err, result) {
            expect(result).to.match('1');
            expect(err).to.be.null();
            done();
        });
    });

    it('returns error message if lock is unsucessful', function(done) {
        this.timeout(50000);
        orderLock.lockOrder(orderId, writebackContext, function(err, result) {
            expect(result).to.match('1');
            expect(err).to.be.null();
            orderLock.lockOrder(orderId, writebackContext2, function(err, result) {
                expect(err).to.match('XIU,MARGARET is working on this order.');
                done();  
            });
        });
    });

    it('returns 1 if unlock is sucessful', function(done) {
        this.timeout(50000);
        orderLock.lockOrder(orderId, writebackContext, function(err, result) {
            expect(result).to.match('1');
            expect(err).to.be.null();
            orderLock.unlockOrder(orderId, writebackContext); 
            orderLock.lockOrder(orderId, writebackContext2, function(err, result) {
                expect(result).to.match('1');
                expect(err).to.be.null();
                done();  
            });
        });
    });
});
