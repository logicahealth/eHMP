'use strict';

var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;
var _ = require('lodash');
var nullChecker = rdk.utils.nullchecker;
var async = require('async');
var searchJds = require('./search-jds');
var S = require('string');
var sensitivityUtils = rdk.utils.sensitivity;
var searchUtil = require('./results-parser');
var hmpPatientSelect = require('./hmp-patient-select');
var NO_HMP_SELECT_RPC_ERR_REGEX = /^VistA SECURITY error(.*)$/i;
var COMMA_REGEX = /,+/gi;
var NAME_SEARCH_TYPE = 'NAME';
var LAST5_SEARCH_TYPE = 'LAST5';
var PID_SEARCH_TYPE = 'PID';
var JDSPatientAttributeWhitelist = ['birthDate', 'displayName', 'familyName', 'fullName', 'genderCode', 'genderName', 'givenNames', 'icn', 'last5', 'localId', 'pid', 'roomBed', 'sensitive', 'ssn', 'summary'];

/**
 *
 * Retrieves patient information from VistA and/or JDS.
 *
 * @param {Object} req - The request object.
 * @param {string} logMessagePrefix - Used when logging messages to show who is calling this - useful for debugging.
 * @param {Object} jdsServer - Connectivity information for JDS. Pulled from req.app.config.jdsServer
 * @param {Object} searchOptions - The search options for the patient search query.
 * @param {string} searchOptions.site - The site to search for patients on.
 * @param {string} searchOptions.searchType - The type of search to perform. Can be ICN, PID, LAST5, or NAME.
 * @param {string} searchOptions.searchString - The string to search on. ICN for ICN search, PID for PID search,
 *                 first letter of last name + last 4 of SSN for last5 search, full or partial name for name search.
 * @param {function} callback - The function to call when all of the patient data has been retrieved.
 */
