'use strict';

// a more sophisticated 'dummy logger' from which we can actually read.
var fatalLog = '';
var errorLog = '';
var warnLog = '';
var infoLog = '';
var debugLog = '';
var traceLog = '';

function fatal(s) {
    fatalLog = fatalLog + s + '\n';
}
function error(s) {
    errorLog = errorLog + s + '\n';
}
function warn(s) {
    warnLog = warnLog + s + '\n';
}
function info(s) {
    infoLog = infoLog + s + '\n';
}
function debug(s) {
    debugLog = debugLog + s + '\n';
}
function trace(s) {
    traceLog = traceLog + s + '\n';
}

module.exports.fatal = fatal;
module.exports.error = error;
module.exports.warn = warn;
module.exports.info = info;
module.exports.debug = debug;
module.exports.trace = trace;

function getFatal() {
    return fatalLog;
}
function getError() {
    return errorLog;
}
function getWarn() {
    return warnLog;
}
function getInfo() {
    return infoLog;
}
function getDebug() {
    return debugLog;
}
function getTrace() {
    return traceLog;
}

module.exports.getFatal = getFatal;
module.exports.getError = getError;
module.exports.getWarn = getWarn;
module.exports.getInfo = getInfo;
module.exports.getDebug = getDebug;
module.exports.getTrace = getTrace;
