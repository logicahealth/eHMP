'use strict';

var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var rdk = require('../../core/rdk');
var locationUtil = rdk.utils.locationUtil;
var nullchecker = rdk.utils.nullchecker;
var RpcClient = require('vista-js').RpcClient;
var filemanDateUtil = require('../../utils/fileman-date-converter');

var rpcDelimiter = '^';
var fieldDelimiter = ';';

function convertUITimeToVista(time) {
    // expected format is YYYYMMDDhhmmss
    if (_.isEmpty(time) || time.length < 14) {
        return '';
    }

    var retVal;
    var hoursAndMinutes;
    var seconds;

    retVal = time.substring(0, 8);
    hoursAndMinutes = time.substring(8, 12);

    seconds = time.substring(12,14);
    retVal = filemanDateUtil.getFilemanDateWithArgAsStr(retVal);
    retVal += '.' + hoursAndMinutes + seconds;
    return retVal;
}

function immunizationFromModel(logger, model) {
    // mostly for bookkeeping, no need for conversion
    model.incomingVisitDate = model.eventDateTime;

    // convert possible fuzzy dates
    model.encounterDateTime = datetoVistaFormat(model.encounterDateTime);
    model.eventDateTime = datetoVistaFormat(model.eventDateTime);

    // never fuzzy
    model.expirationDate = datetoVistaFormat(model.expirationDate);

    model.VIS = convertVIS(logger, model.VIS);

    // optional fields
    model.encounterProviderIEN   = model.encounterProviderIEN   || '';
    model.series = model.series || '';
    model.comment = model.comment || '';
    model.reaction = model.reaction || '';
    model.lotNumber = model.lotNumber || '';
    model.manufacturer = model.manufacturer || '';
    model.informationSource = model.informationSource || '';
    model.route = model.route || '';
    model.dose = model.dose || '';
    model.cvxCode = model.cvxCode || '';
    model.adminSite = model.adminSite || '';
    model.outsideLocation = model.outsideLocation || '';
    model.immunizationNarrative = model.immunizationNarrative || '';
    model.informationSource = model.informationSource || '';
    model.encounterLocation = locationUtil.getLocationIEN(model.encounterLocation) || '';
    model.providerName = model.providerName || '';
    model.orderingProviderIEN = model.orderingProviderIEN || '';


    // true or false
    model.hasCptCodes = model.hasCptCodes ? 1 : '';
    model.primaryProvider = model.primaryProvider ? 1 : 0;
    model.contraindicated = model.contraindicated ? 1 : 0;
    if (_.isUndefined(model.encounterInpatient) || model.encounterInpatient === '0') {
        model.encounterInpatient = 0;
    } else {
        model.encounterInpatient = 1;
    }
    return model;
}

