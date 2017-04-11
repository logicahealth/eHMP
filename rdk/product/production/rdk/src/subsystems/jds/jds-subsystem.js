'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var jdsDomains = require('./jds-domains');
var querystring = require('querystring');
var patientRecordAnnotator = require('./patient-record-annotator');
var http = rdk.utils.http;
var jdsFilter = require('jds-filter');
var resultUtils = rdk.utils.results;
var asuUtils = require('../../resources/patient-record/asu-utils');
var nullchecker = rdk.utils.nullchecker;
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
 * @param {HttpRequest} req
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
    var jdsPath =  createJDSPath(jdsResource, query, req);
    var options = _.extend({}, req.app.config.jdsServer, {
        url: jdsPath,
        logger: req.logger,
        json: true
    });

    return rdk.utils.http.get(options, function(error, response, responseBody) {
        if (error) {
            req.logger.error(error);
            return callback(error, null, 500);
        }
        if (_.has(responseBody, 'error')) {
            return callback(new Error(responseBody.error), responseBody, response.statusCode);
        }
        if (!_.has(responseBody, 'data')) {
            return callback(new Error('Missing data in JDS response. Is the patient synced?'), responseBody, response.statusCode);
        }
        if (name === 'document-view') {
            return transformDocumentView(req, responseBody, response.statusCode, callback);
        }
        if (name === 'vlerdocument') {
            return transformVler(req.logger, vlerCallType, vlerUid, name, responseBody, response.statusCode, callback);
        }
        if (name === 'patient') {
            return transformCwadf(req, pid, responseBody, callback);
        }
        if (name === 'med') {
            removeParentMedications(responseBody);
        }
        return callback(null, applyFilters(name, transformDomainData(name, responseBody), req.query.afterFilter), response.statusCode);
    });
}

function createJDSPath(jdsResource, query, req) {
    var jdsPath = '';
    var jdsTemplate = _.get(req, 'query.template');

    if (jdsTemplate && availableJdsTemplates.hasOwnProperty(jdsTemplate)) {
        jdsPath = jdsResource + '/' + jdsTemplate + '?' + querystring.stringify(query);
    } else {
        jdsPath = jdsResource + '?' + querystring.stringify(query);
    }

    return jdsPath;
}

function transformDocumentView(req, responseBody, statusCode, callback) {
    async.waterfall([
        function(callback) {
            return filterAsuDocuments(req, responseBody, function(err, results) {
                if (err) {
                    req.logger.error(err);
                    return callback(err, null, 500);
                }
                responseBody = results;
                return callback(null, responseBody, statusCode);
            });
        },
        function(responseBody, statusCode, callback) {
            var vixSubsystemPresent = _.get(req, 'app.subsystems.vix');
            var bodyHasItems = _.size(_.get(responseBody, 'data.items')) > 0;
            if (vixSubsystemPresent && bodyHasItems) {
                return vix.addImagesToDocument(req, responseBody, function(err, responseBody) {
                    return callback(null, responseBody, statusCode);
                });
            }
            return callback(null, responseBody, statusCode);
        }
    ], function(err, responseBody, statusCode) {
        return callback(err, responseBody, statusCode);
    });
}

/**
 * @param {HttpRequest} req
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
    http.get(options, function (error, response, responseBody) {
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

function transformCwadf(req, pid, domainData, callback) {

    var filter = ['not', ['exists', 'removed'],
        ['eq', 'removed', 'false']
    ];
    var filterString = jdsFilter.build(filter);
    var queryObject = {
        filter: filterString
    };
    var options = _.extend({}, req.app.config.jdsServer, {
        url: '/vpr/' + pid + '/index/cwad?' + querystring.stringify(queryObject),
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

function applyFilters(domainName, domainData, filterString) {
    if (domainName === 'med') {
        if (filterString) {
            var filterObj;
            try {
                filterObj = jdsFilter.parse(filterString);
            } catch (e) {
                return domainData;
            }

            domainData = resultUtils.filterResults(domainData, filterObj);
        }
    }
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
    if (nullchecker.isNullish(details) && nullchecker.isNullish(details.data) &&
        nullchecker.isNullish(details.data.items) || !details.data.items.length) {
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

    var initialCount = response.data.items.length;

    response.data.items = _.reject(response.data.items, function (item) {
        return _.find(item.orders, function (order) {
            return !_.isEmpty(order.childrenOrderUids);
        });
    });

    var removedCount = initialCount - response.data.items.length;
    if (response.data.totalItems) {
        response.data.totalItems -= removedCount;
    }
    if (response.data.currentItemCount) {
        response.data.currentItemCount -= removedCount;
    }
}
module.exports.filterAsuDocuments = filterAsuDocuments;
