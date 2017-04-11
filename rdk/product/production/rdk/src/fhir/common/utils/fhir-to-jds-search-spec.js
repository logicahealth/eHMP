'use strict';

var fhirToJDSSearch = require('./fhir-to-jds-search');
var getDateOp = fhirToJDSSearch.getDateParamOp;

function createParams(_count, date) {
    return {
        _count: _count,
        date: date
    };
}

function validateCommon(params) {
    var isValid;
    fhirToJDSSearch.validateCommonParams(params,
        /*onSuccess*/
        function() {
            isValid = true;
        },
        /*onError*/
        function() {
            isValid = false;
        });
    return isValid;
}

function validateDate(params) {
    return validateMultipleDates(params, ['date']);
}

function validateMultipleDates(params, dateProperties) {
    if (!dateProperties) {
        return false; // to avoid false positives in the tests, fail if we forget to pass in dateProperties
    }

    var isValid;
    fhirToJDSSearch.validateDateParams(params, dateProperties,
        /*onSuccess*/
        function() {
            isValid = true;
        },
        /*onError*/
        function() {
            isValid = false;
        });
    return isValid;
}

function createObject(propName, value) {
    var obj = {};
    obj[propName] = value;
    return obj;
}

function createPairOfDates(date1Val, date2Val) {
    return {
        date1: date1Val,
        date2: date2Val
    };
}

function testSplit(dateParamStr, op, dateStr) {
    var tokens = fhirToJDSSearch.splitDateParam(dateParamStr);
    expect(tokens[0]).to.eql(op);
    expect(tokens[1]).to.eql(dateStr);
}

