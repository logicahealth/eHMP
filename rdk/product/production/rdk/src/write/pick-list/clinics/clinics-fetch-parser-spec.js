'use strict';

var parse = require('./clinics-fetch-parser').parse;
var logger = sinon.stub(require('bunyan').createLogger({name: 'clinics-fetch-parser'}));

xdescribe('unit test to validate services fetch', function () {
    it('can parse the RPC data correctly', function () {
        /* jshint -W109 */
        var input = '64^AUDIOLOGY' + '\r\n' +
            '195^CARDIOLOGY'  + '\r\n' +
            '137^COMP AND PEN'  + '\r\n' +
            '246^CWT CLINIC' + '\r\n' +
            '228^DENTAL' + '\r\n' +
            '62^DERMATOLOGY'  + '\r\n' +
            '285^DIABETIC'  + '\r\n' +
            '191^DIABETIC TELERET READER LOCAL'  + '\r\n' +
            '193^DIABETIC TELERET READER REMOTE'  + '\r\n' +
            '190^DIABETIC TELERETINAL IMAGER'  + '\r\n' +
            '426^EMERGENCY ROOM'  + '\r\n' +
            '133^EMPLOYEE HEALTH'  + '\r\n' +
            '422^ENDOCRINE'  + '\r\n' +
            '23^GENERAL MEDICINE'  + '\r\n' +
            '298^GENERAL SURGERY'  + '\r\n' +
            '935^GYNECOLOGIST CLINIC'  + '\r\n' +
            '229^HEMATOLOGY'  + '\r\n' +
            '128^MAMMOGRAM'  + '\r\n' +
            '17^MENTAL HEALTH'  + '\r\n' +
            '438^MENTAL HEALTH GROUP THERAPY'  + '\r\n' +
            '26^MENTAL HYGIENE-OPC'  + '\r\n' +
            '430^NEUROLOGY'  + '\r\n' +
            '432^NEUROSURGERY'  + '\r\n' +
            '114^NUCLEAR MEDICINE'  + '\r\n' +
            '234^OBSERVATION'  + '\r\n' +
            '437^OPHTHALMOLOGY'  + '\r\n' +
            '433^PHYSICAL THERAPY'  + '\r\n' +
            '127^PLASTIC SURGERY'  + '\r\n' +
            '233^PODIATRY'  + '\r\n' +
            '32^PRIMARY CARE'  + '\r\n' +
            '435^PRIMARY CARE TELEPHONE'  + '\r\n' +
            '427^REHAB MEDICINE'  + '\r\n' +
            '31^SOCIAL WORK'  + '\r\n' +
            '431^SPEECH PATHOLOGY'  + '\r\n' +
            '239^SURGICAL CLINIC'  + '\r\n' +
            '441^TESTCLINIC001'  + '\r\n' +
            '442^TESTCLINIC002'  + '\r\n' +
            '443^TESTCLINIC003'  + '\r\n' +
            '444^TESTCLINIC004'  + '\r\n' +
            '445^TESTCLINIC005'  + '\r\n' +
            '446^TESTCLINIC006'  + '\r\n' +
            '447^TESTCLINIC007'  + '\r\n' +
            '448^TESTCLINIC008'  + '\r\n' +
            '449^TESTCLINIC009';

        var result = parse(logger, input);
        expect(result.data).to.eql([
            {
                "data": [
                    {
                        "ien": "64",
                        "name": "AUDIOLOGY"
                    },
                    {
                        "ien": "195",
                        "name": "CARDIOLOGY"
                    },
                    {
                        "ien": "137",
                        "name": "COMP AND PEN"
                    },
                    {
                        "ien": "246",
                        "name": "CWT CLINIC"
                    },
                    {
                        "ien": "228",
                        "name": "DENTAL"
                    },
                    {
                        "ien": "62",
                        "name": "DERMATOLOGY"
                    },
                    {
                        "ien": "285",
                        "name": "DIABETIC"
                    },
                    {
                        "ien": "191",
                        "name": "DIABETIC TELERET READER LOCAL"
                    },
                    {
                        "ien": "193",
                        "name": "DIABETIC TELERET READER REMOTE"
                    },
                    {
                        "ien": "190",
                        "name": "DIABETIC TELERETINAL IMAGER"
                    },
                    {
                        "ien": "426",
                        "name": "EMERGENCY ROOM"
                    },
                    {
                        "ien": "133",
                        "name": "EMPLOYEE HEALTH"
                    },
                    {
                        "ien": "422",
                        "name": "ENDOCRINE"
                    },
                    {
                        "ien": "23",
                        "name": "GENERAL MEDICINE"
                    },
                    {
                        "ien": "298",
                        "name": "GENERAL SURGERY"
                    },
                    {
                        "ien": "935",
                        "name": "GYNECOLOGIST CLINIC"
                    },
                    {
                        "ien": "229",
                        "name": "HEMATOLOGY"
                    },
                    {
                        "ien": "128",
                        "name": "MAMMOGRAM"
                    },
                    {
                        "ien": "17",
                        "name": "MENTAL HEALTH"
                    },
                    {
                        "ien": "438",
                        "name": "MENTAL HEALTH GROUP THERAPY"
                    },
                    {
                        "ien": "26",
                        "name": "MENTAL HYGIENE-OPC"
                    },
                    {
                        "ien": "430",
                        "name": "NEUROLOGY"
                    },
                    {
                        "ien": "432",
                        "name": "NEUROSURGERY"
                    },
                    {
                        "ien": "114",
                        "name": "NUCLEAR MEDICINE"
                    },
                    {
                        "ien": "234",
                        "name": "OBSERVATION"
                    },
                    {
                        "ien": "437",
                        "name": "OPHTHALMOLOGY"
                    },
                    {
                        "ien": "433",
                        "name": "PHYSICAL THERAPY"
                    },
                    {
                        "ien": "127",
                        "name": "PLASTIC SURGERY"
                    },
                    {
                        "ien": "233",
                        "name": "PODIATRY"
                    },
                    {
                        "ien": "32",
                        "name": "PRIMARY CARE"
                    },
                    {
                        "ien": "435",
                        "name": "PRIMARY CARE TELEPHONE"
                    },
                    {
                        "ien": "427",
                        "name": "REHAB MEDICINE"
                    },
                    {
                        "ien": "31",
                        "name": "SOCIAL WORK"
                    },
                    {
                        "ien": "431",
                        "name": "SPEECH PATHOLOGY"
                    },
                    {
                        "ien": "239",
                        "name": "SURGICAL CLINIC"
                    },
                    {
                        "ien": "441",
                        "name": "TESTCLINIC001"
                    },
                    {
                        "ien": "442",
                        "name": "TESTCLINIC002"
                    },
                    {
                        "ien": "443",
                        "name": "TESTCLINIC003"
                    },
                    {
                        "ien": "444",
                        "name": "TESTCLINIC004"
                    },
                    {
                        "ien": "445",
                        "name": "TESTCLINIC005"
                    },
                    {
                        "ien": "446",
                        "name": "TESTCLINIC006"
                    },
                    {
                        "ien": "447",
                        "name": "TESTCLINIC007"
                    },
                    {
                        "ien": "448",
                        "name": "TESTCLINIC008"
                    },
                    {
                        "ien": "449",
                        "name": "TESTCLINIC009"
                    }
                ],
                "status": 200
            }
        ]);
        /* jshint +W109 */
    });
});
