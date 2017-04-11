'use strict';

var _ = require('lodash');
var async = require('async');
var moment = require('moment');

var rpcClientFactory = require('../core/rpc-client-factory');
var filemanDateUtil = require('../../utils/fileman-date-converter');
var adjustTreatmentFactors = require('./utils').adjustTreatmentFactors;
var getVistaFormattedDateString = require('./utils')._getVistaFormattedDateString;
var handleIncomingComments = require('./utils').handleIncomingComments;
var handleOriginalComments = require('./utils').handleOriginalComments;
var getOriginalCommentIndeces = require('./utils').getOriginalCommentIndeces;
var retrieveSettings = require('./utils').retrieveSettings;
var nullchecker = require('../../core/rdk').utils.nullchecker;

var BAD_ADD_RESPONSE = require('./utils').BAD_ADD_RESPONSE;



function transformModel(model) {
    model.GMPLUSER = 1;
    model.acuity = model.acuity || '@^';
    model.responsibleProviderIEN = model.responsibleProviderIEN || '';
    model.responsibleProvider = model.responsibleProvider || '';
    model.location = model.service || '^';
    model.clinic = model.clinic || '^';
    model.snomedCode = model.snomedCode || '';

    model.dateLastModified =  getVistaFormattedDateString(model.dateLastModified);
    model.dateOfOnset =  getVistaFormattedDateString(model.dateOfOnset);

    var currentDate = new Date();
    model.currentDate = filemanDateUtil.getFilemanDate(currentDate) + '^' +
        currentDate.getDate() + '/' +
        (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear();

    adjustTreatmentFactors(model);

    model.originalComments = model.originalComments || [];
    model.incomingComments = model.incomingComments || [];
}

function constructRpcArgs(model) {
    var params = {};
    var index = 0;

    params[index++] = 'GMPFLD(.01)="' + model.new01 + '"';
    params[index++] = 'GMPFLD(.03)="' + model.currentDate + '"';                              //=GMPFLD(.03)="3160219^Feb 19 2016"
    params[index++] = 'GMPFLD(.05)="' + model.new05 + '"';
    params[index++] = 'GMPFLD(.08)="' + model.currentDate + '"';                              //GMPFLD(.08)="3160219^2/19/16"
    params[index++] = 'GMPFLD(.12)="' + model.status + '"';
    params[index++] = 'GMPFLD(.13)="' + model.dateOfOnset + '"';                              // GMPFLD(.13)="3010000^  2001"
    params[index++] = 'GMPFLD(1.01)="' + model.new101 + '"';
    params[index++] = 'GMPFLD(1.02)="P"';
    params[index++] = 'GMPFLD(1.03)="' + model.responsibleProviderIEN + '^' + model.responsibleProvider + '"';
    params[index++] = 'GMPFLD(1.04)="' + model.responsibleProviderIEN + '^' + model.responsibleProvider + '"';
    params[index++] = 'GMPFLD(1.05)="' + model.responsibleProviderIEN + '^' + model.responsibleProvider + '"';
    params[index++] = 'GMPFLD(1.06)="' + model.location + '"';
    params[index++] = 'GMPFLD(1.07)="^"';
    params[index++] = 'GMPFLD(1.08)="' + model.clinic + '"';
    params[index++] = 'GMPFLD(1.1)="'  + model.serviceConnected + '"';
    params[index++] = 'GMPFLD(1.11)="' + model.agentOrange + '"';
    params[index++] = 'GMPFLD(1.12)="' + model.radiation + '"';
    params[index++] = 'GMPFLD(1.13)="' + model.persianGulfVet + '"';
    params[index++] = 'GMPFLD(1.14)="' + model.acuity + '"';
    params[index++] = 'GMPFLD(1.15)="' + model.headOrNeckCancer + '"';
    params[index++] = 'GMPFLD(1.16)="' + model.MST + '"';
    params[index++] = 'GMPFLD(1.17)="' + model.combatVet + '"';
    params[index++] = 'GMPFLD(1.18)="' + model.shipboard + '"';
    params[index++] = 'GMPFLD(80001)="' + model.snomedCode + '"';
    params[index++] = 'GMPFLD(80002)=""';
    params[index++] = 'GMPFLD(80101)=""';
    params[index++] = 'GMPFLD(80102)=""';
    params[index++] = 'GMPFLD(80201)=""';
    params[index++] = 'GMPFLD(80202)="' + model.ICS + '"';

    index = handleIncomingComments(model.logger, model.originalCommentIndeces, model.incomingComments, model.originalComments,
        model.userIEN, params, index);
    params[index++] = 'GMPORIG(.01)=""';
    params[index++] = 'GMPORIG(.03)=""';
    params[index++] = 'GMPORIG(.05)=""';
    params[index++] = 'GMPORIG(.08)=""';
    params[index++] = 'GMPORIG(.12)=""';
    params[index++] = 'GMPORIG(.13)=""';
    params[index++] = 'GMPORIG(1.01)=""';
    params[index++] = 'GMPORIG(1.02)=""';
    params[index++] = 'GMPORIG(1.05)=""';
    params[index++] = 'GMPORIG(1.06)=""';
    params[index++] = 'GMPORIG(1.07)=""';
    params[index++] = 'GMPORIG(1.08)=""';
    params[index++] = 'GMPORIG(1.09)=""';
    params[index++] = 'GMPORIG(1.1)=""';
    params[index++] = 'GMPORIG(1.11)=""';
    params[index++] = 'GMPORIG(1.12)=""';
    params[index++] = 'GMPORIG(1.13)=""';
    params[index++] = 'GMPORIG(1.14)=""';
    params[index++] = 'GMPORIG(1.15)=""';
    params[index++] = 'GMPORIG(1.16)=""';
    params[index++] = 'GMPORIG(1.17)=""';
    params[index++] = 'GMPORIG(1.18)=""';
    index = handleOriginalComments(model.logger, model.originalCommentIndeces, model.originalComments,
        model.userIEN, model.username, params, index);
    params[index++] = 'GMPORIG(80001)=""';
    params[index++] = 'GMPORIG(80002)=""';
    params[index++] = 'GMPORIG(80003)=""';
    params[index++] = 'GMPORIG(80004)=""';
    params[index++] = 'GMPORIG(80005)=""';
    params[index++] = 'GMPORIG(80201)=""';
    params[index++] = 'GMPORIG(80202)="' + model.ICS + '"';

    var arr = _.values(params);
    console.log(arr);

    return params;
}

function retrieveExistingProblem(logger, siteId, model, rpcClient, callback) {
    var parameters = [];
    parameters.push(model.problemIEN);

    logger.debug({parameters: parameters});

    rpcClient.execute('ORQQPL EDIT LOAD', parameters, function (error, result) {
        if (error) {
            logger.error({loadProblemFailure: error});
            return callback(error);
        }

        return callback(null, result);
    });
}

function updateProblemRPC(logger, siteId, model, rpcClient, input, callback) {
    var parameters = [];
    parameters.push(model.problemIEN);
    parameters.push(model.userIEN);
    parameters.push(siteId);
    parameters.push(model.GMPLUSER);

    var result = input.split('\r\n');
    model.new101 = retrieveSettings(result, 'ORG', '1.01');
    model.new05 = retrieveSettings(result, 'ORG', '.05');
    model.ICD = retrieveSettings(result, 'ORG', '80202');
    model.new01 = retrieveSettings(result, 'ORG', '.01');
    model.originalCommentIndeces = getOriginalCommentIndeces(model.originalComments, result);

    var rpcParameters = constructRpcArgs(model);

    logger.debug({rpcParameters: _.values(rpcParameters)});

    parameters.push(rpcParameters);

    logger.debug({parameters: parameters});

    rpcClient.execute('ORQQPL EDIT SAVE', parameters, function (error, result) {
        if (error) {
            logger.error({EditProblemSave: error});
            return callback(error);
        }

        return callback(null, result);
    });
}

function getProblemJSONRPC(logger, model, rpcClient, input, callback) {
    //if we failed the first call, nothing else left to do
    // bail out...
    if (input === BAD_ADD_RESPONSE) {
        logger.error({errorFromFirst: input});
        return callback(BAD_ADD_RESPONSE);
    }

    var parameters = {'"patientId"': model.dfn, '"domain"': 'problem'};
    rpcClient.execute('HMP GET PATIENT DATA JSON', parameters, function (error, response) {
        logger.debug({rpcError: error, response: response});

        if (!_.isEmpty(error) && !_.isEmpty(response)) {
            logger.error({rpcError: error, response: response});
            return callback(error);
        }

        if (error) {
            logger.error({rpcError: error});
            return callback(error);
        }

        if (_.isEmpty(response) || _.isEmpty(response.trim())) {
            logger.error({response: response});
            return callback(error);
        }

        // we must have a valid JSON response
        // lets parse...

        var parsedResponse = '';
        try {
            logger.debug({parsing: response});
            parsedResponse = JSON.parse(response);
        } catch (e) {
            logger.error({JSON_parsing_error: e.message});
            return callback(e);
        }

        var problems = _.get(parsedResponse, 'data.items');

        if (_.isEmpty(problems)) {
            return callback('malformed response');
        }

        // lets find the problem we just updated to send to VxSync write end point
        var retVal = getUpdatedProblem(logger, problems, model);

        if (_.isEmpty(retVal)) {
            return callback('Failed to find the updated problem.');
        }
        return callback(null, retVal);
    });
}

function callRpcFunctions(writebackContext, siteId, rpcClient, passedInCallback) {
    var logger = writebackContext.logger;
    var model = writebackContext.model;
    model.dfn = writebackContext.interceptorResults.patientIdentifiers.dfn;
    if (nullchecker.isNullish(model.dfn)) {
        return passedInCallback('Missing required patient identifiers');
    }

    var getProblem = retrieveExistingProblem.bind(null, logger, siteId, model, rpcClient);
    var update = updateProblemRPC.bind(null, logger, siteId, model, rpcClient);
    var getJSON = getProblemJSONRPC.bind(null, logger, model, rpcClient);

    async.waterfall([
            getProblem, update, getJSON
        ],
        function (err, results) {
            if (err) {
                writebackContext.vprResponse = null;
                writebackContext.vprModel = null;
                return passedInCallback(err);
            }

            writebackContext.vprResponse = {items: results};
            writebackContext.vprModel = results;
            return passedInCallback(null);
        }
    );
}

function getUpdatedProblem(logger, problems, model) {
    if (!_.isArray(problems)) {
        logger.error({input: 'bad input'});
        return '';
    }

    var index = 0;
    var length = problems.length;
    while (index < length) {
        if (problems[index].localId.toString() === model.problemIEN) {
            logger.debug({matchedProblem: problems[index]});
            return problems[index];
        }

        index ++;
    }

    // tears... did not find a matching problem
    logger.error({NotmatchedProblem: ''});

    return '';
}

function update(writebackContext, callback) {
    var context = writebackContext.vistaConfig.context;

    transformModel(writebackContext.model);
    var model = writebackContext.model;
    model.logger = writebackContext.logger;

    model.logger.debug({problemModel: model});

    rpcClientFactory.getRpcClient(writebackContext, context, function (error, rpcClient) {
        if (error) {
            return callback(error);
        }

        callRpcFunctions(writebackContext, writebackContext.vistaConfig.division, rpcClient, callback);
    });
}

module.exports.update = update;
module.exports._constructRpcArgs = constructRpcArgs;
module.exports._transformModel = transformModel;
module.exports._getUpdatedProblem = getUpdatedProblem;
module.exports._retrieveSettings = retrieveSettings;
