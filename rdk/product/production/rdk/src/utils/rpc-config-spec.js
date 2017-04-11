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
            host: 'IP        ',
            port: 9210,
            production: false,
            accessCode: 'PW    ',
            verifyCode: 'PW    !!',
            localIP: '127.0.0.1',
            localAddress: 'localhost'
        },
        'C877': {
            division: [{
                id: '500',
                name: 'KODAK'
            }],
            host: 'IP        ',
            port: 9210,
            production: false,
            accessCode: 'PW    ',
            verifyCode: 'PW    !!',
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
            port: 9210,
            production: false,
            accessCode: 'PW    ',
            verifyCode: 'PW    !!',
            localIP: '127.0.0.1',
            localAddress: 'localhost'
        });
    });
});
