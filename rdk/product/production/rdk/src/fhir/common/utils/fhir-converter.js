'use strict';

var rdk = require('../../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');
var constants = require('./constants');
var moment = require('moment');

/**
 * This method creates a FHIR DateTime object from the given date.
 *
 * @param dDateTime The Date form of the date and time to be loaded.
 * @return
 */
function convertDate2FhirDateTime(dDateTime, ignoreTimeZone, ignoreMilliSeconds, siteHash) {

    if(nullchecker.isNullish(dDateTime)){
        return null;
    }

    var offset = getTimezoneOffset(dDateTime, siteHash);

    //When a date is created, it is created at the current local time and contains a timezone offset
    //Dates that came from VPR do not have timezones associated with, so a timezone lookup must occur
    //Convert to Zulu time by adding the offset to the current time
    dDateTime.setMinutes(dDateTime.getMinutes() + offset);

    return dateToZuluString(dDateTime, ignoreMilliSeconds);
}
module.exports.convertDate2FhirDateTime = convertDate2FhirDateTime;

/**
 * This method creates a FHIR Date object from the given date.
 *
 * @param dDateTime The Date form of the date and time to be loaded.
 * @return
 */
function convertDate2FhirDate(dDateTime) {
    var sFhirDateTime = null;

    if (nullchecker.isNotNullish(dDateTime)) {
        var d = dDateTime.getDate();
        var M = dDateTime.getMonth();
        var y = dDateTime.getFullYear();

        sFhirDateTime = y + '-' + (M < 10 ? '0' : '') + M + '-' + (d < 10 ? '0' : '') + d;

    }

    return sFhirDateTime;
}
module.exports.convertDate2FhirDate = convertDate2FhirDate;

function isValidDate(value) {
    var dateWrapper = new Date(value);
    return !isNaN(dateWrapper.getDate());
}

function isFhirDateFormat(sDateTime) {
    var bResult = false;

    if (nullchecker.isNotNullish(sDateTime)) {
        bResult = constants.fhir.REG_EXP_DATE.test(sDateTime);
    }

    return bResult;
}

function isFhirDateTimeFormat(sDateTime) {
    var bResult = false;

    if (nullchecker.isNotNullish(sDateTime)) {
        bResult = constants.fhir.REG_EXP_DATE_TIME.test(sDateTime);
    }

    return bResult;
}

function isHL7V2DateFormat(sDateTime) {
    var bResult = false;

    if (nullchecker.isNotNullish(sDateTime)) {
        bResult = constants.hl7v2.REG_EXP_DATE_FORMAT.test(sDateTime);
    }

    return bResult;
}

function isHL7V2DateTimeFormat(sDateTime) {
    var bResult = false;

    if (nullchecker.isNotNullish(sDateTime)) {
        bResult = constants.hl7v2.REG_EXP_DATE_TIME_FORMAT_COMBINED.test(sDateTime);
    }

    return bResult;
}

function convertHL7V2DateToFhirDateTime(sHL7Date) {
    var sFhirDateTime = '';

    if (isHL7V2DateFormat(sHL7Date)) {
        sFhirDateTime = sHL7Date.substring(0, 4) + '-' + sHL7Date.substring(4, 6) + '-' + sHL7Date.substring(6);
    }

    return sFhirDateTime;
}

