'use strict';

var _ = require('lodash');
var async = require('async');
var moment = require('moment');

var rpcClientFactory = require('../core/rpc-client-factory');
var filemanDateUtil = require('../../utils/fileman-date-converter');
var getVistaFormattedDateString = require('./utils')._getVistaFormattedDateString;
var adjustTreatmentFactors = require('./utils').adjustTreatmentFactors;

var BAD_ADD_RESPONSE = require('./utils').BAD_ADD_RESPONSE;

function transformModel(logger, model) {
    model.condition =                   'P';
    model.patient =                     model.patientIEN + '^' + model.patientName + '^0008^';

    // optional fields: default to null string or empty array for comments
    model.acuity =                      model.acuity || '@^';
    model.recordingProvider =           model.recordingProvider || '';
    model.recordingProviderIEN =        model.recordingProviderIEN || '';
    model.responsibleProvider =         model.responsibleProvider || '';
    model.responsibleProviderIEN =      model.responsibleProviderIEN || '';
    model.dateOfOnset =                 model.dateOfOnset || '^';
    model.snomedCode =                  model.snomedCode || '';
    model.location =                    model.service || '^';
    model.clinic =                      model.clinic || '^';
    model.problemNumber =               model.problemNumber || '';

    model.patient =                     model.patientIEN + '^' + model.patientName + '^0008^';

    // format the date fields for VistA
    model.currentDate =                 new Date();
    model.currentDate =                 filemanDateUtil.getFilemanDate(model.currentDate) + '^' + model.currentDate.getDate() + '/' +
                                        (model.currentDate.getMonth() + 1) + '/' + model.currentDate.getFullYear();

    model.dateRecorded =                  getVistaFormattedDateString(model.dateRecorded);

    if (! _.isEmpty(model.dateOfOnset)) {
        model.dateOfOnset =               getVistaFormattedDateString(model.dateOfOnset);
    } else {
        model.dateOfOnset =             '^';
    }

    adjustTreatmentFactors(model);
    model.comments =                 model.comments || [];
}

function constructRpcArgs(model) {
    var params = {};
    var index = 0;

    params[index++] = 'GMPFLD(.01)="' + model.lexiconCode + '^'+ model.code + '"';
    params[index++] = 'GMPFLD(.03)="0^"';
    params[index++] = 'GMPFLD(.05)="^'      + model.problemName + '"';
    params[index++] = 'GMPFLD(.08)="'       + model.currentDate + '"';
    params[index++] = 'GMPFLD(.12)="'       + model.status + '"';
    params[index++] = 'GMPFLD(.13)="'       + model.dateOfOnset + '"';
    if (_.isUndefined(model.newTermText)) {
        params[index++] = 'GMPFLD(1.01)="'      + model.problemNumber + '^' + model.problemName + '"';
    } else {
        params[index++] = 'GMPFLD(1.01)="'      + 1 + '^' + model.newTermText + '"';
    }

    params[index++] = 'GMPFLD(1.02)="'      + model.condition + '"';
    params[index++] = 'GMPFLD(1.03)="'      + model.enteredByIEN + '^' + model.enteredBy + '"';
    params[index++] = 'GMPFLD(1.04)="'      + model.recordingProviderIEN + '^' + model.recordingProvider + '"';
    params[index++] = 'GMPFLD(1.05)="'      + model.responsibleProviderIEN + '^' + model.responsibleProvider + '"';
    params[index++] = 'GMPFLD(1.06)="'      + model.location + '"';
    params[index++] = 'GMPFLD(1.07)="^"';
    params[index++] = 'GMPFLD(1.08)="'      + model.clinic + '"';
    params[index++] = 'GMPFLD(1.09)="'      + model.currentDate + '"';
    params[index++] = 'GMPFLD(1.1)="'       + model.serviceConnected + '"';
    params[index++] = 'GMPFLD(1.11)="'      + model.agentOrange + '"';
    params[index++] = 'GMPFLD(1.12)="'      + model.radiation + '"';
    params[index++] = 'GMPFLD(1.13)="'      + model.persianGulfVet + '"';
    params[index++] = 'GMPFLD(1.14)="'      + model.acuity + '"';
    params[index++] = 'GMPFLD(1.15)="'      + model.headOrNeckCancer + '"';
    params[index++] = 'GMPFLD(1.16)="'      + model.MST + '"';
    params[index++] = 'GMPFLD(1.17)="'      + model.combatVet + '"';
    params[index++] = 'GMPFLD(1.18)="'      + model.shipboard + '"';
    params[index++] = 'GMPFLD(80001)="'     + model.snomedCode + '"';
    params[index++] = 'GMPFLD(80002)="^"';
    if (_.isUndefined(model.newTermText)) {
        params[index++] = 'GMPFLD(80101)="^"';
        params[index++] = 'GMPFLD(80102)="^"';
    } else {
        params[index++] = 'GMPFLD(80101)="1^True"';
        params[index++] = 'GMPFLD(80102)="' + model.newTermText + '^' + model.newTermText + '"';
    }

    params[index++] = 'GMPFLD(80201)="'       + model.dateRecorded + '"';

    params[index++] = 'GMPFLD(80202)="10D^ICD-10-CM"';

    if (_.isArray(model.comments) && model.comments.length) {
        params[index++] = 'GMPFLD(10,0)="' + model.comments.length + '"';
        for (var x = 1; x <= model.comments.length; x ++) {
            params[index++] = 'GMPFLD(10,"NEW",' + x + ')="' + model.comments[x - 1] + '"';
        }
    } else {
        params[index] = 'GMPFLD(10,0)="0"';
    }

    return params;
}

