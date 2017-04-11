'use strict';

var _ = require('lodash');
var auditUtil = require('../../utils/audit');

function setAuditInfo(writebackContext, category) {
    if (!_.isUndefined(writebackContext.audit)) {
        writebackContext.audit.dataDomain = 'progress-notes';
        writebackContext.audit.logCategory = category;
        writebackContext.audit.patientId = writebackContext.pid;
    }

    if (!_.isUndefined(writebackContext.model)) {
        auditUtil.addAdditionalMessage(writebackContext, 'NotesBody', writebackContext.model);
    }
}

module.exports.create = function(writebackContext, callback) {
    setAuditInfo(writebackContext, 'ADD_NOTE');
    var error = null;
    return setImmediate(callback, error);
};

module.exports.createAddendum = function(writebackContext, callback) {
    setAuditInfo(writebackContext, 'ADD_ADDENDUM');
    var error = null;
    return setImmediate(callback, error);
};

module.exports.update = function(writebackContext, callback) {
    setAuditInfo(writebackContext, 'UPDATE_NOTE');
    var error = null;
    return setImmediate(callback, error);
};

module.exports.deleteAddendum = function(writebackContext, callback) {
    setAuditInfo(writebackContext, 'DELETE_UNSIGNED_NOTE_ADDENDUM');
    var error = null;
    return setImmediate(callback, error);
};

module.exports.updateAddendum = function(writebackContext, callback) {
    setAuditInfo(writebackContext, 'UPDATE_ADDENDUM');
    var error = null;
    return setImmediate(callback, error);
};

module.exports.sign = function(writebackContext, callback) {
    setAuditInfo(writebackContext, 'SIGN_NOTE');
    var error = null;
    return setImmediate(callback, error);
};

module.exports.signAddendum = function(writebackContext, callback) {
    setAuditInfo(writebackContext, 'SIGN_ADDENDUM');
    var error = null;
    return setImmediate(callback, error);
};

module.exports.delete = function(writebackContext, callback) {
    setAuditInfo(writebackContext, 'DELETE_UNSIGNED_NOTE');
    var error = null;
    return setImmediate(callback, error);
};
