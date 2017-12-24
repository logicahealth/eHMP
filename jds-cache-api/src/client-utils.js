'use strict';

/*
 * Author: David Wicksell
 */

const _ = require('lodash');
const async = require('async');
const uuid = require('node-uuid');
const errorUtil = require('../utils/error');


// Helper utilities for common functionality of the jds-client and pjds-client
// Log messages use JDS as a generic identifier, but could be called by pJDS the same
// References to jdsClientRequestCallback are the same as pjdsClientRequestCallback (defined in their respective clients)

/**
 * @callback jdsClientRequestCallback
 * @param {object|null} error
 * @param {object} [response] Contains a statusCode property emulating HTTP status codes
 * @param {object} [parsedData] The parsed data received from JDS
 */

/**
 * Generate a uid from an id and a site hash
 *
 * @param {string} id Either a pid in the format of siteHash;DFN or the IEN of the user (the site hash is ignored)
 * @param {string} site The site hash for the patient or user
 * @param {string} list The name of the osync blist
 * @return {string} Either the uid or an error message
 */
function generateBlistUid(id, site, list) {
    let uid = 'urn:va:' + list + ':' + site + ':';

    if (list === 'patient') {
        const parts = extractPiecesFromPid(id);

        uid += parts.dfn + ':' + parts.dfn;

        if (site !== parts.site) {
            return 'Invalid PID for site';
        }
    } else if (list === 'user') {
        uid += id;
    } else {
        return 'Invalid list type';
    }

    return uid;
}


/**
 * Separate a pid into it constituent components (pid format is <site>;<local-identifer>)
 *
 * @param {string} pid The patient identifier to be checked
 * @return {object} An object in the form of { site: <site>, dfn: <local-identifier> }
 *         If the pid is empty, it will return an object with each component set to
 *         null. If the string does not contain a ';', it will be treated as an
 *         identifier without a site - so site will be null.
 */
function extractPiecesFromPid(pid) {
    if (_.isEmpty(pid)) {
        return {
            site: null,
            dfn: null
        };
    }

    const delimiter = ';';

    if (!_.includes(pid, delimiter)) {
        return {
            site: null,
            dfn: pid
        };
    }

    const pieces = pid.split(delimiter);

    return {
        site: _.isEmpty(pieces[0]) ? null : pieces[0],
        dfn: _.isEmpty(pieces[1]) ? null : pieces[1],
    };
}


/**
 * Helper function to retrieve query data from JDS, when calling the cache.node M wrapper API
 * This is a standard pattern for retrieving (and cleaning up) query data from JDS
 *
 * @param {CacheConnector} cacheConnector The cache.node low-level APIs are stored in this class
 * @param {string} funcError The error value from the cache.node low-level APIs
 * @param {object} funcResult The result value from the cache.node low-level APIs
 * @param {jdsClientRequestCallback} callback
 * @return {*}
 */
function retrieveQueryResult(cacheConnector, funcError, funcResult, callback) {
    if (funcError) {
        return callback(errorUtil.createTransient(funcResult.ErrorMessage || 'Unknown Error'));
    }

    // jdsResultStatus will be a '1' if there was an error in JDS, other wise it will be a '0' if there was no error
    const jdsResultStatus = funcResult.result.split(':')[0];
    const jdsHasError = jdsResultStatus === '1';

    // uuid will contain the subscript that the funcError or funcResult return is stored under
    //
    // It will be a random number, generated in UUID format, using the $$UUID^VPRJRUT function in JDS
    // This is because a naive use of $JOB to stage the return data can cause a mixing of data, due
    // to a likely race condition, as multiple calls to the jdsClient, via the cacheConnector use the
    // the same $JOB in the backend MUMPS process.
    const uuid = funcResult.result.split(':')[1];

    // A very unlikely JDS error, which happens if JDS cannot generate a UUID for a particular call
    if (jdsHasError && uuid === 'UUID EXCEPTION') {
        return callback(errorUtil.createTransient('JDS could not find a non-used UUID for staging retrieve data'));
    }

    const pid = cacheConnector.cache_pid;

    if (jdsHasError) {
        return cacheConnector.retrieve({
            global: 'TMP',
            subscripts: ['HTTPERR', uuid, pid, 1]
        }, 'object', (retrieveError, retrieveResult) => {
            if (retrieveError) {
                return callback(errorUtil.createTransient(retrieveResult.ErrorMessage || 'Unknown Error'));
            }

            return killErrorData(cacheConnector,  uuid, pid, retrieveResult, callback);
        });
    }

    return cacheConnector.retrieve({
        global: 'TMP',
        subscripts: [uuid, pid]
    }, 'array', (retrieveError, retrieveResult) => {
        if (retrieveError) {
            if (retrieveResult.ErrorMessage === '<MAXSTRING>Cache Error') {
                let result = '';

                if (cacheConnector.get({global: 'TMP', subscripts: [uuid, pid, 'PREAMBLE']}).defined) {
                    result += cacheConnector.get({
                        global: 'TMP',
                        subscripts: [uuid, pid, 'PREAMBLE']
                    }).data;
                }

                const lastItem = cacheConnector.previous({
                    global: 'TMP',
                    subscripts: [uuid, pid, 'POSTAMBLE']
                }).result;

                for (let i = 0; i <= lastItem; i++) {
                    const lastNode = cacheConnector.previous({
                        global: 'TMP', subscripts: [uuid, pid, i, '']
                    }).result;

                    if (i > 0) {
                        result += ',';
                    }

                    for (let j = 1; j <= lastNode; j++) {
                        result += cacheConnector.get({
                            global: 'TMP',
                            subscripts: [uuid, pid, i, j]
                        }).data;
                    }
                }

                if (cacheConnector.get({global: 'TMP', subscripts: [uuid, pid, 'POSTAMBLE']}).defined) {
                    result += cacheConnector.get({
                        global: 'TMP',
                        subscripts: [uuid, pid, 'POSTAMBLE']
                    }).data;
                }

                if (cacheConnector.get({global: 'TMP', subscripts: [uuid, pid, 'STATUS']}).defined) {
                    result = cacheConnector.get({
                        global: 'TMP',
                        subscripts: [uuid, pid, 'STATUS']
                    }).data + result;
                }

                return killResultData(cacheConnector, uuid, pid, result, callback);
            }

            return callback(errorUtil.createTransient(retrieveResult.ErrorMessage || 'Unknown Error'));
        }

        return killResultData(cacheConnector, uuid, pid, retrieveResult, callback);
    });
}


