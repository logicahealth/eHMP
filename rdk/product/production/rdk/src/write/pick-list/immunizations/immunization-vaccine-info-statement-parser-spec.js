/*global sinon, describe, it */
'use strict';

var parse = require('./immunization-vaccine-info-statement-parser').parse;

var log = sinon.stub(require('bunyan').createLogger({ name: 'immunization-vaccine-info-statement-parser' }));
//var log = require('bunyan').createLogger({ name: 'immunization-vaccine-info-statement-parser' }); //Uncomment this line (and comment above) to see output in IntelliJ console

describe('unit test to validate immunization-vaccine-info-statement', function() {
    it('can parse the RPC data correctly', function () {
    	/* jshint -W109 */
        var result = parse(log, 'RECORD^1 OF 38' + '\r\n' +
                                'NAME^ADENOVIRUS VIS' + '\r\n' +
                                'EDITION DATE^JUL 14, 2011' + '\r\n' +
                                'EDITION STATUS^HISTORIC' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300001111110714' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^2 OF 38' + '\r\n' +
                                'NAME^ADENOVIRUS VIS' + '\r\n' +
                                'EDITION DATE^JUN 11, 2014' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300001111140611' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^3 OF 38' + '\r\n' +
                                'NAME^ANTHRAX VIS' + '\r\n' +
                                'EDITION DATE^MAR 10, 2010' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300002811100310' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^4 OF 38' + '\r\n' +
                                'NAME^DIPHTHERIA/TETANUS/PERTUSSIS (DTAP) VIS' + '\r\n' +
                                'EDITION DATE^MAY 17, 2007' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300003511070517' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^5 OF 38' + '\r\n' +
                                'NAME^HAEMOPHILUS INFLUENZAE TYPE B VIS' + '\r\n' +
                                'EDITION DATE^DEC 16, 1998' + '\r\n' +
                                'EDITION STATUS^HISTORIC' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300006611981216' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^6 OF 38' + '\r\n' +
                                'NAME^HAEMOPHILUS INFLUENZAE TYPE B VIS' + '\r\n' +
                                'EDITION DATE^FEB 04, 2014' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300006611140204' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^7 OF 38' + '\r\n' +
                                'NAME^HEPATITIS A VIS' + '\r\n' +
                                'EDITION DATE^OCT 25, 2011' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300004211111025' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^8 OF 38' + '\r\n' +
                                'NAME^HEPATITIS B VIS' + '\r\n' +
                                'EDITION DATE^FEB 02, 2012' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300005911120202' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^9 OF 38' + '\r\n' +
                                'NAME^HUMAN PAPILLOMAVIRUS VACCINE (CERVARIX) VIS' + '\r\n' +
                                'EDITION DATE^MAY 03, 2011' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300007311110503' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^10 OF 38' + '\r\n' +
                                'NAME^HUMAN PAPILLOMAVIRUS VACCINE (GARDASIL) VIS' + '\r\n' +
                                'EDITION DATE^MAY 17, 2013' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300008011130517' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^11 OF 38' + '\r\n' +
                                'NAME^HUMAN PAPILLOMAVIRUS VACCINE (GARDASIL) VIS' + '\r\n' +
                                'EDITION DATE^FEB 22, 2012' + '\r\n' +
                                'EDITION STATUS^HISTORIC' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300008011120222' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^12 OF 38' + '\r\n' +
                                'NAME^INFLUENZA VACCINE - INACTIVATED VIS' + '\r\n' +
                                'EDITION DATE^JUL 02, 2012' + '\r\n' +
                                'EDITION STATUS^HISTORIC' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300010311120702' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^13 OF 38' + '\r\n' +
                                'NAME^INFLUENZA VACCINE - INACTIVATED VIS' + '\r\n' +
                                'EDITION DATE^JUL 26, 2013' + '\r\n' +
                                'EDITION STATUS^HISTORIC' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300010311130726' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^14 OF 38' + '\r\n' +
                                'NAME^INFLUENZA VACCINE - INACTIVATED VIS' + '\r\n' +
                                'EDITION DATE^AUG 19, 2014' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300010311140819' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^15 OF 38' + '\r\n' +
                                'NAME^INFLUENZA VACCINE - LIVE, INTRANASAL VIS' + '\r\n' +
                                'EDITION DATE^JUL 02, 2012' + '\r\n' +
                                'EDITION STATUS^HISTORIC' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300009711120702' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^16 OF 38' + '\r\n' +
                                'NAME^INFLUENZA VACCINE - LIVE, INTRANASAL VIS' + '\r\n' +
                                'EDITION DATE^JUL 26, 2013' + '\r\n' +
                                'EDITION STATUS^HISTORIC' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300009711130726' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^17 OF 38' + '\r\n' +
                                'NAME^INFLUENZA VACCINE - LIVE, INTRANASAL VIS' + '\r\n' +
                                'EDITION DATE^AUG 19, 2014' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300009711140819' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^18 OF 38' + '\r\n' +
                                'NAME^JAPANESE ENCEPHALITIS VIS' + '\r\n' +
                                'EDITION DATE^DEC 07, 2011' + '\r\n' +
                                'EDITION STATUS^HISTORIC' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300011011111207' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^19 OF 38' + '\r\n' +
                                'NAME^JAPANESE ENCEPHALITIS VIS' + '\r\n' +
                                'EDITION DATE^JAN 24, 2014' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300011011140124' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^20 OF 38' + '\r\n' +
                                'NAME^MEASLES/MUMPS/RUBELLA VIS' + '\r\n' +
                                'EDITION DATE^APR 20, 2012' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300012711120420' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^21 OF 38' + '\r\n' +
                                'NAME^MEASLES/MUMPS/RUBELLA/VARICELLA VIS' + '\r\n' +
                                'EDITION DATE^MAY 21, 2010' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300013411100521' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^22 OF 38' + '\r\n' +
                                'NAME^MENINGOCOCCAL VIS' + '\r\n' +
                                'EDITION DATE^OCT 14, 2011' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300014111111014' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^23 OF 38' + '\r\n' +
                                'NAME^MULTIPLE VACCINES VIS' + '\r\n' +
                                'EDITION DATE^NOV 16, 2012' + '\r\n' +
                                'EDITION STATUS^HISTORIC' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300026411121116' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^24 OF 38' + '\r\n' +
                                'NAME^MULTIPLE VACCINES VIS' + '\r\n' +
                                'EDITION DATE^OCT 22, 2014' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300026411141022' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^25 OF 38' + '\r\n' +
                                'NAME^PNEUMOCOCCAL CONJUGATE (PCV13) VIS' + '\r\n' +
                                'EDITION DATE^APR 16, 2010' + '\r\n' +
                                'EDITION STATUS^HISTORIC' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300015811100416' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^26 OF 38' + '\r\n' +
                                'NAME^PNEUMOCOCCAL CONJUGATE (PCV13) VIS' + '\r\n' +
                                'EDITION DATE^FEB 27, 2013' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300015811130227' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^27 OF 38' + '\r\n' +
                                'NAME^PNEUMOCOCCAL POLYSACCHARIDE VIS' + '\r\n' +
                                'EDITION DATE^OCT 06, 2009' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300016511091006' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^28 OF 38' + '\r\n' +
                                'NAME^POLIO VIS' + '\r\n' +
                                'EDITION DATE^NOV 08, 2011' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300017211111108' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^29 OF 38' + '\r\n' +
                                'NAME^RABIES VIS' + '\r\n' +
                                'EDITION DATE^OCT 06, 2009' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300018911091006' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^30 OF 38' + '\r\n' +
                                'NAME^ROTAVIRUS VIS' + '\r\n' +
                                'EDITION DATE^DEC 06, 2010' + '\r\n' +
                                'EDITION STATUS^HISTORIC' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300019611101206' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^31 OF 38' + '\r\n' +
                                'NAME^ROTAVIRUS VIS' + '\r\n' +
                                'EDITION DATE^AUG 26, 2013' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300019611130826' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^32 OF 38' + '\r\n' +
                                'NAME^SHINGLES VIS' + '\r\n' +
                                'EDITION DATE^OCT 06, 2009' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300020211091006' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^33 OF 38' + '\r\n' +
                                'NAME^TETANUS/DIPHTHERIA (TD) VIS' + '\r\n' +
                                'EDITION DATE^FEB 04, 2014' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300028811140204' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^34 OF 38' + '\r\n' +
                                'NAME^TETANUS/DIPHTHERIA/PERTUSSIS (TDAP) VIS' + '\r\n' +
                                'EDITION DATE^MAY 09, 2013' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300027111130509' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^35 OF 38' + '\r\n' +
                                'NAME^TETANUS/DIPHTHERIA/PERTUSSIS (TDAP/TD) VIS' + '\r\n' +
                                'EDITION DATE^JAN 24, 2012' + '\r\n' +
                                'EDITION STATUS^HISTORIC' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300022611120124' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^36 OF 38' + '\r\n' +
                                'NAME^TYPHOID VIS' + '\r\n' +
                                'EDITION DATE^MAY 29, 2012' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300023311120529' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^37 OF 38' + '\r\n' +
                                'NAME^VARICELLA (CHICKENPOX) VIS' + '\r\n' +
                                'EDITION DATE^MAR 13, 2008' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300024011080313' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^38 OF 38' + '\r\n' +
                                'NAME^YELLOW FEVER VIS' + '\r\n' +
                                'EDITION DATE^MAR 30, 2011' + '\r\n' +
                                'EDITION STATUS^CURRENT' + '\r\n' +
                                'LANGUAGE^ENGLISH' + '\r\n' +
                                'VIS TEXT^' + '\r\n' +
                                '2D BAR CODE^253088698300025711110330' + '\r\n' +
                                'VIS URL^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n');

        expect(result).to.eql([
            {
                "record": "1 OF 38",
                "name": "ADENOVIRUS VIS",
                "editionDate": "JUL 14, 2011",
                "editionStatus": "HISTORIC",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300001111110714",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "2 OF 38",
                "name": "ADENOVIRUS VIS",
                "editionDate": "JUN 11, 2014",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300001111140611",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "3 OF 38",
                "name": "ANTHRAX VIS",
                "editionDate": "MAR 10, 2010",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300002811100310",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "4 OF 38",
                "name": "DIPHTHERIA/TETANUS/PERTUSSIS (DTAP) VIS",
                "editionDate": "MAY 17, 2007",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300003511070517",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "5 OF 38",
                "name": "HAEMOPHILUS INFLUENZAE TYPE B VIS",
                "editionDate": "DEC 16, 1998",
                "editionStatus": "HISTORIC",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300006611981216",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "6 OF 38",
                "name": "HAEMOPHILUS INFLUENZAE TYPE B VIS",
                "editionDate": "FEB 04, 2014",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300006611140204",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "7 OF 38",
                "name": "HEPATITIS A VIS",
                "editionDate": "OCT 25, 2011",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300004211111025",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "8 OF 38",
                "name": "HEPATITIS B VIS",
                "editionDate": "FEB 02, 2012",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300005911120202",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "9 OF 38",
                "name": "HUMAN PAPILLOMAVIRUS VACCINE (CERVARIX) VIS",
                "editionDate": "MAY 03, 2011",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300007311110503",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "10 OF 38",
                "name": "HUMAN PAPILLOMAVIRUS VACCINE (GARDASIL) VIS",
                "editionDate": "MAY 17, 2013",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300008011130517",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "11 OF 38",
                "name": "HUMAN PAPILLOMAVIRUS VACCINE (GARDASIL) VIS",
                "editionDate": "FEB 22, 2012",
                "editionStatus": "HISTORIC",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300008011120222",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "12 OF 38",
                "name": "INFLUENZA VACCINE - INACTIVATED VIS",
                "editionDate": "JUL 02, 2012",
                "editionStatus": "HISTORIC",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300010311120702",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "13 OF 38",
                "name": "INFLUENZA VACCINE - INACTIVATED VIS",
                "editionDate": "JUL 26, 2013",
                "editionStatus": "HISTORIC",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300010311130726",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "14 OF 38",
                "name": "INFLUENZA VACCINE - INACTIVATED VIS",
                "editionDate": "AUG 19, 2014",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300010311140819",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "15 OF 38",
                "name": "INFLUENZA VACCINE - LIVE, INTRANASAL VIS",
                "editionDate": "JUL 02, 2012",
                "editionStatus": "HISTORIC",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300009711120702",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "16 OF 38",
                "name": "INFLUENZA VACCINE - LIVE, INTRANASAL VIS",
                "editionDate": "JUL 26, 2013",
                "editionStatus": "HISTORIC",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300009711130726",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "17 OF 38",
                "name": "INFLUENZA VACCINE - LIVE, INTRANASAL VIS",
                "editionDate": "AUG 19, 2014",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300009711140819",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "18 OF 38",
                "name": "JAPANESE ENCEPHALITIS VIS",
                "editionDate": "DEC 07, 2011",
                "editionStatus": "HISTORIC",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300011011111207",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "19 OF 38",
                "name": "JAPANESE ENCEPHALITIS VIS",
                "editionDate": "JAN 24, 2014",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300011011140124",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "20 OF 38",
                "name": "MEASLES/MUMPS/RUBELLA VIS",
                "editionDate": "APR 20, 2012",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300012711120420",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "21 OF 38",
                "name": "MEASLES/MUMPS/RUBELLA/VARICELLA VIS",
                "editionDate": "MAY 21, 2010",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300013411100521",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "22 OF 38",
                "name": "MENINGOCOCCAL VIS",
                "editionDate": "OCT 14, 2011",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300014111111014",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "23 OF 38",
                "name": "MULTIPLE VACCINES VIS",
                "editionDate": "NOV 16, 2012",
                "editionStatus": "HISTORIC",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300026411121116",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "24 OF 38",
                "name": "MULTIPLE VACCINES VIS",
                "editionDate": "OCT 22, 2014",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300026411141022",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "25 OF 38",
                "name": "PNEUMOCOCCAL CONJUGATE (PCV13) VIS",
                "editionDate": "APR 16, 2010",
                "editionStatus": "HISTORIC",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300015811100416",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "26 OF 38",
                "name": "PNEUMOCOCCAL CONJUGATE (PCV13) VIS",
                "editionDate": "FEB 27, 2013",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300015811130227",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "27 OF 38",
                "name": "PNEUMOCOCCAL POLYSACCHARIDE VIS",
                "editionDate": "OCT 06, 2009",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300016511091006",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "28 OF 38",
                "name": "POLIO VIS",
                "editionDate": "NOV 08, 2011",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300017211111108",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "29 OF 38",
                "name": "RABIES VIS",
                "editionDate": "OCT 06, 2009",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300018911091006",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "30 OF 38",
                "name": "ROTAVIRUS VIS",
                "editionDate": "DEC 06, 2010",
                "editionStatus": "HISTORIC",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300019611101206",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "31 OF 38",
                "name": "ROTAVIRUS VIS",
                "editionDate": "AUG 26, 2013",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300019611130826",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "32 OF 38",
                "name": "SHINGLES VIS",
                "editionDate": "OCT 06, 2009",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300020211091006",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "33 OF 38",
                "name": "TETANUS/DIPHTHERIA (TD) VIS",
                "editionDate": "FEB 04, 2014",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300028811140204",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "34 OF 38",
                "name": "TETANUS/DIPHTHERIA/PERTUSSIS (TDAP) VIS",
                "editionDate": "MAY 09, 2013",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300027111130509",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "35 OF 38",
                "name": "TETANUS/DIPHTHERIA/PERTUSSIS (TDAP/TD) VIS",
                "editionDate": "JAN 24, 2012",
                "editionStatus": "HISTORIC",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300022611120124",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "36 OF 38",
                "name": "TYPHOID VIS",
                "editionDate": "MAY 29, 2012",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300023311120529",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "37 OF 38",
                "name": "VARICELLA (CHICKENPOX) VIS",
                "editionDate": "MAR 13, 2008",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300024011080313",
                "visUrl": "",
                "status": "ACTIVE"
            },
            {
                "record": "38 OF 38",
                "name": "YELLOW FEVER VIS",
                "editionDate": "MAR 30, 2011",
                "editionStatus": "CURRENT",
                "language": "ENGLISH",
                "visText": "",
                "twoDBarCode": "253088698300025711110330",
                "visUrl": "",
                "status": "ACTIVE"
            }
        ]);
		/* jshint +W109 */
    });
});