module.exports.callPatientSearch = function(req, logMessagePrefix, jdsServer, searchOptions, callback) {
    var logger = req.logger;
    var site = searchOptions.site;
    var searchType = searchOptions.searchType;
    var searchString = searchOptions.searchString;
    if (searchType === 'PID' && !_.startsWith(searchString, site + ';')) {
        return callback(logMessagePrefix + ' site "' + site + '" doesn\'t match site in pid "' + searchString + '"');
    }
    var sensitivePatientAcknowleged = _.result(req, 'query._ack') || _.result(req, 'params._ack') || _.result(req, 'body._ack') || false;
    var hasDGAccess = _.result(req, 'session.user.dgSensitiveAccess', 'false') === 'true';
    var LOG_MESSAGE_PREFIX = 'patient-search-util.callPatientSearch';
    if (!logMessagePrefix) {
        logMessagePrefix = LOG_MESSAGE_PREFIX;
    } else {
        logMessagePrefix += '.' + LOG_MESSAGE_PREFIX;
    }
    var hasHmpPatientSelectRpc = _.result(req, 'app.config.vistaSites[' + site + '].hasHmpPatientSelectRpc', null);
    logger.debug('%s beginning with hasHmpPatientSelectRpc set to %s', logMessagePrefix, hasHmpPatientSelectRpc);

    // If the site is configured to have the HMP PATIENT SELECT RPC, call it to retrieve the patient search results.
    // Otherwise, get the patient search results from JDS.
    if (hasHmpPatientSelectRpc !== false) {
        logger.debug('%s performing hmpPatientSelect.fetch using site=%s &searchType=%s &searchString=%s', logMessagePrefix, site, searchType, searchString);
        hmpPatientSelect.fetch(req, searchOptions, site, function(error, response) {
            if (error) {
                /**
                 * If we get the security error from the HMP PATIENT SELECT call we assume that the
                 * RPC is not installed at the site and need to call pt-select from RC23 forward
                 */
                if (error.match(NO_HMP_SELECT_RPC_ERR_REGEX)) {
                    if (!_.isEmpty(_.result(req, 'app.config.vistaSites[' + site + ']', {}))) {
                        //set the config to not have hasHmpPatientSelectRpc
                        req.app.config.vistaSites[site].hasHmpPatientSelectRpc = false;
                        logger.trace(req.app.config.vistaSites[site]);
                    }
                    logger.debug('%s performing pt-select search after failed hmpPatientSelect attempt using site=%s &searchType=%s &searchString=%s', logMessagePrefix, site, searchType, searchString);
                    return searchJds.getPatients(req, searchOptions, jdsServer, function(err, response) {
                        var options = {
                            finalCB: callback,
                            hasDGAccess: hasDGAccess,
                            sensitivePatientAcknowleged: sensitivePatientAcknowleged,
                            logMessagePrefix: logMessagePrefix
                        };
                        ptSelectCB(err, response, logger, options);
                    });
                }
                logger.error(logMessagePrefix + 'Error performing search [%s]', (error.message || error));
                error.message = 'There was an error processing your request. The error has been logged: ';
                return callback(logMessagePrefix + ' ' + error);
            }

            if (response.statusCode >= 300) {
                logger.error(logMessagePrefix + 'response.statusCode [%s]', response.statusCode);
                return callback({
                    status: response.statusCode,
                    message: response
                });
            }
            // If we're doing a patient search (i.e. NAME or LAST5), there's no need to call JDS.
            // If we're doing patient selection, we do need to call JDS to get the unmasked SSN.
            if (searchType === NAME_SEARCH_TYPE || searchType === LAST5_SEARCH_TYPE) {
                hmpPatientSelectSearchCB(response, {
                    req: req,
                    hasDGAccess: hasDGAccess,
                    logMessagePrefix: logMessagePrefix,
                    finalCB: callback,
                    sensitivePatientAcknowleged: sensitivePatientAcknowleged,
                    searchOptions: searchOptions
                });
            } else {
                hmpPatientSelectSelectionCB(response, {
                    req: req,
                    jdsServer: jdsServer,
                    hasDGAccess: hasDGAccess,
                    logMessagePrefix: logMessagePrefix,
                    finalCB: callback,
                    sensitivePatientAcknowleged: sensitivePatientAcknowleged,
                    searchOptions: searchOptions
                });
            }
        });
    } else {
        logger.debug('%s performing pt-select search instead of hmpPatientSelect using site=%s &searchType=%s &searchString=%s', logMessagePrefix, site, searchType, searchString);
        searchJds.getPatients(req, searchOptions, jdsServer, function(err, response) {
            var options = {
                finalCB: callback,
                hasDGAccess: hasDGAccess,
                sensitivePatientAcknowleged: sensitivePatientAcknowleged,
                logMessagePrefix: logMessagePrefix
            };
            ptSelectCB(err, response, logger, options);
        });
    }
};

var ptSelectCB = function(err, response, logger, options) {
    var hasDGAccess = options.hasDGAccess;
    var sensitivePatientAcknowleged = options.sensitivePatientAcknowleged;
    if (err) {
        return finalPatientSearchCallback(err, response, logger, options);
    }
    if (_.result(response, 'data.items', []).length > 0) {
        for (var i = 0; i < response.data.items.length; i += 1) {
            var patient = response.data.items[i];
            if (!patient.sensitive || sensitivePatientAcknowleged || hasDGAccess) {
                patient = cleanJDSPatientAttributes(sensitivityUtils.removeSensitiveFields(patient));
            } else {
                patient = sensitivityUtils.hideSensitiveFields(patient);
            }
            patient = searchUtil.transformPatient(patient, true);
            response.data.items[i] = patient;
        }
    }
    finalPatientSearchCallback(err, response, logger, options);
};

