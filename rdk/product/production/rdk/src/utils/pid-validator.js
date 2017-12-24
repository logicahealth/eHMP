'use strict';

var _ = require('lodash');
var vistaSites = null;
var logger = null;

/**
 * Called during the setup of the express application to set
 * up the vistaSites and logger
 */
module.exports.initialize = function(app) {
    var appVistaSites = _.get(app, 'config.vistaSites');
    var appLogger = _.get(app, 'logger');
    if (!_.isObject(appLogger)) {
        console.log('pid-validator#initialize process.exit - no logger found');
        process.exit(1);
    }
    logger = appLogger;
    if (!_.isObject(appVistaSites)) {
        console.error('pidValidator: attempted to initialize with no VistA sites defined');
        app.logger.fatal('pidValidator: attempted to initialize with no VistA sites defined');
        process.exit(1);
    }
    vistaSites = appVistaSites;
};


/**
 * Checks that a string is present before the semicolon and
 * that there is a semicolon present. Does not check the validity
 * of the site
 * @param {String} pid
 * @returns {boolean}
 */
function containsSite(pid) {
    if (!_.isString(pid)) {
        if (_.isObject(logger)) {
            logger.debug('pid-validator.containsSite returning false because it received a not string parameter for pid');
        }
        return false;
    }
    return pid.indexOf(';') > 0;
}


/**
 * Check to see if this pid is from the users currently
 * authenticated site
 * @param {Object} req - the express request object
 * @param {String} pid
 * @returns {boolean}
 */
function isCurrentSite(req, pid) {
    var currentSite = _.get(req, 'session.user.site', null);
    if (!_.isString(currentSite)) {
        if (_.isObject(logger)) {
            logger.debug('pid-validator.isCurrentSite returning false because no site could be found on this user');
        }
        return false;
    }

    return containsSameSite(currentSite, pid);
}


/**
 * Checks to see if the passed in pid's site matches the passed in site
 * @param {String} site
 * @param {String} pid
 * @returns {boolean}
 */
function containsSameSite(site, pid) {
    if (!_.isString(pid)) {
        if (_.isObject(logger)) {
            logger.debug('pid-validator.containsSameSite returning false because it received a not string parameter for pid');
        }
        return false;
    }
    return pid.split(';')[0] === site;
}


/**
 * This function identifies and returns the primary site configuration that the pid
 * @param {String} pid
 * @returns {Object|boolean} - Site object if found else false returned
 */
function isPrimarySite(pid) {
    var primarySiteForPid;
    if (!_.isObject(logger)) {
        console.error('pid-validator#containsSite process.exit - no logger found');
        process.exit(1);
    }
    if (!_.isObject(vistaSites)) {
        console.error('pidValidator: attempted to access vista site configuration when none exists');
        logger.fatal('pidValidator: attempted to access vista site configuration when none exists');
        process.exit(1);
    }
    if (!_.isString(pid)) {
        logger.debug('pid-validator.isPrimarySite returning false because it received a not string parameter for pid: %s', pid);
        return false;
    }
    if (!containsSite(pid)) {
        logger.debug('pid-validator.isPrimarySite returning false because there is no site passed in: %s', pid);
        return false;
    }
    primarySiteForPid = vistaSites[pid.split(';')[0]];
    if (!_.isObject(primarySiteForPid)) {
        logger.debug('pid-validator.isPrimarySite returning false because there is no known site for pid: %s', pid);
        return false;
    }
    logger.debug('pid-validator.isPrimarySite returning true for pid: %s', pid);
    return primarySiteForPid;
}

/**
 * This function checks to make sure this is a secondary type pid,
 * ensures that it's NOT a primary site, then checks to make sure that
 * an unrecognized secondary site and ICN wasn't used.
 * Returns false by default since we could not identify the pid as
 * secondary
 * @param {String} pid - <site>;<patient identifier>
 * @returns {boolean}
 */
