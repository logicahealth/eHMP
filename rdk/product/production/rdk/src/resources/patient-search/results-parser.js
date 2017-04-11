'use strict';
var _ = require('lodash');
var moment = require('moment');
var nc = require('namecase');
var rdk = require('../../core/rdk');
var pidValidator = rdk.utils.pidValidator;
var maskSsn = require('./search-mask-ssn').maskSsn;
var SOCIAL_NINE_NUMBERS = 9;
var SOCIAL_ELEVEN_NUMBERS = 11;

module.exports.formatSinglePatientSearchCommonFields = formatSinglePatientSearchCommonFields;
module.exports.formatName = formatName;

module.exports.transformPatient = function(patient, fromJDS) {
    //identify data source
    //looking for local, non-local, vista, or dod as values
    if (patient.id) {
        var idParts = patient.id.split('^');
        switch (idParts.length) {
            case 5:
            case 4:
                patient.facility = idParts[2]; //facility
                patient.dataSource = idParts[3]; //patient identifier authority = DOD or USVHA
                /* falls through */
            case 2:
                patient.pid = idParts[0]; //id value
                patient.idType = idParts[1]; //PI = Patient, EI = Employee, NI = National, PN = PersonNumber
                break;
            default:
                patient.pid = patient.id;
        }
        patient.idClass = determineIDType(patient.id);
        if (patient.idClass === 'DFN') {
            patient.pid = patient.facility + ';' + patient.pid;
        }
    }

    var givenNameDisplayParts = [];
    if (patient.fullName && (!patient.familyName || !patient.givenNames)) {
        var name = patient.fullName.split(',');
        patient.familyName = name[0];
        patient.givenNames = name[1];
        givenNameDisplayParts.push(patient.givenNames);
    } else if (patient.familyName && patient.givenNames && !patient.fullName) {
        //put first name together
        givenNameDisplayParts = givenNameDisplayParts.concat(patient.givenNames);
        if (_.isArray(patient.givenNames)) {
            patient.givenNames = patient.givenNames.join(' ');
        }
        patient.fullName = patient.familyName + ',' + patient.givenNames;
    }
    if (patient.fullName && !patient.displayName) {
        patient.displayName = nc(patient.familyName) + ',' + _.map(givenNameDisplayParts, nc).join(' ');
    }

    if (patient.birthDate) {
        //calculate age
        patient.age = moment().diff(moment(patient.birthDate, 'YYYYMMDD'), 'years');
    }
    if (!_.isUndefined(fromJDS) && fromJDS === true && patient.pid) {
        patient.summary = patient.displayName;
        if (!pidValidator.isIcn(patient.pid) &&
            !pidValidator.isPidEdipi(patient.pid)) {
            var pidParts = patient.pid.split(';');
            if (pidValidator.isIcn(pidParts[1])) {
                patient.pid = pidParts[1];
            }
        }
    }
    if (patient.genderCode) {
        if (patient.genderCode.length > 2) {
            var genderParts = patient.genderCode.split(':');
            patient.genderCode = genderParts[genderParts.length - 1];
        }

        //expand gender
        if (patient.genderCode && !patient.genderName) {
            switch (patient.genderCode) {
                case 'M':
                    patient.genderName = 'Male';
                    break;
                case 'F':
                    patient.genderName = 'Female';
                    break;
                case 'UN':
                    patient.genderName = 'Undifferentiated';
                    break;
                default:
                    patient.genderName = 'Unknown';
            }
        } else if (patient.genderName && patient.genderName.length > 1) {
            patient.genderName = patient.genderName.substring(0, 1) + patient.genderName.slice(1).toLowerCase();
        }
    }

    if (patient.address) {
        _.each(patient.address, function(address) {
            if (address.use && address.use === 'PHYS') {
                address.use = 'H';
            }
        });
    }

    if (patient.telecom) {
        _.each(patient.telecom, function(telecom) {
            if (telecom.use && telecom.use === 'HP') {
                telecom.use = 'H';
            }
        });
    }

    return patient;
};

