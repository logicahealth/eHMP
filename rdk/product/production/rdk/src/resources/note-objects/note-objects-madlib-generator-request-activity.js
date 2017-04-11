'use strict';
var _ = require('lodash');
var moment = require('moment');
var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;

/***********************************************************************
 * INCOMING:  A single Clinical Object
 * PROCESSING: Generate a madlib str containing a summary text of
 *              all requests and responses in the Clinical Object,
 *              per the format specified for Request Activity Note Object.
 ***********************************************************************/

var lineFormatter = '\n';

function normalizeDate(input) {
    var retVal;

    input = input.toString();
    retVal = moment(input).format('MM/DD/YYYY');
    return retVal;
}

function generateRequestStr (request) {

    var retVal = normalizeDate(request.submittedTimeStamp) + lineFormatter;

    retVal += _.unescape(request.title) + lineFormatter;

    if (request.urgency != "Routine") {
        retVal += request.urgency + lineFormatter;
    }

    retVal += "Requested by: "+ request.submittedByName + lineFormatter;
    retVal += "Request: "+ _.unescape(request.request) + lineFormatter;

    if (request.assignTo === "Me") {
        retVal += "Assigned to: "+ request.submittedByName + lineFormatter;
    } else {
        retVal += "Assigned to: "+ getAssignTo(request, request.submittedByName)
                    + lineFormatter;
    }
    return retVal;
}

var responseActionMap = {
    "complete" : "Completed by: ",
    "clarification": "Returned For Clarification by: ",
    "decline" : "Declined by: ",
    "reassign": "Reassigned to: "
}

function generateResponseStr(response) {

    var action = responseActionMap[response.action];

    var retVal = normalizeDate(response.submittedTimeStamp) + lineFormatter;
    retVal += action;

/*
 * If the action is "complete" there is not assignment
 */
    if(response.action != "complete") {
        retVal += getAssignTo(response, response.submittedByName) + lineFormatter; //TODO
    }
    else {
        retVal += response.submittedByName + lineFormatter;
    }
    retVal += _.unescape(response.request ? response.request + "." + lineFormatter: response.comment ? response.comment+ "." + lineFormatter: "");

    return retVal;
}

function addType(type) {
    return function(item) {
        item._type = type;
        return item;
    }
}

/*
 * Create a string of all incoming Request Activity clinical Object's
 * request(s) and response(s) in sequential submittedDateTime order
 *
 * activityRequests - the "data" portion of the Request Activity clinical Object
 * @return madlib string
 */
function getActivityRequestMadlib(activityRequests) {
    var retVal;

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

    retVal = madlibStrings.join(lineFormatter);

    return retVal;
}

function getAssignTo(item, personName) {
    var retStr = "";
    var listOfRoles;
    _.forEach(item.route.assignedRoles, function(role, n) {
        if (n === 0) {
            listOfRoles = role.name;
        } else {
            listOfRoles += ", " + role.name;
        }
    })

    //----------------------------------------------
    // Assign to Person use case
    //----------------------------------------------
    if (item.assignTo  === "Person") {
        retStr += personName + " at " + item.route.facility;
    }
    //----------------------------------------------
    // Assign to a Team or to a Team Care Type using My teams or Any Team use case
    //----------------------------------------------
    else if (item.assignTo === "My Teams" || item.assignTo === "Any Team") {
        //----------------------------
        // Assign to a team
        //----------------------------
        if (item.route.patientsAssignment) {
            retStr += "Patients " + item.route.teamCareType.name + " team. ";
            retStr += " Roles: " + listOfRoles;
        }
        //----------------------------
        // Assign to a Team Care Type
        //----------------------------
        else {
            retStr += item.route.team.name + " at " + item.route.facility;
            retStr += " Roles: " + listOfRoles;
        }
    }

    retStr += ". ";
    return retStr;
}

/*
 * Call madlib generator for an incoming single Request Activity clinical object
 *
 * sourceClinicalObject - incoming single Request Activity clinical object
 * @return madlib string
 */
function getMadlibString(errorMessages, sourceClinicalObject) {

    if (!_.isObject(sourceClinicalObject)) {
        errorMessages.push('sourceClinicalObject model is not an object');
        return;
    }

    var activityData = sourceClinicalObject.data;

    if (!_.isEmpty(activityData)) {
        var madlib =  getActivityRequestMadlib(sourceClinicalObject.data);
        return madlib;
    }

    return 'Default RequestActivity madlib for ' + sourceClinicalObject.uid;
}

module.exports.getMadlibString = getMadlibString;
