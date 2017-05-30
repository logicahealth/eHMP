'use strict';

var signVistaWriter = require('./orders-common-sign-vista-writer'),
    rpcClientFactory = require('./../../core/rpc-client-factory'),
    detailVistaWriter = require('./orders-common-detail-vista-writer'),
    crypto = require('crypto');

//Tests sign orders routine - Uncomment to test locally
//describe("Checks sign order functionality", function() {
//    var writebackContext = {
//        pid: '9E7A;100615',
//        vistaConfig: {
//            host: 'IP        ',
//            port: PORT,
//            accessCode: 'REDACTED',
//            verifyCode: 'REDACTED',
//            localIP: 'IP      ',
//            localAddress: 'localhost'
//        },
//        model: {
//            'dfn': '100615',
//            'provider': '10000000271',
//            'location': '285',
//            'eSig':'REDACTED',
//            'orderList': [{
//                'orderId': '38999;1'
//            }],
//            overrideReason:'foobar',
//            orderCheckList:[{
//                orderCheck:'38999;1^11^2^Duplicate order: HEMOGLOBIN A1C BLOOD   SP LB #18542 10/1/15 [UNCOLLECTED]'
//            },{
//                orderCheck:'38999;1^11^2^Duplicate order: HEMOGLOBIN A1C BLOOD   SP LB #18547 10/2/15 [UNCOLLECTED]'
//            },{
//                orderCheck:'38999;1^24^2^Max lab test order freq exceeded for: HEMOGLOBIN A1C'
//            }]
//        },
//        logger: sinon.stub(require('bunyan').createLogger({name: 'sign-vista-writer'}))
//    };
//
//    afterEach(function () {
//        rpcClientFactory.closeRpcClient(writebackContext);
//    });
//
//    it('test sign order workflow', function(done) {
//        this.timeout(20000);
//
//        detailVistaWriter.getDetail(writebackContext.model.orderList[0].orderId, writebackContext, function(err, result){
//            //compute order detail hash
//            console.log("hash: " + crypto.createHash('md5').update(result).digest('hex'));
//            writebackContext.model.orderList[0].orderDetailHash = crypto.createHash('md5').update(result).digest('hex');
//
//            signVistaWriter(writebackContext, function(err, result) {
//                console.log("\nERR: " + JSON.stringify(err));
//                console.log("\nRESULT: " + JSON.stringify(result));
//                done();
//            });
//
//        });
//    });
//});

