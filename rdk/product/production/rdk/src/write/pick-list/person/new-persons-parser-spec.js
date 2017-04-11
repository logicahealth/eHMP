/*global sinon, describe, it */
'use strict';

var parse = require('./new-persons-parser').parse;

var log = sinon.stub(require('bunyan').createLogger({ name: 'new-persons-parser' }));
//var log = require('bunyan').createLogger({ name: 'new-persons-parser' }); //Uncomment this line (and comment above) to see output in IntelliJ console

describe('unit test to validate new-persons', function() {
    it('can parse the RPC data correctly', function () {
    	/* jshint -W109 */
        var result = parse(log, '11272^Access,New' + '\r\n' +
                                '10000000246^Analyst,Pat^- COMPUTER SPECIALIST' + '\r\n' +
                                '10000000266^Analyst,Poonam^- COMPUTER SPECIALIST^M.D.' + '\r\n' +
                                '10000000229^Anesthesiologist,One^- ANESTHESIOLOGIST^M.D.^Another Field' + '\r\n' +
                                '20332^Atl,Student^- INFORMATION RESOURCE MGMT' + '\r\n');

        expect(result).to.eql([
            {
                "code": "11272",
                "name": "Access,New"
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
                "code": "20332",
                "name": "Atl,Student",
                "title": "- INFORMATION RESOURCE MGMT"
            }
        ]);
		/* jshint +W109 */
    });
});
