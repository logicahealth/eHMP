'use strict';

var RulesEngine = require('node-rules');

module.exports.executeRules = function (rules, facts, callback) {
    var rulesEngine = new RulesEngine(rules);

    rulesEngine.execute(facts, function(response) {
        callback(response.result);
    });
};

