// orders meds

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

        var v4DataRecord = mapMedicationDataRecord(v2DataRecord);

        v4DataList.push(v4DataRecord);
    }

    v4JSON["dataList"] = {"medicationOrders": v4DataList};

    return v4JSON;

};

// maps the v2 Medication order from the v2DataRecord into the v4DataRecord
var mapMedicationDataRecord = function (v2DataRecord) {
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


    var v2MedicationOrder = v2DataRecord.MedicationOrders[0];
    v4DataRecord.actionCode = maputil.nullInsteadOfEmptyString(v2MedicationOrder.ActionCode);
    v4DataRecord.childResistant = (v2MedicationOrder.ChildResistant === 'true');
    v4DataRecord.deliveryLocation = maputil.nullInsteadOfEmptyOneElementObject(v2MedicationOrder.DeliverToLocationName, "name");
    v4DataRecord.dispensingLocation = maputil.nullInsteadOfEmptyOneElementObject(v2MedicationOrder.DispensingLocationName, "name");
    v4DataRecord.alternateDrugText = maputil.nullInsteadOfEmptyString(v2MedicationOrder.DrugAlternateText);
    v4DataRecord.duration = maputil.nullInsteadOfEmptyString(v2MedicationOrder.Duration);
    v4DataRecord.endDate = maputil.nullInsteadOfFormattedDateObject(v2MedicationOrder.EndDate);
    v4DataRecord.enteringLocation = maputil.nullInsteadOfEmptyOneElementObject(v2MedicationOrder.EnteringLocationName, "name");
    v4DataRecord.facility = maputil.nullInsteadOfEmptyOneElementObject(v2MedicationOrder.FacilityName, "name");
    v4DataRecord.giveAmount = maputil.nullInsteadOfEmptyString(v2MedicationOrder.GiveAmount);
    v4DataRecord.giveFormDescription = maputil.nullInsteadOfEmptyString(v2MedicationOrder.GiveFormDescription);
    v4DataRecord.giveUnits = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2MedicationOrder.GiveUnits, "display");
    v4DataRecord.intervalPattern = maputil.nullInsteadOfEmptyString(v2MedicationOrder.IntervalRepeatPattern);
    v4DataRecord.interval = maputil.nullInsteadOfEmptyString(v2MedicationOrder.IntervalTimeInterval);
    v4DataRecord.numberOfRefills = maputil.nullInsteadOfEmptyString(v2MedicationOrder.NumberOfRefills);
    v4DataRecord.comment = maputil.nullInsteadOfEmptyString(v2MedicationOrder.OrderComment);
    v4DataRecord.priorOrderNumber = {assigningAuthority: maputil.nullInsteadOfEmptyString(v2DataRecord.RepositoryId), 
    		id: maputil.nullInsteadOfEmptyOneElementObject(v2MedicationOrder.PriorOrderNumber, "id")};
    	
    	
    v4DataRecord.priority = maputil.nullInsteadOfEmptyString(v2MedicationOrder.Priority);
    v4DataRecord.quantity = maputil.nullInsteadOfEmptyString(v2MedicationOrder.Quantity);
    v4DataRecord.requestedDispenseAmount = maputil.nullInsteadOfEmptyString(v2MedicationOrder.RequestedDispenseAmount);
    v4DataRecord.requestedGiveTimeUnit = maputil.nullInsteadOfEmptyString(v2MedicationOrder.RequestedGiveTimeUnit);
    v4DataRecord.routeDescription = maputil.nullInsteadOfEmptyString(v2MedicationOrder.RouteDescription);
    v4DataRecord.sig = maputil.nullInsteadOfEmptyString(v2MedicationOrder.Sig);
    v4DataRecord.startDate = maputil.nullInsteadOfFormattedDateObject(v2MedicationOrder.StartDate);
    v4DataRecord.verifiedBy = maputil.nullInsteadOfEmptyOneElementObject(v2MedicationOrder.VerifiedByName, "name");

    return v4DataRecord;

}


module.exports.map = map;
module.exports.mapMedicationDataRecord = mapMedicationDataRecord;