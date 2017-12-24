'use strict';
var _ = require('lodash');
var util = require('util');
var rdk = require('../../core/rdk');
var errorConstants = require('./error-constants');
var digitsOnlyRegEx = /^\d*?$/;
var whitelist = ['code', 'message', 'requestId'];

/**
 * Construct an RdkError that can log the entire Error, stack, message, code and other information
 * but will only send the error message, error requestId and error code to the user.
 * @param {Object|string} options - Object with various optional and required info. This can also be the code String as identified below under options.code
 * @param {Object} options.logger - logger that contains an error method for logging this error
 * @param {string} [options.requestId] - Passed in requestId string
 * @param {string} [options.code] - a period separated string
 * @description In order to properly evaluate the path to the constant's message the code is expected to be a period deliminated string of 3 parts
 * @example <caption>These are the two formats allowed for string representation. The numerical version is the prefered style.</caption>
 * // 'vista.401.1007' | '100.401.1007'
 * // code parts are expected to be in one of these two orders
 * // [service-name].[http-code].[constant-number] or
 * // [service-code].[http-code].[constant-number]
 * @param {Object|Error|RdkError|string} [options.error] - A string, error or object
 * @param {Error} [options.error.original] - recommended way to put an original error object in for logging
 * @param {Object|string} [options.error.additionalInfo] - recommended way to put any additional information about the error that occured
 * @param {*} fileName
 * @param {*} lineNumber
 */
function RdkError(options, fileName, lineNumber) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.originalCode = getCode(options);
    this.code = this.originalCode;
    options.codeParts = getCodeParts(this.code);
    if (_.size(options.codeParts) === 3) {
        //make sure the code parts are actual numbers to return to the user
        this.code = options.codeParts.join('.');
    }
    this.requestId = getRequestId(options);
    this.status = getStatus(options);
    this.error = getError(options);
    this.message = getMessage(options);
    this.logged = false;

    var plainError = new Error();
    this.fileName = plainError.fileName || fileName;
    this.lineNumber = plainError.lineNumber || lineNumber;

    if (options.logger) {
        this.log(options.logger);
    }

    return this;
}

util.inherits(RdkError, Error);

/**
 * Method to log this RdkError as an error and mark it as logged
 */
RdkError.prototype.log = function(logger) {
    if (logger && _.isFunction(logger.error)) {
        logger.error(this);
        this.logged = true;
    }
    return this;
};

/**
 * Method to ONLY return the whitelisted options to a client system
 * @return {RdkError}
 */
RdkError.prototype.sanitize = function() {
    return _.pick(this, whitelist);
};

/**
 * Getting the code from the constructor options. Options as a string is permitted under specific circumstances
 * @param {Object|String} [options] - Object with coded path preferably passed as a code parameter
 * @param {String} [options.code]   - The coded path to the constants message refer to options.code from RdkError constructor docs
 */
function getCode(options) {
    var code = _.get(options, 'code', '');
    if (_.isEmpty(code) && _.isString(options) && _.size(options.split('.')) === 3) {
        /**
         * if code was not set on options and
         * the first element passed into the RdkError constructor was a string and
         * the string can be broken into exactly 3 parts when split on a period
         * then we are assuming its our code string
         */
        code = options;
    }
    return code;
}

/**
 * Getting the Array of strings from the original options.code 3 part period seperated string.
 * @param {string} [code] - a period separated string
 * @description In order to properly evaluate the path to the constant's message the code is expected to be a period deliminated string of 3 parts
 * @example <caption>These are the two formats allowed for string representation. The numerical version is the prefered style.</caption>
 * // 'vista.401.1007' | '100.401.1007'
 * // code parts are expected to be in one of these two orders
 * // [service-name].[http-code].[constant-number] or
 * // [service-code].[http-code].[constant-number]
 */
function getCodeParts(code) {
    var codeParts;
    if (_.isString(code)) {
        codeParts = code.split('.');
    }
    if (_.size(codeParts) === 3 && digitsOnlyRegEx.test(codeParts[2])) {
        //transform the service to its number equivalent
        if (!digitsOnlyRegEx.test(codeParts[0])) {
            codeParts[0] = errorConstants.serviceMappings[codeParts[0]];
        }
    }
    if (_.size(codeParts) !== 3) {
        codeParts = [];
    }
    return codeParts;
}

/**
 * The error passed in the constructor options or a string based on Error Constants look-up to log on the server
 * @param {Object} options
 * @param {Array.string} [options.codeParts] - Array representation of the three string parts making up an error code
 * @param {Object|string} [options.error] - An object or string representing the error
 * @return {Object|string} - passed in error object or string OR a string
 */
function getError(options) {
    var codeParts = _.get(options, 'codeParts');
    var codePartsForError = _.initial(codeParts);
    if (_.size(codePartsForError) === 2 && digitsOnlyRegEx.test(codeParts[2])) {
        codePartsForError[2] = '1000';
    }
    return _.get(options, 'error') || getErrorConstant(codePartsForError) || 'Server Error not passed into constructor!';
}

/**
 * Get the status from the passed in options
 * @param {Object} options
 * @param {Array} [options.codeParts] - the second portion of the array should be our http status code
 * @param {string} [options.status] - the status given to be the http status for the RdkError
 * @return {number}
 */
function getStatus(options) {
    var status = _.get(options, ['codeParts', 1]) || _.get(options, 'status') || rdk.httpstatus.internal_server_error;
    return parseInt(status);
}

/**
 * Gets the message to display to the client
 * @param {Object} [options]
 * @param {Array} [options.codeParts] - An array of strings to get the error constant from
 * @param {string} [options.message] - A message to use instead of the codeParts
 * @return {string}
 */
function getMessage(options) {
    var message = getErrorConstant(_.get(options, 'codeParts')) || _.get(options, 'message', 'An Unrecognised Server Error has Occurred!');
    return message;
}

/**
 * This grabs the error constant at the location provided by the codeParts String or Array
 * @param {(string|Array.string)} options.code - a period separated string OR an array of strings
 * @description In order to properly evaluate the path to the constant's message the code is expected to be a period deliminated string of 3 parts or an array of 3 strings
 * @example <caption>These are the two formats for string representation. The service code is the prefered style.</caption>
 * // 'vista.401.1007' | '100.401.1007'
 * // code parts are expected to be in one of these two orders
 * // [service-name].[http-code].[constant-number] or
 * // [service-code].[http-code].[constant-number]
 * @example <caption>These are the two formats for string array representation, where a service code is prefered.</caption>
 * // ['vista', '401', '1007'] | ['100', '401', '1007']
 * @return {String} - returns the string version of the error code if found.
 */
function getErrorConstant(codeParts) {
    return _.result(errorConstants, codeParts);
}

/**
 * Get a requestId from the options
 * @param {Object} options
 * @param {string} [options.requestId] - the requestId passed in on the constructor
 * @param {string} [options.logger.fields.requestId] - the requestId from the logger
 * @description <caption>The requestId is currently placed on the logger as a fields child by our RDK framework</caption>
 * @return {string|undefined}
 */
function getRequestId(options) {
    return _.get(options, 'requestId') || _.get(options, 'logger.fields.requestId') || _.get(options, 'logger.requestId');
}

module.exports = RdkError;
