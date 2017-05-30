'use strict';

var rdk = require('../../core/rdk');
var http = rdk.utils.http;
var nullchecker = rdk.utils.nullchecker;
var async = require('async');
var _ = require('lodash');
var ObjectId = require('mongoskin').ObjectID;

var dbName = 'work';
var workCollection = 'work';
var subscriptionCollection = 'subscriptions';
var thisApp;
var logger;
var testId;

//
// Database Init - dbErrorCallback can be null if an error message is to be returned on failure.
// Please see retrieveWorkProductsForProvider for a custom error callback
//
var initDb = function(db) {
    db.collection(workCollection).ensureIndex({
        provider: 1,
        type: 1,
        priority: 1
    }, {}, function(error) {
        if (error) {
            logger.error({
                error: error
            }, 'error ensuring ' + workCollection + ' index');
        }
    });

    db.collection(subscriptionCollection).ensureIndex({
        user: 1
    }, {
        unique: true
    }, function(error) {
        if (error) {
            logger.error({
                error: error
            }, 'error ensuring ' + subscriptionCollection + ' index');
            return;
        }
    });
};

var init = function(app, subsystemLogger) {
    thisApp = app;
    logger = subsystemLogger;
    testId = thisApp.subsystems.cds.testMongoDBId;
};
module.exports.init = init;

//
// Utility Methods
//

function getKeyValue(obj) {
    var property;
    //nullchecker.isNotNullish(obj) ???
    //add: if (obj.hasOwnProperty(property)) ???
    if (obj !== null) {
        for (property in obj) {
            if (property !== undefined) {
                return property + ':' + obj[property];
            }
        }
    }
    return 'BAD OBJECT';
}

function fetchNames(req, items, fetchcb) {

    async.each(

        items,

        function(item, callback) {
            //http://IP             /vpr/9E7A;237

            var pid = item.pid;
            var jdsResource = '/vpr';
            if (/^\d+$/.test(pid)) {
                return callback('Numeric-only DFN found; a site is required.');
            }
            req.logger.info('vpr search using pid [%s]', pid);

            var jdsPath = jdsResource + '/' + pid;
            var options = _.extend({}, req.app.config.jdsServer, {
                url: jdsPath,
                logger: req.logger,
                json: true
            });
            http.get(options, function(error, response, result) {
                var err = null;
                if (error || result.error) {
                    if (error) {
                        err = error;
                    } else {
                        err = result.error;
                    }
                    req.logger.error({
                        error: err
                    }, 'cds-work-product.fetchNames - Error fetching name');

                    return callback(err);
                }
                if (nullchecker.isNotNullish(result) && nullchecker.isNotNullish(result.data) && nullchecker.isNotNullish(result.data.items[0])) {
                    item.displayName = result.data.items[0].displayName;
                    item.fullName = result.data.items[0].fullName;
                }
                return callback();
            });
        },
        // This function is called if an item cannot be successfully processed or if an error occurred during the processing
        function(err) {
            if (err) {
                req.logger.error('Error fetching names:');
                req.logger.error(err);
            }
            return fetchcb(items);
        });
}



/*
 *  Transform the data
 *
 * @param {object} List of wrapped work product json objects.
 */
function formatForRDK(workProductWrapper) {

    var items = [];

    if (nullchecker.isNullish(workProductWrapper)) {
        return items;
    }

    //results here are wrapped work product objects from MongoDB
    _.forEach(workProductWrapper, function(wrapper) {

        if (nullchecker.isNullish(wrapper._id)) {
            return;
        }

        var type = wrapper.workproduct.type;
        if (nullchecker.isNotNullish(wrapper.workproduct.payload)) {
            _.forEach(wrapper.workproduct.payload, function(payload) {

                //we only going to return the type we're working with
                if (type === payload.type) {

                    //repurposing the id field to give us a work product id.  This is needed
                    //when the front end wants to request that this be marked as 'read', etc
                    payload.data.id = wrapper._id;
                    items.push(payload.data);
                }
            });
        }
    });
    return items;
}

