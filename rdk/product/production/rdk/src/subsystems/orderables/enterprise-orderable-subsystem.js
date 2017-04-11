'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var dd = require('drilldown');
var pjds = rdk.utils.pjdsStore;

var dataStore = 'entordrbls';
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
            req.logger.error('EnterpriseOrderable create: ', error);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Could not create EnterpriseOrderable.');
        }
        // send back the newly-created object with its assigned uid
        data.uid = pjds.parseUid(headers.location);
        var status = rdk.httpstatus.created;
        return res.status(status).send({data: data, status: status});
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
            req.logger.error({error: error}, 'EnterpriseOrderable update (uid:' + data.uid + ')');
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Could not update EnterpriseOrderable with uid: ' + data.uid + '.');
        }
        var status = rdk.httpstatus.ok;
        return res.status(status).send({data: data, status: status});
    });
}

function searchExactName(req, res, name, exceptUid, callback) {
    var filters = [];
    var pjdsOptions = {
        store: dataStore
    };
    if (!_.isEmpty(name)) {
        filters.push(['eq', 'name', name]);
    }
    if (!_.isEmpty(exceptUid)) {
        filters.push(['ne', 'uid', exceptUid]);
    }
    if (!_.isEmpty(filters)) {
        pjdsOptions.filterList = filters;
    }
    pjds.get(req, res, pjdsOptions, callback);
}

function checkNameCollission(req, res, name, exceptUid, callback) {
    searchExactName(req, res, name, exceptUid, function(error, results) {
        callback(error, !_.isEmpty(results.data));
    });
}

function doSearchOnPjds(req, res, name, state, callback) {
    var filters = [];
    var domain;
    var subdomain;

    if (_.isEmpty(name)) {   // want blank not 'undefined'
        name = '';
    }
    filters.push(['ilike', 'name', '%' + name + '%']);

    if (!_.isEmpty(state)) {
        filters.push(['eq', 'state', state]);
    }
    if (!_.isEmpty(req.query)) {
        domain = req.query.domain;
        subdomain = req.query.subdomain;
        if (!_.isEmpty(domain)) {
            filters.push(['eq', 'domain', domain]);
        }
        if (!_.isEmpty(subdomain)) {
            filters.push(['eq', 'subDomain', subdomain]);
        }
    }
    var pjdsOptions = {
        store: dataStore,
        filterList: filters
    };

    pjds.get(req, res, pjdsOptions, function(error, result) {
        if (error) {
            return callback(error, null);
        }
        return callback(null, result);
    });
}
module.exports.doSearchOnPjds = doSearchOnPjds;

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
            return callback('EnterpriseOrderable with uid: ' + uid + ' was not found.', null);
        }
        return callback(null, result);
    });
}

function save(req, res, isNew) {
    var enterprise = req.body;

    // check for valid EnterpriseOrderable payload
    if (_.isEmpty(enterprise)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('EnterpriseOrderable (request body) must be defined');
    }
    // check for required EnterpriseOrderable properties
    if (_.isEmpty(enterprise.name) || _.isEmpty(enterprise.data) || _.isEmpty(enterprise.domain) || _.isEmpty(enterprise.subDomain)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Invalid EnterpriseOrderable object. EnterpriseOrderable must at least the following properties: name, data, domain, subDomain');
    }
    if (isNew) {
        // when creating a EnterpriseOrderable the uid is set by the store
        delete enterprise.uid;
        if (_.isEmpty(enterprise.active)) {
            enterprise.active = true;
        }
    } else {
        if (enterprise.uid !== req.param('uid')) {
            // the uid of the payload doesn't match the uid in the URL request
            return res.status(rdk.httpstatus.bad_request).rdkSend('The uid of the EnterpriseOrderable payload and the uid in the request do not match. The uid of an EnterpriseOrderable cannot be changed.');
        }
    }
    if (_.isEmpty(enterprise.type)) {
        enterprise.type = 'ehmp-enterprise-orderable';  // always for now
    }
    enterprise.timestamp = new Date();
    enterprise.createdBy = req.session.user.uid;

    // Check for name collision (no existing names in enterprise)
    checkNameCollission(req, res, enterprise.name, isNew ? null : enterprise.uid, function(error, hasNameCollision) {
        if (error) {
            req.logger.error({error: error}, 'EnterpriseOrderable ' + isNew ? 'create' : 'update');
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('Error resolving name conflict.');
        }
        if (hasNameCollision) {
            return res.status(rdk.httpstatus.conflict).rdkSend('Another EnterpriseOrderable already exists with this name.');
        }
        // there are no name conflicts, create/update the EnterpriseOrderable
        if (isNew) {
            return _create(req, res, enterprise);
        }
        return _update(req, res, enterprise);
    });
}

module.exports.create = function(req, res) {
    save(req, res, true);
};

module.exports.update = function(req, res) {
    if (_.isEmpty(req.param('uid'))) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required EnterpriseOrderable uid');
    }
    save(req, res, false);
};

module.exports.search = function(req, res) {
    doSearchOnPjds(req, res, req.param('name'), req.param('state'), function(error, result) {
        if (error) {
            req.logger.error('Enterprise search: ', error);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend('An error occurred when searching for Enterprise Orderables.');
        }
        return res.status(rdk.httpstatus.ok).send({data: result.data, status: rdk.httpstatus.ok});
    });
};

module.exports.get = function(req, res) {
    var uid = req.param('uid');
    if (_.isEmpty(uid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required EnterpriseOrderable uid');
    }
    _get(req, res, uid, function(error, result) {
        if (error) {
            var notFoundMessage = 'EnterpriseOrderable with uid: ' + uid + ' was not found.';
            req.logger.error(notFoundMessage);
            return res.status(error.statusCode || rdk.httpstatus.not_found).rdkSend(notFoundMessage);
        }
        return res.status(rdk.httpstatus.ok).send({data: result.data, status: rdk.httpstatus.ok});
    });
};

module.exports.delete = function(req, res) {
    var uid = req.param('uid');
    if (_.isEmpty(uid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required EnterpriseOrderable uid');
    }
    var pjdsOptions = {
        store: dataStore,
        key: uid
    };
    pjds.delete(req, res, pjdsOptions, function(error, result) {
        if (error) {
            req.logger.error('EnterpriseOrderable DELETE', error);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(error);
        }
        return res.status(rdk.httpstatus.no_content).rdkSend();
    });
};

function getEnterpriseOrderable(req, res, uid, callback) {
    var pjdsOptions = {
        store: dataStore,
        key: uid
    };
    pjds.get(req, res, pjdsOptions, function(error, result) {
        if (error) {
            return callback(error, null);
        }
        if (dd(result)('error').exists) {
            return callback('EnterpriseOrderable with uid: ' + uid + ' was not found.', null);
        }
        return callback(null, result);
    });
}

module.exports.getEnterpriseOrderable = getEnterpriseOrderable;