var hmpPatientSelectSelectionCB = function(response, options) {
    var req = options.req;
    var logger = req.logger;
    var jdsServer = options.jdsServer;
    var hasDGAccess = options.hasDGAccess;
    var sensitivePatientAcknowleged = options.sensitivePatientAcknowleged;
    var searchOptions = options.searchOptions;
    var site = searchOptions.site;
    var logMessagePrefix = options.logMessagePrefix ? options.logMessagePrefix + '.hmpPatientSelectSelectionCB' : 'patientSearch.hmpPatientSelectSelectionCB';

    if (!_.isEmpty(_.result(req, 'app.config.vistaSites[' + site + ']', {}))) {
        //set the config to have hasHmpPatientSelectRpc
        req.app.config.vistaSites[site].hasHmpPatientSelectRpc = true;
        logger.trace(req.app.config.vistaSites[site]);
    }

    async.mapSeries(response, function(patient, cb) {
        logger.debug('%s sensitive flag was %s for patient %s;', logMessagePrefix, patient.sensitive, patient.fullName);

        // If patient is sensitive and the user doesn't have DG access and they haven't acknowledged that the patient is sensitive,
        // hide the sensitive fields and return the patient data.
        if (patient.sensitive && !sensitivePatientAcknowleged && !hasDGAccess) {
            logger.trace(patient, logMessagePrefix + ' has an _ack of ' + sensitivePatientAcknowleged);
            patient = sensitivityUtils.hideSensitiveFields(patient);
            patient = searchUtil.transformPatient(patient, false);
            return setImmediate(cb, null, patient);
        }

        logger.debug('%s checking for patient in JDS', logMessagePrefix);

        // Set up call to retrieve full SSN from JDS since the VistA data masks it out
        var options = _.create(searchOptions, {
            searchString: patient.pid,
            searchType: PID_SEARCH_TYPE
        });
        searchJds.getPatients(req, options, jdsServer, function(err, jdsResult) {
            if (err) {
                return cb(err);
            }
            if (!_.isEmpty(_.result(jdsResult, 'data.items', []))) {
                patient.ssn = _.result(_.find(jdsResult.data.items, function(jdsPatient) {
                    return !_.isEmpty(_.result(jdsPatient, 'ssn', ''));
                }), 'ssn', patient.ssn);
                patient.sensitive = _.result(_.find(jdsResult.data.items, function(jdsPatient) {
                    return _.result(jdsPatient, 'sensitive', false) === true;
                }), 'sensitive', false);
            } else {
                patient.sensitive = false;
            }

            if (!patient.sensitive || sensitivePatientAcknowleged || hasDGAccess) {
                patient = cleanJDSPatientAttributes(sensitivityUtils.removeSensitiveFields(patient));
            } else {
                patient = sensitivityUtils.hideSensitiveFields(patient);
            }
            patient = searchUtil.transformPatient(patient, false);
            return cb(null, patient);
        });
    }, function(err, patients) {
        var retvalue = {
            apiVersion: '1.0',
            data: {
                totalItems: 0,
                currentItemCount: 0,
                items: []
            }
        };
        //format the RPC data to look like the JDS data that we used to send back
        if (!_.isEmpty(patients)) {
            retvalue.data.totalItems = patients.length;
            retvalue.data.currentItemCount = patients.length;
            retvalue.data.items = patients;
        }
        finalPatientSearchCallback(err, retvalue, logger, options);
    });
};

/**
 * Processes response from RPC search in the context of a full name or last 5 search.
 *
 * @param {Object} response - results from HMP PATIENT SELECT.
 * @param {Object} options - contains relevant info for processing the results.
 */
