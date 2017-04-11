'use strict';

var _ = require('lodash');
var moment = require('moment');
var filemanDateUtil = require('../../utils/fileman-date-converter');
var paramUtil = require('../../utils/param-converter');


var DATE_DISPLAY_FORMAT = 'MM DD YYYY';
var BAD_ADD_RESPONSE = -1;

function vistafyDateTime(dateTime) {
    // expected format is YYYYMMDDhhmmss
    if (_.isEmpty(dateTime) || dateTime.length < 14) {
        return '';
    }

    var retVal;
    var hoursAndMinutes;
    var seconds;

    retVal = dateTime.substring(0, 8);
    hoursAndMinutes = dateTime.substring(8, 12);

    seconds = dateTime.substring(12, 14);
    retVal = filemanDateUtil.getFilemanDateWithArgAsStr(retVal);
    retVal += '.' + hoursAndMinutes + seconds;
    return retVal;
}

function convertDate_DateTimeToVista(input){
    if (_.isUndefined(input) || !_.isString(input)) {
        return '';
    }

    if (input.length === 14) { // YYYYMMDDhhmmss
        return vistafyDateTime(input);
    }

    //handle fuzzy dates
    if(input.length === 8) {
        if (input.slice(-2) === '00') {
            return filemanDateUtil.getFilemanDateWithArgAsStr(input);
        }

        input += '000000';
        return vistafyDateTime(input);
    }

    return '';
}

function adjustTreatmentFactor(input) {
    var retVal = '1^YES';

    // Treatment Factors: defaulting to NO
    if (_.isUndefined(input) || (input === '0')) {
        retVal = '0^NO';
    } else {
        var upperCase = input.toUpperCase();
        if (upperCase === 'NO') {
            retVal = '0^NO';
        }
    }
    return retVal;
}

function adjustTreatmentFactors(model) {
    model.serviceConnected = adjustTreatmentFactor(model.serviceConnected);
    model.agentOrange = adjustTreatmentFactor(model.agentOrange);
    model.radiation = adjustTreatmentFactor(model.radiation);
    model.shipboard = adjustTreatmentFactor(model.shipboard);
    model.persianGulfVet = adjustTreatmentFactor(model.persianGulfVet);
    model.combatVet = adjustTreatmentFactor(model.combatVet);
    model.MST = adjustTreatmentFactor(model.MST);
    model.headOrNeckCancer = adjustTreatmentFactor(model.headOrNeckCancer);
}


function handleIncomingComments(logger, originalCommentsIndeces, newComments, originalComments, userIEN, params, index){
    if (_.isUndefined(params) || _.isNull(params)) {
        return 0;
    }

    logger.debug({original: originalComments, newComments: newComments});

    // no comments at all
    if (!_.isArray(newComments) || _.isEmpty(newComments) || !_.isArray(originalComments)) {
        params[index++] = 'GMPFLD(10,0)="0"';
        return index;
    }

    if (originalComments.length > newComments.length) {
        logger.error({error: 'less original comments and what is coming to us',
            original: originalComments, newComments: newComments});
        params[index++] = 'GMPFLD(10,0)="0"';
        return index;
    }

    var today = moment().format('MMM DD YYYY');
    var cur = 0;
    var comment;
    while(cur < originalComments.length) {
        comment = newComments[cur];
        var order = getMeAnIndex(originalCommentsIndeces, cur);
        cur ++;
        params[index++] = 'GMPFLD(10,' + cur + ')="'       + order + '^1^' + comment + '^A^' +
            today + '^' + userIEN + '"';
    }

    // there are new comments left? if the newComments length is more than original,
    // the answer is yes...

    cur = originalComments.length;

    while(cur < newComments.length) {
        comment = newComments[cur];
        cur ++;
        params[index++] = 'GMPFLD(10,"NEW",' + cur + ')="' + comment + '"';
    }

    params[index++] = 'GMPFLD(10,0)="' + newComments.length + '"';
    var arr = _.values(params);
    console.log(arr);

    return index;
}

