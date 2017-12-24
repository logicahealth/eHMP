'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var jdsDomains = require('./jds-domains');
var patientRecordAnnotator = require('./patient-record-annotator');
var http = rdk.utils.http;
var jdsFilter = require('jds-filter');
var asuUtils = require('../../resources/patient-record/asu-utils');
var vix = require('../vix/vix-subsystem');
var async = require('async');
var availableJdsTemplates = require('../../../config/jdsTemplates.json');
var util = require('util');

module.exports.constants = {};
module.exports.constants.MAX_JDS_URL_SIZE = 1024;
module.exports.constants.JDS_RANGE_DELIMITER = ',';

module.exports.getSubsystemConfig = getSubsystemConfig;
module.exports.getPatientDomainData = getPatientDomainData;
module.exports.getByUid = getByUid;
module.exports._filterAsuDocuments = filterAsuDocuments;
module.exports._fetchJdsAndFillPagination = fetchJdsAndFillPagination;
module.exports._processVitals = processVitals;


function getSubsystemConfig(app, logger) {
    return {
        healthcheck: {
            name: 'jds',
            interval: 100000,
            check: function(callback) {
                var jdsOptions = _.extend({}, app.config.jdsServer, {
                    url: '/ping',
                    timeout: 5000,
                    logger: logger
                });

                http.get(jdsOptions, function(err) {
                    if (err) {
                        return callback(false);
                    }
                    callback(true);
                });
            }
        }
    };
}

/**
 * @param {IncomingMessage} req
 * @param {String|Number} pid The pid of the pre-synchronized patient
 * @param {String} domain
 * @param {Object} query querystring.stringify object
 * @param {Object} vlerQuery
 * @param {Function} callback receives (error, response, statusCode)
 *     where error is null if there was no error performing the fetch
 *     where response is the response body object
 *     where statusCode is the fetch status code if available
 */
function getPatientDomainData(req, pid, domain, query, vlerQuery, callback) {
    var name;
    var index;
    if (jdsDomains.hasName(domain)) {
        name = domain;
        index = jdsDomains.indexForName(name);
    } else if (jdsDomains.hasIndex(domain)) {
        index = domain;
        name = jdsDomains.nameForIndex(index);
    } else {
        return callback(new Error('Bad domain'));
    }
    var jdsResource;
    if (index === 'patient' || name === 'demographics') {
        jdsResource = '/vpr/' + pid + '/find/patient';
    } else {
        jdsResource = '/vpr/' + pid + '/index/' + index;
    }
    query = query || {};

    var vlerCallType = vlerQuery.vlerCallType;
    var vlerUid = vlerQuery.vlerUid;
    var jdsPath = createJDSPath(jdsResource, req);

    var options = _.extend({}, req.app.config.jdsServer, {
        url: jdsPath,
        qs: {
            query: true
        },
        body: query,
        logger: req.logger,
        json: true
    });

    if (name === 'document-view') {
        return requestDocuments(req, pid, options, callback);
    }
    if (name === 'patient') {
        return requestPatient(req, pid, options, callback);
    }
    if (name === 'med') {
        return requestMedications(req, pid, options, callback);
    }

    return http.post(options, function(error, response, responseBody) {
        var errorCheck = isResponseError(req, error, response, responseBody);
        if (errorCheck) {
            return callback(errorCheck, responseBody, response.statusCode);
        }
        if (name === 'vlerdocument') {
            return transformVler(req.logger, vlerCallType, vlerUid, name, responseBody, response.statusCode, callback);
        }

        if (name === 'vital') {
            return processVitals(req, response, responseBody, options, callback);
        }

        return callback(null, transformDomainData(name, responseBody), response.statusCode);
    });
}


/**
 * It is possible that the JDS response is missing data need to complete the BMI calculations,
 * this function checks the data and will create an additional request if data is missing.
 *
 * @param {*} req
 * @param {*} response The response from the original request to jds
 * @param {*} responseBodyOrig The responseBody from the original request to jds
 * @param {*} options The original set of options used to make the request to jds
 * @param {function} callback
 * @return {*}
 */