var hmpPatientSelectSearchCB = function(response, options) {
    var req = options.req;
    var logger = req.logger;
    var hasDGAccess = options.hasDGAccess;
    var sensitivePatientAcknowleged = options.sensitivePatientAcknowleged;
    var searchOptions = options.searchOptions;
    var site = searchOptions.site;
    var searchType = _.get(searchOptions, 'searchType');
    var searchString = _.get(searchOptions, 'searchString');
    var logMessagePrefix = options.logMessagePrefix ? options.logMessagePrefix + '.hmpPatientSelectSelectionCB' : 'patientSearch.hmpPatientSelectSearchCB';

    if (!_.isEmpty(_.result(req, 'app.config.vistaSites[' + site + ']', {}))) {
        //set the config to have hasHmpPatientSelectRpc
        req.app.config.vistaSites[site].hasHmpPatientSelectRpc = true;
        logger.trace({ 'config.vistasites': req.app.config.vistaSites[site] }, 'hmpPatientSelectRpc set to true');
    }

    logger.debug('%s given a response value', logMessagePrefix);
    logger.trace({ hmpPatientSelectRpcResponse: response });

    var findComma = new RegExp(COMMA_REGEX).test(searchString);
    var removeImproperlyMatchedPatients = (searchType === NAME_SEARCH_TYPE && findComma);

    // US17390 - If there is a comma in our searchString reduce the results from the HMP PATIENT SELECT RPC so that the last name is an exact match
    if (removeImproperlyMatchedPatients) {
        var improperlyMatchedPatients = _.remove(response, function lastNameExactMatch(value, index, array) {
            var myName = _.get(value, 'fullName');
            var regex = new RegExp('^' + _.escapeRegExp(searchString), 'gi');
            var matched = regex.test(myName);
            // This is a reversal of if we find a match. If we find the match we are keeping it and not removing
            return !matched;
        });
        req.logger.debug(improperlyMatchedPatients, logMessagePrefix + ' comma separated value returned these');
    }

    async.mapSeries(response, function(patient, cb) {

        patient = sensitivityUtils.removeSensitiveFields(patient);

        if (patient.sensitive && !sensitivePatientAcknowleged && !hasDGAccess) {
            patient = sensitivityUtils.hideSensitiveFields(patient);
        }

        patient = searchUtil.transformPatient(patient, false);
        return cb(null, patient);

    }, function(err, patients) {
        var retvalue = {
            data: {
                totalItems: 0,
                currentItemCount: 0,
                items: []
            }
        };
        //format the RPC data to look like the JDS data that we used to send back
        if (!_.isEmpty(patients)) {
            retvalue.data.totalItems = patients.length;
            retvalue.data.currentItemCount = patients.length;
            retvalue.data.items = patients;
        }
        finalPatientSearchCallback(err, retvalue, logger, options);
    });
};

function finalPatientSearchCallback(err, data, logger, options) {
    var logMessagePrefix = options.logMessagePrefix ? options.logMessagePrefix + '.finalPatientSearchCallback' : 'patientSearch.finalPatientSearchCallback';
    if (err) {
        return options.finalCB(err);
    }
    data.status = 200;
    logger.trace(data, logMessagePrefix + ' returning result');
    options.finalCB(null, data);
}

/**
 * Retrieves patient demographic information from JDS based on a given PID.
 *
 * @param {Object} req - The request object.
 * @param {string} logMessagePrefix - Used when logging messages to show who is calling this - useful for debugging.
 * @param {string} site - The site to search for patients in.
 * @param {string} searchType - The type of search to perform. Can be ICN, PID, LAST5, or NAME.
 * @param {string} pid - The PID of the patient to search for.
 * @param {function} callback - The function to call when all of the data has been retrieved.
 */
module.exports.callJDSPatientSearch = function(req, logMessagePrefix, site, searchType, pid, callback) {
    var LOG_MESSAGE_PREFIX = 'patient-search-util.callJDSPatientSearch';
    if (!logMessagePrefix) {
        logMessagePrefix = LOG_MESSAGE_PREFIX;
    } else {
        logMessagePrefix += '.' + LOG_MESSAGE_PREFIX;
    }
    var logger = req.logger;
    var sensitivePatientAcknowleged = _.result(req, 'query._ack') || _.result(req, 'params._ack') || _.result(req, 'body._ack') || false;

    var hasDGAccess = _.result(req, 'session.user.dgSensitiveAccess', 'false') === 'true';

    var options = _.extend({}, req.app.config.jdsServer, {
        url: '/vpr/' + pid,
        logger: logger,
        json: true
    });
    logger.debug(logMessagePrefix + ' performing search using pid=' + pid);
    httpUtil.get(options, function(error, response, result) {
        if (error) {
            logger.error(logMessagePrefix + ' Error performing search [%s]', (error.message || error));
            error.message = 'There was an error processing your request. The error has been logged: ';
            return callback(logMessagePrefix + ' ' + error, null);
        }
        if (response.statusCode >= 300) {
            logger.error(logMessagePrefix + ' response.statusCode [%s]', response.statusCode);
            return callback({
                status: response.statusCode,
                message: result
            }, null);
        }
        if (_.isEmpty(_.result(result, 'data.items', {}))) {
            return callback(null, {
                data: {}
            });
        }
        _.each(result.data.items, function(patient) {
            if (_.isUndefined(patient.sensitive)) {
                patient.sensitive = false;
            }
            if (!patient.sensitive || sensitivePatientAcknowleged || hasDGAccess) {
                patient = cleanJDSPatientAttributes(sensitivityUtils.removeSensitiveFields(patient));
            } else {
                patient = sensitivityUtils.hideSensitiveFields(patient);
            }
            patient = searchUtil.transformPatient(patient, true);
        });

        return callback(null, result);
    });
};

