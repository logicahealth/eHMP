/*global sinon, describe, it */
'use strict';

var parse = require('./radiology-dialog-default-parser').parse;

var log = sinon.stub(require('bunyan').createLogger({ name: 'radiology-dialog-default-parser' }));
//var log = require('bunyan').createLogger({ name: 'radiology-dialog-default-parser' }); //Uncomment this line (and comment above) to see output in IntelliJ console

describe('unit test to validate radiology-dialog-default', function() {
	it('can parse the RPC data correctly', function () {
		/* jshint -W109 */
		var result = parse(log, '~ShortList' + '\r\n' +
                                '~Common Procedures' + '\r\n' +
                                'i2772^CT ABDOMEN W&W/O CONT^^y' + '\r\n' +
                                'i2771^CT ABDOMEN W/CONT^^n' + '\r\n' +
                                'i2770^CT ABDOMEN W/O CONT^^n' + '\r\n' +
                                'i2689^CT CERVICAL SPINE W/CONT^^' + '\r\n' +
                                'i2688^CT CERVICAL SPINE W/O CONT^^n' + '\r\n' +
                                'i3040^CT FOR PLACEMENT OF RX FIELDS^^' + '\r\n' +
                                'i3039^CT GUIDANCE FOR CYST ASPIRATION CP^^n' + '\r\n' +
                                'i3038^CT GUIDANCE FOR CYST ASPIRATION S&I^^' + '\r\n' +
                                'i3037^CT GUIDANCE FOR NEEDLE BIOPSY CP^^' + '\r\n' +
                                'i3036^CT GUIDANCE FOR NEEDLE BIOPSY S&I^^' + '\r\n' +
                                'i2640^CT HEAD W&WO CONT^^' + '\r\n' +
                                'i2639^CT HEAD W/IV CONT^^n' + '\r\n' +
                                'i2638^CT HEAD W/O CONT^^' + '\r\n' +
                                'i2765^CT LOWER EXTREMITY W&W/O CONT^^' + '\r\n' +
                                'i2764^CT LOWER EXTREMITY W/CONT^^' + '\r\n' +
                                'i2763^CT LOWER EXTREMITY W/O CONT^^' + '\r\n' +
                                'i2693^CT LUMBAR SPINE W/CONT^^' + '\r\n' +
                                'i2692^CT LUMBAR SPINE W/O CONT^^' + '\r\n' +
                                'i2646^CT MAXILLOFACIAL W&W/O CONT^^' + '\r\n' +
                                'i2645^CT MAXILLOFACIAL W/CONT^^' + '\r\n' +
                                '~Modifiers' + '\r\n' +
                                '~Urgencies' + '\r\n' +
                                'i2^ASAP' + '\r\n' +
                                'i9^ROUTINE' + '\r\n' +
                                'i1^STAT' + '\r\n' +
                                'd9^ROUTINE' + '\r\n' +
                                '~Transport' + '\r\n' +
                                'iA^AMBULATORY' + '\r\n' +
                                'iP^PORTABLE' + '\r\n' +
                                'iS^STRETCHER' + '\r\n' +
                                'iW^WHEELCHAIR' + '\r\n' +
                                '~Category' + '\r\n' +
                                'iI^INPATIENT' + '\r\n' +
                                'iO^OUTPATIENT' + '\r\n' +
                                'iE^EMPLOYEE' + '\r\n' +
                                'iC^CONTRACT' + '\r\n' +
                                'iS^SHARING' + '\r\n' +
                                'iR^RESEARCH' + '\r\n' +
                                '~Submit to' + '\r\n' +
                                'i12^CT SCAN^500^CAMP MASTER' + '\r\n' +
                                'i21^SHERI\'S LOCATION^500^CAMP MASTER' + '\r\n' +
                                'd12^CT SCAN' + '\r\n' +
                                '~Ask Submit' + '\r\n' +
                                'd1^YES' + '\r\n' +
                                '~Last 7 Days' + '\r\n' +
                                'i6849096.8557-1^CT ABDOMEN W/CONT^59^Verified^232^CT SCAN^I' + '\r\n' +
                                'i6849096.8685-1^CHEST SINGLE VIEW^55^Verified^40^RADIOLOGY MAIN FLOOR^' + '\r\n');

	expect(result).to.eql([
            {
                "categoryName": "ShortList"
            },
            {
                "categoryName": "Common Procedures",
                "values": [
                    {
                        "ien": "2772",
                        "name": "CT ABDOMEN W&W/O CONT",
                        "requiresRadiologistApproval": true
                    },
                    {
                        "ien": "2771",
                        "name": "CT ABDOMEN W/CONT",
                        "requiresRadiologistApproval": false
                    },
                    {
                        "ien": "2770",
                        "name": "CT ABDOMEN W/O CONT",
                        "requiresRadiologistApproval": false
                    },
                    {
                        "ien": "2689",
                        "name": "CT CERVICAL SPINE W/CONT"
                    },
                    {
                        "ien": "2688",
                        "name": "CT CERVICAL SPINE W/O CONT",
                        "requiresRadiologistApproval": false
                    },
                    {
                        "ien": "3040",
                        "name": "CT FOR PLACEMENT OF RX FIELDS"
                    },
                    {
                        "ien": "3039",
                        "name": "CT GUIDANCE FOR CYST ASPIRATION CP",
                        "requiresRadiologistApproval": false
                    },
                    {
                        "ien": "3038",
                        "name": "CT GUIDANCE FOR CYST ASPIRATION S&I"
                    },
                    {
                        "ien": "3037",
                        "name": "CT GUIDANCE FOR NEEDLE BIOPSY CP"
                    },
                    {
                        "ien": "3036",
                        "name": "CT GUIDANCE FOR NEEDLE BIOPSY S&I"
                    },
                    {
                        "ien": "2640",
                        "name": "CT HEAD W&WO CONT"
                    },
                    {
                        "ien": "2639",
                        "name": "CT HEAD W/IV CONT",
                        "requiresRadiologistApproval": false
                    },
                    {
                        "ien": "2638",
                        "name": "CT HEAD W/O CONT"
                    },
                    {
                        "ien": "2765",
                        "name": "CT LOWER EXTREMITY W&W/O CONT"
                    },
                    {
                        "ien": "2764",
                        "name": "CT LOWER EXTREMITY W/CONT"
                    },
                    {
                        "ien": "2763",
                        "name": "CT LOWER EXTREMITY W/O CONT"
                    },
                    {
                        "ien": "2693",
                        "name": "CT LUMBAR SPINE W/CONT"
                    },
                    {
                        "ien": "2692",
                        "name": "CT LUMBAR SPINE W/O CONT"
                    },
                    {
                        "ien": "2646",
                        "name": "CT MAXILLOFACIAL W&W/O CONT"
                    },
                    {
                        "ien": "2645",
                        "name": "CT MAXILLOFACIAL W/CONT"
                    }
                ]
            },
            {
                "categoryName": "Modifiers"
            },
            {
                "categoryName": "Urgencies",
                "values": [
                    {
                        "ien": "2",
                        "name": "ASAP"
                    },
                    {
                        "ien": "9",
                        "name": "ROUTINE"
                    },
                    {
                        "ien": "1",
                        "name": "STAT"
                    }
                ],
                "default": {
                    "ien": "9",
                    "name": "ROUTINE"
                }
            },
            {
                "categoryName": "Transport",
                "values": [
                    {
                        "ien": "A",
                        "name": "AMBULATORY"
                    },
                    {
                        "ien": "P",
                        "name": "PORTABLE"
                    },
                    {
                        "ien": "S",
                        "name": "STRETCHER"
                    },
                    {
                        "ien": "W",
                        "name": "WHEELCHAIR"
                    }
                ]
            },
            {
                "categoryName": "Category",
                "values": [
                    {
                        "ien": "I",
                        "name": "INPATIENT"
                    },
                    {
                        "ien": "O",
                        "name": "OUTPATIENT"
                    },
                    {
                        "ien": "E",
                        "name": "EMPLOYEE"
                    },
                    {
                        "ien": "C",
                        "name": "CONTRACT"
                    },
                    {
                        "ien": "S",
                        "name": "SHARING"
                    },
                    {
                        "ien": "R",
                        "name": "RESEARCH"
                    }
                ]
            },
            {
                "categoryName": "Submit to",
                "values": [
                    {
                        "ien": "12",
                        "name": "CT SCAN",
                        "imagingLocation": "500",
                        "institutionFile": "CAMP MASTER"
                    },
                    {
                        "ien": "21",
                        "name": "SHERI'S LOCATION",
                        "imagingLocation": "500",
                        "institutionFile": "CAMP MASTER"
                    }
                ],
                "default": {
                    "ien": "12",
                    "name": "CT SCAN"
                }
            },
            {
                "categoryName": "Ask Submit",
                "default": {
                    "ien": "1",
                    "name": "YES"
                }
            },
            {
                "categoryName": "Last 7 Days",
                "values": [
                    {
                        "ien": "6849096.8557-1",
                        "procedureName": "CT ABDOMEN W/CONT",
                        "caseNumber": "59",
                        "reportStatus": "Verified",
                        "imagingLocationIEN": "232",
                        "imagingLocationName": "CT SCAN",
                        "contrastMedium": "I",
                        "constrastInvolvement": "Iodinated ionic"
                    },
                    {
                        "ien": "6849096.8685-1",
                        "procedureName": "CHEST SINGLE VIEW",
                        "caseNumber": "55",
                        "reportStatus": "Verified",
                        "imagingLocationIEN": "40",
                        "imagingLocationName": "RADIOLOGY MAIN FLOOR",
                        "contrastMedium": ""
                    }
                ]
            }
        ]);
		/* jshint +W109 */
	});
});
