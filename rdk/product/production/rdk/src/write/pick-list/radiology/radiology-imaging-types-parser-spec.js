/*global sinon, describe, it */
'use strict';

var parse = require('./radiology-imaging-types-parser').parse;

var log = sinon.stub(require('bunyan').createLogger({ name: 'radiology-imaging-types-parser' }));
//var log = require('bunyan').createLogger({ name: 'radiology-imaging-types-parser' }); //Uncomment this line (and comment above) to see output in IntelliJ console

describe('unit test to validate radiology-imaging-types', function() {
    it('can parse the RPC data correctly', function () {
    	/* jshint -W109 */
        var result = parse(log, '6^ANGIO/NEURO/INTERVENTIONAL^ANI^37' + '\r\n' +
                                '5^CT SCAN^CT^35' + '\r\n' +
                                '9^MAMMOGRAPHY^MAM^42' + '\r\n' +
                                '4^MAGNETIC RESONANCE IMAGING^MRI^36' + '\r\n' +
                                '2^NUCLEAR MEDICINE^NM^39' + '\r\n' +
                                '1^GENERAL RADIOLOGY^RAD^9' + '\r\n' +
                                '3^ULTRASOUND^US^40' + '\r\n');

        expect(result).to.eql([
            {
                "ien": "6",
                "typeOfImaging": "ANGIO/NEURO/INTERVENTIONAL",
                "abbreviation": "ANI",
                "ienDisplayGroup": "37"
            },
            {
                "ien": "5",
                "typeOfImaging": "CT SCAN",
                "abbreviation": "CT",
                "ienDisplayGroup": "35"
            },
            {
                "ien": "9",
                "typeOfImaging": "MAMMOGRAPHY",
                "abbreviation": "MAM",
                "ienDisplayGroup": "42"
            },
            {
                "ien": "4",
                "typeOfImaging": "MAGNETIC RESONANCE IMAGING",
                "abbreviation": "MRI",
                "ienDisplayGroup": "36"
            },
            {
                "ien": "2",
                "typeOfImaging": "NUCLEAR MEDICINE",
                "abbreviation": "NM",
                "ienDisplayGroup": "39"
            },
            {
                "ien": "1",
                "typeOfImaging": "GENERAL RADIOLOGY",
                "abbreviation": "RAD",
                "ienDisplayGroup": "9"
            },
            {
                "ien": "3",
                "typeOfImaging": "ULTRASOUND",
                "abbreviation": "US",
                "ienDisplayGroup": "40"
            }
        ]);
		/* jshint +W109 */
    });
});