/**
 * Removes unnecessary attributes from a patient.
 *
 * @param {object} patient - The patient to remove attributes from.
 * @return {object} cleanedPatient - The patient, with unnecessary attributes removed.
 */
function cleanJDSPatientAttributes(patient) {
    var cleanedPatient = _.pick(patient, JDSPatientAttributeWhitelist);
    return cleanedPatient;
}

function validResponseDataItems(logger, logMessagePrefix, response) {
    //Check response.data.items
    if (!response) {
        logger.debug(logMessagePrefix + '_validResponseDataItems got a null response object');
        return false;
    } else if (!response.data) {
        logger.debug(logMessagePrefix + '_validResponseDataItems got a response object with no data');
        return false;
    } else if (!response.data.items) {
        logger.debug(logMessagePrefix + '_validResponseDataItems got a response object with no data.items');
        return false;
    }
    logger.debug(logMessagePrefix + '_validResponseDataItems got a valid response object');
    return true;
}

/**
 * Pass in 'req.query.order' and the response which contains data.items that need to be ordered.
 * Example: https://ehmp.vistacore.us/resource/patient-search/full-name?name.full=Seven&order=givenNames%20DESC
 *
 * @param logger - req.logger - The logger
 * @param logMessagePrefix - Used when logging messages to show who is calling this - useful for debugging.
 * @param order - the field (in an instance of data.items) that you want to search on.
 * If this is not passed in, the data will be returned as it is - no sorting will take place.
 * After the field you want to search on, you can specify one of two values:
 * 'ASC' for ascending or 'DESC' for descending.  If fieldName is supplied but 'ASC' or 'DESC' is not supplied, 'ASC' will be assumed.
 * @param response The object containing data.items that was returned from the call to callPatientSearch
 */
module.exports.sort = function(logger, logMessagePrefix, order, response) {
    //Check order object
    if (!order) {
        logger.debug(logMessagePrefix + '_sort no sort specified - returning data as is');
        return;
    }
    if (validResponseDataItems(logger, logMessagePrefix + '_sort', response) === false) {
        return;
    }
    var fieldAndOrder = order.split(' ');
    var field = fieldAndOrder[0];
    var fieldOrder = (fieldAndOrder.length === 2 ? fieldAndOrder[1] : 'ASC');
    if (fieldOrder) {
        fieldOrder = fieldOrder.toLowerCase();
    }
    logger.debug(logMessagePrefix + '_sort sorting by ' + fieldOrder);
    if (fieldOrder === 'desc') {
        response.data.items = _.sortBy(response.data.items, field).reverse();
    } else {
        response.data.items = _.sortBy(response.data.items, field);
    }
};

/**
 * Because lodash treats NaN as a number, we need a way to ensure that the value passed in is not only a number but
 * that it is not a floating value.
 *
 * @param num the variable to check to see if it's a whole number
 * @returns {boolean} True if a whole number.
 */
function isWholeNumber(num) {
    if (nullChecker.isNullish(num)) {
        return false;
    }
    if (typeof num === 'string' && _.isEmpty(num)) {
        return false;
    }
    return num % 1 === 0;
}

/**
 *
 * @param logger - req.logger - The logger
 * @param logMessagePrefix - Used when logging messages to show who is calling this - useful for debugging.
 * @param start Where do you want to start returning results.
 * @param limit How many results do you want returned for each page.
 * @param response The object containing data.items that was returned from the call to callPatientSearch
 */
