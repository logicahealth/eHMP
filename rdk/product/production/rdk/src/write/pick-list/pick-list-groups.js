'use strict';

var _ = require('lodash');
var pickListRoot = './';
var pickListUtil = require('./pick-list-utils');

var pickListConfig;

function getPickListGroup(req, site, type, serverSend) {
    pickListConfig = pickListUtil.groupsConfig(req.app);
    var i = _.indexOf(_.pluck(pickListConfig, 'name'), type);
    if (i === -1) {
        return false;//This isn't a pick-list group.
    }

    require(pickListRoot + pickListConfig[i].modulePath).fetchGroup(req, function(err, results) {
        if (!results || !results.length) {
            return serverSend(err, results);
        }

        serverSend(err, {
            data: results,
            totalItems: results.length
        });
    });

    return true;
}
module.exports.getPickListGroup = getPickListGroup;

//Changes the configuration for testing.
module.exports._setConfig = function(config) {
    pickListConfig = config;
};
