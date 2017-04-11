'use strict';
var httpMocks = require('node-mocks-http');
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
        //Loop added so automated unit test runs will satisify the requirement to have a test case for DE6673.
        for (var i = 0; i < 10000; i++) {
            var roundLength = 4;
            var timer = new RdkTimer({
                'name': 'argon',
                'start': true,
                'roundTo': roundLength
            });

            timer.stop();

            expect(timer.elapsedMilliseconds).must.be.a.number();
            expect(String(timer.elapsedMilliseconds).split('.')[1].length).must.be.below(roundLength+1);
        }
    });
});
