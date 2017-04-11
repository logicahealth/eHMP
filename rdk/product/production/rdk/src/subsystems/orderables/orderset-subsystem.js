'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var pjds = rdk.utils.pjdsStore;

var ORDER_SET_STORE = 'ordersets';
var SCOPE = {
    ENTERPRISE: 'enterprise',
    SITE: 'site',
    INDIVIDUAL: 'individual'
};
module.exports.constants = {};
module.exports.constants.ORDER_SET_STORE = ORDER_SET_STORE;
module.exports.constants.SCOPE = SCOPE;
module.exports.getSubsystemConfig = function(app, logger) {
    return {
        healthcheck: pjds.createHealthcheck(ORDER_SET_STORE, app, logger)
    };
};

/************************************************
 *
 * Helper Functions
 *
 ************************************************/
function _create(req, res, orderSet) {
    var pjdsOptions = {
        store: ORDER_SET_STORE,
        data: orderSet
    };
    pjds.post(req, res, pjdsOptions, function(error, result, headers) {
        if (error) {
            req.logger.error('OrderSet create: ', error);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Could not create OrderSet.');
        }
        // send back the newly created object with its assigned uid
        orderSet.uid = pjds.parseUid(headers.location);
        return res.status(rdk.httpstatus.created).rdkSend(orderSet);
    });
}

function _update(req, res, orderSet) {
    var pjdsOptions = {
        store: ORDER_SET_STORE,
        data: orderSet,
        key: req.param('uid')
    };
    pjds.put(req, res, pjdsOptions, function(error, result, headers) {
        if (error) {
            req.logger.error({error: error}, 'OrderSet update (uid:' + orderSet.uid + ')');
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Could not update OrderSet with uid: ' + orderSet.uid + '.');
        }
        return res.status(rdk.httpstatus.created).rdkSend(orderSet);
    });
}

function isValidOrderListItem(item) {
    if (_.isEmpty(item.uid) || _.isEmpty(item.type)) {
        return false;
    }
    return item.type !== 'orderable' || (_.includes(['lab', 'rad', 'med', 'consult'], item.domain) && !_.isEmpty(item.siteId));
}

function searchExactName(req, res, name, scope, siteId, createdBy, exceptUid, callback) {
    var filters = [];
    var pjdsOptions = {
        store: ORDER_SET_STORE
    };
    if (!_.isEmpty(name)) {
        filters.push(['eq', 'name', name]);
    }
    if (!_.isEmpty(scope)) {
        filters.push(['eq', 'scope', scope]);
    }
    if (!_.isEmpty(siteId)) {
        filters.push(['eq', 'siteId', siteId]);
    }
    if (!_.isEmpty(createdBy)) {
        filters.push(['eq', 'createdBy', createdBy]);
    }
    if (!_.isEmpty(exceptUid)) {
        filters.push(['ne', 'uid', exceptUid]);
    }
    if (!_.isEmpty(filters)) {
        pjdsOptions.filterList = filters;
    }
    pjds.get(req, res, pjdsOptions, callback);
}

function checkNameCollission(req, res, name, scope, siteId, createdBy, exceptUid, callback) {
    switch (scope) {
        case SCOPE.ENTERPRISE:
            siteId = createdBy = undefined;
            break;
        case SCOPE.SITE:
            createdBy = undefined;
            break;
    }
    searchExactName(req, res, name, scope, siteId, createdBy, exceptUid, function(error, results) {
        callback(error, !_.isEmpty(results.data));
    });
}

/**
 *  An Order Set should not have conceptual orderables with a scope narrower than its own.
 *
 *  - Enterprise order set:  contained orderables should be of Enterprise scope.
 *  - Site order set: contained orderables should be of scope Enterprise or Site (and match the site of Order Set).
 *  - Individual order set: contained orderables should be scope Enterprise, Site (matching site of Order Set),
 *    or Individual (matching Order Set creator).
 */
function validateScopeRules(orderset) {
    var isValid = false;
    switch (orderset.scope) {
        case SCOPE.ENTERPRISE:
            isValid = _.every(orderset.orderList, isEnterpriseScope);
            break;
        case SCOPE.SITE:
            isValid = _.every(orderset.orderList, function(o) {
                return isEnterpriseScope(o) || isMatchingSiteScope(o, orderset.siteId);
            });
            break;
        case SCOPE.INDIVIDUAL:
            isValid = _.every(orderset.orderList, function(o) {
                return isEnterpriseScope(o) ||
                    isMatchingSiteScope(o, orderset.siteId) ||
                    isMatchingIndividualScope(o, orderset.createdBy);
            });
            break;
    }
    return isValid;
}

function isEnterpriseScope(o) {
    return o.scope === SCOPE.ENTERPRISE;
}

function isMatchingSiteScope(o, siteId) {
    return o.scope === SCOPE.SITE && o.siteId === siteId;
}

function isMatchingIndividualScope(o, ownerId) {
    return o.scope === SCOPE.INDIVIDUAL && o.createdBy === ownerId;
}

function search(req, res, name, siteId, userId, callback) {
    var partialNameQuery = ['ilike', 'name', '%' + name + '%'];
    // enterprise query (OrderSets of enterprise scope)
    var enterpriseQuery = ['eq', 'scope', SCOPE.ENTERPRISE];
    // site query (OrderSets of site scope that match the siteId)
    var siteQuery = ['and', ['eq', 'scope', SCOPE.SITE],
        ['eq', 'siteId', siteId]
    ];
    // individual query (OrderSets individual scope created by userId)
    var individualQuery = ['and', ['eq', 'scope', SCOPE.INDIVIDUAL],
        ['eq', 'createdBy', userId]
    ];
    // this query enforces scope restrictions
    var scopeQuery = ['or', enterpriseQuery, siteQuery, individualQuery];

    var pjdsOptions = {
        store: ORDER_SET_STORE,
        filterList: _.isEmpty(name) ? scopeQuery : ['and', partialNameQuery, scopeQuery]
    };
    pjds.get(req, res, pjdsOptions, function(error, result) {
        if (error) {
            return callback(error, null);
        }
        if (_.get(result, 'data.items')) {
            result.data.items = _.map(result.data.items, shallowOrderSetProjection);
        }
        return callback(null, result);
    });
}

