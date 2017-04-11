// orders labs

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

        var v4DataRecord = mapLabDataRecord(v2DataRecord);

        v4DataList.push(v4DataRecord);
    }

    v4JSON["dataList"] = {"labOrders": v4DataList};

    return v4JSON;

};

var mapLabDataRecord = function (v2DataRecord) {
    var v4DataRecord = maputil.baseTransform(v2DataRecord);

    v4DataRecord.orderable = [
        {
            "display": maputil.nullInsteadOfEmptyString(v2DataRecord.Description),
            "code": maputil.nullInsteadOfEmptyString(v2DataRecord.Ncid),
            "system": "2.16.840.1.113883.3.42.126.100001.16",
            "primary": true
        }
    ];
    v4DataRecord.date = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.OrderDate);
    v4DataRecord.orderNumber = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.OrderId, "id");
    v4DataRecord.orderingProvider = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.OrderingProvider, "name");
    v4DataRecord.status = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.Status, "display");

    var v2LabOrder = v2DataRecord.LabOrders[0];
    v4DataRecord.adminTimes = null;
    v4DataRecord.alternateSpecimenText = maputil.nullInsteadOfEmptyString(v2LabOrder.AlternateSpecimenText);
    v4DataRecord.collectionMethod = maputil.nullInsteadOfEmptyString(v2LabOrder.CollectionMethod);
    v4DataRecord.duration = maputil.nullInsteadOfEmptyString(v2LabOrder.Duration);
    v4DataRecord.endDate = maputil.nullInsteadOfFormattedDateObject(v2LabOrder.EndDate);
    v4DataRecord.enteringLocation = maputil.nullInsteadOfEmptyOneElementObject(v2LabOrder.EnteringLocationName, "name");
    v4DataRecord.facility = maputil.nullInsteadOfEmptyOneElementObject(v2LabOrder.FacilityName, "name");
    v4DataRecord.frequency = maputil.nullInsteadOfEmptyString(v2DataRecord.Frequency);
    v4DataRecord.groupNumber = maputil.nullInsteadOfEmptyString(v2DataRecord.GroupNumber);
    v4DataRecord.signedDate = maputil.nullInsteadOfEmptyString(v2DataRecord.NurseSignatureDate);
    v4DataRecord.signedBy = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.NurseSignatureName, "name");
    v4DataRecord.intervalPattern = maputil.nullInsteadOfEmptyString(v2LabOrder.IntervalRepeatPattern);
    v4DataRecord.interval = maputil.nullInsteadOfEmptyString(v2LabOrder.IntervalTimeInterval);
    v4DataRecord.comment = maputil.nullInsteadOfEmptyString(v2LabOrder.OrderComment);
    v4DataRecord.priorOrderNumber = maputil.nullInsteadOfEmptyOneElementObject(v2LabOrder.PriorOrderNumber, "id");
    v4DataRecord.priority = maputil.nullInsteadOfEmptyString(v2LabOrder.Priority);
    v4DataRecord.processingPriority = maputil.nullInsteadOfEmptyString(v2LabOrder.ProcessingPriority);
    v4DataRecord.scheduleType = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2LabOrder.ScheduleTypeName, "display");
    v4DataRecord.specimenText = maputil.nullInsteadOfEmptyString(v2LabOrder.SpecimenText);
    v4DataRecord.startDate = maputil.nullInsteadOfFormattedDateObject(v2LabOrder.StartDate);
    v4DataRecord.statusComment = maputil.nullInsteadOfEmptyString(v2LabOrder.StatusComments);
    v4DataRecord.verifiedBy = maputil.nullInsteadOfEmptyOneElementObject(v2LabOrder.VerifiedByName, "name");

    return v4DataRecord;
}

module.exports.map = map;
module.exports.mapLabDataRecord = mapLabDataRecord;