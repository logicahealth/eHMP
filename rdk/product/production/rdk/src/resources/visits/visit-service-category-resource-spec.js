'use strict';

var visit_serviceCategory = require('./visit-service-category-resource');
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

describe('visit_getServiceCategory', function() {
    describe('function getServiceCategory', function() {
        var req = {};
        // var res = {};

        beforeEach(function() {
            req = {};
            // res = {};
            sinon.stub(RpcClient, 'callRpc');


        });

        it('should call Vista RPCs', function() {
            var req = {
                query: {
                    'locationIEN': 5,
                    'patientStatus': 0
                },
                logger: {
                    info: function(log) {
                        return log;
                    },
                    debug: function(debug) {
                        return debug;
                    }
                },
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

            var res = {
                send: function(message, error) {
                    /*jshint unused: false*/
                    return;
                }
            };

            visit_serviceCategory._getvisitServiceCategory(req, res);
            expect(RpcClient.callRpc.called).to.be.true();
        });

    });

});
