'use strict';

var async = require('async');
var _ = require('lodash');
var moment = require('moment');
var VistaArray = require('../core/VistaArray').VistaArray;
var rpcClientFactory = require('../core/rpc-client-factory');
var paramUtil = require('../../utils/param-converter');
var namecaseUtil = require('../../utils/namecase-utils');
var filemanDateUtil = require('../../utils/fileman-date-converter');
var nullchecker = require('../../utils/nullchecker');
var VISTA_DELTE_ERR = 'You may not DELETE';
var DELETE_ERR_MSG = 'To delete a note you must be the author of it and have authorization.';


module.exports.createNotes = function(writebackContext, callback) {

    var rpcName = 'TIU CREATE RECORD';
    var logger = writebackContext.logger;
    writebackContext.vprModel = [];
    var errorObject = {
        error: 'Failed to create these notes in VistA.',
        notes: []
    };
    var pid = _.last(writebackContext.pid.split(';'));

    rpcClientFactory.getRpcClient(writebackContext, null, function(err, rpcClient) {
        if (err) {
            return callback(err);
        }
        writebackContext.notes = [];
        async.each(writebackContext.model.signItems, function(note, cb) {
            rpcClient.execute(
                rpcName,
                getNoteParams(note),
                function(err, response) {
                    if (err || response.indexOf('^') > -1) {
                        errorObject.notes.push({
                            uid: note.uid,
                            error: err,
                            response: response
                        });
                        return cb();
                    } else {
                        var vprModel = _.clone(note);
                        vprModel.localId = response;
                        vprModel.oldUid = note.uid;
                        vprModel.uid = 'urn:va:document:' + writebackContext.siteHash + ':' + pid + ':' + response;
                        writebackContext.notes.push(vprModel);
                        return cb();
                    }
                }
            );
        }, function(err) {
            if (err) {
                logger.error('Something went wrong', err);
                return callback(errorObject);
            } else {
                if (errorObject.notes.length > 0) {
                    if (writebackContext.notes.length === 0) {
                        errorObject.error = 'Failed to write any of the notes in VistA.';
                        return callback(errorObject);
                    }
                    // TODO: handle partial success
                }
                return callback(null);
            }
        });
    });
};

module.exports.deleteVpr = function(writebackContext, callback) {

    if (_.isUndefined(writebackContext.deletedNotes) || writebackContext.deletedNotes.length === 0) {
        return callback(null);
    }

    rpcClientFactory.getRpcClient(writebackContext, null, function(err, rpcClient) {
        if (err) {
            return callback(err);
        }
        rpcClient.execute(
            'GMV GET CURRENT TIME', '',
            function(err, response) {
                // '^' in the response indicates an error
                if (err || response.indexOf('^') > -1) {
                    return callback({
                        error: 'Call to GMV GET CURRENT TIME failed.'
                    });
                }

                // get time from response
                var lastUpdateTime = filemanDateUtil.getVprDateTime(response);

                _.each(writebackContext.deletedNotes, function(note) {
                    writebackContext.vprModel.push({
                        'uid': note.uid,
                        'lastUpdateTime': lastUpdateTime,
                        'removed': true
                    });
                });
                return callback(null);
            }
        );
    });
};

module.exports.setVpr = function(writebackContext, callback) {

    if (_.isUndefined(writebackContext.signedNotes) || writebackContext.signedNotes.length === 0) {
        return callback(null);
    }

    var rpcName = 'HMP GET PATIENT DATA JSON';

    // TODO: These params will only get the first note in the array.
    // Update this for multi-sign. - maybe use GMV GET CURRENT TIME or a loop
    var rpcParams = {
        '"patientId"': writebackContext.model.dfn,
        '"domain"': 'document',
        '"uid"': writebackContext.signedNotes[0].uid
    };

    rpcClientFactory.getRpcClient(writebackContext, null, function(err, rpcClient) {
        if (err) {
            return callback(err);
        }
        rpcClient.execute(rpcName, rpcParams, function(err, resp) {
            if (err) {
                return callback(err);
            }

            var parsedJson;
            try {
                parsedJson = JSON.parse(resp);
                writebackContext.vprModel = parsedJson.data.items;
            } catch (e) {
                return callback({
                    parseError: {
                        rdkMessage: 'Failed to parse the repsonse from VistA. The newly signed note(s) may not be immediately available in JDS.',
                        error: e,
                        VistaResponse: resp
                    }
                });
            }
            return callback(null);
        });
    });
};