function processVitals(req, response, responseBodyOrig, options, callback) {
    var bodyMassIndexStatus = patientRecordAnnotator.getBodyMassStatusCode(responseBodyOrig);

    if (bodyMassIndexStatus === patientRecordAnnotator.BMI_NOT_REQUIRED) {
        patientRecordAnnotator.addReferenceRanges(responseBodyOrig);
        return callback(null, responseBodyOrig, response.statusCode);
    }

    if (bodyMassIndexStatus === patientRecordAnnotator.BMI_DATA_PRESENT) {
        patientRecordAnnotator.addCalculatedBMI(responseBodyOrig);
        patientRecordAnnotator.addReferenceRanges(responseBodyOrig);
        return callback(null, responseBodyOrig, response.statusCode);
    }

    var typeName = bodyMassIndexStatus === patientRecordAnnotator.BMI_MISSING_HEIGHT ? 'HEIGHT' : 'WEIGHT';
    var filter = 'eq("typeName","' + typeName + '")';

    var otherTypeOptions = _.clone(options);
    otherTypeOptions.body = {
        start: 0,
        limit: 1,
        filter: filter,
        order: 'observed DESC'
    };

    return http.post(otherTypeOptions, function(error, otherTypeResponse, otherTypeResponseBody) {
        var errorCheck = isResponseError(req, error, otherTypeResponse, otherTypeResponseBody);
        var otherTypeItems = _.get(otherTypeResponseBody, 'data.items', []);

        if (errorCheck || !otherTypeItems.length) {
            // We still have the correct original data to form a response with
            // and isResponseError already logged the error
            patientRecordAnnotator.addReferenceRanges(responseBodyOrig);
            return callback(null, responseBodyOrig, otherTypeResponse.statusCode);
        }

        var originalItems = _.get(responseBodyOrig, 'data.items', []);

        // Height or weight is unavailable, but BMI calculation needs both.
        // Temporarily add the missing item to allow BMI calculation to work, then remove it
        let otherTypeItem = _.first(otherTypeItems);
        originalItems.push(otherTypeItem);
        patientRecordAnnotator.addCalculatedBMI(responseBodyOrig);
        originalItems = _.get(responseBodyOrig, 'data.items', []); // addCalculatedBMI rewrites items so we have to get it again. TODO fix addCalculatedBMI
        _.pull(originalItems, otherTypeItem);

        // addCalculatedBMI changes the pagination numbers. We removed the temporary item, so fix the pagination numbers.
        if (_.isNumber(responseBodyOrig.data.totalItems)) {
            responseBodyOrig.data.totalItems -= 1;
        }
        if (_.isNumber(responseBodyOrig.data.currentItemCount)) {
            responseBodyOrig.data.currentItemCount -= 1;
        }

        patientRecordAnnotator.addReferenceRanges(responseBodyOrig);
        return callback(null, responseBodyOrig, otherTypeResponse.statusCode);
    });
}


function isResponseError(req, error, response, responseBody) {
    if (error) {
        req.logger.error(error);
        return error;
    }
    if (_.has(responseBody, 'error')) {
        return new Error(util.format(responseBody.error));
    }
    if (!_.isArray(_.get(responseBody, 'data.items'))) {
        return new Error('Missing data in JDS response. Is the patient synced?');
    }
    return false;
}

function requestDocuments(req, pid, options, callback) {
    async.parallel([
        function(callback) {
            return fetchJdsAndFillPagination(req, options,
                function(req, responseBody, callback) {
                    return filterAsuDocuments(req, responseBody, function(err, results) {
                        return callback(err, results);
                    });
                },
                function(err, results, statusCode) {
                    return callback(err, results, statusCode);
                }
            );
        }
    ], function(error, response) {
        if (error) {
            req.logger.error(error);
            return callback(error, null, 500);
        }
        var asuResponse = response[0];
        var responseBody = asuResponse[0];
        var statusCode = asuResponse[1];
        var bodyHasItems = _.size(_.get(responseBody, 'data.items')) > 0;

        if (bodyHasItems) {
            return vix.addImagesToDocument(req, responseBody, function(err, responseBody) {
                return callback(null, responseBody, statusCode);
            });
        }
        return callback(null, responseBody, statusCode);
    });
}

