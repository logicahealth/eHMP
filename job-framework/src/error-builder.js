'use strict';

var _ = require('underscore');

var transient = 'transient-exception';
var fatal = 'fatal-exception';

function createTransient(message, data) {
    return create(transient, message, data);
}

function createFatal(message, data) {
    return create(fatal, message, data);
}

function create(type, message, data) {
    var error = {
        type: type,
    };

    if(!_.isEmpty(message)) {
        error.message = message;
    }

    if(!_.isEmpty(data) || _.isNumber(data)) {
        error.data = data;
    }

    return error;
}

module.exports.fatal = fatal;
module.exports.transient = transient;
module.exports.createFatal = createFatal;
module.exports.createTransient = createTransient;