'use strict';
var _ = require('lodash');
var rdk = require('../../core/rdk');
var fs = require('fs');
var util = require('util');
var crypto = require('crypto');
var moment = require('moment');
var async = require('async');
var searchUtil = require('./results-parser');
var formatSinglePatientSearchCommonFields = searchUtil.formatSinglePatientSearchCommonFields;
var _s = require('underscore.string');
var parseString = require('xml2js').parseString;
var http = rdk.utils.http;
var mvi = require('../../subsystems/mvi-subsystem');
var maskPtSelectSsn = require('./search-mask-ssn').maskPtSelectSsn;
var searchJds = require('./search-jds');
var sensitivityUtils = rdk.utils.sensitivity;
var pidValidator = rdk.utils.pidValidator;

module.exports._getPatientDemographicWithICN = getPatientDemographicWithICN;
// below: _ exports for unit testing only
module.exports._checkInvalidGlobalSearchParameters = checkInvalidGlobalSearchParameters;
module.exports._parseGlobalSearchResults = parseGlobalSearchResults;
module.exports._queryGlobalSearch = queryGlobalSearch;
module.exports._getGlobalSearchParams = getGlobalSearchParams;
module.exports._loadXML1305Files = loadXML1305Files;

var MVI_QUERY_DATE_FORMAT = 'YYYYMMDD';
var loadXML1305File = function(path, callback) {
    fs.readFile(__dirname + path, function(error, results) {
        if (error) {
            return callback(error, results);
        }
        return callback(null, results.toString());
    });
};

function loadXML1305Files(req, res, callback) {
    async.parallel([function(callback) {
        loadXML1305File('/xml/1305-ssn.xml', callback);
    }, function(callback) {
        loadXML1305File('/xml/1305-dob.xml', callback);
    }, function(callback) {
        loadXML1305File('/xml/1305-fullName.xml', callback);
    }, function(callback) {
        loadXML1305File('/xml/1305-firstName.xml', callback);
    }, function(callback) {
        loadXML1305File('/xml/1305-lastName.xml', callback);
    }, function(callback) {
        loadXML1305File('/xml/1305.xml', callback);
    }], function(error, results) {
        if (error) {
            return res.status(rdk.httpstatus.internal_server_error).rdkSend(error);
        }
        return callback({
            xml1305SSN: results[0],
            xml1305DoB: results[1],
            xml1305FullName: results[2],
            xml1305FirstName: results[3],
            xml1305LastName: results[4],
            xml1305: results[5]
        });
    });
}

var mviResponseCodes = {
    tooManyResults: 'QE',
    noResultsFound: 'NF',
    mviApplicationError: 'AE',
    applicationErrorTypeCodes: {
        systemError: 'AR'
    }
};
module.exports.soap1305ResponseCodes = mviResponseCodes;

module.exports.getGlobalSearch = function(req, res) {
    req.logger.info('global search invoked');
    var config = req.app.config;
    var params = getGlobalSearchParams(req);
    req.logger.debug({
        params: params
    }, 'global search received parameters');
    var errorMessage = checkInvalidGlobalSearchParameters(params);
    if (errorMessage) {
        return res.status(rdk.httpstatus.not_acceptable).rdkSend(errorMessage);
    }
    return queryGlobalSearch(config, params, req, res, function(errCode, result) {
        if (errCode) {
            req.logger.error(result);
            return res.status(errCode).rdkSend(result);
        }

        return parseGlobalSearchResults(throwAwaySoapEnvelope(result), req, function(toSend) {
            return res.rdkSend(toSend);
        });
    });
};

function throwAwaySoapEnvelope(result) {
    return searchUtil.throwAwaySoapEnvelope(result);
}

function getGlobalSearchParams(req) {
    var params = {};
    params.fname = req.query['name.first'] || req.body['name.first'];
    params.lname = req.query['name.last'] || req.body['name.last'];
    params.ssn = req.query.ssn || req.body.ssn;
    params.dob = req.query['date.birth'] || req.body['date.birth'];
    if (params.fname) {
        params.fname = params.fname.toUpperCase();
    }
    if (params.lname) {
        params.lname = params.lname.toUpperCase();
    }
    req.session.globalSearchParams = _.cloneDeep(params || {});
    return params;
}

function queryGlobalSearch(config, queryParams, req, res, next) {
    loadXML1305Files(req, res, function(xml1305Files) {
        var httpConfig = getMVISoapRequestHTTPConfig(req, queryParams, xml1305Files);
        return http.post(httpConfig, function(error, resp, data) {
            if (error) {
                return next(500, {
                    message: 'Cannot connect to MVI.'
                });
            }
            return parseString(data, function(err, result) {
                if (err) {
                    req.logger.debug(util.inspect(err));
                    var statusCode = resp.statusCode >= 300 ? resp.statusCode : 500;
                    return next(statusCode, err);
                }
                req.logger.trace({
                    result: result
                }, 'MVI Result');
                return next(null, result);
            });
        });
    });
}