/**
 * Helper function to kill error data in ^TMP in JDS, when calling the cache.node M wrapper API
 * This is a standard pattern for cleaning up query error data from JDS
 *
 * @param {CacheConnector} cacheConnector The cache.node low-level APIs are stored in this class
 * @param {string} uuid The unique ID of the backend wrapper code in JDS for staging data
 * @param {string} pid The process ID of the backend wrapper code in JDS for staging data
 * @param {object} retrieveResult The return object containing the parsed JSON return data from JDS
 * @param {jdsClientRequestCallback} callback
 * @return {*}
 */
function killErrorData(cacheConnector, uuid, pid, retrieveResult, callback) {
    return cacheConnector.data({
        global: 'TMP',
        subscripts: ['HTTPERR', uuid, pid]
    }, (dataError, dataResult) => {
        if (dataError) {
            return callback(errorUtil.createTransient(dataResult.ErrorMessage || 'Unknown Error'));
        }

        if (dataResult.defined < 1) {
            try {
                const {statusCode, body, jdsError} = parseError(retrieveResult);

                return callback(null, {
                    statusCode: statusCode,
                    body: body
                }, jdsError);
            } catch (err) {
                return callback(errorUtil.createFatal('JDS format error [data]: ' + err.toString()));
            }
        }

        cacheConnector.kill({
            global: 'TMP',
            subscripts: ['HTTPERR', uuid, pid]
        }, (killError, killResult) => {
            if (killError) {
                return callback(errorUtil.createTransient(killResult.ErrorMessage || 'Unknown Error'));
            }

            try {
                const {statusCode, body, jdsError} = parseError(retrieveResult);

                return callback(null, {
                    statusCode: statusCode,
                    body: body
                }, jdsError);
            } catch (err) {
                return callback(errorUtil.createFatal('JDS format error [kill]: ' + err.toString()));
            }
        });
    });
}


/**
 * Helper function to kill result data in ^TMP in JDS, when calling the cache.node M wrapper API
 * This is a standard pattern for cleaning up query result data from JDS
 *
 * @param {CacheConnector} cacheConnector The cache.node low-level APIs are stored in this class
 * @param {string} uuid The unique ID of the backend wrapper code in JDS for staging data
 * @param {string} pid The process ID of the backend wrapper code in JDS for staging data
 * @param {object} retrieveResult The return object containing the parsed JSON return data from JDS
 * @param {jdsClientRequestCallback} callback
 * @return {*}
 */
function killResultData(cacheConnector, uuid, pid, retrieveResult, callback) {
    return cacheConnector.data({
        global: 'TMP',
        subscripts: [uuid, pid]
    }, (dataError, dataResult) => {
        if (dataError) {
            return callback(errorUtil.createTransient(dataResult.ErrorMessage || 'Unknown Error'));
        }

        if (dataResult.defined < 1) {
            try {
                const {statusCode, body, jdsResult} = parseData(retrieveResult);

                return callback(null, {
                    statusCode: statusCode,
                    body: body
                }, jdsResult);
            } catch (err) {
                return callback(errorUtil.createFatal('JDS JSON parsing error [data]: ' + err.toString()));
            }
        }

        cacheConnector.kill({
            global: 'TMP',
            subscripts: [uuid, pid]
        }, (killError, killResult) => {
            if (killError) {
                return callback(errorUtil.createTransient(killResult.ErrorMessage || 'Unknown Error'));
            }

            try {
                const {statusCode, body, jdsResult} = parseData(retrieveResult);

                return callback(null, {
                    statusCode: statusCode,
                    body: body
                }, jdsResult);
            } catch (err) {
                return callback(errorUtil.createFatal('JDS JSON parsing error [kill]: ' + err.toString()));
            }
        });
    });
}


