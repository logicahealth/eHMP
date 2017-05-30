'use strict';

//FUTURE-TODO: Examine the need to handle multiple patient identifier types.  It is currently assumed that all
//patient ids are of type 'pid' and not 'icn.'  This may require adding a new field to each id stored in the //patient lists

// set up the packages we need
var rdk = require('../../core/rdk');
var _ = require('lodash');
var utils = require('./utils.js');
var ObjectId = require('mongoskin').ObjectID;
var http = rdk.utils.http;
var nullchecker = rdk.utils.nullchecker;

var dbName = 'patientlist';
var patCollection = 'patientlist';
var thisApp;

var testId;

function init(app) {
    thisApp = app;
    testId = thisApp.subsystems.cds.testMongoDBId;
}


// /////////////
// Patient List
// /////////////

/**
 * Retrieve patient list(s) used in processing
 *
 * @api {get} /resource/cds/patient/list[?id=id|name=name] Request Patientlist
 *
 * @apiName getPatientlist
 * @apiGroup Patient List
 *
 * @apiParam {String} [id] Patientlist id (24 digit HEX number), id has
 *           precedence over name
 * @apiParam {String} [name] Patientlist name (if id not used)
 *
 * @apiSuccess (200) {json[]} data Array of one or more Patientlists
 * @apiSuccessExample Success-Response: HTTP/1.1 200 OK
 * {
 *     "data": [{
 *             "name":
 *                     "pat list one",
 *             "definition": {
 *                 "_id":
 *                         "54f0d4a540d37300003a5711",
 *                 "name": "def one",
 *                 "description": "user defined description of thisdefinition template",
 *                 "expression": "{and: [ {or:['A.A', 'B.B'], {'A.A'} ]}",
 *                 "date":
 *                         "2015-02-27T20:33:41.308Z",
 *                 "scope": "private",
 *                 "owner":
 *                         "REDACTED"
 *             },
 *             "pidhistory": [{
 *                     "timestamp": "2015-03-10T00:53:55.934Z",
 *                     "pid": "12345V123",
 *                     "add": true
 *                 }],
 *             "patients": [
 *                 "12345V123"],
 *             "scope": "private",
 *             "owner": "REDACTED",
 *             "_id": "54fe407fc9f41fad0fff5dc4"
 *         }]
 * }
 *
 * @apiError (Error 400) message Specified _id not formatted correctly
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 * { "status": 400,
 *   "message": Argument passed in must be a single String of 12 bytes or a string of 24 hex characters }
 * @apiError (Error 404) . The id or name specified does not exist
 * @apiErrorExample Error-Response: HTTP/1.1 404 Not Found
 * { "status": 404,
 *  "message": "Patientlist not found" }
 *
 */
var getPatientList = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS patient list resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(dbName, null, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
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
            // db.collection(patCollection).find(match).toArray(function(err, result) {
            dbConnection.collection(patCollection).findOne(match, function(err, result) {
                message = (err === null) ? result : err;
                if (err === null && _.isEmpty(result)) {
                    status = rdk.httpstatus.not_found;
                    message = 'Patientlist not found';
                }
                return res.status(status).rdkSend(message);
            });
        } else { // return multiple
            dbConnection.collection(patCollection).find(match).toArray(function(err, result) {
                message = (err === null) ? result : err;
                if (err === null && _.isEmpty(result)) {
                    status = rdk.httpstatus.not_found;
                    message = 'Patientlist(s) not found';
                }
                return res.status(status).rdkSend(message);
            });
        }
    });
};
module.exports.getPatientList = getPatientList;

