'use strict';

//requires
var _ = require('underscore');
var async = require('async');

function UnSyncRulesEngine(log, config, environment) {
    this.log = log;
    this.config = config;
    this.environment = environment;
    this.rules = this._getRulesFromConfig();
}

UnSyncRulesEngine.prototype.processUnSyncRules = function(items, mainCallback) {
    var self = this;
    async.each(self.rules, function(rule, ruleCallback){
        rule(self.log, self.config, self.environment, items, function(err, result){
            self.log.debug('unsync-rules-engine.processUnSyncRules:result: %j', result);
            items = result;
            ruleCallback();
        });
    }, function(err) {
        mainCallback(err, items);
    });
};

UnSyncRulesEngine.prototype._getRulesFromConfig = function(){
    var enabledRules = this.config.unsync.rules;

    return _.map(enabledRules, function(ruleConfig, rule){
        return require('./'+rule+'-rule')(ruleConfig);
    });
};

module.exports = UnSyncRulesEngine;