/*jslint node: true */
'use strict';

var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var mongo = require('mongoskin');
var dd = require('drilldown');

var dbName = 'intent';
var intentCollection = 'cdsintent';
var db ;

var isCDSMongoServerAvailable = false;

module.exports.init = function(app) {
    isCDSMongoServerAvailable = dd(app)('subsystems')('cds')('isCDSMongoServerConfigured').invoke();
    if (!isCDSMongoServerAvailable) {
        return;
    }
    app.subsystems.cds.getCDSDB(dbName, function(error, dbConnection) {
        if (!error) {
            db = dbConnection;
            initDb(app);
        }
    });
};

//
// Database Init
//
function initDb(app) {
    /*
     * Index for intents
     *
     * Note: It's both sparse and unique - so we will still need to make sure required fields are present,
     * because scopeId is optional.  Unfortunately Mongo doesn't let us have only that 'column' set as sparse,
     * so we have to deal with that programmatically.
     */
    db.collection(intentCollection).ensureIndex({
        name: 1,
        scope: 1,
        scopeId: 1
    }, {
        sparse: true,
        unique: true
    }, function(error) {
        if (error) {
            app.logger.error({error: error}, 'error ensuring ' + intentCollection + ' index');
        }
    });
}

// Intent

/**
 * @api {get} /resource/cds/intent/registry Get Intent
 * @apiName GetIntent
 * @apiGroup Intent
 * @apiParam {String} [name] Intent name
 * @apiParam {String} [scope] Intent Scope
 * @apiParam {String} scopeId Intent Scope Id
 * @apiDescription Returns the intent or intents that match the uri query parameters.  The values for "name"
 * and "scope" are required.  For ease of use, these can be wildcarded by passing in a '*'.  This way we can
 * use this method to either get a single entity or return a list of entities which might be useful for testing
 * or other future uses.
 * @apiExample {js} Example usage:
 * curl -i http://IP_ADDRESS:PORT/resource/cds/intent/registry?name=FirstEngine&scope=Enterprise
 * @apiSuccess {json} payload Json object containing a list of all datapoint values for the given uri parameters.
 * @apiSuccessExample {json} GetIntent-Response
 * HTTP/1.1 200 OK
 * {
 *   "status": 200,
 *   "data": [
 *        {
 *            "description": "A Mock Intent",
 *            "globalName": "Enterprise//FirstEngine",
 *            "governance": null,
 *            "id": "",
 *            "invocations": [
 *                {
 *                    "dataFormat": "application/json+fhir",
 *                    "dataQueries": null,
 *                    "engineName": "engineOne",
 *                    "name": null,
 *                    "rules": [
 *                        {
 *                            "id": "genderAgeRule",
 *                            "properties": {
 *                                "delay": "10"
 *                            }
 *                        }
 *                    ]
 *                }
 *            ],
 *            "name": "FirstEngine",
 *            "scope": "Enterprise",
 *            "scopeId": null,
 *            "_id": "5567576e258aab97051eb64a"
 *        }
 *    ]
 * }
 */
module.exports.getIntent = function(req, res) {
    if (!isCDSMongoServerAvailable) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
    }

    var status = rdk.httpstatus.ok;

    var name = req.query.name;
    var scope = req.query.scope;
    var scopeId = req.query.scopeId;

    var match = {};
    if (name !== '*' && nullchecker.isNotNullish(name)) {
        match.name = name;
    }
    if (scope !== '*' && nullchecker.isNotNullish(scope)) {
        match.scope = scope;
    }
    if (nullchecker.isNotNullish(scopeId)) {
        if (scopeId !== '*') { //if it's not wildcard, use it.  if it is a wildcard, let them all match
            match.scopeId = scopeId;
        }
    } else {
        match.scopeId = null;
    }

    db.collection(intentCollection).find(match).toArray(function(err, result) {
        var message = (err === null) ? result : err;
        if (err === null && _.isEmpty(result)) {
            return res.status(rdk.httpstatus.not_found).rdkSend('No intents found');
        }
        if (err !== null) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(message);
        }
        res.status(status).rdkSend({data: message});
    });
};


/**
 * @api {post} /resource/cds/intent/registry Create Intent
 * @apiName CreateIntent
 * @apiGroup Intent
 * @apiDescription Returns the intent or intents that match the uri query parameters.  The values for "name"
 * and "scope" are required.  For ease of use, these can be wildcarded by passing in a '*'.  This way we can
 * use this method to either get a single entity or return a list of entities which might be useful for testing
 * or other future uses.
 * @apiSuccess (Success 201) {json} json echo of the created intent
 * @apiSuccessExample {json} GetIntent-Response
 * {
 *   "status": 201,
 *   "data": [
 *        {
 *            "description": "A Mock Intent",
 *            "globalName": "Enterprise//FirstEngine",
 *            "governance": null,
 *            "id": "",
 *            "invocations": [
 *                {
 *                    "dataFormat": "application/json+fhir",
 *                    "dataQueries": null,
 *                    "engineName": "engineOne",
 *                    "name": null,
 *                    "rules": [
 *                        {
 *                            "id": "genderAgeRule",
 *                            "properties": {
 *                                "delay": "10"
 *                            }
 *                        }
 *                    ]
 *                }
 *            ],
 *            "name": "FirstEngine",
 *            "scope": "Enterprise",
 *            "scopeId": null,
 *            "_id": "5567576e258aab97051eb64a"
 *        }
 *    ]
 * }
 * @apiError MissingIntentName
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Internal Server Error
 * {
 *    "status": 400,
 *    "message": "Missing required intent name"
 * }
 * @apiError MissingIntentScope
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Internal Server Error
 * {
 *    "status": 400,
 *    "message": "Missing required intent scope"
 * }
 * @apiError IntentExistatus
 * @apiErrorExample Error-Response:
 * HTTP/1.1 409 Internal Server Error
 * {
 *    "status": 409,
 *    "message": "An intent with that name/scope/scopeId combination existatus, can not be created"
 * }
 */