describe('fhirToJDSSearch Test', function() {
    describe(':: validateCommonParams', function() {
        it('validates _count parameter', function() {
            expect(validateCommon(createParams('1'))).to.be.truthy();
            expect(validateCommon(createParams('1101'))).to.be.truthy();
            expect(validateCommon(createParams('10s'))).to.be.falsy();
            expect(validateCommon(createParams('10.3'))).to.be.falsy();
        });
        it('validates _sort parameter', function() {
            expect(validateCommon(createObject('_sort', 'foo'))).to.be.truthy();
            // multiple _sort parameters are not supported
            expect(validateCommon(createObject('_sort:dsc', ['val1', 'val2']))).to.be.falsy();
        });
        it('validates sort criteria against a given map object', function() {
            var fhirToJDSMap = {
                fhirProp: 'jdsProp'
            };
            expect(fhirToJDSSearch.isSortCriteriaValid(createObject('_sort', 'fhirProp'), fhirToJDSMap)).to.be.truthy();
            expect(fhirToJDSSearch.isSortCriteriaValid(createObject('_sort', 'unmappedProp'), fhirToJDSMap)).to.be.falsy();
        });
        it('validates date parameter', function() {
            expect(validateDate(createParams(undefined, '2015'))).to.be.truthy();
            expect(validateDate(createParams(undefined, '2015-'))).to.be.falsy();
            expect(validateDate(createParams(undefined, '2015-01'))).to.be.truthy();
            expect(validateDate(createParams(undefined, '2015-01-'))).to.be.falsy();
            expect(validateDate(createParams(undefined, '2015-01-26'))).to.be.truthy();
            expect(validateDate(createParams(undefined, '2015-01-26T'))).to.be.falsy();
            expect(validateDate(createParams(undefined, '2015-01-26T20'))).to.be.falsy();
            expect(validateDate(createParams(undefined, '2015-01-26T20:'))).to.be.falsy();
            expect(validateDate(createParams(undefined, '2015-01-26T20:12'))).to.be.falsy();
            expect(validateDate(createParams(undefined, '2015-01-26T20:12:34'))).to.be.truthy();
            expect(validateDate(createParams(undefined, '2015-01-26T20:12:34Z'))).to.be.truthy();
            expect(validateDate(createParams(undefined, '>2015-01-26T20:12:34Z'))).to.be.truthy();
            expect(validateDate(createParams(undefined, '>=2015-01-26T20:12:34Z'))).to.be.truthy();
            expect(validateDate(createParams(undefined, '<2015-01-26T20:12:34Z'))).to.be.truthy();
            expect(validateDate(createParams(undefined, '<=2015-01-26T20:12:34Z'))).to.be.truthy();
            expect(validateDate(createParams(undefined, '=2015-01-26T20:12:34Z'))).to.be.falsy();
            expect(validateDate(createParams(undefined, '?2015-01-26T20:12:34Z'))).to.be.falsy();
            expect(validateDate(createParams(undefined, '!=2015-01-26T20:12:34Z'))).to.be.truthy();
            expect(validateDate(createParams(undefined, '!=2015-01-26'))).to.be.truthy();
            expect(validateDate(createParams(undefined, '<=2015-01-26'))).to.be.truthy();
            expect(validateDate(createParams(undefined, '>=2015-01-26'))).to.be.truthy();
            expect(validateDate(createParams(undefined, '>2015-01-26'))).to.be.truthy();
            expect(validateDate(createParams(undefined, '<2015-01-26'))).to.be.truthy();
            expect(validateDate(createParams(undefined, '<==2015-01-26'))).to.be.falsy();
            expect(validateDate(createParams(undefined, '!!2015-01-26'))).to.be.falsy();
            expect(validateDate(createParams(undefined, '==2015-01-26'))).to.be.falsy();
            expect(validateDate(createParams(undefined, '=!2015-01-26'))).to.be.falsy();
            expect(validateDate(createParams(undefined, '=>2015-01-26'))).to.be.falsy();
            expect(validateDate(createParams(undefined, '=<2015-01-26'))).to.be.falsy();
            expect(validateDate(createParams(undefined, ['2015-01-26', '2015-05-20']))).to.be.falsy();
            expect(validateDate(createParams(undefined, ['2015-01-26', '!=2015-05-20']))).to.be.falsy();
            expect(validateDate(createParams(undefined, ['2015-01-26', '>2015-05-20']))).to.be.falsy();
            expect(validateDate(createParams(undefined, ['<2015-01-26', '2015-05-20']))).to.be.falsy();
            expect(validateDate(createParams(undefined, ['>2015-01-26', '>2015-05-20']))).to.be.falsy();
            expect(validateDate(createParams(undefined, ['>2015-01-26', '>=2015-05-20']))).to.be.falsy();
            expect(validateDate(createParams(undefined, ['<2015-01-26', '<2015-05-20']))).to.be.falsy();
            expect(validateDate(createParams(undefined, ['<=2015-01-26', '<2015-05-20']))).to.be.falsy();
            expect(validateDate(createParams(undefined, ['<=2015-01-26', '>2015-05-20']))).to.be.truthy();
            expect(validateDate(createParams(undefined, ['>2015-01-26', '<2015-05-20']))).to.be.truthy();
            expect(validateDate(createParams(undefined, ['>2015-01-26', '<2015-01-26']))).to.be.truthy();
        });
        it('validates multiple dates', function() {
            expect(validateMultipleDates(createPairOfDates('2015-01-26', '2015-01'), ['date1', 'date2'])).to.be.truthy();
            expect(validateMultipleDates(createPairOfDates('?2015-01-26', '2015-01'), ['date1', 'date2'])).to.be.falsy();
            expect(validateMultipleDates(createPairOfDates(['2015-01-26', '2015-05-20'], '2015-01'), ['date1', 'date2'])).to.be.falsy();
            expect(validateMultipleDates(createPairOfDates('2015-01-26', ['<=2015-01-26', '>2015-05-20']), ['date1', 'date2'])).to.be.truthy();
            expect(validateMultipleDates(createPairOfDates(['>2015-01-26', '<2015-05-20'], ['<=2015-01-26', '>2015-05-20']), ['date1', 'date2'])).to.be.truthy();
        });
    });
    describe(':: date', function() {
        it('extracts date parameter operator (e.g. >, >=, <, <=', function() {
            expect(getDateOp('2015-01')).to.eql('');
            expect(getDateOp('>2015-01')).to.eql('>');
            expect(getDateOp('>2015-01-26')).to.eql('>');
            expect(getDateOp('>=2015-01-26')).to.eql('>=');
            expect(getDateOp('<2015-01-26')).to.eql('<');
            expect(getDateOp('<=2015-01-26')).to.eql('<=');
            expect(getDateOp('?2015-01-26')).to.eql('');
            expect(getDateOp('!=2015-01-26')).to.eql('!=');
            expect(getDateOp(null)).to.be.null();
        });
        it('splits date parameters into operator and date values', function() {
            testSplit('2015', undefined, '2015');
            testSplit('>2015', '>', '2015');
            testSplit('>=2015', '>=', '2015');
            testSplit('>=2015-01', '>=', '2015-01');
            testSplit('<2015-01-26', '<', '2015-01-26');
            testSplit('2015-01-26', undefined, '2015-01-26');
            testSplit('2015-01-26T20:15:23Z', undefined, '2015-01-26T20:15:23Z');
            testSplit('<2015-01-26T20:15:23', '<', '2015-01-26T20:15:23');
            testSplit('>=2015-01-26T20:15:23', '>=', '2015-01-26T20:15:23');
            testSplit('!=2015-01-26T20:15:23', '!=', '2015-01-26T20:15:23');
        });
        it('supports implicit date ranges', function() {
            expect(fhirToJDSSearch.buildDateQuery('', 'foo')).to.eql('');
            expect(fhirToJDSSearch.buildDateQuery('2004-03-30T21:31:00', 'foo')).to.eql('eq(foo,200403302131)');
            expect(fhirToJDSSearch.buildDateQuery('2004-03-30', 'foo')).to.eql('gte(foo,200403300000),lt(foo,200403310000)');
            expect(fhirToJDSSearch.buildDateQuery('2004-03', 'foo')).to.eql('gte(foo,200403010000),lt(foo,200404010000)');
            expect(fhirToJDSSearch.buildDateQuery('2004-02', 'foo')).to.eql('gte(foo,200402010000),lt(foo,200403010000)');
            expect(fhirToJDSSearch.buildDateQuery('2005-02', 'foo')).to.eql('gte(foo,200502010000),lt(foo,200503010000)');
            expect(fhirToJDSSearch.buildDateQuery('2005', 'foo')).to.eql('gte(foo,200501010000),lt(foo,200601010000)');
        });
        it('supports date operators', function() {
            expect(fhirToJDSSearch.buildDateQuery('2004-03-30T01:26:59', 'observed')).to.eql('eq(observed,200403300126)');
            expect(fhirToJDSSearch.buildDateQuery('2004-03-30', 'observed')).to.eql('gte(observed,200403300000),lt(observed,200403310000)');
            expect(fhirToJDSSearch.buildDateQuery('2004-03', 'observed')).to.eql('gte(observed,200403010000),lt(observed,200404010000)');
            expect(fhirToJDSSearch.buildDateQuery('2004', 'observed')).to.eql('gte(observed,200401010000),lt(observed,200501010000)');
            expect(fhirToJDSSearch.buildDateQuery('!=2004-03-30T01:26:59', 'observed')).to.eql('ne(observed,200403300126)');
            expect(fhirToJDSSearch.buildDateQuery('!=2004-03-30', 'observed')).to.eql('or(lt(observed,200403300000),gte(observed,200403310000))');
            expect(fhirToJDSSearch.buildDateQuery('!=2004-03', 'observed')).to.eql('or(lt(observed,200403010000),gte(observed,200404010000))');
            expect(fhirToJDSSearch.buildDateQuery('!=2004', 'observed')).to.eql('or(lt(observed,200401010000),gte(observed,200501010000))');
            expect(fhirToJDSSearch.buildDateQuery('>2004-03-30T01:26:59', 'observed')).to.eql('gt(observed,200403300126)');
            expect(fhirToJDSSearch.buildDateQuery('>2004-03-30', 'observed')).to.eql('gte(observed,200403310000)');
            expect(fhirToJDSSearch.buildDateQuery('>2004-03', 'observed')).to.eql('gte(observed,200404010000)');
            expect(fhirToJDSSearch.buildDateQuery('>2004', 'observed')).to.eql('gte(observed,200501010000)');
            expect(fhirToJDSSearch.buildDateQuery('>=2004-03-30T01:26:59', 'observed')).to.eql('gte(observed,200403300126)');
            expect(fhirToJDSSearch.buildDateQuery('>=2004-03-30', 'observed')).to.eql('gte(observed,200403300000)');
            expect(fhirToJDSSearch.buildDateQuery('>=2004-03', 'observed')).to.eql('gte(observed,200403010000)');
            expect(fhirToJDSSearch.buildDateQuery('>=2004', 'observed')).to.eql('gte(observed,200401010000)');
            expect(fhirToJDSSearch.buildDateQuery('<2004-03-30T01:26:59', 'observed')).to.eql('lt(observed,200403300126)');
            expect(fhirToJDSSearch.buildDateQuery('<2004-03-30', 'observed')).to.eql('lt(observed,200403300000)');
            expect(fhirToJDSSearch.buildDateQuery('<2004-03', 'observed')).to.eql('lt(observed,200403010000)');
            expect(fhirToJDSSearch.buildDateQuery('<2004', 'observed')).to.eql('lt(observed,200401010000)');
            expect(fhirToJDSSearch.buildDateQuery('<=2004-03-30T01:26:59', 'observed')).to.eql('lte(observed,200403300126)');
            expect(fhirToJDSSearch.buildDateQuery('<=2004-03-30', 'observed')).to.eql('lt(observed,200403310000)');
            expect(fhirToJDSSearch.buildDateQuery('<=2004-03', 'observed')).to.eql('lt(observed,200404010000)');
            expect(fhirToJDSSearch.buildDateQuery('<=2004', 'observed')).to.eql('lt(observed,200501010000)');
            expect(fhirToJDSSearch.buildDateQuery(['>2004-03-30T12:30:00', '<2004-03-30T22:50:00'], 'observed')).to.eql('gt(observed,200403301230),lt(observed,200403302250)');
            expect(fhirToJDSSearch.buildDateQuery(['>2004-03-30T12:30:00', '<2004-03-30T22:50:00'], 'observed')).to.eql('gt(observed,200403301230),lt(observed,200403302250)');
            expect(fhirToJDSSearch.buildDateQuery(['>2004-03-29', '<2004-03-30T22:50:00'], 'observed')).to.eql('gte(observed,200403300000),lt(observed,200403302250)');
            expect(fhirToJDSSearch.buildDateQuery(['>2004-03-29', '<2004-03-31'], 'observed')).to.eql('gte(observed,200403300000),lt(observed,200403310000)');
            expect(fhirToJDSSearch.buildDateQuery(['>=2004-03-30', '<2004-03-31'], 'observed')).to.eql('gte(observed,200403300000),lt(observed,200403310000)');
            expect(fhirToJDSSearch.buildDateQuery(['>=2004-03-30', '<=2004-03-30'], 'observed')).to.eql('gte(observed,200403300000),lt(observed,200403310000)');
        });
    });
});
