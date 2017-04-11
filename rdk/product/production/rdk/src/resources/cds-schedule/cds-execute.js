'use strict';

//set up the packages we need
var rdk = require('../../core/rdk');
var _ = require('lodash');
var dd = require('drilldown');
var mongo = require('mongoskin');
var ObjectId = require('mongoskin').ObjectID;

var dbName = 'schedule';
var exeCollection = 'cdsjobs';
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
        // errors are logged by CDS subsystem
    });
    testId = app.subsystems.cds.testMongoDBId;
}

// Execution Request

/*
 * Return a named request
 */
/**
 * @api {get} /execute/request[?name=name] Request CDS Execute Job
 *
 * @apiName getCDSJob
 * @apiGroup CDS Scheduler
 *
 * @apiParam {String} name Request name
 * @apiParam {String} id Request id
 * @apiParam {String} . Return all CDSjobs
 *
 * @apiSuccess (Success 200) {json[]} data A Request array
 *
 * @apiSuccessExample Success-Response: HTTP/1.1 200 OK
{
    "data": [{
                        "_id":
                                "551b4735c6d44fe18c9f14a9",
                        "description": "The
                                Descripiton", "execution": { "baseContext": { "location": {
                                "codeSystem": null,
                        "entityType": "Location",
                        "id":
                                "LocationId",
                        "name": "LocationName",
                        "type": "Clinic"
                    },
                    "specialty": {
                        "codeSystem": null,
                        "entityType":
                                "Specialty",
                        "id": "SpecId",
                        "name": "SpecName",
                        "type":
                                "Department"
                    },
                    "subject": null,
                    "user": {
                        "codeSystem":
                                null,
                        "entityType": "User",
                        "id": "UserId",
                        "name":
                                "TheUser",
                        "type": "Provider"
                    }
                },
                "subjectIds": [
                    "Patient:Id1", "Patient:Id2", "Patient:Id3"],
                "subjectListReferences": [{
                        "id": "ListId1",
                        "type":
                                "Patient"
                    }, {
                        "id": "ListId2",
                        "type": "Patient"
                    }],
                "target": {
                    "intentsSet": ["Intent1", "Intent2"],
                    "mode": "Normal",
                    "perceivedExecutionTime": null,
                    "supplementalMappings": [{
                            "dataFormat": "FHIR",
                            "dataQueries": [
                                "http://www.rdk.gov/fhir/resource?id=\"{$Subject.Id}\""],
                            "engineName": "Engine1",
                            "rules": [{
                                    "id":
                                            "Engine1-RuleId22",
                                    "properties": {
                                        "AProperty":
                                                "SomeValue"
                                    }
                                }, {
                                    "id": "Engine1-RuleId34",
                                    "properties":
                                            null
                                }]
                        }],
                    "type": "Background"
                }
            },
            "lastExecutionResult": null,
            "lastRun": 1443989700000,
            "name": "JobName",
            "owner": {
                "codeSystem": null,
                "entityType": "User",
                "id": "JobOwnerId",
                "name":
                        "TheJobOwner",
                "type": "Administrator"
            }
        }]
}
 *
 * @apiError (Error 404) data The id or name specified does not exist
 * @apiErrorExample Error-Response: HTTP/1.1 404 Not Found
 * { "data": null }
 *
 */
module.exports.getExecute = function(req, res) {
    if (!isCDSMongoServerAvailable) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
    }

    req.logger.debug('ExecutionRequest getCDSExecution called');

    var status = rdk.httpstatus.ok; // 200;
    var message = '';
    var match = {};
    if (req.query) {
        if (req.query.id && !testId(req.query.id)) {
            match._id = new ObjectId(req.query.id);
        }
        if (req.query.name) {
            match.name = req.query.name;
        }
    }

    db.collection(exeCollection).find(match).toArray(function(err, result) {
        message = (err === null) ? result : err;
        if (err === null && _.isEmpty(result)) {
            status = rdk.httpstatus.not_found;
        }
        return res.status(status).rdkSend(message);
    });
};

/*
 * Store ExecutionRequest
 */
/**
 * @api {post} /execute/request Create CDS Execute Job
 *
 * @apiName postCDSJob
 * @apiGroup CDS Scheduler
 *
 * @apiHeader {application/json} Content-Type
 * @apiHeader {json} content CDS Job object requires a name: field
 *
 * @apiSuccess (Success 201) {json} data Job JSON document
 * @apiSuccessExample Success-Response: HTTP/1.1 201 Created
{
    "data": [{
                        "_id":
                                "551b4735c6d44fe18c9f14a9",
                        "description": "The
                                Descripiton", "execution": { "baseContext": { "location": {
                                "codeSystem": null,
                        "entityType": "Location",
                        "id":
                                "LocationId",
                        "name": "LocationName",
                        "type": "Clinic"
                    },
                    "specialty": {
                        "codeSystem": null,
                        "entityType":
                                "Specialty",
                        "id": "SpecId",
                        "name": "SpecName",
                        "type":
                                "Department"
                    },
                    "subject": null,
                    "user": {
                        "codeSystem":
                                null,
                        "entityType": "User",
                        "id": "UserId",
                        "name":
                                "TheUser",
                        "type": "Provider"
                    }
                },
                "subjectIds": [
                    "Patient:Id1", "Patient:Id2", "Patient:Id3"],
                "subjectListReferences": [{
                        "id": "ListId1",
                        "type":
                                "Patient"
                    }, {
                        "id": "ListId2",
                        "type": "Patient"
                    }],
                "target": {
                    "intentsSet": ["Intent1", "Intent2"],
                    "mode": "Normal",
                    "perceivedExecutionTime": null,
                    "supplementalMappings": [{
                            "dataFormat": "FHIR",
                            "dataQueries": [
                                "http://www.rdk.gov/fhir/resource?id=\"{$Subject.Id}\""],
                            "engineName": "Engine1",
                            "rules": [{
                                    "id":
                                            "Engine1-RuleId22",
                                    "properties": {
                                        "AProperty":
                                                "SomeValue"
                                    }
                                }, {
                                    "id": "Engine1-RuleId34",
                                    "properties":
                                            null
                                }]
                        }],
                    "type": "Background"
                }
            },
            "lastExecutionResult": null,
            "lastRun": 1443989700000,
            "name": "JobName",
            "owner": {
                "codeSystem": null,
                "entityType": "User",
                "id": "JobOwnerId",
                "name":
                        "TheJobOwner",
                "type": "Administrator"
            }
        }]
}
 *
 * @apiError (Error 400) {json} error Missing or invalid field(s)
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 * { "error": "Missing
 *                  required name" }
 * @apiError (Error 409) {json} error name exists
 * @apiErrorExample Error-Response: HTTP/1.1 409 Conflict
 * { "error": "CDS
 *                  ExecutionRequest document 'Name' exists, can not be created" }
 *
 */