/**
 * Create Patientlist used in processing
 *
 * @api {post} /resource/cds/patient/list Create Patientlist
 *
 * @apiName postPatientlist
 * @apiGroup Patient List
 *
 * @apiHeader {application/json} Content-Type
 * @apiHeader {json} content Patientlist object
 * @apiDescription The post passes the Patientlist in the content as a
 *                 stringified json object The header will include the content
 *                 length, i.e. Content-Length = length
 *
 * @apiSuccess (201) {json} data Patientlist JSON document
 * @apiSuccessExample Success-Response: HTTP/1.1 201 Created
 * {
 *     "data": [{
 *             "name":
 *                     "pat list one",
 *             "definition": {
 *                 "_id":
 *                         "54f0d4a540d37300003a5711",
 *                 "name": "def one",
 *                 "description": "user defined description of thisdefinition template",
 *                 "expression": "{and: [ {or:['A.A', 'B.B'], {'A.A'} ]}",
 *                 "date":
 *                         "2015-02-27T20:33:41.308Z",
 *                 "scope": "private",
 *                 "owner":
 *                         "REDACTED"
 *             },
 *             "pidhistory": [{
 *                     "timestamp": "2015-03-10T00:53:55.934Z",
 *                     "pid": "12345V123",
 *                     "add": true
 *                 }],
 *             "patients": [
 *                 "12345V123"],
 *             "scope": "private",
 *             "owner": "REDACTED",
 *             "_id": "54fe407fc9f41fad0fff5dc4"
 *         }]
 * }
 * @apiError (Error 400) message Patientlist document (request body) must be
 *           defined
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 * { status: 400
 *                  message: Patientlist document (request body) must be defined }
 * @apiError (Error 400) message Scope must be specified using private
 *           (default), site or enterprise
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 * { status: 400 message: Scope must be specified using private (default), site or enterprise }
 * @apiError (Error 400) message The id or name specified does not exist
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 * { status: 400 message: Name or Id and a Pid required }
 * @apiError (Error 400) message Patientlist document can not have _id defined
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 * { status: 400 message: Patientlist document can not have _id defined }
 * @apiError (Error 400) message Patientlist.definition must be defined
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 * { status: 400 message: Patientlist.definition must be defined }
 * @apiError (Error 404) message Source Patientlist not found
 * @apiErrorExample Error-Response: HTTP/1.1 404 Not Found
 * { status: 404  message: Source Patientlist not found }
 * @apiError (Error 500) {json} error A system or database error message was
 *           returned
 * @apiErrorExample Error-Response: HTTP/1.1 500 Internal Server Error
 * { status: 500 message: system or database error message }
 *
 *
 */
var postPatientlist = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS patient list resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(dbName, null, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        var status = rdk.httpstatus.created;
        var message = '';
        var doc = req.body;

        if (!doc) {
            status = rdk.httpstatus.bad_request;
            message = 'Patientlist document (request body) must be defined';
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
            message = 'Patientlist name must be defined';
            return res.status(status).rdkSend(message);
        }
        if (!doc.definition) {
            status = rdk.httpstatus.bad_request;
            message = 'Patientlist.definition must be defined';
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
        doc.pidhistory = [];
        if (doc.patients === undefined) {
            doc.patients = [];
        }
        var match = {
            name: doc.name,
            scope: doc.scope,
            owner: doc.owner
        };
        // Verify the definition does not already exist
        dbConnection.collection(patCollection).findOne(match, function(err, result) {
            if (!_.isEmpty(result)) {
                message = 'Patientlist \'' + doc.name + '\' exists, can not be created';
                return res.status(rdk.httpstatus.conflict).rdkSend(message);
            }
            if (err) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
            }
            dbConnection.collection(patCollection).insert(doc, function(err, result) {
                var message = (err === null) ? result.ops : err;
                if (err) {
                    status = rdk.httpstatus.internal_server_error;
                }
                return res.status(status).rdkSend(message);
            });
        });
    });
};
module.exports.postPatientlist = postPatientlist;

/**
 * Delete Patientlist used in processing
 *
 * @api {delete} /resource/cds/patient/list?id=id Delete Patientlist (or name=name)
 * @apiName deletePatientlist
 * @apiGroup Patient List
 *
 * @apiParam {String} [id] 24 digit HEX number doc id
 * @apiParam {String} [name] Patientlist name (if id not used)
 *
 * @apiSuccess (200) {Number} data Delete count
 * @apiSuccessExample Success-Response: HTTP/1.1 200 OK
 * { "data": "1" }
 *
 * @apiError (Error 400) message The id or name specified does not exist
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 * { status: 400  message: Name or Id and a Pid required }
 * @apiError (Error 404) message Patientlist not found
 * @apiErrorExample Error-Response: HTTP/1.1 404 Not Found
 * { status: 404 message: Patientlist not found }
 *
 */
