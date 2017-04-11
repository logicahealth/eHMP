'use strict';

var log = sinon.stub(require('bunyan').createLogger({
    name: 'lab-future-lab-collects-parser'
}));

var parseRpcData = require('./lab-future-lab-collects-parser').parseFutureLabCollects;

describe('verify lab future lab collects parser', function() {

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

    it('parse valid RPC data', function() {
        var result = parseRpcData(log, '7');
        expect(result).to.eql(['7']);
    });

});
