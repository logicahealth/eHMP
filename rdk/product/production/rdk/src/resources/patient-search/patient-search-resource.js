'use strict';

var rdk = require('../../core/rdk');
var httpUtil = rdk.utils.http;
var _ = require('lodash');
var nullChecker = rdk.utils.nullchecker;
var async = require('async');
var searchJds = require('./jds-pid').searchJds;
var dd = require('drilldown');
var S = require('string');
var sensitivityUtils = rdk.utils.sensitivity;

module.exports.getResourceConfig = function() {
    return [{
        name: 'patient-search-full-name',
        path: '/full-name',
        get: require('./full-name'),
        interceptors: {
            jdsFilter: true,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        subsystems: ['mvi','jdsSync']
    },
    {
        name: 'patient-search-last5',
        path: '/last5',
        get: require('./last5'),
        interceptors: {
            jdsFilter: true,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false,
        subsystems: ['mvi','jdsSync']
    },
    {
        name: 'patient-search-pid',
        path: '/pid',
        get: require('./pid'),
        interceptors: {
            jdsFilter: true,
            synchronize: false
        },
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: false
    }];
};

/**
 * Calls the vxSync endpoint for 'patient-select/get-patients' to retrieve patient data.
 *
 * @param logger - req.logger - The logger
 * @param logMessagePrefix - Used when logging messages to show who is calling this - useful for debugging.
 * @param vxSyncServer - req.app.config.vxSyncServer - connectivity information for vxSyncServer.
 * @param jdsServer - req.app.config.jdsServer - connectivity information for jdsServer.
 * @param site The site you want to search for patients on.
 * @param searchType - The type of search.  Can be ICN, PID, LAST5, or NAME.
 * @param searchString - the string that you are searching for using icn, pid, last5, or name.
 * @param callback - The function to call when we have retrieved all of the data.
 */
module.exports.callVxSyncPatientSearch = function(logger, logMessagePrefix, vxSyncServer, jdsServer, site, searchType, searchString, callback) {
    if (!logMessagePrefix) {
        logMessagePrefix = 'patient-search-resource';
    }
    var options = _.extend({}, vxSyncServer, {
        url: '/patient-select/get-patients?site=' + site + '&searchType=' + searchType + '&searchString=' + searchString,
        logger: logger,
        json: true
    });

    logger.debug(logMessagePrefix + '_callVxSyncPatientSearch performing search using site=' + site + '&searchType=' + searchType + '&searchString=' + searchString);
    httpUtil.get(options, function (error, response, result) {
        //logger.debug(logMessagePrefix + ' httpUtil.get result = ' + JSON.stringify(result, null, 2));
        //logger.debug(logMessagePrefix + ' response.statusCode IS [%s]', response.statusCode);

        if (error) {
            logger.error(logMessagePrefix + '_callVxSyncPatientSearch Error performing search [%s]', (error.message || error));
            error.message = 'There was an error processing your request. The error has been logged: ';
            return callback(logMessagePrefix + ' ' + error);
        }
        if (response.statusCode >= 300) {
            logger.error(logMessagePrefix + '_callVxSyncPatientSearch response.statusCode [%s]', response.statusCode);
            return callback({status: response.statusCode, message: result});
        }

        async.mapSeries(result, function(patient, cb) {
            if (patient.sensitive) {
                return cb(null, sensitivityUtils.hideSensitiveFields(patient));
            }

            logger.debug(logMessagePrefix + '_callVxSyncPatientSearch sensitive flag was missing or false; checking for it in JDS');
            searchJds(patient.pid, logger, jdsServer, function(err, sensitive) {
                if (err) {
                    return cb(err);
                }

                patient.sensitive = sensitive;
                if (patient.sensitive) {
                    patient = sensitivityUtils.hideSensitiveFields(patient);
                } else {
                    patient = sensitivityUtils.removeSensitiveFields(patient);
                }
                cb(null, patient);
            });
        }, function(err, patients) {
            if (err) {
                return callback(err);
            }

            var retvalue = {
                apiVersion: '1.0',
                data: {
                    totalItems: patients.length,
                    currentItemCount: patients.length,
                    items: patients
                },
                status: 200
            };

            logger.debug(logMessagePrefix + '_callVxSyncPatientSearch returning result');
            //logger.debug(logMessagePrefix + '_callVxSyncPatientSearch retvalue=' + JSON.stringify(retvalue, null, 2));
            callback(null, retvalue);
        });
    });
};

function validResponseDataItems(logger, logMessagePrefix, response) {
    //Check response.data.items
    if (!response) {
        logger.debug(logMessagePrefix + '_validResponseDataItems got a null response object');
        return false;
    }
    else if (!response.data) {
        logger.debug(logMessagePrefix + '_validResponseDataItems got a response object with no data');
        return false;
    }
    else if (!response.data.items) {
        logger.debug(logMessagePrefix + '_validResponseDataItems got a response object with no data.items');
        return false;
    }

    logger.debug(logMessagePrefix);
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
 * @param response The object containing data.items that was returned from the call to callVxSyncPatientSearch
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
 * @param response The object containing data.items that was returned from the call to callVxSyncPatientSearch
 */
module.exports.limit = function(logger, logMessagePrefix, start, limit, response) {
    logger.debug(logMessagePrefix + '_limit start=' + start + ', limit=' + limit);

    if (!limit) {
        logger.debug(logMessagePrefix + '_limit no limit specified - returning data as is');
        return;
    }
    if (!isWholeNumber(limit)) {
        logger.info(logMessagePrefix + '_limit limit specified was not a whole number - returning data as is');
        return;
    }

    if (!start) {
        start = 0;
    }
    if (!isWholeNumber(start)) {
        logger.info(logMessagePrefix + '_limit start specified was not a whole number - setting to zero');
        start = 0;
    }

    limit = Number(limit);
    start = Number(start);

    if (validResponseDataItems(logger, logMessagePrefix + ' limit', response) === false) {
        logger.info(logMessagePrefix + '_limit validResponseDataItems returned false - returning data as is');
        return;
    }

    var totalItems = response.data.items.length;
    limit = limit < totalItems ? limit : totalItems; //If limit is bigger than totalItems, then just use totalItems

    response.data.itemsPerPage = limit;
    response.data.startIndex = start;
    response.data.pageIndex = (start / limit | 0);  // jshint ignore:line
    response.data.totalPages = (totalItems / limit | 0) + (totalItems % limit > 0 ? 1 : 0);  // jshint ignore:line

    logger.debug(logMessagePrefix + '_limit limit: ' + limit);
    logger.debug(logMessagePrefix + '_limit response.data.itemsPerPage: ' + response.data.itemsPerPage);
    logger.debug(logMessagePrefix + '_limit response.data.startIndex: ' + response.data.startIndex);
    logger.debug(logMessagePrefix + '_limit response.data.pageIndex: ' + response.data.pageIndex);
    logger.debug(logMessagePrefix + '_limit response.data.totalPages: ' + response.data.totalPages);
    logger.debug(logMessagePrefix + '_limit totalItems: ' + totalItems);

    if (limit > 0) {
        logger.debug(logMessagePrefix + '_limit start(' + typeof start + ')=' + start + ', limit(' + typeof limit + ')=' + limit);

        var end = start + limit;
        logger.debug(logMessagePrefix + '_limit response.data.items - before slice(' + start + ', ' + end + '): ' + JSON.stringify(response.data.items, null, 2));
        response.data.items = response.data.items.slice(start, end);
        logger.debug(logMessagePrefix + '_limit response.data.items - after slice(' + start + ', ' + end + '): ' + JSON.stringify(response.data.items, null, 2));
    }
    else {
        logger.debug(logMessagePrefix + '_limit response.data.items - before slice(' + start + '): ' + JSON.stringify(response.data.items, null, 2));
        response.data.items = response.data.items.slice(start);
        logger.debug(logMessagePrefix + '_limit response.data.items - after slice(' + start + '): ' + JSON.stringify(response.data.items, null, 2));
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

function parseFilter(logger, logMessagePrefix, filter, response) {
    var str = filter.slice(3, filter.length - 1);
    var fieldName = _.trim(str.slice(0, _.indexOf(str, ',')), '\'"');
    var fieldValue = _.trim(str.slice(_.indexOf(str, ',')+1, str.length), '\'"');

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
 * @param response The object containing data.items that was returned from the call to callVxSyncPatientSearch
 */
module.exports.filter = function(logger, logMessagePrefix, filter, response) {
    logger.debug(logMessagePrefix + '_filter filtering by ' + filter);
    if (!validateFilter(logger, logMessagePrefix + '_filter', filter, response)) {
        return;
    }
    var fieldNameAndValue = parseFilter(logger, logMessagePrefix + '_filter', filter, response);
    var fieldName = fieldNameAndValue.fieldName;
    var fieldValue = fieldNameAndValue.fieldValue;

    logger.debug(logMessagePrefix + '_filter fieldName is ' + fieldName);
    logger.debug(logMessagePrefix + '_filter fieldValue is ' + fieldValue);

    fieldValue = fieldValue.toLowerCase();

    var newItems = _.filter(response.data.items, function(item) {
        logger.debug(logMessagePrefix + '_filter performing filter on ' + JSON.stringify(item, null, 2));

        var actualValue = item[fieldName];
        logger.debug(logMessagePrefix + '_filter actualValue is ' + actualValue);

        if (nullChecker.isNotNullish(actualValue)) {
            actualValue = actualValue.toLowerCase();
        }
        logger.debug(logMessagePrefix + '_filter performing actualValue is now ' + actualValue);

        if (actualValue === fieldValue) {
            logger.debug(logMessagePrefix + '_filter actualValue (' + actualValue + ') matches fieldValue (' + fieldValue + ')');
            return true;
        }
        else {
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
    if (dd(req)('session')('user')('site').exists) {
        site = req.session.user.site;
        req.logger.debug(logMessagePrefix + '_getSite obtained site (' + site + ') from req.session.user.site');
        return site;
    }

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

    req.logger.error(logMessagePrefix + '_getSite unable to obtain site from request');
    return null;
};
