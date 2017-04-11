'use strict';
var _ = require('lodash');
var util = require('util');
var rdk = require('../../core/rdk');
var errorConstants = require('./error-constants');
var digitsOnlyRegEx = /^\d*?$/;
var whitelist = ['code', 'message'];

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

RdkError.prototype.log = function(logger) {
    if (logger && _.isFunction(logger.error)) {
        logger.error(this);
        this.logged = true;
    }
    return this;
};

RdkError.prototype.sanitize = function() {
    return _.pick(this, whitelist);
};

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

function getCodeParts(code) {
    var codeParts = code.split('.');
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

function getError(options) {
    var codeParts = _.get(options, 'codeParts');
    var codePartsForError = _.initial(codeParts);
    if (_.size(codePartsForError) === 2 && digitsOnlyRegEx.test(codeParts[2])) {
        codePartsForError[2] = '1000';
    }
    return _.get(options, 'error') || getErrorConstant(codePartsForError) || 'Server Error';
}

function getStatus(options) {
    var status = _.get(options, ['codeParts', 1]) || _.get(options, 'status', '') || rdk.httpstatus.internal_server_error;
    return parseInt(status);
}

function getMessage(options) {
    var message = getErrorConstant(_.get(options, 'codeParts')) || _.get(options, 'error.message') || _.get(options, 'message', '');
    return message;
}
/**
 * This grabs the error constant at the location provided by the codeParts String or Array
 * @param {(string|Array.string} codeParts - a period separated string OR an array of strings
 * @example <caption>These are the two formats for string representation</caption>
 * // 'vista.401.1007' | '100.401.1007'
 * // code parts are expected to be in one of these two orders
 * // [service-name].[http-code].[constant-number] or 
 * // [service-code].[http-code].[constant-number]
 * @example <caption>These are the two formats for string array representation</caption>
 * // ['vista', '401', '1007'] | ['100', '401', '1007']
 *  
 */
function getErrorConstant(codeParts) {
    return _.result(errorConstants, codeParts, 'Undefined Server Error');
}

module.exports = RdkError;