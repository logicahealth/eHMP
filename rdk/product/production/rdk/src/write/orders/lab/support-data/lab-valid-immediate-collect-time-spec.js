'use strict';

var RpcClient = require('vista-js').RpcClient;
var validator = require('./lab-valid-immediate-collect-time');

describe('verify lab order dialog def (multi-division)', function() {
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

    it('calls callback with error if timestamp parameter is missing', function() {
        var callbackSpy = sinon.spy();
        validator.isValidImmediateCollectTime(logger, {}, null, '507', callbackSpy);
        expect(callbackSpy.args[0]).not.to.be.undefined(); // first argument is the error message
    });

    it('calls callback with error if division parameter is missing', function() {
        var callbackSpy = sinon.spy();
        validator.isValidImmediateCollectTime(logger, {}, '20161025180100', undefined, callbackSpy);
        expect(callbackSpy.args[0]).not.to.be.undefined(); // first argument is the error message
    });

    it('calls RPC \'ORWDLR32 IC VALID\'', function() {
        var callbackSpy = sinon.spy();
        validator.isValidImmediateCollectTime(logger, {}, '20161025180100', '507', callbackSpy);
        expect(rpcName).to.eql('ORWDLR32 IC VALID');
    });

    it('sets RPC configuration with division parameter', function() {
        var callbackSpy = sinon.spy();
        validator.isValidImmediateCollectTime(logger, {}, '20161025180100', 'my-division', callbackSpy);
        expect(rpcConfig.division).to.eql('my-division');
    });
});
