'use strict';

var log = sinon.stub(require('bunyan').createLogger({
    name: 'lab-valid-immediate-collect-time-parser'
}));

var parseRpcData = require('./lab-valid-immediate-collect-time-parser').parseValidImmediateCollectTime;

describe('verify lab valid immediate collect time parser', function() {

    it('parse undefined data', function() {
        expect(function() {
            parseRpcData(log, undefined);
        }).to.throw(Error);
    });

    it('parse data with with blank fields', function() {
        expect(function() {
            parseRpcData(log, '');
        }).to.throw(Error);
    });

    it('parse data with with 1 field', function() {
        expect(function() {
            parseRpcData(log, '3150702.1940');
        }).to.throw(Error);
    });

    it('parse valid RPC data', function() {
        var result = parseRpcData(log, '0^MUST BE 5 MINUTES IN THE FUTURE');
        expect(result).to.eql([{
            'isValid': '0',
            'validationMessage': 'MUST BE 5 MINUTES IN THE FUTURE'
        }]);
    });

});
