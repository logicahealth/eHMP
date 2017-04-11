'use strict';

// set up the packages we need
var rdk = require('../../core/rdk');
var _ = require('lodash');
var mongo = require('mongoskin');
var ObjectId = require('mongoskin').ObjectID;

var dbName = 'engine';
var engCollection = 'engines';
var thisApp;
var testId;

function init(app) {
    thisApp = app;
    testId = thisApp.subsystems.cds.testMongoDBId;
}


/*
 * Return a named engine
 */
/**
 * @api {get} /resources/cds/engine/registry Request CDS Engine by name, id, filter
 *
 * @apiName getEngine
 * @apiGroup CDS Engine
 *
 * @apiParam {String} [name] Engine name
 * @apiParam {String} [id] 24 digit HEX number doc id
 * @apiParam {String} [filter] A mongo db match specification, i.e.
 *           {"name":"engineOne", "type": "OpenCDS","environment.cpus":8}
 *
 * @apiSuccess (Success 200) {json[]} data A Engine array
 *
 * @apiSuccessExample Success-Response: HTTP/1.1 200 OK
 * {
 *     "data": [{
 *             "_id":
 *                     "555f4edee2d9eceab4e53ec8",
 *             "name": "engineOne",
 *             "description": "engine one registry entry",
 *             "class": "com.cognitive.cds.invocation.model.EngineInfo",
 *             "type": "OpenCDS",
 *             "version": "2.0.5",
 *             "environment": {
 *             "environment": "url=http://IP            /opencds-decision-support-service,memory=32,cpus= 8,java_version=7,webservice=tomcat,webservice_version=7",
 *         }]
 * }
 * @apiError (Error 404) data The entry for id, name, filter not located
 * @apiErrorExample Error-Response: HTTP/1.1 404 Not Found
 * { "data": null }
 *
 */
var getEngine = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS engine resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(dbName, null, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('CDS Engine Registry getEngine called');

        var id = null;
        var name = null;
        var filter = null;
        var status = rdk.httpstatus.ok; // 200;
        var message = '';
        var match = {};

        if (req.query.name) {
            name = req.query.name;
        }
        if (req.query.id) {
            id = req.query.id;
            message = testId(id);
            if (message) {
                return res.status(rdk.httpstatus.bad_request).rdkSend(message);
            }
        }
        if (req.query.filter) {
            filter = req.query.filter;
        }

        if (id) {
            match._id = new ObjectId(id);
        } else if (name && name !== '*') {
            match.name = name;
        }
        if (filter) { // Supports a mongo match object
            message = null;
            try {
                match = JSON.parse(filter);
            } catch (err) {
                return res.status(rdk.httpstatus.bad_request).rdkSend(err.message);
            }
        }
        dbConnection.collection(engCollection).find(match).toArray(function(err, result) {
            var message = (err === null) ? result : err;
            if (err === null && _.isEmpty(result)) {
                status = rdk.httpstatus.not_found;
            }
            res.status(status).rdkSend(message);
        });
    });
};
module.exports.getEngine = getEngine;
/*
 * Store engine
 */
/**
 * @api {post} /resources/cds/engine/registry Create CDS Engine registry entry
 *
 * @apiName postEngine
 * @apiGroup CDS Engine
 *
 * @apiHeader {application/json} Content-Type
 * @apiHeader {json} content CDS Engine registry entry requires a name field
 *
 * @apiSuccess (Success 201) {json} data Engine JSON document
 * @apiSuccessExample Success-Response: HTTP/1.1 201 Created
 * {
 *     "data": [{
 *             "name": "engineOne",
 *             "description": "engine one registry entry",
 *             "class": "com.cognitive.cds.invocation.model.EngineInfo",
 *             "type": "OpenCDS",
 *             "version": "2.0.5",
 *             "environment": "url=http://IP            /opencds-decision-support-service,memory=32,cpus= 8,java_version=7,webservice=tomcat,webservice_version=7",
 *             "_id": "555f4edee2d9eceab4e53ec8"
 *         }]
 * }
 * @apiError (Error 400) {json} error Missing or invalid field(s)
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 * { "error": "Missing
 *                  required CDS engine registry entry name" }
 * @apiError (Error 409) {json} error CDS Engine registry entry name exists
 * @apiErrorExample Error-Response: HTTP/1.1 409 Conflict
 * { "error": "CDS Engine
 *                  registry entry exists, can not be created" }
 *
 */
