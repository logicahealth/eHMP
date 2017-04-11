'use strict';

var async = require('async');
var mathjs = require('mathjs');
var _ = require('lodash');

var rpcClientFactory = require('../core/rpc-client-factory');
var filemanDateUtil = require('../../utils/fileman-date-converter');
var nullChecker = require('../../utils/nullchecker');
var rdk = require('../../core/rdk');
var locationUtil = rdk.utils.locationUtil;
var paramUtil = require('../../utils/param-converter');
var nullchecker = rdk.utils.nullchecker;

function getVitals(model) {
    var vitals = [];
    var currentTime = currentTimeRpc(model.dateTime);

    model.vitals.forEach(function(vital) {
        var rpcArray = [];
        rpcArray.push(currentTime, model.dfn);

        var vitalRPCDelimitedStr = vital.fileIEN + ';';

        var reading = vital.reading;

        if (nullChecker.isNotNullish(vital.unit)) {
            if (vital.unit.toUpperCase() === 'C') {
                reading = paramUtil.celsiusToFahrenheit(reading);
            }

            if (vital.unit.toUpperCase() === 'CM') {
                var cmUnit = mathjs.unit(parseFloat(reading), 'cm');
                reading = cmUnit.toNumber('inch');
            }

            if (vital.unit.toUpperCase() === 'KG') {
                var kgUnit = mathjs.unit(parseFloat(reading), 'kg');
                reading = kgUnit.toNumber('lb');
            }

            if (vital.unit.toUpperCase() === 'MMHG') {
                reading = paramUtil.mmHGToCmH2O(reading);
            }
        }

        var flowRate = '';

        if (nullChecker.isNotNullish(vital.flowRate)) {
            flowRate = vital.flowRate + ' l/min';
        }

        var o2Concentration = '';

        if (nullChecker.isNotNullish(vital.o2Concentration)) {
            if (nullChecker.isNotNullish(flowRate)) {
                o2Concentration = ' ' + vital.o2Concentration + '%';
            } else {
                o2Concentration = vital.o2Concentration + '%';
            }
        }

        vitalRPCDelimitedStr += reading + ';' + flowRate + o2Concentration;
        rpcArray.push(vitalRPCDelimitedStr);
        rpcArray.push(locationUtil.getLocationIEN(model.locationUid));

        var qualifiersRPCDelimitedStr = model.enterdByIEN + '*';
        qualifiersRPCDelimitedStr += paramUtil.convertArrayToRPCParameters(vital.qualifiers, ':');
        rpcArray.push(qualifiersRPCDelimitedStr);
        vitals.push(rpcArray);
    });

    return vitals;
}

function convertVitalToRpcString(vital) {
    return paramUtil.convertArrayToRPCParameters(vital);
}

function currentTimeRpc(dateTime) {
    var eventDateTimeMoment = paramUtil.convertWriteBackInputDate(dateTime);
    var eventFilemanYear = filemanDateUtil.getFilemanDateWithArgAsStr(eventDateTimeMoment.format(paramUtil.WRITEBACK_INPUT_DATE_FORMAT));
    var currentTime = eventFilemanYear + '.' + eventDateTimeMoment.format(paramUtil.WRITEBACK_INPUT_TIME_FORMAT);
    return currentTime;
}

function adjustContextForSuccess(writebackContext, results) {
    writebackContext.vprResponse = {items: results};
    writebackContext.vprModel = results;
}

function adjustContextForPartialSuccess(writebackContext, results) {
    writebackContext.vprResponse = {items: 'not all of the vitals were processed'};
    writebackContext.vprResponseStatus = 202; // accepted
    writebackContext.vprModel = results;
}

function adjustContextForFailure(writebackContext) {
    writebackContext.vprResponse = null;
    writebackContext.vprModel = null;
}

function create (writebackContext, passedInCallback) {
    var logger = writebackContext.logger;
    var model = writebackContext.model;
    model.dfn = writebackContext.interceptorResults.patientIdentifiers.dfn;
    if (nullchecker.isNullish(model.dfn)) {
        return passedInCallback('Missing required patient identifiers');
    }
    var context = writebackContext.vistaConfig.context;
    var vitals = getVitals(model);

    logger.debug({vitalsVistaWriterModel: model});

    rpcClientFactory.getRpcClient(writebackContext, context, function (error, rpcClient) {
        if (error) {
            return passedInCallback(error);
        }

        var doVitals =  _.map(vitals, function(vital) {
            return addVital.bind(null, writebackContext, rpcClient, vital);
        });

        async.series(doVitals, function (err, results) {
            logger.debug({vitals: 'asnyc.series complete'});

            // fish out the empty results
            if (!_.isUndefined(results) && !_.isEmpty(results)) {
                results = _.filter(results, function (result) {
                    return !_.isEmpty(result);
                });
            }

            // actual error or no results meaning all RPC errors but we needed to process all...
            if (err || results.length === 0) {
                err = err || 'all writes failed (Vitals)';
                logger.error({vitals: {error: err}});
                adjustContextForFailure(writebackContext);
                return passedInCallback(err);
            }


            logger.debug({vitals: {'success': results}});
            adjustContextForSuccess(writebackContext, results);

            return passedInCallback(null);
        });
    });
}

