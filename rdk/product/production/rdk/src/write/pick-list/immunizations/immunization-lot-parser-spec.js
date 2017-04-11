/*global sinon, describe, it */
'use strict';

var parse = require('./immunization-lot-parser').parse;

var log = sinon.stub(require('bunyan').createLogger({ name: 'immunization-lot-parser' }));
//var log = require('bunyan').createLogger({ name: 'immunization-lot-parser' }); //Uncomment this line (and comment above) to see output in IntelliJ console

describe('unit test to validate immunization-lot', function() {
    it('can parse the RPC data correctly', function () {
    	/* jshint -W109 */
        var result = parse(log, 'RECORD^1 OF 20' + '\r\n' +
        'LOT NUMBER^A0430EE' + '\r\n' +
        'MANUFACTURER^CSL BEHRING, INC' + '\r\n' +
        'STATUS^ACTIVE' + '\r\n' +
        'VACCINE^INFLUENZA, SEASONAL, INJECTABLE, PRESERVATIVE FREE' + '\r\n' +
        'EXPIRATION DATE^' + '\r\n' +
        'DOSES UNUSED^300' + '\r\n' +
        'LOW SUPPLY ALERT^' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n' +

        'RECORD^2 OF 20' + '\r\n' +
        'LOT NUMBER^EHMP0001' + '\r\n' +
        'MANUFACTURER^ABBOTT LABORATORIES' + '\r\n' +
        'STATUS^ACTIVE' + '\r\n' +
        'VACCINE^INFLUENZA, HIGH DOSE SEASONAL' + '\r\n' +
        'EXPIRATION DATE^DEC 01, 2015' + '\r\n' +
        'DOSES UNUSED^200' + '\r\n' +
        'LOW SUPPLY ALERT^10' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n' +

        'RECORD^3 OF 20' + '\r\n' +
        'LOT NUMBER^EHMP00010EXP' + '\r\n' +
        'MANUFACTURER^BIOTEST PHARMACEUTICALS CORPORATION' + '\r\n' +
        'STATUS^EXPIRED' + '\r\n' +
        'VACCINE^MMR' + '\r\n' +
        'EXPIRATION DATE^JAN 21, 2015' + '\r\n' +
        'DOSES UNUSED^100' + '\r\n' +
        'LOW SUPPLY ALERT^' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n' +

        'RECORD^4 OF 20' + '\r\n' +
        'LOT NUMBER^EHMP00011' + '\r\n' +
        'MANUFACTURER^CRUCELL' + '\r\n' +
        'STATUS^ACTIVE' + '\r\n' +
        'VACCINE^PNEUMOCOCCAL POLYSACCHARIDE PPV23' + '\r\n' +
        'EXPIRATION DATE^DEC 31, 2016' + '\r\n' +
        'DOSES UNUSED^500' + '\r\n' +
        'LOW SUPPLY ALERT^' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n' +

        'RECORD^5 OF 20' + '\r\n' +
        'LOT NUMBER^EHMP00012' + '\r\n' +
        'MANUFACTURER^CSL BEHRING, INC' + '\r\n' +
        'STATUS^ACTIVE' + '\r\n' +
        'VACCINE^PNEUMOCOCCAL CONJUGATE PCV 13' + '\r\n' +
        'EXPIRATION DATE^DEC 31, 2016' + '\r\n' +
        'DOSES UNUSED^1000' + '\r\n' +
        'LOW SUPPLY ALERT^' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n' +

        'RECORD^6 OF 20' + '\r\n' +
        'LOT NUMBER^EHMP00013' + '\r\n' +
        'MANUFACTURER^CSL BEHRING, INC' + '\r\n' +
        'STATUS^ACTIVE' + '\r\n' +
        'VACCINE^DTAP, 5 PERTUSSIS ANTIGENS' + '\r\n' +
        'EXPIRATION DATE^DEC 31, 2016' + '\r\n' +
        'DOSES UNUSED^1000' + '\r\n' +
        'LOW SUPPLY ALERT^' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n' +

        'RECORD^7 OF 20' + '\r\n' +
        'LOT NUMBER^EHMP0002' + '\r\n' +
        'MANUFACTURER^ABBOTT LABORATORIES' + '\r\n' +
        'STATUS^ACTIVE' + '\r\n' +
        'VACCINE^INFLUENZA, LIVE, INTRANASAL' + '\r\n' +
        'EXPIRATION DATE^DEC 31, 2015' + '\r\n' +
        'DOSES UNUSED^300' + '\r\n' +
        'LOW SUPPLY ALERT^0' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n' +

        'RECORD^8 OF 20' + '\r\n' +
        'LOT NUMBER^EHMP0003' + '\r\n' +
        'MANUFACTURER^ABBOTT LABORATORIES' + '\r\n' +
        'STATUS^ACTIVE' + '\r\n' +
        'VACCINE^INFLUENZA, LIVE, INTRANASAL' + '\r\n' +
        'EXPIRATION DATE^DEC 31, 2015' + '\r\n' +
        'DOSES UNUSED^200' + '\r\n' +
        'LOW SUPPLY ALERT^0' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n' +

        'RECORD^9 OF 20' + '\r\n' +
        'LOT NUMBER^EHMP0004' + '\r\n' +
        'MANUFACTURER^ADAMS LABORATORIES, INC.' + '\r\n' +
        'STATUS^ACTIVE' + '\r\n' +
        'VACCINE^INFLUENZA, INJECTABLE, QUADRIVALENT, PRESERVATIVE FREE' + '\r\n' +
        'EXPIRATION DATE^DEC 31, 2015' + '\r\n' +
        'DOSES UNUSED^300' + '\r\n' +
        'LOW SUPPLY ALERT^0' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n' +

        'RECORD^10 OF 20' + '\r\n' +
        'LOT NUMBER^EHMP0005' + '\r\n' +
        'MANUFACTURER^AKORN, INC' + '\r\n' +
        'STATUS^ACTIVE' + '\r\n' +
        'VACCINE^INFLUENZA, SEASONAL, INTRADERMAL, PRESERVATIVE FREE' + '\r\n' +
        'EXPIRATION DATE^DEC 31, 2015' + '\r\n' +
        'DOSES UNUSED^400' + '\r\n' +
        'LOW SUPPLY ALERT^0' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n' +

        'RECORD^11 OF 20' + '\r\n' +
        'LOT NUMBER^EHMP0006' + '\r\n' +
        'MANUFACTURER^ALPHA THERAPEUTIC CORPORATION' + '\r\n' +
        'STATUS^ACTIVE' + '\r\n' +
        'VACCINE^HEP A-HEP B' + '\r\n' +
        'EXPIRATION DATE^DEC 31, 2015' + '\r\n' +
        'DOSES UNUSED^500' + '\r\n' +
        'LOW SUPPLY ALERT^0' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n' +

        'RECORD^12 OF 20' + '\r\n' +
        'LOT NUMBER^EHMP0007' + '\r\n' +
        'MANUFACTURER^BARR LABORATORIES' + '\r\n' +
        'STATUS^ACTIVE' + '\r\n' +
        'VACCINE^HEP B, ADULT' + '\r\n' +
        'EXPIRATION DATE^DEC 31, 2015' + '\r\n' +
        'DOSES UNUSED^500' + '\r\n' +
        'LOW SUPPLY ALERT^0' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n' +
        'RECORD^13 OF 20' + '\r\n' +
        'LOT NUMBER^EHMP0008' + '\r\n' +
        'MANUFACTURER^BAXTER HEALTHCARE CORPORATION' + '\r\n' +
        'STATUS^ACTIVE' + '\r\n' +
        'VACCINE^TETANUS TOXOID, ADSORBED' + '\r\n' +
        'EXPIRATION DATE^DEC 31, 2015' + '\r\n' +
        'DOSES UNUSED^500' + '\r\n' +
        'LOW SUPPLY ALERT^0' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n' +

        'RECORD^14 OF 20' + '\r\n' +
        'LOT NUMBER^EHMP0009' + '\r\n' +
        'MANUFACTURER^BERNA PRODUCTS CORPORATION' + '\r\n' +
        'STATUS^ACTIVE' + '\r\n' +
        'VACCINE^DTAP-HIB' + '\r\n' +
        'EXPIRATION DATE^DEC 31, 2016' + '\r\n' +
        'DOSES UNUSED^1000' + '\r\n' +
        'LOW SUPPLY ALERT^' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n' +
        'RECORD^15 OF 20' + '\r\n' +
        'LOT NUMBER^I90FV' + '\r\n' +
        'MANUFACTURER^MERCK AND CO., INC.' + '\r\n' +
        'STATUS^ACTIVE' + '\r\n' +
        'VACCINE^HEP A, ADULT' + '\r\n' +
        'EXPIRATION DATE^' + '\r\n' +
        'DOSES UNUSED^300' + '\r\n' +
        'LOW SUPPLY ALERT^' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n' +
        'RECORD^16 OF 20' + '\r\n' +
        'LOT NUMBER^J6702KP' + '\r\n' +
        'MANUFACTURER^SANOFI PASTEUR' + '\r\n' +
        'STATUS^ACTIVE' + '\r\n' +
        'VACCINE^INFLUENZA, SEASONAL, INJECTABLE' + '\r\n' +
        'EXPIRATION DATE^' + '\r\n' +
        'DOSES UNUSED^300' + '\r\n' +
        'LOW SUPPLY ALERT^' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n' +

        'RECORD^17 OF 20' + '\r\n' +
        'LOT NUMBER^L6802KP' + '\r\n' +
        'MANUFACTURER^SANOFI PASTEUR' + '\r\n' +
        'STATUS^ACTIVE' + '\r\n' +
        'VACCINE^INFLUENZA, SEASONAL, INJECTABLE' + '\r\n' +
        'EXPIRATION DATE^' + '\r\n' +
        'DOSES UNUSED^300' + '\r\n' +
        'LOW SUPPLY ALERT^' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n' +
        'RECORD^18 OF 20' + '\r\n' +
        'LOT NUMBER^Y8789ZR' + '\r\n' +
        'MANUFACTURER^SANOFI PASTEUR' + '\r\n' +
        'STATUS^ACTIVE' + '\r\n' +
        'VACCINE^INFLUENZA, SEASONAL, INJECTABLE' + '\r\n' +
        'EXPIRATION DATE^' + '\r\n' +
        'DOSES UNUSED^300' + '\r\n' +
        'LOW SUPPLY ALERT^' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n' +

        'RECORD^19 OF 20' + '\r\n' +
        'LOT NUMBER^Z0860BB' + '\r\n' +
        'MANUFACTURER^CSL BEHRING, INC' + '\r\n' +
        'STATUS^ACTIVE' + '\r\n' +
        'VACCINE^INFLUENZA, SEASONAL, INJECTABLE, PRESERVATIVE FREE' + '\r\n' +
        'EXPIRATION DATE^' + '\r\n' +
        'DOSES UNUSED^300' + '\r\n' +
        'LOW SUPPLY ALERT^' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n' +
        'RECORD^20 OF 20' + '\r\n' +
        'LOT NUMBER^Z79YG' + '\r\n' +
        'MANUFACTURER^GLAXOSMITHKLINE' + '\r\n' +
        'STATUS^ACTIVE' + '\r\n' +
        'VACCINE^TDAP' + '\r\n' +
        'EXPIRATION DATE^' + '\r\n' +
        'DOSES UNUSED^300' + '\r\n' +
        'LOW SUPPLY ALERT^' + '\r\n' +
        'NDC CODE (VA)^' + '\r\n');

        expect(result).to.eql([
            {
                "record": "1 OF 20",
                "lotNumber": "A0430EE",
                "manufacturer": "CSL BEHRING, INC",
                "status": "ACTIVE",
                "vaccine": "INFLUENZA, SEASONAL, INJECTABLE, PRESERVATIVE FREE",
                "expirationDate": "",
                "dosesUnused": "300",
                "lowSupplyAlert": "",
                "ndcCodeVa": ""
            },
            {
                "record": "2 OF 20",
                "lotNumber": "EHMP0001",
                "manufacturer": "ABBOTT LABORATORIES",
                "status": "ACTIVE",
                "vaccine": "INFLUENZA, HIGH DOSE SEASONAL",
                "expirationDate": "DEC 01, 2015",
                "dosesUnused": "200",
                "lowSupplyAlert": "10",
                "ndcCodeVa": ""
            },
            {
                "record": "3 OF 20",
                "lotNumber": "EHMP00010EXP",
                "manufacturer": "BIOTEST PHARMACEUTICALS CORPORATION",
                "status": "EXPIRED",
                "vaccine": "MMR",
                "expirationDate": "JAN 21, 2015",
                "dosesUnused": "100",
                "lowSupplyAlert": "",
                "ndcCodeVa": ""
            },
            {
                "record": "4 OF 20",
                "lotNumber": "EHMP00011",
                "manufacturer": "CRUCELL",
                "status": "ACTIVE",
                "vaccine": "PNEUMOCOCCAL POLYSACCHARIDE PPV23",
                "expirationDate": "DEC 31, 2016",
                "dosesUnused": "500",
                "lowSupplyAlert": "",
                "ndcCodeVa": ""
            },
            {
                "record": "5 OF 20",
                "lotNumber": "EHMP00012",
                "manufacturer": "CSL BEHRING, INC",
                "status": "ACTIVE",
                "vaccine": "PNEUMOCOCCAL CONJUGATE PCV 13",
                "expirationDate": "DEC 31, 2016",
                "dosesUnused": "1000",
                "lowSupplyAlert": "",
                "ndcCodeVa": ""
            },
            {
                "record": "6 OF 20",
                "lotNumber": "EHMP00013",
                "manufacturer": "CSL BEHRING, INC",
                "status": "ACTIVE",
                "vaccine": "DTAP, 5 PERTUSSIS ANTIGENS",
                "expirationDate": "DEC 31, 2016",
                "dosesUnused": "1000",
                "lowSupplyAlert": "",
                "ndcCodeVa": ""
            },
            {
                "record": "7 OF 20",
                "lotNumber": "EHMP0002",
                "manufacturer": "ABBOTT LABORATORIES",
                "status": "ACTIVE",
                "vaccine": "INFLUENZA, LIVE, INTRANASAL",
                "expirationDate": "DEC 31, 2015",
                "dosesUnused": "300",
                "lowSupplyAlert": "0",
                "ndcCodeVa": ""
            },
            {
                "record": "8 OF 20",
                "lotNumber": "EHMP0003",
                "manufacturer": "ABBOTT LABORATORIES",
                "status": "ACTIVE",
                "vaccine": "INFLUENZA, LIVE, INTRANASAL",
                "expirationDate": "DEC 31, 2015",
                "dosesUnused": "200",
                "lowSupplyAlert": "0",
                "ndcCodeVa": ""
            },
            {
                "record": "9 OF 20",
                "lotNumber": "EHMP0004",
                "manufacturer": "ADAMS LABORATORIES, INC.",
                "status": "ACTIVE",
                "vaccine": "INFLUENZA, INJECTABLE, QUADRIVALENT, PRESERVATIVE FREE",
                "expirationDate": "DEC 31, 2015",
                "dosesUnused": "300",
                "lowSupplyAlert": "0",
                "ndcCodeVa": ""
            },
            {
                "record": "10 OF 20",
                "lotNumber": "EHMP0005",
                "manufacturer": "AKORN, INC",
                "status": "ACTIVE",
                "vaccine": "INFLUENZA, SEASONAL, INTRADERMAL, PRESERVATIVE FREE",
                "expirationDate": "DEC 31, 2015",
                "dosesUnused": "400",
                "lowSupplyAlert": "0",
                "ndcCodeVa": ""
            },
            {
                "record": "11 OF 20",
                "lotNumber": "EHMP0006",
                "manufacturer": "ALPHA THERAPEUTIC CORPORATION",
                "status": "ACTIVE",
                "vaccine": "HEP A-HEP B",
                "expirationDate": "DEC 31, 2015",
                "dosesUnused": "500",
                "lowSupplyAlert": "0",
                "ndcCodeVa": ""
            },
            {
                "record": "12 OF 20",
                "lotNumber": "EHMP0007",
                "manufacturer": "BARR LABORATORIES",
                "status": "ACTIVE",
                "vaccine": "HEP B, ADULT",
                "expirationDate": "DEC 31, 2015",
                "dosesUnused": "500",
                "lowSupplyAlert": "0",
                "ndcCodeVa": ""
            },
            {
                "record": "13 OF 20",
                "lotNumber": "EHMP0008",
                "manufacturer": "BAXTER HEALTHCARE CORPORATION",
                "status": "ACTIVE",
                "vaccine": "TETANUS TOXOID, ADSORBED",
                "expirationDate": "DEC 31, 2015",
                "dosesUnused": "500",
                "lowSupplyAlert": "0",
                "ndcCodeVa": ""
            },
            {
                "record": "14 OF 20",
                "lotNumber": "EHMP0009",
                "manufacturer": "BERNA PRODUCTS CORPORATION",
                "status": "ACTIVE",
                "vaccine": "DTAP-HIB",
                "expirationDate": "DEC 31, 2016",
                "dosesUnused": "1000",
                "lowSupplyAlert": "",
                "ndcCodeVa": ""
            },
            {
                "record": "15 OF 20",
                "lotNumber": "I90FV",
                "manufacturer": "MERCK AND CO., INC.",
                "status": "ACTIVE",
                "vaccine": "HEP A, ADULT",
                "expirationDate": "",
                "dosesUnused": "300",
                "lowSupplyAlert": "",
                "ndcCodeVa": ""
            },
            {
                "record": "16 OF 20",
                "lotNumber": "J6702KP",
                "manufacturer": "SANOFI PASTEUR",
                "status": "ACTIVE",
                "vaccine": "INFLUENZA, SEASONAL, INJECTABLE",
                "expirationDate": "",
                "dosesUnused": "300",
                "lowSupplyAlert": "",
                "ndcCodeVa": ""
            },
            {
                "record": "17 OF 20",
                "lotNumber": "L6802KP",
                "manufacturer": "SANOFI PASTEUR",
                "status": "ACTIVE",
                "vaccine": "INFLUENZA, SEASONAL, INJECTABLE",
                "expirationDate": "",
                "dosesUnused": "300",
                "lowSupplyAlert": "",
                "ndcCodeVa": ""
            },
            {
                "record": "18 OF 20",
                "lotNumber": "Y8789ZR",
                "manufacturer": "SANOFI PASTEUR",
                "status": "ACTIVE",
                "vaccine": "INFLUENZA, SEASONAL, INJECTABLE",
                "expirationDate": "",
                "dosesUnused": "300",
                "lowSupplyAlert": "",
                "ndcCodeVa": ""
            },
            {
                "record": "19 OF 20",
                "lotNumber": "Z0860BB",
                "manufacturer": "CSL BEHRING, INC",
                "status": "ACTIVE",
                "vaccine": "INFLUENZA, SEASONAL, INJECTABLE, PRESERVATIVE FREE",
                "expirationDate": "",
                "dosesUnused": "300",
                "lowSupplyAlert": "",
                "ndcCodeVa": ""
            },
            {
                "record": "20 OF 20",
                "lotNumber": "Z79YG",
                "manufacturer": "GLAXOSMITHKLINE",
                "status": "ACTIVE",
                "vaccine": "TDAP",
                "expirationDate": "",
                "dosesUnused": "300",
                "lowSupplyAlert": "",
                "ndcCodeVa": ""
            }
        ]);
		/* jshint +W109 */
    });
});