//Gets the actual work product(s) out of the wrapper that is used to denormalize the work product data for MongoDB
function workProductForClient(workProductWrapper) {

    //results here are wrapped work product objects from MongoDB
    if (nullchecker.isNullish(workProductWrapper)) {
        return;
    }
    if (workProductWrapper instanceof Array) {
        var workproducts = [];
        _.forEach(workProductWrapper, function(wrapper) {
            if (nullchecker.isNotNullish(wrapper._id)) {
                wrapper.workproduct.id = wrapper._id;
                workproducts.push(wrapper.workproduct);

            }
        });
        return workproducts;
    }

    //id is overloaded here, so that we can refer back to the database id for this work product.
    if (workProductWrapper && workProductWrapper.workproduct && workProductWrapper._id) {
        workProductWrapper.workproduct.id = workProductWrapper._id;
        return workProductWrapper.workproduct;
    }

    //if all else fails, return nothing.
    return '';
}

/**
 * Specialty Codes (snomed)
 */
var SPECIALTY = {
    ALLERGY: 408439002,
    CRITICAL_CARE: 408478003,
    DERMATOLOGY: 394582007,
    ENDOCRINOLOGY: 394582007,
    FAMILY_MEDICINE: 419772000,
    GASTROENTEROLOGY: 394584008,
    GENERAL_SURGERY: 394294004,
    HEMATOLOGY_AND_ONCOLOGY: 394916005,
    INTERNAL_MEDCINE: 419192003,
    NEONATOLOGY: 408445005,
    NEUROLOGY: 56397003,
    OBGYN: 309367003,
    OPHTHALMOLOGY: 394813003,
    RHEUMATOLOGY: 394810000
};

var allSpecialties = _.values(SPECIALTY);

var defaultSubscriptions = {
    'specialty': allSpecialties,
    'priority': 'ALL', // Values can be: ALL (all), CRI (critical), URG (urgent: critical + high priorities)
    'type': [
        'P', // Proposal
        'A' // Advice
    ]
};


//
// API Calls
//

/**
 * @api {get} /resource/cds/work-product/inbox Retrieves 'inbox' for the authenticated user.
 * @apiName retrieveInbox
 * @apiGroup CDSWorkProduct
 *
 * @apiDescription This method retrieves the 'inbox' for the user that is currently authenticated.
 *
 * @apiSuccess (Success 200) {json} json collection of objects containing the users inbox entries
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *  "status": 200,
 *  "data": {
 *      "items": [{
 *          "details": {
 *              "detail": "This is the Body",
 *              "provenance": "Test Data"
 *          },
 *          "doneDate": null,
 *          "dueDate": 1443989700000,
 *          "generatedBy": "GeneratedBYUnitTest",
 *          "id": null,
 *          "pid": "PatientId",
 *          "priority": 50,
 *          "provider": "ProviderId",
 *          "title": "A Test Result",
 *          "type": "advice",
 *          "patientName": "2299:2222:Junk"
 *      }]
 *  }
 * }
 *
 * @apiError (Error 404) Not Found.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Bad Request
 * {
 *     "status": 404,
 *     "error": ""
 * }
 */
var retrieveInbox = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS work-product is unavailable.');
    }
   thisApp.subsystems.cds.getCDSDB(dbName, initDb, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('CDS Work Product GET retrieveInbox called');

        var userId = getKeyValue(req.session.user.duz);
        var query = {};
        query.assignments = {
            $elemMatch: {
                'user.id': userId
            }
        };
        var projection = {
            'workproduct': 1
        };

        var status = rdk.httpstatus.ok;
        dbConnection.collection(workCollection).find(query, projection).toArray(function(err, result) {
            if (nullchecker.isNotNullish(err)) {
                req.logger.debug({
                    error: err
                });
                status = rdk.httpstatus.not_found;
                return res.status(status).rdkSend(err);
            }

            req.logger.debug('results: ' + result);
            var items = formatForRDK(result);
            return fetchNames(req, items, function(items) {
                var data = {
                    items: items
                };
                return res.status(status).rdkSend(data);
            });
        });
    });
};
module.exports.retrieveInbox = retrieveInbox;

