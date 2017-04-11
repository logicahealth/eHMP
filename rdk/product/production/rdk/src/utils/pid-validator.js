'use strict';

var _ = require('lodash');
var vistaSites = null;
var rdk = require('../core/rdk');
var logger = null;

module.exports.initialize = function(app) {
    var appVistaSites = _.get(app, 'config.vistaSites');
    var appLogger = _.get(app, 'logger');
    if(!_.isObject(appLogger)) {
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

function containsSite(pid) {
    return pid.indexOf(';') !== -1;
}
function isCurrentSite(currentSite, pid) {
    return pid.split(';')[0] === currentSite;
}
function isPrimarySite(pid) {
    if(!_.isObject(logger)) {
        console.error('pid-validator#containsSite process.exit - no logger found');
        process.exit(1);
    }
    if (!_.isObject(vistaSites)) {
        console.error('pidValidator: attempted to access vista site configuration when none exists');
        logger.fatal('pidValidator: attempted to access vista site configuration when none exists');
        process.exit(1);
    }
    return vistaSites[pid.split(';')[0]];
}

var icnRegex = /\w+V\w+/;
var dfnRegex = /^\d+$/;
var vhicRegex = /^VHICID;\d+/;
var pidEdipiRegex = /^DOD;\d+/;
var edipiRegex = /^[0-9]+$/;
function isIcn(pid) {
    return !containsSite(pid) && icnRegex.test(pid);
}
function isDfn(pid) {
    return !containsSite(pid) && dfnRegex.test(pid);
}
function isSiteIcn(pid) {
    return containsSite(pid) && icnRegex.test(pid.split(';')[1]);
}
function isSiteDfn(pid) {
    return containsSite(pid) && dfnRegex.test(pid.split(';')[1]);
}

function isPidEdipi(pid) {
    return pidEdipiRegex.test(pid);
}
function isEdipi(pid) {
    return edipiRegex.test(pid);
}
function isVhic(pid) {
    return containsSite(pid) && !isPrimarySite(pid) && vhicRegex.test(pid);
}

module.exports.containsSite = containsSite;
module.exports.isCurrentSite = isCurrentSite;
module.exports.isPrimarySite = isPrimarySite;
module.exports.icnRegex = icnRegex;
module.exports.dfnRegex = dfnRegex;
module.exports.isIcn = isIcn;
module.exports.isDfn = isDfn;
module.exports.isVhic = isVhic;
module.exports.isSiteIcn = isSiteIcn;
module.exports.isSiteDfn = isSiteDfn;
module.exports.isPidEdipi = isPidEdipi;
module.exports.isEdipi = isEdipi;
