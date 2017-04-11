/*global sinon, describe, it */
'use strict';

var parse = require('./new-persons-parser').parse;

var log = sinon.stub(require('bunyan').createLogger({ name: 'new-persons-parser' }));
//var log = require('bunyan').createLogger({ name: 'new-persons-parser' }); //Uncomment this line (and comment above) to see output in IntelliJ console

describe('unit test to validate new-persons', function() {
    it('can parse the RPC data correctly', function () {
    	/* jshint -W109 */
        var result = parse(log, '11272^Access,New' + '\r\n' +
                                '11656^Amie,Vaco' + '\r\n' +
                                '10000000246^Analyst,Pat^- COMPUTER SPECIALIST' + '\r\n' +
                                '10000000266^Analyst,Poonam^- COMPUTER SPECIALIST' + '\r\n' +
                                '10000000229^Anesthesiologist,One^- ANESTHESIOLOGIST' + '\r\n' +
                                '20221^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20222^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20223^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20224^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20225^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20226^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20227^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20228^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20229^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20230^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20231^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20232^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20233^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20234^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20235^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20236^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20237^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20238^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20239^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20240^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20241^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20242^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20243^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20244^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20245^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20246^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20247^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20248^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20249^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20250^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20251^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20252^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20253^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20254^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20255^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20256^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20257^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20258^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20259^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20260^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20261^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20262^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20263^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20264^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20265^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20266^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20267^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20268^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20269^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20270^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20271^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20272^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20273^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20274^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20275^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20276^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20277^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20278^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20279^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20280^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20281^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20282^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20283^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20284^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20285^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20286^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20287^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20288^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20289^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20290^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20291^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20292^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20293^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20294^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20295^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20296^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20297^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20298^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20299^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20300^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20301^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20302^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20303^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20304^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20305^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20306^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20307^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20308^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20309^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20310^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20311^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20312^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20313^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20314^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20315^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20316^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20317^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20318^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20319^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20320^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20321^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20322^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20323^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20324^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20325^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20326^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20327^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20328^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20329^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20330^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20331^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n' +
                                '20332^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n');

        expect(result).to.eql([
            {
                "code": "11272",
                "name": "Access,New"
            },
            {
                "code": "11656",
                "name": "Amie,Vaco"
            },
            {
                "code": "10000000246",
                "name": "Analyst,Pat",
                "title": "- COMPUTER SPECIALIST"
            },
            {
                "code": "10000000266",
                "name": "Analyst,Poonam",
                "title": "- COMPUTER SPECIALIST"
            },
            {
                "code": "10000000229",
                "name": "Anesthesiologist,One",
                "title": "- ANESTHESIOLOGIST"
            },
            {
                "code": "20221",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20222",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20223",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20224",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20225",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20226",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20227",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20228",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20229",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20230",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20231",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20232",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20233",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20234",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20235",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20236",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20237",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20238",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20239",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20240",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20241",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20242",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20243",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20244",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20245",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20246",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20247",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20248",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20249",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20250",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20251",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20252",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20253",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20254",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20255",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20256",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20257",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20258",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20259",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20260",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20261",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20262",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20263",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20264",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20265",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20266",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20267",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20268",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20269",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20270",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20271",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20272",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20273",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20274",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20275",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20276",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20277",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20278",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20279",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20280",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20281",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20282",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20283",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20284",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20285",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20286",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20287",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20288",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20289",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20290",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20291",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20292",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20293",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20294",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20295",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20296",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20297",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20298",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20299",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20300",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20301",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20302",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20303",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20304",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20305",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20306",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20307",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20308",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20309",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20310",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20311",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20312",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20313",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20314",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20315",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20316",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20317",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20318",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20319",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20320",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20321",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20322",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20323",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20324",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20325",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20326",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20327",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20328",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20329",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20330",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20331",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            },
            {
                "code": "20332",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            }
        ]);
		/* jshint +W109 */
    });
});
