/*global sinon, describe, it */
'use strict';

var parse = require('./immunization-info-source-parser').parse;

var log = sinon.stub(require('bunyan').createLogger({ name: 'immunization-info-source-parser' }));
//var log = require('bunyan').createLogger({ name: 'immunization-info-source-parser' }); //Uncomment this line (and comment above) to see output in IntelliJ console

describe('unit test to validate immunization-info-source', function() {
    it('can parse the RPC data correctly', function () {
    	/* jshint -W109 */
        var result = parse(log, '9' + '\r\n' +
                                '7^Historical information -from birth certificate^06^1' + '\r\n' +
                                '3^Historical information -from other provider^02^1' + '\r\n' +
                                '6^Historical information -from other registry^05^1' + '\r\n' +
                                '5^Historical information -from parent\'s recall^04^1' + '\r\n' +
                                '4^Historical information -from parent\'s written record^03^1' + '\r\n' +
                                '9^Historical information -from public agency^08^1' + '\r\n' +
                                '8^Historical information -from school record^07^1' + '\r\n' +
                                '2^Historical information -source unspecified^01^1' + '\r\n' +
                                '1^New immunization record^00^1' + '\r\n');

        expect(result).to.eql([
            {
                "ien": "7",
                "name": "Historical information -from birth certificate",
                "hl7Code": "06",
                "status": "1"
            },
            {
                "ien": "3",
                "name": "Historical information -from other provider",
                "hl7Code": "02",
                "status": "1"
            },
            {
                "ien": "6",
                "name": "Historical information -from other registry",
                "hl7Code": "05",
                "status": "1"
            },
            {
                "ien": "5",
                "name": "Historical information -from parent's recall",
                "hl7Code": "04",
                "status": "1"
            },
            {
                "ien": "4",
                "name": "Historical information -from parent's written record",
                "hl7Code": "03",
                "status": "1"
            },
            {
                "ien": "9",
                "name": "Historical information -from public agency",
                "hl7Code": "08",
                "status": "1"
            },
            {
                "ien": "8",
                "name": "Historical information -from school record",
                "hl7Code": "07",
                "status": "1"
            },
            {
                "ien": "2",
                "name": "Historical information -source unspecified",
                "hl7Code": "01",
                "status": "1"
            },
            {
                "ien": "1",
                "name": "New immunization record",
                "hl7Code": "00",
                "status": "1"
            }
        ]);
		/* jshint +W109 */
    });
});
