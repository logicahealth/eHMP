'use strict';

//requires
var _ = require('underscore');
var async = require('async');

function RetirementRulesEngine(log, config, environment) {
    this.log = log;
    this.config = config;
    this.environment = environment;
    this.rules = this._getRulesFromConfig();
}

RetirementRulesEngine.prototype.processRetirementRules = function(items, mainCallback) {
    var self = this;
    async.eachSeries(self.rules, function(rule, ruleCallback){
        rule(self.log, self.config, self.environment, items, function(err, result){
            self.log.debug('retirement-rules-engine.processRetirementRules:result: %j', result);
            items = result;
            ruleCallback(err);
        });
    }, function(err) {
        mainCallback(err, items);
    });
};

RetirementRulesEngine.prototype._getRulesFromConfig = function(){
    var enabledRules = this.config.recordRetirement.rules;

    return _.map(enabledRules, function(ruleConfig, rule){
        return require('./'+rule+'-rule')(ruleConfig);
    });
};

module.exports = RetirementRulesEngine;