/**
 * @apiIgnore This is not used externally.  This method is used by cdsAdviceList.
 *
 * @apiDescription Retrieves 'work products' for the given provider.  In the event of an error, an
 * empty result is returned.
 *
 * @apiSuccess (Success 200) {json} json workproducts for the given provider.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *  "status": 200,
 *  "data": {
 *      "items": [{
 *          "details": {
 *              "detail": "This is the Body",
 *              "provenance": "Test Data"
 *          },
 *          "doneDate": null,
 *          "dueDate": 1443989700000,
 *          "generatedBy": "GeneratedBYUnitTest",
 *          "id": null,
 *          "pid": "PatientId",
 *          "priority": 50,
 *          "provider": "ProviderId",
 *          "title": "A Test Result",
 *          "type": "advice",
 *           "patientName": "2299:2222:Junk"
 *      },
 *      {
 *          "details": {
 *              "detail": "This is the Body",
 *              "provenance": "Test Data"
 *          },
 *          "doneDate": null,
 *          "dueDate": 1443989700000,
 *          "generatedBy": "GeneratedBYUnitTest",
 *          "id": null,
 *          "pid": "PatientId",
 *          "priority": 50,
 *          "provider": "ProviderId",
 *          "title": "A Test Result",
 *          "type": "advice",
 *          "patientName": "2299:2222:Junk"
 *      }]
 *  }
 * }
 *
 */
var retrieveWorkProductsForProvider = function(req, provider, pid, readStatus, callback) {
    if (_.isUndefined(thisApp)) {
        return callback(null, []);
    }
    thisApp.subsystems.cds.getCDSDB(dbName, initDb, function(error, dbConnection) {
        if (error) {
            return callback(null, []);
        }
        if (nullchecker.isNotNullish(pid)) {
            fetchPids(req, pid, function(error, pids) {
                if (error) {
                    req.logger.error('retrieveWorkProductsForProvider: jpid search using pid [%s], error: %s', pid, error);
                    // call callback with empty list
                    return callback(null, []);
                }
                // proceed and fetch work products
                return fetchWorkProduct(dbConnection, req, provider, pids, readStatus, callback);
            });
        } else {
            // fetch work products without pid
            return fetchWorkProduct(dbConnection, req, provider, null, readStatus, callback);
        }
    });
};
module.exports.retrieveWorkProductsForProvider = retrieveWorkProductsForProvider;

function fetchPids(req, pid, callback) {

    var jdsResource = '/vpr/jpid';
    req.logger.info('WorkProducts.fetchPids: jpid search using pid [%s]', pid);

    var jdsPath = jdsResource + '/' + pid;
    var options = _.extend({}, req.app.config.jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });

    http.get(options, function(error, response, result) {
        if (error) {
            return callback(error, null);
        }
        pid = result.patientIdentifiers;
        return callback(null, pid);
    });
}

function fetchWorkProduct(dbConnection, req, provider, pid, readStatus, callback) {

    var workProductQuery = {};
    if (nullchecker.isNotNullish(pid)) {
        workProductQuery['workproduct.context.subject.id'] = {
            $in: pid
        };
    }

    var read = readStatus === 'true';

    if (readStatus || provider) {
        workProductQuery.assignments = {
            $elemMatch: {}
        };
        if (readStatus) {
            workProductQuery.assignments.$elemMatch.readStatus = read;
        }
        if (provider) {
            workProductQuery.assignments.$elemMatch['user.id'] = provider;
        }
    }

    var projection = {
        'workproduct': 1
    };

    dbConnection.collection(workCollection).find(workProductQuery, projection)
        .sort({
            'workproduct.generationDate': -1
        })
        .limit(500).toArray(function(err, result) {
            if (nullchecker.isNotNullish(err)) {
                req.logger.error('fetchWorkProduct: jpid search using pid [%s], error: %s', pid, err);
                //in these errors, there is nothing we can do but return no messages...
                return callback(null, []);
            }
            //callback
            var items = formatForRDK(result);
            fetchNames(req, items, function(items) {
                //var data = {items: items };
                return callback(null, items);
            });
        });
}

