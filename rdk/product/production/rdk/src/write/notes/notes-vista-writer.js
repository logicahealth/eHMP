'use strict';

var async = require('async');
var _ = require('lodash');
var moment = require('moment');
var VistaArray = require('../core/VistaArray').VistaArray;
var rpcClientFactory = require('../core/rpc-client-factory');
var rdk = require('../../core/rdk');
var locationUtil = rdk.utils.locationUtil;
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

module.exports.createAddendum = function(writebackContext, callback) {
    var rpcName = 'TIU CREATE ADDENDUM RECORD';
    var logger = writebackContext.logger;
    writebackContext.vprModel = [];
    var errorObject = {
        error: 'Failed to create note addendum in VistA.',
        addendum: []
    };
    var pid = _.last(writebackContext.pid.split(';'));
    rpcClientFactory.getRpcClient(writebackContext, null, function(err, rpcClient) {
        if (err) {
            return callback(err);
        }
        writebackContext.addendum = [];
        async.each(writebackContext.model.signItems, function(addendum, cb) {
            rpcClient.execute(
                rpcName,
                getAddendumParams(addendum),
                function(err, response) {
                    if (err || response.indexOf('^') > -1) {
                        errorObject.addendum.push({
                            uid: addendum.uid,
                            error: err,
                            response: response
                        });
                        return cb();
                    } else {
                        var vprModel = _.clone(addendum);
                        vprModel.localId = response;
                        vprModel.oldUid = addendum.uid;
                        vprModel.uid = 'urn:va:document:' + writebackContext.siteHash + ':' + pid + ':' + response;
                        writebackContext.addendum.push(vprModel);
                        return cb();
                    }
                }
            );
        }, function(err) {
            if (err) {
                logger.error('Something went wrong', err);
                return callback(errorObject);
            } else {
                if (errorObject.addendum.length > 0) {
                    if (writebackContext.addendum.length === 0) {
                        errorObject.error = 'Failed to write note addendum in VistA.';
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

function deleteVprAddendum(writebackContext, callback) {

    if (_.isUndefined(writebackContext.deletedAddendums) || writebackContext.deletedAddendums.length === 0) {
        return callback(null);
    }

    var rpcName = 'HMP GET PATIENT DATA JSON';

    var rpcParams = {
        '"patientId"': writebackContext.model.dfn,
        '"domain"': 'document',
        '"uid"': writebackContext.deletedAddendums[0].parentUid
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
                        rdkMessage: 'Failed to parse the repsonse from VistA. The deleted addendum(s) may not be immediately available in JDS.',
                        error: e,
                        VistaResponse: resp
                    }
                });
            }
            return callback(null);
        });
    });
}

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
                writebackContext.vprResponse.successes.signedNotes = writebackContext.vprModel = parsedJson.data.items;
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

module.exports.setVprAddendum = function(writebackContext, callback) {
    if (_.isUndefined(writebackContext.signedAddendums) || writebackContext.signedAddendums.length === 0) {
        return callback(null);
    }

    var rpcName = 'HMP GET PATIENT DATA JSON';

    // TODO: These params will only get the first note in the array.
    // Update this for multi-sign. - maybe use GMV GET CURRENT TIME or a loop
    var rpcParams = {
        '"patientId"': writebackContext.model.dfn,
        '"domain"': 'document',
        '"uid"': writebackContext.signedAddendums[0].parentUid
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
                writebackContext.vprResponse.successes.signedAddendums = writebackContext.vprModel = parsedJson.data.items;
            } catch (e) {
                return callback({
                    parseError: {
                        rdkMessage: 'Failed to parse the repsonse from VistA. The newly signed addendum(s) may not be immediately available in JDS.',
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
        if (!_.isObject(writebackContext.vprResponse)) {
            writebackContext.vprResponse = {};
        }

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

module.exports.signAddendum = function(writebackContext, callback) {

    var logger = writebackContext.logger;
    var errorObject = {
        error: 'Failed to sign.',
        addendum: []
    };
    writebackContext.signedAddendums = [];
    writebackContext.failedSignAddendums = [];
    async.each(writebackContext.addendum, function(addendum, cb) {
        logger.debug('note: %o', addendum);
        signAddendum(writebackContext, addendum, function(err, response) {
            var comment = 'Failed to sign.';
            var logger = writebackContext.logger;
            var appConfig = writebackContext.appConfig;
            var requestConfig = {};
            var options;
            if (err) {
                writebackContext.failedSignAddendums.push(addendum);
                errorObject.addendum.push({
                    uid: addendum.uid,
                    VistaError: err,
                    VistaResponse: response,
                    comment: comment
                });
            } else {
                writebackContext.signedAddendums.push(addendum);
            }
            return cb();
        });
    }, function(err) {
        if (err) {
            logger.error('Something went wrong', err);
            return callback(err);
        }
        if (!_.isObject(writebackContext.vprResponse)) {
            writebackContext.vprResponse = {};
        }

        if (errorObject.addendum.length > 0) {
            var resp = writebackContext.vprResponse.failures = errorObject;
            // if (writebackContext.signedAddendums.length === 0) {
                writebackContext.vprResponseStatus = 500;
                resp.error = 'Failed to sign the addendum in VistA. They remain UNSIGNED.';

                deleteAddendum(writebackContext, function(error) {
                    if (error) {
                        return callback(error);
                    }

                    deleteVprAddendum(writebackContext, function(error) {
                        if (error) {
                            return callback(error);
                        }

                        return callback('Failed to sign the addendum. Successfully cleaned up the addendum in VistA.');
                    });
                });
            // }
            // writebackContext.vprResponseStatus = 207;
        } else {
            var signer = {
                signerUid: writebackContext.duz && writebackContext.duz[writebackContext.siteHash],
                signer: writebackContext.model.signItems[0].authorDisplayName, //will need to change for additional signers and co-signers
                signerDisplayName: writebackContext.model.signItems[0].authorDisplayName //will need to change for additional signers and co-signers
            };

            _.each(writebackContext.signedAddendums, function(item) {
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
                signedAddendums: writebackContext.signedAddendums
            };
            return callback(null);
        }
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

function deleteAddendum(writebackContext, callback) {
    var logger = writebackContext.logger;
    writebackContext.failedDeleteAddendums = [];
    writebackContext.deletedAddendums = [];
    async.each(writebackContext.failedSignAddendums, function(addendum, cb) {
        deleteAddendumFromVistA(writebackContext, addendum, function(err, response) {
            if (err) {
                writebackContext.failedDeleteAddendums.push(addendum);
            } else {
                writebackContext.deletedAddendums.push(addendum);
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
}

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

function deleteAddendumFromVistA(writebackContext, addendum, callback) {
    rpcClientFactory.getRpcClient(writebackContext, null, function(err, rpcClient) {
        if (err) {
            return callback(err);
        }
        var rpcName = 'TIU DELETE RECORD';
        var parameters = [];
        parameters.push(addendum.localId, '');
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

function signAddendum(writebackContext, addendum, cb) {
    rpcClientFactory.getRpcClient(writebackContext, null, function(err, rpcClient) {
        if (err) {
            return cb(err);
        }
        rpcClient.execute(
            'TIU SIGN RECORD', [addendum.localId, writebackContext.model.signatureCode],
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
    addText(noteObj, model.text[0].content);

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

function getAddendumParams(model) {
    var vistaAddendum = [];
    var addendumObj = {};
    var split = model.parentUid.split(':');
    // Addendum params
    vistaAddendum.push(_.last(split)); // TIUDA - record number of the parent document (parent note)
    // TIUX params
    split = model.authorUid.split(':');
    addendumObj['1202'] = _.last(split); // author/dictator uid
    // reference DT
    addendumObj['1301'] = model.referenceDateTime ? filemanDateUtil.getFilemanDateTime(paramUtil.convertWriteBackInputDate(model.referenceDateTime).toDate()) : '';
    // Addendum Text
    addText(addendumObj, model.text[0].content);

    vistaAddendum.push(addendumObj);

    // trailing unrequired args
    vistaAddendum.push('');
    return vistaAddendum;
}

function addText(docObj, text) {
    var MAX_LENGTH = 80;
    var textLines = text.split('\n');
    var lineNumber = 1;
    _.each(textLines, function(line) {
        while (line.length > MAX_LENGTH) {
            var maxLine = line.substr(0, MAX_LENGTH);
            var index = (maxLine.lastIndexOf(' ') + 1) || MAX_LENGTH;
            var thisLine = maxLine.substr(0, index);
            docObj['\"TEXT\",' + lineNumber.toString() + ',0'] = thisLine;
            lineNumber += 1;
            line = line.substring(index);
        }
        docObj['\"TEXT\",' + lineNumber.toString() + ',0'] = line;
        lineNumber += 1;
    });
    return;
}

function encounterObj(model) {
    var location = locationUtil.getLocationIEN(model.locationUid);
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
module.exports.deleteAddendum = deleteAddendum;
module.exports.deleteVprAddendum = deleteVprAddendum;
