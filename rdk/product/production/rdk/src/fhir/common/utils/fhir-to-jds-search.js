'use strict';

var rdk = require('../../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var fhirUtils = require('./fhir-converter');
var jds = require('./jds-query-helper');

var JDSDateQueryOpMap = {
    '>': 'gt',
    '>=': 'gte',
    '<': 'lt',
    '<=': 'lte',
    get: function(op, forExclusiveDate) {
        var jdsOp = this[op];

        if (forExclusiveDate) {
            // overriding mapping for exclusive dates
            if (op === '>') {
                jdsOp = this['>='];
            } else if (op === '<=') {
                jdsOp = this['<'];
            }
        }
        return jdsOp ? jdsOp : 'eq'; // default to equal op (eq)
    }
};

// date and dateTime regex expressions (source: http://www.hl7.org/FHIR/2015May/datatypes.html#date)
var dateParamRegex = /^(>|<|>=|<=|!=)?([0-9]{4}(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1]))?)?)$/;
var dateTimeParamRegex = /^(>|<|>=|<=|!=)?([0-9]{4}(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?)?)?)?)$/;

var YYYY_MM_DD_HH_MM_SS_Regex = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[0-9]|[1-2][0-9]|3[0-1])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?$/;
var YYYY_MM_DD_Regex = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[0-9]|[1-2][0-9]|3[0-1])$/;
var YYYY_MM_Regex = /^[0-9]{4}-(0[1-9]|1[0-2])$/;
var YYYY_Regex = /^[0-9]{4}$/;

var validationErrors = {
    INVALID_COUNT: '_count value should be an integer.',
    TOO_MANY_SORT_PARAMS: 'Multiple _sort parameters are not supported.',
    INVALID_SORT: 'Invalid _sort value.',
    INVALID_DATE_RANGE: 'Invalid date range. An explicit bounded date range expects two date parameters with operators for each bound (greater-than, less-than).',
    INVALID_DATE: 'Invalid value for date paramater. See http://www.hl7.org/FHIR/2015May/datatypes.html#date for valid formats.',
    TOO_MANY_DATE_PARAMS: 'More than two date fields were specified. Date filter allows for a single specific or partial date-time, or a pair defining an upper and a lower bound.'
};

function isDate(dateStr) {
    return dateParamRegex.test(dateStr);
}

function isDateTime(dateStr) {
    return dateTimeParamRegex.test(dateStr);
}

function getDateParamOp(dateStr) {
    if (nullchecker.isNotNullish(dateStr)) {
        var matches = dateStr.match(/((>=|<=|>|<|!=)?).+/);
        return matches[1];
    }
    return null;
}

/**
 * Valid date filter values have the following pattern:
 *      {op}{date/dateTime}
 *
 * When split, the first token will be the op and the second
 * will be the iso date/dateTime.
 */
function splitDateParam(dateStr) {
    var tokens;

    if (isDate(dateStr)) {
        tokens = dateStr.match(dateParamRegex);
    } else if (isDateTime(dateStr)) {
        tokens = dateStr.match(dateTimeParamRegex);
    }
    return tokens ? tokens.slice(1, 3) : null;
}

/**
 * Checks for validity of common search params (non resource specific).
 */
function validateCommonParams(params, onSuccess, onError) {
    var countRegExp = /^\d+$/;
    var errors = [];

    // validate _count
    if (params._count) {
        // _count should be an integer
        if (!countRegExp.test(params._count)) {
            errors.push(validationErrors.INVALID_COUNT);
        }
    }
    // FHIR _sort param takes different forms (_sort=propName, _sort:asc=propName, _sort:dsc=propName) // this is reflected in the query as three different query parameters.
    if (hasMoreThanOneSortParameter(params)) {
        // FHIR supports multiple _sort parameters but JDS does not, so we allow only one _sort query parameter.
        errors.push(validationErrors.TOO_MANY_SORT_PARAMS);
    }
    if (errors.length > 0) {
        onError(errors);
    } else {
        onSuccess(); // all common parameters passed validation
    }
}

function hasMoreThanOneSortParameter(params) {
    return hasMoreThanOne(params._sort) ||
        hasMoreThanOne(params['_sort:asc']) ||
        hasMoreThanOne(params['_sort:dsc']) ||
        hasMoreThanOneSortVariant(params);
}

function hasMoreThanOneSortVariant(params) {
    return _.countBy(_.map([params._sort, params['_sort:asc'], params['_sort:dsc']], function(parameter) {
        return !!parameter;
    })).true > 1;
}

function hasMoreThanOne(a) {
    return _.isArray(a) && a.length > 1;
}

