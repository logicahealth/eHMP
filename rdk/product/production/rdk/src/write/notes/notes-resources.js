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
        name: 'addendum-add',
        path: '/addendum',
        post: addAddendum,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        requiredASUActions: [],
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
        name: 'addendum-update',
        path: '/addendum/:resourceId',
        put: updateAddendum,
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
        requiredASUActions: [],
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
    },{
        name: 'addendum-sign',
        path: 'addendum/sign',
        post: signAddendum,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        requiredASUActions: ['SIGNATURE'],
        isPatientCentric: true
    }, {
        name: 'notes-addendum-unsigned-delete',
        path: '/addendum/:resourceId',
        delete: deleteUnsignedAddendum,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],
        requiredASUActions: [],
        isPatientCentric: true,
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

function addAddendum(req, res) {
    var tasks = [
        validateNote.createAddendum,
        writeNoteTask.getDefinitions,
        writeNoteToPjds.createAddendum,
        writeNoteToPjds.getAddendum,
        writeNoteTask.create,
        writeNoteToPjds.updateAddendum,
        writeNoteAudit.createAddendum
    ];
    writebackWorkflow(req, res, tasks);
}

function updateAddendum(req, res) {
    var tasks = [
        writeNoteToPjds.updateAddendum,
        writeNoteAudit.updateAddendum
    ];
    writebackWorkflow(req, res, tasks);
}

function updateNote(req, res) {
    var tasks = [
        validateNote.update,
        writeNoteToPjds.update,
        writeNoteAudit.update
    ];
    writebackWorkflow(req, res, tasks);
}

function deleteUnsignedNotes(req, res) {
    var tasks = [
        validateNote.delete,
        writeNoteToPjds.getNote,
        validateNote.runDeleteRecordASU,
        writeNoteTask.getDefinitions,
        writeNoteTask.getOpenConsultsForNoteUid.bind(null, req),
        writeNoteTask.disconnectConsults.bind(null, req), // Binding for getGenericJbpmConfig()
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
        writeNoteTask.getOpenConsultsForNoteUid.bind(null, req),
        writeNoteTask.completeConsults.bind(null, req), // Binding for getGenericJbpmConfig()
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

function signAddendum(req, res) {
    var tasks = [
        validateNote.signAddendum,
        writeNoteToVista.validateSignature,
        writeNoteTask.getDefinitions,
        writeNoteToVista.createAddendum,
        writeNoteToVista.signAddendum,
        writeNoteAudit.signAddendum,
        writeNoteToVista.setVprAddendum,
        writeNoteToPjds.getAddendum,
        writeNoteTask.getTask,
        writeNoteTask.start,
        writeNoteTask.complete,
        writeNoteToPjds.signAddendum,
        writeVprToJds
    ];
    writebackWorkflow(req, res, tasks);
}

function deleteUnsignedAddendum(req, res) {
    var tasks = [
        validateNote.delete,
        writeNoteToPjds.getAddendum,
        validateNote.runDeleteRecordASU,
        writeNoteTask.getDefinitions,
        writeNoteToPjds.deleteAddendum,
        writeNoteTask.delete,
        writeNoteAudit.deleteAddendum
    ];
    writebackWorkflow(req, res, tasks);
}
