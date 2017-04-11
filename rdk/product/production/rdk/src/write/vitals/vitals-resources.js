'use strict';

var writebackWorkflow = require('../core/writeback-workflow');
var validateVitals = require('./vitals-validator');
var writeVitalToVista = require('./vitals-vista-writer');
var writeVprToJds = require('../core/jds-direct-writer');

module.exports.getResourceConfig = function() {
    return [{
        name: 'vitals-add',
        path: '',
        post: add,
        interceptors: {
            convertPid: true
        },
        requiredPermissions: ['add-vital'],
        isPatientCentric: true
    }, {
        name: 'vitals-update',
        path: '/:resourceId',
        put: update,
        interceptors: {
            convertPid: true
        },
        requiredPermissions: ['eie-vital'],
        isPatientCentric: true
    }];
};

function add(req, res) {
    var tasks = [
        validateVitals.create,
        writeVitalToVista.create,
        writeVprToJds
    ];
    writebackWorkflow(req, res, tasks);
}

function update(req, res) {
    var tasks = [
        validateVitals.enteredInError,
        writeVitalToVista.enteredInError,
        writeVprToJds
    ];
    writebackWorkflow(req, res, tasks);
}

module.exports._add = add;
module.exports._update = update;