module.exports.signNotes = function(writebackContext, callback) {

    var logger = writebackContext.logger;
    var errorObject = {
        error: 'Failed to sign.',
        notes: []
    };
    writebackContext.signedNotes = [];
    writebackContext.failedSigns = [];
    async.each(writebackContext.notes, function(note, cb) {
        logger.debug('note: %o', note);
        signNote(writebackContext, note, function(err, response) {
            var comment = 'Failed to sign.';
            var logger = writebackContext.logger;
            var appConfig = writebackContext.appConfig;
            var requestConfig = {};
            var options;
            if (err) {
                writebackContext.failedSigns.push(note);
                errorObject.notes.push({
                    uid: note.uid,
                    VistaError: err,
                    VistaResponse: response,
                    comment: comment
                });
            } else {
                writebackContext.signedNotes.push(note);
            }
            return cb();
        });
    }, function(err) {
        if (err) {
            logger.error('Something went wrong', err);
            return callback(err);
        }
        writebackContext.vprResponse = {};

        if (errorObject.notes.length > 0) {
            var resp = writebackContext.vprResponse.failures = errorObject;
            if (writebackContext.signedNotes.length === 0) {
                writebackContext.vprResponseStatus = 500;
                resp.error = 'Failed to sign any of the notes in VistA. They remain UNSIGNED.';
                return callback(null);
            }
            writebackContext.vprResponseStatus = 207;
        }

        var signer = {
            signerUid: writebackContext.duz && writebackContext.duz[writebackContext.siteHash],
            signer: writebackContext.model.signItems[0].authorDisplayName, //will need to change for additional signers and co-signers
            signerDisplayName: writebackContext.model.signItems[0].authorDisplayName //will need to change for additional signers and co-signers
        };

        _.each(writebackContext.signedNotes, function(item) {
            item.signedDateTime = moment().format('YYYYMMDDHHmmss');
            item.signer = signer.signer;
            item.signerDisplayName = namecaseUtil.namecase(signer.signerDisplayName.toLowerCase());
            item.signerUid = signer.signerUid;
            item.statusDisplayName = 'Completed';
            item.status = 'COMPLETED';

            _.each(item.text, function(innerItem) {
                innerItem.signer = signer.signer;
                innerItem.signerUid = signer.signerUid;
                innerItem.status = 'COMPLETED';
                innerItem.signerDisplayName = 'Completed';
            });
        });

        writebackContext.vprResponse.successes = {
            signedNotes: writebackContext.signedNotes
        };
        return callback(null);
    });
};

module.exports.validateSignature = function(writebackContext, callback) {
    rpcClientFactory.getRpcClient(writebackContext, null, function(err, rpcClient) {
        if (err) {
            return callback(err);
        }
        var rpcName = 'ORWU VALIDSIG';
        rpcClient.execute(rpcName, writebackContext.model.signatureCode, function(err, data) {
            var dataString = '' + data;
            if (err) {
                return callback(err);
            }
            if (dataString === '0') {
                writebackContext.logger.error('Invalid signature. RPC response: ' + data);
                return callback('Invalid e-signature.');
            } else {
                return callback(null);
            }
        });
    });
};

module.exports.deleteNotes = function(writebackContext, callback) {
    var logger = writebackContext.logger;
    writebackContext.failedDeletes = [];
    writebackContext.deletedNotes = [];
    async.each(writebackContext.failedSigns, function(note, cb) {
        deleteNote(writebackContext, note, function(err, response) {
            if (err) {
                writebackContext.failedDeletes.push(note);
            } else {
                writebackContext.deletedNotes.push(note);
            }
            return cb();
        });
    }, function(err) {
        if (err) {
            logger.error('Something went wrong', err);
            return callback(err);
        }
        return callback(null);
    });
};

