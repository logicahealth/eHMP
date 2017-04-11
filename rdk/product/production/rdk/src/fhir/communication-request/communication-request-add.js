'use strict';

var _ = require('lodash');
var async = require('async');
var uuid = require('node-uuid');
var fhirResource = require('../common/entities/fhir-resource');
var validator = require('./communication-request-validator');

function addRequestedOn(message) {
    if (_.isUndefined(message.requestedOn)) {
        message.requestedOn = new Date().toISOString();
    }
}

function addStatus(message) {
    if (_.isUndefined(message.status)) {
        message.status = 'received';
    }
}

function addIdentifier(message) {
    message.identifier = new fhirResource.Identifier(uuid.v1(), 'urn:ietf:rfc:3986');
}

function addResourceType(message) {
    if (_.isUndefined(message.resourceType)) {
        message.resourceType = 'CommunicationRequest';
    }
}


function extractRecipientsFromRequest(message) {
    return _.chain(message.recipient)
        .transform(function(result, recipent) {
            result.push(recipent.reference);
        })
        .unique().value();
}

function queueMessage(queue, message, callback) {
    addIdentifier(message);
    addResourceType(message);
    addRequestedOn(message);
    addStatus(message);
    var queueNames = extractRecipientsFromRequest(message);
    return queue.enqueue(queueNames, message, callback);
}

module.exports.handle = function(queue, message, callback) {
    async.series([

            function(seriesCallback) {
                validator.validate(message, seriesCallback);
            },
            function(seriesCallback) {
                queueMessage(queue, message, seriesCallback);
            }
        ],
        function(err, result) {
            if (err) {
                return callback(err);
            }

            return callback(null, result[1]);
        });
};
