'use strict';

var _ = require('lodash');
var rdk = require('../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var pidValidator = rdk.utils.pidValidator;

/**
 * validates pid. It should be either ICN or Primary Site ID
 * Recommended interceptor order: before 'synchronize'
 */

module.exports = function(req, res, next) {
    req.logger.info('validate-pid interceptor invoked');

    var pid = _.result(req, 'query.pid') || _.result(req, 'params.pid') || _.result(req, 'body.pid') || _.result(req, 'body.icn')|| _.result(req, 'body.edipi')||'';
    if (nullchecker.isNullish(pid)) {
        return next();
    }

    if (pidValidator.isIcn(pid) || (pidValidator.isSiteDfn(pid) && pidValidator.isPrimarySite(pid))) {
        req.logger.debug('ICN or site pid: %s', pid);
        return next();
    }

    if (pidValidator.isEdipi(pid) || pidValidator.isPidEdipi(pid)) {
        req.logger.debug('is edipi: %s', pid);
        return next();
    }

    var errorMsg = "Invalid Pid. Please pass either ICN, EDIPI or Primary Site ID.";
    return res.status(400).rdkSend(errorMsg);
};
