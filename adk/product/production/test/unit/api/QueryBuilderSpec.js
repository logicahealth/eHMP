/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

// Jasmine Unit Testing Suite
define(['api/QueryBuilder'], function (QueryBuilder) {
    'use strict';
    var Query = QueryBuilder._Query;

    describe('QueryBuilder.Query', function () {
        it('creates a valid query when args is a string array', function () {
            var clause = 'clause';
            var args = ['key', 'valueOne', 'valueTwo'];
            var expected = 'clause(key,"valueOne","valueTwo")';
            var query = new Query(clause, args);

            expect(query.toString()).toBe(expected);
        });

        it('creates a valid query when args is another query array', function () {
            var clauseOne = 'clauseOne';
            var clauseTwo = 'clauseTwo';
            var andClause = 'and';
            var strArgs = ['key', 'valueOne', 'valueTwo'];
            var queryOne = new Query(clauseOne, strArgs);
            var queryTwo = new Query(clauseTwo, strArgs);
            var args = [queryOne, queryTwo];
            var expected = 'and(clauseOne(key,"valueOne","valueTwo"),clauseTwo(key,"valueOne","valueTwo"))';
            var query = new Query(andClause, args);

            expect(query.toString()).toEqual(expected);
        });
    });

    describe('QueryBuilder.QueryBuilder', function () {
        var Filter = QueryBuilder.QueryBuilder;
        var filter;

        beforeEach(function () {
            filter = new Filter();
        });

        it('is constructed with no queries', function () {
            var expected = false;

            expect(filter.hasQueries()).toBe(expected);
        });

        it('creates a between filter', function () {
            var field = 'range';
            var start = 1;
            var end = 999;
            var query = filter.between(field, start, end);
            var expected = 'between(range,"1","999")';

            filter.add(query);
            expect(filter.toString()).toBe(expected);
        });

        it('creates a gte filter', function () {
            var field = 'top';
            var value = 1000;
            var query = filter.gte(field, value);
            var expected = 'gte(top,"1000")';

            filter.add(query);
            expect(filter.toString()).toBe(expected);
        });

        it('creates a lte filter', function () {
            var field = 'bottom';
            var value = 1000;
            var query = filter.lte(field, value);
            var expected = 'lte(bottom,"1000")';

            filter.add(query);
            expect(filter.toString()).toBe(expected);
        });

        it('creates a or filter', function () {
            var gte = filter.gte('top', 1000);
            var lte = filter.lte('bottom', 1000);
            var query = filter.or(gte, lte);
            var expected = 'or(gte(top,"1000"),lte(bottom,"1000"))';

            filter.add(query);
            expect(filter.toString()).toBe(expected);
        });

        it('creates an and filter', function () {
            var gte = filter.gte('top', 1000);
            var lte = filter.lte('bottom', 1000);
            var query = filter.and(gte, lte);
            var expected = 'and(gte(top,"1000"),lte(bottom,"1000"))';

            filter.add(query);
            expect(filter.toString()).toBe(expected);
        });

        it('creates an in filter', function () {
            var field = 'documents';
            var arr = ['Notes', 'Surgery', 'Labs'];
            var query = filter.in(field, arr);
            var expected = 'in(documents,["Notes","Surgery","Labs"])';

            filter.add(query);
            expect(filter.toString()).toBe(expected);
        });

        it('creates a not filter', function () {
            var field = 'documents';
            var arr = ['Notes', 'Surgery', 'Labs'];
            var inQuery = filter.in(field, arr);
            var query = filter.not(inQuery);
            var expected = 'not(in(documents,["Notes","Surgery","Labs"]))';

            filter.add(query);
            expect(filter.toString()).toBe(expected);
        });

        it('create a ne filter', function () {
            var field = 'status';
            var complete = 'complete';
            var query = filter.ne(field, complete);
            var expected = 'ne(status,"complete")';

            filter.add(query);
            expect(filter.toString()).toBe(expected);
        });

        it('can not create and clause', function () {
            var result = filter.createClause('and');
            var expected = false;

            expect(result).toBe(expected);
        });

        it('can create new clause', function () {
            var clause = 'myClause';
            var field = 'myField';
            var value = 'value';

            filter.createClause(clause);

            var query = filter[clause](field, value);
            var expected = 'myClause(myField,"value")';

            expect(query.toString()).toBe(expected);
        });

        it('will return false when trying to add a non query', function () {
            var result = filter.add('string');
            var expected = false;

            expect(result).toBe(expected);
        });

        it('can clear filters', function () {
            var field = 'range';
            var start = 1;
            var end = 999;
            var query = filter.between(field, start, end);
            var expected = false;

            filter.add(query);
            filter.clearFilters();

            expect(filter.hasQueries()).toBe(expected);
        });

        it('can create a date filter', function () {
            var field = 'dateTime';
            var start = '20000131';
            var end = '20101231';
            var betweenQuery = filter.dateFilter(field, start, end);
            var gteQuery = filter.dateFilter(field, start);
            var lteQuery = filter.dateFilter(field, null, end);
            var noQuery = filter.dateFilter(field);

            filter.add(betweenQuery);
            var between = filter.toString();

            filter.clearFilters();
            filter.add(gteQuery);
            var gte = filter.toString();

            filter.clearFilters();
            filter.add(lteQuery);
            var lte = filter.toString();

            var expectBetween = 'between(dateTime,"20000131","20101231")';
            var expectGte = 'gte(dateTime,"20000131")';
            var expectLte = 'lte(dateTime,"20101231")';
            var expectNo = false;

            expect(between).toBe(expectBetween);
            expect(gte).toBe(expectGte);
            expect(lte).toBe(expectLte);
            expect(noQuery).toBe(expectNo);
        });

        it('can create a filter object', function () {
            var field = 'range';
            var start = 1;
            var end = 999;
            var query = filter.between(field, start, end);
            var expected = 'between(range,"1","999")';

            filter.add(query);
            var criteriaObject = filter.getCriteria();
            var results = criteriaObject.filter;

            expect(results).toBe(expected);
        });

        it('can create a complex filter', function () {
            var field = 'dateTime';
            var start = '20000131';
            var end = '20101231';
            var betweenQuery = filter.dateFilter(field, start, end);
            var gteQuery = filter.dateFilter(field, start);
            var lteQuery = filter.dateFilter(field, null, end);

            filter.add(betweenQuery);
            filter.add(gteQuery);
            filter.add(lteQuery);

            var expectedArr = [];
            expectedArr.push('between(dateTime,"20000131","20101231")');
            expectedArr.push('gte(dateTime,"20000131")');
            expectedArr.push('lte(dateTime,"20101231")');
            var expected = expectedArr.join(',');

            expect(filter.toString()).toBe(expected);
        });
    });

    describe('QueryBuilder.RangeBuilder', function () {
        var Range = QueryBuilder.RangeBuilder;
        var from = '20001231';
        var to = '20101231';
        var range;

        beforeEach(function () {
            range = new Range();
        });

        it('it is constructed with no range', function () {
            var emptyFrom = _.isEmpty(range._fromDate);
            var emptyTo = _.isEmpty(range._toDate);

            expect(emptyFrom).toBe(true);
            expect(emptyTo).toBe(true);
            expect(range.isSet).toBe(false);
        });

        it('sets a date', function () {
            range.setRange(from, to);

            expect(range._fromDate).toBe(from);
            expect(range._toDate).toBe(to);
            expect(range.isSet).toBe(true);
        });

        it('creates a range string', function () {
            var checkStr;
            var expected = from + '..' + to;

            range.setRange(from, to);
            checkStr = range.toString();

            expect(checkStr).toBe(expected);
        });

        it('does not set range if missing form or to date', function () {
            var noDates = range.setRange();
            var noFrom = range.setRange(null, to);
            var noTo = range.setRange(from);

            expect(noDates).toBe(false);
            expect(noFrom).toBe(false);
            expect(noTo).toBe(false);
        });

        it('returns a criteria object with get criteria', function () {
            var checkObj;
            var expected = {range: from + '..' + to};

            range.setRange(from, to);
            checkObj = range.getCriteria();

            expect(checkObj).toEqual(expected);
        });

        it('clears the values when reset is called', function () {
            range.setRange(from, to);
            range.reset();

            var emptyFrom = _.isEmpty(range._fromDate);
            var emptyTo = _.isEmpty(range._toDate);

            expect(emptyFrom).toBe(true);
            expect(emptyTo).toBe(true);
            expect(range.isSet).toBe(false);
        });
    });

    describe('QueryBuilder.TextFilterBuilder', function () {
        var filter;

        beforeEach(function () {
            filter = new QueryBuilder.TextFilterBuilder();
        });

        it('it creates an empty text filter builder', function () {
            expect(_.isEmpty(filter._fields)).toBe(true);
            expect(_.isEmpty(filter._values)).toBe(true);
        });

        it('adds a field correctly', function () {
            var fieldName = 'testField';

            filter.addField(fieldName);

            expect(_.has(filter._fields, fieldName)).toBe(true);
        });

        it('adds multiple fields correctly', function () {
            var fields = ['testOne', 'testTwo'];

            filter.addFields(fields);

            expect(_.keys(filter._fields).length).toBe(2);
            expect(_.has(filter._fields, fields[0])).toBe(true);
            expect(_.has(filter._fields, fields[1])).toBe(true);
        });

        it('adds text value correctly', function () {
            var text = 'text';

            filter.addTextValue(text);

            expect(_.has(filter._values, text)).toBe(true);
        });

        it('adds two text values when space is present', function () {
            var text = 'text field';

            filter.addTextValue(text);

            expect(_.keys(filter._values).length).toBe(2);
            expect(_.has(filter._values, 'text')).toBe(true);
            expect(_.has(filter._values, 'field')).toBe(true);
        });

        it('adds multiple values from an array', function () {
            var textArr = ['text', 'with space'];

            filter.addTextValues(textArr);

            expect(_.keys(filter._values).length).toBe(3);
            expect(_.has(filter._values, 'text')).toBe(true);
            expect(_.has(filter._values, 'with')).toBe(true);
            expect(_.has(filter._values, 'space')).toBe(true);
        });

        it('removes a value from search terms', function () {
            var text = 'text';

            filter.addTextValue(text);
            filter.removeTextValue(text);

            expect(_.keys(filter._values).length).toBe(0);
            expect(_.has(filter._values, 'text')).toBe(false);
        });

        it('removes multiple terms when space is in term', function () {
            var text = 'with space';

            filter.addTextValue(text);
            filter.removeTextValue(text);

            expect(_.keys(filter._values).length).toBe(0);
            expect(_.has(filter._values, 'with')).toBe(false);
            expect(_.has(filter._values, 'space')).toBe(false);
            expect(_.has(filter._values, text)).toBe(false);
        });

        it('removes field from search', function () {
            var field = 'field';

            filter.addField(field);
            filter.removeField(field);

            expect(_.keys(filter._fields).length).toBe(0);
            expect(_.has(filter._fields, field)).toBe(false);
        });

        it('clears all fields from text filter', function () {
            filter.addField('one');
            filter.addField('two');
            filter.clearFields();

            expect(_.keys(filter._fields).length).toBe(0);
        });

        it('clears all text values from filter', function () {
            filter.addTextValue('one');
            filter.addTextValue('two three');
            filter.clearTextValues();

            expect(_.keys(filter._values).length).toBe(0);
        });

        it('clears everything from text filters', function () {
            filter.addField('one');
            filter.addField('two');
            filter.addTextValue('one');
            filter.addTextValue('two three');

            filter.clear();

            expect(_.keys(filter._fields).length).toBe(0);
            expect(_.keys(filter._values).length).toBe(0);
        });

        it('returns an array of text values', function () {
            var expected = ['one', 'two', 'three'];

            filter.addTextValue('one');
            filter.addTextValue('two three');

            var actual = filter.getFilterTextValues();

            expect(actual).toEqual(expected);
        });

        it('returns an array of filter values', function () {
            filter.addField('one');
            filter.addField('two');

            var expected = ['one', 'two'];
            var actual = filter.getFilterFields();

            expect(actual).toEqual(expected);
        });

        it('return filter text criteria', function () {
            filter.addField('fieldOne');
            filter.addField('fieldTwo');
            filter.addTextValue('textOne');
            filter.addTextValue('textTwo');

            var expected = {
                filterFields: ['fieldOne', 'fieldTwo'],
                filterList: ['textOne', 'textTwo']
            };
            var actual = filter.getCriteria();

            expect(actual).toEqual(expected);
        });

        it('clears all values and fields on reset', function () {
            filter.addField('field');
            filter.addTextValue('value');
            filter.reset();

            expect(_.keys(filter._fields).length).toBe(0);
            expect(_.keys(filter._values).length).toBe(0);
        });
    });

    describe('QueryBuilder.PageBuilder', function () {
        var page;

        beforeEach(function () {
            page = new QueryBuilder.PageBuilder();
        });

        it('creates a page build object', function () {
            expect(page.start).toBe(0);
            expect(page.limit).toBe(QueryBuilder.DEFAULT_PAGE_SIZE);
            expect(page.max).toBe(undefined);
        });

        it('sets page size', function () {
            var pageSize = QueryBuilder.DEFAULT_PAGE_SIZE - 10;

            var isSet = page.setPageSize(pageSize);

            expect(isSet).toBe(true);
            expect(page.limit).toBe(pageSize);
        });

        it('can not set negative page size', function () {
            var isSet = page.setPageSize(-100);

            expect(isSet).toBe(false);
            expect(page.limit).toBe(QueryBuilder.DEFAULT_PAGE_SIZE);
        });

        it('sets the next page', function () {
            page.next();
            expect(page.start).toBe(QueryBuilder.DEFAULT_PAGE_SIZE);

            page.next(100);
            expect(page.start).toBe(100);
        });

        it('sets the max value', function () {
            page.setMax(100);

            expect(page.max).toBe(100);
        });

        it('correctly reports when it has next', function () {
            page.setMax(10);
            page.setPageSize(11);

            var hasFirst = page.hasNext();

            page.next();

            var hasSecond = page.hasNext();

            expect(hasFirst).toBe(true);
            expect(hasSecond).toBe(false);
        });

        it('resets values', function () {
            page.setMax(1000);
            page.setPageSize(50);
            page.next();
            page.next();
            page.reset();

            expect(page.max).toBe(undefined);
            expect(page.start).toBe(0);
            expect(page.limit).toBe(QueryBuilder.DEFAULT_PAGE_SIZE);
        });

        it('returns criteria needed for jds', function () {
            page.setMax(1000);
            page.setPageSize(50);
            page.next();
            page.next();

            var expected = {
                start: 100,
                limit: 50
            };
            var actual = page.getCriteria();

            expect(actual).toEqual(expected);
        });
    });

    describe('QueryBuilder.NoTextBuilder', function () {
        var noText;

        beforeEach(function () {
            noText = new QueryBuilder.NoTextBuilder();
        });

        it('creates a no text builder', function () {
            expect(noText.notext).toBe(false);
        });

        it('can enable no text', function () {
            noText.enable();

            expect(noText.notext).toBe(true);
        });

        it('can disable no text', function () {
            noText.enable();
            noText.disable();

            expect(noText.notext).toBe(false);
        });

        it('gets jds criteria for no text', function () {
            var enabled, disabled;

            noText.enable();
            enabled = noText.getCriteria();

            noText.disable();
            disabled = noText.getCriteria();

            expect(enabled).toEqual({notext: true});
            expect(disabled).toEqual({});
        });
    });


    describe('QueryBuilder.SortKeyBuilder', function () {
        var sort;

        beforeEach(function () {
            sort = new QueryBuilder.SortKeyBuilder();
        });

        it('creates an empty sort builder', function () {
            expect(_.has(sort, 'order')).toBe(true);
            expect(_.has(sort, 'default')).toBe(true);
        });

        it('can set a default key', function () {
            var key = 'default';

            sort.setDefaultKey(key);

            expect(sort.default).toBe(key);
        });

        it('can set sort key', function () {
            var key = 'sortKey';

            sort.setSortKey(key);

            expect(sort.order).toBe(key);
        });

        it('can reset correctly', function () {
            var defaultKey = 'key';
            var currentKey = 'current';

            sort.setDefaultKey(defaultKey);
            sort.setSortKey(currentKey);
            sort.reset();

            expect(sort.default).toBe(defaultKey);
            expect(sort.order).toBe(defaultKey);
        });

        it('can get JDS criteria', function () {
            var defaultKey = 'key';
            var currentKey = 'current';

            sort.setDefaultKey(defaultKey);
            sort.setSortKey(currentKey);

            var expected = {order: currentKey};
            var actual = sort.getCriteria();

            expect(actual).toEqual(expected);
        });
    });

    describe('QueryBuilder.Criteria', function () {
        var criteria;
        var always;

        beforeEach(function () {
            criteria = new QueryBuilder.Criteria();
            always = {
                start: 0,
                limit: QueryBuilder.DEFAULT_PAGE_SIZE
            };
        });

        it('creates criteria object', function () {
            expect(_.has(criteria, 'Query')).toBe(true);
            expect(_.has(criteria, 'Range')).toBe(true);
            expect(_.has(criteria, 'TextFilter')).toBe(true);
            expect(_.has(criteria, 'Page')).toBe(true);
            expect(_.has(criteria, 'Order')).toBe(true);
            expect(_.has(criteria, 'NoText')).toBe(true);
        });

        it('can get criteria just query', function () {
            var query = criteria.Query.between('dateTime', '100', '1000');
            criteria.Query.add(query);

            var expected = _.extend({
                filter: 'between(dateTime,"100","1000")'
            }, always);
            var actual = criteria.getCriteria();

            expect(actual).toEqual(expected);
        });

        it('can get criteria just range', function () {
            criteria.Range.setRange('1', '999');

            var expected = _.extend({
                range: '1..999'
            }, always);
            var actual = criteria.getCriteria();

            expect(actual).toEqual(expected);
        });

        it('can get criteria for just TextFilter', function () {
            criteria.TextFilter.addTextValue('textOne');
            criteria.TextFilter.addField('fieldOne');

            var expected = _.extend({
                filterList: ['textOne'],
                filterFields: ['fieldOne']
            }, always);
            var actual = criteria.getCriteria();

            expect(actual).toEqual(expected);
        });

        it('can do criteria for just page', function () {
            criteria.Page.setMax(1000);
            criteria.Page.next();
            criteria.Page.next();

            var expected = {
                start: QueryBuilder.DEFAULT_PAGE_SIZE * 2,
                limit: QueryBuilder.DEFAULT_PAGE_SIZE
            };
            var actual = criteria.getCriteria();

            expect(actual).toEqual(expected);
        });

        it('can do criteria for just Order', function () {
            criteria.Order.setSortKey('key');

            var expected = _.extend({
                order: 'key'
            }, always);
            var actual = criteria.getCriteria();

            expect(actual).toEqual(expected);
        });

        it('can do critier for just no text', function () {
            criteria.NoText.enable();

            var expected = _.extend({
                notext: true
            }, always);
            var actual = criteria.getCriteria();

            expect(actual).toEqual(expected);
        });

        it('can do all criteria together', function () {
            var query = criteria.Query.between('dateTime', '100', '1000');
            criteria.Query.add(query);

            criteria.Range.setRange('1', '999');

            criteria.TextFilter.addTextValue('textOne');
            criteria.TextFilter.addField('fieldOne');

            criteria.Page.setMax(1000);
            criteria.Page.next();
            criteria.Page.next();

            criteria.Order.setSortKey('key');

            criteria.NoText.enable();

            var expected = {
                filter: 'between(dateTime,"100","1000")',
                range: '1..999',
                filterList: ['textOne'],
                filterFields: ['fieldOne'],
                start: QueryBuilder.DEFAULT_PAGE_SIZE * 2,
                limit: QueryBuilder.DEFAULT_PAGE_SIZE,
                notext: true,
                order: 'key'
            };

            var actual = criteria.getCriteria();

            expect(actual).toEqual(expected);
        });

        it('can reset all', function() {
            var query = criteria.Query.between('dateTime', '100', '1000');
            criteria.Query.add(query);

            criteria.Range.setRange('1', '999');

            criteria.TextFilter.addTextValue('textOne');
            criteria.TextFilter.addField('fieldOne');

            criteria.Page.setMax(1000);
            criteria.Page.next();
            criteria.Page.next();

            criteria.Order.setSortKey('key');

            criteria.NoText.enable();

            criteria.reset();

            var actual = criteria.getCriteria();

            expect(actual).toEqual(always);
        });
    });

});