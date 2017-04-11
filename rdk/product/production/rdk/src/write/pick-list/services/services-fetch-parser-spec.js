'use strict';

var parse = require('./services-fetch-parser').parse;
var logger = sinon.stub(require('bunyan').createLogger({name: 'services-fetch-parser'}));

xdescribe('unit test to validate services fetch', function () {
    it('can parse the RPC data correctly', function () {
        /* jshint -W109 */
        var input = '1000^AMBULATORY CARE' + '\r\n' +
            '1001^ANESTHESIOLOGY' + '\r\n' +
            '11^BLIND REHAB' + '\r\n' +
            '1003^BLIND REHABILITATION' + '\r\n' +
            '1008^DENTAL' + '\r\n' +
            '1018^MEDICAL' + '\r\n' +
            '2^MEDICINE' + '\r\n' +
            '9^NEUROLOGY' + '\r\n' +
            '13^PSYCHIATRY' + '\r\n' +
            '1032^PSYCHOLOGY' + '\r\n' +
            '3^SURGERY' + '\r\n' +
            '1041^SURGICAL';

        var result = parse(logger, input);
        expect(result.data).to.eql([
            {
                "ien": "1000",
                "name": "AMBULATORY CARE"
            },
            {
                "ien": "1001",
                "name": "ANESTHESIOLOGY"
            },
            {
                "ien": "11",
                "name": "BLIND REHAB"
            },
            {
                "ien": "1003",
                "name": "BLIND REHABILITATION"
            },
            {
                "ien": "1008",
                "name": "DENTAL"
            },
            {
                "ien": "1018",
                "name": "MEDICAL"
            },
            {
                "ien": "2",
                "name": "MEDICINE"
            },
            {
                "ien": "9",
                "name": "NEUROLOGY"
            },
            {
                "ien": "13",
                "name": "PSYCHIATRY"
            },
            {
                "ien": "1032",
                "name": "PSYCHOLOGY"
            },
            {
                "ien": "3",
                "name": "SURGERY"
            },
            {
                "ien": "1041",
                "name": "SURGICAL"
            }
        ]);
        /* jshint +W109 */
    });
});
