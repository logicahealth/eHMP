'use strict';

var _ = require('lodash');
var path = require('path');
var nullUtil = require('../core/null-utils');
var pickListDirectRpcCall = require('./pick-list-direct-rpc-call');
var pickListInMemoryRpcCall = require('./pick-list-in-memory-rpc-call');


var interceptors = {
    operationalDataCheck: false,
    synchronize: false
};

module.exports.getResourceConfig = function(/*app*/) {
    var resourceConfig = [{
        name: 'write-pick-list',
        path: '',
        interceptors: interceptors,
        requiredPermissions: [],
        isPatientCentric: false,
        undocumented: true,
        get: fetchWritePickList
    }];

    registerPickLists(pickListDirectRpcCall.config, resourceConfig);
    registerPickLists(pickListInMemoryRpcCall.config, resourceConfig);

    return resourceConfig;
};

function registerPickLists(pickListConfig, resourceConfig) {
    _.each(pickListConfig, function(call) {
        resourceConfig.push({
            name: 'write-pick-list-' + call.name,
            path: call.name,
            apiBlueprintFile: path.resolve(__dirname, call.modulePath + '.md'),
            interceptors: interceptors,
            requiredPermissions: [],
            isPatientCentric: false,
            get: fetchIndividualPickList.bind(null, call.name)
        });
    });
}



function fetchWritePickList(req, res) {
    var type = req.param('type');
    var site = req.param('site');

    if (nullUtil.isNullish(type) || _.isEmpty(type)) {
        res.status(500).rdkSend('Parameter \'type\' cannot be null or empty');
        return;
    }
    if (nullUtil.isNullish(site) || _.isEmpty(site)) {
        res.status(500).rdkSend('Parameter \'site\' cannot be null or empty');
        return;
    }
    site = site.toUpperCase();
    type = type.toLowerCase();

    var serverSend = function(error, json, statusCode, headers) {
        if (error) {
            if (!nullUtil.isNullish(statusCode)) {
                if (!nullUtil.isNullish(headers)) {
                    _.each(headers, function(value, key) {
                        res.setHeader(key, value);
                    });
                }
                res.status(statusCode).rdkSend(error);
            }
            else {
                res.status(500).rdkSend(error);
            }
        }
        else {
            res.status(200).rdkSend(json);
        }
    };

//----------------------------------------------------------------------------------------------------------------------
//                 RPC's called directly - there is no in-memory solution for them.
//----------------------------------------------------------------------------------------------------------------------
    if (pickListDirectRpcCall.directRpcCall(req, site, type, serverSend)) {
        return;
    }

//----------------------------------------------------------------------------------------------------------------------
//                 Cached In-Memory RPC's.
//----------------------------------------------------------------------------------------------------------------------
    pickListInMemoryRpcCall.inMemoryRpcCall(req, site, type, serverSend);
}


function fetchIndividualPickList(name, req, res) {
    req.query.type = name;
    fetchWritePickList(req, res);
}
