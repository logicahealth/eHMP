// appointments

var maputil = require('./maputil.js');

var map = function (v2JSON) {
    var statusListStatus;
    var statusComplete = false;
    var retrievedCount;

    if (v2JSON.queryComplete === "true") {
        for (var i = 0; i < v2JSON.statusList.length; i++) {
            if (v2JSON.statusList[i].SiteStatus === "COMPLETE") {
                retrievedCount = Number(v2JSON.statusList[i].RetrievedCount);
            }
            statusListStatus = v2JSON.statusList[i];
            statusComplete = true;
        }
    }

    var v4JSON = {};

    if (statusComplete) {
        v4JSON = {
            "queryComplete": true,
            "statusList": maputil.v4StatusList(retrievedCount)
        };
    }

    var v4DataList = [];

    for (var i = 0; i < v2JSON.dataList.length; i++) {
        var v2DataRecord = v2JSON.dataList[i].dataRecord;

        var v4DataRecord = maputil.baseTransform(v2DataRecord);


        v4DataRecord.arrivalDate = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.CheckinTime);
        v4DataRecord.departureDate = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.CheckoutTime);
        v4DataRecord.classification = maputil.nullInsteadOfEmptyString(v2DataRecord.AppointmentClassification);
        v4DataRecord.comment = maputil.nullInsteadOfEmptyString(v2DataRecord.AppointmentComment);
        v4DataRecord.date = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.AppointmentDateTime);
        v4DataRecord.disposition = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.Disposition, "display");
        v4DataRecord.location = {
            "name": v2DataRecord.Clinic
        };
        v4DataRecord.provider = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.Provider, "name");
        v4DataRecord.reason = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.AppointmentReason, "display");
        v4DataRecord.status = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.Status, "display");
        v4DataRecord.type = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.AppointmentType, "display");


        v4DataList.push(v4DataRecord);

    }

    v4JSON["dataList"] = {"appointments": v4DataList};

    return v4JSON;

};

module.exports.map = map;