describe('Checks the sign order send functionality', function() {

    var writebackContext = {
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
            'location': '285',
            'eSig': 'REDACTED',
            'orderDialog': 'LR OTHER LAB TESTS',
            'displayGroup': '5',
            'quickOrderDialog': '2',
            'inputList': [{
                'inputKey': '4',
                'inputValue': '1191'
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
            'commentList': [{
                'comment': '~For Test: AMIKACIN'
            }, {
                'comment': '~Dose is expected to be at &UNKNOWN level.'
            }, {
                'comment': 'additional comment'
            }],
            'kind': 'Laboratory'
        },
        logger: sinon.stub(require('bunyan').createLogger({
            name: 'sign-vista-writer'
        }))
    };

    afterEach(function() {
        rpcClientFactory.closeRpcClient(writebackContext);
    });

    //This test will create a new lab order in Vista.  Uncomment to test locally
    //it('returns order ien(s) if the save sign order is successful', function (done) {
    //
    //    writebackContext.interceptorResults.patientIdentifiers.dfn = '100615';  //set missing DFN
    //    this.timeout(20000);
    //    vistaWriter.create(writebackContext, function (err, result) {
    //        expect(err).to.be.falsy();
    //        expect(writebackContext.vprResponse).to.be.truthy();
    //        var jsonObj = JSON.parse(writebackContext.vprResponse);
    //
    //        writebackContext.model.orderIdList = [];
    //        writebackContext.model.orderIdList.push(jsonObj.localId + ";1");
    //
    //        //sign new lab order
    //        signVistaWriter.signOrderSend(writebackContext, function(err, result){
    //            expect(err).to.be.falsy();
    //            expect(result).to.be.truthy();
    //            expect(result.length).to.be.equal(1);
    //            done();
    //        });
    //    });
    //});
});

describe('Checks the validate signature functionality', function() {

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
            'eSig': 'REDACTED'

        },
        logger: sinon.stub(require('bunyan').createLogger({
            name: 'sign-vista-writer'
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
        model: {
            'dfn': '100615',
            'provider': '10000000238',
            'location': '285',
            'eSig': 'REDACTED'

        },
        logger: sinon.stub(require('bunyan').createLogger({
            name: 'sign-vista-writer'
        }))
    };

    afterEach(function() {
        rpcClientFactory.closeRpcClient(writebackContext);
    });

    it('returns true if validate signature is sucessful', function(done) {
        this.timeout(5000);
        signVistaWriter.validateSignature(writebackContext, function(err, result) {
            expect(result).to.be.truthy();
            expect(err).to.be.falsy();
            done();
        });
    });

    it('returns false if validate signature is unsuccessful', function(done) {
        this.timeout(7000);
        signVistaWriter.validateSignature(writebackContext2, function(err, result) {
            expect(result).to.equal('0');
            done();
        });
    });
});

describe('Checks the order detail comparison functionality', function() {

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
            name: 'order-detail-comparator'
        }))
    };

    afterEach(function() {
        rpcClientFactory.closeRpcClient(detailWritebackContext);
    });

    it('tests that order detail matches given hash string', function(done) {
        var self = this;
        self.timeout(5000);

        //grab order detail
        detailVistaWriter.getDetail('12519;1', detailWritebackContext, function(err, result) {

            expect(err).to.be.falsy();
            expect(result).to.be.truthy();

            //compute order detail hash
            var hash = crypto.createHash('md5').update(result).digest('hex');

            self.timeout(5000);
            signVistaWriter.compareOrderDetails('12519;1', hash, detailWritebackContext, function(err, result) {
                expect(err).to.be.falsy();
                expect(result).to.be.truthy();

                done();
            });
        });
    });

    it('tests that order detail fails to match a given hash string', function(done) {
        var self = this;
        self.timeout(5000);
        signVistaWriter.compareOrderDetails('12519;1', 'thisisnotacorrecthashvalue', detailWritebackContext, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.falsy();

            done();
        });
    });
});

//describe('Checks the save order check functionality', function() {
//    //Tests save order check to session routine - Uncomment to test locally
//    var writebackContext = {
//        pid: '9E7A;100615',
//        vistaConfig: {
//            host: 'IP        ',
//            port: PORT,
//            accessCode: 'REDACTED',
//            verifyCode: 'REDACTED',
//            localIP: 'IP      ',
//            localAddress: 'localhost'
//        },
//        model: {
//            'dfn': '100615',
//            'provider': '10000000238',
//            'location': '285',
//            'overrideReason': 'foobar',
//            'orderCheckList': [
//                {
//                    "orderCheck": "38958;1^11^2^Duplicate order: HEMOGLOBIN A1C BLOOD   SP LB #18532 9/29/15 [UNCOLLECTED]^1"
//                },
//                {
//                    "orderCheck": "38958;1^24^2^Max lab test order freq exceeded for: HEMOGLOBIN A1C^1"
//                },
//                {
//                    "orderCheck": "38959;1^11^2^Duplicate order: GENTAMICIN BLOOD   SERUM SP 9/29/15 [UNCOLLECTED]^1"
//                }
//            ]
//        },
//        logger: sinon.stub(require('bunyan').createLogger({name: 'sign-vista-writer'}))
//    };
//
//    afterEach(function() {
//        rpcClientFactory.closeRpcClient(writebackContext);
//    });
//
//    it('returns true if the save order check is successful', function(done) {
//        this.timeout(5000);
//        signVistaWriter.saveOrderCheckForSession(writebackContext, function(err, result) {
//            expect(result).to.be.truthy();
//            expect(err).to.be.falsy();
//            done();
//        });
//    });
//});
