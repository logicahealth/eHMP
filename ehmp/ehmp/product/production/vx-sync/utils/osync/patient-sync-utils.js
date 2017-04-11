'use strict';

var _ = require('lodash');
var nullUtil = require(global.VX_UTILS + 'null-utils');
var async = require('async');

/**
 * Takes the given string, splits it via the ^ and obtains dfn, date, locationName, roomBed, and locationIen from that information.
 *
 * @param log A logger.
 * @param str The string to split.
 * @param callback A function to call with the results or any error message.
 */
function parseRpcResponseAdmission(log, str, callback) {
    var arr = str.split('^');
    if (arr.length < 5) {
        log.warn('Found a line containing incomplete admission data in RPC response: ' + str);
        return callback(null, null); // Don't pass an error to callback -- we want to look at the rest of the list.
    }

    var response = {
        dfn: arr[0],
        date: arr[1],
        locationName: arr[2],
        roomBed: arr[3],
        locationIen: arr[4]
    };

    if (!response.dfn) {
        log.warn('Found admission data with no DFN in RPC response: ' + str);
        return callback(null, null); // Don't pass an error to callback -- we want to look at the rest of the list.
    }

    callback(null, response);
}

/**
 * Takes the given string, splits it via the ^ and obtains dfn, date, locationName, and locationIen from that information.
 *
 * @param log A logger.
 * @param str The string to parse.
 * @param clinics An array of clinics.
 * @param callback A function to call with the results or any error message.
 */
function parseRpcResponseAppointment(log, str, clinics, callback) {
    var arr = str.split('^');

    if (arr.length < 4) {
        log.warn('Found a line containing incomplete appointment data in RPC response: ' + str);
        return callback(null, null); // Don't pass an error to callback -- we want to look at the rest of the list.
    }

    var response = null;

    // check if appointment is in the clinic
    if ((clinics.length === 1 && clinics[0].toLowerCase() === 'all') || _.contains(clinics, arr[3])) {
        response = {
            dfn: arr[0],
            date: arr[1],
            locationName: arr[2],
            locationIen: arr[3]
        };
    } else {
        return callback(null, null);
    }

    if (!response.dfn) {
        log.warn('Found appointment data with no DFN in RPC response: ' + str);
        return callback(null, null); // Don't pass an error to callback -- we want to look at the rest of the list.
    }

    callback(null, response);
}

/**
 * Takes the given string, splits it via the ^ and obtains dfn, name, roomBed (if present) from that information.
 *
 * @param log A logger.
 * @param str The string to parse.
 * @param callback A function to call with the results or any error message. 
 */
function parseRpcResponsePatientListData(log, str, callback) {
    var arr = str.split('^');

    if (arr.length < 2) {
        log.warn('Found a line containing incomplete patient data in RPC response: ' + str);
        return callback(null, null); // Don't pass an error to callback -- we want to look at the rest of the list.
    }

    var response = {
        dfn: arr[0],
        name: arr[1]
    };

    if (arr.length >= 3) {
        response.roomBed = arr[2];
    }

    if (!response.dfn) {
        log.warn('Found patient data with no DFN in RPC response: ' + str);
        return callback(null, null); // Don't pass an error to callback -- we want to look at the rest of the list.
    }

    callback(null, response);
}

/**
 * Splits the RPC's string via the '\r\n' and then calls parseRpcResponseAdmission for each line of data.
 *
 * @param log A logger.
 * @param str The string to parse.
 * @param callback A function to call with the results or any error message.
 */
function parseRpcResponseAdmissions(log, str, callback) {
    if (nullUtil.isNullish(str) || _.isEmpty(str)) {
        return callback('The RPC didn\'t return any data');
    }

    var arr = str.split('\r\n');
    arr = _.filter(arr, Boolean); // Remove any empty strings.

    async.map(arr, function(item, cb) {
        parseRpcResponseAdmission(log, item, cb);
    }, function (err, results) {
        if (err) {
            return callback(err);
        }

        callback(null, _.compact(results));
    });
}

/**
 * Splits the RPC's string via the '\r\n' and then calls parseRpcResponseAppointment for each line of data.
 *
 * @param log A logger.
 * @param str The string to parse.
 * @param clinics An array of clinics.
 * @param callback A function to call with the results or any error message.
 */
function parseRpcResponseAppointments(log, str, clinics, callback) {
    if (nullUtil.isNullish(clinics) || _.isEmpty(clinics)) {
        return callback('Clinics list was empty');
    }

    if (nullUtil.isNullish(str) || _.isEmpty(str)) {
        return callback('The RPC didn\'t return any data');
    }

    var arr = str.split('\r\n');
    arr = _.filter(arr, Boolean); // Remove any empty strings.

    async.map(arr, function(item, cb) {
        parseRpcResponseAppointment(log, item, clinics, cb);
    }, function (err, results) {
        if (err) {
            return callback(err);
        }

        callback(null, _.compact(results));
    });
}

/**
 * Splits the RPC's string via the '\r\n' and then calls parseRpcResponsePatientListData for each line of data.
 *
 * @param log A logger.
 * @param str The string to parse.
 * @param callback A function to call with the results or any error message.
 */
function parseRpcResponsePatientList(log, str, callback) {
    if (nullUtil.isNullish(str) || _.isEmpty(str)) {
        return callback('The RPC didn\'t return any data');
    }

    var arr = str.split('\r\n');
    arr = _.filter(arr, Boolean); // Remove any empty strings.

    async.map(arr, function(item, cb) {
        parseRpcResponsePatientListData(log, item, cb);
    }, function (err, results) {
        if (err) {
            return callback(err);
        }

        callback(null, _.compact(results));
    });
}

module.exports.parseRpcResponseAdmissions = parseRpcResponseAdmissions;
module.exports.parseRpcResponseAppointments = parseRpcResponseAppointments;
module.exports.parseRpcResponsePatientList = parseRpcResponsePatientList;
