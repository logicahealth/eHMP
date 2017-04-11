'use strict';

var fhirResource = require('../common/entities/fhir-resource');
var fhirToJDSSearch = require('../common/utils/fhir-to-jds-search');
var fhirUtils = require('../common/utils/fhir-converter');
var helpers = require('../common/utils/helpers');
var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var errors = require('../common/errors');

//// ++
//// used with order data
////
//var async = require('async');
//var asyncQueue = null;
//// --

var jdsToFHIRStatusMap = {
    'COMPLETE': 'completed',
    'IN-PROGRESS': 'in-proogress',
    'ABORTED': 'aborted',
    'ENTERED-IN-ERROR': 'entered-in-error',
    get: function(jdsStatus) {
        return this[jdsStatus];
    }
};
var jdsToFHIRDiagnosticStatus = {
    'registered': 'registered',
    'partial': 'partial',
    'COMPLETE': 'final',
    'corrected': 'corrected',
    'appended': 'appended',
    'cancelled': 'cancelled',
    'entered-in-error': 'entered-in-error',
    get: function(jdsStatus) {
        return this[jdsStatus];
    }
};

var fhirToJDSMap = {
    //date       date        Date/Period the procedure was performed Procedure.performedDateTime
    date: 'dateTime',
    //encounter  reference   The encounter when procedure performed  Procedure.encounter(Encounter)
    encounter: 'encounterUid',
    //location   reference   Where the procedure happened    Procedure.location    (Location)
    location: 'locationName',
    //patient    reference   The identity of a patient to list procedures for    Procedure.patient     (Patient)
    patient: 'pid', // the subject that the procedure is about (if patient)
    //performer  reference   The reference to the practitioner   Procedure.performer.person     (Patient, Practitioner, RelatedPerson)
    performer: 'facilityName', // Who performed the observation, contained in Order - SUPPORTED As Facility
    //type       token       Type of procedure   Procedure.type.coding.display
    type: 'name'
        // other possible search params....
        //_id: 'uid', // The unique Id for a particular procedure
};

function buildJDSPath(pid, params) {
    var basePath = '/vpr/' + pid + '/find/procedure';
    var searchQuery = buildSearchQuery(params);
    return fhirToJDSSearch.buildJDSPath(basePath, searchQuery, params, fhirToJDSMap);
}


function buildSearchQuery(params) {
    var query = [];
    var dateQuery;

    // system & code
    if (nullchecker.isNotNullish(params.code)) {
        query.push(fhirToJDSSearch.buildCodeAndSystemQuery(params.code));
    }
    // date
    if (nullchecker.isNotNullish(params.date)) {
        dateQuery = fhirToJDSSearch.buildDateQuery(params.date, 'dateTime');
        if (dateQuery) {
            query.push(dateQuery);
        }
    }
    return fhirToJDSSearch.buildSearchQueryString(query);
}

function getJDSErrorMessage(error) {
    var msg = '';

    if (nullchecker.isNotNullish(error.errors)) {
        msg = _.reduce(error.errors, function(memo, e) {
            if (!_.isEmpty(memo)) {
                memo += ', ';
            }
            memo += e.domain + ' :: ' + e.message;
            return memo;
        }, '');
    }
    return msg;
}

function getData(appConfig, logger, pid, params, callback) {
    // check for required pid param
    if (nullchecker.isNullish(pid)) {
        return callback(new Error('Missing required parameter: pid'));
    }

    var jdsPath = buildJDSPath(pid, params);
    var options = _.extend({}, appConfig.jdsServer, {
        url: jdsPath,
        logger: logger,
        json: true
    });

    rdk.utils.http.get(options, function(error, response, body) {
        var internalError = 'There was an error processing your request. The error has been logged.';
        logger.debug('callback from fetch()');

        if (error) {
            return callback(new errors.HTTPError(rdk.httpstatus.internal_server_error, 'Error fetching pid=' + pid + ' - ' + (error.message || error)));
        }
        if ('data' in body) {
            return callback(null, body);
        }
        if ('error' in body) {
            logger.error('Procedure::getData: ' + body.error.code + ' - ' + getJDSErrorMessage(body.error));
            return callback(new errors.HTTPError(rdk.httpstatus.internal_server_error, internalError));
        }
        logger.error('Procedure::getData: Empty response from JDS.');
        return callback(new errors.HTTPError(rdk.httpstatus.internal_server_error, internalError));
    });
}

