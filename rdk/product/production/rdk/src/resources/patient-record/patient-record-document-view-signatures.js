'use strict';

var _ = require('lodash');
var httpUtil = require('../../core/rdk').utils.http;
var async = require('async');
var progressNoteResource = require('./patient-notes-resource');
var asuUtils = require('./asu-utils');

/**
 *  Adds the signaturePrintedName and signatureTitle to the document if
 *  the document has an addendum
 *
 *  @param req The request from the UI
 *  @param res The response message to the UI
 *  @param callback Callback to complete the response once the signature information is added
 */
function addSignatures(req, res, callback) {
    var users = [];

    async.each(res.data.items, function(document, asyncCallback) {
        if (document.text && document.text.length > 1) {
            async.each(document.text, function(textElement, asyncEachDocumentCallback) {
                async.parallel([
                    function(asyncParallelCallback) {
                        var signer = _.find(textElement.clinicians, {'role': 'S'});
                        addSignatureInformation(req, signer, users, asyncParallelCallback);
                    }, function(asyncParallelCallback) {
                        var cosigner = _.find(textElement.clinicians, {'role': 'C'});
                        addSignatureInformation(req, cosigner, users, asyncParallelCallback);
                    }],
                    function(err, results) {
                        if (err) {
                            req.logger.error('Error adding signer or cosigner signature information to clinician ' + err);
                            return asyncEachDocumentCallback(err);
                        }
                        return asyncEachDocumentCallback(null);
                    });
            }, function(err) {
                if (err) {
                    req.logger.error('Error adding signer or cosigner signature information to text within document ' + err);
                    return asyncCallback(err);
                }
                return asyncCallback(null);
            });

        } else {
            return asyncCallback(null);
        }
    }, function(err) {
        if (err) {
            req.logger.error('Error adding signature information to documents ' + err);
            return callback(err);
        }

        return callback(null, req, res);
    });
}

module.exports.processAddenda = function(req, res, callback) {
    async.waterfall([
        _.bind(addSignatures, null, req, res),
        getAddenda
    ], function(err, results) {
        if (err) {
            req.logger.error(err);
            return callback(err);
        }

        return callback(null, results);
    });
};

/**
 *  Helper method to add the signaturePrintedName and signatureTitle
 *  to the clinician on the document
 */
function addSignatureInformation(req, clinician, users, callback) {
    if (clinician) {
        var userCached = _.find(users, {'uid': clinician.uid});

        if (userCached) {
            clinician.signaturePrintedName = userCached.signaturePrintedName;
            clinician.signatureTitle = userCached.signatureTitle;
            return callback(null);
        } else {
            var options = _.extend({}, req.app.config.jdsServer, {
                url: '/data/' + clinician.uid,
                logger: req.logger,
                json: true
            });

            httpUtil.get(options, function(err, response, body) {
                if (err) {
                    req.logger.error('Error retrieving user to add signature information ' + err);
                    return callback(err);
                }

                if(!_.isEmpty(_.get(body, 'data.items'))){
                    //DE8224: RDK Uncaught Exception - patient-record-document-view-signatures
                    //In production we see this is not necessarily populated.
                    // We've seen that when this info is missing, UI falls back to showing just the author name.
                    var user = body.data.items[0];
                    clinician.signaturePrintedName = user.signaturePrintedName;
                    clinician.signatureTitle = user.signatureTitle;
                    users.push(user);
                }
                return callback(null);
            });
        }
    } else {
        return callback(null);
    }
}

function getAddenda(req, res, callback) {
    progressNoteResource.getAddendaFromPjds(req, false, function(error, notesWithAddenda) {
        if (error === 'NOT REGULAR PID') {
            return callback(null, res);
        } else if (error) {
            req.logger.error(error);
            return callback(error);
        }

        _.each(res.data.items, function (document) {
            if (document.documentClass === 'PROGRESS NOTES') {
                var noteWithAddenda = _.find(notesWithAddenda.notes, {uid: document.uid});

                if (noteWithAddenda) {
                    document.addenda = noteWithAddenda.addenda;
                    document.addenda = document.addenda.concat(noteWithAddenda.unsignedAddenda);
                    document.addenda = progressNoteResource.customAddendumDateSort(document.addenda);

                    var site = req.session.user.site;
                    var user = req.session.user.duz[site];
                    var authorUid = 'urn:va:user:' + site + ':' + user;

                    _.each(document.addenda, function(addendum) {
                        if (authorUid !== addendum.authorUid && addendum.status === 'UNSIGNED') {
                            if (addendum.addendumBody) {
                                addendum.addendumBody = asuUtils.NO_PERMISSION_FOR_ADDENDUM;
                            }

                            _.each(addendum.text, function(textElement) {
                                textElement.content = asuUtils.NO_PERMISSION_FOR_ADDENDUM;

                                if (textElement.contentPreview) {
                                    textElement.contentPreview = asuUtils.NO_PERMISSION_FOR_ADDENDUM;
                                }
                            });
                        }
                    });
                }
            }
        });

        callback(null, res);
    });
}

module.exports.addSignatures = addSignatures;
