'use strict';

var versionCompare = require('./version-compare').versionCompare;

var pagesize1k = [
    '2.0.rc201.157',
    '2.0.rc201.158',
    '2.0.rc202.160',
    '2.0.rc202.161',
    '2.0.rc202.163',
    '2.0.rc202.164',
    '2.0.rc202.167',
    '2.0.rc202.171',
    '2.0.rc202.175',
    '2.0.rc202.176',
    '2.0.rc202.181',
    '2.0.rc202.182',
    '2.0.rc202.184',
    '2.0.rc203.185',
    '2.0.rc203.189',
    '2.0.rc203.192',
    '2.0.rc203.193',
    '2.0.rc203.202',
    '2.0.rc203.205',
    '2.0.rc203.206',
    '2.0.rc204.208',
    '2.0.rc204.213',
    '2.0.rc204.215'
];

describe('Version compare', function() {
    it('works with equal length strings', function() {
        var input = ['1.2.3', '4.5.6'];
        var expectedOutput = ['4.5.6', '1.2.3'];
        var output = input.sort(versionCompare);

        expect(output).to.eql(expectedOutput);
    });

    it('works with inequal length strings', function() {
        var input = ['1.2.3', '4.5.6', '3.5.0.1', '0'];    describe('Version compare', function() {
    it('works with equal length strings', function() {
        var input = ['1.2.3', '4.5.6'];
        var expectedOutput = ['4.5.6', '1.2.3'];
        var output = input.sort(versionCompare);

        expect(output).to.eql(expectedOutput);
    });

    it('works with inequal length strings', function() {
        var input = ['1.2.3', '4.5.6', '3.5.0.1', '0'];
        var expectedOutput = ['4.5.6', '3.5.0.1', '1.2.3', '0'];
        var output = input.sort(versionCompare);

        expect(output).to.eql(expectedOutput);
    });

    it('ignores non-number characters', function() {
        var input = ['1.2.rc3', '4.release5.6', '3.r-c5.0.1', '0'];
        var expectedOutput = ['4.release5.6', '3.r-c5.0.1', '1.2.rc3', '0'];
        var output = input.sort(versionCompare);

        expect(output).to.eql(expectedOutput);
    });

    it('works with large inputs', function() {
        var firstOutput = pagesize1k.sort(versionCompare)[0];
        expect(firstOutput).to.eql('2.0.rc204.215');
    });

    it('works with .x versions with same major version', function() {
        var input = ['2.0.rc217-staging.10', '2.x.0.10'];
        var expectedOutput = ['2.x.0.10', '2.0.rc217-staging.10'];
        var output = input.sort(versionCompare);

        expect(output).to.eql(expectedOutput);
    });

    it('does not break when given empty string', function() {
        var input = ['', '2.x.0.10'];
        var expectedOutput = ['', '2.x.0.10'];
        var output = input.sort(versionCompare);

        expect(output).to.eql(expectedOutput);
    });
});
        var expectedOutput = ['4.5.6', '3.5.0.1', '1.2.3', '0'];
        var output = input.sort(versionCompare);

        expect(output).to.eql(expectedOutput);
    });

    it('ignores non-number characters', function() {
        var input = ['1.2.rc3', '4.release5.6', '3.r-c5.0.1', '0'];
        var expectedOutput = ['4.release5.6', '3.r-c5.0.1', '1.2.rc3', '0'];
        var output = input.sort(versionCompare);

        expect(output).to.eql(expectedOutput);
    });

    it('works with large inputs', function() {
        var firstOutput = pagesize1k.sort(versionCompare)[0];
        expect(firstOutput).to.eql('2.0.rc204.215');
    });

    it('works with .x versions with same major version', function() {
        var input = ['2.0.rc217-staging.10', '2.x.0.10'];
        var expectedOutput = ['2.x.0.10', '2.0.rc217-staging.10'];
        var output = input.sort(versionCompare);

        expect(output).to.eql(expectedOutput);
    });

    it('does not break when given empty string', function() {
        var input = ['', '2.x.0.10'];
        var expectedOutput = ['', '2.x.0.10'];
        var output = input.sort(versionCompare);

        expect(output).to.eql(expectedOutput);
    });
});