//// ++
//// Uncomment this when Order data used   ////
////
//
//  These methods used to retrieve and process referenced Order data
//
// url to retrieve order
//  {{rdk}} /resource/patient/record/domain/order?pid=9E7A;100599&uid=urn:va:order:9E7A:100599:15748
//  {{jds}} http://IP             /vpr/9E7A;100599/index/order?start=0&filter=like('uid','urn:va:order:9E7A:100599:15748')
//function getOrderData(properties, callback) {
//    var pid = properties.pid;
//    var orderUid = properties.uid;
//    var fhirItem = properties.item;
//    var req = properties.req;
//    var params = {
//        domain: 'order',
//        filter: 'like(uid,' + orderUid + ')'
//    };
//    if (nullchecker.isNullish(orderUid)) {
//        return callback();
//    }
//    getData(req.app.config, req.logger, pid, params, null, function(err, result) {
//
//        if (nullchecker.isNotNullish(err)) {
//            return callback(err);
//        }
//        var order = result.data.items[0];
//        if (nullchecker.isNotNullish(order.oiCode)) {
//            var coding = new fhirResource.Coding(order.oiCode, order.oiName, 'oi-code');
//            if (nullchecker.isNotNullish(order.oiPackageRef)) {
//                coding.extension = [createExtension('oiPackageRef', order.oiPackageRef)];
//            }
//            fhirItem.type = [{
//                code: new fhirResource.CodeableConcept(undefined, coding)
//            }];
//        }
//        // clinicians...
//        fhirItem.performer = [];
//        _.forEach(order.clinicians, function(clinician) {
//            fhirItem.performer.push(createPerformer(clinician));
//        });
//        callback();
//    });
//}


//var out1 = null;
//var cb1 = null;
//
//function processFhirWithOrders(result, req, done) {
//
//    asyncQueue = async.queue(function(properties, callback) {
//        getOrderData(properties, function(err) {
//            if (err) {
//                req.app.logger.error(err);
//            } else {
//                req.app.logger.info('done');
//                callback();
//            }
//        });
//    }, 5);
//    asyncQueue.pause();
//
////    Can use either waterfall or parallel
////    parallel should be faster....
////
////    async.waterfall([
////        function(callback) {
////            var items = convertToFhir(result, req);
////            callback(null, items);
////        },
////        function(result, callback) {
////            out1 = result;
////            cb1 = callback;
////            asyncQueue.drain = function() {
////                cb1(null, out1);
////            }
////            asyncQueue.resume();
////        }
////        ],
////        function (err, result) {
////            done(result);
////        }
////    );
//    async.parallel([
//        function(callback) {
//            var items = convertToFhir(result, req);
//            callback(null, items);
//        },
//        function(callback) {
//            var callback1 = callback;
//            asyncQueue.drain = function() {
//                callback1();
//            };
//            asyncQueue.resume();
//        }
//        ],
//        function (err, results) {
//        done(results[0]);
//    }
//    );
//}
//// --

function convertToFhir(result, req) {
    var link = [new fhirResource.Link(req.protocol + '://' + req.headers.host + req.originalUrl, 'self')];
    var entry = [];
    var items = result.data.items;

    _.forEach(items, function(item) {
        var procedures = createProcedure(req, item, item.pid);
        entry = entry.concat(_.map(procedures, function(procedure) {
            return new fhirResource.Entry(procedure);
        }));
    });
    return new fhirResource.Bundle2(link, entry, result.data.totalItems);
}

