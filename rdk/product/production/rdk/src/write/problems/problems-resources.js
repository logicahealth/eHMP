'use strict';

var writebackWorkflow = require('../core/writeback-workflow');
var validateNewProblem = require('./problems-validator').add;
var writeNewProblemToVista = require('./problems-add-vista-writer').add;
var writeVprToJds = require('../core/jds-direct-writer');

module.exports.getResourceConfig = function () {
    return [{
        name: 'problem-add',
        path: '',
        post: addProblem,
        interceptors: {
            convertPid: true
        },
        requiredPermissions: ['add-condition-problem'],
        isPatientCentric: true
    }
    //    , {
    //    name: 'problem-update',
    //    path: '',
    //    put: updateProblem,
    //    interceptors: {
    //        operationalDataCheck: false,
    //        synchronize: false
    //    },
    //    requiredPermissions: [], // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
    //    isPatientCentric: true
    //}
    ];
};

function addProblem(req, res) {
    var tasks = [
        validateNewProblem,
        writeNewProblemToVista,
        writeVprToJds
    ];
    writebackWorkflow(req, res, tasks);
}

//function updateProblems(req, res) {
//    var tasks = [
//        validateProblems.update,
//        writeProblemToVista.update,
//        writeVprToJds
//    ];
//    writebackWorkflow(req, res, tasks);
//}