function parseGlobalSearchResults(results, req, callback, isSSNMasked, checkPatientSensitivity, formatPatientSearchCommonFields) {
    var acknowledgementDetail = '';
    var patientList = [];
    var responseCode = searchUtil.getResponseCode(results);
    var emptyDataItems = {
        data: {
            items: []
        }
    };
    if (_.isUndefined(isSSNMasked)) {
        isSSNMasked = true;
    }
    if (_.isUndefined(checkPatientSensitivity)) {
        checkPatientSensitivity = true;
    }
    if (_.isUndefined(formatPatientSearchCommonFields)) {
        formatPatientSearchCommonFields = true;
    }
    if (responseCode === mviResponseCodes.tooManyResults) {
        return callback(_.extend({}, emptyDataItems, {
            'message': 'Search returned too many results. Please refine your search criteria and try again.'
        }));
    }
    if (responseCode === mviResponseCodes.noResultsFound) {
        return callback(_.extend({}, emptyDataItems, {
            'message': 'No results found. Verify search criteria.'
        }));
    }
    if (responseCode === mviResponseCodes.mviApplicationError) {
        var typeCode = searchUtil.getTypeCode(results);
        if (typeCode === mviResponseCodes.applicationErrorTypeCodes.systemError) {
            acknowledgementDetail = searchUtil.getAcknowledgementDetail(results);
            req.logger.warn('The VA MVI Application experienced a system error: %s', acknowledgementDetail);
            return callback(_.extend({}, emptyDataItems, {
                'message': 'The VA MVI Application experienced a system error. Please try again later.'
            }));
        }
        acknowledgementDetail = searchUtil.getAcknowledgementDetail(results);
        req.logger.warn('No results found due to a VA MVI Application or Data error: %s', acknowledgementDetail);
        return callback(_.extend({}, emptyDataItems, {
            'message': 'No results found due to a VA MVI Application or Data error. Please modify your search and try again.'
        }));
    }

    var maskSsn = function(responseObject) {
        if (isSSNMasked) {
            return maskPtSelectSsn(responseObject);
        }
        return responseObject;
    };

    var patients = _.get(results, 'controlActProcess[0].subject');
    if (patients === null || patients === undefined) {
        return callback(_.extend({}, emptyDataItems, {
            message: 'No results found. Verify search criteria.'
        }));
    }
    if (!_.isArray(patients)) {
        return parseGlobalPatient(patients, req, function(patient) {
            patientList.push(patient);
            var callbackObject = {
                data: {
                    items: patientList
                }
            };
            return callback(maskSsn(callbackObject));
        }, checkPatientSensitivity, formatPatientSearchCommonFields);
    }
    return async.eachSeries(patients, function(data, cb) {
        return parseGlobalPatient(data, req, function(patient) {
            patientList.push(patient);
            return setImmediate(cb);
        }, checkPatientSensitivity, formatPatientSearchCommonFields);
    }, function(err) {
        if (err) {
            req.logger.error(err);
            return callback(_.extend({}, emptyDataItems, {
                'message': 'Unable to parse response from MVI.'
            }));
        }
        var callbackObject = {
            data: {
                items: patientList
            }
        };
        return callback(maskSsn(callbackObject));
    });
}

