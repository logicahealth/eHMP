'use strict';

// set up the packages we need
var rdk = require('../../core/rdk');
var _ = require('lodash');
var dd = require('drilldown');
var mongo = require('mongoskin');
var ObjectId = require('mongoskin').ObjectID;

// Database
var dbName = 'patientlist';
var critCollection = 'criteria';
var db = {};

var isCDSMongoServerAvailable = false;
var testId;

function init(app) {
    isCDSMongoServerAvailable = dd(app)('subsystems')('cds')('isCDSMongoServerConfigured').invoke();
    if (!isCDSMongoServerAvailable) {
        return;
    }
    app.subsystems.cds.getCDSDB(dbName, function(error, dbConnection) {
        if (!error) {
            db = dbConnection;
        }
    });
    testId = app.subsystems.cds.testMongoDBId;
}

function computeMatch(req) {
    var match = {};
    // Criteria is not scoped
    if (req.query.id) {
        match._id = req.query.id;
    } else if (req.query.name) {
        match.name = req.query.name;
    }
    return match;
}

// /////////
// Criteria
// /////////

/**
 * Retrieve Criteria used in creating a Patient list Definition
 *
 * @api {get} /resource/cds/patient/criteria[?id=id|name=name] Request Criteria
 *
 * @apiName getCriteria
 * @apiGroup Patient Criteria
 *
 * @apiParam {Number} [id] Criteria id (24 digit HEX number), id has precedence
 *           over name
 * @apiParam {String} [name] Criteria name (if id not used)
 * @apiParam {String} . Return all criteria
 *
 * @apiSuccess (Success 200) {json[]} data A Criteria returned if id or name
 *             specified or array of all Criteria
 *
 * @apiSuccessExample Success-Response: HTTP/1.1 200 OK
 *     { "data": [ { "_id":
 *                    "54fe3f92fe06852d22659b0d", "name": "Blood Pressure",
 *                    "accessor": "vital:items[]:qualifiedName",
 *                    "datatype": "integer",
 *                    "piece": "2:/" } ] }
 * @apiError (Error 404) . Criteria not found
 * @apiErrorExample Error-Response: HTTP/1.1 404 Not Found
 * { status: 404
 *                  message:Criteria not found }
 *
 */
module.exports.getCriteria = function(req, res) {
    if (!isCDSMongoServerAvailable) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
    }

    var status = rdk.httpstatus.ok;
    var message = '';

    var match = computeMatch(req);
    if (match._id) {
        message = testId(match._id);
        if (!message) {
            match._id = new ObjectId(match._id);
        } else {
            return res.status(rdk.httpstatus.bad_request).rdkSend(message);
        }
    }
    if (match.name || match._id) {
        db.collection(critCollection).findOne(match, function(err, result) {
            message = (err === null) ? result : err;
            if (err === null && _.isEmpty(result)) {
                status = rdk.httpstatus.not_found;
                message = 'Criteria not found';
            }
            return res.status(status).rdkSend(message);
        });
    } else { // return multiple
        db.collection(critCollection).find(match).toArray(function(err, result) {
            message = (err === null) ? result : err;
            if (err === null && _.isEmpty(result)) {
                status = rdk.httpstatus.not_found;
                message = 'Criteria(s) not found';
            }
            return res.status(status).rdkSend(message);
        });
    }
};

