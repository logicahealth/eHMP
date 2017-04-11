'use strict';

var rdk = require('../../core/rdk');
var _ = require('lodash');
var async = require('async');
var httpUtil = rdk.utils.http;
var fetchPatientUid = require('./get-patient-uid');
var url = require('url');

FetchError.prototype = Error.prototype;
NotFoundError.prototype = Error.prototype;

var getResourceConfig = function() {
    return [{
        name: 'patient-record-complexnote-html',
        path: '/html',
        get: getComplexNoteHtml,
        description: 'Get the DoD complex note represented in HTML for a given document on a patient',
        subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync', 'authorization'],
        outerceptors: ['asu'],
        requiredPermissions: ['read-document'],
        isPatientCentric: true
    },
    {
        name: 'patient-record-complexnote-pdf',
        path: '/pdf',
        get: getComplexNotePdf,
        description: 'Get the DoD complex note represented as a PDF for a given document on a patient',
        subsystems: ['patientrecord', 'jds', 'solr', 'jdsSync', 'authorization'],
        outerceptors: ['asu'],
        requiredPermissions: ['read-document'],
        isPatientCentric: true
    }];
};

function getComplexNoteHtml(req, res) {
    return getComplexNote(req, res, false);
}

function getComplexNotePdf(req, res) {
    return getComplexNote(req, res, true);
}

function getComplexNote(req, res, isPdf) {

    async.waterfall([

        getDocumentContent.bind(null, req),

        getComplexNoteContent.bind(null, req)

    ], function(err, results) {
        if (err) {
            if (err.name === 'FetchError') {
                req.logger.error(err.message);
                return res.status(rdk.httpstatus.internal_server_error).rdkSend('There was an error processing your request. The error has been logged.');
            }
            if (err.name === 'NotFoundError') {
                return res.status(rdk.httpstatus.not_found).rdkSend(err.error || err.message);
            }
            if (_.isNumber(err.code)) {
                return res.status(err.code).rdkSend(err.message);
            }
            req.logger.error(err.message);
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err.message);
        }
        if (isPdf) {
            res.type('pdf');
            return res.end(new Buffer(results, 'binary'));
        }
        return res.rdkSend({
            complexNote: results
        });
    });
}

function getDocumentContent(req, callback) {
    fetchPatientUid.getPatientUid(req, function(err, response, obj) {
        if (err) {
            return callback(err, obj);
        }
        if (response.statusCode >= 300) {
            return callback({code: response.statusCode, message: obj}, obj);
        }
        if ('data' in obj) {
            return callback(null, obj);
        }
        if ('error' in obj) {
            if (obj.error.code === 404) {
                return callback(new NotFoundError('patient-complex-note-resource:getDocumentContent: Unable to retrieve document containing complex note - ' + obj.error.message, obj.error));
            }
            return callback(new Error('patient-complex-note-resource:getDocumentContent: Unable to retrieve document containing complex note - ' + obj.error.message, obj.error));
        }
        return callback(new Error('patient-complex-note-resource:getDocumentContent: Unable to retrieve document containing complex note', obj));
    });
}

function getComplexNoteContent(req, results, callback) {
    req.audit.logCategory = 'RETRIEVE';

    var pid = req.param('uid');

    var documentItems = results.data.items;
    if (_.isEmpty(documentItems)) {
        return callback(new Error('patient-complex-note-resource:getComplexNoteContent: The document was not found'));
    }
    var complexNoteUri = documentItems[0].dodComplexNoteUri;

    if (!complexNoteUri) {
        return callback(new NotFoundError('patient-complex-note-resource:getComplexNoteContent: There is no Complex Note for this document')); //TODO don't throw an error here, just return empty results
    }
    var complexNotePath = url.parse(complexNoteUri).path;
    var vxSyncServer = _.clone(req.app.config.vxSyncServer);
    var baseComplexNoteConfig = _.clone(req.app.config.vxSyncComplexNote.getComplexNote);
    var baseUrl = vxSyncServer.baseUrl.replace(/:\d+/, ':' + baseComplexNoteConfig.port);
    var options = _.extend({}, baseComplexNoteConfig.options, {
        baseUrl: baseUrl,
        logger: req.logger,
        url: complexNotePath
    });

    if (isPdfDocument(complexNoteUri)) {
        options.encoding = null;
    }
    httpUtil.get(options, function(error, response, result) {
        if (error) {
            return callback(new FetchError('patient-complex-note-resource:getComplexNoteContent: Error fetching pid=' + pid + ' - ' + (error.message || error), error));
        }
        // TODO do other error codes (e.g. 500) result in an error object or do we need to look more closely at the status code?
        if (response && response.statusCode === 404) {
            return callback(new NotFoundError('patient-complex-note-resource:getComplexNoteContent: The Complex Note was not found'));
        }
        if(_.isUndefined(result)) {
            result = {};
            req.logger.warn('patient-complex-note-resource:getComplexNoteContent: vxSync response does not contain result object');
        }
        return callback(null, result);
    });
}

function FetchError(message, error) {
    this.name = 'FetchError';
    this.error = error;
    this.message = message;
}

function NotFoundError(message, error) {
    this.name = 'NotFoundError';
    this.error = error;
    this.message = message;
}

function isPdfDocument(complexNoteUri) {
    if (complexNoteUri) {
        return complexNoteUri.toLowerCase().search('pdf') > -1;
    }

    return false;
}

exports.getResourceConfig = getResourceConfig;
