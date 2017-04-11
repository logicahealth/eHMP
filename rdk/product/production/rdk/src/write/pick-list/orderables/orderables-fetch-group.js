'use strict';

var _ = require('lodash');
var async = require('async');
var validate = require('./../utils/validation-util');

var fetchIndividualPickList = require('../pick-list-resources').fetchIndividualPickList;

var subtypes = {
    labOrderables: 'lab',
    quickOrders: 'quick',
    favorites: 'fav',
    orderSets: 'set',
    enterpriseOrderables: 'entr'
};

function defaultCompare(a, b) {
    return a < b ? -1 : (a > b ? 1 : 0);
}

function getLowerCaseName(item) {
    return _.get(item, 'name') ? item.name.toLowerCase() : '';
}

function checkSubtype(subtype, toCheckFor) {
    if (subtype === 'all') {
        return true;
    }

    var splitSubtypes = subtype.split(':');
    return _.some(splitSubtypes, function(splitSubtype) {
        return splitSubtype === toCheckFor;
    });
}

module.exports.fetchGroup = function(req, callback) {
    var searchString = req.param('searchString');
    if (validate.isStringNullish(searchString)) {
        searchString = '';
    }
    var subtype = req.param('subtype');
    if (validate.isStringNullish(subtype)) {
        subtype = 'all';
    } else {
        subtype = subtype.toLowerCase();
    }
    req.logger.debug('fetching pick-list group \'orderables\': searchString=' + searchString + ', subtype=' + subtype);

    var results = [];

    function pushResultsAndCallBack(cb, type, err, data) {
        if (err) {
            return cb(err);
        }

        if (data && !data.statusCode) {
            _.each(data, function(item) {
                item.typeOfOrderable = type;
            });
            results.push(data);
        }
        cb();
    }

    function makeDummyResponse(type, next) {
        return {
            setHeader: function(k, v) {
                //no-op
            },
            status: function(statusCode) {
                var action = (statusCode >= 300) ? pushResultsAndCallBack.bind(null, next, type) : pushResultsAndCallBack.bind(null, next, type, null);
                return {
                    rdkSend: action
                };
            }
        };
    }

    function getDataFromLabOrderables(next) {
        req.query.labType = 'S.LAB';
        fetchIndividualPickList('lab-order-orderable-items', req, makeDummyResponse(subtypes.labOrderables, next));
    }

    function getDataFromQuickOrders(next) {
        fetchIndividualPickList('quick-orders', req, makeDummyResponse(subtypes.quickOrders, next));
    }

    function getDataFromFavorites(next) {
        fetchIndividualPickList('favorite-orderables', req, makeDummyResponse(subtypes.favorites, next));
    }

    function getDataFromOrderSets(next) {
        fetchIndividualPickList('order-sets', req, makeDummyResponse(subtypes.orderSets, next));
    }

    function getDataFromEnterpriseOrderables(next) {
        fetchIndividualPickList('enterprise-orderables', req, makeDummyResponse(subtypes.enterpriseOrderables, next));
    }

    var tasks = [];
    if (checkSubtype(subtype, subtypes.labOrderables)) {
        tasks.push(getDataFromLabOrderables);
    }
    if (checkSubtype(subtype, subtypes.quickOrders)) {
        tasks.push(getDataFromQuickOrders);
    }
    if (checkSubtype(subtype, subtypes.favorites)) {
        tasks.push(getDataFromFavorites);
    }
    if (checkSubtype(subtype, subtypes.orderSets)) {
        tasks.push(getDataFromOrderSets);
    }
    if (checkSubtype(subtype, subtypes.enterpriseOrderables)) {
        tasks.push(getDataFromEnterpriseOrderables);
    }

    async.waterfall(tasks, function(err) {
        if (err) {
            //Handle error
            return callback(err);
        }

        /**
         * Format and sort results
         *
         * When sorting, prioritize items with names that start with the search
         * criteria (DE4376).  This is the sort order used by CPRS.
         */
        results = _.flatten(results).sort(function(v1, v2) {
            var name1 = getLowerCaseName(v1);
            var name2 = getLowerCaseName(v2);
            var criteria = searchString.toLowerCase();
            var name1HasPriority = _.startsWith(name1, criteria);
            var name2HasPriority = _.startsWith(name2, criteria);

            if (name1HasPriority && !name2HasPriority) {
                return -1; // name1 should show up before name2
            }
            if (!name1HasPriority && name2HasPriority) {
                return 1; // name2 should show up before name1
            }
            return defaultCompare(name1, name2); // standard comparison
        });
        callback(null, results);
    });
};
