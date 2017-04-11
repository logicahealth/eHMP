'use strict';

var log = sinon.stub(require('bunyan').createLogger({ name: 'medication-orders-calc-max-refills-parser' }));
//var log = require('bunyan').createLogger({ name: 'medication-orders-calc-max-refills-parser' }); //Uncomment this line (and comment above) to see output in IntelliJ console

var parse = require('./medication-orders-calc-max-refills-parser-object').parse;

describe('unit test to validate medication-orders-calc-max-refills-parser parse the RPC response correctly', function() {
    it('parse the RPC data correctly', function () {
        var result = parse(log, '2\r\n');
        expect(result).to.eql({maxRefills: '2'});
    });
    it('parse EMPTY RPC data correctly', function () {
        var result = parse(log, '\r\n');
        expect(result).to.eql({maxRefills: ''});
    });
});
