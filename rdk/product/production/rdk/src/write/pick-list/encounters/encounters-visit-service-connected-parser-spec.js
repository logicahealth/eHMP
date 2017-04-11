/*jslint node: true */
'use strict';


var log = sinon.stub(require('bunyan').createLogger({
    name: 'encounters-visit-service-connected-parser'
}));

var parseRpcData = require('./encounters-visit-service-connected-parser').parse;

function validate(result, expected) {
    expect(result).to.eql(
        {
            SC: expected[0],
            AO: expected[1],
            IR: expected[2],
            SAC: expected[3],
            MST: expected[4],
            HNC: expected[5],
            CV: expected[6],
            SHD: expected[7]
        });
}

describe('verify encounters-visit-service-connected-parser can', function() {
    it('parse undefined data', function () {
        expect(function() {parseRpcData(log, undefined);}).to.throw(Error);
    });

    it('parse corrupted data', function () {
        expect(function() {parseRpcData(log, {enabled:false,value:''});}).to.throw(Error);
    });

    it('parse SC (Service Connected)', function () {
        var result = parseRpcData(log, '1^;0^;0^;0^;0^;0^;0^;0^');
        validate(result, [{enabled:true,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''}]);
    });

    it('parse AO (Agent Orange)', function () {
        var result = parseRpcData(log, '0^;1^;0^;0^;0^;0^;0^;0^');
        validate(result, [{enabled:false,value:''},{enabled:true,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''}]);
    });

    it('parse IR (Ionizing Radiation)', function () {
        var result = parseRpcData(log, '0^;0^;1^;0^;0^;0^;0^;0^');
        validate(result, [{enabled:false,value:''},{enabled:false,value:''},{enabled:true,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''}]);
    });

    it('parse SAC (Southwest Asia Conditions)', function () {
        var result = parseRpcData(log, '0^;0^;0^;1^;0^;0^;0^;0^');
        validate(result, [{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:true,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''}]);
    });

    it('parse MST (Military Sexual Trauma)', function () {
        var result = parseRpcData(log, '0^;0^;0^;0^;1^;0^;0^;0^');
        validate(result, [{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:true,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''}]);
    });

    it('parse HNC (Head and Neck Cancer)', function () {
        var result = parseRpcData(log, '0^;0^;0^;0^;0^;1^;0^;0^');
        validate(result, [{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:true,value:''},{enabled:false,value:''},{enabled:false,value:''}]);
    });

    it('parse CV (Combat Veteran)', function () {
        var result = parseRpcData(log, '0^;0^;0^;0^;0^;0^;1^;0^');
        validate(result, [{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:true,value:''},{enabled:false,value:''}]);
    });

    it('parse SHD (Shipboard Hazard and Defense)', function () {
        var result = parseRpcData(log, '0^;0^;0^;0^;0^;0^;0^;1^');
        validate(result, [{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:true,value:''}]);
    });


    //Validate combinations of the above can all be parsed.
    it('parse SC, IR, MST, and CV', function () {
        var result = parseRpcData(log, '1^1;0^;1^;0^;1^0;0^;1^;0^');
        validate(result, [{enabled:true,value:'yes'},{enabled:false,value:''},{enabled:true,value:''},{enabled:false,value:''},{enabled:true,value:'no'},{enabled:false,value:''},{enabled:true,value:''},{enabled:false,value:''}]);
    });
    it('parse AO, SAC, HNC, and SHD', function () {
        var result = parseRpcData(log, '0^;1^1;0^;1^0;0^;1^0;0^;1^');
        validate(result, [{enabled:false,value:''},{enabled:true,value:'yes'},{enabled:false,value:''},{enabled:true,value:'no'},{enabled:false,value:''},{enabled:true,value:'no'},{enabled:false,value:''},{enabled:true,value:''}]);
    });
    it('parse SC, AO, CV, and SHD', function () {
        var result = parseRpcData(log, '1^1;1^0;0^;0^;0^;0^;1^1;1^1');
        validate(result, [{enabled:true,value:'yes'},{enabled:true,value:'no'},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:false,value:''},{enabled:true,value:'yes'},{enabled:true,value:'yes'}]);
    });
});