function enteredInError (writebackContext, passedInCallback) {
    var logger = writebackContext.logger;
    var model = writebackContext.model;
    var context = writebackContext.vistaConfig.context;

    logger.debug({vitalsVistaWriterModel: model});

    rpcClientFactory.getRpcClient(writebackContext, context, function (error, rpcClient) {
        if (error) {
            return passedInCallback(error);
        }

        model.ien = model.ien.split(',');
        logger.debug({iens: model.ien});

        var vitalsEIE = _.map(model.ien, function (ien) {
            return eieVital.bind(null, writebackContext, rpcClient, ien);
        });

        async.series(vitalsEIE, function (err, results) {
            logger.debug({vitalsEIE: 'asnyc.series complete'});

            // fish out the empty results
            if (!_.isUndefined(results) && !_.isEmpty(results)) {
                results = _.filter(results, function (result) {
                    return !_.isEmpty(result);
                });
            }

            // actual error or no results meaning all RPC errors but we needed to process all...
            if (err || results.length === 0) {
                err = err || 'all writes failed (Vitals EIE)';
                logger.error({vitals: {error: err}});
                adjustContextForFailure(writebackContext);
                return passedInCallback(err);
            }

            // Did all succeed or only partial
            if (model.ien.length !== results.length) {
                logger.debug({vitals: {'partial error': 'some writes did not succeed (vitals EIE)'}});
                adjustContextForPartialSuccess(writebackContext, results);
            } else {
                logger.debug({vitals: {'success': results}});
                adjustContextForSuccess(writebackContext, results);
            }

            return passedInCallback(null);
        });
    });
}

function addVital(writebackContext, rpcClient, vital, callback) {
    var logger = writebackContext.logger;
    logger.debug({vital: vital});

    var model = writebackContext.model;
    var rpcDelimitedStr = convertVitalToRpcString(vital);

    model.dfn = writebackContext.interceptorResults.patientIdentifiers.dfn;
    if (nullchecker.isNullish(model.dfn)) {
        return callback('Missing required patient identifiers');
    }

    logger.debug({rpcDelimitedStr: rpcDelimitedStr});

    var params = [];
    params[0] = 0;
    params[1] = model.dfn;
    params[2] = rpcDelimitedStr;

    rpcClient.execute('HMP WRITEBACK VITAL', params, function (err, result) {
        if (err) {
            logger.error({rpcError: err});
            return callback(err);
        }

        if (_.isUndefined(result) || _.isEmpty(result)) {
            logger.error({emptyResult: 'Null string'});
            return callback(null, '');
        }

        var finalAnswer = '';

        try {
            logger.debug({parsing: result});
            finalAnswer = JSON.parse(result);
        } catch (e) {
            logger.error({JSON_parsing_error: e.message});
            return callback(e);
        }

        result = finalAnswer.object;
        if (!_.isUndefined(result) && !_.isEmpty(result)) {
            logger.debug({result: result});
            return callback(null, result);
        } else {
            logger.error({result: finalAnswer});
            return callback(null, '');
        }
    });
}

function eieVital(writebackContext, rpcClient, ien, callback) {
    var logger = writebackContext.logger;
    var model = writebackContext.model;
    logger.debug({vitalIEN: ien});

    var rpcArguments = ien + '^' + model.reason;
    logger.debug({rpcArguments: rpcArguments});

    rpcClient.execute('HMP WRITEBACK VITAL EIE', rpcArguments, function (err, response) {
        logger.debug({handleRPCResponse: response});

        if (err) {
            logger.error({rpcError: err});
            writebackContext.vprModel = null;
            writebackContext.vprResponse = {error: err};
            return callback(err);
        }

        var finalAnswer = '';

        // Lets check for valid response, no JSON means error for this function
        try {
            finalAnswer = JSON.parse(response);
            logger.debug({parsedResult: finalAnswer});
        } catch (e) {
            logger.error({JSON_parsing_error: e.message});
            writebackContext.vprModel = null;
            writebackContext.vprResponse = {error: e.message};
            return callback(e);
        }

        // it is a valid JSON, lets look for object...
        response = finalAnswer.object;
        logger.debug({parsedResultObject: response});

        if (_.isUndefined(response) || _.isEmpty(response)) {
            logger.debug('response has no object key');
            // this must be an error from RPC deal with it accordingly...
            response = finalAnswer.Message;

            if (_.isUndefined(response)) {
                // no clue what we got. this is unexpected
                logger.error('response has no Message key');
                logger.error({badResutls: response});
                response = finalAnswer;
        }

            logger.debug({parseMessage: response});
            writebackContext.vprModel = null;
            writebackContext.vprResponse = {error: response};

            return callback(response);
        }

        // looks like we got something useful...
        writebackContext.vprResponse = {items: response};
        writebackContext.vprModel = response;
        return callback(null, response);
    });
}

module.exports.create = create;
module.exports.enteredInError = enteredInError;

module.exports._getVitals = getVitals;
module.exports._convertVitalToRpcString = convertVitalToRpcString;
module.exports._currentTimeRpc = currentTimeRpc;
module.exports._adjustContextForSuccess = adjustContextForSuccess;
module.exports._adjustContextForPartialSuccess = adjustContextForPartialSuccess;
module.exports._adjustContextForFailure = adjustContextForFailure;
