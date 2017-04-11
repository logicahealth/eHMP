'use strict';

var _ = require('lodash');

var ruleHandlers = {
    policy: {
        handler: require('./pep-handler-policy')
    },
    permission: {
        handler: require('./pep-handler-permission')
    },
    asuactions: {
        handler: require('./pep-handler-asu-actions')
    }
};

module.exports.build = function(obj) {
    var handlers = [];

    if (_.size(_.result(obj, '_resourceConfigItem.requiredPermissions')) > 0) {
        handlers.push(ruleHandlers.permission.handler);
    }
    if (_.result(obj, '_resourceConfigItem.isPatientCentric')) {
        handlers.push(ruleHandlers.policy.handler);
    }
    if (_.size(_.result(obj, '_resourceConfigItem.requiredASUActions')) > 0) {
        handlers.push(ruleHandlers.asuactions.handler);
    }
    if(_.result(obj, 'sensitiveCheck')){
        handlers.push(ruleHandlers.policy.handler.maskSensitive);
    }

    return handlers;
};

//for testing purposes
module.exports.handlers = ruleHandlers;