var deletePatientlist = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS patient list resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(dbName, null, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        var status = rdk.httpstatus.ok;
        var message = '';

        var match = utils.computeMatch(req);
        if (match._id) {
            message = testId(match._id);
            if (message) {
                return res.status(rdk.httpstatus.bad_request).rdkSend(message);
            }
            match._id = new ObjectId(match._id);
        }
        if (!match.name && !match._id) {
            return res.status(rdk.httpstatus.bad_request).rdkSend('Name or Id required');
        }
        dbConnection.collection(patCollection).remove(match, function(err, result) {
            var message = (err === null) ? result : err;
            if (_.isEmpty(err) && result === 0) {
                status = rdk.httpstatus.not_found;
                message = 'Patient list not found';
            }
            if (!_.isEmpty(err)) {
                status = rdk.httpstatus.bad_request;
            }
            return res.status(status).rdkSend(message);
        });
    });
};
module.exports.deletePatientlist = deletePatientlist;

/**
 * Add a patient to Patientlist
 *
 * @api {post} /resource/cds/patient/list/patients?id&pid Add Patient
 *
 * @apiName addPatient
 * @apiGroup Patient List
 *
 * @apiParam {String} [id] - 24 digit HEX number doc id
 * @apiParam {String} [name] Patientlist name (if id not used)
 * @apiParam {String} pid Patient ID to be added
 *
 * @apiSuccess(200) {json} data update count
 * @apiSuccessExample Success-Response: HTTP/1.1 200 OK
 *  { "data": 1 }
 *
 * @apiError (Error 400) message The id or name specified does not exist
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 * { status: 400
 *                  message: Name or Id and a Pid required }
 * @apiError (Error 404) message Source Patientlist not found
 * @apiErrorExample Error-Response: HTTP/1.1 404 Not Found
 * { status: 404
 *                  message: Source Patientlist not found }
 *
 */
var addPatient = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS patient list resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(dbName, null, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        var status = rdk.httpstatus.ok;
        var message = '';
        var pid = req.query.pid;

        // Find the patientlist
        var match = utils.computeMatch(req);
        if ((!match.name && !match._id) || !pid) {
            status = rdk.httpstatus.bad_request;
            message = 'Name or Id and a Pid required';
            return res.status(status).rdkSend(message);
        }
        if (match._id) {
            message = testId(match._id);
            if (message) {
                return res.status(rdk.httpstatus.bad_request).rdkSend(message);
            }
            match._id = new ObjectId(match._id);
        }

        dbConnection.collection(patCollection).findOne(match, function(err, result) {
            if (err || _.isEmpty(result)) {
                if (err) {
                    status = rdk.httpstatus.internal_server_error;
                } else {
                    status = rdk.httpstatus.not_found;
                    message = 'Source Patientlist not found';
                }
                return res.status(status).rdkSend(message);
            }

            // Add patient, update change history
            if (result.patients.indexOf(pid) === -1) {
                result.patients.push(pid);
            }
            var obj = {
                timestamp: new Date(),
                pid: pid,
                add: true
            };
            result.pidhistory.push(obj);
            // update the patient list
            dbConnection.collection(patCollection).update({
                _id: result._id
            }, result, function(err, result) {
                message = (err === null) ? result : err;
                if (err) {
                    status = rdk.httpstatus.internal_server_error;
                }
                return res.status(status).rdkSend(message);
            });
        });
    });
};
module.exports.addPatient = addPatient;

/**
 * Remove a patient from Patientlist
 *
 * @api {delete} /resource/cds/patient/list/patients?id=123&pid=abc Remove Patient
 *
 * @apiName removePatient
 * @apiGroup Patient List
 *
 * @apiParam {String} [id] - 24 digit HEX number doc id
 * @apiParam {String} [name] Patientlist name (if id not used)
 * @apiParam {String} pid Patient ID to be removed
 *
 * @apiSuccess (200) {json} data update count
 * @apiSuccessExample Success-Response: HTTP/1.1 200 OK
 * { "data": 1 }
 *
 * @apiError (Error 400) message The id or name specified does not exist
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 * { status: 400
 *                  message: Name or Id and a Pid required }
 * @apiError (Error 404) message Source Patientlist not found
 * @apiErrorExample Error-Response: HTTP/1.1 404 Not Found
 * { status: 404
 *                  message: Source Patientlist not found }
 * @apiError (Error 500) {json} error A system or database error message was
 *           returned
 * @apiErrorExample Error-Response: HTTP/1.1 500 Internal Server Error
 * { status:
 *                  500 message: system or database error message }
 *
 */
