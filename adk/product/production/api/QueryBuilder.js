define(['underscore', 'api/SessionStorage', 'main/Utils'], function(_, SessionStorage, utils) {
    "use strict";

    /* global JSON */

    var DEFAULT_PAGE_SIZE = 40;

    /**
     * Primary Used by QueryBuilder. A data structure used to hold the information to build JDS style queries.
     * @param clause {String} The type of query
     * @param args {[String || Query]} The parameters of a Query
     * @constructor
     */
    var Query = function Query(clause, args) {
        this.clause = clause;
        this.args = args;
    };

    /**
     * Heart of the Query Class, builds the query.
     * Handles nested Queries.
     * @returns {string}
     */
    Query.prototype.toString = function queryBuilder() {
        var arr = [];
        if (_.isString(this.args[0])) {
            // We don't want to quote the first arg if it a string
            arr = [this.args.shift()];
        }
        var args = _.map(this.args, function clean(item) {
            if (item instanceof Query) {
                return item.toString();
            } else if (_.isArray(item)) {
                return JSON.stringify(item);
            } else {
                return [undefined, item, undefined].join('"');
            }
        });

        if (arr.length) {
            this.args.unshift(arr[0]);
        }
        return [this.clause, '(', arr.concat(args), ')'].join('');
    };


    /**
     * Used to create Queries to the JDS.  Supporting structure for fetchOptions.criteria.{filters, customFilters}
     * @constructor
     */
    var QueryBuilder = function QueryBuilder() {
        this._values = [];
    };

    /**
     * If the query builder has enough information to build a Query
     * @returns {boolean}
     */
    QueryBuilder.prototype.hasQueries = function hasQueries() {
        return !!this._values.length;
    };

    /**
     * Generates:  between(field,start,end)
     * @param field {String}
     * @param start {String}
     * @param end {String}
     * @returns {Query}
     */
    QueryBuilder.prototype.between = function between(field, start, end) {
        return new Query('between', [field, start, end]);
    };

    /**
     * Generates: gte(field,value)
     * @param field {String}
     * @param value {String}
     * @returns {Query}
     */
    QueryBuilder.prototype.gte = function gte(field, value) {
        return new Query('gte', [field, value]);
    };

    /**
     * Generates: lte(field,value)
     * @param field
     * @param value
     * @returns {Query}
     */
    QueryBuilder.prototype.lte = function lte(field, value) {
        return new Query('lte', [field, value]);
    };

    /**
     * Generates a `or` query which is a combination of the first and second query pasted to it
     * @param firstQuery {Query}
     * @param secondQuery {Query}
     */
    QueryBuilder.prototype.or = function or(firstQuery, secondQuery) {
        return new Query('or', [firstQuery, secondQuery]);
    };

    /**
     * Generates a `or` query which is a combination of the first and second query pasted to it
     * @param firstQuery {Query}
     * @param secondQuery {Query}
     */
    QueryBuilder.prototype.and = function and(firstQuery, secondQuery) {
        return new Query('and', [firstQuery, secondQuery]);
    };

    /**
     * Creates an Query in(field,[arr1,arr2,..,arrX])
     * @param field {String}
     * @param arr {Array}
     * @returns {Query}
     */
    QueryBuilder.prototype.in = function inQueryBuilder(field, arr) {
        var str = "[";
        _.each(arr, function(item) {
            str += [undefined, item, undefined].join('"');
        });
        str += "]";
        return new Query('in', [field, arr]);
    };

    /**
     * Warps a Query in not(Query)
     * @param query {Query}
     * @returns {Query}
     */
    QueryBuilder.prototype.not = function notQueryBuilder(query) {
        return new Query('not', [query]);
    };

    /**
     * Creates a ne(field,Query)
     * @param field {String}
     * @param query {Query|String}
     * @returns {Query}
     */
    QueryBuilder.prototype.ne = function ne(field, query) {
        return new Query('ne', [field, query]);
    };

    /**
     * Adds a new clause to the Query builder that can be called directly from the builder object.
     * @param clause {String}
     * @returns {boolean}
     */
    QueryBuilder.prototype.createClause = function(clause) {
        if (!_.isUndefined(this[clause])) {
            return false;
        }
        this[clause] = function(field, values) {
            return this.custom(clause, field, values);
        };
        return true;
    };

    /**
     * Creates a custom query in the format: clause(field, value[0], value[1], ..., value[i])
     * @param clause {String} Query name
     * @param field {String} What to search against
     * @param values {String || Array}
     * @returns {Query}
     */
    QueryBuilder.prototype.custom = function customQuery(clause, field, values) {
        if (!_.isArray(values)) {
            return new Query(clause, [field, values]);
        }
        return new Query(clause, [field].concat(values));
    };

    /**
     * Adds the query to the list to be build.
     * @param query
     * @returns {boolean}
     */
    QueryBuilder.prototype.add = function addQuery(query) {
        if (!(query instanceof Query)) {
            return false;
        }
        this._values.push(query);
        return true;
    };

    /**
     * Clears all existing queries from the list.
     * @returns {boolean}
     */
    QueryBuilder.prototype.clearFilters = function clearFilters() {
        this._values = [];
        return true;
    };

    /**
     * Creates a date filter based on the parameters it recieves.
     * @param field {String}
     * @param [start] {String} optional field.
     * @param [end] {String} optional field.
     * @returns {*}
     */
    QueryBuilder.prototype.dateFilter = function dateFilter(field, start, end) {
        if (!!start && !!end) {
            return this.between(field, start, end);
        } else if (!!start && !end) {
            return this.gte(field, start);
        } else if (!start && !!end) {
            return this.lte(field, end);
        } else {
            return false;
        }
    };

    /**
     * Creates a query based on the information stored in the Session globalDate variable.
     * @param field
     * @returns {*}
     */
    QueryBuilder.prototype.globalDateFilter = function globalDateFilter(field) {
        var globalDate = SessionStorage.getModel('globalDate');
        if (!!globalDate.get('selectedId')) {
            var fromDate = globalDate.get('fromDate');
            var toDate = globalDate.get('toDate');
            fromDate = utils.formatDate(fromDate, 'YYYYMMDD', 'MM/DD/YYYY');
            toDate = utils.formatDate(toDate, 'YYYYMMDD', 'MM/DD/YYYY') + '235959';
            return this.dateFilter(field, fromDate, toDate);
        }
        return false;
    };

    /**
     * Heart of the query builder, converts the Queries into string that can be used in the url.
     * @returns {string}
     */
    QueryBuilder.prototype.toString = function buildQueryString() {
        var stringArray = _.map(this._values, function appendFilter(item) {
            return item.toString();
        });
        return stringArray.join(",");
    };

    /**
     * Creates a Object with the filter string.
     * @returns {*}
     */
    QueryBuilder.prototype.getCriteria = function() {
        if (this._values.length) {
            return {
                filter: this.toString()
            };
        }
        return {};
    };

    /**
     * A wrapper for clearFilters because all builders have reset and getCriteria
     * @type {QueryBuilder.clearFilters|*}
     */
    QueryBuilder.prototype.reset = QueryBuilder.prototype.clearFilters;


    /**
     * Creates the range criteria filed
     * @constructor
     */
    var RangeBuilder = function() {
        this._fromDate = "";
        this._toDate = "";
        this.isSet = false;
    };

    /**
     * Creates the range string for query
     * @returns {string}
     */
    RangeBuilder.prototype.toString = function() {
        return this._fromDate + ".." + this._toDate;
    };

    /**
     * Sets the from and to date for the range.
     * @param fromDate {String}
     * @param toDate {String}
     */
    RangeBuilder.prototype.setRange = function setRange(fromDate, toDate) {
        if (_.isEmpty(fromDate) || _.isEmpty(toDate)) {
            return false;
        }
        this._fromDate = fromDate;
        this._toDate = toDate;
        this.isSet = true;
    };


    /**
     * Set the range from the global date filter
     * @returns {boolean}
     */
    RangeBuilder.prototype.createFromGlobalDate = function createFromGlobalDate() {
        var globalDate = SessionStorage.getModel('globalDate');
        if (!!globalDate.get('selectedId')) {
            var fromDate = globalDate.get('fromDate');
            var toDate = globalDate.get('toDate');
            fromDate = utils.formatDate(fromDate, 'YYYYMMDD', 'MM/DD/YYYY');
            toDate = utils.formatDate(toDate, 'YYYYMMDD', 'MM/DD/YYYY') + '235959';
            this.setRange(fromDate, toDate);
            return true;
        }
        return false;
    };

    /**
     * Gets the criteria object for range.  {range: RANGE}
     * @returns {*}
     */
    RangeBuilder.prototype.getCriteria = function getCriteria() {
        if (this.isSet) {
            return {
                range: this.toString()
            };
        }
        return {};
    };

    /**
     * Removes all saved data from the range.
     */
    RangeBuilder.prototype.reset = function reset() {
        this._fromDate = "";
        this._toDate = "";
        this.isSet = false;
    };


    /**
     * Creates the fields need for sending text filter criteria.
     * @constructor
     */
    var TextFilterBuilder = function() {
        this.defaultValues = [];
        this.defaultFields = [];
        this._values = {};
        this._fields = {};
    };

    /**
     * Sets the fields that the text filter will reset to when reset is called
     * @param defaultKey
     */
    TextFilterBuilder.prototype.setDefaultFields = function setDefaultFields(defaultFields) {
        this.defaultFields = defaultFields || this.defaultFields;
    };

    /**
     * Sets the fields that the text filter will reset to when reset is called
     * @param defaultKey
     */
    TextFilterBuilder.prototype.setDefaultValues = function setDefaultValues(defaultValues) {
        this.defaultValues = defaultValues || this.defaultValues;
    };

    /**
     * Goes back to the default text filter values
     */
    TextFilterBuilder.prototype.resetValues = function resetValues() {
        this._values = {};
        this.addTextValues(this.defaultValues);
    };

    /**
     * Goes back to the default text filter fields
     */
    TextFilterBuilder.prototype.resetFields = function resetFields() {
        this._fields = {};
        this.addFields(this.defaultFields);
    };

    /**
     * Goes back to the default text filter fields and values
     */
    TextFilterBuilder.prototype.reset = function reset() {
        this.resetFields();
        this.resetValues();
    };

    /**
     * Adds a field into the text filter.
     * @param fieldName {String} The JDS paramater to search against
     */
    TextFilterBuilder.prototype.addField = function addField(fieldName) {
        this._fields[fieldName] = true;
    };

    /**
     * Adds multiple fields into the text filter
     * @param fieldArray {Array} A list of fields to filter against.
     */
    TextFilterBuilder.prototype.addFields = function addFields(fieldArray) {
        _.each(fieldArray, function(value) {
            this.addField(value);
        }, this);
    };

    /**
     * Adds a text search term to filter values
     * @param valueStr {String}
     */
    TextFilterBuilder.prototype.addTextValue = function addValue(valueStr) {
        var arr = valueStr.split(' ');
        _.each(arr, function(value) {
            this._values[value] = true;
        }, this);
    };

    /**
     * Adds multiple text search terms to filter values
     * @param valueArray {Array}
     */
    TextFilterBuilder.prototype.addTextValues = function addValues(valueArray) {
        _.each(valueArray, function(value) {
            this.addTextValue(value);
        }, this);
    };

    /**
     * Removes a value from search terms
     * @param valueStr {String}
     */
    TextFilterBuilder.prototype.removeTextValue = function removeValue(valueStr) {
        var arr = valueStr.split(' ');
        _.each(arr, function(value) {
            if (_.has(this._values, value)) {
                delete this._values[value];
            }
        }, this);
    };

    /**
     * Removes a field from the text search
     * @param fieldName {String}
     */
    TextFilterBuilder.prototype.removeField = function removeField(fieldName) {
        if (_.has(this._fields, fieldName)) {
            delete this._fields[fieldName];
        }
    };

    /**
     * Removes multiple text search terms to filter values
     * @param valueStr {String}
     */
    TextFilterBuilder.prototype.removeTextValues = function removeValues(valueArray) {
        _.each(valueArray, function(value) {
            this.removeTextValue(value);
        }, this);
    };

    /**
     * Removes multiple text search terms to filter values
     * @param fieldName {String}
     */
    TextFilterBuilder.prototype.removeFields = function removeFields(fieldArray) {
        _.each(fieldArray, function(field) {
             this.removeField(field);
        }, this);
    };

    /**
     * Removes all fields from Text Filter
     */
    TextFilterBuilder.prototype.clearFields = function clearFields() {
        this._fields = {};
    };

    /**
     * Removes all values from Text Filter
     */
    TextFilterBuilder.prototype.clearTextValues = function clearValues() {
        this._values = {};
    };

    /**
     * Removes both the fields and values from the Text Filter
     */
    TextFilterBuilder.prototype.clear = function clear() {
        this.clearFields();
        this.clearTextValues();
    };

    /**
     * Gets an array of the text values currently stored.
     * @returns {Array|*}
     */
    TextFilterBuilder.prototype.getFilterTextValues = function() {
        return _.map(this._values, function(value, key) {
            return key;
        });
    };

    /**
     * Gets an array of the fields currently stored.
     * @returns {Array|*}
     */
    TextFilterBuilder.prototype.getFilterFields = function() {
        return _.map(this._fields, function(value, key) {
            return key;
        });
    };

    /**
     * Gets the text filter as needed by JDS criteria
     * @returns {*}
     */
    TextFilterBuilder.prototype.getCriteria = function getCriteria() {
        if (!_.isError(this._fields) && !_.isEmpty(this._values)) {
            return {
                filterList: this.getFilterTextValues(),
                filterFields: this.getFilterFields()
            };
        }
        return {};
    };

    /**
     * Controls the Criteria for paging on JDS
     * @constructor
     */
    var PageBuilder = function() {
        this.start = 0;
        this.limit = DEFAULT_PAGE_SIZE;
        this.max = undefined;
    };

    /**
     * The amount of items to get per page.
     * @param pageSize {Number}
     * @returns {boolean} True if pageSize is greater than zero
     */
    PageBuilder.prototype.setPageSize = function(pageSize) {
        if (pageSize > 0) {
            this.limit = pageSize;
            return true;
        }
        return false;
    };

    /**
     * Go to the next page.
     */
    PageBuilder.prototype.next = function next(nextStartIndex) {
        this.start = nextStartIndex || (this.start + this.limit);
    };

    /**
     * The maxiumn number of items available.  Used for has next.
     * @param maxValue
     */
    PageBuilder.prototype.setMax = function setMax(maxValue) {
        this.max = maxValue;
    };

    /**
     * True if max is set and there is another page avaliable
     * @returns {boolean}
     */
    PageBuilder.prototype.hasNext = function hasNext() {
        var max = this.max || 0;
        return this.start < max;
    };

    /**
     * Clears all fields for the page builder
     */
    PageBuilder.prototype.reset = function reset() {
        this.start = 0;
        this.max = undefined;
        this.limit = DEFAULT_PAGE_SIZE;
    };

    /**
     * Returns the fields needed for paging criteria on JDS
     * @returns {{start: *, limit: *}}
     */
    PageBuilder.prototype.getCriteria = function getCriteria() {
        return {
            start: this.start,
            limit: this.limit
        };
    };

    /**
     * Sets the No Text value.  To prevent Documents from returning the text field.
     * @constructor
     */
    var NoTextBuilder = function NoTextBuilder() {
        this.notext = false;
    };

    /**
     * Turns on the no text filter
     */
    NoTextBuilder.prototype.enable = function enable() {
        this.notext = true;
    };

    /**
     * Turns off the no text filter
     */
    NoTextBuilder.prototype.disable = function disable() {
        this.notext = false;
    };

    /**
     * Returns the JDS criteria need for no text
     * @returns {*}
     */
    NoTextBuilder.prototype.getCriteria = function getCriteria() {
        if (this.notext) {
            return {
                notext: true
            };
        }
        return {};
    };

    /**
     * Wrapper for disable because all builders have getCriteria and reset
     * @type {NoTextBuilder.disable|*}
     */
    NoTextBuilder.prototype.reset = NoTextBuilder.prototype.disable;


    /**
     * Build the key that the JDS sorts with
     * @param [defaultKey]
     * @constructor
     */
    var SortKeyBuilder = function SortKeyBuilder(defaultKey) {
        this.default = defaultKey;
        this.order = defaultKey;
    };


    /**
     * Sets the key that the sort will reset to when reset is called
     * @param defaultKey
     */
    SortKeyBuilder.prototype.setDefaultKey = function setDefaultKey(defaultKey) {
        this.default = defaultKey;
    };

    /**
     * Sets the current sort key
     * @param sortKey
     */
    SortKeyBuilder.prototype.setSortKey = function setSortKey(sortKey) {
        this.order = sortKey;
    };

    /**
     * Goes back to the default sort key
     */
    SortKeyBuilder.prototype.reset = function reset() {
        this.order = this.default;
    };

    /**
     * Creates the params that JDS needs for sort.
     */
    SortKeyBuilder.prototype.getCriteria = function getCriteria() {
        if (!_.isUndefined(this.order)) {
            return {
                order: this.order
            };
        }
        return {};
    };


    /**
     * Grouping object that holds all other builders.
     * Allows getCriteria and Reset to be called in one place across all builders
     * @constructor
     */
    var Criteria = function() {
        this.Query = new QueryBuilder();
        this.Range = new RangeBuilder();
        this.TextFilter = new TextFilterBuilder();
        this.Page = new PageBuilder();
        this.Order = new SortKeyBuilder();
        this.NoText = new NoTextBuilder();
    };

    /**
     * Returns the criteria needed by JDS
     * @returns {Object}
     */
    Criteria.prototype.getCriteria = function getCriteria() {
        var filter = this.Query.getCriteria();
        var range = this.Range.getCriteria();
        var page = this.Page.getCriteria();
        var text = this.TextFilter.getCriteria();
        var order = this.Order.getCriteria();
        var noText = this.NoText.getCriteria();

        return _.extend({}, filter, range, page, text, order, noText);
    };

    /**
     * Sets all builders back to defaults.
     */
    Criteria.prototype.reset = function reset() {
        this.Query.reset();
        this.Range.reset();
        this.TextFilter.reset();
        this.Page.reset();
        this.Order.reset();
        this.NoText.reset();
    };

    return {
        _Query: Query,
        QueryBuilder: QueryBuilder,
        RangeBuilder: RangeBuilder,
        TextFilterBuilder: TextFilterBuilder,
        PageBuilder: PageBuilder,
        SortKeyBuilder: SortKeyBuilder,
        NoTextBuilder: NoTextBuilder,
        Criteria: Criteria,
        DEFAULT_PAGE_SIZE: DEFAULT_PAGE_SIZE
    };
});