'use strict';

var rpcUtil = require('./rpc-config');
var siteHash = '9E7A';
var division = '500';
var user = {
    site: siteHash,
    division: division
};
var config = {
    rpcConfig: {
        context: 'HMP UI CONTEXT'
    },
    vistaSites: {
        '9E7A': {
            division: [{
                id: '500',
                name: 'PANORAMA'
            }],
            host: '10.2.2.101',
            port: 9210,
            production: false,
            accessCode: 'pu1234',
            verifyCode: 'pu1234!!',
            localIP: '127.0.0.1',
            localAddress: 'localhost'
        },
        'C877': {
            division: [{
                id: '500',
                name: 'KODAK'
            }],
            host: '10.2.2.102',
            port: 9210,
            production: false,
            accessCode: 'pu1234',
            verifyCode: 'pu1234!!',
            localIP: '127.0.0.1',
            localAddress: 'localhost'
        }
    }
};


describe('getVistaRpcConfig', function() {
    it('tests that getVistaRpcConfig() correctly builds the rpcConfiguration', function() {
        expect(rpcUtil.getVistaRpcConfiguration(config, user)).to.eql({
            context: 'HMP UI CONTEXT',
            division: '500',
            host: '10.2.2.101',
            port: 9210,
            production: false,
            accessCode: 'pu1234',
            verifyCode: 'pu1234!!',
            localIP: '127.0.0.1',
            localAddress: 'localhost'
        });
    });
});