var removePatient = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS patient list resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(dbName, null, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        var status = rdk.httpstatus.ok;
        var message = '';
        var pid = req.query.pid;

        // Find the patientlist
        var match = utils.computeMatch(req);
        if ((!match.name && !match._id) || !pid) {
            status = rdk.httpstatus.bad_request;
            message = 'Name or Id and a Pid required';
            return res.status(status).rdkSend(message);
        }

        if (match._id) {
            message = testId(match._id);
            if (message) {
                return res.status(rdk.httpstatus.bad_request).rdkSend(message);
            }
            match._id = new ObjectId(match._id);
        }

        dbConnection.collection(patCollection).findOne(match, function(err, result) {
            if (err || _.isEmpty(result)) {
                if (err) {
                    status = rdk.httpstatus.internal_server_error;
                } else {
                    status = rdk.httpstatus.not_found;
                    message = 'Source Patientlist not found';
                }
                return res.status(status).rdkSend(message);
            }

            // Remove patient id
            var i = result.patients.indexOf(pid);
            if (i >= 0) {
                result.patients.splice(i, 1);
            }
            var obj = {
                timestamp: new Date(),
                pid: pid,
                add: false
            };
            result.pidhistory.push(obj);
            dbConnection.collection(patCollection).update({
                _id: result._id
            }, result, function(err, result) {
                message = (err === null) ? result : err;
                if (err) {
                    status = rdk.httpstatus.internal_server_error;
                }
                return res.status(status).rdkSend(message);
            });
        });
    });
};
module.exports.removePatient = removePatient;

/**
 * Checks if a patient is a member of any patient list
 *
 * @api {get} /resource/cds/patient/list/status?type=pid&value=9E7A;100001 Get Membership Status
 *
 * @apiName checkPatientMembershipStatus
 * @apiGroup Patient List
 *
 * @apiParam {String} type the type of the Patient ID
 * @apiParam {String} value the actual Patient ID value to be found
 *
 * @apiSuccess (200) {json} data boolean value
 * @apiSuccessExample Success-Response: HTTP/1.1 200 OK
 *  { "message": "true", "status": 200 }
 *
 * @apiError (Error 400) message The id or name specified does not exist
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 * { "message": "Patient identifier type and value are required", "status": 400 }
 * @apiError (Error 500) {json} error A system or database error message was
 *           returned
 * @apiErrorExample Error-Response: HTTP/1.1 500 Internal Server Error
 * { status: 500 message: system or database error message }
 *
 */
var checkPatientMembershipStatus = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS patient list resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(dbName, null, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        var type = req.query.type;
        var pid = req.query.value;

        if (!type || !pid) {
            return res.status(rdk.httpstatus.bad_request).rdkSend('Patient identifier type and value are required');
        }

        var jdsResource = '/vpr/jpid';
        req.logger.info('jpid search using pid [%s]', pid);

        var jdsPath = jdsResource + '/' + pid;
        var options = _.extend({}, req.app.config.jdsServer, {
            url: jdsPath,
            logger: req.logger,
            json: true
        });

        http.get(options, function(error, response, result) {
            if (error) {
                req.logger.error({error: error}, 'patient-list.checkPatientMembershipStatus error');
                return res.status(rdk.httpstatus.ok).rdkSend('false');
            }

            var patientIdentifiers = result.patientIdentifiers;
            if (nullchecker.isNullish(patientIdentifiers)) {
                req.logger.debug('No patient identifiers for pid [%s]', pid);
                return res.status(rdk.httpstatus.ok).rdkSend('false');
            }

            //FUTURE - This may need future optimization.  The two possible appraches:
            //1) add a multi-key index to the patients field in mongo (http://docs.mongodb.org/manual/core/index-multikey/)
            //2) keep a master list of patients with a counter to be incremented or decremented each time a patient is
            //added to or removed from a list.
            var matchStatement = {
                patients: {$in: patientIdentifiers}
            };
            dbConnection.collection(patCollection).findOne(matchStatement, function(err, result) {
                if (err) {
                    return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
                }
                var isMember = !_.isEmpty(_.get(result, 'patients'));
                return res.status(rdk.httpstatus.ok).rdkSend(isMember ? 'true' : 'false');
            });
        });
    });
};
module.exports.checkPatientMembershipStatus = checkPatientMembershipStatus;

