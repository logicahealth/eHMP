/*global sinon, describe, it */
'use strict';

var parse = require('./immunization-admin-route-parser').parse;

var log = sinon.stub(require('bunyan').createLogger({ name: 'immunization-admin-route-parser' }));
//var log = require('bunyan').createLogger({ name: 'immunization-admin-route-parser' }); //Uncomment this line (and comment above) to see output in IntelliJ console

describe('unit test to validate immunization-admin-route', function() {
    it('can parse the RPC data correctly', function () {
    	/* jshint -W109 */
        var result = parse(log, '9' + '\r\n' +
        '1^INTRADERMAL^ID^1' + '\r\n' +
        '2^INTRAMUSCULAR^IM^1' + '\r\n' +
        '3^INTRAVENOUS^IV^1' + '\r\n' +
        '4^NASAL^NS^1' + '\r\n' +
        '5^ORAL^PO^1' + '\r\n' +
        '9^OTHER/MISCELLANEOUS^OTH^1' + '\r\n' +
        '8^PERCUTANEOUS^^1' + '\r\n' +
        '6^SUBCUTANEOUS^SC^1' + '\r\n' +
        '7^TRANSDERMAL^TD^1' + '\r\n');

        expect(result).to.eql([
            {
                "ien": "1",
                "name": "INTRADERMAL",
                "hl7Code": "ID",
                "status": "1"
            },
            {
                "ien": "2",
                "name": "INTRAMUSCULAR",
                "hl7Code": "IM",
                "status": "1"
            },
            {
                "ien": "3",
                "name": "INTRAVENOUS",
                "hl7Code": "IV",
                "status": "1"
            },
            {
                "ien": "4",
                "name": "NASAL",
                "hl7Code": "NS",
                "status": "1"
            },
            {
                "ien": "5",
                "name": "ORAL",
                "hl7Code": "PO",
                "status": "1"
            },
            {
                "ien": "9",
                "name": "OTHER/MISCELLANEOUS",
                "hl7Code": "OTH",
                "status": "1"
            },
            {
                "ien": "8",
                "name": "PERCUTANEOUS",
                "hl7Code": "",
                "status": "1"
            },
            {
                "ien": "6",
                "name": "SUBCUTANEOUS",
                "hl7Code": "SC",
                "status": "1"
            },
            {
                "ien": "7",
                "name": "TRANSDERMAL",
                "hl7Code": "TD",
                "status": "1"
            }
        ]);
		/* jshint +W109 */
    });
});
