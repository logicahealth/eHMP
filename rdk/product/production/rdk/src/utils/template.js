'use strict';
var _ = require('lodash');

module.exports.applyTemplate = function(errors, userTemplate, source) {
    var result;
    try {
        var template = _.template(userTemplate);
        result = template(source);
    } catch (e) {
        errors.push('Error in template execution: ' + e)
        result = userTemplate;
    }
    return result;
};

