'use strict';

var RpcClient = require('vista-js').RpcClient;
var orderDetail = require('./order-detail-resource');

describe('Order Detail Resource', function() {
    it('tests that getResourceConfig() is setup correctly for orderDetail', function() {
        var resources = orderDetail.getResourceConfig();
        expect(resources[0].name).to.equal('order-detail');
        expect(resources[0].path).to.equal('/detail/:uid');
        expect(resources[0].subsystems).not.to.be.undefined();
        expect(resources[0].get).not.to.be.undefined();
    });
});

describe('Order Detail', function() {

    beforeEach(function() {
        sinon.stub(RpcClient, 'callRpc');
    });

    var req = {
        interceptorResults: {
            patientIdentifiers: {
                dfn: 3,
                site: 'SITE'
            }
        },
        session: {
             user: {
                username: 'PW         ',
                password: 'PW      ',
                site: 'SITE'
            }
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
                    context: 'ORQOR DETAIL',
                    siteHash: 'SITE'
                },
                vistaSites: {
                    'SITE': {
                        name: 'PANORAMA',
                        division: [{'id':'500','name':'PANORAMA'}],
                        host: 'IP        ',
                        port: PORT,
                        production: false,
                        accessCode: 'USER  ',
                        verifyCode: 'PW      '
                    },
                    'SITE': {
                        name: 'KODAK',
                        division: [{'id':'507','name':'KODAK'},{'id':'613','name':'MARTINSBURG'},{'id':'688','name':'WASHINGTON'}],
                        host: 'IP        ',
                        port: PORT,
                        production: false,
                        accessCode: 'USER  ',
                        verifyCode: 'PW      '
                    }
                }
            }
        }
    };

    var res = {
        rdkSend: function(message, error) {
            return;
        }
    };

    it('tests getOrderDetail() for a connected site called successfully', function() {
        req.params = {
            uid:'urn:va:order:SITE:3:12727'
        };
        orderDetail.getOrderDetail(req, res);
        expect(RpcClient.callRpc.called).to.be.true();
    });

    it('tests getOrderDetail() for a non-connected site called successfully', function() {
        res.rdkSend = function(body) {
            expect(body.data).to.be('Details for order #7890 are not available from the remote location at this time.');
        };
        req.params = {
            uid: 'urn:va:order:DOD:123456:7890'
        };
        orderDetail.getOrderDetail(req, res);
        expect(RpcClient.callRpc.called).to.be.false();
    });
});
