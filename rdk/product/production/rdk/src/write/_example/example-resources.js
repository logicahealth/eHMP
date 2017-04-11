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
        requiredPermissions: ['future-release-not-available-for-use'], //Note: Replace the future-release-not-available-for-use permission set with the permission set you would need for your endpoint.
        //Please refer to https://wiki.vistacore.us/pages/viewpage.action?pageId=20055119 for information on permissions and permission sets
    }, {
        name: 'update',
        path: '/:resourceId',
        put: updateExample,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['future-release-not-available-for-use'],  //Note: Replace the future-release-not-available-for-use permission set with the permission set you would need for your endpoint.
        //Please refer to https://wiki.vistacore.us/pages/viewpage.action?pageId=20055119 for information on permissions and permission sets
        isPatientCentric: true
    }, {
        name: 'get',
        path: '',
        post: getNexTime,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['future-release-not-available-for-use'],  //Note: Replace the future-release-not-available-for-use permission set with the permission set you would need for your endpoint.
        //Please refer to https://wiki.vistacore.us/pages/viewpage.action?pageId=20055119 for information on permissions and permission sets
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