function validateDateParams(params, dateProperties, onSuccess, onError) {
    var errors = [];
    var allValid = _.every(dateProperties, function(datePropName) {
        var dateProp = params[datePropName];

        if (nullchecker.isNullish(dateProp)) {
            return true; // parameter not present, thus is not invalid.
        }
        // validate date (date | dateTime)
        // data params can be a single date parameter or an array with two dates for a range
        if (_.isArray(dateProp)) {
            var datePairValidationError = validateDateParamPair(dateProp);
            if (nullchecker.isNullish(datePairValidationError)) {
                return true; // No errors, thus valid.
            } else {
                errors.push(datePairValidationError);
                return false;
            }
        } else if (isValidDateParam(dateProp)) { // single date param
            return true;
        } else {
            errors.push(validationErrors.INVALID_DATE);
            return false;
        }
    });
    if (allValid) {
        onSuccess();
    } else {
        onError(errors);
    }
}

/**
 * Validates a date parameter pair.
 *
 * @param {Array} The list of date parameters to validate
 * @returns {String} Validation error
 */
function validateDateParamPair(dateParams) {
    var error = null;
    // If there is more than one date parameter then it we're doing an explicit bounded date range.
    // An explicit bounded date range expects two date parameters with operators for each bound (greater-than, less-than)
    if (dateParams.length === 2) {
        if (isValidDateParam(dateParams[0]) && isValidDateParam(dateParams[1])) {
            var operators = [getDateParamOp(dateParams[0]), getDateParamOp(dateParams[1])];
            // // operators must bound both ends of the date range (one lessThan the other greaterThan)
            var hasGreaterThan = false;
            var hasLessThan = false;
            _.forEach(operators, function(op) {
                if (/>|>=/.test(op)) {
                    hasGreaterThan = true;
                }
                if (/<|<=/.test(op)) {
                    hasLessThan = true;
                }
            });
            if (!hasGreaterThan || !hasLessThan) {
                error = validationErrors.INVALID_DATE_RANGE;
            }
        } else {
            error = validationErrors.INVALID_DATE;
        }
    } else {
        error = validationErrors.TOO_MANY_DATE_PARAMS;
    }
    return error;
}

function isValidDateParam(dateParam) {
    return isDate(dateParam) || isDateTime(dateParam);
}

function buildCodeAndSystemQuery(codeSystem) {
    var query;
    var codes = codeSystem.split(',');
    for (var i = 0; i < codes.length; i++) {
        var tokens = codes[i].split('|');
        if (tokens.length > 1) {
            if (i > 0) {
                query = jds.or(query, jds.and(buildSystemQuery(tokens[0]), buildCodeQuery(tokens[1])));
            } else {
                query = jds.and(buildSystemQuery(tokens[0]), buildCodeQuery(tokens[1]));
            }
        } else {
            if (i > 0) {
                query = jds.or(query, buildCodeQuery(tokens[0]));
            } else {
                query = buildCodeQuery(tokens[0]);
            }
        }
    }

    return query;
}

function buildCodeQuery(code) {
    return jds.eq('\"codes[].code\"', code);
}

function buildSystemQuery(system) {
    if (system === '') {
        return jds.not(jds.exists('\"codes[].system\"'));
    }
    return jds.eq('\"codes[].system\"', system);
}

function buildDateQuery(dateParam, jdsProperty, ignoreTime, includeSeconds) {
    var dateQuery = '';

    if (_.isArray(dateParam) && dateParam.length === 2) {
        // bounded explicit date range
        dateQuery = buildDatePairQuery(dateParam[0], dateParam[1], jdsProperty, ignoreTime, includeSeconds);
    } else {
        // single date param
        dateQuery = buildSingleDateQuery(dateParam, jdsProperty, ignoreTime, includeSeconds);
    }
    return dateQuery;
}

function buildSingleDateQuery(dateParam, jdsProperty, ignoreTime, includeSeconds) {
    var tokens = splitDateParam(dateParam);
    var dateQuery = '';

    if (tokens && tokens.length > 1) {
        var op = tokens[0];
        var dateStr = tokens[1];

        if (nullchecker.isNullish(op) || op === '!=') {
            // Depending on granularity of date this will be an exact search or an implicit range on the missing granularity.
            // A date that specifies year, month, date but not time will search for a range within that day (from 00:00 to 00:00 of the next day [exclusive]),
            // A date that specifies year, month, but not date, will search for a range within that month (from 1st day to the first day of the next month [exclusive]),
            // and so forth.
            // Note: JDS has a granularity of minutes.
            dateQuery = buildImplicitDateRangeQuery(dateStr, jdsProperty, op === '!=', ignoreTime, includeSeconds);
        } else {
            // There's an operator so we are doing an explicit unbounded range.
            dateQuery = buildExplicitDateQuery(dateParam, jdsProperty, ignoreTime, includeSeconds);
        }
    }
    return dateQuery;
}

