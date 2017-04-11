'use strict';

var log = sinon.stub(require('bunyan').createLogger({ name: 'medication-orders-default-days-parser' }));
//var log = require('bunyan').createLogger({ name: 'medication-orders-default-days-parser' }); //Uncomment this line (and comment above) to see output in IntelliJ console

var parse = require('./medication-orders-default-days-parser-object').parse;

describe('unit test to validate medication-orders-default-days parse the RPC response correctly', function() {
    it('parse the RPC data correctly', function () {
        var result = parse(log, '30\r\n');
        expect(result).to.eql({defaultDays: '30'});
    });
    it('parse EMPTY RPC data correctly', function () {
        var result = parse(log, '\r\n');
        expect(result).to.eql({defaultDays: ''});
    });
});