/**
 * @api {post} /resource/cds/work-product/product Creates a work product.
 * @apiName createWorkProduct
 * @apiGroup CDSWorkProduct
 *
 * @apiDescription Creates a work product.
 *
 * @apiSuccess (Success 201) {json} json echo of the created workproduct
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 201 Created
 * {
 *  "status": 201,
 *  "data": [
 *  {
 *      "categories": [
 *          419192003
 *      ],
 *      "context": {
 *          "location": {
 *              "codeSystem": "VA:Location",
 *              "entityType": "Location",
 *              "id": "2883",
 *              "name": "ClinicOne",
 *              "type": "ClinicName"
 *          },
 *          "specialty": {
 *              "codeSystem": "VA:Specialty",
 *              "entityType": "Specialty",
 *              "id": "FM",
 *              "name": "Family Medicine",
 *              "type": "Speciality"
 *          },
 *          "subject": {
 *              "codeSystem": "VA:UniversalId",
 *              "entityType": "Subject",
 *              "id": "2299:2222:Junk",
 *              "name": null,
 *              "type": "Patient"
 *          },
 *          "user": {
 *              "codeSystem": "VA:Provider",
 *              "entityType": "User",
 *              "id": "unitTestUserId",
 *              "name": "TESR,USER",
 *              "type": "Provider"
 *          }
 *      },
 *      "duplicateCheckKey": {
 *          "checkSum": "",
 *          "subject": {
 *              "codeSystem": "VA:UniversalId",
 *              "entityType": "Subject",
 *              "id": "2299:2222:Junk",
 *              "name": null,
 *              "type": "Patient"
 *          },
 *          "type": "advice"
 *      },
 *      "expirationDate": 1443989700000,
 *      "generationDate": 1443903300000,
 *      "id": "5550cd249e94e57917716f5e",
 *      "invocationInfo": {
 *          "callId": "UUID of CallId",
 *          "generatedBy": "UnitTestRulesEngine",
 *          "targetInfo": {
 *              "intentsSet": [
 *                  "InvocationIntentA"
 *              ],
 *              "mode": "Normal",
 *              "perceivedExecutionTime": null,
 *              "supplementalMappings": null,
 *              "type": "Background"
 *          }
 *      },
 *      "payload": [{
 *          "data": {
 *              "details": {
 *                  "detail": "This is the Body",
 *                  "provenance": "Test Data"
 *              },
 *              "doneDate": null,
 *              "dueDate": 1443989700000,
 *              "generatedBy": "GeneratedBYUnitTest",
 *              "id": null,
 *              "pid": "PatientId",
 *              "priority": 50,
 *              "provider": "ProviderId",
 *              "title": "A Test Result",
 *              "type": "advice"
 *          },
 *          "type": "advice"
 *      }],
 *      "priority": 0,
 *      "type": "advice"
 *  }]
 * }
 *
 * @apiError (Error 400) Bad Request.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "status": 400,
 *   "message": ""
 * }
 */