function deleteNote(writebackContext, note, callback) {
    rpcClientFactory.getRpcClient(writebackContext, null, function(err, rpcClient) {
        if (err) {
            return callback(err);
        }
        var rpcName = 'TIU DELETE RECORD';
        var parameters = [];
        parameters.push(note.localId, '');
        rpcClient.execute(
            rpcName,
            parameters,
            function(err, response) {
                if (err || response.indexOf(VISTA_DELTE_ERR) !== -1) {
                    return callback({
                        vistaError: {
                            err: err ? err + DELETE_ERR_MSG : DELETE_ERR_MSG,
                            data: response
                        }
                    });
                }
                return callback(null);
            }
        );
    });
}

function signNote(writebackContext, note, cb) {
    rpcClientFactory.getRpcClient(writebackContext, null, function(err, rpcClient) {
        if (err) {
            return cb(err);
        }
        rpcClient.execute(
            'TIU SIGN RECORD', [note.localId, writebackContext.model.signatureCode],
            function(err, response) {
                // '^' in the response indicates an error
                if (err || response.indexOf('^') > -1 || response !== '0') {
                    return cb('ERROR', response);
                }
                return cb(null);
            }
        );
    });
}

function getNoteParams(model) {
    var vistaNote = [];
    var noteObj = {};
    var split = model.pid.split(';');
    var encounter = encounterObj(model);

    vistaNote.push(_.last(split)); // Patient dfn
    split = model.documentDefUid.split(':');
    vistaNote.push(_.last(split)); // Document Type (title)
    vistaNote.push('', '', ''); // unused (VDT - visit DT/ VLOC - vistit location/ VSIT - pointer to visit file.
    split = model.authorUid.split(':');
    noteObj['1202'] = _.last(split); // author/dictator uid
    // reference DT
    noteObj['1301'] = model.referenceDateTime ? filemanDateUtil.getFilemanDateTime(paramUtil.convertWriteBackInputDate(model.referenceDateTime).toDate()) : '';
    noteObj['1205'] = encounter.location ? encounter.location : ''; // encounter location

    // Note Text
    addNoteText(noteObj, model.text[0].content);

    vistaNote.push(noteObj);

    /*  This parameter identifies the visit location, date/time, and Service
        Category (Hospitalization, Ambulatory, Telecommunications, or Event
        (HISTORICAL)) in the form of a semi-colon delimited string (e.g.,
        "469;2970616.1415;A").
    */
    if (encounter.location) {
        vistaNote.push(encounter.location + ';' + encounter.dateTime + ';' + encounter.category);
    }

    // trailing unrequired args
    vistaNote.push('', '');
    return vistaNote;
}

function addNoteText(noteObj, text) {
    var MAX_LENGTH = 80;
    var textLines = text.split('\n');
    var lineNumber = 1;
    _.each(textLines, function(line) {
        while (line.length > MAX_LENGTH) {
            var maxLine = line.substr(0, MAX_LENGTH);
            var index = (maxLine.lastIndexOf(' ') + 1) || MAX_LENGTH;
            var thisLine = maxLine.substr(0, index);
            noteObj['\"TEXT\",' + lineNumber.toString() + ',0'] = thisLine;
            lineNumber += 1;
            line = line.substring(index);
        }
        noteObj['\"TEXT\",' + lineNumber.toString() + ',0'] = line;
        lineNumber += 1;
    });
    return;
}

function encounterObj(model) {
    var location = model.locationIEN;
    var dateTime = model.encounterDateTime;
    var category = model.encounterServiceCategory;

    if (model.encounterDateTime) {
        dateTime = filemanDateUtil.getFilemanDateTimeWithSeconds(paramUtil.convertWriteBackInputDate(model.encounterDateTime).toDate());
    }

    if (!category || !dateTime || !location) {
        return {};
    }

    return {
        location: location,
        dateTime: dateTime,
        category: category
    };
}
module.exports._encounterObj = encounterObj;