function requestMedications(req, pid, options, callback) {
    var afterFilter = req.body.afterFilter || req.query.afterFilter;
    var afterFilterObject;
    if (afterFilter) {
        try {
            afterFilterObject = jdsFilter.parse(afterFilter);
        } catch (ex) {
            return callback(ex, null, 500);
        }
    }
    return fetchJdsAndFillPagination(req, options,
        function responseFilterer(req, responseBody, callback) {
            removeParentMedications(responseBody);
            responseBody = transformDomainData('med', responseBody);
            applyFilters(responseBody, afterFilterObject);
            return callback(null, responseBody);
        },
        function handler(err, jdsResponse, statusCode) {
            if (err) {
                return callback(err, jdsResponse, statusCode);
            }
            return callback(err, jdsResponse, statusCode);
        }
    );
}

/**
 *
 * @param {IncomingMessage} req
 * @param {Object} jdsOptions
 * @param {Function} responseFilterer (req, responseBody, callback(err, jdsResponse))
 * @param {Function} callback (err, jdsResponse, statusCode)
 */
function fetchJdsAndFillPagination(req, jdsOptions, responseFilterer, callback) {
    var requestedItemCount = _.parseInt(_.get(jdsOptions, 'body.limit'));
    var moreItemsAvailable = true;
    var combinedFilteredItems = [];
    var lastPageMetadata;
    var initialPageMetadata;
    var lastUnfilteredItemIndex;

    return async.whilst(
        function test() {
            if (requestedItemCount > 0) {
                return (
                    _.size(combinedFilteredItems) < requestedItemCount &&
                    moreItemsAvailable
                );
            }
            return moreItemsAvailable;
        },
        function(callback) {
            if (lastPageMetadata) {
                _.set(jdsOptions, 'body.start',
                    _.parseInt(_.get(jdsOptions, 'body.start', 0)) + lastPageMetadata.itemsPerPage);
            }
            http.post(jdsOptions, function(error, response, responseBody) {
                var errorCheck = isResponseError(req, error, response, responseBody);
                if (errorCheck) {
                    return callback(errorCheck, null, _.get(response, 'statusCode'));
                }
                if (!initialPageMetadata) {
                    initialPageMetadata = _.pick(responseBody.data,
                        'updated',
                        'startIndex', // start
                        'pageIndex');
                }
                lastPageMetadata = _.pick(responseBody.data,
                    'totalItems',
                    'currentItemCount',
                    'itemsPerPage', // limit
                    'totalPages'
                );
                moreItemsAvailable = _.parseInt(_.get(jdsOptions, 'body.start', 0)) + lastPageMetadata.currentItemCount < lastPageMetadata.totalItems;
                // Intentional shallow clone for performance
                var lastPageUnfilteredItems = _.clone(responseBody.data.items);
                return responseFilterer(req, responseBody, function(err, filteredResults) {
                    if (err) {
                        return callback(err);
                    }
                    combinedFilteredItems = combinedFilteredItems.concat(filteredResults.data.items);
                    var excessItemCount = Math.max(0, _.size(combinedFilteredItems) - requestedItemCount);
                    if (excessItemCount > 0) {
                        combinedFilteredItems.length = requestedItemCount;
                    }
                    var lastFilteredItem = _.last(combinedFilteredItems);
                    if ((lastPageUnfilteredItems.length === filteredResults.data.items.length && excessItemCount <= 0) ||
                        (!moreItemsAvailable && excessItemCount <= 0)) {
                        lastUnfilteredItemIndex = lastPageUnfilteredItems.length - 1;
                    } else if (_.isEmpty(combinedFilteredItems)) {
                        lastUnfilteredItemIndex = 0;
                    } else if (!_.get(lastFilteredItem, 'uid')) {
                        return callback(new Error('Item in JDS does not have uid'));
                    } else {
                        lastUnfilteredItemIndex = _.findLastIndex(lastPageUnfilteredItems, function(item) {
                            return _.get(item, 'uid') === lastFilteredItem.uid;
                        });
                    }
                    return callback();
                });
            });
        },
        function(err) {
            if (err) {
                return callback(err, null, 500);
            }
            var fakeJdsResponse = {
                data: {
                    items: combinedFilteredItems
                }
            };
            _.assign(fakeJdsResponse.data, initialPageMetadata, lastPageMetadata);
            fakeJdsResponse.data.currentItemCount = _.size(combinedFilteredItems);
            if (_.parseInt(_.get(jdsOptions, 'body.limit'))) {
                fakeJdsResponse.data.nextStartIndex = _.parseInt(_.get(jdsOptions, 'body.start', 0)) + lastUnfilteredItemIndex + 1;
            }
            return callback(null, fakeJdsResponse, 200);
        }
    );
}