function constructRpcArgs(immunization) {
    var retVal =  {};
    var index = 1;
    var category = '';
    var locationIEN = (immunization.encounterServiceCategory === 'E') ? '0' : locationUtil.getLocationIEN(immunization.encounterLocation);

    retVal[index++] = 'HDR' +  rpcDelimiter +
        immunization.encounterInpatient + rpcDelimiter +
        immunization.hasCptCodes + rpcDelimiter +
        locationIEN + fieldDelimiter + immunization.encounterDateTime + fieldDelimiter + immunization.encounterServiceCategory;
    retVal[index++] = 'VST^DT^' + immunization.encounterDateTime;
    retVal[index++] = 'VST^PT^' + immunization.encounterPatientDFN;
    if (locationIEN !== '0'){
        retVal[index++] = 'VST^HL^' + locationUtil.getLocationIEN(immunization.encounterLocation);
    }
    retVal[index++] = 'VST^VC^' + immunization.encounterServiceCategory;
    retVal[index++] = 'VST^OL^^' + immunization.outsideLocation;
    retVal[index++] = 'PRV' + rpcDelimiter +
        immunization.encounterProviderIEN + rpcDelimiter +
        rpcDelimiter + rpcDelimiter +
        immunization.providerName + rpcDelimiter +
        immunization.primaryProvider;

    if (!_.isEmpty(immunization.povCode)) {
        retVal[index++] = 'POV+' + rpcDelimiter + immunization.povCode + rpcDelimiter + rpcDelimiter + immunization.povNarrative + rpcDelimiter + 
            '0' + rpcDelimiter + immunization.providerName + rpcDelimiter + '0' + rpcDelimiter + rpcDelimiter;
    }

    retVal[index] = 'IMM+' + rpcDelimiter;
    retVal[index] += immunization.immunizationIEN + rpcDelimiter;
    retVal[index] += category + rpcDelimiter;
    retVal[index] += immunization.immunizationNarrative + rpcDelimiter;
    retVal[index] += immunization.series + rpcDelimiter;
    retVal[index] += immunization.encounterProviderIEN   + rpcDelimiter;
    retVal[index] += immunization.reaction + rpcDelimiter;
    retVal[index] += immunization.contraindicated + rpcDelimiter + rpcDelimiter;
    if (! _.isEmpty(immunization.comment)) {
        retVal[index] += '1';
    }
    retVal[index] += rpcDelimiter;
    retVal[index] += immunization.cvxCode + rpcDelimiter;
    retVal[index] += immunization.informationSource + rpcDelimiter;
    retVal[index] += immunization.dose + rpcDelimiter;
    retVal[index] += immunization.route + rpcDelimiter;
    retVal[index] += immunization.adminSite + rpcDelimiter;
    retVal[index] += immunization.lotNumber + rpcDelimiter;
    retVal[index] += immunization.manufacturer + rpcDelimiter;
    retVal[index] += immunization.expirationDate + rpcDelimiter;
    retVal[index] += immunization.eventDateTime + rpcDelimiter;
    retVal[index] += immunization.orderingProviderIEN   + rpcDelimiter;
    retVal[index] += immunization.VIS;

    index ++;
    if ( ! _.isEmpty(immunization.comment)) {
        retVal[index++] = 'COM^1^' + immunization.comment;
    }

    return retVal;
}

function add(writebackContext, passedInCallback) {
    var logger = writebackContext.logger;
    var vistaConfig = writebackContext.vistaConfig;
    var model = immunizationFromModel(logger, writebackContext.model);
    model.encounterPatientDFN = writebackContext.interceptorResults.patientIdentifiers.dfn;

    if(nullchecker.isNullish(model.encounterPatientDFN)){
        return passedInCallback('Missing required patient identifiers');
    }

    logger.debug({immunizationModel: model});

    var rpcParameters = constructRpcArgs(model);
    logger.debug({rpcParameters: rpcParameters});

    async.waterfall([
        function first(callback) {
            logger.debug('calling first');
            RpcClient.callRpc(logger, vistaConfig, 'PX SAVE DATA', rpcParameters, '','HMP','HMP', function (error, response) {
                logger.debug({rpcError: error, response: response});
                console.log('vista error: ' + error);
                console.log('Response: ' + response);

                if (! _.isEmpty(error) && !_.isEmpty(response)) {
                    logger.error({rpcError: error, response: response});
                    console.log('vista error: ' + error);
                    return callback(error, null);
                }

                if (error) {
                    console.log('Failed to create patient immunization ---   ' + error);
                    logger.error({rpcError: error});
                    return callback(error, null);
                }

                if (isBad(logger, response)) {
                    logger.error({response: response});
                    console.log('(Empty Response)');
                    return callback(error, response);
                }

                return callback(null, response);
            });


        },
        function second(input, callback) {
            logger.debug('calling second');
            if (isBad(logger, input)) {
                logger.error({errorFromFirst: input});
                return callback(-1);
            }

            RpcClient.callRpc(logger, vistaConfig, 'HMP GET PATIENT DATA JSON',
                {'"patientId"': model.encounterPatientDFN, '"domain"': 'immunization'},
                                                                        function (error, response) {
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

                var immunizations = parsedResponse.data;

                if (_.isEmpty(immunizations)) {
                    return callback('malformed response');
                }

                var retVal = getNewImmunization(logger, immunizations, model.incomingVisitDate, model.immunizationNarrative);

                if (_.isEmpty(retVal)) {
                    return callback('did not find a matching immunization JSON corresponding to our change');
                }
                return callback(null, retVal);
            });
        }
    ], function(err, results) {
        if(err) {
            writebackContext.vprResponse = null;
            writebackContext.vprModel = null;
            return passedInCallback(err);
        }

        writebackContext.vprResponse = {items: results};
        writebackContext.vprModel = results;
        writebackContext.encounterServiceCategory = writebackContext.model.encounterServiceCategory;

        // take a snapshot of the model,
        // needs to be in a format that is validatable by the note creation machinery...
        // they check size and can only have a set of specific fields :(
        writebackContext.originalModel = writebackContext.model;

        // construct the note settings...
        var locationUid = writebackContext.model.location;
        writebackContext.model = {};
        writebackContext.model.domain = 'ehmp-observation';
        writebackContext.model.subDomain = 'immunization';
        writebackContext.model.visit = {};
        writebackContext.model.visit.location = locationUid;

        // reuse the original settings...
        writebackContext.model.visit.serviceCategory = writebackContext.originalModel.encounterServiceCategory;
        writebackContext.model.visit.dateTime = writebackContext.originalModel.incomingVisitDate;

        writebackContext.model.ehmpState = 'active';
        writebackContext.model.referenceId = results.uid;
        writebackContext.model.authorUid = results.performerUid;
        writebackContext.model.patientUid = 'urn:va:patient:' + writebackContext.interceptorResults.patientIdentifiers.site + ':' + writebackContext.interceptorResults.patientIdentifiers.dfn + ':' + writebackContext.interceptorResults.patientIdentifiers.dfn;
        writebackContext.model.createdDateTime = moment().format('YYYYMMDDhhmmss');

        return passedInCallback(null);
    });
}

