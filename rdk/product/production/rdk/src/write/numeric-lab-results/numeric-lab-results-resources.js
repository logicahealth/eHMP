'use strict';

var writebackWorkflow = require('../core/writeback-workflow');
var saveNoteObjectTask = require('./save-note-object');
var validateNumericLabResults = require('./numeric-lab-results-validator');

module.exports.getResourceConfig = function() {
    return [{
        name: 'numeric-lab-results-save-note-object',
        path: '/save-note-object',
        post: saveNoteObject,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [], // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: true
    }];
};

function saveNoteObject(req, res) {
    var tasks = [
        validateNumericLabResults['saveNoteObject'],
        saveNoteObjectTask
    ];
    writebackWorkflow(req, res, tasks);
}
