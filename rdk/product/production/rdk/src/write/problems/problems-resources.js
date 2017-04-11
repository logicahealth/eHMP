'use strict';

var writebackWorkflow = require('../core/writeback-workflow');

var validateNewProblem = require('./problems-validator').add;
var writeNewProblem = require('./problems-add-vista-writer').add;

var validateUpdateProblem = require('./problems-validator').update;
var updateProblem = require('./problems-update-vista-writer').update;

var writeVprToJds = require('../core/jds-direct-writer');

module.exports.getResourceConfig = function () {
    return [{
        name: 'problem-add',
        path: '',
        post: add,
        interceptors: {
            convertPid: true
        },
        requiredPermissions: ['add-condition-problem'],
        isPatientCentric: true
    }
        , {
        name: 'problem-update',
        path: '/:resourceId',
        put: update,
        interceptors: {
            convertPid: true
        },
        requiredPermissions: ['edit-condition-problem'],
        isPatientCentric: true
    }
    ];
};

function add(req, res) {
    var tasks = [
        validateNewProblem,
        writeNewProblem,
        writeVprToJds
    ];
    writebackWorkflow(req, res, tasks);
}

function update(req, res) {
    var tasks = [
        validateUpdateProblem,
        updateProblem,
        writeVprToJds
    ];
    writebackWorkflow(req, res, tasks);
}

