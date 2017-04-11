'use strict';

var RpcClient = require('vista-js').RpcClient;
var futureLabCollects = require('./lab-future-lab-collects');

describe('getFutureLabCollects (multi-division)', function() {
    var rpcConfig;
    var rpcName;
    var logger = {
        info: function() {}
    };

    beforeEach(function() {
        sinon.stub(RpcClient, 'callRpc', function(logger, configuration, rpc, timestamp, callback) {
            rpcConfig = configuration;
            rpcName = rpc;
        });
    });

    it('calls callback with error if location parameter is missing', function() {
        var callbackSpy = sinon.spy();
        futureLabCollects.getFutureLabCollects(logger, {}, null, '507', callbackSpy);
        expect(callbackSpy.args[0]).not.to.be.undefined(); // first argument is the error message
    });

    it('calls callback with error if division parameter is missing', function() {
        var callbackSpy = sinon.spy();
        futureLabCollects.getFutureLabCollects(logger, {}, 'w14', undefined, callbackSpy);
        expect(callbackSpy.args[0]).not.to.be.undefined(); // first argument is the error message
    });

    it('calls RPC \'ORWDLR33 FUTURE LAB COLLECTS\'', function() {
        var callbackSpy = sinon.spy();
        futureLabCollects.getFutureLabCollects(logger, {}, 'w14', '507', callbackSpy);
        expect(rpcName).to.eql('ORWDLR33 FUTURE LAB COLLECTS');
    });

    it('sets RPC configuration with division parameter', function() {
        var callbackSpy = sinon.spy();
        futureLabCollects.getFutureLabCollects(logger, {}, 'w14', 'my-division', callbackSpy);
        expect(rpcConfig.division).to.eql('my-division');
    });
});