function createJDSPath(jdsResource, req) {
    var jdsPath = '';
    var jdsTemplate = _.get(req, 'body.template') || _.get(req, 'query.template');

    if (_.has(availableJdsTemplates, jdsTemplate)) {
        jdsPath = jdsResource + '/' + jdsTemplate;
    } else {
        jdsPath = jdsResource;
    }

    return jdsPath;
}


/**
 * @param {IncomingMessage} req
 * @param {String} pid The pid of the pre-synchronized patient
 * @param {String} uid The uid of the item to look up
 * @param {Function} callback receives (error, response, statusCode)
 *     where error is null if there was no error performing the fetch
 *     where response is the response body object
 *     where statusCode is the fetch status code if available
 */
function getByUid(req, pid, uid, callback) {
    var options = _.extend({}, req.app.config.jdsServer, {
        url: '/vpr/' + pid + '/' + uid,
        logger: req.logger,
        json: true
    });
    http.get(options, function(error, response, responseBody) {
        if (error) {
            req.logger.error(error);
            return callback(error, null, 500);
        }
        if (_.has(responseBody, 'error')) {
            return callback(responseBody.error, responseBody, response.statusCode);
        }
        if (!_.has(responseBody, 'data')) {
            return callback(new Error('Missing data in JDS response. Is the patient synced?'), responseBody, response.statusCode);
        }
        return callback(null, responseBody, response.statusCode);
    });
}

function requestPatient(req, pid, options, callback) {
    return fetchJdsAndFillPagination(req, options,
        function responseFilterer(req, responseBody, callback) {
            return transformCwadf(req, pid, responseBody, function(err, domainData, statusCode) {
                return callback(err, domainData);
            });
        },
        function handler(err, jdsResponse, statusCode) {
            return callback(err, jdsResponse, statusCode);
        }
    );
}

function transformCwadf(req, pid, domainData, callback) {

    var options = _.extend({}, req.app.config.jdsServer, {
        url: '/vpr/' + pid + '/index/cwad-kind',
        logger: req.logger,
        json: true
    });

    http.get(options, function(error, response, cwadData) {
        if (error) {
            options.logger.error(error);
            return callback(error, null, 500);
        }

        filterAsuDocuments(req, cwadData, function(err, results) {
            if (err) {
                return callback(err, null, 500);
            }
            cwadData = results;

            var cwadf = {};
            if (_.isEmpty(_.get(cwadData, 'data.items'))) {
                cwadf.C = false;
                cwadf.W = false;
                cwadf.A = false;
                cwadf.D = false;
            } else {
                _.each(_.get(cwadData, 'data.items'), function(cwadSiteObj) {
                    var kind = _.get(cwadSiteObj, 'kind');
                    cwadf.C = cwadf.C || kind === 'Crisis Note';
                    cwadf.W = cwadf.W || kind === 'Clinical Warning';
                    cwadf.A = cwadf.A || kind === 'Allergy/Adverse Reaction';
                    cwadf.D = cwadf.D || kind === 'Advance Directive';
                });
            }

            var patientRecordFlag = _(domainData.data.items)
                .reject(function(item) {
                    return item.pid && (item.pid.indexOf('HDR;') === 0 || item.pid.indexOf('VLER;') === 0 || item.pid.indexOf('DOD;') === 0);
                })
                .pluck('patientRecordFlag')
                .compact()
                .flatten()
                .uniq(false, function(item) {
                    return JSON.stringify(item);
                })
                .value();

            cwadf.F = !_.isEmpty(patientRecordFlag);
            cwadf.flags = _.keys(_.pick(cwadf, _.identity)).join('');

            _.each(domainData.data.items, function(patientRecordSiteObj) {
                patientRecordSiteObj.cwadf = cwadf.flags;
                if (cwadf.F) {
                    patientRecordSiteObj.patientRecordFlag = patientRecordFlag;
                }
            });

            return callback(null, transformDomainData('patient', domainData), response.statusCode);
        });
    });
}

