'use strict';

var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');

var sortFHIRMap = {
    date: ['appliesDateTime'],
    identifier: ['identifier', 'value'],
    patient: ['subject', 'reference'],
    performer: ['performer', 'display']
};

function sortBy(list, params) {
    var sortField;
    var sortDesc = false; // sort defaults to ascending order

    if (nullchecker.isNotNullish(params._sort)) {
        sortField = params._sort;
    } else if (nullchecker.isNotNullish(params['_sort:asc'])) {
        sortField = params['_sort:asc'];
    } else if (nullchecker.isNotNullish(params['_sort:desc'])) {
        sortField = params['_sort:desc'];
        sortDesc = true;
    }

    var pathToProp = sortFHIRMap[sortField];
    if (nullchecker.isNullish(pathToProp)) {
        // sort field is not in map, return list as is
        return list;
    }

    return _.sortBy(list, pathToProp);
}

module.exports.sortBy = sortBy;
