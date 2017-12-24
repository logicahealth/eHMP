'use strict';

var _ = require('lodash');
var rdk = require('../core/rdk');
var pidValidator = rdk.utils.pidValidator;
var RdkError = rdk.utils.RdkError;

/**
 * validates pid. It should be either ICN or Primary Site ID
 * Recommended interceptor order: before 'synchronize'
 */

module.exports = function(req, res, next) {
    req.logger.info('validate-pid interceptor invoked');

    var pid = _.result(req, 'query.pid') || _.result(req, 'params.pid') || _.result(req, 'body.pid') || _.result(req, 'body.icn') || _.result(req, 'body.edipi') || '';

    if (_.isEmpty(pid)) {
        req.logger.debug('No pid passed, moving on: (%s)', pid);
        return next();
    }

    if (pidValidator.isCurrentSite(req, pid)) {
        req.logger.debug('pid matches current user site: (%s)', pid);
        return next();
    }

    if (pidValidator.isIcn(pid)) {
        req.logger.debug('pid matches an ICN pattern: (%s)', pid);
        return next();
    }

    if (pidValidator.isSiteDfn(pid) && pidValidator.isPrimarySite(pid)) {
        req.logger.debug('pid matches a primary site known to RDK: (%s)', pid);
        return next();
    }

    if (pidValidator.isSecondarySite(pid)) {
        req.logger.debug('pid matches a secondary site: (%s)', pid);
        return next();
    }

    if (pidValidator.isSiteDfn(pid)) {
        /**
         * DE7867: added to allow read of information that matches the <site>;<dfn> pattern.
         * This was done because in production VxSync knows many more sites than RDK and passes that data to JDS
         * RDK then passes it to the UI and when the UI requests that information RDK stops here because the site isn't in the config.vistaSites section
         */
        req.logger.warn('We are assuming that (%s) is known to VxSync but not RDK', pid);
        return next();
    }

    var rdkError = new RdkError({
        code: '200.400.1027',
        logger: req.logger,
        error: 'ERROR: The pid given as (' + pid + ') does not match any Primary or Secondary sites and is not in the format of an ICN.'
    });
    return res.status(rdkError.status).rdkSend(rdkError);
};