module.exports.limit = function(logger, logMessagePrefix, start, limit, response) {
    logger.debug(logMessagePrefix + '_limit start=' + start + ', limit=' + limit);
    if (!limit) {
        logger.debug(logMessagePrefix + '_limit no limit specified - returning data as is');
        return;
    }
    if (!isWholeNumber(limit)) {
        logger.debug(logMessagePrefix + '_limit limit specified was not a whole number - returning data as is');
        return;
    }
    if (!start) {
        start = 0;
    }
    if (!isWholeNumber(start)) {
        logger.debug(logMessagePrefix + '_limit start specified was not a whole number - setting to zero');
        start = 0;
    }
    limit = Number(limit);
    start = Number(start);
    if (validResponseDataItems(logger, logMessagePrefix + ' limit', response) === false) {
        logger.debug(logMessagePrefix + '_limit validResponseDataItems returned false - returning data as is');
        return;
    }
    var totalItems = response.data.items.length;
    limit = limit < totalItems ? limit : totalItems; //If limit is bigger than totalItems, then just use totalItems

    response.data.itemsPerPage = limit;
    response.data.startIndex = start;
    response.data.pageIndex = (start / limit | 0); // jshint ignore:line
    response.data.totalPages = (totalItems / limit | 0) + (totalItems % limit > 0 ? 1 : 0); // jshint ignore:line
    logger.debug({
        limit: limit,
        itemsPerPage: _.result(response, 'data.itemsPerPage', 'No items per page found'),
        start: _.result(response, 'data.startIndex', 'No start found'),
        pageIndex: _.result(response, 'data.pageIndex', 'No page index found'),
        totalPages: _.result(response, 'data.totalPages', 'No total pages found'),
        totalItems: _.result(response, 'data.totalItems', 'No total items count found')
    }, logMessagePrefix + 'response data');

    if (limit > 0) {
        logger.debug(logMessagePrefix + '_limit start(' + typeof start + ')=' + start + ', limit(' + typeof limit + ')=' + limit);
        var end = start + limit;
        logger.debug({
            items: response.data.items
        }, logMessagePrefix + '_limit response.data.items - before slice(' + start + ', ' + end + ')');
        response.data.items = response.data.items.slice(start, end);
        logger.debug({
            items: response.data.items
        }, logMessagePrefix + '_limit response.data.items - after slice(' + start + ', ' + end + ')');
    } else {
        logger.debug({
            items: response.data.items
        }, logMessagePrefix + '_limit response.data.items - before slice(' + start + ')');
        response.data.items = response.data.items.slice(start);
        logger.debug({
            items: response.data.items
        }, logMessagePrefix + '_limit response.data.items - after slice(' + start + ')');
    }
    logger.debug(logMessagePrefix + '_limit response.data.items.length: ' + response.data.items.length);
    response.data.currentItemCount = response.data.items.length;
    logger.debug(logMessagePrefix + '_limit response.data.currentItemCount: ' + response.data.currentItemCount);
};

function validateFilter(logger, logMessagePrefix, filter, response) {
    if (!filter) {
        logger.debug(logMessagePrefix + '_validateFilter no filter specified - returning data as is');
        return false;
    }
    if (validResponseDataItems(logger, logMessagePrefix + ' filter', response) === false) {
        return false;
    }
    if (!_.startsWith(filter, 'eq(')) {
        logger.warn(logMessagePrefix + '_validateFilter filter was not eq - returning data as is');
        return false;
    }
    if (!_.endsWith(filter, ')')) {
        logger.warn(logMessagePrefix + '_validateFilter filter was not of the form eq(fieldName,"fieldValue") - no closing paren - returning data as is');
        return false;
    }
    if (_.indexOf(filter, ',') === -1) {
        logger.warn(logMessagePrefix + '_validateFilter filter was not of the form eq(fieldName,"fieldValue") - no comma - returning data as is');
        return false;
    }
    return true;
}

