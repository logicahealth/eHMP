'use strict';

var _ = require('lodash');
var RpcClient = require('vista-js').RpcClient;

var filemanDateUtil = require('../../utils/fileman-date-converter');
var nullChecker = require('../../utils/nullchecker');
var paramUtil = require('../../utils/param-converter');
var allergiesConstants = require('./constants');

/*
 ("GMRACHT",0)=1
 ("GMRACHT",1)=3150603.0905
 ("GMRAGNT")="DIGITOXIN^9;PSNDF(50.6,"
 ("GMRAOBHX")="o^OBSERVED"
 ("GMRAORDT")=3141203.1337
 ("GMRAORIG")=10000000224
 ("GMRAORDT")=3150603.0805
 ("GMRASEVR")=2
 ("GMRATYPE")="D^Drug"
 ("GMRANATR")="A^Allergy"
 ("GMRASYMP",0)=2
 ("GMRASYMP",1)="2^ITCHING,WATERING EYES"
 ("GMRASYMP",2)="133^RASH"
 */
function getAllergyRPCString(model, logger) {
    logger.debug({AllergiesVistaWriterModel: model});
    var allergies = {
        '"GMRAGNT"': model.allergyName,
        '"GMRATYPE"': '',
        '"GMRANATR"': model.natureOfReaction,
        '"GMRAORIG"': model.enteredBy,
        '"GMRAORDT"': null,
        '"GMRAOBHX"': model.historicalOrObserved
    };

    //Set GMRACMTS
    if (model.comment !== '') {
        allergies['"GMRACMTS",0'] = '1';
        allergies['"GMRACMTS",1'] = model.comment;
    }

    //Set GMRATYPE
    if (allergies['"GMRANATR"'] === allergiesConstants.GMRANATR_PHARMACOLGICAL) {
        allergies['"GMRATYPE"'] = allergiesConstants.GMRATYPE_DRUG;
    } else {
        allergies['"GMRATYPE"'] = allergiesConstants.GMRATYPE_OTHER;
    }

    //Set GMRAORDT
    var currentTime = new Date();
    allergies['"GMRAORDT"'] = filemanDateUtil.getFilemanDateTime(currentTime);

    //Set GMRASYMP
    allergies['"GMRASYMP",0'] = _.size(model.symptoms).toString();

    _.each(model.symptoms, function (symptom, index) {
        var fileManDT = '';
        var displayDate = '';

        if (!nullChecker.isNullish(symptom.dateTime)) {
            var sympDT = paramUtil.convertWriteBackInputDate(symptom.dateTime);
            fileManDT = filemanDateUtil.getFilemanDateTime(sympDT.toDate());
            displayDate = sympDT.format('MMM DD,YYYY@HH:mm');
        }

        allergies['"GMRASYMP",' + (index + 1)] = symptom.IEN + '^' + symptom.name + '^' + fileManDT + '^' + displayDate + '^';
    });

    //Set GMRACHT
    var eventDateTimeMoment = paramUtil.convertWriteBackInputDate(model.eventDateTime);
    var eventFilemanYear = filemanDateUtil.getFilemanDateWithArgAsStr(eventDateTimeMoment.format(paramUtil.WRITEBACK_INPUT_DATE_FORMAT));

    if (eventFilemanYear !== -1) {
        allergies['"GMRACHT",0'] = '1';
        allergies['"GMRACHT",1'] = eventFilemanYear + '.' + eventDateTimeMoment.format(paramUtil.WRITEBACK_INPUT_TIME_FORMAT);
    }

    // let's persist the observed date and severity regardless of the allergy type,
    // observed or historical.
    // if they are specified, lets write it.
    if (model.observedDate) {
        var observedDate = getVistaFormattedDateString(model.observedDate);
        if (observedDate !== -1) {
            allergies['"GMRARDT"'] = observedDate;
        }
    }

    if (model.severity) {
        allergies['"GMRASEVR"'] = model.severity;
    }

    return allergies;
}

function getVistaFormattedDateString(date){
    var outputDate;
    if(date && (date.length === 8 && date.slice(-2) === '00')){
        outputDate = filemanDateUtil.getFilemanDateWithArgAsStr(date);
    } else {
        var dateTimeMoment = paramUtil.convertWriteBackInputDate(date);
        var time = dateTimeMoment.format(paramUtil.WRITEBACK_INPUT_TIME_FORMAT);
        outputDate = filemanDateUtil.getFilemanDateWithArgAsStr(dateTimeMoment.format(paramUtil.WRITEBACK_INPUT_DATE_FORMAT));
        if (!nullChecker.isNullish(time)) {
            outputDate = outputDate + '.' + time;
        }
    }

    return outputDate;
}

function getAllergyEIERPCString(model, logger) {
    logger.debug({getAllergy: model});

    var rpcArguments = '';
    rpcArguments += model.ien;
    rpcArguments += '^YES^';
    rpcArguments += model.enteredBy;
    rpcArguments += '^';
    rpcArguments += filemanDateUtil.getFilemanDateTime(new Date());
    rpcArguments += '^';

    if (_.isArray(model.comments)) {
        rpcArguments += _.size(model.comments);
        rpcArguments += '^';
        rpcArguments += model.comments.join(',');
    } else {
        rpcArguments += '0';
    }

    logger.debug({allergyEIE: rpcArguments});
    return rpcArguments;
}

function handleRPCResponse (writebackContext, err, response) {
    var logger = writebackContext.logger;

    logger.debug({handleRPCResponse: response});

    if (err) {
        logger.error({rpcError: err});
        writebackContext.vprModel = null;
        writebackContext.vprResponse = {error: err};
        return;
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
        return;
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
        writebackContext.vprResponseStatus = 409;
        return;
    }

    // looks like we got something useful...
    writebackContext.vprResponse = {items: response};
    writebackContext.vprModel = response;
}

function create (writebackContext, callback) {
    var logger = writebackContext.logger;
    var vistaConfig = writebackContext.vistaConfig;
    var model = writebackContext.model;

    var allergies = getAllergyRPCString(writebackContext.model, logger);
    logger.debug({allergies: allergies});


    RpcClient.callRpc(logger, vistaConfig, 'HMP WRITEBACK ALLERGY', [0, model.dfn, allergies], function (err, result) {
        handleRPCResponse(writebackContext, err, result);
        if (_.isNull(writebackContext.vprModel)) {
            return callback(null);
        }

        return callback(null, writebackContext.vprModel);
    });
}

function update(writebackContext, callback) {
    var logger = writebackContext.logger;
    var vistaConfig = writebackContext.vistaConfig;
    var model = writebackContext.model;

    //var rpcArguments = '987^3^YES^1^3150812.144304^2^COMMENT TEST TEX,abcd,dfef';
    var rpcArguments = getAllergyEIERPCString(model, logger);

    RpcClient.callRpc(logger, vistaConfig, 'HMP WRITEBACK ALLERGY EIE', rpcArguments, function (err, result) {
        handleRPCResponse(writebackContext, err, result);
        if (_.isNull(writebackContext.vprModel)) {
            return callback(writebackContext.vprResponse.error);
        }

        return callback(null, writebackContext.vprModel);
    });
}

module.exports.create = create;
module.exports.enteredInError = update;
module.exports._getAllergyEIERPCString = getAllergyEIERPCString;
module.exports._handleRPCResponse = handleRPCResponse;
module.exports._getAllergyRPCString = getAllergyRPCString;
module.exports._getVistaFormattedDateString = getVistaFormattedDateString;