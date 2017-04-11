// orders consults

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

        var v4DataRecord = mapConsultDataRecord(v2DataRecord);

        v4DataList.push(v4DataRecord);
    }

    v4JSON["dataList"] = {"consultOrders": v4DataList};

    return v4JSON;

};

var mapConsultDataRecord = function (v2DataRecord) {
    var v4DataRecord = maputil.baseTransform(v2DataRecord);

    v4DataRecord.orderable = [
        {
            "display": maputil.nullInsteadOfEmptyString(v2DataRecord.Description),
            "code": maputil.nullInsteadOfEmptyString(v2DataRecord.Ncid),
            "system": "2.16.840.1.113883.3.42.126.100001.16"
        }
    ];
    v4DataRecord.date = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.OrderDate);
    v4DataRecord.orderNumber = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.OrderId, "id");
    v4DataRecord.orderingProvider = maputil.nullInsteadOfEmptyOneElementObjectWithPrimary(v2DataRecord.OrderingProvider, "name");
    v4DataRecord.status = maputil.nullInsteadOfEmptyOneElementObjectWithPrimary(v2DataRecord.Status, "display");

    v4DataRecord.description = maputil.nullInsteadOfEmptyString(v2DataRecord.Description);

    var v2ConsOrder = v2DataRecord.ConsultOrders[0];
    v4DataRecord.facility = maputil.nullInsteadOfEmptyOneElementObject(v2ConsOrder.FacilityName, "name");
    v4DataRecord.reason = maputil.nullInsteadOfEmptyString(v2ConsOrder.ReasonForRequest);
    v4DataRecord.receivingLocation = maputil.nullInsteadOfEmptyOneElementObject(v2ConsOrder.ReceivingClinincName, "name");
    v4DataRecord.referringLocation = maputil.nullInsteadOfEmptyOneElementObject(v2ConsOrder.ReferringClinicName, "name");


    return v4DataRecord;
}


module.exports.map = map;
module.exports.mapConsultDataRecord = mapConsultDataRecord;