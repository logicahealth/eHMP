'use strict';

var async = require('async');
var uuid = require('node-uuid');
var _ = require('underscore');

//-----------------------------------------------------------------------------------------------------
// Class Constructor
//
// log: The bunyan logger
// config: The configuration as defined by worker-config.json.
// environment: This contains handles to common utilities and services used across VX-Sync.
//-----------------------------------------------------------------------------------------------------
function SolrStorageRulesEngine(log, config, environment) {
    this.log = log;
    this.metrics = environment.metrics;
    this.config = config;
    this.environment = environment;
    this.rules = this._getRulesFromConfig();
}

//-----------------------------------------------------------------------------------------------------
// This method runs all the solr storage rules and calls the mainCallBack with either true or false
// corresponding to whether the record should be saved to solr or not.
//
// dataDomain: The data domain of the record to evaluate.
// record: The record which contains the data to save to solr.
// mainCallback: The call back handler to call when the prioritization is done.  Its signature is:
//       function(err, job)
//            Where:  err:     Is the error if one occurs.
//                    result:  Is the result for solr storage.
//-----------------------------------------------------------------------------------------------------
SolrStorageRulesEngine.prototype.store = function(dataDomain, record, mainCallback) {
    var self = this;

    if (self.rules.length === 0) {
        self.log.warn('solr-storage-rules-engine.store: No solr storage rules configured.');
        return setTimeout(mainCallback, 0, null, false);
    }

    if (!dataDomain || !record) {
        self.log.error('solr-storage-rules-engine.store: Data domain or record is not valid.  dataDomain: %s; record: %j', dataDomain, record);
        return setTimeout(mainCallback, 0, 'Data domain or record is not valid.', false);
    }

    var metricObj = {'subsystem':'SolrStorageRulesEngine','dataDomain':dataDomain, 'process':uuid.v4(), 'timer':'start'};
    self.metrics.trace('Solr Storage Rules', metricObj);
    metricObj.timer = 'stop';

    async.some(self.rules, function(rule, callback) {
        rule(self.log, self.config, self.environment, dataDomain, record, callback);
    }, function(err, result) {
        self.metrics.trace('Solr Storage Rules', metricObj);

        if (err) {
            self.log.error('solr-storage-rules-engine.store: Error returned from rule.  error: %j; dataDomain: %s; record: %j', err, dataDomain, record);
        }
        return setTimeout(mainCallback, 0, err, result);
    });
};

//------------------------------------------------------------------------------------------------------------------
// Retrieve the rules from the config file.
//------------------------------------------------------------------------------------------------------------------
SolrStorageRulesEngine.prototype._getRulesFromConfig = function(){
    var enabledRules = this.config.solrStorageRules;

    return _.map(enabledRules, function(ruleConfig, rule){
        return require('./' + rule + '-rule');
    });
};

module.exports = SolrStorageRulesEngine;
