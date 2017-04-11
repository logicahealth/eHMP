'use strict';

var writebackWorkflow = require('../core/writeback-workflow');
var validateEncounter = require('./encounters-validator');
var writeEncounterToVista = require('./encounters-vista-writer');
var writeVprToJds = require('../core/jds-direct-writer');

module.exports.getResourceConfig = function() {
    return [{
        name: 'encounters-add',
        path: '',
        post: saveEncounter,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['add-encounter', 'edit-encounter'],
        isPatientCentric: true
    }];
};

function saveEncounter(req, res) {
    var tasks = [
        validateEncounter.save,
        writeEncounterToVista.save,
        writeVprToJds
    ];
    writebackWorkflow(req, res, tasks);
}
