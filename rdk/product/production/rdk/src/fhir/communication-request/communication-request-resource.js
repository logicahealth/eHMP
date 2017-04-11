'use strict';

// references
// http://www.hl7.org/fhir/2015May/communicationrequest-definitions.html#CommunicationRequest.payload
// http://www.hl7.org/fhir/http.html
// https://wiki.vistacore.us/pages/viewpage.action?pageId=9737856
var _ = require('lodash');
var async = require('async');
var rdk = require('../../core/rdk');
var queueFactory = require('./queue/queue-factory');
var addRequestHandler = require('./communication-request-add');
var getRequestsHandler = require('./communication-request-get');
var deleteRequestHandler = require('./communication-request-delete');
var updateRequestHandler = require('./communication-request-update');
var watchRequestHandler = require('./communication-request-watch');
var nameFromIcn = require('../common/utils/jds-patientname-fromIcn.js');
var queue;

function getResourceConfig(app) {
    queueFactory.create(app, function(q) {
        queue = q;
    });
    return [{
        name: 'fhir-communication-request-add',
        path: '',
        post: addCommunicationRequest,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false,
            validatePid: false
        },
        requiredPermissions: ['edit-fhir'],
        isPatientCentric: false,
        permitResponseFormat: true
    }, {
        name: 'fhir-communication-request-get-all',
        path: '/:recipientId',
        get: getAllCommunicationRequests,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false,
            validatePid: false
        },
        requiredPermissions: ['read-fhir'],
        isPatientCentric: false,
        permitResponseFormat: true
    }, {
        name: 'fhir-communication-request-get',
        path: '/:recipientId/:id',
        get: getCommunicationRequest,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false,
            validatePid: false
        },
        requiredPermissions: ['read-fhir'],
        isPatientCentric: false,
        permitResponseFormat: true
    }, {
        name: 'fhir-communication-request-delete',
        path: '/:recipientId/:id',
        delete: deleteCommunicationRequest,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false,
            validatePid: false
        },
        requiredPermissions: ['delete-fhir'],
        isPatientCentric: false,
        permitResponseFormat: true
    }, {
        name: 'fhir-communication-request-update',
        path: '/:recipientId/:id',
        put: updateCommunicationRequest,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['edit-fhir'],
        isPatientCentric: false,
        permitResponseFormat: true
    }, {
        name: 'fhir-communication-request-update-mark-as-read',
        path: 'setstatus/:status/:recipientId/:id',
        put: setstatusCommunicationRequest,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false
        },
        requiredPermissions: ['edit-fhir'],
        isPatientCentric: false,
        permitResponseFormat: true
    }, {
        name: 'fhir-communication-request-watchtube',
        path: '/watch/add/:recipientId',
        get: watchTube,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false,
            validatePid: false
        },
        requiredPermissions: ['read-fhir'],
        isPatientCentric: false,
        permitResponseFormat: true
    }, {
        name: 'fhir-communication-request-get-all-search',
        path: '/:recipientId/_search',
        post: getAllCommunicationRequests,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false,
            validatePid: false
        },
        requiredPermissions: ['read-fhir'],
        isPatientCentric: false,
        permitResponseFormat: true
    }, {
        name: 'fhir-communication-request-get-search',
        path: '/:recipientId/:id/_search',
        post: getCommunicationRequest,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false,
            validatePid: false
        },
        requiredPermissions: ['read-fhir'],
        isPatientCentric: false,
        permitResponseFormat: true
    }, {
        name: 'fhir-communication-request-watchtube-search',
        path: '/watch/add/:recipientId/_search',
        post: watchTube,
        interceptors: {
            operationalDataCheck: false,
            synchronize: false,
            validatePid: false
        },
        requiredPermissions: ['read-fhir'],
        isPatientCentric: false,
        permitResponseFormat: true
    }];
}

function defaultCallback(req, res, successCode, err, result) {

    if (err) {
        req.logger.error(err.message);
        return res.status(err.code).send(err.message);
    }
    if (!_.isUndefined(result) && (result instanceof Array)) {
        async.map(result, function(item, mapCallback) {
            setPatientName(item, req, function(err, displayName) {
                mapCallback(null, _.extend(_.clone(item), {
                    subject: {
                        reference: item.subject.reference,
                        display: displayName
                    }
                }));
            });
        }, function(err, results) {
            return res.status(successCode).send(results);
        });
    } else {
        return res.status(successCode).send(result);
    }
}

function setPatientName(message, req, callback) {
    if (!_.isUndefined(message) && !_.isUndefined(message.subject) && !_.isUndefined(message.subject.reference)) {
        if (_.isUndefined(message.subject.display)) {
            return nameFromIcn.get(message.subject.reference.split('/')[1], req, callback);
        }
        return setImmediate(callback, null, message.subject.display);
    }
    return setImmediate(callback);
}

function setstatusCommunicationRequest(req, res) {
    var statuses = {
        'read': 'accepted',
        'completed': 'completed'
    };
    //if there's no mapping the original status will be sent
    req.body = {
        'status': statuses[req.params.status] ? statuses[req.params.status] : req.params.status
    };
    updateRequestHandler.handle(queue, req.body, req.params.recipientId, req.params.id, defaultCallback.bind(null, req, res, rdk.httpstatus.ok), req, res);
}

function updateCommunicationRequest(req, res) {
    updateRequestHandler.handle(queue, req.body, req.params.recipientId, req.params.id, defaultCallback.bind(null, req, res, rdk.httpstatus.ok), req, res);
}

function getAllCommunicationRequests(req, res) {
    getRequestsHandler.handle(queue, req.params.recipientId, req.query, defaultCallback.bind(null, req, res, rdk.httpstatus.ok), req, res);
}


function getCommunicationRequest(req, res) {
    getRequestsHandler.handle(queue, req.params.recipientId, req.params.id, defaultCallback.bind(null, req, res, rdk.httpstatus.ok), req, res);
}

function addCommunicationRequest(req, res) {

    setPatientName(req.body, req, function(err, displayName) {
        if (!_.isUndefined(req.body) && !_.isUndefined(req.body.subject)) {
            req.body.subject.display = displayName;
        }
        addRequestHandler.handle(queue, req.body, defaultCallback.bind(null, req, res, rdk.httpstatus.accepted), req, res);
    });
}

function deleteCommunicationRequest(req, res) {
    deleteRequestHandler.handle(queue, req.params.recipientId, req.params.id, defaultCallback.bind(null, req, res, rdk.httpstatus.no_content), req, res);
}


function watchTube(req, res) {
    watchRequestHandler.handle('added', queue, req.params.recipientId, defaultCallback.bind(null, req, res, rdk.httpstatus.ok), req, res);
}

module.exports.getResourceConfig = getResourceConfig;


//used for unit testing only
module.exports._updateCommunicationRequest = updateCommunicationRequest;
module.exports._getAllCommunicationRequests = getAllCommunicationRequests;
module.exports._getCommunicationRequest = getCommunicationRequest;
module.exports._addCommunicationRequest = addCommunicationRequest;
module.exports._deleteCommunicationRequest = deleteCommunicationRequest;