/**
 * Applies formatting to a subset of patient data fields for a group of patients.
 *
 * @param {Object} patients - The group of patients whose data needs to be formatted.
 * @param {boolean} hasDGAccess - Whether or not the user has DG Access.
 * @return {Object} patients - The patients, with formatting applied.
 */
module.exports.formatPatientSearchCommonFields = function(patients, hasDGAccess) {
    var items = ((patients || {}).data || {}).items || patients || [];
    _.each(items, function(item) {
        formatSinglePatientSearchCommonFields(item, hasDGAccess);
    });
    return patients;
};

/**
 * Applies formatting to a subset of patient data fields for a single patient.
 *
 * @param {Object} patient - The patient whose data needs to be formatted.
 * @param {boolean} hasDGAccess - Whether or not the user has DG Access.
 * @param {boolean} forceFormatting - Whether or not to bypass formatting restrictions.
 * @return {Object} patient - The patient, with formatting applied.
 */
function formatSinglePatientSearchCommonFields(patient, hasDGAccess, forceFormatting) {
    if (_.isUndefined(forceFormatting)) {
        forceFormatting = false;
    }
    patient.displayName = formatName(patient.displayName, ',', ', ');

    // Don't format "*SENSITIVE*" values (User with DGSensitiveAccess will cause
    // sensitive patient ssn and birthDate to not have "*SENSITIVE*" values)
    if (!patient.ssn || typeof patient.ssn !== 'string' || (patient.sensitive && !hasDGAccess && !forceFormatting)) {
        return patient;
    }
    patient.age = getAge(patient.birthDate);
    patient.ssn = formatSSN(patient.ssn);
    patient.birthDate = formatDate(patient.birthDate);
    var maskedSsn = maskSsn(patient.ssn);
    patient.ssn = maskedSsn;
    return patient;
}

/**
 * Formats an SSN. Places hyphens in the desired location.
 *
 * @param {string} ssn - The ssn to format.
 * @return {string} returnSSN - The hyphenated SSN, or an empty string if the
 *                  SSN couldn't be formatted.
 */
function formatSSN(ssn) {
    if (ssn) {
        var returnSSN = ssn;
        if (ssn.length === SOCIAL_NINE_NUMBERS || ssn.length === SOCIAL_ELEVEN_NUMBERS) {
            returnSSN = ssn.replace('-', '');
            returnSSN = returnSSN.substring(0, 3).concat('-').concat(returnSSN.substring(3, 5)).concat('-').concat(returnSSN.substring(5));
        }
        return returnSSN;
    }
    return '';
}

/**
 * Formats a date into MM/DD/YYYY format.
 *
 * @param {string} date - The date to format.
 * @return {string} The formatted date, or an empty string if the
 *                  date couldn't be formatted.
 */
function formatDate(date) {
    var displayFormat = 'MM/DD/YYYY';
    if (date) {
        return moment(date).format(displayFormat);
    }
    return '';
}

/**
 * Calculates an age given a date of birth.
 *
 * @param {string} dob - The date of birth.
 * @return {string} The calculated age, or an empty string if the
 *                  age couldn't be calculated.
 */
function getAge(dob) {
    if (dob) {
        var dobString = moment(dob);
        return moment().diff(dobString, 'years');
    }
    return '';
}

function formatName(nameString, character, replaceCharacter) {
    if (nameString && character) {
        if (replaceCharacter) {
            return nameString.replace(character, replaceCharacter);
        }
        return nameString.replace(character, character + ' ');
    }
    return '';
}

