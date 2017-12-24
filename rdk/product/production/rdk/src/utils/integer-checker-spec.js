'use strict';

let synchronize = require('./integer-checker');

describe('integer-checker.js', function() {
    describe('isParsedToPositiveInteger()', function() {
        it('tests that undefined, null, empty string, boolean, object, and array return false', function() {
            expect(synchronize.isParsedToPositiveInteger()).to.equal(false);
            expect(synchronize.isParsedToPositiveInteger(null)).to.equal(false);
            expect(synchronize.isParsedToPositiveInteger('')).to.equal(false);
            expect(synchronize.isParsedToPositiveInteger(true)).to.equal(false);
            expect(synchronize.isParsedToPositiveInteger(false)).to.equal(false);
            expect(synchronize.isParsedToPositiveInteger({})).to.equal(false);
            expect(synchronize.isParsedToPositiveInteger([])).to.equal(false);
        });

        it('tests that floating point string and number return false', function() {
            expect(synchronize.isParsedToPositiveInteger(2134.1234)).to.equal(false);
            expect(synchronize.isParsedToPositiveInteger('2134.1234')).to.equal(false);
        });

        it('tests that integer string and number less than 1 return false', function() {
            expect(synchronize.isParsedToPositiveInteger(-2134.1234)).to.equal(false);
            expect(synchronize.isParsedToPositiveInteger('-2134.1234')).to.equal(false);
            expect(synchronize.isParsedToPositiveInteger(0)).to.equal(false);
            expect(synchronize.isParsedToPositiveInteger('0')).to.equal(false);
            expect(synchronize.isParsedToPositiveInteger(-0)).to.equal(false);
            expect(synchronize.isParsedToPositiveInteger('-0')).to.equal(false);
        });

        it('tests that integer string and number return true', function() {
            expect(synchronize.isParsedToPositiveInteger(2134)).to.equal(true);
            expect(synchronize.isParsedToPositiveInteger('2134')).to.equal(true);
        });
    });
});
