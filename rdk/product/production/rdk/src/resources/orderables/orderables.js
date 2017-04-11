'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var async = require('async');
var nullchecker = rdk.utils.nullchecker;
var getVistaRpcConfiguration = require('../../utils/rpc-config').getVistaRpcConfiguration;
var labOrderables = require('./lab-orderables');
var radOrderables = require('./rad-orderables');

// below is a map - the keys are the domain names, the functions are what retrieve the orderables
var supportedDomains = {
    'lab': function(req, criteria, callback) {
        labOrderables.getOrderables(req, criteria, callback);
    },
    'rad': function(req, criteria, callback) {
        radOrderables.getOrderables(req, criteria, callback);
    }
};

var unsupportedDomainError = 'Unsupported domain. Supported domains are ' + _.keys(supportedDomains).join(', ') + '.';
var siteConfig;

function areAllDomainsValid(domains) {
    if (!_.isArray(domains)) {
        return isSupportedDomain(domains);
    }
    return _.every(domains, isSupportedDomain);
}

function isSupportedDomain(domain) {
    // a domain is not valid if not a key in the supported object
    return !domain || !!supportedDomains[domain];
}

/**
 * Searches for Orderables in Vista.
 *
 * @api {get} /resource/orderables?criteria=foo&domain=lab,rad Requests all orderables with domain 'lab' or 'rad' that starts with 'foo'
 *
 * @apiName Orderables
 *
 * @apiparam {string} criteria The text to search for.
 * @apiparam {string} domains The list of domains to search. Defaults to all domains.
 *
 * @apiSuccess (Success 200) {json} data containing results for the appropriate parameters.
 * @apiSuccessExample Success-Response:
 * {
 *   "data": {
 *     "items": [
 *       {
 *         "ien": "515",
 *         "synonym": "1,25-DIHYDROXYVIT D",
 *         "name": "1,25-DIHYDROXYVIT D",
 *         "type": "rad"
 *       },
 *       {
 *         "ien": "350",
 *         "synonym": "11-DEOXYCORTISOL",
 *         "name": "11-DEOXYCORTISOL",
 *         "type": "rad"
 *       },
 *       {
 *         "ien": "683",
 *         "synonym": "17-HYDROXYCORTICOSTEROIDS",
 *         "name": "17-HYDROXYCORTICOSTEROIDS",
 *         "type": "rad"
 *       },
 *       {
 *         "ien": "515",
 *         "synonym": "1,25-DIHYDROXYVIT D",
 *         "name": "1,25-DIHYDROXYVIT D",
 *         "type": "lab"
 *       },
 *       {
 *         "ien": "350",
 *         "synonym": "11-DEOXYCORTISOL",
 *         "name": "11-DEOXYCORTISOL",
 *         "type": "lab"
 *       },
 *       {
 *         "ien": "683",
 *         "synonym": "17-HYDROXYCORTICOSTEROIDS",
 *         "name": "17-HYDROXYCORTICOSTEROIDS",
 *         "type": "lab"
 *       }
 *     ]
 *  },
 *  "status": 200
 * }
 *
 * @apiError (Error 400) Bad Request
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *  "message": "Unsupported domain. Supported domains are lab, rad.",
 *  "status": 400
 * }
 */
function getOrderables(req, res, next) {
    req.logger.info('Orderables - resource GET called');

    var criteria = req.query.criteria;
    var domains = req.query.domains;

    req.logger.debug('criteria: ' + criteria);
    req.logger.debug('domains: ' + domains);

    if (_.isEmpty(domains)) {
        domains = _.keys(supportedDomains); //defaults are all entries in the map.
    } else {
        domains = domains.split(','); //if not default, make an array of what we have.
    }

    if (!areAllDomainsValid(domains)) {
        req.logger.error('Orderables - Unsupported domain in query: ' + domains);
        return res.status(rdk.httpstatus.bad_request).rdkSend(unsupportedDomainError);
    }

    var asyncFunctions = [];
    asyncFunctions = _.map(domains, function(domain) {
        return function(callback) {
            supportedDomains[domain](req, criteria, callback);
        };
    });

    async.parallel(asyncFunctions,
        function(error, data) {
            if (error) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(error);
            }
            var mergedList = mergeLists(data, domains);
            var responseBody = {
                data: {
                    items: mergedList
                }
            };
            return res.status(rdk.httpstatus.ok).rdkSend(responseBody);
        });

}

/*
 * Merge the Lab and Rad orderables lists
 *
 * @param {array} data List of lists (in order) of json objects containing orderables.
 * @param {array} list list of lists (in order) of json objects containing the names of the domains we're merging.
 */
function mergeLists(data, domains) {
    var merged = [];
    var index = 0;
    _.forEach(data, function(resultList, index) {
        tagAndMergeList(resultList, merged, domains[index]);
    });
    return merged;
}

/*
 *  Tags and merges the lab orderable items.
 *
 * @param {object} lab orderable list of json objects
 * @param {object} common list to be returned to the UI
 * @param {string} type identified with which the item will be labeled
 */
function tagAndMergeList(list, common, type) {
    if (nullchecker.isNullish(list)) {
        return;
    }
    _.forEach(list, function(item) {
        item.type = type;
        common.push(item);
    });
}

module.exports.getOrderables = getOrderables;
