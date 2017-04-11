/*global sinon, describe, it */
'use strict';

var parse = require('./lab-times-available-parser').parse;

var log = sinon.stub(require('bunyan').createLogger({ name: 'lab-times-available-parser' }));
//var log = require('bunyan').createLogger({ name: 'lab-times-available-parser' }); //Uncomment this line (and comment above) to see output in IntelliJ console

describe('unit test to validate lab-times-available', function() {
    it('can parse the RPC data correctly', function () {
    	/* jshint -W109 */
        var result = parse(log, '0930\r\n1100\r\n1230\r\n1300\r\n1530\r\n1545\r\n1600\r\n1730\r\n');

        expect(result).to.eql([
            {
                "time": "0930"
            },
            {
                "time": "1100"
            },
            {
                "time": "1230"
            },
            {
                "time": "1300"
            },
            {
                "time": "1530"
            },
            {
                "time": "1545"
            },
            {
                "time": "1600"
            },
            {
                "time": "1730"
            }
        ]);
		/* jshint +W109 */
    });
});
