'use strict';

var log = sinon.stub(require('bunyan').createLogger({
    name: 'lab-specimens-parser'
}));

var parseRpcData = require('./lab-specimens-parser').parseLabSpecimens;

describe('verify lab specimens parser', function() {

    it('parse undefined data', function() {
        expect(function() {
            parseRpcData(log, undefined);
        }).to.throw(Error);
    });

    it('parse data with with blank data', function() {
        expect(function() {
            parseRpcData(log, '');
        }).to.throw(Error);
    });

    it('parse data with with one field', function() {
        expect(function() {
            parseRpcData(log, 'foo');
        }).to.throw(Error);
    });

    it('parse valid RPC data', function() {
        var result = parseRpcData(log, '76^PERITONEAL FLUID\r\n70^BLOOD\r\n124^BRONCHIAL WASHING CYTOLOGIC MATERIAL\r\n');
        expect(result).to.eql([
            {
                'id': '76',
                'name': 'PERITONEAL FLUID'
            },
            {
                'id': '70',
                'name': 'BLOOD'
            },
            {
                'id': '124',
                'name': 'BRONCHIAL WASHING CYTOLOGIC MATERIAL'
            }
        ]);
    });

});