function transformVler(logger, vlerCallType, vlerUid, name, jdsResponse, statusCode, callback) {
    var vlerData = jdsResponse;
    if (vlerCallType) {
        vlerData = filterVlerData(vlerCallType, vlerUid, name, jdsResponse);
    }
    if (vlerData.data.totalItems < 1) {
        return callback(null, vlerData, statusCode);
    }
    if (vlerData.data.totalItems > 0) {
        patientRecordAnnotator.decompressFullHtml(vlerData, function(err, decompressedData) {
            if (err) {
                logger.error(err);
                return callback(err, null, statusCode);
            }
            return callback(null, vlerData, statusCode);
        });
    }
}

function applyFilters(domainData, filterObject) {
    var dataItems = _.get(domainData, 'data.items');
    if (!_.isArray(dataItems)) {
        return domainData;
    }
    if (!_.isArray(filterObject)) {
        return domainData;
    }
    var newDataItems = jdsFilter.applyFilters(filterObject, dataItems);
    if (_.isError(newDataItems)) {
        return domainData;
    }
    _.set(domainData, 'data.items', newDataItems);
    return domainData;
}

function transformDomainData(domainName, domainData) {
    if (domainName === 'vital') {
        patientRecordAnnotator.addCalculatedBMI(domainData);
        patientRecordAnnotator.addReferenceRanges(domainData);
    }
    if (domainName === 'med') {
        domainData = patientRecordAnnotator.setExpirationLabel(domainData);
        domainData = patientRecordAnnotator.setTimeSince(domainData);
        domainData = patientRecordAnnotator.addNormalizedName(domainData);
    }
    if (domainName === 'problem') {
        domainData = patientRecordAnnotator.setStandardizedDescription(domainData);
    }
    return domainData;
}

function filterVlerData(vlerCallType, vlerUid, name, domainData) {
    var vlerData = patientRecordAnnotator.filterVlerData(vlerCallType, vlerUid, name, domainData);
    return vlerData;
}

function filterAsuDocuments(req, details, callback) {
    if (_.isEmpty(_.get(details, 'data.items'))) {
        return callback(null, details);
    }
    var requiredPermission = 'VIEW';
    var allPermissions = [
        'VIEW',
        'MAKE ADDENDUM'
    ];
    asuUtils.applyAsuRulesWithActionNames(req, requiredPermission, allPermissions, details, function(error, response) {
        details.data.items = response;
        return callback(error, details);
    });
}

function removeParentMedications(response) {
    if (!_.isArray(_.get(response, 'data.items'))) {
        return;
    }
    response.data.items = _.reject(response.data.items, function(item) {
        return _.find(item.orders, function(order) {
            return !_.isEmpty(order.childrenOrderUids);
        });
    });
}

module.exports.filterAsuDocuments = filterAsuDocuments;
module.exports._isResponseError = isResponseError;
module.exports._requestDocuments = requestDocuments;
module.exports._requestMedications = requestMedications;
module.exports._applyFilters = applyFilters;
