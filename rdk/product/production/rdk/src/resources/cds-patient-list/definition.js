'use strict';

// set up the packages we need
var rdk = require('../../core/rdk');
var _ = require('lodash');
var dd = require('drilldown');
var utils = require('./utils.js');
var mongo = require('mongoskin');
var ObjectId = require('mongoskin').ObjectID;

// Database
var dbName = 'patientlist';
var defCollection = 'definitions';
var db;

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

// ////////////////////
// Definition Template
// ////////////////////

/**
 * Retrieve Definition(s) used in the selection of patients
 *
 * @api {get} /resource/cds/patient/definition[?id=id|name=name] Request
 *      Definition
 *
 * @apiName getDefinition
 * @apiGroup Patient Definition
 *
 * @apiParam {Number} [id] Definition id (24 digit HEX number), id has
 *           precedence over name
 * @apiParam {String} [name] Definition name (if id not used)
 * @apiParam {String} . Return all definitions for current owner
 *
 * @apiSuccess (Success 200) {json[]} data Array of one or more definitions
 * @apiSuccessExample Success-Response: HTTP/1.1 200 OK { "data": [ { "name":
 *                    "def one", "description": "user defined description of
 *                    this definition template", "expression": "{and: [ {or:
 *                    ['A.A','B.B'], {'A.A'} ]}", "date":
 *                    "2015-03-10T12:54:54.035Z", "scope": "private", "owner":
 *                    "9E7A;PW    ", "_id": "54fee99e1e3bdef211534bbb" } ] }
 * @apiError (Error 404) . Definition not found
 * @apiErrorExample Error-Response: HTTP/1.1 404 Not Found { status: 404
 *                  message: Definition not found }
 *
 */
module.exports.getDefinition = function(req, res) {
    if (!isCDSMongoServerAvailable) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
    }
    // console.log('GET Definition called');

    var status = rdk.httpstatus.ok;
    var message = '';
    var match = utils.computeMatch(req);

    if (match.scope && (match.scope !== 'private' && match.scope !== 'site' && match.scope !== 'enterprise')) {
        status = rdk.httpstatus.bad_request; // 400
        message = 'Scope must be specified using private (default), site or enterprise';
        return res.status(status).rdkSend(message);
    }

    if (match._id) {
        message = testId(match._id);
        if (message) {
            return res.status(rdk.httpstatus.bad_request).rdkSend(message);
        }
        match._id = new ObjectId(match._id);
    }
    if (match.name || match._id) {
        db.collection(defCollection).findOne(match, function(err, result) {
            message = (err === null) ? {
                data: result
            } : {
                error: err
            };
            if (err === null && _.isEmpty(result)) {
                status = rdk.httpstatus.not_found;
                message = 'Definition not found';
            }
            return res.status(status).rdkSend(message);
        });
    } else { // return multiple
        db.collection(defCollection).find(match).toArray(function(err, result) {
            message = (err === null) ? result : err;
            if (err === null && _.isEmpty(result)) {
                status = rdk.httpstatus.not_found;
                message = 'Definition(s) not found';
            }
            res.status(status).rdkSend(message);
        });
    }
};

/**
 * Create a Definition to be used in the selection of patients
 *
 * @api {post} /resource/cds/patient/definition Create Definition
 *
 * @apiName postDefinition
 * @apiGroup Patient Definition
 *
 * @apiHeader {application/json} Content-Type
 * @apiHeader {json} content Definition object
 *
 * @apiSuccess (Success 201) {json} data Definition JSON document
 * @apiSuccessExample Success-Response: HTTP/1.1 201 Created { "data": { "name":
 *                    "def one", "description": "user defined description of
 *                    this definition template", "expression": "{and: [ {or:
 *                    ['A.A','B.B'], {'A.A'} ]}", "date":
 *                    "2015-03-10T12:54:54.035Z", "scope": "private", "owner":
 *                    "9E7A;PW    ", "_id": "54fee99e1e3bdef211534bbb" } }
 *
 * @apiError (Error 400) {json} error Definition document (request body) must be
 *           defined
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request { status: 400
 *                  message: Definition document (request body) must be defined }
 * @apiError (Error 400) {json} error Scope must be specified using private
 *           (default), site or enterprise
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request { status: 400
 *                  message: Scope must be specified using private (default),
 *                  site or enterprise }
 * @apiError (Error 400) {json} error Definition document can not have _id
 *           defined
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request { status: 400
 *                  message: Definition document can not have _id defined }
 * @apiError (Error 400) {json} error Definition name must be defined
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request { status: 400
 *                  message: Definition name must be defined }
 * @apiError (Error 409) {json} error Definition 'name' exists, can not be
 *           created
 * @apiErrorExample Error-Response: HTTP/1.1 409 Conflict { status: 409 message:
 *                  Definition 'name' exists, can not be created }
 * @apiError (Error 500) {json} error A system or database error message was
 *           returned
 * @apiErrorExample Error-Response: HTTP/1.1 500 Internal Server Error { status:
 *                  500 message: system or database error message }
 *
 */
