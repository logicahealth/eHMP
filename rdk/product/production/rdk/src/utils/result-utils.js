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

module.exports.sortResults = sortResults;
module.exports.filterResults = filterResults;
