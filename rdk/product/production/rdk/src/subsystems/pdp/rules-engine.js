'use strict';

var _ = require('lodash');
var RulesEngine = require('node-rules');

module.exports.executeRules = function (rules, facts, callback) {
    var rulesEngine = new RulesEngine(rules);

    rulesEngine.execute(facts, function(response) {
        callback(response.result);
    });
};