module.exports.postDefinition = function(req, res) {
    if (!isCDSMongoServerAvailable) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
    }

    var status = rdk.httpstatus.created;
    var message = '';
    var doc = req.body;

    if (!doc) {
        status = rdk.httpstatus.bad_request;
        message = 'Definition document (request body) must be defined';
        return res.status(status).rdkSend(message);
    }
    if (doc.scope && (doc.scope !== 'private' && doc.scope !== 'site' && doc.scope !== 'enterprise')) {
        status = rdk.httpstatus.bad_request; // 400
        message = 'Scope must be specified using private (default), site or enterprise';
        return res.status(status).rdkSend(message);
    }
    delete doc._id;

    if (!doc.name) {
        status = rdk.httpstatus.bad_request;
        message = 'Definition name must be defined';
        return res.status(status).rdkSend(message);
    }
    doc.date = new Date();
    if (!doc.scope) {
        // default to private scope
        doc.scope = 'private';
    }
    switch (doc.scope) {
        case 'private':
            doc.owner = req.session.user.username;
            break;
        case 'site':
            doc.owner = req.session.user.site;
            break;
        default:
            delete doc.owner;
    }
    var match = {
        name: doc.name,
        scope: doc.scope,
        owner: doc.owner
    };
    // Verify the definition does not already exist
    db.collection(defCollection).findOne(match, function(err, result) {
        if (!_.isEmpty(result)) {
            message = 'Definition \'' + doc.name + '\' exists, can not be created';
            return res.status(rdk.httpstatus.conflict).rdkSend(message);
        }
        if (!_.isEmpty(err)) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        }
        db.collection(defCollection).insert(doc, function(err, result) {
            var message = (err === null) ? result : err;
            if (!_.isEmpty(err)) {
                status = rdk.httpstatus.internal_server_error;
            }
            return res.status(status).rdkSend(message);
        });
    });
};

/**
 * Delete Definition used in the selection of patients
 *
 * Delete a definition document
 *
 * @api {delete} /resource/cds/patient/definition?[?id=id|name=name] Delete
 *      Definition (name or id)
 *
 * @apiName deleteDefinition
 * @apiGroup Patient Definition
 *
 * @apiParam {Number} [id] 24 digit HEX number doc id
 * @apiParam {String} [name] Definition name (if id not used)
 *
 * @apiSuccess (Success 200) {Number} data Delete count
 * @apiSuccessExample Success-Response: HTTP/1.1 200 OK
 * { "data": 1 }
 *
 * @apiError (Error 404) {Number} data The specified definition was not found
 * @apiErrorExample Error-Response: HTTP/1.1 404 Not Found { status: 404
 *                  message: null }
 * @apiError (Error 400) {json} error Name or Id required
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request { status: 400
 *                  message: Name or Id required }
 *
 */
