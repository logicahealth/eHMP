'use strict';
var _ = require('lodash');
var moment = require('moment');
var lineFormatter = '\n';

// generate consult order madlib string
/*
 * Consult Order -
 *
 *  Message
 *    <Order: consultName>: <Order: condition, Label: "Assoc" If no conditions related to consult, then do not show label>
 *    <text: "Reason for Consult:">
 *    <Order: requestQuestion, Label: "Request - ">
 *    <Order: requestComment, Label: "Comment (Clinical History) - ", Rule: if no comment due not show label>
 *  Examples
 *    Physical Therapy – Back, Assoc: Hypertension
 *    Reason for Consult:
 *    Request - Evaluate flexibility in lower back.
 *    Comment (Clinical History) - Patient is having trouble with sitting
 *
 */

function normalizeDate(input) {
    var dateString = 'Unknown date';

    if (input !== undefined && !_.isEmpty(input)) {
        dateString = moment(input.toString(), ['MM-DD-YYYY','MM/DD/YYYY','MM-DD-YY']).format('MM/DD/YYYY');
    }
    return dateString;
}

function getClinicalMadlib(source) {
    var madlibString = '';

    if (_.isEmpty(source.consultOrders)) {
        return madlibString;
    }

    var order = source.consultOrders[0];
    madlibString += _.get(order, 'orderable.name') || 'NAME NOT FOUND';

    if (!_.isEmpty(order.conditions)) {
        var assoc = _.get(order, 'conditions[0].name');
        madlibString += assoc ? ', Assoc: ' + assoc : '';
    }

    madlibString += lineFormatter;
    madlibString += 'Reason for Consult:' + lineFormatter;

    if (!_.isEmpty(order.request)) {
        madlibString += 'Request - ' + order.request + lineFormatter;
    } else {
        madlibString += 'Request - ' + lineFormatter; // should never happen
    }

    if (!_.isEmpty(order.comment)) {
        madlibString += 'Comment (Clinical History) - ' + order.comment + lineFormatter;
    }
    return madlibString;
}

module.exports.getMadlibString = function getMadlibString(errorMessages, sourceClinicalObject) {
    if (!_.isObject(sourceClinicalObject)) {
        errorMessages.push('sourceClinicalObject model is not an object');
        return;
    }
    var source = sourceClinicalObject.data;
    if (source !== undefined && !_.isEmpty(source)) {
        return getClinicalMadlib(source);
    }
    return 'Default clinical madlib for ' + sourceClinicalObject.uid;
};
