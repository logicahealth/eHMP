'use strict';

//----------------------------------------------------------------------------------------------------
// This file is the entry point to run the event prioritization rules.   This will take the event job
// and apply the rules to set the priority of the job.
//
// Author: Les Westberg
//----------------------------------------------------------------------------------------------------

//requires
var _ = require('underscore');
var async = require('async');
var uuid = require('node-uuid');
var objUtil = require(global.VX_UTILS + 'object-utils');

//-----------------------------------------------------------------------------------------------------
// Class Constructor
//
// log: The bunyan logger
// config: The configuration as defined by worker-config.json.
// environment: This contains handles to common utilities and services used across VX-Sync.
//-----------------------------------------------------------------------------------------------------
function EventPriorityRulesEngine(log, config, environment) {
    this.log = log;
    this.metrics = environment.metrics;
    this.config = config;
    this.environment = environment;
    this.rules = this._getRulesFromConfig();
}


//-----------------------------------------------------------------------------------------------------
// This method runs all the event prioritization rules and calls the mainCallBack with the job
// containing the final calculated priority.
//
// job: The record enrichment job to be prioritized.
// mainCallback: The call back handler to call when the prioritization is done.  Its signature is:
//       function(err, job)
//            Where:  err:  Is the error if one occurs.
//                    job:  Is the record enrichment job with a priority attribute updated according
//                          to the rules.
//-----------------------------------------------------------------------------------------------------
EventPriorityRulesEngine.prototype.prioritize = function(job, mainCallback) {
    var self = this;
    var originalJob = JSON.stringify(job);
    var patientIdentifierValue = objUtil.getProperty(job, 'patientIdentifier', 'value') || '';

    // Set a default value if we never got one to begin with.
    //-------------------------------------------------------
    if (!job.priority) {
        job.priority = 1;
    }
    if (job.priority < 1) {
        job.priority = 1;
    }
    if (job.priority > 100) {
        job.priority = 100;
    }

    var metricObj = {'subsystem':'EventPriorityRulesEngine','pid':patientIdentifierValue, 'process':uuid.v4(), 'timer':'start'};
    self.metrics.trace('Event Priority Rules', metricObj);
    metricObj.timer = 'stop';
    async.eachSeries(self.rules, function(rule, ruleCallback){
        if ((_.isUndefined(job)) || (_.isNull(job))) {
            return ruleCallback();
        } else {
            // rule(self.log, self.config, self.environment, job, function(err, resultJob){
            self._runRule(rule, job, function(err, resultJob) {
                if (err) {
                    self.log.error('event-priority-rules-engine.prioritize: Error returned from rule.  error: %j; originalJob: %s; resultJob: %j', err, originalJob, resultJob);
                } else {
                    job = resultJob;     // Assign the result from the rule call to pass to the next rule or if we are done to pass back to the caller.
                }

                return ruleCallback();
             });
        }
    }, function(err) {
        self.metrics.trace('Event Priority Rules', metricObj);
        if (err) {
            self.log.error('event-priority-rules-engine.prioritize: Error returned from running rules.  error: %j; originalJob: %s; resultJob: %j', err, originalJob, job);
        }
        if ((_.isUndefined(job)) || (_.isNull(job))) {
            self.metrics.warn('Event Priority Rules Aborted', metricObj);
        }
        mainCallback(err, job);
    });
};

//-----------------------------------------------------------------------------------------------------------------
// This runRule method is a convenience method that allows a unit test to spy and verify that all the
// expected rules that were meant to be run in a test - were actually run.
//
// rule: The rule function.
// job: The job being processed.
// ruleCallback: The rule call back.  Its signature is:
//      function(err, resultJob)
//         where:
//            err: The error if one occurs
//            resultJob: The original job with modified priority.
//-------------------------------------------------------------------------------------------------------------------
EventPriorityRulesEngine.prototype._runRule = function(rule, job, ruleCallback) {
    var self = this;
    rule(self.log, self.config, self.environment, job, function(err, resultJob){
        return ruleCallback(err, resultJob);
    });
};

//------------------------------------------------------------------------------------------------------------------
// Retrieve the rules from the config file.
//------------------------------------------------------------------------------------------------------------------
EventPriorityRulesEngine.prototype._getRulesFromConfig = function(){
    var enabledRules = this.config.eventPrioritizationRules;

    return _.map(enabledRules, function(ruleConfig, rule){
        return require('./'+rule+'-rule');
    });
};

module.exports = EventPriorityRulesEngine;