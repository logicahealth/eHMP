/*global sinon, describe, it */
'use strict';

var parse = require('./immunization-lot-parser').parse;
var log = sinon.stub(require('bunyan').createLogger({name: 'immunization-lot-parser'}));


describe('unit test to validate immunization-lot', function() {
    it('can parse the RPC data correctly', function() {
        var rpcData = [
            '2 RECORDS',
            '22^AS0300001^3~ADAMS LABORATORIES, INC.^0~ACTIVE^1801~AS03 ADJUVANT^3250101~JAN 01, 2025^500^5^~^507~CAMP BEE',
            '21^BCG000001^1~ABBOTT LABORATORIES^0~ACTIVE^42~BCG^3250101~JAN 01, 2025^^^~^507~CAMP BEE'
        ].join('\r\n');

        var expected = [{
            'ien': '22',
            'lotNumber': 'AS0300001',
            'manufacturerNumber': '3',
            'manufacturer': 'ADAMS LABORATORIES, INC.',
            'statusNumber': '0',
            'status': 'ACTIVE',
            'vaccineNumber': '1801',
            'vaccine': 'AS03 ADJUVANT',
            'shortExpirationDate': '3250101',
            'expirationDate': 'JAN 01, 2025',
            'doesUnused': '500',
            'lowSupplyAlert': '5',
            'ndcInternal': '',
            'ndcCodeVa': '',
            'facilityCode': '507',
            'associatedFacility': 'CAMP BEE'
        }, {
            'ien': '21',
            'lotNumber': 'BCG000001',
            'manufacturerNumber': '1',
            'manufacturer': 'ABBOTT LABORATORIES',
            'statusNumber': '0',
            'status': 'ACTIVE',
            'vaccineNumber': '42',
            'vaccine': 'BCG',
            'shortExpirationDate': '3250101',
            'expirationDate': 'JAN 01, 2025',
            'doesUnused': '',
            'lowSupplyAlert': '',
            'ndcInternal': '',
            'ndcCodeVa': '',
            'facilityCode': '507',
            'associatedFacility': 'CAMP BEE'
        }];

        var result = parse(log, rpcData);
        expect(result).to.eql(expected);
    });

    it('returns an error if it receives unexpected data', function() {
        expect(function () {
            parse(log, ['1 Record', 'bad^data']);
        }).to.throw();
    });

    it('can parse the empty response data correctly', function() {
        var result = parse(log, '0 RECORDS\r\n');
        expect(result).to.eql([]);
    });
});