module.exports.postExecute = function(req, res) {
    if (!isCDSMongoServerAvailable) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
    }

    req.logger.debug('ExecutionRequest postCDSExecution called');

    var status = rdk.httpstatus.created; // 201;
    var message = '';
    var job = req.body;

    if (!job || !job.name) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required Request name');
    }
    if (job._id) {
        // _id is generated by the persistence store, allowing it to be set could cause duplicate key errors
        return res.status(rdk.httpstatus.bad_request).rdkSend('Cannot create a CDS Job document with a set _id, \'_id\' is a generated property.');
    }
    db.collection(exeCollection).find({
        name: job.name
    }).toArray(function(err, result) {
        if (!err && result.length > 0) {
            return res.status(rdk.httpstatus.conflict).rdkSend('CDS Job document \'' + job.name + '\' existatus, can not be created');
        }
        db.collection(exeCollection).insert(job, function(err, result) {
            message = (err === null) ? result : err;
            if (err) {
                status = rdk.httpstatus.bad_request;
            }
            res.status(status).rdkSend(message);
        });
    });
};

/*
 * update ExecutionRequest
 */
/**
 * @api {put} /execute/request Modify CDS Execute Job
 *
 * @apiName putExecute
 * @apiGroup CDS Scheduler
 *
 * @apiHeader {application/json} Content-Type
 * @apiHeader {json} content ExecuteRequest object
 *
 * @apiSuccess (Success 200) {json} data update count
 * @apiSuccessExample Success-Response: HTTP/1.1 200 Success
 * { "data": 1 }
 *
 * @apiError (Error 400) {json} error Missing or invalid field(s)
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 * { "error": "Missing
 *                  required CDS name" }
 * @apiError (Error 404) {json} error not found
 * @apiErrorExample Error-Response: HTTP/1.1 404 Not Found
 * { "error": "CDS
 *                  ExecutionRequest document 'Name' does not " }
 */
module.exports.putExecute = function(req, res) {
    if (!isCDSMongoServerAvailable) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
    }

    req.logger.debug('ExecutionRequest putCDSExecution called');

    var status = rdk.httpstatus.ok; // 200;
    var job = req.body;

    if (!job || !job.name) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required CDS Request name');
    }

    db.collection(exeCollection).find({
        name: job.name
    }).toArray(function(err, result) {
        if (err || _.isEmpty(result)) {
            return res.status(rdk.httpstatus.conflict).rdkSend('CDS Job document \'' + job.name + '\' not found');
        }
        delete job._id;
        db.collection(exeCollection).update({
            name: job.name
        }, job, function(err, result) {
            var message = (err === null) ? result : err;
            if (err) {
                status = rdk.httpstatus.bad_request;
            }
            return res.status(status).rdkSend(message);
        });
    });
};

/*
 * Delete an ExecutionRequest
 */
/**
 * @api {delete} //execute/request?name=name Delete CDS Execute Job
 *
 * @apiName deleteCDSJob
 * @apiGroup CDS Scheduler
 *
 * @apiParam {String} name CDS ExecutionRequest name
 * @apiParam {Number} [id] 24 digit HEX number doc id
 *
 * @apiSuccess (Success 200) {Number} data Delete count
 * @apiSuccessExample Success-Response: HTTP/1.1 200 OK
 * { "data": 1 }
 *
 * @apiError (Error 404) {Number} data The specified ExecutionRequest was not
 *           found
 * @apiErrorExample Error-Response: HTTP/1.1 404 Not Found
 * { "data": 0 }
 *
 */
module.exports.deleteExecute = function(req, res) {
    if (!isCDSMongoServerAvailable) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
    }

    req.logger.debug('Execution Request deleteCDSExecution called');

    var status = rdk.httpstatus.ok;
    var id = null;
    var name = null;
    var match = {};
    var message = null;
    if (req.query.name) {
        name = req.query.name;
    }
    if (req.query.id) {
        id = req.query.id;
    }
    if (id) {
        message = testId(id);
        if (message) {
            return res.status(rdk.httpstatus.bad_request).rdkSend(message);
        }
        match._id = new ObjectId(id);
    } else if (name) {
        match.name = name;
    } else {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Either id or name parameter required');
    }

    db.collection(exeCollection).remove(match, function(err, result) {
        var message = (err === null) ? result : err;
        if (_.isEmpty(err) && result !== 1) {
            status = rdk.httpstatus.not_found;
            message = 'Execute Request entry not found';
        }
        if (!_.isEmpty(err)) {
            status = rdk.httpstatus.bad_request;
        }
        res.status(status).rdkSend(message);
    });
};

module.exports.init = init;
