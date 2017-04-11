'use strict';

var rpcUtil = require('./rpc-config');
var siteHash = '9E7A';
var config = {
    rpcConfig: {
        context: 'HMP UI CONTEXT'
    },
    vistaSites: {
        '9E7A': {
            name: 'PANORAMA',
            division: '500',
            host: 'IP        ',
            port: 9210,
            production: false,
            accessCode: 'PW    ',
            verifyCode: 'PW    !!',
            localIP: '127.0.0.1',
            localAddress: 'localhost'
        },
        'C877': {
            name: 'KODAK',
            division: '500',
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
        expect(rpcUtil.getVistaRpcConfiguration(config, siteHash)).to.eql({
            context: 'HMP UI CONTEXT',
            name: 'PANORAMA',
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