function buildDatePairQuery(dateParam1, dateParam2, jdsProperty, ignoreTime) {
    return buildExplicitDateQuery(dateParam1, jdsProperty, ignoreTime) + ',' + buildExplicitDateQuery(dateParam2, jdsProperty, ignoreTime);
}

function buildExplicitDateQuery(dateParam, jdsProperty, ignoreTime, includeSeconds) {
    var tokens = splitDateParam(dateParam);
    var dateStr = tokens[1];
    var op = getDateParamOp(dateParam);
    var date;
    var isExclusiveDate;

    /**
     * If operator is <= or > and the date is partial, we need to find the end of that range.
     *
     * For Example:
     *
     * [date=<=2004-03-30] - In this case we want to search for items within that day or earlier so
     * the JDS query should be lt(jdsProperty, 200403310000).
     *
     * [date=>2004-03] - In this case we want to search for items after March 2004 so the JDS
     * query should be gte(jdsProperty, 200404010000).
     */
    if ((op === '<=' || op === '>') && !YYYY_MM_DD_HH_MM_SS_Regex.test(dateStr)) {
        var range = getDateRange(dateStr);
        date = range.exclusiveEnd;
        isExclusiveDate = true;
    } else {
        date = new Date(dateStr);
        isExclusiveDate = false;
    }
    return JDSDateQueryOpMap.get(tokens[0], isExclusiveDate) + '(' + jdsProperty + ',' + fhirUtils.convertDateToHL7V2(date, includeSeconds, ignoreTime) + ')';
}

/**
 * Returns a date range query that includes the missing date specificity (if any).
 *
 * A date that specifies year, month, date but not time will search for a range within that day (from 00:00 to 23:59),
 * a date that specifies year, month, but not date, will search for a range within that month (from 1st day to the last),
 * and so forth.
 *
 * Note: JDS has a granularity of minutes.
 *
 * Ex.
 * 2015-01-26T01:23:45  - Exact search
 * 2015-01-26           - Between 2015-01-26T00:00 and 2015-01-26T23:59 (inclusive)
 * 2015-01              - Between 2015-01-01T00:00 and 2015-01-31T23:59 (inclusive)
 * 2015                 - Between 2015-01-01T00:00 and 2015-12-31T23:59 (inclusive)
 */
function buildImplicitDateRangeQuery(dateStr, jdsProperty, isNegated, ignoreTime, includeSeconds) {
    var query = '';

    if (YYYY_MM_DD_HH_MM_SS_Regex.test(dateStr)) {
        // this is an exact match search
        query = getExactDateQuery(new Date(dateStr), jdsProperty, isNegated, ignoreTime, includeSeconds);
    } else {
        query = getDateRangeQuery(getDateRange(dateStr), jdsProperty, isNegated, ignoreTime, includeSeconds);
    }
    return query;
}

function getDateRange(dateStr) {
    var range;

    if (YYYY_MM_DD_Regex.test(dateStr)) {
        // day range
        range = _getDateRange(dateStr, 'day');
    } else if (YYYY_MM_Regex.test(dateStr)) {
        // month range
        range = _getDateRange(dateStr, 'month');
    } else if (YYYY_Regex.test(dateStr)) {
        // year range
        range = _getDateRange(dateStr, 'year');
    } else {
        range = _getDateRange(dateStr);
    }
    return range;
}

function getExactDateQuery(date, jdsProperty, isNegated, ignoreTime, includeSeconds) {
    var jdsOp = isNegated ? 'ne' : 'eq';
    return jdsOp + '(' + jdsProperty + ',' + fhirUtils.convertDateToHL7V2(date, includeSeconds, ignoreTime) + ')';
}

function getDateRangeQuery(range, jdsProperty, isNegated, ignoreTime, includeSeconds) {

    if (isNegated) {
        // when searching for a negated range, we search for either below OR above the date range
        return jds.or(jds.lt(jdsProperty, fhirUtils.convertDateToHL7V2(range.inclusiveStart, includeSeconds, ignoreTime)), jds.gte(jdsProperty, fhirUtils.convertDateToHL7V2(range.exclusiveEnd, includeSeconds, ignoreTime)));
    } else {
        // search within the range
        return jds.gte(jdsProperty, fhirUtils.convertDateToHL7V2(range.inclusiveStart, includeSeconds, ignoreTime)) + ',' + jds.lt(jdsProperty, fhirUtils.convertDateToHL7V2(range.exclusiveEnd, includeSeconds, ignoreTime));
    }
}

/**
 * Returns a date range where the start date is inclusive and
 * the end date is exclusive.
 */
