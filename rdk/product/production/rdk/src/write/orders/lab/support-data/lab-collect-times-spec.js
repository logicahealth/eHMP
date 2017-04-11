'use strict';

var RpcClient = require('vista-js').RpcClient;
var labCollectTimes = require('./lab-collect-times');

describe('lab collect times (multi-division)', function() {
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

    it('calls callback with error if dateSelected parameter is missing', function() {
        var callbackSpy = sinon.spy();
        labCollectTimes.getLabCollectTimes(logger, {}, null, 'my-location', '507', callbackSpy);
        expect(callbackSpy.args[0]).not.to.be.undefined(); // first argument is the error message
    });

    it('calls callback with error if location parameter is missing', function() {
        var callbackSpy = sinon.spy();
        labCollectTimes.getLabCollectTimes(logger, {}, '20160101123055', null, '507', callbackSpy);
        expect(callbackSpy.args[0]).not.to.be.undefined(); // first argument is the error message
    });

    it('calls callback with error if division parameter is missing', function() {
        var callbackSpy = sinon.spy();
        labCollectTimes.getLabCollectTimes(logger, {}, '20160101123055', 'my-location', null, callbackSpy);
        expect(callbackSpy.args[0]).not.to.be.undefined(); // first argument is the error message
    });

    it('calls RPC \'ORWDLR32 GET LAB TIMES\'', function() {
        var callbackSpy = sinon.spy();
        labCollectTimes.getLabCollectTimes(logger, {}, '20160101123055', 'my-location', '507', callbackSpy);
        expect(rpcName).to.eql('ORWDLR32 GET LAB TIMES');
    });

    it('sets RPC configuration with division parameter', function() {
        var callbackSpy = sinon.spy();
        labCollectTimes.getLabCollectTimes(logger, {}, '20160101123055', 'my-location', '507', callbackSpy);
        expect(rpcConfig.division).to.eql('507');
    });
});
