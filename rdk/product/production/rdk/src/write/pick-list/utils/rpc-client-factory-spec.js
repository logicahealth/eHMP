'use strict';

var rpcClientFactory = require('./rpc-client-factory');

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'rpc-client-factory'
}));

describe('Verify RPC Client Factory', function() {
    it('returns the same created client', function() {
        var config = {
            host: 'IP        ',
            port: PORT,
            accessCode: 'USER  ',
            verifyCode: 'PW      ',
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

    it('returns the same created client in multidivision environment', function() {
        var config = {
            host: 'IP        ',
            port: PORT,
            accessCode: 'USER  ',
            verifyCode: 'PW      ',
            context: 'VPR UI CONTEXT',
            localIP: '127.0.0.1',
            localAddress: 'localhost',
            connectTimeout: 3000,
            sendTimeout: 10000,
            division: '500'
        };

        var initialRpcClient = rpcClientFactory.getClient(logger, config);
        var copyOfRpcClient = rpcClientFactory.getClient(logger, config);

        expect(initialRpcClient).to.be(copyOfRpcClient);
    });

    it('returns different clients for different configurations', function() {
        var configA = {
            host: 'IP        ',
            port: PORT,
            accessCode: 'USER  ',
            verifyCode: 'PW      ',
            context: 'HMP UI CONTEXT',
            localIP: '127.0.0.1',
            localAddress: 'localhost',
            connectTimeout: 3000,
            sendTimeout: 10000
        };

        var configB = {
            host: 'IP        ',
            port: PORT,
            accessCode: 'USER  ',
            verifyCode: 'PW      ',
            context: 'OR CPRS GUI CHART',
            localIP: '127.0.0.1',
            localAddress: 'localhost',
            connectTimeout: 3000,
            sendTimeout: 10000
        };

        var initialRpcClientA = rpcClientFactory.getClient(logger, configA);
        var copyOfRpcClientA = rpcClientFactory.getClient(logger, configA);

        var initialRpcClientB = rpcClientFactory.getClient(logger, configB);
        var copyOfRpcClientB = rpcClientFactory.getClient(logger, configB);

        expect(initialRpcClientA).not.to.be.eql(initialRpcClientB);
        expect(initialRpcClientA).to.be.eql(copyOfRpcClientA);
        expect(initialRpcClientB).to.be.eql(copyOfRpcClientB);
    });

    it('returns different clients for different division-specific configurations', function() {
        var configA = {
            host: 'IP        ',
            port: PORT,
            accessCode: 'USER  ',
            verifyCode: 'PW      ',
            context: 'HMP UI CONTEXT',
            localIP: '127.0.0.1',
            localAddress: 'localhost',
            connectTimeout: 3000,
            sendTimeout: 10000,
            divison: '500'
        };

        var configB = {
            host: 'IP        ',
            port: PORT,
            accessCode: 'USER  ',
            verifyCode: 'PW      ',
            context: 'HMP UI CONTEXT',
            localIP: '127.0.0.1',
            localAddress: 'localhost',
            connectTimeout: 3000,
            sendTimeout: 10000,
            division: '507'
        };

        var initialRpcClientA = rpcClientFactory.getClient(logger, configA);
        var copyOfRpcClientA = rpcClientFactory.getClient(logger, configA);

        var initialRpcClientB = rpcClientFactory.getClient(logger, configB);
        var copyOfRpcClientB = rpcClientFactory.getClient(logger, configB);

        expect(initialRpcClientA).not.to.be.eql(initialRpcClientB);
        expect(initialRpcClientA).to.be.eql(copyOfRpcClientA);
        expect(initialRpcClientB).to.be.eql(copyOfRpcClientB);
    });
});