function convertHL7V2DateTimeToFhirDateTime(sHL7Date, siteHash) {

    if (!(isHL7V2DateTimeFormat(sHL7Date))) {
        return '';
    }

    var sFhirDateTime = '';

    //The HL7 date is considered local time and does not have any timezone information associated with it.
    //This timezone offset should be determined and added to the local time to make it zulu time
    if (constants.hl7v2.REG_EXP_DATE_TIME_FORMAT_NO_SECONDS.test(sHL7Date)) {
        sFhirDateTime = sHL7Date.substring(0, 4) + '-' + sHL7Date.substring(4, 6) + '-' + sHL7Date.substring(6, 8) + 'T' + sHL7Date.substring(8, 10) + ':' + sHL7Date.substring(10) + ':00';
    } else if (constants.hl7v2.REG_EXP_DATE_TIME_FORMAT_WITH_SECONDS.test(sHL7Date)) {
        sFhirDateTime = sHL7Date.substring(0, 4) + '-' + sHL7Date.substring(4, 6) + '-' + sHL7Date.substring(6, 8) + 'T' + sHL7Date.substring(8, 10) + ':' + sHL7Date.substring(10, 12) + ':' + sHL7Date.substring(12);

    }

    var dDateTime = new Date(sFhirDateTime);

    //Since the HL7 date is passed in as a string, convert it into a date to apply date arithmetic

    //The date constructor does a good job of parsing the date string, however it assumes that the string is in UTC time and automatically
    //applies the local timezone offset from the date - which means the date object stores the hours in local time.  For example:

    //sHL7Date: 19940217161233
    //dDateTime: Thu Feb 17 1994 08:12:33 GMT-0800 (PST)

    //We dont want the date with the local offset because we are stripping away that value, so we need to add that time back to the date object
    dDateTime.setMinutes(dDateTime.getMinutes() + dDateTime.getTimezoneOffset());

    //At this point, the date object is storing the same value as the HL7Date string, but the timezone (which we don't need) is incorrect.

    //Look up the correct timezone offset information
    var offset = getTimezoneOffset(dDateTime, siteHash);

    //Add the correct offset back to the date object
    dDateTime.setMinutes(dDateTime.getMinutes() + offset);

    //The date object is now storing the correct values in each field (except the timezone)
    return dateToZuluString(dDateTime, true);
}

function dateToZuluString(dDateTime, ignoreMilliSeconds){
    //This method assumes that a the local time stored in the date object is in zulu time, and that the offset should be ignored

    if(!(isValidDate(dDateTime))){
        return '';
    }

    //Strip out the field values and build the FHIR string
    var d = dDateTime.getDate();
    var M = dDateTime.getMonth() + 1;               //Valid months are 0-11
    var y = dDateTime.getFullYear();
    var H = dDateTime.getHours();
    var m = dDateTime.getMinutes();
    var s = dDateTime.getSeconds();
    var ms = dDateTime.getMilliseconds();

    var sFhirDateTime = y + '-' + (M < 10 ? '0' : '') + M + '-' + (d < 10 ? '0' : '') + d + 'T' + (H < 10 ? '0' : '') + H + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    if (nullchecker.isNullish(ignoreMilliSeconds) || ignoreMilliSeconds !== true) {
        sFhirDateTime += '.' + (ms < 100 ? '0' : '') + (ms < 10 ? '0' : '') + ms;
    }
    sFhirDateTime += 'Z';

    return sFhirDateTime;
}

function convertDateToHL7V2(date, includeSeconds, ignoreTime) {
    // ISO 8601 follows this format: 2015-01-26T01:23:45.000Z
    // HL7V2 is similar to ISO 8601 but without decorating dashes, colons and no T between date and time.
    var substringLength = 14; //ex: '20150901191801'

    if(ignoreTime) {
        substringLength = 8; //ex: '20150901'
    } else if(!includeSeconds) {
        substringLength = 12;
    }

    return date.toISOString().replace(/-|:|T|\.|Z/g, '').substring(0, substringLength);
}
module.exports.convertDateToHL7V2 = convertDateToHL7V2;

//Parses a VPR site hash out of an item's UID
function getSiteHash(uid){
    if(uid){
        var splitUid = uid.split(':');
        if(splitUid.length >= 4){
            return splitUid[3];
        }
    }
    return null;
}
module.exports.getSiteHash = getSiteHash;

