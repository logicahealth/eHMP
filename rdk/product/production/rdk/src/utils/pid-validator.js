'use strict';

var _ = require('lodash');
var vistaSites = null;
var logger = null;


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
 * @param {String} currentSite
 * @param {String} pid
 * @returns {boolean}
 */
function isCurrentSite(currentSite, pid) {
    if (!_.isString(pid)) {
        if (_.isObject(logger)) {
            logger.debug('pid-validator.isCurrentSite returning false because it received a not string parameter for pid');
        }
        return false;
    }
    return pid.split(';')[0] === currentSite;
}


/**
 * @param {String} pid
 * @returns {boolean}
 */
function isPrimarySite(pid) {
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
        logger.debug('pid-validator.isPrimarySite returning false because it received a not string parameter for pid');
        return false;
    }
    return vistaSites[pid.split(';')[0]];
}


var icnRegex = /\w+V\w+/;
var dfnRegex = /^\d+$/;
var vhicRegex = /^VHICID;\d+/;
var pidEdipiRegex = /^DOD;\d+/;
var edipiRegex = /^[0-9]+$/;


/**
 * @param {String} pid
 * @returns {boolean}
 */
function isIcn(pid) {
    return !containsSite(pid) && icnRegex.test(pid);
}


/**
 * @param {String} pid
 * @returns {boolean}
 */
function isSiteIcn(pid) {
    return containsSite(pid) && icnRegex.test(pid.split(';')[1]);
}


/**
 * @param {String} pid
 * @returns {boolean}
 */
function isSiteDfn(pid) {
    return containsSite(pid) && dfnRegex.test(pid.split(';')[1]);
}


/**
 * @param {String} pid
 * @returns {boolean}
 */
function isPidEdipi(pid) {
    return pidEdipiRegex.test(pid);
}


/**
 * @param {String} pid
 * @returns {boolean}
 */
function isEdipi(pid) {
    return edipiRegex.test(pid);
}


/**
 * @param {String} pid
 * @returns {boolean}
 */
function isVhic(pid) {
    return containsSite(pid) && !isPrimarySite(pid) && vhicRegex.test(pid);
}


module.exports.containsSite = containsSite;
module.exports.isCurrentSite = isCurrentSite;
module.exports.isPrimarySite = isPrimarySite;
module.exports.icnRegex = icnRegex;
module.exports.dfnRegex = dfnRegex;
module.exports.isIcn = isIcn;
module.exports.isVhic = isVhic;
module.exports.isSiteIcn = isSiteIcn;
module.exports.isSiteDfn = isSiteDfn;
module.exports.isPidEdipi = isPidEdipi;
module.exports.isEdipi = isEdipi;
