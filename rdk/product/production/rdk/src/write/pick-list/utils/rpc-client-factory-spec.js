'use strict';

var rpcClientFactory = require('./rpc-client-factory');

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'rpc-client-factory'
}));

describe('Verify RPC Client Factory', function() {
    it('returns the same created client', function() {
        var config = {
            host: 'IP        ',
            port: 9210,
            accessCode: 'PW    ',
            verifyCode: 'PW    !!',
            context: 'VPR UI CONTEXT',
            localIP: '127.0.0.1',
            localAddress: 'localhost',
            connectTimeout: 3000,
            sendTimeout: 10000
        };

        var initialRpcClient = rpcClientFactory.getClient(logger, config);
        var copyOfRpcClient = rpcClientFactory.getClient(logger, config);

        expect(initialRpcClient).to.be(copyOfRpcClient);
    });
});
