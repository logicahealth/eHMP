'use strict';

var log = sinon.stub(require('bunyan').createLogger({ name: 'medication-orders-quantity-for-days-supply-parser-object' }));
//var log = require('bunyan').createLogger({ name: 'medication-orders-quantity-for-days-supply-parser-object' }); //Uncomment this line (and comment above) to see output in IntelliJ console

var parse = require('./medication-orders-quantity-for-days-supply-parser-object').parse;

describe('unit test to validate medication-orders-quantity-for-days-supply-parser-object parse the RPC response correctly', function() {
    it('parse the RPC data correctly', function () {
        var result = parse(log, '2\r\n');
        expect(result).to.eql({quantityForDaysSupply: '2'});
    });
    it('parse EMPTY RPC data correctly', function () {
        var result = parse(log, '\r\n');
        expect(result).to.eql({quantityForDaysSupply: ''});
    });
});
