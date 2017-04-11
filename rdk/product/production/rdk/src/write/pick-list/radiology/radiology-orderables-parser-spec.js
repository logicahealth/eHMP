/*global sinon, describe, it */
'use strict';

var parse = require('./radiology-orderables-parser').parse;

var log = sinon.stub(require('bunyan').createLogger({ name: 'radiology-orderables-parser' }));
//var log = require('bunyan').createLogger({ name: 'radiology-orderables-parser' }); //Uncomment this line (and comment above) to see output in IntelliJ console

describe('unit test to validate radiology-orderables', function() {
    it('can parse the RPC data correctly', function() {
        var result = parse(log, '1^XRay^XRAY^n' + '\r\n');

        expect(result).to.eql([
            {
                'ien': '1',
                'name': 'XRay',
                'synonym': 'XRAY',
                'special': 'n'
            }
        ]);
    });

    it('can parse multiple results correctly', function() {
        var result = parse(log, '1^XRay^XRAY^n' + '\r\n' + '2^YRay^YRAY^y' + '\r\n' + '3^ZRay^ZRAY^' + '\r\n');

        expect(result).to.eql([
            {
                'ien': '1',
                'name': 'XRay',
                'synonym': 'XRAY',
                'special': 'n'
            },
            {
                'ien': '2',
                'name': 'YRay',
                'synonym': 'YRAY',
                'special': 'y'
            },
            {
                'ien': '3',
                'name': 'ZRay',
                'synonym': 'ZRAY',
                'special': ''
            }
        ]);
    });

    it('can parse empty results', function() {
        var result = parse(log, '');

        expect(result).to.eql([]);
    });
});
