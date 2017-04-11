'use strict';
var _ = require('lodash');
var moment = require('moment');

/***********************************************************************
 * INCOMING:  A single Clinical Object
 * PROCESSING: Generate a madlib str containing a summary text of
 *              all requests and responses in the Clinical Object,
 *              per the format specified for Request Activity Note Object.
 ***********************************************************************/

var lineFormatter = '\n';

function normalizeDate(input) {
    var newDate;

    input = input.toString();
    newDate = moment(input).format('MM/DD/YYYY');
    return newDate;
}

function generateRequestStr(request) {

    var requestStr = normalizeDate(request.submittedTimeStamp) + lineFormatter;

    requestStr += _.unescape(request.title) + lineFormatter;

    if (request.urgency !== 'routine') {
        requestStr += request.urgency.substring(0, 1).toUpperCase() + request.urgency.substring(1) + lineFormatter;
    }

    requestStr += 'Requested by: ' + request.submittedByName + lineFormatter;
    requestStr += 'Request: ' + _.unescape(request.request) + lineFormatter;
    requestStr += 'Assigned to: ' + getAssignTo(request) + lineFormatter;

    return requestStr;
}

var responseActionMap = {
    'complete': 'Completed by: ',
    'clarification': 'Returned For Clarification by: ',
    'decline': 'Declined by: ',
    'reassign': 'Reassigned to: '
};

function generateResponseStr(response) {
    var action = responseActionMap[response.action];

    var responseStr = normalizeDate(response.submittedTimeStamp) + lineFormatter;
    responseStr += action;

    /*
     * If the action is 'complete' there is not assignment
     */
    if (response.action === 'reassign') {
        // reassign
        responseStr += getAssignTo(response) + lineFormatter;
        responseStr += _.unescape(response.request ? response.request + '.' + lineFormatter : response.comment ? response.comment + '.' + lineFormatter : '');
        responseStr += 'Reassigned by: ';
        responseStr += response.submittedByName + lineFormatter;
    } else if (response.action !== 'complete') {
        // clarification // decline
        responseStr += response.submittedByName + lineFormatter;
        responseStr += _.unescape(response.request ? response.request + '.' + lineFormatter : response.comment ? response.comment + '.' + lineFormatter : '');
        responseStr += 'Assigned to: ';
        responseStr += getAssignTo(response) + lineFormatter;
    } else {
        // complete
        responseStr += response.submittedByName + lineFormatter;
    }

    return responseStr;
}

function addType(type) {
    return function(item) {
        item._type = type;
        return item;
    };
}

/*
 * Create a string of all incoming Request Activity clinical Object's
 * request(s) and response(s) in sequential submittedDateTime order
 *
 * @param {object} activityRequests - the 'data' portion of the Request Activity clinical Object
 * @returns {string} madlib text
 */
function getActivityRequestMadlib(activityRequests) {
    var madlibStr;

    //-------------------------------------------------------------
    //SORT all Requests and Responses asc
    //-------------------------------------------------------------

    // tag to identify request vs response
    var taggedRequests = _.map(activityRequests.requests, addType('request'));
    var taggedResponses = _.map(activityRequests.responses, addType('response'));

    // combine
    var combined = taggedRequests.concat(taggedResponses);

    // sort
    var combinedSort = _.sortByAll(combined, 'submittedTimeStamp');

    //-------------------------------------------------------------
    // ... prepare Requests/Response portion ...
    //-------------------------------------------------------------
    // generate madlib
    var madlibStrings = _.map(combinedSort, function(item) {
        return item._type === 'request' ? generateRequestStr(item) : generateResponseStr(item);
    });

    madlibStr = madlibStrings.join(lineFormatter);

    return madlibStr;
}

function getAssignTo(item) {
    var retStr;

    switch (item.assignTo) {
        case 'Person':
            retStr = item.route.personName + ' at ' + item.route.facilityName;
            break;
        case 'Me':
            retStr = item.submittedByName;
            break;
        case 'My Teams':
        case 'Any Team':
        case 'Patient\'s Teams':
            var rolesStr = '  Roles: ' + _.map(item.route.assignedRoles, 'name').join(', ');

            if (item.route.patientsAssignment) {
                retStr = 'Patients ' + item.route.teamCareType.name + ' team.' + rolesStr;
            } else {
                retStr = item.route.team.name + ' at ' + item.route.team.code + rolesStr;
            }
            break;
        default:
    }
    return retStr;
}

/*
 * Call madlib generator for an incoming single Request Activity clinical object
 *
 * @param {array} errorMessages Reference to error array used to communicate errors in the
 *                              generation of the madlib text
 * @param {object} sourceClinicalObject Incoming single Request Activity clinical object
 * @returns {string} madlib tezxt
 */
function getMadlibString(errorMessages, sourceClinicalObject) {

    if (!_.isObject(sourceClinicalObject)) {
        errorMessages.push('sourceClinicalObject model is not an object');
        return;
    }

    var activityData = sourceClinicalObject.data;

    if (!_.isEmpty(activityData)) {
        var madlib = getActivityRequestMadlib(sourceClinicalObject.data);
        return madlib;
    }

    return 'Default RequestActivity madlib for ' + sourceClinicalObject.uid;
}

module.exports.getMadlibString = getMadlibString;
