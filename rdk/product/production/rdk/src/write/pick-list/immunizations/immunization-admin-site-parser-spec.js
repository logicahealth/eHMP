/*global sinon, describe, it */
'use strict';

var parse = require('./immunization-admin-site-parser').parse;

var log = sinon.stub(require('bunyan').createLogger({ name: 'immunization-admin-site-parser' }));
//var log = require('bunyan').createLogger({ name: 'immunization-admin-site-parser' }); //Uncomment this line (and comment above) to see output in IntelliJ console

describe('unit test to validate immunization-admin-site', function() {
    it('can parse the RPC data correctly', function () {
    	/* jshint -W109 */
        var result = parse(log, '12' + '\r\n' +
                                '2^LEFT DELTOID^LD^1' + '\r\n' +
                                '3^LEFT GLUTEOUS MEDIUS^LG^1' + '\r\n' +
                                '4^LEFT LOWER FOREARM^LLFA^1' + '\r\n' +
                                '5^LEFT THIGH^LT^1' + '\r\n' +
                                '1^LEFT UPPER ARM^LA^1' + '\r\n' +
                                '6^LEFT VASTUS LATERALIS^LVL^1' + '\r\n' +
                                '8^RIGHT DELTOID^RD^1' + '\r\n' +
                                '9^RIGHT GLUTEOUS MEDIUS^RG^1' + '\r\n' +
                                '10^RIGHT LOWER FOREARM^RLFA^1' + '\r\n' +
                                '11^RIGHT THIGH^RT^1' + '\r\n' +
                                '7^RIGHT UPPER ARM^RA^1' + '\r\n' +
                                '12^RIGHT VASTUS LATERALIS^RVL^1' + '\r\n');

        expect(result).to.eql([
            {
                "ien": "2",
                "name": "LEFT DELTOID",
                "hl7Code": "LD",
                "status": "1"
            },
            {
                "ien": "3",
                "name": "LEFT GLUTEOUS MEDIUS",
                "hl7Code": "LG",
                "status": "1"
            },
            {
                "ien": "4",
                "name": "LEFT LOWER FOREARM",
                "hl7Code": "LLFA",
                "status": "1"
            },
            {
                "ien": "5",
                "name": "LEFT THIGH",
                "hl7Code": "LT",
                "status": "1"
            },
            {
                "ien": "1",
                "name": "LEFT UPPER ARM",
                "hl7Code": "LA",
                "status": "1"
            },
            {
                "ien": "6",
                "name": "LEFT VASTUS LATERALIS",
                "hl7Code": "LVL",
                "status": "1"
            },
            {
                "ien": "8",
                "name": "RIGHT DELTOID",
                "hl7Code": "RD",
                "status": "1"
            },
            {
                "ien": "9",
                "name": "RIGHT GLUTEOUS MEDIUS",
                "hl7Code": "RG",
                "status": "1"
            },
            {
                "ien": "10",
                "name": "RIGHT LOWER FOREARM",
                "hl7Code": "RLFA",
                "status": "1"
            },
            {
                "ien": "11",
                "name": "RIGHT THIGH",
                "hl7Code": "RT",
                "status": "1"
            },
            {
                "ien": "7",
                "name": "RIGHT UPPER ARM",
                "hl7Code": "RA",
                "status": "1"
            },
            {
                "ien": "12",
                "name": "RIGHT VASTUS LATERALIS",
                "hl7Code": "RVL",
                "status": "1"
            }
        ]);
		/* jshint +W109 */
    });
});
