/*global sinon, describe, it */
'use strict';

var parse = require('./allergies-symptoms-top-ten-parser').parse;

var log = sinon.stub(require('bunyan').createLogger({ name: 'allergies-symptoms-top-ten-parser' }));
//var log = require('bunyan').createLogger({ name: 'allergies-symptoms-top-ten-parser' }); //Uncomment this line (and comment above) to see output in IntelliJ console

describe('unit test to validate allergies-symptoms-top-ten', function() {
	it('can parse the RPC data correctly', function () {
		/* jshint -W109 */
		var result = parse(log, '~Allergy Types' + '\r\n' +
                                'iD^Drug' + '\r\n' +
                                'iF^Food' + '\r\n' +
                                'iO^Other' + '\r\n' +
                                'iDF^Drug,Food' + '\r\n' +
                                'iDO^Drug,Other' + '\r\n' +
                                'iFO^Food,Other' + '\r\n' +
                                'iDFO^Drug,Food,Other' + '\r\n' +
                                '~Reactions' + '\r\n' +
                                'iD^Drug' + '\r\n' +
                                'iF^Food' + '\r\n' +
                                'iO^Other' + '\r\n' +
                                'iDF^Drug,Food' + '\r\n' +
                                'iDO^Drug,Other' + '\r\n' +
                                'iFO^Food,Other' + '\r\n' +
                                'iDFO^Drug,Food,Other' + '\r\n' +
                                '~Nature of Reaction' + '\r\n' +
                                'iA^Allergy' + '\r\n' +
                                'iP^Pharmacological' + '\r\n' +
                                'iU^Unknown' + '\r\n' +
                                '~Top Ten' + '\r\n' +
                                'i39^ANXIETY' + '\r\n' +
                                'i2^ITCHING,WATERING EYES' + '\r\n' +
                                'i6^ANOREXIA' + '\r\n' +
                                'i66^DROWSINESS' + '\r\n' +
                                'i8^NAUSEA,VOMITING' + '\r\n' +
                                'i9^DIARRHEA' + '\r\n' +
                                'i1^HIVES' + '\r\n' +
                                'i67^DRY MOUTH' + '\r\n' +
                                'i69^DRY NOSE' + '\r\n' +
                                'i133^RASH' + '\r\n' +
                                '~Observ/Hist' + '\r\n' +
                                'io^Observed' + '\r\n' +
                                'ih^Historical' + '\r\n' +
                                '~Severity' + '\r\n' +
                                'i3^Severe' + '\r\n' +
                                'i2^Moderate' + '\r\n' +
                                'i1^Mild' + '\r\n');

	expect(result).to.eql([
            {
                "categoryName": "Allergy Types",
                "values": [
                    {
                        "ien": "D",
                        "name": "Drug"
                    },
                    {
                        "ien": "F",
                        "name": "Food"
                    },
                    {
                        "ien": "O",
                        "name": "Other"
                    },
                    {
                        "ien": "DF",
                        "name": "Drug,Food"
                    },
                    {
                        "ien": "DO",
                        "name": "Drug,Other"
                    },
                    {
                        "ien": "FO",
                        "name": "Food,Other"
                    },
                    {
                        "ien": "DFO",
                        "name": "Drug,Food,Other"
                    }
                ]
            },
            {
                "categoryName": "Reactions",
                "values": [
                    {
                        "ien": "D",
                        "name": "Drug"
                    },
                    {
                        "ien": "F",
                        "name": "Food"
                    },
                    {
                        "ien": "O",
                        "name": "Other"
                    },
                    {
                        "ien": "DF",
                        "name": "Drug,Food"
                    },
                    {
                        "ien": "DO",
                        "name": "Drug,Other"
                    },
                    {
                        "ien": "FO",
                        "name": "Food,Other"
                    },
                    {
                        "ien": "DFO",
                        "name": "Drug,Food,Other"
                    }
                ]
            },
            {
                "categoryName": "Nature of Reaction",
                "values": [
                    {
                        "ien": "A",
                        "name": "Allergy"
                    },
                    {
                        "ien": "P",
                        "name": "Pharmacological"
                    },
                    {
                        "ien": "U",
                        "name": "Unknown"
                    }
                ]
            },
            {
                "categoryName": "Top Ten",
                "values": [
                    {
                        "ien": "39",
                        "name": "ANXIETY"
                    },
                    {
                        "ien": "2",
                        "name": "ITCHING,WATERING EYES"
                    },
                    {
                        "ien": "6",
                        "name": "ANOREXIA"
                    },
                    {
                        "ien": "66",
                        "name": "DROWSINESS"
                    },
                    {
                        "ien": "8",
                        "name": "NAUSEA,VOMITING"
                    },
                    {
                        "ien": "9",
                        "name": "DIARRHEA"
                    },
                    {
                        "ien": "1",
                        "name": "HIVES"
                    },
                    {
                        "ien": "67",
                        "name": "DRY MOUTH"
                    },
                    {
                        "ien": "69",
                        "name": "DRY NOSE"
                    },
                    {
                        "ien": "133",
                        "name": "RASH"
                    }
                ]
            },
            {
                "categoryName": "Observ/Hist",
                "values": [
                    {
                        "ien": "o",
                        "name": "Observed"
                    },
                    {
                        "ien": "h",
                        "name": "Historical"
                    }
                ]
            },
            {
                "categoryName": "Severity",
                "values": [
                    {
                        "ien": "3",
                        "name": "Severe"
                    },
                    {
                        "ien": "2",
                        "name": "Moderate"
                    },
                    {
                        "ien": "1",
                        "name": "Mild"
                    }
                ]
            }
        ]);
		/* jshint +W109 */
	});
});
