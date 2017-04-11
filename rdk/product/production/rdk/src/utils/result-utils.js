'use strict';

var rdk = require('../core/rdk');
var _ = require('lodash');
var nullchecker = rdk.utils.nullchecker;
var jdsFilter = require('jds-filter');

function sortResults(items, orderString) {

    if (!_.isArray(items) || items.length < 2 || nullchecker.isNullish(orderString)) {
        return items;
    }

    var sortField = null;
    var sortDir = null;

    var groups = orderString.split(/\s+/);
    sortField = groups[0];
    if (groups.length > 1) {
        sortDir = groups[1].toLowerCase();
    }
    // if direction is missing or invalid, default to 'asc' sort
    sortDir = sortDir === 'desc' ? sortDir : 'asc';

    if (!nullchecker.isNullish(sortField) && !nullchecker.isNullish(sortDir)) {
        var left, right, result;
        items.sort(function(leftItem, rightItem) {

            // Use === to compare the elements (handles primitives but not objects)
            // treat undefined/null as being < any defined value
            left = leftItem[sortField];
            right = rightItem[sortField];
            result = 0;

            // compare assuming ascending sort
            if (left === undefined || left === null) {
                result = -1;
            } else if (right === undefined || right === null) {
                result = 1;
            } else if (left < right) {
                result = -1;
            } else if (left === right) {
                result = 0;
            } else {
                result = 1;
            }

            // if descending, reverse result
            if (sortDir === 'desc') {
                result *= -1;
            }
            return result;
        });
    }
    return items;
}

function filterResults(results, filterObject) {
    if (!_.isObject(results) || !_.isObject(results.data) ||
        !_.isArray(results.data.items) || nullchecker.isNullish(filterObject)) {
        return results;
    }

    var items = results.data.items;
    var startingItemCount = results.data.currentItemCount;

    if (startingItemCount) {
        var calculatedCurrentCount = items.length;
        if (calculatedCurrentCount !== startingItemCount) {
            startingItemCount = 0; //if we don't match the count we got from JDS, we won't try to update it
        }
    }

    items = jdsFilter.applyFilters(filterObject, results.data.items);

    if (startingItemCount > 0) {
        var calculatedEndCount = items.length;
        if (startingItemCount > calculatedEndCount) {
            //if items were indeed filtered out, change the count
            results.data.currentItemCount = calculatedEndCount;
        }
    }

    delete results.data.items;
    results.data.items = items;

    return results;
}

/**
 *  Unescapes special characters from string fields
 *
 *  @param items: array of models (objects)
 *  @param fields: array of field names that should be unescaped (use dot notation for nested objects)
 *      fields example: [ 'description', 'instanceName', 'navigation.parameters.clinicalObject']
 *  When no specific fields are provided, every string property (from the first level of the object only!) is unescaped
 *  @return array of models with unescaped string fields
 */
function unescapeSpecialCharacters(items, fields) {
    var hasFields = _.isArray(fields) && fields.length > 0;

    _.each(items, function(item, index, list) {
        if (hasFields) {
            _.each(fields, function(field) {
                var value = _.get(item, field);
                if (_.isString(value)) {
                    _.set(item, field, _.unescape(convertHexEscapeCodes(value)));
                }
            });
        } else {
            list[index] = _.mapValues(item, function(value, key) {
                if (_.isString(value)) {
                    return _.unescape(convertHexEscapeCodes(value));
                }
                return value;
            });
        }
    });

    return items;
}

function convertHexEscapeCodes(str) {
    return str.replace(/&#x([a-f0-9]{2,3});/i, function(val, hexStr) {
        return (!_.isEmpty(hexStr) ? ('&#' + parseInt(hexStr, 16) + ';') : val);
    });
}

module.exports.unescapeSpecialCharacters = unescapeSpecialCharacters;
module.exports.sortResults = sortResults;
module.exports.filterResults = filterResults;
