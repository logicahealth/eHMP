'use strict';

const _ = require('lodash');

const transient = 'transient-exception';
const fatal = 'fatal-exception';

/**
 * @typedef {object} JdsCacheApiError
 * @property {string} type Can be 'transient-exception' or 'fatal-exception'
 * @property {*} [message]
 * @property {*} [data]
 */

/**
 * Create a transient error from a message and data
 *
 * @param {*} [message]
 * @param {*} [data]
 * @return {JdsCacheApiError}
 */
function createTransient(message, data) {
    return create(transient, message, data);
}

/**
 * Create a fatal error from a message and data
 *
 * @param {*} [message]
 * @param {*} [data]
 * @return {JdsCacheApiError}
 */
function createFatal(message, data) {
    return create(fatal, message, data);
}

/**
 * Create an error object of a type from a message and data
 *
 * @param {string} type
 * @param {*} [message]
 * @param {*} [data]
 * @return {JdsCacheApiError}
 */
function create(type, message, data) {
    const error = {
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

/**
 * @param {JdsCacheApiError} error
 * @return {boolean}
 */
function isTransient(error) {
    return !_.isEmpty(error) && (error === transient || error.type === transient);
}

/**
 * @param {JdsCacheApiError} error
 * @return {boolean}
 */
function isFatal(error) {
    return !_.isEmpty(error) && (error === fatal || error.type === fatal);
}

module.exports.fatal = fatal;
module.exports.transient = transient;
module.exports.isFatal = isFatal;
module.exports.isTransient = isTransient;
module.exports.createFatal = createFatal;
module.exports.createTransient = createTransient;
