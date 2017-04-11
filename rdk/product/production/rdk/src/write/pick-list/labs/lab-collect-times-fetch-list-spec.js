'use strict';

var rpcUtil = require('./../utils/rpc-util');
var labCollectTimes = require('./lab-collect-times-fetch-list');

describe('verify lab order dialog def (multi-division)', function() {
    var rpcConfig;
    var rpcName;

    beforeEach(function() {
        sinon.stub(rpcUtil, 'standardRPCCall', function(logger, configuration, rpc, loc, parse, callback) {
            rpcConfig = configuration;
            rpcName = rpc;
        });
    });

    it('sets RPC configuration with division parameter', function() {
        labCollectTimes.fetch(null, {}, null, {
            location: 'location:foo',
            division: 'my-division'
        });
        expect(rpcConfig.division).to.eql('my-division');
    });

    it('does not set RPC division configuration if missing division', function() {
        var callbackSpy = sinon.spy();
        labCollectTimes.fetch(null, {}, callbackSpy, {});
        expect(callbackSpy.called);
        expect(callbackSpy.args[0]).to.be.undefined();
    });

    it('calls RPC \'ORWDLR32 IMMED COLLECT\'', function() {
        labCollectTimes.fetch(null, {}, null, {
            location: 'location:foo',
            division: 'my-division'
        });
        expect(rpcName).to.eql('ORWDLR32 IMMED COLLECT');
    });
});