var createWorkProduct = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS work product is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(dbName, initDb, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('CDS Work Product POST createWorkProduct called');

        var product = req.body;

        //putting this into a wrapper object for easier access, etc.
        var wrapper = {};
        wrapper.workproduct = product;
        wrapper.assignments = [];

        var status = rdk.httpstatus.created;

        dbConnection.collection(workCollection).insert(wrapper, function(err, result) {
            status = rdk.httpstatus.created;
            if (nullchecker.isNotNullish(err)) {
                status = rdk.httpstatus.bad_request;
                return res.status(rdk.httpstatus.bad_request).rdkSend(err);
            }
            if (result && result.ops) {
                result = result.ops;
            }
            return res.status(status).rdkSend(workProductForClient(result));
        });
    });
};
module.exports.createWorkProduct = createWorkProduct;
/**
 * @api {get} /resource/cds/work-product/product Retrieves work products from the database.
 * @apiName retrieveWorkProduct
 * @apiGroup CDSWorkProduct
 *
 * @apiParam {String} [id=*] Work Product Id; default is '*' which means it returns first 500 work products
 *
 * @apiDescription Retrieves a work product from the database.
 *
 * @apiSuccess (Success 200) {json} json representation of the workproduct
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *  "status": 200,
 *  "data": [
 *  {
 *      "categories": [
 *          419192003
 *      ],
 *      "context": {
 *          "location": {
 *              "codeSystem": "VA:Location",
 *              "entityType": "Location",
 *              "id": "2883",
 *              "name": "ClinicOne",
 *              "type": "ClinicName"
 *          },
 *          "specialty": {
 *              "codeSystem": "VA:Specialty",
 *              "entityType": "Specialty",
 *              "id": "FM",
 *              "name": "Family Medicine",
 *              "type": "Speciality"
 *          },
 *          "subject": {
 *              "codeSystem": "VA:UniversalId",
 *              "entityType": "Subject",
 *              "id": "2299:2222:Junk",
 *              "name": null,
 *              "type": "Patient"
 *          },
 *          "user": {
 *              "codeSystem": "VA:Provider",
 *              "entityType": "User",
 *              "id": "unitTestUserId",
 *              "name": "TESR,USER",
 *              "type": "Provider"
 *          }
 *      },
 *      "duplicateCheckKey": {
 *          "checkSum": "",
 *          "subject": {
 *              "codeSystem": "VA:UniversalId",
 *              "entityType": "Subject",
 *              "id": "2299:2222:Junk",
 *              "name": null,
 *              "type": "Patient"
 *          },
 *          "type": "advice"
 *      },
 *      "expirationDate": 1443989700000,
 *      "generationDate": 1443903300000,
 *      "id": "5550cd249e94e57917716f5e",
 *      "invocationInfo": {
 *          "callId": "UUID of CallId",
 *          "generatedBy": "UnitTestRulesEngine",
 *          "targetInfo": {
 *              "intentsSet": [
 *                  "InvocationIntentA"
 *              ],
 *              "mode": "Normal",
 *              "perceivedExecutionTime": null,
 *              "supplementalMappings": null,
 *              "type": "Background"
 *          }
 *      },
 *      "payload": [{
 *          "data": {
 *              "details": {
 *                  "detail": "This is the Body",
 *                  "provenance": "Test Data"
 *              },
 *              "doneDate": null,
 *              "dueDate": 1443989700000,
 *              "generatedBy": "GeneratedBYUnitTest",
 *              "id": null,
 *              "pid": "PatientId",
 *              "priority": 50,
 *              "provider": "ProviderId",
 *              "title": "A Test Result",
 *              "type": "advice"
 *          },
 *          "type": "advice"
 *      }],
 *      "priority": 0,
 *      "type": "advice"
 *  }]
 * }
 *
 * @apiError (Error 404) Work Product not found.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Not Found Error
 * {
 *   "status": 404,
 *   "message": "Missing or invalid work product id."
 * }
 */
