'use strict';

var writebackWorkflow = require('../core/writeback-workflow');
var validateNote = require('./notes-validator');
var writeNoteToVista = require('./notes-vista-writer');
var writeNoteToPjds = require('./notes-unsigned-pjds-writer');
var writeNoteTask = require('./notes-task-writer');
var writeVprToJds = require('../core/jds-direct-writer');
var writeNoteAudit = require('./notes-audit-logger');
var getNoteTasks = require('./notes-tasks');
var _ = require('lodash');

module.exports.getResourceConfig = function(app) {

    return [{
        name: 'notes-add',
        path: '',
        post: addNote,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        requiredASUActions: ['ENTRY'],
        isPatientCentric: true
    }, {
        name: 'notes-update',
        path: '/:resourceId',
        put: updateNote,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        requiredASUActions: ['EDIT RECORD'],
        isPatientCentric: true
    }, {
        name: 'notes-unsigned-delete',
        path: '/:resourceId',
        delete: deleteUnsignedNotes,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        requiredASUActions: ['DELETE RECORD'],
        isPatientCentric: true,
    }, {
        name: 'notes-sign',
        path: '/sign',
        post: signNotes,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        requiredASUActions: ['SIGNATURE'],
        isPatientCentric: true
    }];
};

function addNote(req, res) {
    var tasks = [
        validateNote.unsigned,
        writeNoteTask.getDefinitions,
        writeNoteToPjds.create,
        writeNoteToPjds.getNote,
        writeNoteTask.create,
        writeNoteToPjds.update,
        writeNoteAudit.create
    ];
    writebackWorkflow(req, res, tasks);
}

function updateNote(req, res) {
    var tasks = [];
    tasks = tasks.concat(getNoteTasks.update(req.body));
    tasks.push(writeNoteAudit.update);
    writebackWorkflow(req, res, tasks);
}

function deleteUnsignedNotes(req, res) {
    var tasks = [
        validateNote.delete,
        writeNoteToPjds.getNote,
        writeNoteTask.getDefinitions,
        writeNoteToPjds.delete,
        writeNoteTask.delete,
        writeNoteAudit.delete
    ];
    writebackWorkflow(req, res, tasks);
}

function signNotes(req, res) {
    var tasks = [
        validateNote.sign,
        writeNoteToVista.validateSignature,
        writeNoteTask.getDefinitions,
        writeNoteToVista.createNotes,
        writeNoteToVista.signNotes,
        writeNoteAudit.sign,
        writeNoteToVista.setVpr,
        writeNoteToPjds.getNote,
        writeNoteTask.getTask,
        writeNoteTask.start,
        writeNoteTask.complete,
        writeNoteToPjds.signNotes,
        writeNoteToVista.deleteNotes,
        writeNoteToVista.deleteVpr,
        writeVprToJds
    ];
    writebackWorkflow(req, res, tasks);
}