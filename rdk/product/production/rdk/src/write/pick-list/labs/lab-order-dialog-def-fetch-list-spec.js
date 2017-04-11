'use strict';

var rpcUtil = require('./../utils/rpc-util');
var labOrderDialogDef = require('./lab-order-dialog-def-fetch-list');

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
        labOrderDialogDef.fetch(null, {}, null, {
            location: 'location:foo',
            division: 'my-division'
        });
        expect(rpcConfig.division).to.eql('my-division');
    });

    it('calls callback with error if missing location', function() {
        var callbackSpy = sinon.spy();
        labOrderDialogDef.fetch(null, {}, callbackSpy, {
            division: 'my-division'
        });
        expect(callbackSpy.called);
        expect(callbackSpy.args[0]).not.to.be.undefined();
    });

    it('calls RPC \'ORWDLR32 DEF\'', function() {
        labOrderDialogDef.fetch(null, {}, null, {
            location: 'location:foo',
            division: 'my-division'
        });
        expect(rpcName).to.eql('ORWDLR32 DEF');
    });
});
