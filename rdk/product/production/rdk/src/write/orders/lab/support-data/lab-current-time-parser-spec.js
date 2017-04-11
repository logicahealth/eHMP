'use strict';

var log = sinon.stub(require('bunyan').createLogger({
    name: 'lab-current-time-parser'
}));

var parseRpcData = require('./lab-current-time-parser').parseCurrentTime;

describe('verify lab current time parser', function() {

    it('parse undefined data', function() {
        expect(function() {
            parseRpcData(log, undefined);
        }).to.throw(Error);
    });

    it('parse data with with blank fields', function() {
        expect(function() {
            parseRpcData(log, '');
        }).to.throw(Error);
    });

    it('parse valid RPC data', function() {
        var result = parseRpcData(log, '3150702.1940');
        expect(result).to.eql([{
            'currentTime': '20150702194000'
        }]);
    });

});
