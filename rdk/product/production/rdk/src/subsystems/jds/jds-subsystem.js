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


module.exports.constants = {};
module.exports.constants.MAX_JDS_URL_SIZE = 1024;
module.exports.constants.JDS_RANGE_DELIMITER = ',';

module.exports.getSubsystemConfig = getSubsystemConfig;
module.exports.getPatientDomainData = getPatientDomainData;
module.exports.getByUid = getByUid;
module.exports._filterAsuDocuments = filterAsuDocuments;
module.exports._fetchJdsAndFillPagination = fetchJdsAndFillPagination;

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
    if (index === 'patient') {
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
        qs: query,
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

    return rdk.utils.http.get(options, function(error, response, responseBody) {
        var errorCheck = isResponseError(req, error, response, responseBody);
        if (errorCheck) {
            return callback(errorCheck, responseBody, response.statusCode);
        }
        if (name === 'vlerdocument') {
            return transformVler(req.logger, vlerCallType, vlerUid, name, responseBody, response.statusCode, callback);
        }
        return callback(null, transformDomainData(name, responseBody), response.statusCode);
    });
}

function isResponseError(req, error, response, responseBody) {
    if (error) {
        req.logger.error(error);
        return error;
    }
    if (_.has(responseBody, 'error')) {
        return new Error(responseBody.error);
    }
    if (!_.isArray(_.get(responseBody, 'data.items'))) {
        return new Error('Missing data in JDS response. Is the patient synced?');
    }
    return false;
}

function requestDocuments(req, pid, options, callback) {
    async.parallel([
        function(callback) {
            var vixSubsystemPresent = _.get(req, 'app.subsystems.vix');
            if (vixSubsystemPresent) {
                return vix.fetchBseToken.fetch(req, callback);
            }
            return callback(null, null);
        },
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
        var vixResponse = response[0];
        var asuResponse = response[1];
        var responseBody = asuResponse[0];
        var statusCode = asuResponse[1];
        var bodyHasItems = _.size(_.get(responseBody, 'data.items')) > 0;

        if (vixResponse && bodyHasItems) {
            return vix.addImagesToDocument(req, responseBody, vixResponse.token, function(err, responseBody) {
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
    var requestedItemCount = _.parseInt(_.get(jdsOptions, 'qs.limit'));
    var moreItemsAvailable = true;
    var combinedFilteredItems = [];
    var lastPageMetadata;
    var initialPageMetadata;

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
                _.set(jdsOptions, 'qs.start',
                    _.parseInt(_.get(jdsOptions, 'qs.start', 0)) + lastPageMetadata.itemsPerPage);
            }
            rdk.utils.http.get(jdsOptions, function(error, response, responseBody) {
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
                moreItemsAvailable = _.parseInt(_.get(jdsOptions, 'qs.start', 0)) + lastPageMetadata.currentItemCount < lastPageMetadata.totalItems;
                return responseFilterer(req, responseBody, function(err, results) {
                    if (err) {
                        return callback(err);
                    }
                    combinedFilteredItems = combinedFilteredItems.concat(results.data.items);
                    return callback();
                });
            });
        },
        function(err) {
            if (err) {
                return callback(err, null, 500);
            }
            var excessItemCount = Math.max(0, _.size(combinedFilteredItems) - requestedItemCount);
            if (excessItemCount > 0) {
                combinedFilteredItems.length = requestedItemCount;
            }
            var fakeJdsResponse = {
                data: {
                    items: combinedFilteredItems
                }
            };
            _.assign(fakeJdsResponse.data, initialPageMetadata, lastPageMetadata);
            fakeJdsResponse.data.currentItemCount = _.size(combinedFilteredItems);
            if (_.parseInt(_.get(jdsOptions, 'qs.limit'))) {
                fakeJdsResponse.data.nextStartIndex = _.parseInt(_.get(jdsOptions, 'qs.start')) + lastPageMetadata.currentItemCount - excessItemCount;
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

    var filter = ['not', ['exists', 'removed'],
        ['eq', 'removed', 'false']
    ];
    var filterString = jdsFilter.build(filter);
    var queryObject = {
        filter: filterString
    };
    var options = _.extend({}, req.app.config.jdsServer, {
        url: '/vpr/' + pid + '/index/cwad',
        qs: queryObject,
        logger: req.logger,
        json: true
    });

    rdk.utils.http.get(options, function(error, response, cwadData) {
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
            _.each(cwadData.data.items, function(cwadSiteObj) {
                var kind = cwadSiteObj.kind;
                cwadf.C = cwadf.C || kind === 'Crisis Note';
                cwadf.W = cwadf.W || kind === 'Clinical Warning';
                cwadf.A = cwadf.A || kind === 'Allergy/Adverse Reaction';
                cwadf.D = cwadf.D || kind === 'Advance Directive';
            });

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
