'use strict';

var httpMocks = require('node-mocks-http');
var writebackorder_signnote = require('./sign-orders-resource');
var RpcClient = require('vista-js').RpcClient;

var mock_session = {
    user: {
        username: 'PW',
        password: 'PW',
        duz: {
            '9E7A': '10000000257'
        },
        site: '9E7A'
    }
};

describe('writebackorder_signOrder:', function() {
    describe('function signOrder', function() {
        var req = {};
        var res, mockCallRpc;

        beforeEach(function() {
            req = {};
            res = httpMocks.createResponse();

            mockCallRpc = sinon.stub(RpcClient, 'callRpc', function(logger, rpcConfig, rpc, args, callback) {
                return callback(null, 'data');
            });
        });

        afterEach(function() {
            mockCallRpc.restore();
        });

        it('should call Vista RPCs', function(done) {
            var req = {
                param: function(param) {
                    return param;
                },
                body: {
                    param: {
                        signatureCode: '$+9-7i/ll ',
                        orders: {
                            38741: ''
                        },
                        locationIEN: 23,
                        patientIEN: 8
                    }
                },
                logger: sinon.stub(require('bunyan').createLogger({name: 'sign-order'})),
                app: {
                    config: {
                        rpcConfig: {
                            context: 'HMP UI CONTEXT',
                            siteHash: '9E7A'
                        },
                        vistaSites: {
                            '9E7A': {
                                name: 'PANORAMA',
                                division: '500',
                                host: 'IP_ADDRESS',
                                port: 9210,
                                production: false,
                                accessCode: 'PW',
                                verifyCode: 'PW'
                            },
                            'C877': {
                                name: 'KODAK',
                                division: '500',
                                host: 'IP_ADDRESS',
                                port: 9210,
                                production: false,
                                accessCode: 'PW',
                                verifyCode: 'PW'
                            }
                        }
                    }
                },
                session: mock_session
            };

            function tester(response) {
                expect(mockCallRpc.called).to.be.true();

                done();
            }
            res.rdkSend = tester;

            writebackorder_signnote._signOrder(req, res);

            // });
            // it('should verify the user is a Provider with: "TIU WHICH SIGNATURE ACTION"', function() {
            //     writebacknote_signnote._signNote(req, res);
            // expect(RpcClient.callRpc.calledWith(sinon.match.any, sinon.match.any, sinon.match('TIU WHICH SIGNATURE ACTION'))).to.be.true();
            // });
            // it('should verify the user is authorized with: "TIU AUTHORIZATION"', function() {
            //     writebacknote_signnote._signNote(req, res);
            // expect(RpcClient.callRpc.calledWith(sinon.match.any, sinon.match.any, sinon.match('TIU AUTHORIZATION'))).to.be.true();
            // });
            // it('should lock the note with: "TIU LOCK RECORD"', function() {
            //     writebacknote_signnote._signNote(req, res);
            // expect(RpcClient.callRpc.calledWith(sinon.match.any, sinon.match.any, sinon.match('TIU LOCK RECORD'))).to.be.true();
            // });
            // it('should verify the signatureCode with: "ORWU VALIDSIG"', function() {
            //     writebacknote_signnote._signNote(req, res);
            // expect(RpcClient.callRpc.calledWith(sinon.match.any, sinon.match.any, sinon.match('ORWU VALIDSIG'))).to.be.true();
        });

    });

});