var retrieveWorkProduct = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS work product is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(dbName, initDb, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('CDS Work Product GET retrieveWorkProduct called');

        var matchQuery = {};

        //first check that we have an id...
        var id = req.query.id;
        if (id === '*') {
            id = null;
        }
        if (id) {
            //make sure the id is in a valid format, return the error if not...
            var idValidationError = testId(id);
            if (nullchecker.isNotNullish(idValidationError)) {
                return res.status(rdk.httpstatus.bad_request).rdkSend(idValidationError);
            }
            matchQuery._id = new ObjectId(id);
        }

        dbConnection.collection(workCollection).find(matchQuery).limit(500).toArray(function(err, result) {
            if (nullchecker.isNotNullish(err)) {
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
            }
            if (nullchecker.isNullish(result)) {
                return res.status(rdk.httpstatus.not_found).rdkSend('Work Product with id \'' + id + '\' was not found.');
            }
            //default status is 'ok'
            return res.status(rdk.httpstatus.ok).rdkSend(workProductForClient(result));
        });
    });
};
module.exports.retrieveWorkProduct = retrieveWorkProduct;

/**
 * @api {put} /resource/cds/work-product/product Updates a work product in the database.
 * @apiName updateWorkProduct
 * @apiGroup CDSWorkProduct
 *
 * @apiDescription Updates a work product in the database.
 *
 * @apiParam {string} id work product id
 *
 * @apiSuccess (Success 200) {json} data with a '1' for successful match and update, or a '0' for no match and update.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *  "status": 200,
 *  "message": 1
 * }
 *
 * @apiError (Error 400) Work Product not found.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "status": 400,
 *   "message": "Missing or invalid work product id."
 * }
 *
 * @apiError (Error 404) Work Product not found.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Not Found Error
 * {
 *   "status": 404,
 *   "message": "Work Product with id <id> was not found."
 * }
 */
var updateWorkProduct = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS work product is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(dbName, initDb, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('CDS Work Product PUT updateWorkProduct called');

        var id = req.query.id;
        var product = req.body;

        if (nullchecker.isNullish(id)) {
            return res.status(rdk.httpstatus.bad_request).rdkSend('Missing or invalid work product id.');
        }
        //make sure the id is in a valid format, return the error if not...
        var idValidationError = testId(id);
        if (nullchecker.isNotNullish(idValidationError)) {
            return res.status(rdk.httpstatus.bad_request).rdkSend(idValidationError);
        }

        dbConnection.collection(workCollection).update({
            _id: new ObjectId(id)
        }, {
            $set: {
                workproduct: product
            }
        }, function(err, numUpdated) {
            if (nullchecker.isNullish(err)) {
                if (numUpdated === 0) {
                    // no records updated, id not found
                    return res.status(rdk.httpstatus.not_found).rdkSend('Work Product with id \'' + id + '\' was not found.');
                }
                //status default is 'ok'
                return res.status(rdk.httpstatus.ok).rdkSend(numUpdated);
            }
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        });
    });
};
module.exports.updateWorkProduct = updateWorkProduct;

/**
 * @apiIgnore This is not used externally.  This method is used internally and not exposed via rest.
 *
 * @api {put} /resource/cds/work-product/product Sets the 'read' status of an assigned work product in the database.
 * @apiName patchWorkProduct
 * @apiGroup CDSWorkProduct
 *
 * @apiDescription Sets the 'read' status of an assigned work product in the database.
 *
 * @apiSuccess {json} data Json object containing a one for successful match and update, zero if there was no record to update.
 *
 */
var setReadStatus = function(id, readStatus, provider, callback) {
    if (_.isUndefined(thisApp)) {
        return callback(null, []);
    }
    thisApp.subsystems.cds.getCDSDB(dbName, initDb, function(error, dbConnection) {
        if (error) {
            return callback(error, null);
        }
        var read = readStatus === 'true';
        try {
            dbConnection.collection(workCollection).update({
                _id: new ObjectId(id),
                'assignments.user.id': provider
            }, {
                $set: {
                    'assignments.$.readStatus': read
                }
            }, function(err, result) {
                if (err) {
                    return callback(null, err);
                }
                if (result) {
                    return callback(result, null);
                }
                return callback(null, 'Advice with id \'' + id + '\' not found.');
            });
        } catch (error) {
            return callback(null, error.message);
        }
    });
};
module.exports.setReadStatus = setReadStatus;

