'use strict';
var _ = require('lodash');
var encryptor = require('../orders/common/orders-sig-code-encryptor');
var nullchecker = require('../../utils/nullchecker');
var querystring = require('querystring');
var httpUtil = require('../../core/rdk').utils.http;
var async = require('async');

module.exports.unsigned = function(writebackContext, callback) {
    // TODO: more robust model validation.
    // probably need to add some path icn/pid to model patientIcn and pid validation
    var titleId = writebackContext.model.documentDefUid;
    var error = null;
    var logger = writebackContext.logger;
    // Add PID, author, status, and siteHash to the model
    writebackContext.model.pid = _.last(writebackContext.pid.split(';'));
    writebackContext.model.siteHash = writebackContext.siteHash;
    if (!writebackContext.model.authorUid) {
        writebackContext.model.authorUid = writebackContext.duz[writebackContext.siteHash];
    }
    logger.debug('writeback.model.authorUid: %s', writebackContext.model.authorUid);
    writebackContext.model.status = 'UNSIGNED';

    if (!titleId) {
        error = 'documentDefUid is missing from the model. A title is needed to save a note.';
    } else if (!writebackContext.model.authorUid) {
        error = 'The user could not be determined from the session. Review log.';
        logger.error({
            duz: writebackContext.duz,
            site: writebackContext.siteHash
        }, 'Failed to get user\'s duz by siteHash.');
    }

    if (error) {
        return setImmediate(callback, error);
    }

    return setImmediate(callback, null);
};

module.exports.update = function(writebackContext, callback) {
    // TODO: more robust model validation.
    var pid = writebackContext.pid;
    var ien = writebackContext.resourceId;
    var error = null;

    if (!pid || !ien) {
        error = 'The note\'s IEN and patient\'s PID are needed to update a note.';
        return setImmediate(callback, error);
    }

    // Set the model's attributes using the endpoint and session.
    writebackContext.model.pid = _.last(writebackContext.pid.split(';'));
    writebackContext.model.siteHash = writebackContext.siteHash;

    //Remove 'localId', 'authorUid', 'siteHash', and 'pid' from model so that they aren't overwritten.
    addUid(writebackContext);
    writebackContext.model.localId = ien;
    return setImmediate(callback, error);
};

module.exports.delete = function(writebackContext, callback) {
    // TODO: validate signed notes

    addUid(writebackContext);
    var error = null;
    return setImmediate(callback, error);
};

module.exports.sign = function(writebackContext, callback) {
    // TODO: validate signed notes

    var error = null;
    if (!writebackContext.model.signatureCode) {
        return setImmediate(callback, 'signatureCode is missing from the model. A signature code is required to sign a note.');
    }
    writebackContext.model.signatureCode = encryptor.encryptSig(writebackContext.model.signatureCode);
    var pid = writebackContext.pid;
    writebackContext.model.dfn = _.last(writebackContext.pid.split(';'));
    return setImmediate(callback, error);
};

var addUid = function(writebackContext) {
    writebackContext.model.uid = writebackContext.resourceId;
};