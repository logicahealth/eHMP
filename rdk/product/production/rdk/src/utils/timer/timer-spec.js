'use strict';
var RdkTimer = require('./timer');

describe('Verify Timer', function() {
    it('created with valid name', function() {
        var timer = new RdkTimer({
            'name': 'argon'
        });

        expect(timer.beginning).must.be.undefined();
        expect(timer.name).to.be('argon');
    });

    it('created with a start param creates a beginning time', function() {
        var timer = new RdkTimer({
            'name': 'argon',
            'start': true
        });

        expect(timer.beginning).must.be.a.number();

        timer.stop();
    });

    it('stop calculates elapsed time', function() {
        var timer = new RdkTimer({
            'name': 'argon'
        });
        timer.start().stop();

        expect(timer.end).must.be.a.number();
        expect(timer.elapsedMilliseconds).must.be.a.number();
        expect(timer.elapsedMilliseconds).must.be.above(-1);
    });

    it('can round elapsed time', function() {
        var roundLength = 4;
        var timer = new RdkTimer({
            'name': 'argon',
            'start': true,
            'roundTo': roundLength
        });

        timer.stop();

        expect(timer.elapsedMilliseconds).must.be.a.number();
        expect(String(timer.elapsedMilliseconds).split('.')[1].length).must.be.lte(roundLength);
    });
});
