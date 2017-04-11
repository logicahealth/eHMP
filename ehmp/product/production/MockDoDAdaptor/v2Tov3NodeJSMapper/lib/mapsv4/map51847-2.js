// meds

var maputil = require('./maputil.js');

var map = function (v2JSON) {
    //var statusListStatus;
    //var statusComplete = false;
    //var retrievedCount;
    //
    //if (v2JSON.queryComplete === "true") {
    //    for (var i = 0; i < v2JSON.statusList.length; i++) {
    //        if (v2JSON.statusList[i].SiteStatus === "COMPLETE") {
    //            retrievedCount = Number(v2JSON.statusList[i].RetrievedCount);
    //        }
    //        statusListStatus = v2JSON.statusList[i];
    //        statusComplete = true;
    //    }
    //}
    //if (!statusComplete) {
    //    return {
    //        "dataList": [
    //
    //        ]
    //    }
    //}
    //
    //var v4JSON = {
    //    "queryComplete": true,
    //    "statusList": maputil.v4StatusList(retrievedCount)
    //}
    //
    //var v4DataList = [];
    //
    //for (var i = 0; i < v2JSON.dataList.length; i++) {
    //    var v2DataRecord = v2JSON.dataList[i].dataRecord;
    //
    //    var v4DataRecord = maputil.baseTransform(v2DataRecord);
    //
    //    v4DataList.push(v4DataRecord);
    //
    //}
    //
    //v4JSON["dataList"] = {"medications": v4DataList};

    return {"queryComplete":true};

};

module.exports.map = map;