function isBad(logger, response) {
    logger.debug({response: response});

    return _.isEmpty(response) || _.isEmpty(response.trim()) || (parseInt(response) !== -1 && parseInt(response) !== 1);
}

function match(immunization, incomingVisitDate, immunizationNarrative) {
    var immunizationDateTime = immunization.administeredDateTime.toString();

    // does the longer string contain the smaller one ?
    // or the other way around ?
    // if not so, there can not be a match, so bail early
    if (incomingVisitDate.length > immunizationDateTime.length){
        if (incomingVisitDate.indexOf(immunizationDateTime) !== 0) {
            return false;
        }
    } else {
        if (immunizationDateTime.indexOf(incomingVisitDate) !== 0) {
            return false;
        }
    }

    return immunization.name === immunizationNarrative;
}

function getNewImmunization(logger, immunizations, incomingVisitDate, immunizationNarrative) {
    logger.debug({incomingVisitDate: incomingVisitDate, immunizations: immunizations});

    if (_.isEmpty(immunizations) || !_.isArray(immunizations.items) || _.isEmpty(incomingVisitDate) || _.isEmpty(immunizationNarrative)) {
        logger.error({input: 'bad input'});
        return null;
    }

    var index = 0;
    var length = immunizations.items.length;
    while (index < length) {
        if (match(immunizations.items[index], incomingVisitDate, immunizationNarrative)) {
            return immunizations.items[index];
        }

        index ++;
    }

    // did not find it
    logger.error({matchingImnunizationDate: ''});

    return '';
}

function convertVIS(logger, VIS) {
    logger.debug({VIS: VIS});

    if (_.isEmpty(VIS)) {
        logger.error({VIS: VIS});
        return '';
    }

    var dates = VIS.split(';');
    var count = dates.length;

    var retVal = '';
    var index = 1;
    for (var i = 0; i < count; i ++) {

        if (i !== 0) {
            retVal += ';';
        }

        // seperate the IEN from the date
        var parts = dates[i].split('/');
        if (parts.length === 1) {
            logger.error({malformedVIS: VIS});
            return '';
        }

        retVal += parts[0];
        index ++;
        retVal += '/';
        retVal += datetoVistaFormat(parts[1]);
    }
    logger.debug({VISMassaged: retVal});

    return retVal;
}


function datetoVistaFormat(date){

    if (_.isUndefined(date) || !_.isString(date)) {
        return '';
    }

    if (date.length === 14) { // YYYYMMDDhhmmss
        return convertUITimeToVista(date);
    }


    //handle fuzzy dates
    if(date.length === 8) {
        if (date.slice(-2) === '00') {
            return filemanDateUtil.getFilemanDateWithArgAsStr(date);
        }

        date += '000000';
        return convertUITimeToVista(date);
    }

    return '';
}

module.exports.add = add;
module.exports._constructRpcArgs = constructRpcArgs;
module.exports._immunizationFromModel = immunizationFromModel;
module.exports._isBad = isBad;
module.exports._getNewImmunization = getNewImmunization;
module.exports._convertVIS = convertVIS;
module.exports._match = match;
