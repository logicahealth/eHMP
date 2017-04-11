var moment = require('moment');

var baseTransfom = function (v2DataRecord) {
    var v4DataRecord = {};

    v4DataRecord.repository = {};
    v4DataRecord.repository.name = v2DataRecord.CustodianName;
    v4DataRecord.repository.ids = [{
        "assigningAuthority": v2DataRecord.RepositoryId
    }];
    v4DataRecord.recordId = {};
    v4DataRecord.recordId.id = v2DataRecord.EventId;
    v4DataRecord.enteredBy = nullInsteadOfEmptyOneElementObject(v2DataRecord.EnteredBy, "name");
    v4DataRecord.enteredDate = nullInsteadOfFormattedDateObject(v2DataRecord.EnteredByDate);
    v4DataRecord.dataDomain = [{
        "system": "2.16.840.1.113883.6.1",
        "primary": true,
        "display": null,
        "code": v2DataRecord.LoincCode
    }];
    //v4DataRecord.facility = {};
    //v4DataRecord.facility.name = v2DataRecord.Facility;
    v4DataRecord.facility = nullInsteadOfEmptyOneElementObject(v2DataRecord.Facility, "name");

    return v4DataRecord;
};

// if the string is an empty string returns a null, otherwise just return the string
var nullInsteadOfEmptyString = function(theString) {
    if (!theString) {
        return null;
    }
    return theString;
}

// if the string is an empty string returns a null, otherwise return an object that has the
// string as a value with the given key
// for example
//   nullInsteadOfEmptyOneElementObject("yes", "notEmpty") = {"notEmpty": "yes"}
//   nullInsteadOfEmptyOneElementObject("", "notEmpty") = null
var nullInsteadOfEmptyOneElementObject = function(theString, key) {
    if (!theString) {
        return null;
    }
    var returnObject = {};
    returnObject[key] = theString;
    return returnObject;
}

var nullInsteadOfEmptyOneElementObjectWithPrimary = function(theString, key) {
    if (!theString) {
        return null;
    }
    var returnObject = {};
    returnObject[key] = theString;
    returnObject.primary = true;
    return returnObject;
}

// if the string is an empty string returns a null, otherwise return an object that has the
// string as a value with the given key
// for example
//   nullInsteadOfEmptyOneElementObject("yes", "notEmpty") = {"notEmpty": "yes"}
//   nullInsteadOfEmptyOneElementObject("", "notEmpty") = null
var nullInsteadOfEmptyOneElementObjectArray = function(theString, key) {
    if (!theString) {
        return null;
    }
    var returnObject = {};
    returnObject[key] = theString;
    return [returnObject];
}

var emptyArrayInsteadOfEmptyOneElementObjectArray = function(theString, key) {
    if (!theString) {
        return [];
    }
    var returnObject = {};
    returnObject[key] = theString;
    return [returnObject];
}

var emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary = function(theString, key) {
    if (!theString) {
        return [];
    }
    var returnObject = {};
    returnObject[key] = theString;
    returnObject.primary = true;
    return [returnObject];
}

var v4StatusList = function(recordCount) {
    return [
        {
            "partner": {
                "partnerIdentifier": "2.16.840.1.113883.3.42.126.100001.13",
                "partnerName": "ahlta",
                "partnerType": "DOD"
            },
            "partnerStatus": "SUCCESS",
            "expectedCount": recordCount,
            "receivedCount": recordCount
        }
    ]
}

var nullInsteadOfFormattedDateObject = function (originalDate) {
    if (!originalDate) {
        return null;
    }

    var formattedDate = moment(originalDate, 'YYYYMMDDTHHmmss').format('YYYY-MM-DDTHH:mm:ss');
    return {
        "start": formattedDate,
        "end": formattedDate
    };
}

var convertDateFormat = function (originalDate) {
    if (!originalDate) {
        return null;
    }

    return formattedDate = moment(originalDate).format('YYYY-MM-DDTHH:mm:ss');
}

module.exports.baseTransform = baseTransfom;
module.exports.nullInsteadOfEmptyString = nullInsteadOfEmptyString;
module.exports.nullInsteadOfEmptyOneElementObject = nullInsteadOfEmptyOneElementObject;
module.exports.nullInsteadOfEmptyOneElementObjectWithPrimary = nullInsteadOfEmptyOneElementObjectWithPrimary;
module.exports.nullInsteadOfEmptyOneElementObjectArray = nullInsteadOfEmptyOneElementObjectArray;
module.exports.emptyArrayInsteadOfEmptyOneElementObjectArray = emptyArrayInsteadOfEmptyOneElementObjectArray;
module.exports.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary = emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary;
module.exports.v4StatusList = v4StatusList;
module.exports.convertDateFormat = convertDateFormat;
module.exports.nullInsteadOfFormattedDateObject = nullInsteadOfFormattedDateObject;