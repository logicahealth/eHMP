'use strict';

var _ = require('lodash');

/**
 * Class for parsing and formatting VA FileMan Dates and Date/Times. <p/> FileMan stores dates and date/times of the
 * form "YYYMMDD.HHMMSS", where: <ul> <li>YYY is number of years since 1700 (hence always 3 digits)</li> <li>MM is month
 * number (00-12)</li> <li>DD is day number (00-31)</li> <li>HH is hour number (00-23)</li> <li>MM is minute number
 * (01-59)</li> <li>SS is the seconds number (01-59)</li> </ul> <p>This format allows for representation of imprecise
 * dates like JULY '78 or 1978 (which would be equivalent to 2780700 and 2780000, respectively). Dates are always
 * returned as a canonic number (no trailing zeroes after the decimal).  This implies that if there are any digits after
 * the decimal we are dealing with an implicitly precise date/time with millisecond precision.</p>
 */

var YEARS_PER_CENTURY = 100;
var BASE_CENTURY = 17;

/**
 * Returns a VPR formated date/time string given a FileMan date/time string
 *
 * @param fmDate FileMan date/time string
 * @return The VPR formatted date/time corresponding to fmDate
 */
function getVprDateTime(fmDate) {
    /*
     * Parsing incoming double to string and splitting date and time on the decimal point to avoid
     * the binary architecture issue with floating point numbers, as already seen in the case of time's "13:39" and "15:39" (hh:mm)
     */
    var returnStr = '';
    var strDate = '' + fmDate;
    var spltDate = strDate.split('.');
    var date = spltDate[0];
    var fmYear = Math.floor(date / 1e4) + 1700,
        fmMonth = ('0' + Math.floor((date % 1e4) / 1e2)).slice(-2),
        fmDay = ('0' + Math.floor((date % 1e2))).slice(-2);
    returnStr += fmYear + fmMonth + fmDay;
    //Has a time component on the incoming datetime
    if (spltDate.length > 1) {
        //Guaranteeing we have seconds, minutes, and hours to parse
        var time = (spltDate[1] + '000000').slice(0, 6);
        var fmHour = ('0' + Math.floor((time / 1e4))).slice(-2),
            fmMin = ('0' + Math.floor((time % 1e4) / 1e2)).slice(-2),
            fmSec = ('0' + Math.floor((time % 1e6))).slice(-2);
        returnStr += fmHour + fmMin + fmSec;
    } else {
        returnStr += '000000';
    }
    return returnStr;
}

/**
 *  Returns the three digit year as a number given a numerical date
 *
 *  @param year Numerical representation of a year
 *  @return The three digit year as a number
 */
function getThreeDigitYear(year) {
    if (isNaN(year)) {
        return -1;
    }

    if (year < 0) {
        year = year * -1;
    }

    var century = Math.floor(year / YEARS_PER_CENTURY);
    century -= BASE_CENTURY;
    century *= YEARS_PER_CENTURY;
    return century + (year % YEARS_PER_CENTURY);
}

/**
 *  Returns a string date and time in fileman format given a date object
 *
 *  @param date A date object to be converted to a fileman formatted date and time
 *  @return A string representation of a date and time in fileman format
 */
function getFilemanDateTime(date) {
    var filemanDate = getFilemanDate(date);

    if (filemanDate === -1) {
        return -1;
    }

    return filemanDate + '.' + ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2);
}

/**
 *  Returns a string date and time, including seconds, in fileman format given a date object
 *
 *  @param date A date object to be converted to a fileman formatted date and time
 *  @return A string representation of a date and time in fileman format
 */
function getFilemanDateTimeWithSeconds(date) {
    var filemanDate = getFilemanDate(date);

    if (filemanDate === -1) {
        return -1;
    }

    return filemanDate + '.' + ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2) + ('0' + date.getSeconds()).slice(-2);
}

/**
 *  Returns a string date in fileman format given a date object
 *
 *  @param date A date object to be converted to a fileman formatted date
 *  @return A string representation of a date in fileman format
 */
function getFilemanDate(date) {
    var threeDigitYear = getThreeDigitYear(date.getFullYear());

    if (threeDigitYear === -1) {
        return -1;
    }

    return threeDigitYear.toString() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2);
}

/**
 *  Returns a string date in fileman format given a date string in the format of YYYYMMDD[HHMMSS]
 *
 *  @param dateAsString A string date in the format of YYYYMMDDHHMMSS or YYYYMMDD
 *  @return A string representation of a date in fileman format
 */
function getFilemanDateWithArgAsStr(dateAsString) {
    var year = dateAsString.toString().slice(0, 4);
    var monthDate = dateAsString.toString().slice(4, 8);
    monthDate = _.padRight(monthDate, 4, '0');
    var time = dateAsString.toString().slice(8);
    time = _.trimRight(time, '0');
    var threeDigitYear = getThreeDigitYear(parseInt(year));

    if (threeDigitYear === -1) {
        return -1;
    }

    var filemanDate = threeDigitYear.toString() + monthDate;
    if (time) {
        filemanDate += '.' + time;
    }
    return filemanDate;
}
module.exports.getFilemanDateTimeWithSeconds = getFilemanDateTimeWithSeconds;
module.exports.getThreeDigitYear = getThreeDigitYear;
module.exports.getFilemanDateTime = getFilemanDateTime;
module.exports.getFilemanDate = getFilemanDate;
module.exports.getFilemanDateWithArgAsStr = getFilemanDateWithArgAsStr;
module.exports.getVprDateTime = getVprDateTime;