function isSecondarySite(pid) {
    if (!_.isObject(logger)) {
        console.error('pid-validator#containsSite process.exit - no logger found');
        process.exit(1);
    }
    if (isVhic(pid) || isPidEdipi(pid) || isPidHdr(pid)) {
        logger.debug('pid-validator.isSecondarySite returning true for pid: %s', pid);
        return true;
    }
    if (isIcn(pid)) {
        logger.debug('pid-validator.isSecondarySite returning false for an ICN: %s', pid);
        return false;
    }
    var primarySite = isPrimarySite(pid);
    if (_.isObject(primarySite)) {
        logger.debug('pid-validator.isSecondarySite returning false because the pid belongs to a known site');
        return false;
    }
    if (isSiteIcn(pid) && !primarySite) {
        logger.debug('pid-validator.isSecondarySite returning true for ICN that is not a primary site: %s', pid);
        return true;
    }
    logger.debug('pid-validator.isSecondarySite returning false because the pid was not identifable as a secondary site');
    return false;
}


var icnRegex = /\w+V\w+/;
var dfnRegex = /^\d+$/;
var vhicRegex = /^VHICID;\d+/;
var pidEdipiRegex = /^DOD;\d+/;
var pidHdrRegex= /^HDR;\w+V\w+/;
var edipiRegex = /^[0-9]+$/;


/**
 * Checks that the passed in id is a type of ICN. ICN is
 * not a valid form of a "pid", but it is a valid patient identifier
 * @param {String} id - <patient identifier>
 * @example 123456v78910
 * @returns {boolean}
 */
function isIcn(id) {
    return !containsSite(id) && icnRegex.test(id);
}


/**
 * Checks that the passed in id is a type of <site>;<icn>
 * @param {String} id - <site>;<patient identifier>
 * @example SITE;123456v78910
 * @returns {boolean}
 */
function isSiteIcn(id) {
    return containsSite(id) && icnRegex.test(id.split(';')[1]);
}


/**
 * Checks that the passed in id is a type of <site>;<dfn>
 * DFN is a type of VistA identifier also known as
 *    - Internal Entry Number (IEN)
 *    - Local Identifier
 * @param {String} id - <site>;<patient identifier>
 * @example SITE;758946
 * @returns {boolean}
 */
function isSiteDfn(id) {
    return containsSite(id) && dfnRegex.test(id.split(';')[1]);
}


/**
 * Checks that the passed in id is a specific type of secondary
 * site pid where the site is DOD and the patient identifier
 * is numerical
 * @param {String} id - <site>;<patient identifier>
 * @example DOD;9672354
 * @returns {boolean}
 */
function isPidEdipi(id) {
    return pidEdipiRegex.test(id);
}


/**
 * Checks that the passed in id is a strictly numerical identifier
 * this passed in "pid" is not a true pid
 * @param {String} id - <patient identifier>
 * @example 9234734
 * @returns {boolean}
 */
function isEdipi(id) {
    return edipiRegex.test(id);
}

/**
 * Checks that the passed in id is a specific type of secondary
 * site pid where the site id HDR and the patient identifier is
 * an ICN
 * @param {String} id - <site>;<patient identifier>
 * @example HDR;101987v654321
 * @returns {boolean}
 */
function isPidHdr(id) {
    return pidHdrRegex.test(id);
}


/**
 * Checks that that passed in id is a specific type of secondary
 * site pid where the patient identifier is numerical and
 * preceeded by a site of VHICID
 * @param {String} pid - <site>;<patient identifier>
 * @example VHICID;7895433456
 * @returns {boolean}
 */
function isVhic(pid) {
    return containsSite(pid) && !isPrimarySite(pid) && vhicRegex.test(pid);
}


module.exports.containsSite = containsSite;
module.exports.isCurrentSite = isCurrentSite;
module.exports.isPrimarySite = isPrimarySite;
module.exports.isSecondarySite = isSecondarySite;
module.exports.containsSameSite = containsSameSite;
module.exports.icnRegex = icnRegex;
module.exports.dfnRegex = dfnRegex;
module.exports.isIcn = isIcn;
module.exports.isVhic = isVhic;
module.exports.isSiteIcn = isSiteIcn;
module.exports.isSiteDfn = isSiteDfn;
module.exports.isPidEdipi = isPidEdipi;
module.exports.isEdipi = isEdipi;
module.exports.isPidHdr = isPidHdr;
