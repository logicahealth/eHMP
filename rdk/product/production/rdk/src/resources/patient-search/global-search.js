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

module.exports._getPatientDemographicWithICN = getPatientDemographicWithICN;
// below: _ exports for unit testing only
module.exports._checkInvalidGlobalSearchParameters = checkInvalidGlobalSearchParameters;
module.exports._parseGlobalSearchResults = parseGlobalSearchResults;
module.exports._queryGlobalSearch = queryGlobalSearch;
module.exports._getGlobalSearchParams = getGlobalSearchParams;

var MVI_QUERY_DATE_FORMAT = 'YYYYMMDD';
var xml_1305_ssn = fs.readFileSync(__dirname + '/xml/1305-ssn.xml').toString();
var xml_1305_dob = fs.readFileSync(__dirname + '/xml/1305-dob.xml').toString();
var xml_1305_fullName = fs.readFileSync(__dirname + '/xml/1305-fullName.xml').toString();
var xml_1305_firstName = fs.readFileSync(__dirname + '/xml/1305-firstName.xml').toString();
var xml_1305_lastName = fs.readFileSync(__dirname + '/xml/1305-lastName.xml').toString();
var xml_1305 = fs.readFileSync(__dirname + '/xml/1305.xml').toString();

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
        res.status(rdk.httpstatus.not_acceptable).rdkSend(errorMessage);
    } else {
        queryGlobalSearch(config, params, req, res, function(errCode, result) {
            if (errCode) {
                req.logger.error(result);
                res.status(errCode).rdkSend(result);
                return;
            }

            parseGlobalSearchResults(throwAwaySoapEnvelope(result), req, function(toSend) {
                res.rdkSend(toSend);
            });
        });
    }
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

function queryGlobalSearch(config, queryParams, request, response, next) {
    var httpConfig = getMVISoapRequestHTTPConfig(request, queryParams);
    try {
        http.post(httpConfig, function(error, resp, data) {
            if (error) {
                next(500, {
                    'data': {
                        'items': []
                    },
                    message: 'Cannot connect to MVI.'
                });
                return;
            } else {
                parseString(data, function(err, result) {
                    if (!err) {
                        request.logger.trace({
                            result: result
                        }, 'MVI Result');
                        next(null, result);
                    } else {
                        request.logger.debug(util.inspect(err));
                        var statusCode = resp.statusCode >= 300 ? resp.statusCode : 500;
                        next(statusCode, err);
                    }
                    return;
                });
            }
        });
    } catch (err) {
        // BH: Note that this error won't appear in the stderr log, because it's caught. (Should we throw it?)
        next(500, {
            'data': {
                'items': []
            },
            message: 'Cannot connect to MVI.'
        });
    }
}


