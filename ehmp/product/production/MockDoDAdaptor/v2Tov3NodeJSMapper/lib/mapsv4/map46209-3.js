// all orders

var maputil = require('./maputil.js');
var ordersmedMap = require('./map29305-0.js');
var ordersconMap = require('./map11487-6.js');
var orderslabMap = require('./map26436-6.js');
var ordersradMap = require('./map18726-0.js');

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

    var v4MedOrdersList = [];
    var v4LabOrdersList = [];
    var v4ConOrdersList = [];
    var v4RadOrdersList = [];

    for (var i = 0; i < v2JSON.dataList.length; i++) {
        var v2DataRecord = v2JSON.dataList[i].dataRecord;
        var v4DataRecord, dataType;

        if (v2DataRecord.MedicationOrders) {
            v4DataRecord = ordersmedMap.mapMedicationDataRecord(v2DataRecord);
            v4MedOrdersList.push(v4DataRecord);
        } else if (v2DataRecord.LabOrders) {
            v4DataRecord = orderslabMap.mapLabDataRecord(v2DataRecord);
            v4LabOrdersList.push(v4DataRecord);
        } else if (v2DataRecord.ConsultOrders) {
            v4DataRecord = ordersconMap.mapConsultDataRecord(v2DataRecord);
            v4ConOrdersList.push(v4DataRecord);
        } else if (v2DataRecord.RadiologyOrders) {
            v4DataRecord = ordersradMap.mapRadDataRecord(v2DataRecord);
            v4RadOrdersList.push(v4DataRecord);
        }
    }

    v4JSON["dataList"] = {
        "medicationOrders": v4MedOrdersList,
        "consultOrders": v4ConOrdersList,
        "labOrders": v4LabOrdersList,
        "radiologyOrders": v4RadOrdersList
    }

    return v4JSON;

};

module.exports.map = map;