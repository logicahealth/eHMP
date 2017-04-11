'use strict';

var writebackWorkflow = require('../core/writeback-workflow');
var validate = require('./immunizations-validator');
var writeToVistA = require('./immunizations-vista-writer');
var writeVprToJds = require('../core/jds-direct-writer');
var notes = require('./notes');

module.exports.getResourceConfig = function() {
    return [{
        name: 'immunizations-add',
        path: '',
        post: add,
        interceptors: {
        },
        requiredPermissions: ['add-immunization'],
        isPatientCentric: true
    }];
};

function add(req, res) {
    var tasks = [
        validate.add,
        writeToVistA.add,
        writeVprToJds,
        notes.addImmunization,
        notes.addImmunizationNote
    ];
    writebackWorkflow(req, res, tasks);
}



