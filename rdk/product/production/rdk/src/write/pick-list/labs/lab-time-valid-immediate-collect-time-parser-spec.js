/*global sinon, describe, it */
'use strict';

var parse = require('./lab-time-valid-immediate-collect-time-parser').parse;

var log = sinon.stub(require('bunyan').createLogger({ name: 'lab-time-valid-immediate-collect-time-parser' }));
//var log = require('bunyan').createLogger({ name: 'lab-time-valid-immediate-collect-time-parser' }); //Uncomment this line (and comment above) to see output in IntelliJ console

describe('unit test to validate lab-time-valid-immediate-collect-time', function() {
    it('can parse the RPC data correctly with an invalid time', function () {
    	/* jshint -W109 */
        var result = parse(log, '0^MUST BE 5 MINUTES IN THE FUTURE' + '\r\n');

        expect(result).to.eql({
            "valid": false,
            "message": "MUST BE 5 MINUTES IN THE FUTURE"
        });
		/* jshint +W109 */
    });

    it('can parse the RPC data correctly with a valid time', function () {
        /* jshint -W109 */
        var result = parse(log, '1^DATE/TIME ACCEPTED' + '\r\n');

        expect(result).to.eql({
            "valid": true,
            "message": "DATE/TIME ACCEPTED"
        });
        /* jshint +W109 */
    });

    it('can parse the RPC data correctly when only a code is returned', function () {
        /* jshint -W109 */
        var result = parse(log, '0' + '\r\n');

        expect(result).to.eql({
            "valid": false,
            "message": ""
        });
        /* jshint +W109 */
    });
});