/**
 * Create Criteria used in creating a Patient list Definition
 *
 * @api {post} /resource/cds/patient/criteria Create Criteria
 *
 * @apiName postCriteria
 * @apiGroup Patient Criteria
 *
 * @apiHeader {application/json} Content-Type
 * @apiHeader {json} content Criteria object
 *
 * @apiSuccess (Success 201) {json} data Criteria JSON document
 * @apiSuccessExample Success-Response: HTTP/1.1 201 Created
 * { "data": { "_id": "54fe3f92fe06852d22659b0d",
 *  "name": "Blood Pressure",
 *    "accessor": "vital:items[]:qualifiedName",
 *     "datatype": "integer",
 *      "piece": "2:/" }
 *   }
 * @apiError (Error 400) {json} error Criteria document (request body) must be
 *           defined
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 * { status: 400 message: Criteria document (request body) must be defined
 * }
 * @apiError (Error 400) {json} error Criteria document can not have _id defined
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 *  { status: 400  message: Criteria document can not have _id defined
 *  }
 * @apiError (Error 400) {json} error Criteria name must be defined
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 *  { status: 400 message: Criteria name must be defined
 *  }
 * @apiError (Error 409) {json} error Criteria 'name' exists, can not be created
 * @apiErrorExample Error-Response: HTTP/1.1 409 Conflict
 *  { status: 409 message: Criteria 'name' exists, can not be created
 *  }
 * @apiError (Error 500) {json} error A system or database error message was returned
 * @apiErrorExample Error-Response: HTTP/1.1 500 Internal Server Error
 *  { status: 500 message: system or database error message
 *  }
 *
 *
 */
// Post to CDSInvocation MongoDB app /cds-data/criteria.js
module.exports.postCriteria = function(req, res) {
    if (!isCDSMongoServerAvailable) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
    }

    var status = rdk.httpstatus.created;
    var message = '';
    var doc = req.body;

    if (_.isEmpty(doc)) {
        message = 'Criteria document (request body) must be defined';
        return res.status(rdk.httpstatus.bad_request).rdkSend(message);
    }
    delete doc._id;

    if (!doc.name) {
        status = rdk.httpstatus.bad_request;
        message = 'Criteria name must be defined';
        return res.status(status).rdkSend(message);
    }
    // Verify the definition does not already exist
    doc.date = new Date();
    var match = {
        name: doc.name
    };

    db.collection(critCollection).findOne(match, function(err, result) {
        if (!_.isEmpty(result)) {
            message = 'Criteria \'' + doc.name + '\' exists, can not be created';
            return res.status(rdk.httpstatus.conflict).rdkSend(message);
        }
        if (err) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }
        db.collection(critCollection).insert(doc, function(err, result) {
            var message = (err === null) ? result : err;
            if (err) {
                status = rdk.httpstatus.internal_server_error;
            }
            res.status(status).rdkSend(message);
        });
    });
};

/**
 * Delete Criteria used in creating a Patient list Definition
 *
 * @api {delete} /resource/cds/patient/criteria[?id=id|name=name] Delete
 *      Criteria
 *
 * @apiName deleteCriteria
 * @apiGroup Patient Criteria
 *
 * @apiParam {Number} [id] 24 digit HEX number doc id
 * @apiParam {String} [name] Criteria name (if id not used)
 *
 * @apiSuccess (Success 200) {Number} data Delete count
 * @apiSuccessExample Success-Response: HTTP/1.1 200 OK
 * { "data": "1" }
 *
 * @apiError (Error 404) . Criteria not found
 * @apiErrorExample Error-Response: HTTP/1.1 404 Not Found { status: 404
 *                  message:Criteria not found }
 * @apiError (Error 400) {json} error Name or Id required
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request { status: 400
 *                  message: Name or Id required }
 *
 */
module.exports.deleteCriteria = function(req, res) {
    if (!isCDSMongoServerAvailable) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
    }

    var status = rdk.httpstatus.ok;
    var message = '';

    var match = computeMatch(req);
    if (match._id) {
        message = testId(match._id);
        if (!message) {
            match._id = new ObjectId(match._id);
        } else {
            return res.status(rdk.httpstatus.bad_request).rdkSend(message);
        }
    }

    if (match.name || match._id) {
        db.collection(critCollection).remove(match, function(err, result) {
            var message = (err === null) ? result : err;
            if (_.isEmpty(err) && result !== 1) {
                status = rdk.httpstatus.not_found;
                message = 'Criteria not found';
            }
            if (!_.isEmpty(err)) {
                status = rdk.httpstatus.bad_request;
            }
            res.status(status).rdkSend(message);
        });
    } else {
        message = 'Name or Id required';
        res.status(rdk.httpstatus.bad_request).rdkSend(message);
    }
};

module.exports.init = init;