module.exports.deleteDefinition = function(req, res) {
    if (!isCDSMongoServerAvailable) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
    }

    var status = rdk.httpstatus.ok;
    var message = '';

    var match = utils.computeMatch(req);
    if (match._id) {
        message = testId(match._id);
        if (!message) {
            match._id = new ObjectId(match._id);
        } else {
            return res.status(rdk.httpstatus.bad_request).rdkSend(message);
        }
    }

    if (match.name || match._id) {
        db.collection(defCollection).remove(match, function(err, result) {
            var message = (err === null) ? result : err;
            if (err !== null || result !== 1) {
                status = rdk.httpstatus.not_found;
                message = 'Definition not found';
            }
            if (!_.isEmpty(err)) {
                status = rdk.httpstatus.bad_request;
            }
            return res.status(status).rdkSend(message);
        });
    } else {
        message = 'Name or Id required';
        return res.status(rdk.httpstatus.bad_request).rdkSend(message);
    }
};

/**
 * Copy a Definition used in the selection of patients
 *
 * @api {post} /resource/cds/patient/definition/copy?id=123&newname=somename
 *      Copy Definition
 *
 * @apiName copyDefinition
 * @apiGroup Patient Definition
 *
 * @apiParam {Number} [id] 24 digit HEX number doc id
 * @apiParam {String} [name] Definition name (if id not used)
 * @apiParam {String} newName new definition name
 *
 * @apiSuccess (Success 201) {json} data update count
 * @apiSuccessExample Success-Response: HTTP/1.1 201 Created
 * { "data": {
 *    "name":"def one A",
 *    "description": "user defined description of this definition template",
 *    "expression": "{and: [ {or: ['A.A','B.B'], {'A.A'} ]}",
 *    "date":"2015-03-10T12:54:54.035Z",
 *    "scope": "private",
 *    "owner": "9E7A;PW    ",
 *    "_id": "54fee99e1e3bdef211534bbb" }
 * }
 *
 * @apiError (Error 400) {json} error Name or Id required
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 * { status: 400 message: Name or Id required }
 * @apiError (Error 404) data Source Definition not found
 * @apiErrorExample Error-Response: HTTP/1.1 404 Not Found
 *  { status: 404 message: Source Definition not found }
 * @apiError (Error 409) {json} error Definition 'name' exists, can not be
 *           created
 * @apiErrorExample Error-Response: HTTP/1.1 409 Conflict
 *  { status: 409 message: Definition 'name' exists, can not be created }
 * @apiError (Error 500) {json} error A system or database error message was
 *           returned
 * @apiErrorExample Error-Response: HTTP/1.1 500 Internal Server Error
 *  { status:500 message: system or database error message }
 *
 */
module.exports.copyDefinition = function(req, res) {
    if (!isCDSMongoServerAvailable) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
    }

    var status = rdk.httpstatus.created;
    var message = '';
    var newname = req.query.newname;

    var match = utils.computeMatch(req);
    if ((!match.name && !match._id) || !newname) {
        status = rdk.httpstatus.bad_request;
        message = 'Name or Id and a Newname required';
        return res.status(status).rdkSend(message);
    }
    if (match._id) {
        message = testId(match._id);
        if (!message) {
            match._id = new ObjectId(match._id);
        } else {
            status = rdk.httpstatus.bad_request;
            return res.status(status).rdkSend(message);
        }
    }

    // retrieve source Definition document
    db.collection(defCollection).findOne(match, function(err, patlst) {
        if (err || _.isEmpty(patlst)) {
            if (err) {
                status = rdk.httpstatus.internal_server_error;
            } else {
                status = rdk.httpstatus.not_found;
                message = 'Source Definition not found';
            }
            return res.status(status).rdkSend(message);
        }

        // see it destination patient list document exists
        delete match._id;
        match.name = newname;
        db.collection(defCollection).findOne(match, function(err, test) {
            if (err || !_.isEmpty(test)) {
                if (err) {
                    status = rdk.httpstatus.bad_request;
                    message = err;
                } else {
                    status = rdk.httpstatus.conflict;
                    message = 'Definition document with name \'' + newname + '\' already exists';
                }
                return res.status(status).rdkSend(message);
            }

            // create a new Definition based on result
            patlst.name = newname;
            delete patlst._id;
            db.collection(defCollection).insert(patlst, function(err, result) {
                message = (err === null) ? result : err;
                if (err) {
                    status = rdk.httpstatus.internal_server_error;
                }
                return res.status(status).rdkSend(message);
            });
        });
    });
};

module.exports.init = init;
