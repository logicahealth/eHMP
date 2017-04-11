'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var dd = require('drilldown');
var pjds = rdk.utils.pjdsStore;

var dataStore = 'quickorder';
module.exports.getSubsystemConfig = function(app) {
    return {
        healthcheck: pjds.createHealthcheck(dataStore, app)
    };
};

function _create(req, res, data) {
    var pjdsOptions = {
        store: dataStore,
        data: data
    };
    pjds.post(req, res, pjdsOptions, function(error, result, headers) {
        if (error) {
            req.logger.error('QuickOrder create: ', error);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Could not create QuickOrder.');
        }
        // send back the newly created object with its assigned uid
        data.uid = pjds.parseUid(headers.location);
        return res.status(rdk.httpstatus.created).rdkSend(data);
    });
}

function _update(req, res, data) {
    var pjdsOptions = {
        store: dataStore,
        data: data,
        key: req.param('uid')
    };
    pjds.put(req, res, pjdsOptions, function(error, result, headers) {
        if (error) {
            req.logger.error({error: error}, 'QuickOrder update (uid:' + data.uid + ')');
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Could not update QuickOrder with uid: ' + data.uid + '.');
        }
        return res.status(rdk.httpstatus.created).rdkSend(data);
    });
}

function searchExactName(req, res, name, scope, siteId, createdBy, exceptUid, callback) {
    var filters = [];
    var pjdsOptions = {
        store: dataStore
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
        case 'enterprise':
            siteId = createdBy = undefined;
            break;
        case 'site':
            createdBy = undefined;
            break;
    }
    searchExactName(req, res, name, scope, siteId, createdBy, exceptUid, function(error, results) {
        callback(error, !_.isEmpty(results.data));
    });
}

function doSearchOnPjds(req, res, name, siteId, userId, callback) {
    var partialNameQuery = ['ilike', 'name', '%' + name + '%'];
    // enterprise query (QuickOrders of enterprise scope)
    var enterpriseQuery = ['eq', 'scope', 'enterprise'];
    // site query (QuickOrders of site scope that match the siteId)
    var siteQuery = ['and',
        ['eq', 'scope', 'site'],
        ['eq', 'siteId', siteId]
    ];
    // individual query (QuickOrders individual scope created by userId)
    var individualQuery = ['and',
        ['eq', 'scope', 'individual'],
        ['eq', 'createdBy', userId]
    ];
    // this query enforces scope restrictions
    var scopeQuery = ['or', enterpriseQuery, siteQuery, individualQuery];

    var pjdsOptions = {
        store: dataStore,
        filterList: _.isEmpty(name) ? scopeQuery : ['and', partialNameQuery, scopeQuery]
    };
    pjds.get(req, res, pjdsOptions, function(error, result) {
        if (error) {
            return callback(error, null);
        }
        if (dd(result)('data')('items').exists) {
            result.data.items = _.map(result.data.items, shallowProjection);
        }
        return callback(null, result);
    });
}
module.exports.doSearchOnPjds = doSearchOnPjds;

function shallowProjection(item) {
    return {
        uid: item.uid,
        name: item.name,
        type: item.type,
        scope: item.scope,
        siteId: item.siteId,
        createdBy: item.createdBy,
        timestamp: item.timestamp,
        active: item.active
    };
}

function _get(req, res, uid, callback) {
    var pjdsOptions = {
        store: dataStore,
        key: uid
    };
    pjds.get(req, res, pjdsOptions, function(error, result) {
        if (error) {
            error.statusCode = (result || {}).statusCode;
            return callback(error, null);
        }
        if (dd(result)('error').exists) {
            return callback('QuickOrder with uid: ' + uid + ' was not found.', null);
        }
        return callback(null, result);
    });
}

function save(req, res, isNew) {
    var quickOrder = req.body;

    // check for valid QuickOrder payload
    if (_.isEmpty(quickOrder)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('QuickOrder (request body) must be defined');
    }
    // check for required QuickOrder properties
    if (_.isEmpty(quickOrder.name) || _.isEmpty(quickOrder.formData) || _.isEmpty(quickOrder.orderable)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Invalid QuickOrder object. QuickOrder must at least the following properties: name, formData, orderable');
    }
    if (isNew) {
        // when creating a quick order the uid is set by the store
        delete quickOrder.uid;
        if (_.isEmpty(quickOrder.active)) {
            quickOrder.active = true;
        }
    } else {
        if (quickOrder.uid !== req.param('uid')) {
            // the uid of the payload doesn't match the uid in the URL request
            return res.status(rdk.httpstatus.bad_request).rdkSend('The uid of the QuickOrder payload and the uid in the request do not match. The uid of an QuickOrder cannot be changed.');
        }
    }
    // set defaults
    quickOrder.scope = quickOrder.scope || 'individual';
    quickOrder.type = 'quickorder';
    quickOrder.timestamp = new Date();

    // Record 'siteId' and 'createdBy' attributes from the user session
    quickOrder.siteId = req.session.user.site;
    quickOrder.createdBy = req.session.user.uid;

    // Check for name/scope collision (no existing names in enterprise, site/siteId, individual/createdBy)
    checkNameCollission(req, res, quickOrder.name, quickOrder.scope, quickOrder.siteId, quickOrder.createdBy, isNew ? null : quickOrder.uid, function(error, hasNameCollision) {
        if (error) {
            req.logger.error({error: error}, 'QuickOrder ' + isNew ? 'create' : 'update');
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Error resolving name conflict.');
        }
        if (hasNameCollision) {
            return res.status(rdk.httpstatus.conflict).rdkSend('Another QuickOrder already exists with this name and scope.');
        }
        // there are no name conflicts, create/update the quick order
        if (isNew) {
            return _create(req, res, quickOrder);
        }
        return _update(req, res, quickOrder);
    });
}

module.exports.create = function(req, res) {
    save(req, res, true);
};

module.exports.update = function(req, res) {
    if (_.isEmpty(req.param('uid'))) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required QuickOrder uid');
    }
    save(req, res, false);
};

module.exports.search = function(req, res) {
    doSearchOnPjds(req, res, req.param('name'), req.session.user.site, req.session.user.uid, function(error, result) {
        if (error) {
            req.logger.error('QuickOrder search: ', error);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('An error occurred when searching for QuickOrder.');
        }
        return res.status(rdk.httpstatus.ok).rdkSend(result);
    });
};

module.exports.get = function(req, res) {
    var uid = req.param('uid');
    if (_.isEmpty(uid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required QuickOrder uid');
    }
    _get(req, res, uid, function(error, result) {
        if (error) {
            var notFoundMessage = 'QuickOrder with uid: ' + uid + ' was not found.';
            req.logger.error(notFoundMessage);
            return res.status(error.statusCode || rdk.httpstatus.not_found).rdkSend(notFoundMessage);
        }
        return res.status(rdk.httpstatus.ok).rdkSend(result);
    });
};

module.exports.delete = function(req, res) {
    var uid = req.param('uid');
    if (_.isEmpty(uid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required QuickOrder uid');
    }
    var pjdsOptions = {
        store: dataStore,
        key: uid
    };
    pjds.delete(req, res, pjdsOptions, function(error, result) {
        if (error) {
            req.logger.error('QuickOrder DELETE', error);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(error);
        }
        return res.status(rdk.httpstatus.no_content).rdkSend();
    });
};