function parseGlobalSearchResults(results, request, callback, isSSNMasked, checkPatientSensitivity, formatPatientSearchCommonFields) {
    try {
        var msg = '';
        var acknowledgementDetail = '';
        var patientList = [];
        var responseCode = searchUtil.getResponseCode(results);
        if (_.isUndefined(isSSNMasked)) {
            isSSNMasked = true;
        }
        if (_.isUndefined(checkPatientSensitivity)) {
            checkPatientSensitivity = true;
        }
        if (_.isUndefined(formatPatientSearchCommonFields)) {
            formatPatientSearchCommonFields = true;
        }
        if (responseCode !== undefined && responseCode.length > 0) {
            if (responseCode === mviResponseCodes.tooManyResults) {
                msg = 'Search returned too many results please refine your search criteria and try again.';
                callback({
                    'data': {
                        'items': []
                    },
                    'msg': msg
                });
                return;
            }
            if (responseCode === mviResponseCodes.noResultsFound) {
                msg = 'No results were found.';
                callback({
                    'data': {
                        'items': []
                    },
                    'msg': msg
                });
                return;
            }
            if (responseCode === mviResponseCodes.mviApplicationError) {
                var typeCode = searchUtil.getTypeCode(results);
                if (typeCode === mviResponseCodes.applicationErrorTypeCodes.systemError) {
                    acknowledgementDetail = searchUtil.getAcknowledgementDetail(results);
                    request.logger.warn('The VA MVI Application experienced a system error: %s', acknowledgementDetail);
                    msg = 'The VA MVI Application experienced a system error. Please try again later.';
                    callback({
                        'data': {
                            'items': []
                        },
                        'msg': msg
                    });
                    return;
                } else {
                    acknowledgementDetail = searchUtil.getAcknowledgementDetail(results);
                    request.logger.warn('No results were found due to a VA MVI Application or Data error: %s', acknowledgementDetail);
                    msg = 'No results were found due to a VA MVI Application or Data error. Please modify your search and try again.';
                    callback({
                        'data': {
                            'items': []
                        },
                        'msg': msg
                    });
                    return;
                }
            }
        }

        var doCallback = function(cb, patientListForCallback, msgForCallback) {
            var objForCallback = {
                'data': {
                    'items': patientListForCallback
                },
                'msg': msgForCallback
            };
            return isSSNMasked ? cb(maskPtSelectSsn(objForCallback)) : cb(objForCallback);
        };

        var patients = results.controlActProcess[0].subject;
        if (patients !== null && patients !== undefined) {
            if (_.isArray(patients)) {
                async.eachSeries(patients, function(data, cb) {
                    parseGlobalPatient(data, request, function(patient) {
                        patientList.push(patient);
                        setImmediate(cb);
                    }, checkPatientSensitivity, formatPatientSearchCommonFields);
                }, function(err) {
                    if (err) {
                        request.logger.error(err);
                        callback({
                            'msg': 'Unable to parse response from MVI.'
                        });
                        return;
                    }

                    doCallback(callback, patientList, msg);
                });
            } else {
                parseGlobalPatient(patients, request, function(patient) {
                    patientList.push(patient);
                    doCallback(callback, patientList, msg);
                }, checkPatientSensitivity, formatPatientSearchCommonFields);
            }
        } else {
            doCallback(callback, [], 'No results were found.');
        }
    } catch (e) {
        // BH: Note that this error won't appear in the stderr log, because it's caught. (Should we throw it?)
        request.logger.error(e);
        callback({
            'msg': 'Cannot connect to MVI.'
        });
    }
}

function parseGlobalPatient(searchResult, request, callback, checkPatientSensitivity, formatPatientSearchCommonFields) {
    var patient = {};
    var patientPerson = searchUtil.getPatientPerson(searchResult);
    var patientName = patientPerson.name;
    var hasDGAccess = _.result(request, 'session.user.dgSensitiveAccess', 'false') === 'true';
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
        request.logger.warn('No Name record with use as L found for this patient. Putting Unknown in First and Last Name.');
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
        request.logger.warn('No SSN found in the MVI record that was returned.');
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

    if (checkPatientSensitivity) {
        return setPatientSensitivity(request, patient, callback, formatPatientSearchCommonFields, hasDGAccess);
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
        'site': _.result(req, 'session.user.site'),
        'searchString': patient.pid,
        'searchType': 'PID'
    };
    if (patient.sensitive && !hasDGAccess) {
        patient = sensitivityUtils.hideSensitiveFields(patient)
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

function getMVISoapRequestHTTPConfig(req, queryParams) {
    var query = '';
    var querySub = {};

    if (queryParams.ssn) {
        query += xml_1305_ssn;
        querySub.ssn = queryParams.ssn.replace(/-/g, '');
    }
    if (queryParams.dob) {
        query += xml_1305_dob;
        querySub.dob = queryParams.dob.format(MVI_QUERY_DATE_FORMAT);
    }

    if (queryParams.fname || queryParams.lname) {
        if (queryParams.fname && queryParams.lname) {
            query += xml_1305_fullName;
            querySub.lname = queryParams.lname;
            querySub.fname = queryParams.fname;
        } else if (queryParams.fname) {
            query += xml_1305_firstName;
            querySub.fname = queryParams.fname;
        } else {
            query += xml_1305_lastName;
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
    var soapRequest = _s.sprintf(xml_1305, querySub);
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
    }, "Get patient demographic global search params");
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
            if (parsedResults.msg && /Cannot connect to MVI/.test(parsedResults.msg)) {
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
            var pidID = pid.split(';')[1] || pid;
            var patientObject = _.find(parsedResults.data.items, {
                'pid': pidID
            });
            return callback(null, patientObject);
        }, false, true, false);
    });
}