var postEngine = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS engine resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(dbName, null, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('Engine Registry postEngine called');

        var status = rdk.httpstatus.created;
        var message = '';
        var engine = req.body;

        if (!engine || !engine.name) { // What other properties should be validated???
            return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required CDS engine name');
        }
        delete engine._id;
        dbConnection.collection(engCollection).find({name: engine.name}).toArray(function(err, result) {
            if (!err && result.length > 0) {
                message = 'CDS engine descriptor exists, can not be created';
                return res.status(rdk.httpstatus.conflict).rdkSend(message);
            }
            dbConnection.collection(engCollection).insert(engine, function(err, result) {
                message = (err === null) ? result.ops : err;
                if (err) {
                    status = rdk.httpstatus.bad_request;
                }
                return res.status(status).rdkSend(message);
            });
        });
    });
};
module.exports.postEngine = postEngine;
/*
 * update engine
 */
/**
 * @api {put} /resources/cds/engine/registry Modify CDS Engine registry entry
 *
 * @apiName putEngine
 * @apiGroup CDS Engine
 *
 * @apiHeader {application/json} Content-Type
 * @apiHeader {json} content Engine object
 *
 * @apiSuccess (Success 200) {json} data update count
 * @apiSuccessExample Success-Response: HTTP/1.1 200 Success
 * { "data": 1 }
 *
 * @apiError (Error 400) {json} error Missing or invalid field(s)
 * @apiErrorExample Error-Response: HTTP/1.1 400 Bad Request
 * { "error": "Missing required CDS engine name" }
 * @apiError (Error 404) {json} error not found
 * @apiErrorExample Error-Response: HTTP/1.1 404 Not Found
 * { "error": "CDS Engine registry entry not found" }
 */
var putEngine = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS engine resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(dbName, null, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('Engine Registry putEngine called');

        var status = rdk.httpstatus.ok;
        var message = '';
        var engine = req.body;

        if (!engine || !engine.name) {
            return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required CDS Engine registration name');
        }
        dbConnection.collection(engCollection).find({ name: engine.name}).toArray(function (err, result) {
            if (err || _.isEmpty(result)) {
                return res.status(rdk.httpstatus.not_found).rdkSend('CDS Engine registry entry not found');
            }
            delete engine._id;
            dbConnection.collection(engCollection).update({name: engine.name}, engine, function(err, result) {
                message = (err === null) ? result : err;
                if (err) {
                    status = rdk.httpstatus.bad_request;
                }
                return res.status(status).rdkSend(message);
            });
        });
    });
};
module.exports.putEngine = putEngine;
/*
 * Delete a engine
 */
/**
 * @api {delete} /resources/cds/engine/registry Delete CDS Engine registry entry by name or id
 *
 * @apiName deleteEngine
 * @apiGroup CDS Engine
 *
 * @apiParam {String} [name] CDS engine name
 * @apiParam {String} [id] 24 digit HEX number doc id
 *
 * @apiSuccess (Success 200) {Number} data Delete count
 * @apiSuccessExample Success-Response: HTTP/1.1 200 OK
 * { "data": 1 }
 *
 * @apiError (Error 404) {Number} data The specified engine entry was not
 *           found
 * @apiErrorExample Error-Response: HTTP/1.1 404 Not Found
 * { "data": 0 }
 *
 */
var deleteEngine = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS engine resource is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(dbName, null, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('Engine Registry deleteEngine called');

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
            if (!message) {
                match._id = new ObjectId(id);
            } else {
                return res.status(rdk.httpstatus.bad_request).rdkSend(message);
            }
        } else if (name) {
            match.name = name;
        } else {
            return res.status(rdk.httpstatus.bad_request).rdkSend('Either id or name parameter required');
        }

        dbConnection.collection(engCollection).remove(match, function(err, result) {
            var message = (err === null) ? result : err;
            if (_.isEmpty(err) && result.result.n !== 1) {
                status = rdk.httpstatus.not_found;
                message = 'Engine registry entry not found';
            }
            if (!_.isEmpty(err)) {
                status = rdk.httpstatus.bad_request;
            }
            res.status(status).rdkSend(message);
        });
    });
};
module.exports.deleteEngine = deleteEngine;
module.exports.init = init;