/**
 * @api {delete} /resource/cds/work-product/product Delete a work product in the database.
 * @apiName deleteWorkProduct
 * @apiGroup CDSWorkProduct
 *
 * @apiDescription Delete a work product in the database.
 *
 * @apiParam {string} id work product id
 *
 * @apiSuccess (Success 201) {json} data with a '1' for successful match and delete, or a '0' for no match and delete.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *  "status": 200,
 *  "message": 1
 * }
 *
 * @apiError (Error 404) Not Found.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Internal Server Error
 * {
 *     "status": 404,
 *     "message": "Work Product with id <id> was not found."
 * }
 *
 * @apiError (Error 500) Internal Server Error.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *     "status": 500,
 *     "message": ""
 * }
 */
var deleteWorkProduct = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS work product is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(dbName, initDb, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('CDS Work Product DELETE deleteWorkProduct called');

        var id = req.query.id;

        if (nullchecker.isNullish(id)) {
            return res.status(rdk.httpstatus.bad_request).rdkSend('Missing or invalid work product id.');
        }
        //make sure the id is in a valid format, return the error if not...
        var idValidationError = testId(id);
        if (nullchecker.isNotNullish(idValidationError)) {
            return res.status(rdk.httpstatus.bad_request).rdkSend(idValidationError);
        }

        dbConnection.collection(workCollection).remove({
            _id: new ObjectId(id)
        }, function(err, numDeleted) {
            if (nullchecker.isNullish(err)) {
                if (numDeleted === 0) {
                    // no record deleted, id not found
                    return res.status(rdk.httpstatus.not_found).rdkSend('Work Product with id \'' + id + '\' was not found.');
                }
                return res.status(rdk.httpstatus.ok).rdkSend(numDeleted);
            }
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        });
    });
};
module.exports.deleteWorkProduct = deleteWorkProduct;

/**
 * @api {get} /resource/cds/work-product/subscriptions Retrieves user subscriptions for the authenticated user.
 * @apiName retrieveSubscriptions
 * @apiGroup CDSWorkProduct
 *
 * @apiDescription Retrieves user subscriptions for the authenticated user.
 *
 * Priority values: ALL (All priorities), URG (Urgent: high + critical priority), CRIT (Critical priority)
 *
 * Type values: A (advice), P (proposal)
 *
 * Specialty values (snomed codes):
 * Allergy 408439002
 * Critical Care 408478003
 * Dermatology 394582007
 * Endocrinology 394582007
 * Family Medicine 419772000
 * Gastroenterology 394584008
 * General Surgery 394294004
 * Hematology and Oncology 394916005
 * Internal Medicine 419192003
 * Neonatology 408445005
 * Neurology 56397003
 * Obstetrics and Gynecology 309367003
 * Ophthalmology 394813003
 * Rheumatology 394810000
 *
 * @apiSuccess {json} data A collection of string arrays containing the user's subscriptions.
 *
 * @apiSuccessExample Success-Response:
 * {
 *     "status": 200,
 *     "data": {
 *         "specialty": [
 *             408439002,
 *             408478003
 *         ],
 *         "priority": "ALL",
 *         "type": [
 *             "P",
 *             "A"
 *         ]
 *     }
 * }
 *
 * @apiError (Error 404) Not Found.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Internal Server Error
 * {
 *     "status": 404,
 *     "message": ""
 * }
 */
