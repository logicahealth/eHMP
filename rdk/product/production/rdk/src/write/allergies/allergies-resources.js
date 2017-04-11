'use strict';

var writebackWorkflow = require('../core/writeback-workflow');
var validateAllergies = require('./allergies-validator');
var writeAllergyToVista = require('./allergies-vista-writer');
var writeVprToJds = require('../core/jds-direct-writer');

function getResourceConfig() {
    return [{
        name: 'allergies-add',
        path: '',
        post: add,
        interceptors: {
            convertPid: true
        },
        requiredPermissions: ['add-allergy'],
        isPatientCentric: true
    }, {
        name: 'allergies-eie',
        path: '/:resourceId',
        put: eie,
        interceptors: {
            convertPid: true
        },
        requiredPermissions: ['eie-allergy'],
        isPatientCentric: true
    }];
}

function add(req, res) {
    var tasks = [
        validateAllergies.create,
        writeAllergyToVista.create,
        writeVprToJds
    ];
    writebackWorkflow(req, res, tasks);
}

function eie(req, res) {
    var tasks = [
        validateAllergies.enteredInError,
        writeAllergyToVista.enteredInError,
        writeVprToJds
    ];
    writebackWorkflow(req, res, tasks);
}

module.exports.getResourceConfig = getResourceConfig;
