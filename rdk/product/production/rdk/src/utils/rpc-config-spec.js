'use strict';

var rpcUtil = require('./rpc-config');
var siteHash = 'SITE';
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
        'SITE': {
            division: [{
                id: '500',
                name: 'PANORAMA'
            }],
            host: 'IP        ',
            port: PORT,
            production: false,
            accessCode: 'USER  ',
            verifyCode: 'PW      ',
            localIP: '127.0.0.1',
            localAddress: 'localhost'
        },
        'SITE': {
            division: [{
                id: '500',
                name: 'KODAK'
            }],
            host: 'IP        ',
            port: PORT,
            production: false,
            accessCode: 'USER  ',
            verifyCode: 'PW      ',
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
            host: 'IP        ',
            port: PORT,
            production: false,
            accessCode: 'USER  ',
            verifyCode: 'PW      ',
            localIP: '127.0.0.1',
            localAddress: 'localhost'
        });
    });
});