var retrieveSubscriptions = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS work product is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(dbName, initDb, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('CDS Work Product GET retrieveSubscriptions called');

        var userId = getKeyValue(req.session.user.duz);
        dbConnection.collection(subscriptionCollection).findOne({
            user: userId
        }, function(err, result) {

            req.logger.debug('error: ' + err);
            req.logger.debug('result: ' + result);

            if (nullchecker.isNullish(result)) { // none found - use defaults.
                result = defaultSubscriptions;
            } else if (result && result.data) { // found some, just pass the part that matters.
                result = result.data;
            }

            if (nullchecker.isNullish(err)) {
                //default status is 'ok'
                return res.status(rdk.httpstatus.ok).rdkSend(result);
            }
            //this should be unreachable in practice, since we default the response.
            return res.status(rdk.httpstatus.not_found).rdkSend(err);
        });
    });
};
module.exports.retrieveSubscriptions = retrieveSubscriptions;

/**
 * @api {put} /resource/cds/work-product/subscriptions Updates user subscriptions for the authenticated user.
 * @apiName updateSubscriptions
 * @apiGroup CDSWorkProduct
 *
 * @apiDescription Updates user subscriptions for the authenticated user.
 *
 * @apiParamExample {json} Request-Example:
 * {
 *     priority: "ALL",
 *     specialty: [ 408439002, 394582007], // specialty snomed codes
 *     type: [ "A", "P" ]
 * }
 *
 * @apiSuccess (Success 201) {json} data with a '1' for successful match and update, or a '0' for no match and update.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *  "status": 200,
 *  "message": 1
 * }
 *
 * @apiError (Error 500) Internal Server Error.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *     "status": 500,
 *     "message": ""
 * }
 */
var updateSubscriptions = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS work product is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(dbName, initDb, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('CDS Work Product PUT updateSubscriptions called');

        var product = req.body;
        var userId = getKeyValue(req.session.user.duz);
        product.user = userId;

        dbConnection.collection(subscriptionCollection).update({
            user: userId
        }, product, {
            upsert: true
        }, function(err, numUpdated) {
            if (nullchecker.isNotNullish(err)) {
                req.logger.debug('error: ' + err);
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
            }
            req.logger.debug('numUpdated: ' + numUpdated);
            //this is an 'upsert' to no need to check for number of records updated.  There will always be one.
            //status default is 'ok'
            return res.status(rdk.httpstatus.ok).rdkSend(numUpdated);
        });
    });
};
module.exports.updateSubscriptions = updateSubscriptions;
/**
 * @api {delete} /resource/cds/work-product/subscriptions Deletes user subscriptions for the authenticated user.
 * @apiName deleteSubscriptions
 * @apiGroup CDSWorkProduct
 *
 * @apiDescription Deletes user subscriptions for the authenticated user.
 *
 * @apiSuccess (Success 201) {json} data with a '1' for successful match and delete, or a '0' for no match and delete.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *  "status": 200,
 *  "message": 1
 * }
 *
 * @apiError (Error 404) Not Found.
 * @apiErrorExample Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   "status": 404,
 *   "message": "Subscriptions for user <userId> was not found."
 * }
 *
 */
var deleteSubscriptions = function(req, res) {
    if (_.isUndefined(thisApp)) {
        return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS work product is unavailable.');
    }
    thisApp.subsystems.cds.getCDSDB(dbName, initDb, function(error, dbConnection) {
        if (error) {
            return res.status(rdk.httpstatus.service_unavailable).rdkSend('CDS persistence store is unavailable.');
        }
        req.logger.debug('CDS Work Product DELETE deleteSubscriptions called');

        var userId = getKeyValue(req.session.user.duz);

        dbConnection.collection(subscriptionCollection).remove({
            user: userId
        }, function(err, numDeleted) {
            if (nullchecker.isNullish(err)) {
                if (numDeleted === 0) {
                    // do we want to return this error in this case since they'd just get the defaults anyways?
                    // no record deleted, id not found
                    return res.status(rdk.httpstatus.not_found).rdkSend('Subscriptions for user \'' + userId + '\' was not found.');
                }
                return res.status(rdk.httpstatus.ok).rdkSend(numDeleted);
            }
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(err);
        });
    });
};
module.exports.deleteSubscriptions = deleteSubscriptions;