function getMeAnIndex(originalCommentsIndeces, index) {
    if (_.isArray(originalCommentsIndeces) && ! _.isUndefined(originalCommentsIndeces[index])){
        return originalCommentsIndeces[index];
    }

    return index;
}

function handleOriginalComments(logger, originalCommentsIndeces, originalComments, userIEN, username, params, index){
    if (_.isUndefined(params) || _.isNull(params)) {
        return 0;
    }
    // no original comments at all
    if (!_.isArray(originalComments) || _.isEmpty(originalComments)) {
        params[index++] = 'GMPORIG(10,0)="0^"';
        return index;
    }

    params[index++] = 'GMPORIG(10,0)="' + originalComments.length + '^"';

    var today = filemanDateUtil.getFilemanDate(new Date());
    var cur = 0;
    _.forEach(originalComments, function(comment){
        var order = getMeAnIndex(originalCommentsIndeces, cur);
        cur ++;
        params[index++] = 'GMPORIG(10,' + cur + ')="' + order + '^1^' + comment + '^A^' + today + '^' + userIEN + '^' +
            username + '"';
    });

    var arr = _.values(params);
    console.log(arr);

    return index;
}

function getVistaFormattedDateString(date){
    var outputDate;

    //handle fuzzy dates
    if(date && (date.length === 8 && date.slice(-2) === '00')){
        outputDate = filemanDateUtil.getFilemanDateWithArgAsStr(date);
    } else {
        var dateTimeMoment = paramUtil.convertWriteBackInputDate(date);
        outputDate = filemanDateUtil.getFilemanDate(dateTimeMoment.toDate()) + '^' + dateTimeMoment.format(DATE_DISPLAY_FORMAT);
    }

    return outputDate;
}

function retrieveSettings(input, field1, field2) {

    if(! _.isArray(input) || _.isEmpty(input)) {
        return null;
    }

    var currentValue;
    var current = 0;
    var count = input.length;
    while (current < count) {
        currentValue = input[current ++];

        if (currentValue.indexOf(field1) !== 0) {
            continue;
        }

        var index = currentValue.indexOf(field2);
        if (index === -1) {
            continue;
        }

        return currentValue.substring(index + field2.length + 1);
    }

    return null;
}

function getOriginalCommentIndeces(originalComments, result) {
    var originalCommentIndeces = [];
    var originalCommentCount = _.isUndefined(originalComments) ? 0 : originalComments.length;

    if (_.isUndefined(result) || originalCommentCount == 0) {
        return originalCommentIndeces;
    }

    var i = 0;
    var commentIndex = 1;
    while (i < originalCommentCount) {
        var value = retrieveSettings(result, 'ORG', '10,' + commentIndex);
        value = value.split('^');
        value = value[0];
        originalCommentIndeces.push(value);

        commentIndex++;
        i++;
    }

    console.log(originalCommentIndeces);
    return originalCommentIndeces;
}



module.exports._dateTimeToVista = vistafyDateTime;
module.exports._convertDate_DateTimeToVista = convertDate_DateTimeToVista;
module.exports.adjustTreatmentFactors = adjustTreatmentFactors;
module.exports.adjustTreatmentFactor = adjustTreatmentFactor;
module.exports.handleIncomingComments = handleIncomingComments;
module.exports.handleOriginalComments = handleOriginalComments;
module.exports._getVistaFormattedDateString = getVistaFormattedDateString;
module.exports_getMeAnIndex = getMeAnIndex;
module.exports.getOriginalCommentIndeces = getOriginalCommentIndeces;
module.exports.retrieveSettings = retrieveSettings;
module.exports.DATE_DISPLAY_FORMAT = DATE_DISPLAY_FORMAT;
module.exports.BAD_ADD_RESPONSE = BAD_ADD_RESPONSE;