function parseFilter(logger, logMessagePrefix, filter) {
    var str = filter.slice(3, filter.length - 1);
    var fieldName = _.trim(str.slice(0, _.indexOf(str, ',')), '\'"');
    var fieldValue = _.trim(str.slice(_.indexOf(str, ',') + 1, str.length), '\'"');
    return {
        fieldName: fieldName,
        fieldValue: fieldValue
    };
}
/**
 * Pass in 'req.query.filter' and the response which contains data.items that need to be ordered.
 * Example: http://IP             /resource/locations/clinics/patients?uid=urn:va:location:9E7A:23&filter=eq(familyName,%22EIGHT%22)
 *
 * @param logger - req.logger - The logger
 * @param logMessagePrefix - Used when logging messages to show who is calling this - useful for debugging.
 * @param filter - the filter that follows the pattern &quot;eq(fieldName,"fieldValue")&quot;.  Only eq is supported
 * and if this pattern is not found, we just return the data as it is.
 * @param response The object containing data.items that was returned from the call to callPatientSearch
 */
module.exports.filter = function(logger, logMessagePrefix, filter, response) {
    logger.debug(logMessagePrefix + '_filter filtering by ' + filter);
    if (!validateFilter(logger, logMessagePrefix + '_filter', filter, response)) {
        return;
    }
    var fieldNameAndValue = parseFilter(logger, logMessagePrefix + '_filter', filter);
    var fieldName = fieldNameAndValue.fieldName;
    var fieldValue = fieldNameAndValue.fieldValue;
    logger.debug({
        fieldName: fieldName,
        fieldValue: fieldValue
    }, logMessagePrefix + '_filter fieldName and fieldValue');

    fieldValue = fieldValue.toLowerCase();
    var newItems = _.filter(response.data.items, function(item) {
        logger.trace({
            item: item
        }, logMessagePrefix + '_filter performing filter');

        var actualValue = item[fieldName];
        logger.debug(logMessagePrefix + '_filter actualValue is ' + actualValue);

        if (nullChecker.isNotNullish(actualValue)) {
            actualValue = actualValue.toLowerCase();
        }
        logger.debug(logMessagePrefix + '_filter performing actualValue is now ' + actualValue);

        if (actualValue === fieldValue) {
            logger.debug(logMessagePrefix + '_filter actualValue (' + actualValue + ') matches fieldValue (' + fieldValue + ')');
            return true;
        } else {
            logger.debug(logMessagePrefix + '_filter actualValue (' + actualValue + ') does NOT match fieldValue (' + fieldValue + ')');
            return false;
        }
    });
    logger.debug(logMessagePrefix + '_filter filtering finished');
    response.totalItems = newItems.length;
    response.currentItemCount = newItems.length;
    response.data.items = newItems;
};

function getSiteFromPid(pid) {
    if (nullChecker.isNotNullish(pid) && S(pid).contains(';')) {
        return pid.split(';')[0];
    }
    return undefined;
}

/**
 * Retrieves the site from the session, pid, or request - if not found, null is returned.
 *
 * @param logger - req.logger - The logger
 * @param logMessagePrefix - Used when logging messages to show who is calling this - useful for debugging.
 * @param pid - the pid that could contain the site.
 * @param req The request that could contain the site
 */
module.exports.getSite = function(logger, logMessagePrefix, pid, req) {
    logger.debug(logMessagePrefix + '_getSite retrieving site');
    var site;
    req.logger.debug(logMessagePrefix + '_getSite pid=' + pid);
    site = getSiteFromPid(pid);
    if (nullChecker.isNotNullish(site)) {
        req.logger.debug(logMessagePrefix + '_getSite obtained site (' + site + ') from pid');
        return site;
    }
    if (nullChecker.isNotNullish(req)) {
        site = req.param('site');
        if (nullChecker.isNotNullish(site)) {
            req.logger.debug(logMessagePrefix + '_getSite obtained site (' + site + ') from request');
            return site;
        }
    }
    if (_.has(req, 'session.user.site')) {
        site = req.session.user.site;
        req.logger.debug(logMessagePrefix + '_getSite obtained site (' + site + ') from req.session.user.site');
        return site;
    }
    req.logger.error(logMessagePrefix + '_getSite unable to obtain site from request');
    return null;
};
