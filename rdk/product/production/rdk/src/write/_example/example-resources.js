'use strict';

var rdk = require('../../core/rdk');
var writebackWorkflow = require('../core/writeback-workflow');
var validateExample = require('./example-validator');
var writeExampleToVista = require('./example-vista-writer');
var writeVprToJds = require('../core/jds-direct-writer');

module.exports.getResourceConfig = function() {
    return [{
        name: 'add',
        path: '',
        post: addExample,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],  // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: true
    }, {
        name: 'update',
        path: '/:resourceId',
        put: updateExample,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],  // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: true
    }, {
        name: 'get',
        path: '',
        post: getNexTime,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: [],  // TODO set permissions. See https://wiki.vistacore.us/display/VACORE/Writeback+Edition+Permissions
        isPatientCentric: true
    }];
};

function addExample(req, res) {
    var tasks = [
        validateExample.create,
        writeExampleToVista.create,
        writeVprToJds
    ];
    writebackWorkflow(req, res, tasks);
}

function updateExample(req, res) {
    var tasks = [
        validateExample.update,
        writeExampleToVista.update,
        writeVprToJds
    ];
    writebackWorkflow(req, res, tasks);
}

function getNexTime(req, res, next) {
    var tasks = [
        writeExampleToVista.readNexTime
    ];
    writebackWorkflow(req, res, tasks);
}
