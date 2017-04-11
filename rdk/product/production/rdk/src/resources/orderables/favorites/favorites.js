'use strict';

var rdk = require('../../../core/rdk');
var _ = require('lodash');
var dd = require('drilldown');
var async = require('async');
var pjds = rdk.utils.pjdsStore;

//to get 'name' values
var orderSet = require('../order-set/order-set');
var quickOrder = require('../quick-order/quick-order');

function findFavorites(req, res, callback) {
    req.logger.debug('Orderables getFavorite called for ' + req.session.user.uid);
    var filters = [];
    var pjdsOptions = {
        store: 'orderfavs'
    };
    filters.push(['eq', 'userId', req.session.user.uid]);

    if (!_.isEmpty(filters)) {
        pjdsOptions.filterList = filters;
    }
    pjds.get(req, res, pjdsOptions, function(error, result) {
    if (error) {
        return callback(error, null);
    }
    req.logger.debug(result);
    return callback(null, result);
    });
}


/************************************************
 *
 * Favorites endpoint functions
 *
 ************************************************/
module.exports.getFavorites = function(req, res) {

    findFavorites(req, res, function(error, result) {

        if (error) {
            req.logger.error('Favorites lookup: ', error);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('An error occurred when searching for Favorites.');
        }

        var asyncCalls = [];

        if (!dd(result)('data')('items').exists) {
            return res.status(rdk.httpstatus.ok).rdkSend({data: {items: []}});
        }

        _.forEach(result.data.items, function(item) {
            if (!_.isEmpty(item)) {

                if(item.type === 'orderset') {
                    asyncCalls.push(getOrderSetName(req, res, item.id));
                } else if(item.type === 'quickorder') {
                    asyncCalls.push(getQuickOrderName(req, res, item.id));
                } else if(item.type === 'orderable') {
                    //future: this is currently unsupportable with the current orderable implementation
                    //this will is a placeholder which can support it when lab/rad orderables are able
                    asyncCalls.push(getEmptyName(req, res, item.id));
                } else {
                    req.logger.debug('Unexpected Orderable Type Encountered - favorites unsupported.');
                    asyncCalls.push(getEmptyName(req, res, item.id));
                }
            }
        });

        req.logger.debug('async calls: ' + asyncCalls.length);

        async.parallel(asyncCalls, function(error, names) {
            // if you added a call for each item in the search results, then
            // 'names' array and 'items' array should be the same length
            _.forEach(names, function(n, index) {
                result.data.items[index].name = n;
            });
            return res.status(rdk.httpstatus.ok).rdkSend(result.data);
        });
    });
};


function getEmptyName(req, res, uid) {
	return function(asyncCallback) {
        return asyncCallback(null, '');
    };
}

function getOrderSetName(req, res, uid) {
	return function(asyncCallback) {
		orderSet.getOrderSet(req, res, uid, function(error, result) {
			if (error) {
                req.logger.error('name not found for orderset favorite');
				return asyncCallback(null, '');
			}
			return asyncCallback(null, result.data.name);
		});
	};
}

function getQuickOrderName(req, res, uid) {
	return function(asyncCallback) {
		quickOrder.getQuickOrder(req, res, uid, function(error, result) {
			if (error) {
                req.logger.error('name not found for quickorder favorite');
				return asyncCallback(null, '');
			}
			return asyncCallback(null, result.data.name);
		});
	};
}

module.exports.addFavorites = function(req, res) {
    req.logger.debug('Orderables addFavorite called');

    var id = req.param('id'); //required
    var type = req.param('type'); //required
    var domain = req.param('domain'); //required when type === orderable
    var siteId = req.param('siteId'); //required when type === orderable

    if (!validateRequest(req, res, id, type, domain, siteId)) {
        return;
    }

    // taking all of this from the query params as documentation indicates.
    // var favorite = req.body;
    id = String(id);
    var favorite = {};
    favorite.id = id;
    favorite.type = type;
    if(!_.isEmpty(domain)) {
        favorite.domain = domain;
    };
    if(!_.isEmpty(siteId)) {
        favorite.siteId = siteId;
    };
    favorite.userId = req.session.user.uid;

    var pjdsOptions = {
        store: 'orderfavs',
        data: favorite,
        key: createKey(id, type, domain, siteId, req.session.user.uid)
    };
    pjds.post(req, res, pjdsOptions, function(error, result, headers) {
        if (error) {
            req.logger.error('Favorite create: ', error);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Could not create favorite.');
        }
        // send back the newly created object with its assigned uid
        favorite.uid = pjds.parseUid(headers.location);
        return res.status(rdk.httpstatus.created).rdkSend(favorite);
    });

};


module.exports.deleteFavorites = function(req, res) {
    req.logger.debug('Orderables deleteFavorite called');

    var id = req.param('id'); //required
    var type = req.param('type'); //required
    var domain = req.param('domain'); //required when type === orderable
    var siteId = req.param('siteId'); //required when type === orderable

    if (!validateRequest(req, res, id, type, domain, siteId)) {
        return;
    }

    var pjdsOptions = {
        store: 'orderfavs',
        key: createKey(id, type, domain, siteId, req.session.user.uid)
    };

    pjds.delete(req, res, pjdsOptions, function(error, result) {
        if (error) {
            req.logger.error('Favorites DELETE', error);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(error);
        }
        return res.status(rdk.httpstatus.no_content).rdkSend();
    });
};


function createKey(id, type, domain, siteId, userId) {
    var uid = id+type;
    if(!_.isEmpty(domain)) {
        uid+=domain;
    }
    if(!_.isEmpty(siteId)) {
        uid+=siteId;
    }
    uid+=userId;
    return uid;
}


function validateRequest(req, res, id, type, domain, siteId) {

    if (_.isEmpty(id)) {
        res.status(rdk.httpstatus.bad_request).rdkSend('Missing required favorite id');
        return false;
    }
    if (_.isEmpty(type)) {
        res.status(rdk.httpstatus.bad_request).rdkSend('Missing required favorite type');
        return false;
    } else {
        if(type === 'orderable') {
            if(_.isEmpty(domain)) {
                res.status(rdk.httpstatus.bad_request).rdkSend('Missing required favorite domain');
                return false;
            }
            if(_.isEmpty(siteId)) {
                res.status(rdk.httpstatus.bad_request).rdkSend('Missing required favorite siteId');
                return false;
            }
        }
    }
    return true;
}