module.exports.postIntent = function(req, res) {
    if (!isCDSMongoServerAvailable) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
    }

    var status = rdk.httpstatus.created;
    var intent = req.body;

    if (!intent || !intent.name) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required intent name');
    }
    if (!intent || !intent.scope) {
        res.status(rdk.httpstatus.bad_request).rdkSend('Missing required intent scope');
    }
    var match = {};
    match.name = intent.name;
    match.scope = intent.scope;
    if (nullchecker.isNotNullish(intent.scopeId)) {
        match.scopeId = intent.scopeId;
    } else {
        match.scopeId = null;
    }

    db.collection(intentCollection).find(match).toArray(function(err, result) {
        if (!err && result.length > 0) {
            return res.status(rdk.httpstatus.conflict).rdkSend('An intent with that name/scope/scopeId combination exists.  Status, can not be created');
        }
        delete intent._id;
        db.collection(intentCollection).insert(intent, function(err, result) {
            var message = (err === null) ? result : err;
            if (err === null && _.isEmpty(result)) {
                return res.status(rdk.httpstatus.bad_request).rdkSend(message);
            }
            res.status(status).rdkSend(message);
        });
    });
};


/**
 * @api {put} /resource/cds/intent/registry Put Intent
 * @apiName PutIntent
 * @apiGroup Intent
 * @apiParam {String} name Intent name
 * @apiParam {String} scope Intent Scope
 * @apiParam {String} [scopeId] Intent Scope Id
 * @apiDescription Updates the specified intent record.  Note:  The parameters must match any
 * specified in the document.  Those fields essentially form a primary key for this record,
 * and changing them is essentially a new record, and not an update.
 * @apiSuccess {json} payload Json object containing a number indicating the number of records updated.
 * @apiSuccessExample {json} PutIntent-Response
 * HTTP/1.1 200 OK
 * {
 *    "status": 200,
 *    "data": 1
 * }
 * @apiError MissingIntentName
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Internal Server Error
 * {
 *    "status": 400,
 *    "message": "Missing required intent name"
 * }
 * @apiError MissingIntentScope
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Internal Server Error
 * {
 *    "status": 400,
 *    "message": "Missing required intent scope"
 * }
 * @apiError IntentDoesNotExist
 * @apiErrorExample Error-Response:
 * HTTP/1.1 409 Internal Server Error
 * {
 *    "status": 400,
 *    "message": "Intent does not exist"
 * }
 */
module.exports.putIntent = function(req, res) {
    if (!isCDSMongoServerAvailable) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
    }

    var status = rdk.httpstatus.ok;
    var intent = req.body;

    var name = req.query.name;
    var scope = req.query.scope;
    var scopeId = req.query.scopeId;

    if (nullchecker.isNullish(name)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing required intent name');
    }
    if (nullchecker.isNullish(scope)) {
        res.status(rdk.httpstatus.bad_request).rdkSend('Missing required intent scope');
    }
    var match = {};
    match.name = name;
    match.scope = scope;
    if (nullchecker.isNotNullish(scopeId)) {
        match.scopeId = scopeId;
    } else {
        match.scopeId = null;
    }

    intent.name = name;
    intent.scope = scope;
    db.collection(intentCollection).find(match).toArray(function(err, result) {
        if (err || result.length === 0) {
            return res.status(rdk.httpstatus.not_found).rdkSend('Intent does not exist');
        }
        db.collection(intentCollection).update(match, intent, function(err, result) {
            var message = (err === null) ? result : err;
            if (err === null && result !== 1) {
                status = rdk.httpstatus.not_found;
                return res.status(status).rdkSend(message);
            }
            res.status(status).rdkSend(message);
        });
    });
};


/**
 * @api {delete} /resource/cds/intent/registry Delete Intent
 * @apiName DeleteIntent
 * @apiGroup Intent
 * @apiParam {String} [name] Intent name
 * @apiParam {String} [scope] Intent Scope
 * @apiParam {String} [scopeId] Intent Scope Id
 * @apiDescription Deletes the specified intent record.  Note:  The parameters must match any
 * specified in the document.  Those fields essentially form a primary key for this record, and changing
 * them is essentially a new record, and not an update.
 * @apiSuccess {json} payload Json object containing a number indicating the number of records updated.
 * @apiSuccessExample {json} DeleteIntent-Response
 * HTTP/1.1 200 OK
 * {
 *    "status": 200,
 *    message": 1
 * }
 */
module.exports.deleteIntent = function(req, res) {
    if (!isCDSMongoServerAvailable) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
    }

    var status = rdk.httpstatus.ok;
    var name = req.query.name;
    var scope = req.query.scope;
    var scopeId = req.query.scopeId;

    var match = {};
    match.name = name;
    match.scope = scope;
    if (nullchecker.isNotNullish(scopeId)) {
        match.scopeId = scopeId;
    } else {
        match.scopeId = null;
    }

    db.collection(intentCollection).remove(match, function(err, result) {
        var message = (err === null) ? result : err;
        if (err === null && result === 0) {
            return res.status(rdk.httpstatus.not_found).rdkSend(message);
        }
        res.status(status).rdkSend(message);
    });
};
