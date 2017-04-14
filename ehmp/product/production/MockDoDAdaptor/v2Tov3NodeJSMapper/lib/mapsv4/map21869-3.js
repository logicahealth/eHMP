// admissions

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

        v4DataRecord.arrivalDate = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.AdmissionDate);
        //v4DataRecord.recordId = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.AdmissionId, "id");
        v4DataRecord.type = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.AdmissionType, "display");
        v4DataRecord.provider = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.AdmittingProvider, "name");
        v4DataRecord.departureDate = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.DispositionDate);
        v4DataRecord.disposition = maputil.nullInsteadOfEmptyOneElementObjectWithPrimary(v2DataRecord.DispositionType, "display");
        v4DataRecord.division = maputil.nullInsteadOfEmptyString(v2DataRecord.Division);

        v4DataList.push(v4DataRecord);

    }

    v4JSON["dataList"] = {"admissions": v4DataList};

    return v4JSON;

};

module.exports.map = map;