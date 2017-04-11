'use strict';

//requires
var _ = require('underscore');
var async = require('async');
var uuid = require('node-uuid');

function SyncRulesEngine(log, config, environment) {
    this.log = log;
    this.metrics = environment.metrics;
    this.config = config;
    this.environment = environment;
    this.rules = this._getRulesFromConfig();
}

SyncRulesEngine.prototype.getSyncPatientIdentifiers = function(patientIdentifiers, exceptions, mainCallback) {
    var self = this;
    var originalPatientIdentifiers = JSON.stringify(patientIdentifiers);
    var metricObj = {'subsystem':'RulesEngine','pid':patientIdentifiers[0].value, 'process':uuid.v4(), 'timer':'start'};
    self.metrics.trace('Sync Rules', metricObj);
    metricObj.timer = 'stop';
    async.eachSeries(self.rules, function(rule, ruleCallback){
        if (patientIdentifiers.length === 0 || _.isEmpty(patientIdentifiers[0].value)) {
            return ruleCallback();
        } else {
            rule(self.log, self.config, self.environment, patientIdentifiers, exceptions, function(err, result){
                if (err) {
                    self.log.error('rules-engine.getSyncPatientIdentifiers: Error returned from rule.  error: %j; patientIdentifiers: %s', err, originalPatientIdentifiers);
                    patientIdentifiers = [];
                } else if ((_.isNull(patientIdentifiers)) || (_.isUndefined(patientIdentifiers))) {
                    patientIdentifiers = [];         // Make sure we 
                } else {
                    patientIdentifiers = result;     // Assign the result from the rule call.
                }

                return ruleCallback(err);
             });
        }
    }, function(err) {
        self.metrics.trace('Sync Rules', metricObj);
        if (err) {
            self.log.error('rules-engine.getSyncPatientIdentifiers: Error returned from running rules.  error: %j; patientIdentifiers: %s', err, originalPatientIdentifiers);
        }
        if (_.isEmpty(patientIdentifiers)) {
            self.metrics.warn('Patient Sync Aborted', metricObj);
        }
        mainCallback(err, patientIdentifiers);
    });
};

SyncRulesEngine.prototype._getRulesFromConfig = function(){
    var enabledRules = this.config.rules;

    return _.map(enabledRules, function(ruleConfig, rule){
        return require('./'+rule+'-rule')(ruleConfig);
    });
};

module.exports = SyncRulesEngine;