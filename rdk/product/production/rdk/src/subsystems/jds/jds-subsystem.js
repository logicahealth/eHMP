'use strict';

var _ = require('lodash');
var rdk = require('../../core/rdk');
var jdsDomains = require('./jds-domains');
var querystring = require('querystring');
var dd = require('drilldown');
var patientRecordAnnotator = require('./patient-record-annotator');
var http = rdk.utils.http;
var jdsFilter = require('jds-filter');
var resultUtils = rdk.utils.results;
var asuUtils = require('../../resources/patient-record/asu-utils');
var nullchecker = rdk.utils.nullchecker;

module.exports.getSubsystemConfig = getSubsystemConfig;
module.exports.getPatientDomainData = getPatientDomainData;
module.exports._filterAsuDocuments = filterAsuDocuments;

function getSubsystemConfig(app) {
    return {
        healthcheck: {
            name: 'jds',
            interval: 100000,
            check: function(callback) {
                var jdsOptions = _.extend({}, app.config.jdsServer, {
                    url: '/ping',
                    timeout: 5000,
                    logger: app.logger
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
    var jdsPath = jdsResource + '?' + querystring.stringify(query);
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
            return filterAsuDocuments(req, responseBody, function(err, results) {
                if (err) {
                    req.logger.error(err);
                    return callback(err, null, 500);
                }
                responseBody = results;
                return callback(null, responseBody, response.statusCode);
            });
        }
        if (name === 'vlerdocument') {
            return transformVler(req.logger, vlerCallType, vlerUid, name, responseBody, response.statusCode, callback);
        }
        if (name === 'patient') {
            return transformCwadf(req, pid, responseBody, callback);
        }
        return callback(null, applyFilters(name, transformDomainData(name, responseBody), req.query.afterFilter), response.statusCode);
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
    //var sites = getSyncedSites();  // TODO implement?
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

    asuUtils.applyAsuRules(req, details, function(error, response) {
        details.data.items = response;
        return callback(error, details);
    });
}
