'use strict';

var log = sinon.stub(require('bunyan').createLogger({
    name: 'lab-collect-times-parser'
}));

var parseRpcData = require('./lab-collect-times-parser').parse;

describe('verify lab collect times parser', function() {

    it('parse undefined data', function() {
        expect(function() {
            parseRpcData(log, undefined);
        }).to.throw(Error);
    });

    it('parse valid RPC data', function() {
        var result = parseRpcData(log, '1230,1300,1530,1545,1600,1730');
        expect(result).to.eql([
            '1230,1300,1530,1545,1600,1730'
        ]);
    });

    it('parse past date RPC data', function() {
        var result = parseRpcData(log, '1^Dates in the past are not allowed.');
        expect(result).to.eql([
            '1^Dates in the past are not allowed.'
        ]);
    });

});