/**
 * Copy a Patientlist
 *
 * @api {post} /resource/cds/patient/list/copy?id=123&newname=somename Copy Patient-List
 *
 * @apiName copyPatientlist
 * @apiGroup Patient List
 *
 * @apiParam {String} [id] 24 digit HEX number doc id
 * @apiParam {String} [name] Patientlist name (if id not used)
 * @apiParam {String} newname new Patientlist name
 *
 * @apiSuccess (201) {json} data update count
 * @apiSuccessExample Success-Response: HTTP/1.1 201 Created
 * {
 *     "data": [{
 *             "name":
 *                     "pat list one",
 *             "definition": {
 *                 "_id":
 *                         "54f0d4a540d37300003a5711",
 *                 "name": "def one",
 *                 "description": "user defined description of thisdefinition template",
 *                 "expression": "{and: [ {or:['A.A', 'B.B'], {'A.A'} ]}",
 *                 "date":
 *                         "2015-02-27T20:33:41.308Z",
 *                 "scope": "private",
 *                 "owner":
 *                         "REDACTED"
 *             },
 *             "pidhistory": [{
 *                     "timestamp": "2015-03-10T00:53:55.934Z",
 *                     "pid": "12345V123",
 *                     "add": true
 *                 }],
 *             "patients": [
 *                 "12345V123"],
 *             "scope": "private",
 *             "owner": "REDACTED",
 *             "_id": "54fe407fc9f41fad0fff5dc4"
 *         }]
 * }
 *
 * @apiError (Error 400) message Error on request
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 * { status: 400
 *    message: Name or Id and a Newname required }
 * @apiError (Error 404) message The id or name specified does not exist
 * @apiErrorExample Error-Response: HTTP/1.1 404 Not Found
 * { status: 404
 *   message: Source Patientlist not found }
 * @apiError (Error 409) message The new name specified already exists
 * @apiErrorExample Error-Response: HTTP/1.1 409 Conflict
 * { status: 409
 *  message: Patientlist document with name 'newname' already exists }
 * @apiError (Error 500) message Severe internal error
 * @apiErrorExample Error-Response: HTTP/1.1 500 Internal Server Error
 * { status: 500 message: Internal Server Error }
 *
 */
var copyPatientlist = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS patient list resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(dbName, null, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        var status = rdk.httpstatus.created;
        var message = '';
        var newname = req.query.newname;

        var match = utils.computeMatch(req);
        if ((!match.name && !match._id) || !newname) {
            message = 'Name or Id and a Newname required';
            return res.status(rdk.httpstatus.bad_request).rdkSend(message);
        }

        if (match._id) {
            message = testId(match._id);
            if (message) {
                return res.status(rdk.httpstatus.bad_request).rdkSend(message);
            }
            match._id = new ObjectId(match._id);
        }

        // retrieve source Patientlist document
        dbConnection.collection(patCollection).findOne(match, function(err, patlst) {
            if (err || _.isEmpty(patlst)) {
                if (err) {
                    status = rdk.httpstatus.internal_server_error;
                } else {
                    status = rdk.httpstatus.not_found;
                    message = 'Source Patientlist not found';
                }
                return res.status(status).rdkSend(message);
            }

            // see if destination Patient list document exists
            delete match._id;
            match.name = newname;
            dbConnection.collection(patCollection).findOne(match, function(err, test) {
                if (err || !_.isEmpty(test)) {
                    if (err) {
                        status = rdk.httpstatus.bad_request;
                        message = err;
                    } else {
                        status = rdk.httpstatus.conflict;
                        message = 'Patientlist document with name \'' + newname + '\' already exists';
                    }
                    return res.status(status).rdkSend(message);
                }

                // create a new Patientlist based on result
                patlst.name = newname;
                delete patlst._id;
                dbConnection.collection(patCollection).insert(patlst, function(err, result) {
                    message = (err === null) ? result.ops : err;
                    if (err) {
                        status = rdk.httpstatus.internal_server_error;
                    }
                    return res.status(status).rdkSend(message);
                });
            });
        });
    });
};
module.exports.copyPatientlist = copyPatientlist;

module.exports.init = init;
