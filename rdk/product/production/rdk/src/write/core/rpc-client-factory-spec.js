'use strict';

var rpcClientFactory = require('./rpc-client-factory');
var RpcClient = require('vista-js').RpcClient;

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'rpc-client-factory'
}));

describe('Verify Write back RPC Client Factory', function() {
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

    var writebackContext, mockRpcClientCreate, mockRpcConnect, mockRpcClose;

    beforeEach(function() {
        writebackContext = {};
        writebackContext.vistaConfig = config;
        writebackContext.logger = logger;
        writebackContext.rpcClient = null;

        mockRpcClientCreate = sinon.stub(RpcClient, 'create', function(logger, config) {
            var rpcClient = new RpcClient(logger, config);

            mockRpcConnect = sinon.stub(rpcClient, 'connect', function(callback) {return callback();});
            mockRpcClose = sinon.stub(rpcClient, 'close', function() {});

            return rpcClient;
        });
    });

    afterEach(function() {
        mockRpcClientCreate.restore();
    });

    it('returns the same created client', function(done) {

        rpcClientFactory.getRpcClient(writebackContext, null, function(err, rpcClient) {
            var initialRpcClient = rpcClient;

            rpcClientFactory.getRpcClient(writebackContext, null, function(err, rpcClient) {
                expect(initialRpcClient).to.be(rpcClient);
            });
        });

        expect(mockRpcConnect.called).to.be.true();

        done();
    });

    it('RPC client connection is closed', function(done) {
        rpcClientFactory.getRpcClient(writebackContext, null, function(err, rpcClient) {
            rpcClientFactory.closeRpcClient(writebackContext);
        });

        expect(mockRpcClose.called).to.be.true();
        expect(writebackContext.rpcClient).to.be.null();

        done();
    });
});