function problemMatch(logger, model, problem) {
    // basic sanity check on the problem definition
    if (_.isUndefined(model) || _.isUndefined(problem) || _.isUndefined(problem.entered)
        || _.isUndefined(problem.updated) || _.isUndefined(problem.problemText)
        || _.isUndefined(problem.providerUid)) {
        logger.error ({model: model, problem: problem});
        return false;
    }

    logger.debug({MatchingOnProblem: problem, model: model});
    var today = moment().format('YYYYMMDD');

    if (today !== problem.entered.toString()) {
        logger.debug({today: today, enteredDate: problem.entered});
        return false;
    }

    if (! _.startsWith(problem.problemText, model.problemName)) {
        logger.debug({problemText: problem.problemText, problemName: model.problemName});
        return false;
    }

    if (! _.endsWith(problem.providerUid, model.responsibleProviderIEN.toString())) {
        logger.debug({providerUid: problem.providerUid, responsibleProviderIEN: model.responsibleProviderIEN});
        return false;
    }

    return true;
}

function getNewProblem(logger, problems, model) {
    if (!_.isArray(problems)) {
        logger.error({input: 'bad input'});
        return '';
    }

    var index = 0;
    var length = problems.length;
    while (index < length) {
        if (problemMatch(logger, model, problems[index])) {
            logger.debug({matchedProblem: problems[index]});
            return problems[index];
        }

        index ++;
    }

    // tears... did not find a matching problem
    logger.error({matchedProblem: ''});

    return '';
}

function callRpcFunctions(writebackContext, siteId, rpcClient, passedInCallback) {
    var logger = writebackContext.logger;
    var model = writebackContext.model;

    async.waterfall([
        // returns BAD_ADD_RESPONSE (-1) for failure and 1 for success...
        function addProblem(callback) {
            var parameters = [];
            parameters.push(model.patientIEN);
            parameters.push(model.recordingProviderIEN);
            parameters.push(siteId);
            parameters.push(model.rpcParameters);

            var me = _.toArray(model.rpcParameters);
            logger.debug({me: me});


            logger.debug({parameters: parameters});

            rpcClient.execute('ORQQPL ADD SAVE', parameters, function (error, result) {
                if (error) {
                    return callback(error);
                }

                return callback(null, result);
            });
        },
        function getProblemJSON(input, callback) {
            //if we failed the first call, nothing else left to do
            // bail out...
            if (input === BAD_ADD_RESPONSE) {
                logger.error({errorFromFirst: input});
                return callback(BAD_ADD_RESPONSE);
            }

            var parameters = {'"patientId"': model.patientIEN, '"domain"': 'problem'};
            rpcClient.execute('HMP GET PATIENT DATA JSON', parameters, function (error, response) {
                logger.debug({rpcError: error, response: response});

                if (! _.isEmpty(error) && !_.isEmpty(response)) {
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

                var problems = parsedResponse.data.items;

                if (_.isEmpty(problems)) {
                    return callback('malformed response');
                }

                // lets find the problem we just added to send to VxSync write end point
                var retVal = getNewProblem(logger, problems, model);

                if (_.isEmpty(retVal)) {
                    return callback('missing problem record');
                }
                return callback(null, retVal);
            });
        }],
        function(err, results) {
            if(err) {
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



function add(writebackContext, callback) {
    var logger = writebackContext.logger;
    var context = writebackContext.vistaConfig.context;

    transformModel(logger, writebackContext.model);
    var model = writebackContext.model;

    logger.debug({problemModel: model});

    writebackContext.model.rpcParameters = constructRpcArgs(model);

    logger.debug({rpcParameters: writebackContext.model.rpcParameters});

    rpcClientFactory.getRpcClient(writebackContext, context, function (error, rpcClient) {
        if (error) {
            return callback(error);
        }

        callRpcFunctions(writebackContext, writebackContext.vistaConfig.division, rpcClient, callback);
    });
}

module.exports.add = add;
module.exports._constructRpcArgs = constructRpcArgs;
module.exports._transformModel = transformModel;
module.exports._problemMatch = problemMatch;