function convertToFhirDateTime(sDateTime, siteHash) {
    //siteHash is optional - if present, the site will be used to determine and set the timezone

    if (sDateTime === undefined) {
        return undefined;
    }

    var sFhirDateTime = null;

    if (nullchecker.isNotNullish(sDateTime)) {

        if (isValidDate(sDateTime)) {
            sFhirDateTime = convertDate2FhirDateTime(new Date(sDateTime), siteHash);
        } else if ((isFhirDateFormat(sDateTime)) || (isFhirDateTimeFormat(sDateTime))) {
            sFhirDateTime = sDateTime;
        } else if (isHL7V2DateFormat(sDateTime)) {
            sFhirDateTime = convertHL7V2DateToFhirDateTime(sDateTime);
        } else if (isHL7V2DateTimeFormat(sDateTime)) {
            sFhirDateTime = convertHL7V2DateTimeToFhirDateTime(sDateTime, siteHash);
        }
    }

    return sFhirDateTime;
}
module.exports.convertToFhirDateTime = convertToFhirDateTime;

function findExtension(extensions, url) {
    var found = _.find(extensions, function(ext) {
        return ext.url === url;
    });

    return found;
}
module.exports.findExtension = findExtension;

function getExtensionValue(extensions, url) {
    var ext = extensions;
    if (nullchecker.isNotNullish(url)) {
        ext = findExtension(extensions, url);
    }
    if (nullchecker.isNotNullish(ext)) {
        for (var prop in ext) {
            if (prop.indexOf('value') === 0) {
                return ext[prop];
            }
        }
    }

    return undefined;
}
module.exports.getExtensionValue = getExtensionValue;

function removeDivFromText(text) {
    var noDiv = text;
    if (noDiv.indexOf('<div>') === 0) {
        noDiv = noDiv.substring(5);
        if (noDiv.lastIndexOf('</div>') === noDiv.length - 6) {
            noDiv = noDiv.substring(0, noDiv.length - 6);
        }
    }
    return noDiv;
}
module.exports.removeDivFromText = removeDivFromText;

function generateReferenceMeaning(vitalSign) {
    var vitalSignRange = {};
    switch (vitalSign) {
        case 'TEMPERATURE':
            {
                vitalSignRange = {
                    'system': 'http://snomed.info/id',
                    'code': '87273009',
                    'display': 'Normal Temperature'
                };
            }
            break;
        case 'RESPIRATION':
            {
                vitalSignRange = {
                    'system': 'http://snomed.info/id',
                    'code': '276888009',
                    'display': 'Normal spontaneous respiration'
                };
            }
            break;
        case 'PULSE':
            {
                vitalSignRange = {
                    'system': 'http://snomed.info/id',
                    'code': '12146004',
                    'display': 'Normal Pulse'
                };
            }
            break;
        case 'HEIGHT':
            {
                vitalSignRange = {
                    'system': 'http://snomed.info/id',
                    'code': '309534003',
                    'display': 'Normal Height'
                };
            }
            break;
        case 'WEIGHT':
            {
                vitalSignRange = {
                    'system': 'http://snomed.info/id',
                    'code': '43664005',
                    'display': 'Normal Weight'
                };
            }
            break;
        case 'CENTRAL VENOUS PRESSURE':
            {
                vitalSignRange = {
                    'system': 'http://snomed.info/id',
                    'code': '91297005',
                    'display': 'Normal central venous pressure'
                };
            }
            break;
        case 'CIRCUMFERENCE/GIRTH':
            {
                vitalSignRange = {
                    'system': 'http://snomed.info/id',
                    'code': '53461003',
                    'display': 'Normal Size'
                };
            }
            break;
        case 'PULSE OXIMETRY':
            {
                vitalSignRange = {
                    'system': 'http://snomed.info/id',
                    'code': '167025001',
                    'display': 'Blood oxygen level normal'
                };
            }
            break;
        case 'PAIN':
            {
                vitalSignRange = {
                    'system': 'http://snomed.info/id',
                    'code': '163729003',
                    'display': 'Pain sensation normal'
                };
            }
            break;
        case 'BLOOD PRESSURE SYSTOLIC':
            {
                vitalSignRange = {
                    'system': 'http://snomed.info/id',
                    'code': '12929001',
                    'display': 'Normal systolic arterial pressure'
                };
            }
            break;
        case 'BLOOD PRESSURE DIASTOLIC':
            {
                vitalSignRange = {
                    'system': 'http://snomed.info/id',
                    'code': '53813002',
                    'display': 'Normal diastolic arterial pressure'
                };
            }
            break;
    }
    return vitalSignRange;
}