function parseGlobalPatient(searchResult, req, callback, checkPatientSensitivity, formatPatientSearchCommonFields) {
    var patient = {};
    var patientPerson = searchUtil.getPatientPerson(searchResult);
    var patientName = patientPerson.name;
    var hasDGAccess = _.result(req, 'session.user.dgSensitiveAccess', 'false') === 'true';
    if (_.isUndefined(checkPatientSensitivity)) {
        checkPatientSensitivity = true;
    }
    if (_.isUndefined(formatPatientSearchCommonFields)) {
        formatPatientSearchCommonFields = true;
    }
    if (_.isArray(patientName)) {
        _.each(patientName, function(name) {
            if (name.$.use === 'L') { //L value in the 'use' field means it is the known name, not an alias name, this is here to handle the case where an Alias exists
                if (name.given[0] !== undefined) {
                    patient.givenNames = name.given[0]; //Only assign the given name if it exists. Just in case as we saw once case it was not their for a record
                }
                patient.familyName = name.family[0];
            }
        });
    } else if (patientName.$.use === 'L') { //L value in the 'use' field means it is the known name, not an alias name
        if (patientName.given[0] !== undefined) {
            patient.givenNames = patientName.given[0]; //Only assign the given name if it exists. Just in case as we saw once case it was not their for a record
        }
        patient.familyName = patientName.family[0];
    } else {
        //This should never occur according the the MVI specification
        req.logger.warn('No Name record with use as L found for this patient. Putting Unknown in First and Last Name.');
        patient.givenNames = 'Unknown';
        patient.familyName = 'Unknown';
    }
    patient.genderCode = patientPerson.administrativeGenderCode[0].$.code;
    var otherID = patientPerson.asOtherIDs[0];
    if (_.isArray(otherID)) {
        _.each(otherID, function(data) {
            if (data.$.classCode === 'SSN') {
                patient.ssn = data.id[0].$.extension;
            }
        });
    } else if (otherID.$.classCode === 'SSN') {
        patient.ssn = otherID.id[0].$.extension;
    } else {
        req.logger.warn('No SSN found in the MVI record that was returned.');
    }
    patient.birthDate = patientPerson.birthTime[0].$.value;

    if (patientPerson.addr && patientPerson.addr.length > 0) {
        patient.address = [{
            city: patientPerson.addr[0].city[0] || '',
            line1: patientPerson.addr[0].streetAddressLine[0] || '',
            state: patientPerson.addr[0].state[0] || '',
            use: patientPerson.addr[0].$.use || '',
            zip: patientPerson.addr[0].postalCode[0] || ''
        }];
    }

    if (patientPerson.telecom && patientPerson.telecom.length > 0) {
        patient.telecom = [{
            use: patientPerson.telecom[0].$.use || '',
            value: patientPerson.telecom[0].$.value || ''
        }];
    }

    //patient.dateAdmitted

    patient.id = searchUtil.getPatientId(searchResult);

    patient = searchUtil.transformPatient(patient);

    if (patient.idClass === 'EDIPI') {
        patient.pid = 'DOD;' + patient.pid;
    }

    if (checkPatientSensitivity) {
        return setPatientSensitivity(req, patient, callback, formatPatientSearchCommonFields, hasDGAccess);
    }
    patient.sensitive = false;
    sensitivityUtils.removeSensitiveFields(patient);
    if (formatPatientSearchCommonFields) {
        formatSinglePatientSearchCommonFields(patient, hasDGAccess);
    }
    return callback(patient);
}

function setPatientSensitivity(req, patient, callback, formatPatientSearchCommonFields, hasDGAccess) {
    if (_.isUndefined(formatPatientSearchCommonFields)) {
        formatPatientSearchCommonFields = true;
    }
    if (_.isUndefined(hasDGAccess)) {
        hasDGAccess = false;
    }
    var searchOptions = {
        'site': _.result(req, 'session.user.site', ''), //TODO: DE5961 - look and see if jds/jpid has any vistA identifiers for this user if ICN and then pt-select for sensitivity
        'searchString': patient.pid,
        'searchType': 'ICN'
    };
    if (patient.sensitive && !hasDGAccess) {
        patient = sensitivityUtils.hideSensitiveFields(patient);
        if (formatPatientSearchCommonFields) {
            formatSinglePatientSearchCommonFields(patient, hasDGAccess);
        }
        callback(patient);
        return;
    }
    req.logger.debug('global-search sensitive flag was missing or false; checking for it in JDS');
    searchJds.hasSensitivityFlag(req, searchOptions, req.app.config.jdsServer, function(err, sensitive) {
        req.logger.info('searchJds callback returned.');
        if (err) {
            req.logger.warn({
                error: err
            }, 'global-search received an unexpected response from JDS while checking for patient sensitivity');
            patient = sensitivityUtils.removeSensitiveFields(patient);
            if (formatPatientSearchCommonFields) {
                formatSinglePatientSearchCommonFields(patient, hasDGAccess);
            }
            callback(patient);
            return;
        }

        patient.sensitive = sensitive;
        if (patient.sensitive && !hasDGAccess) {
            patient = sensitivityUtils.hideSensitiveFields(patient);
        } else {
            patient = sensitivityUtils.removeSensitiveFields(patient);
        }
        if (formatPatientSearchCommonFields) {
            formatSinglePatientSearchCommonFields(patient, hasDGAccess);
        }
        callback(patient);
    });
}