function retrieveObjFromTree(obj, path) {
    var objRef = obj;
    if (!_.isArray(path) || obj === null) {
        return objRef;
    }
    for (var index = 0; index < path.length; index++) {
        if (_.isArray(objRef) && _.isNumber(path[index])) {
            if (path[index] < objRef.length) {
                objRef = objRef[path[index]];
            } else {
                break;
            }
        } else if (_.isObject(objRef) && _.isString(path[index])) {
            if (_.has(objRef, path[index])) {
                objRef = objRef[path[index]];
            } else {
                var re = new RegExp('.*' + path[index] + '.*');
                var found = false;
                for (var key in objRef) {
                    if (re.test(key)) {
                        objRef = objRef[key];
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    break;
                }
            }
        } else {
            break;
        }
    }
    return objRef;
}

var soapEnvelopeContentsPath = ['Envelope', 'Body', 0, 'PRPA_IN201306UV02', 0];
module.exports.throwAwaySoapEnvelope = function(obj) {
    return retrieveObjFromTree(obj, soapEnvelopeContentsPath);
};

var soapEnvelopeSyncContentsPath = ['Envelope', 'Body', 0, 'PRPA_IN201310UV02', 0];
module.exports.throwAwaySyncSoapEnvelope = function(obj) {
    return retrieveObjFromTree(obj, soapEnvelopeSyncContentsPath);
};

var responseCodePath = ['controlActProcess', 0, 'queryAck', 0, 'queryResponseCode', 0, '$', 'code'];
module.exports.getResponseCode = function(obj) {
    return retrieveObjFromTree(obj, responseCodePath);
};

var typeCodePath = ['acknowledgement', 0, 'typeCode', 0, '$', 'code'];
module.exports.getTypeCode = function(obj) {
    return retrieveObjFromTree(obj, typeCodePath);
};

var acknowledgementDetailPath = ['acknowledgement', 0, 'acknowledgementDetail', 0, 'text', 0];
module.exports.getAcknowledgementDetail = function(obj) {
    return retrieveObjFromTree(obj, acknowledgementDetailPath);
};

var patientPersonPath = ['registrationEvent', 0, 'subject1', 0, 'patient', 0, 'patientPerson', 0];
module.exports.getPatientPerson = function(obj) {
    return retrieveObjFromTree(obj, patientPersonPath);
};

var patientIdPath = ['registrationEvent', 0, 'subject1', 0, 'patient', 0, 'id', 0, '$', 'extension'];
module.exports.getPatientId = function(obj) {
    return retrieveObjFromTree(obj, patientIdPath);
};

module.exports.merge = function(obj1, obj2) {
    var obj = {};
    mergeRecursive(obj, obj1);
    mergeRecursive(obj, obj2);
    return obj;
};

function mergeRecursive(obj1, obj2) {
    for (var p in obj2) {
        if (obj2.hasOwnProperty(p)) {
            try {
                // Property in destination object set; update its value.
                if (obj2[p].constructor === Object) {
                    obj1[p] = mergeRecursive(obj1[p], obj2[p]);
                } else {
                    obj1[p] = obj2[p];
                }
            } catch (e) {
                // Property in destination object not set; create it and set its value.
                obj1[p] = obj2[p];
            }
        }
    }
    return obj1;
}

function determineIDType(mviID) {
    var idParts = mviID.split('^');
    var dfnType = /PI\^[A-Z0-9]{4}\^USVHA/g;
    if (idParts[3] && idParts[3] === 'USSSA' && idParts[0].length === 9) {
        return 'SSN';
    } else if (mviID.match(dfnType)) {
        return 'DFN';
    } else if (idParts[1] && idParts[1] === 'NI') {
        if (idParts[3] && idParts[3] === 'USVHA') {
            return 'ICN';
        } else if (idParts[3] && idParts[3] === 'USDOD') {
            return 'EDIPI';
        } else {
            return 'Unknown';
        }
    } else if (idParts[1] && idParts[1] === 'PI') {
        if (idParts[3] && idParts[3] === 'USVHA' && idParts[2] === '742V1') {
            return 'VHIC';
        } else {
            return 'Unknown';
        }
    } else {
        return 'Unknown';
    }
}

module.exports.determineIDType = determineIDType;

module.exports.retrieveObjFromTree = retrieveObjFromTree;