module.exports.generateReferenceMeaning = generateReferenceMeaning;

function generateResultMeaning(vitalSign) {
    var vitalSignResultRange = {};
    switch (vitalSign) {
        case 'BLOOD PRESSURE SYSTOLIC':
            {
                vitalSignResultRange = {
                    'system': 'http://loinc.org',
                    'code': '8480-6',
                    'display': 'Systolic blood pressure'
                };
            }
            break;
        case 'BLOOD PRESSURE DIASTOLIC':
            {
                vitalSignResultRange = {
                    'system': 'http://loinc.org',
                    'code': '8462-4',
                    'display': 'Diastolic blood pressure'
                };
            }
            break;
    }
    return vitalSignResultRange;
}

module.exports.generateResultMeaning = generateResultMeaning;

function generateMonthName(month) {
    var monthResult = '';
    switch (month) {
        case '01':
            {
                monthResult = 'Jan';
            }
            break;
        case '02':
            {
                monthResult = 'Feb';
            }
            break;
        case '03':
            {
                monthResult = 'Mar';
            }
            break;
        case '04':
            {
                monthResult = 'Apr';
            }
            break;
        case '05':
            {
                monthResult = 'May';
            }
            break;
        case '06':
            {
                monthResult = 'Jun';
            }
            break;
        case '07':
            {
                monthResult = 'Jul';
            }
            break;
        case '08':
            {
                monthResult = 'Aug';
            }
            break;
        case '09':
            {
                monthResult = 'Sep';
            }
            break;
        case '10':
            {
                monthResult = 'Oct';
            }
            break;
        case '11':
            {
                monthResult = 'Nov';
            }
            break;
        case '12':
            {
                monthResult = 'Dec';
            }
            break;

    }
    return monthResult;
}

module.exports.generateMonthName = generateMonthName;

function generateMonth(date) {
    return date.getMonth() + 1;
}

module.exports.generateMonth = generateMonth;

function getTimezoneOffset(date, siteHash){

    //Site hash is not known
    if(!siteHash){
        if(moment.isDate(date)){
            return date.getTimezoneOffset();
        }
    }
    else{
        var hourOffset = rdk.siteTimzonesConfig[siteHash] || 'unknown';

        //Site hash is known
        if(!moment.isDate(date) && !moment.isMoment(date)){
            //siteHash is known but date is not - create a new date object to determine if it is currently DST
            date = new Date();
        }

        if(hourOffset === 'unknown'){
            //Site timezone is not known, use server timezone (DST is already factored into this method)
            return date.getTimezoneOffset();
        }

        //Check if daylight savings is in effect & adjust accordingly
        if(moment(date).isDST()){
            hourOffset = hourOffset + 1;
        }

        //Note from Date.getTimezoneOffset() documentation:
        //The time-zone offset is the difference, in minutes, between UTC and local time. Note that this means that the offset is positive if the 
        //local timezone is behind UTC and negative if it is ahead. For example, if your time zone is UTC+10 (Australian Eastern Standard Time), -600 
        //will be returned. Daylight saving time prevents this value from being a constant even for a given locale.
        return hourOffset * -60;                     //Convert to minutes
    }
    return new Date().getTimezoneOffset();
}

module.exports.getTimezoneOffset = getTimezoneOffset;