/**
 * Helper function to parse error data from JDS, when calling the cache.node M wrapper API
 *
 * @param {object} result The result value from the cache.node low-level APIs
 * @return {object} The parsed result object
 */
function parseError(result) {
    // Errors are stored as an M array, in a separate area from successful data retrieval
    const errors = [];
    let errorNumber;

    for (errorNumber in result.object.error.errors) {
        if (result.object.error.errors.hasOwnProperty(errorNumber)) {
            errors.push(result.object.error.errors[errorNumber]);
        }
    }

    result.object.error.errors = errors;
    delete result.object.error.request;

    return {statusCode: parseInt(result.object.error.code), body: JSON.stringify(result.object), jdsError: result.object};
}


/**
 * Helper function to parse result data from JDS, when calling the cache.node M wrapper API
 *
 * @param {object} result The result value from the cache.node low-level APIs
 * @return {object} The parsed result object
 */
function parseData(result) {
    let data = '';

    // Parse output of MAXSTRING error data
    if (typeof result === 'string') {
        return {statusCode: parseInt(result.slice(0, 3)), body: result.substr(3), jdsResult: JSON.parse(result.substr(3))};
    }

    // Grab the status code
    const status = result.pop().data;

    if (_.isEmpty(result)) {
        return {statusCode: parseInt(status)};
    }

    // If PREAMBLE is defined, data is stored as an M array, in the JDS staging area
    if (_.last(result).subscripts[2] === 'PREAMBLE') {
        data = result.pop().data;

        // Grab the POSTAMBLE from the end of the array
        const post = result.pop().data;

        if (!_.isEmpty(result)) {
            _.each(result, (resultItem) => {
                if ((resultItem.subscripts[3] === '1' || typeof resultItem.subscripts[3] === 'undefined') && data[data.length-1] === '}') {
                    data += ',' + resultItem.data;
                } else {
                    data += resultItem.data;
                }
            });
        }

        // Add the POSTAMBLE to the end
        data += post;
    // Otherwise data is stored as JSON already, in the JDS staging area
    } else {
        data = '';

        _.each(result, (resultItem) => {
            data += resultItem.data;
        });
    }

    return {statusCode: parseInt(status), body: data, jdsResult: JSON.parse(data)};
}


/**
 * Helper function to retrieve query data from JDS, when calling the cache.node M wrapper API
 * This is a standard pattern for retrieving (and cleaning up) query data from JDS
 *
 * @param {CacheConnector} cacheConnector
 * @param {object} data The data to set in to the BODY staging area with the cache.node low-level APIs
 * @param {jdsClientRequestCallback} callback
 * @return {*}
 */
function setStoreData(cacheConnector, data, callback) {
    const pid = cacheConnector.cache_pid;
    const nodeUuid = uuid.v4();

    return cacheConnector.data({
        global: 'TMP',
        subscripts: ['BODY', nodeUuid, pid]
    }, (dataError, dataResult) => {
        if (dataError) {
            return callback(errorUtil.createTransient(dataResult.ErrorMessage || 'Unknown Error'));
        }

        if (dataResult.defined > 0) {
            return callback(errorUtil.createTransient('JDS could not find a non-used UUID for staging store data'));
        }

        const params = {
            global: 'VPRCONFIG',
            subscripts: ['maxStringLimit']
        };

        const maxStringLimit = cacheConnector.get(params).data || 32600;
        const dataArray = JSON.stringify(data).match(new RegExp('[\\s\\S]{1,' + maxStringLimit + '}', 'g'));
        let cacheResult;

        async.eachOf(dataArray, (dataItem, index, dataItemCallback) => {
            cacheConnector.set({
                global: 'TMP',
                subscripts: ['BODY', nodeUuid, pid, 'data', index+1],
                data: dataItem
            }, (setError, setResult) => {
                cacheResult = setResult;

                if (setError) {
                    dataItemCallback(setError);
                } else {
                    dataItemCallback();
                }
            });
        }, (cacheError) => {
            if (cacheError) {
                return callback(cacheError, cacheResult);
            }

            return callback(null, {nodeUuid: nodeUuid});
        });
    });
}


module.exports.generateBlistUid = generateBlistUid;
module.exports.retrieveQueryResult = retrieveQueryResult;
module.exports.setStoreData = setStoreData;
module.exports._extractPiecesFromPid = extractPiecesFromPid;
module.exports._killErrorData = killErrorData;
module.exports._killResultData = killResultData;
module.exports._parseError = parseError;
module.exports._parseData = parseData;