function checkInvalidGlobalSearchParameters(params) {
    if ((params.lname === undefined) || (params.ssn === undefined && params.dob === undefined && params.fname === undefined)) {
        //invalid combination of parameters
        return 'At least two fields are required to perform a search. Last Name is required.';
    }
    var nameRegex = /^[- ,A-Z']+$/;
    var ssnRegex = /^(\d{3})-?(\d{2})-?(\d{4})$/;
    var dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

    if (!nameRegex.test(params.lname)) {
        //last name is empty or contains unknown characters
        if (params.lname.length === 0) {
            return 'Last Name is required.';
        } else {
            return 'Last Name contains illegal characters.';
        }
    }
    if (params.fname !== undefined && !nameRegex.test(params.fname)) {
        //first name is contains unknown characters
        return 'First Name contains illegal characters.';
    }
    if (params.ssn !== undefined && !ssnRegex.test(params.ssn)) {
        //ssn in unknown format
        return 'SSN is invalid.';
    }
    if (params.dob !== undefined) {
        if (dateRegex.test(params.dob)) {
            var dte = moment(params.dob, 'MM/DD/YYYY');
            if (!dte.isValid()) {
                //not a valid date
                return 'Date of Birth is not a valid date. It should be in MM/DD/YYYY format.';
            }
            params.dob = dte;
        } else {
            //date in incorrect format
            return 'Date of Birth needs to be in MM/DD/YYYY format.';
        }
    }
    return false;
}

function getMVISoapRequestHTTPConfig(req, queryParams, xml1305Files) {
    var query = '';
    var querySub = {};

    if (queryParams.ssn) {
        query += xml1305Files.xml1305SSN;
        querySub.ssn = queryParams.ssn.replace(/-/g, '');
    }
    if (queryParams.dob) {
        query += xml1305Files.xml1305DoB;
        querySub.dob = queryParams.dob.format(MVI_QUERY_DATE_FORMAT);
    }

    if (queryParams.fname || queryParams.lname) {
        if (queryParams.fname && queryParams.lname) {
            query += xml1305Files.xml1305FullName;
            querySub.lname = queryParams.lname;
            querySub.fname = queryParams.fname;
        } else if (queryParams.fname) {
            query += xml1305Files.xml1305FirstName;
            querySub.fname = queryParams.fname;
        } else {
            query += xml1305Files.xml1305LastName;
            querySub.lname = queryParams.lname;
        }
    }
    query = _s.sprintf(query, querySub);
    querySub = {
        firstname: req.session.user.firstname || '',
        lastname: req.session.user.lastname || '',
        query: query,
        sender: req.app.config.mvi.senderCode,
        msgID: crypto.randomBytes(8).toString('hex') //16 bit ID small enough to be easily spoofed
    };
    var soapRequest = _s.sprintf(xml1305Files.xml1305, querySub);
    var httpConfig = mvi.getMVIHttpConfig(req.app.config, req.logger);
    httpConfig.body = soapRequest;
    return httpConfig;
}

function getPatientDemographicWithICN(req, res, pid, callback) {
    var errorObj;
    req.logger.debug({
        patientPID: pid
    }, 'Get patient demographic info with global params invoked');
    if (_.isEmpty(req.session.globalSearchParams)) {
        req.logger.debug({
            patientPID: pid
        }, 'Session has no global params');
        errorObj = {
            'message': 'Session has no global params',
            'patientPID': pid,
            'status': 500
        };
        return callback(errorObj, null);
    }
    req.logger.debug({
        globalSearchParams: req.session.globalSearchParams
    }, 'Get patient demographic global search params');
    var errorMessage = checkInvalidGlobalSearchParameters(req.session.globalSearchParams);
    if (errorMessage) {
        return res.status(rdk.httpstatus.not_acceptable).rdkSend(errorMessage);
    }
    queryGlobalSearch(req.app.config, req.session.globalSearchParams, req, res, function(errCode, result) {
        if (errCode) {
            req.logger.error(result);
            return res.status(errCode).rdkSend(result);
        }
        parseGlobalSearchResults(throwAwaySoapEnvelope(result), req, function(parsedResults) {
            if (parsedResults.message && /Cannot connect to MVI/.test(parsedResults.message)) {
                errorObj = {
                    'message': 'Cannot connect to MVI',
                    'parsedResults': parsedResults,
                    'status': 500
                };
                return callback(errorObj, null);
            }
            if (!_.isObject(_.result(parsedResults, 'data', undefined))) {
                errorObj = {
                    'message': 'MVI Parsed Results yielded no data',
                    'parsedResults': parsedResults,
                    'status': 500
                };
                return callback(errorObj, null);
            }
            var pidID = pidValidator.isPidEdipi(pid) ? pid : pid.split(';')[1] || pid;
            var patientObject = _.find(parsedResults.data.items, {
                'pid': pidID
            });
            return callback(null, patientObject);
        }, false, true, false);
    });
}