function createProcedure(req, jdsItem, pid) {
    var fhirItem = new fhirResource.Procedure(helpers.generateUUID(), pid);
    var results = [fhirItem];

    fhirItem.text = new fhirResource.Narrative('<div>' + _.escape(jdsItem.oiName || jdsItem.name) + '</div>');
    fhirItem.status = jdsToFHIRStatusMap.get(jdsItem.statusName);
    fhirItem.identifier = [new fhirResource.Identifier(jdsItem.uid, 'urn:oid:2.16.840.1.113883.6.233')];
    fhirItem.patient = new fhirResource.ReferenceResource('Patient/' + jdsItem.pid); // REQUIRED

    fhirItem.type = {};
    fhirItem.type.coding = [];
    fhirItem.type.coding.push({
        system: 'gov.va.fileman697-2:9E7A',
        display: jdsItem.name,
        primary: true
    });

    if (nullchecker.isNotNullish(jdsItem.results)) {
        fhirItem.contained = [];
        fhirItem.report = [];
        _.forEach(jdsItem.results, function(result) {
            var report = createReport(jdsItem, result);
            fhirItem.contained.push(report);
            var reference = new fhirResource.ReferenceResource('#' + report.id, result.localTitle);
            fhirItem.report.push(reference);
        });
    }

    if (nullchecker.isNotNullish(jdsItem.dateTime)) {
        fhirItem.performedDateTime = fhirUtils.convertToFhirDateTime(jdsItem.dateTime);
    }

    if (nullchecker.isNotNullish(jdsItem.encounterUid)) {
        fhirItem.encounter = {};
        fhirItem.encounter.reference = jdsItem.encounterUid;
    }

    if (nullchecker.isNotNullish(jdsItem.locationName)) {
        fhirItem.location = createLocation(jdsItem);
    }
    fhirItem.extension = createExtensions(jdsItem);

    //// ++
    //// Uncomment this for retrieving the referenced order
    ////
    //  // queue to process referenced Order
    //  if (nullchecker.isNotNullish(jdsItem.orderUid)) {
    //      asyncQueue.push({pid: pid, uid: jdsItem.orderUid, item: fhirItem, req: req}, function(err) {
    //          req.app.logger.error(err);
    //      });
    //  }
    //// --
    return results;
}

function createReport(jdsItem, item) {
    var result = {
        resourceType: 'DiagnosticReport',
        id: helpers.generateUUID(),
        text: {
            status: 'generated',
            div: '<div>' + item.localTitle + '</div>'
        },
        identifier: [{
            value: item.uid,
            system: 'http://vistacore.us/fhir/id/uid'
        }],
        name: {
            coding: [{
                display: item.localTitle,
                primary: true
            }]
        },
        diagnosticDateTime: fhirUtils.convertToFhirDateTime(jdsItem.dateTime),
        status: jdsToFHIRDiagnosticStatus.get(jdsItem.statusName),
        issued: fhirUtils.convertToFhirDateTime(jdsItem.dateTime),
        subject: new fhirResource.ReferenceResource('Patient/' + jdsItem.pid),
        performer: {
            reference: item.summary
        }
    };
    return result;
}

function createLocation(jdsItem) {
    var location = {
        reference: jdsItem.locationUid,
        display: jdsItem.locationName
    };
    return location;
}

function createExtension(propName, jdsItem) {
    var value = jdsItem[propName];
    if (nullchecker.isNullish(value)) {
        return null;
    } else {
        return new fhirResource.Extension('http://vistacore.us/fhir/extensions/procedure#' + propName, value, 'String');
    }
}

function createExtensions(jdsItem) {
    var ext = [
        createExtension('category', jdsItem),
        createExtension('facilityCode', jdsItem),
        createExtension('facilityName', jdsItem),
        createExtension('kind', jdsItem),
        createExtension('lastUpdateTime', jdsItem),
        createExtension('localId', jdsItem),
        createExtension('consultUid', jdsItem),
        createExtension('orderUid', jdsItem),
        createExtension('stampTime', jdsItem),
        createExtension('lastUpdateTime', jdsItem),
        createExtension('requested', jdsItem)
    ];
    return _.compact(ext);
}

function isSortCriteriaValid(params) {
    return fhirToJDSSearch.isSortCriteriaValid(params, fhirToJDSMap);
}

// for testing.
function getFhirItems(result, req) {
    var fhirResult = {};
    var fhirItems = [];

    fhirResult = convertToFhir(result, req);
    fhirItems = fhirResult.entry;
    return fhirItems;
}


module.exports.getFhirItems = getFhirItems;
module.exports.isSortCriteriaValid = isSortCriteriaValid;
module.exports.getData = getData;
module.exports.convertToFhir = convertToFhir;
module.exports.createProcedure = createProcedure;
//module.exports.processFhirWithOrders = processFhirWithOrders;
module.exports.fhirToJDSMap = fhirToJDSMap;
