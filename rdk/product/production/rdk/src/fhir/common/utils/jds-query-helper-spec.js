'use strict';

var jds = require('./jds-query-helper');

describe('JDS Query Helper', function() {
    it('generates a correct JDS query - or (two operands)', function() {
        expect(jds.or('foo', 'bar')).to.eql('or(foo,bar)');
    });
    it('generates a correct JDS query - or (list of operands)', function() {
        expect(jds.or(['foo', 'bar', 'foobar'])).to.eql('or(foo,bar,foobar)');
    });
    it('generates a correct JDS query - and (two operands)', function() {
        expect(jds.and('foo', 'bar')).to.eql('and(foo,bar)');
    });
    it('generates a correct JDS query - and (list of operands)', function() {
        expect(jds.and(['foo', 'bar', 'foobar'])).to.eql('and(foo,bar,foobar)');
    });
    it('generates a correct JDS query - eq', function() {
        expect(jds.eq('foo', 'bar')).to.eql('eq(foo,bar)');
    });
    it('generates a correct JDS query - exists', function() {
        expect(jds.exists('foo')).to.eql('exists(foo)');
    });
    it('generates a correct JDS query - like', function() {
        expect(jds.like('foo', '%bar%')).to.eql('like(foo,%bar%)');
    });
    it('generates a correct JDS query - not', function() {
        expect(jds.not('foo')).to.eql('not(foo)');
    });
    it('generates a correct JDS query - lt', function() {
        expect(jds.lt('foo', 50)).to.eql('lt(foo,50)');
    });
    it('generates a correct JDS query - lte', function() {
        expect(jds.lte('foo', 50)).to.eql('lte(foo,50)');
    });
    it('generates a correct JDS query - gt', function() {
        expect(jds.gt('foo', 50)).to.eql('gt(foo,50)');
    });
    it('generates a correct JDS query - gte', function() {
        expect(jds.gte('foo', 50)).to.eql('gte(foo,50)');
    });
    it('generates a correct JDS query - dlt', function() {
        expect(jds.dlt('foo', 50)).to.eql('dlt(foo,50)');
    });
    it('generates a correct JDS query - dgte', function() {
        expect(jds.dgte('foo', 50)).to.eql('dgte(foo,50)');
    });
    it('generates a correct JDS query - dgt', function() {
        expect(jds.dgt('foo', 50)).to.eql('dgt(foo,50)');
    });
});
