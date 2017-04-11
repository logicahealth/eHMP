// procedures

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


        var v4Procedures = [];
        var v4Statuses = [];
        for (var procedureNum = 0; procedureNum < v2DataRecord.Procedures.length; procedureNum++) {
            var v2Procedure = v2DataRecord.Procedures[procedureNum];

            v4Procedures.push({
                "code": maputil.nullInsteadOfEmptyString(v2Procedure.Code),
                "display": maputil.nullInsteadOfEmptyString(v2Procedure.Procedure),
                "primary": true
            });
            if (v2Procedure.Status) {
                v4Statuses.push({
                    "display": v2Procedure.Status,
                    "primary": true
                });
            }
            v4DataRecord.date = maputil.nullInsteadOfFormattedDateObject(v2Procedure.ProcedureDate);
            v4DataRecord.enteredBy = maputil.nullInsteadOfEmptyOneElementObject(v2Procedure.EnteredBy, "name");
            v4DataRecord.enteredDate = maputil.nullInsteadOfFormattedDateObject(v2Procedure.EnteredByDate);
            v4DataRecord.facility = maputil.nullInsteadOfEmptyOneElementObject(v2Procedure.Facility, "name");

        }
        v4DataRecord.procedure = v4Procedures;
        v4DataRecord.status = v4Statuses;

        v4DataList.push(v4DataRecord);

    }

    v4JSON["dataList"] = {"procedures": v4DataList};

    return v4JSON;

};

module.exports.map = map;