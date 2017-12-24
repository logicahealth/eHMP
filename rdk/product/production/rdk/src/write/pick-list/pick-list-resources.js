'use strict';

var _ = require('lodash');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var nullUtil = require('../core/null-utils');
var pickListDirectRpcCall = require('./pick-list-direct-rpc-call');
var pickListInMemoryRpcCall = require('./pick-list-in-memory-rpc-call');
var pickListGroups = require('./pick-list-groups');
var pickListUtil = require('./pick-list-utils');


var interceptors = {
    operationalDataCheck: false,
    synchronize: false
};

module.exports.getResourceConfig = function(app) {
    var resourceConfig = [];
    registerPickLists(pickListUtil.inMemoryConfig(app), resourceConfig);
    registerPickLists(pickListUtil.directConfig(app), resourceConfig);
    registerPickLists(pickListUtil.groupsConfig(app), resourceConfig);

    return resourceConfig;
};

function registerPickLists(pickListConfig, resourceConfig) {
    _.each(pickListConfig, function(call) {
        resourceConfig.push({
            name: 'write-pick-list-' + call.name,
            path: call.name,
            apiBlueprintFile: path.resolve(__dirname, call.modulePath + '.md'),
            interceptors: interceptors,
            requiredPermissions: call.requiredPermissions || [],
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
                    _.each(headers, function (value, key) {
                        res.setHeader(key, value);
                    });
                }
                res.status(statusCode).rdkSend(error);
            } else {
                res.status(500).rdkSend(error);
            }
        } else {
            res.status(200);

            if (json instanceof EventEmitter && _.isFunction(json.pipe)) {
                res.write('{"data":');
                json.on('end', function () {
                    res.write(',"status":200}');
                });
                json.pipe(res);
            } else {
                res.rdkSend(json);
            }
        }
    };

    //----------------------------------------------------------------------------------------------------------------------
    //                 Pick-list groups (collections)
    //----------------------------------------------------------------------------------------------------------------------
    if (pickListGroups.getPickListGroup(req, site, type, serverSend)) {
        return;
    }

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
module.exports.fetchIndividualPickList = fetchIndividualPickList;
