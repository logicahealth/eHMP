/*global sinon, describe, it */
'use strict';

var parse = require('./progress-notes-titles-parser').parse;

var log = sinon.stub(require('bunyan').createLogger({ name: 'progress-notes-titles-parser' }));
//var log = require('bunyan').createLogger({ name: 'progress-notes-titles-parser' }); //Uncomment this line (and comment above) to see output in IntelliJ console

describe('unit test to validate progress-notes-titles', function() {
    it('can parse the RPC data correctly', function () {
        /* jshint -W109 */
        var result = parse(log, '' + '\r\n');

        expect(result).to.eql([]);
        /* jshint +W109 */
    });
});