function shallowOrderSetProjection(item) {
    return {
        uid: item.uid,
        name: item.name,
        scope: item.scope,
        siteId: item.siteId,
        createdBy: item.createdBy,
        active: item.active
    };
}

function getOrderSet(req, res, uid, callback) {
    var pjdsOptions = {
        store: ORDER_SET_STORE,
        key: uid
    };
    pjds.get(req, res, pjdsOptions, function(error, result) {
        if (error) {
            error.statusCode = (result || {}).statusCode;
            return callback(error, null);
        }
        if (_.get(result, 'error')) {
            return callback('OrderSet with uid: ' + uid + ' was not found.', null);
        }
        return callback(null, result);
    });
}

function saveOrderSet(req, res, isNew) {
    var orderSet = req.body;

    // check for valid OrderSet payload
    if (_.isEmpty(orderSet)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('OrderSet (request body) must be defined');
    }
    // check for required OrderSet properties
    if (_.isEmpty(orderSet.name) || _.isEmpty(orderSet.orderList)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Invalid OrderSet object. OrderSet must at least the following properties: name, orderList');
    }
    // check all items in orderList have at least a type and uid
    if (!_.every(orderSet.orderList, isValidOrderListItem)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Invalid items in OrderSet.orderList. Items must have an uid and type property. If type is \'orderable\' then domain must one of the following: lab, rad, med, consult');
    }
    // set defaults
    orderSet.scope = orderSet.scope || SCOPE.INDIVIDUAL;
    if (_.isEmpty(orderSet.active)) {
        orderSet.active = true;
    }

    // Record 'siteId' and 'createdBy' attributes from the user session
    orderSet.siteId = req.session.user.site;
    orderSet.createdBy = req.session.user.uid;

    // check scope rules
    if (!validateScopeRules(orderSet)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Items in OrderSet.orderList must be of the same or broader scope than the order set.');
    }

    if (isNew) {
        // when creating an order set the uid is set by the store
        delete orderSet.uid;
    } else if (orderSet.uid !== req.param('uid')) {
        // the uid of the payload doesn't match the uid in the URL request
        return res.status(rdk.httpstatus.bad_request).rdkSend('The uid of the OrderSet payload and the uid in the request do not match. The uid of an OrderSet cannot be changed.');
    }

    // Check for name/scope collision (no existing names in enterprise, site/siteId, individual/createdBy)
    checkNameCollission(req, res, orderSet.name, orderSet.scope, orderSet.siteId, orderSet.createdBy, isNew ? null : orderSet.uid, function(error, hasNameCollision) {
        if (error) {
            req.logger.error({error: error}, 'OrderSet ' + isNew ? 'create' : 'update');
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Error resolving name conflict.');
        }
        if (hasNameCollision) {
            return res.status(rdk.httpstatus.conflict).rdkSend('Another OrderSet already exists with this name and scope.');
        }
        // there are no name conflicts, create/update the order set
        if (isNew) {
            return _create(req, res, orderSet);
        }
        return _update(req, res, orderSet);
    });
}

/************************************************
 *
 * OrderSet endpoint functions
 *
 ************************************************/
module.exports.create = function(req, res) {
    saveOrderSet(req, res, true);
};

module.exports.updateOrderSet = function(req, res) {
    if (_.isEmpty(req.param('uid'))) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required OrderSet uid');
    }
    saveOrderSet(req, res, false);
};

module.exports.getSearch = function(req, res) {
    search(req, res, req.param('name'), req.session.user.site, req.session.user.uid, function(error, result) {
        if (error) {
            req.logger.error('OrderSet search: ', error);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('An error occurred when searching for OrderSet.');
        }
        return res.status(rdk.httpstatus.ok).rdkSend(result.data);
    });
};

module.exports.getOrderSetByUid = function(req, res) {
    var uid = req.param('uid');
    if (_.isEmpty(uid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required OrderSet uid');
    }
    getOrderSet(req, res, uid, function(error, result) {
        if (error) {
            var notFoundMessage = 'OrderSet with uid: ' + uid + ' was not found.';
            req.logger.error(notFoundMessage);
            return res.status(error.statusCode || rdk.httpstatus.not_found).rdkSend(notFoundMessage);
        }
        return res.status(rdk.httpstatus.ok).rdkSend(result.data);
    });
};

module.exports.delete = function(req, res) {
    var uid = req.param('uid');
    if (_.isEmpty(uid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required OrderSet uid');
    }
    var pjdsOptions = {
        store: ORDER_SET_STORE,
        key: uid
    };
    pjds.delete(req, res, pjdsOptions, function(error, result) {
        if (error) {
            req.logger.error('OrderSet DELETE', error);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Error deleteing OrderSet with uid: ' + uid);
        }
        return res.status(rdk.httpstatus.no_content).rdkSend();
    });
};



/************************************************
 *
 * OrderSet public utility functions
 *
 ************************************************/
// methods exported to be used by other modules
module.exports.search = search; // Search OrderSets by name, siteId, userId.  search(req, res, name, siteId, userId, callback)
module.exports.getOrderSet = getOrderSet; // Get OrderSet by uid.  getOrderSet(req, res, uid, callback)
