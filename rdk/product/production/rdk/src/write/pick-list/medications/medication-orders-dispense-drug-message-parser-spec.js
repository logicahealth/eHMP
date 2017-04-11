'use strict';

var log = sinon.stub(require('bunyan').createLogger({ name: 'medication-orders-dispense-drug-message-parser' }));
//var log = require('bunyan').createLogger({ name: 'medication-orders-dispense-drug-message-parser' }); //Uncomment this line (and comment above) to see output in IntelliJ console

var parse = require('./medication-orders-dispense-drug-message-parser').parse;

describe('unit test to validate medication-orders-dispense-drug-message-parser parse the RPC response correctly', function() {
    it('parse the RPC data correctly', function () {
        var result = parse(log, 'INTEN^\r\n');
        expect(result).to.eql({dispenseMsg: 'INTEN', quantityMsg: ''});
    });
});