function _getDateRange(dateStr, granularity) {
    var start = new Date(dateStr);
    var end = new Date(dateStr);

    switch (granularity) {
        case 'year':
            end.setUTCFullYear(end.getUTCFullYear() + 1);
            break;
        case 'month':
            end.setUTCMonth(end.getUTCMonth() + 1);
            break;
        case 'day':
            end.setUTCDate(end.getUTCDate() + 1);
            break;
    }
    return {
        inclusiveStart: start,
        exclusiveEnd: end
    };
}

function buildSearchQueryString(queries) {
    // assemble the search query
    if (queries.length > 0) {
        return 'filter=' + encodeURIComponent(queries.join(','));
    } else {
        return '';
    }
}

/**
 * Builds an array of query parts from the set of parameters that apply
 * to all resources.
 *
 * @param params {Object} Query parameters object
 * @param fhirToJDSSortMap {Object} FHIR to JDS sort criteria map for a particular domain.
 * @returns {Array} List of query parts.
 *
 * TODO: This will grow as we add support for other common parameters.
 */
function buildCommonQueryParams(params, fhirToJDSSortMap) {
    var query = [];

    // _count
    if (nullchecker.isNotNullish(params._count)) {
        query.push('limit=' + params._count);
    }
    // _sort
    var sortQuery = buildSortQuery(params, fhirToJDSSortMap);
    if (nullchecker.isNotNullish(sortQuery)) {
        query.push(sortQuery);
    }
    return query;
}

/**
 * Generates the JDS equivalent of the sort criteria.
 *
 * @param params {Object} Query parameters object.
 * @param fhirToJDSSortMap {Object} FHIR to JDS sort criteria map for a particular domain.
 * @returns {String} JDS sort query.
 */
function buildSortQuery(params, fhirToJDSSortMap) {
    var jdsCriteria;
    var queryStr;
    // FHIR _sort param takes different forms (_sort=propName, _sort:asc=propName, _sort:dsc=propName)
    // this is reflected in the query as three different query parameters
    if (nullchecker.isNotNullish(params._sort)) {
        jdsCriteria = fhirToJDSSortMap[params._sort];
        queryStr = 'order=' + jdsCriteria;
    } else if (nullchecker.isNotNullish(params['_sort:asc'])) {
        jdsCriteria = fhirToJDSSortMap[params['_sort:asc']];
        queryStr = 'order=' + jdsCriteria;
    } else if (nullchecker.isNotNullish(params['_sort:dsc'])) {
        jdsCriteria = fhirToJDSSortMap[params['_sort:dsc']];
        queryStr = 'order=' + jdsCriteria + '%20DESC';
    }
    return nullchecker.isNullish(jdsCriteria) ? null : queryStr;
}

/**
 * Converts a list of validation errors into a string formatted as a list.
 * Ex.
 * '
 * - Error #1.
 * - Error #2.
 * ...'
 */
function validationErrorsToString(errors) {
    return '\n\n- ' + errors.join('\n- ');
}

/**
 * Returns true if there's a sort parameter specified and its criteria has a mapped property.
 */
function isSortCriteriaValid(params, fhirToJDSSortMap) {
    if (nullchecker.isNotNullish(params._sort)) {
        return nullchecker.isNotNullish(fhirToJDSSortMap[params._sort]);
    } else if (nullchecker.isNotNullish(params['_sort:asc'])) {
        return nullchecker.isNotNullish(fhirToJDSSortMap[params['_sort:asc']]);
    } else if (nullchecker.isNotNullish(params['_sort:dsc'])) {
        return nullchecker.isNotNullish(fhirToJDSSortMap[params['_sort:dsc']]);
    } else {
        return true; // there's no _sort parameter, thus it is not invalid
    }
}

function buildJDSPath(basePath, searchQuery, params, fhirToJDSSortMap) {
    var jdsPath = basePath;
    var query = [];

    // search queries
    if (nullchecker.isNotNullish(searchQuery)) {
        query.push(searchQuery);
    }
    // common parameters
    query = query.concat(buildCommonQueryParams(params, fhirToJDSSortMap));

    // add filter queries to path
    if (query.length > 0) {
        jdsPath += '?' + query.join('&');
    }
    return jdsPath;
}

module.exports.isDate = isDate;
module.exports.isDateTime = isDateTime;
module.exports.getDateParamOp = getDateParamOp;
module.exports.splitDateParam = splitDateParam;
module.exports.validateCommonParams = validateCommonParams;
module.exports.validateDateParams = validateDateParams;
module.exports.buildDateQuery = buildDateQuery;
module.exports.buildJDSPath = buildJDSPath;
module.exports.buildCodeAndSystemQuery = buildCodeAndSystemQuery;
module.exports.buildSearchQueryString = buildSearchQueryString;
module.exports.buildCommonQueryParams = buildCommonQueryParams;
module.exports.validationErrorsToString = validationErrorsToString;
module.exports.buildSortQuery = buildSortQuery;
module.exports.isSortCriteriaValid = isSortCriteriaValid;
