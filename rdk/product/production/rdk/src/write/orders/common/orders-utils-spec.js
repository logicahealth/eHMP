'use strict';

var resource = require('./orders-utils');

describe('write-back orders utils', function() {
    it('tests that getStatusName returns correct status name', function() {
        expect(resource.getStatusName(11)).to.equal('UNRELEASED');
        expect(resource.getStatusName(13)).to.equal('CANCELLED');
    });

    it('tests that getStatusName returns default status name', function() {
        expect(resource.getStatusName(1000)).to.equal('UNDEFINED');
        expect(resource.getStatusName('surf')).to.equal('UNDEFINED');
        expect(resource.getStatusName('11')).to.equal('UNDEFINED');
    });

    it('tests that convertFileManDateToString returns correct date/time string', function() {
        expect(resource.convertFileManDateToString('3150810.0350')).to.equal('08/10/2015 03:50');
    });

    it('tests that getOrderActionCodes returns correct order action code', function() {
        expect(resource.getOrderActionCodes('sign')).to.equal('ES');
        expect(resource.getOrderActionCodes('SIGN')).to.equal('ES');
        expect(resource.getOrderActionCodes('discontinue')).to.equal('DC');
        expect(resource.getOrderActionCodes('DISconTInue')).to.equal('DC');
        expect(resource.getOrderActionCodes('Foo')).to.equal(null);
    });

});
