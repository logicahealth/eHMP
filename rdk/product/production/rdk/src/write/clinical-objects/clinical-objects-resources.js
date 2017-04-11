'use strict';

var rdk = require('../../core/rdk');
var writebackWorkflow = require('../core/writeback-workflow');
var clinicalObjectsTasks = require('./clinical-objects-tasks');

module.exports.getResourceConfig = function() {
    return [{
        name: 'clinical-object-find',
        path: '/find-clinical-object',
        post: findClinicalObject,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-clinical-object'], 
        isPatientCentric: true
    }, {
        name: 'clinical-object-list-get',
        path: '/get-clinical-object-list',
        get: getClinicalObjectList,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-clinical-object'], 
        isPatientCentric: true
    }, {
        name: 'clinical-object-add',
        path: '',
        post: addClinicalObject,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['create-clinical-object'], 
        isPatientCentric: true
    }, {
        name: 'clinical-object-update',
        path: '/:resourceId',
        put: updateClinicalObject,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['edit-clinical-object'], 
        isPatientCentric: true
    }, {
        name: 'clinical-object-read',
        path: '/:resourceId',
        get: getClinicalObject,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['read-clinical-object'], 
        isPatientCentric: true
    }];
};

function addClinicalObject(req, res) {
    var tasks = [clinicalObjectsTasks.create];
    writebackWorkflow(req, res, tasks);
}

function updateClinicalObject(req, res) {
    var tasks = [clinicalObjectsTasks.update];
    writebackWorkflow(req, res, tasks);
}

function getClinicalObject(req, res) {
    var tasks = [clinicalObjectsTasks.read];
    writebackWorkflow(req, res, tasks);
}

function findClinicalObject(req, res) {
    var tasks = [clinicalObjectsTasks.find];
    writebackWorkflow(req, res, tasks);
}

function getClinicalObjectList(req, res) {
    var tasks = [clinicalObjectsTasks.getList];
    writebackWorkflow(req, res, tasks);
}