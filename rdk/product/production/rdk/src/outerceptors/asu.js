'use strict';

var _ = require('lodash');
var S = require('string');
var nullchecker = require('../utils/nullchecker');
var asuUtils = require('../resources/patient-record/asu-utils');
module.exports = asu;

function asu(req, res, body, callback) {
    var bodyIsObject = _.isObject(body);
    var responseObject;

    // If its not a document carry on
    if (isItNotADocument(req)) {
        return callback(null, req, res, body);
    }

    if (bodyIsObject) {
        responseObject = body;
    } else {
        try {
            responseObject = JSON.parse(body);
        } catch (err) {
            return callback(403, req, res, null);
        }
    }



    if (!_.isEmpty(_.get(responseObject, 'data.items.results'))) {
        var tempRespObj = {};
        tempRespObj.data = {};
        tempRespObj.data.items = [];
        _.each(responseObject.data.items.results, function(item) {
            item.status = item.document_status;
            item.documentDefUid = item.document_def_uid;
            item.localTitle = item.local_title;
            item.authorUid = item.author_uid;
            item.signerUid = item.signer_uid;
            item.cosignerUid = item.cosigner_uid;
            item.attendingUid = item.attending_uid;
            tempRespObj.data.items.push(item);
        });
        asuCall(req, tempRespObj, function (error, response) {
            if (error) {
                return callback(error, req, null);
            }
            else {
                responseObject.data.items.results = response;
                responseObject.data.items.highlights = filterHighLights(responseObject);
                body = JSON.stringify(responseObject);
                return callback(null, req, res, body);
            }
        });
    }else if (!_.isUndefined(responseObject) && !_.isUndefined(responseObject.data) && !_.isUndefined(responseObject.data.items) ) {
        asuCall(req, responseObject, function (error, response) {
            if(error) {
                return callback(error, req, res, null);
            }
            else {
                responseObject.data.items = response;
                body = JSON.stringify(responseObject);
                return callback(null, req, res, body);
            }
        });
    } else {
        return callback(null, req, res, body);
    }
}

function isItNotADocument(req) {
    var uid = req.query.uid;
    if (nullchecker.isNotNullish(uid) && !S(uid).contains(':document:') && nullchecker.isNullish(req.query.documentDefUid)) {
        return true;
    }
    return false;
}

function asuCall (req, responseObject, callback) {
    asuUtils.applyAsuRules(req, responseObject, function(error, response) {
        if(error) {
            req.logger.info('asu.filterAsuDocuments: Asu Error %j',error);
            return callback(error, req, null);
        }
        return callback(null, response);
    });
}

function filterHighLights(responseObject) {
    var filteredHighlights = {};
    //iterate thru highlights and remove the one which is not in list after applying ASU RULE
    _.each(responseObject.data.items.highlights, function (val, key) {
        var matches = _.where(responseObject.data.items.results, {uid: key});
        if (!nullchecker.isNullish(matches) && matches.length > 0) {
            filteredHighlights[key] = val;
        }
    });
    return filteredHighlights;
}
