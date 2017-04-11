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

        if (v2DataRecord.Amendments && v2DataRecord.Amendments.length) {
            v4DataRecord.amendments = [];
            for (var amendNum = 0; amendNum < v2DataRecord.Amendments.length; amendNum++) {
                var v2Amendment = v2DataRecord.Amendments[amendNum];
                var v4Amendment = {};

                v4Amendment.content = maputil.nullInsteadOfEmptyString(v2Amendment.ReportText);
                v4Amendment.date = maputil.nullInsteadOfFormattedDateObject(v2Amendment.DateTime);
                v4Amendment.location = maputil.nullInsteadOfEmptyOneElementObject(v2Amendment.Facility, "name");
                v4Amendment.provider = maputil.nullInsteadOfEmptyOneElementObject(v2Amendment.InterpretingProvider, "name");
                v4Amendment.result = [
                    {
                        "code": maputil.nullInsteadOfEmptyString(v2Amendment.ResultCode),
                        "display": maputil.nullInsteadOfEmptyString(v2Amendment.ResultCodeDescription),
                        "primary": true
                    }
                ];
                v4Amendment.supervisedBy = maputil.nullInsteadOfEmptyOneElementObject(v2Amendment.ApprovingSupervisor, "name");
                v4Amendment.supervisedDate = maputil.nullInsteadOfFormattedDateObject(v2Amendment.SupervisedDate);
                v4Amendment.verifiedBy = maputil.nullInsteadOfEmptyOneElementObject(v2Amendment.VerifiedBy, "name");
                v4Amendment.verifiedDate = maputil.nullInsteadOfFormattedDateObject(v2Amendment.VerifiedDate);

                v4DataRecord.amendments.push(v4Amendment);
            }
        }
        v4DataRecord.approvedBy = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.ApprovedBy, "name");
        v4DataRecord.content = maputil.nullInsteadOfEmptyString(v2DataRecord.ResultText);
        v4DataRecord.exam = {};
        v4DataRecord.exam.date = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.ExamDateTime);
        v4DataRecord.exam.examNumber = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.ExamNumber, "id");
        v4DataRecord.exam.status = maputil.nullInsteadOfEmptyOneElementObjectArray(v2DataRecord.ReportStatus, "display");
        v4DataRecord.exam.type = [
            {
                "code": maputil.nullInsteadOfEmptyString(v2DataRecord.ProcedureCode),
                "display": maputil.nullInsteadOfEmptyString(v2DataRecord.Procedure),
                "primary": true
            }
        ];
        v4DataRecord.interpretedBy = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.InterpretedBy, "name");
        v4DataRecord.location = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.ResultFacility, "name");
        v4DataRecord.order = {};
        v4DataRecord.order.date = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.OrderDateTime);
        v4DataRecord.order.id = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.OrderId, "id");
        v4DataRecord.order.orderNumber = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.OrderNumber, "id");
        v4DataRecord.priority = maputil.nullInsteadOfEmptyString(v2DataRecord.Priority);
        if (v2DataRecord.CptCodes && v2DataRecord.CptCodes.length > 0) {
            v4DataRecord.procedures = [];
            var cpts = [];
            for (var cptNum = 0; cptNum < v2DataRecord.CptCodes.length; cptNum++) {
                var v2Cpt = v2DataRecord.CptCodes[cptNum];
                cpts.push(
                    {
                        "code": maputil.nullInsteadOfEmptyString(v2Cpt.CptCode),
                        "display": maputil.nullInsteadOfEmptyString(v2Cpt.CptDescription),
                        "primary": true
                    }
                );
            }
            v4DataRecord.procedures.push(cpts);
        }
        v4DataRecord.radiologyLocation = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.RadiologyLocation, "name");
        v4DataRecord.reason = maputil.nullInsteadOfEmptyString(v2DataRecord.ReasonForOrder);
        v4DataRecord.requestingLocation = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.RequestingLocation, "name");
        v4DataRecord.requestingProvider = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.RequestingProvider, "name");
        v4DataRecord.result = [
            {
                "code": maputil.nullInsteadOfEmptyString(v2DataRecord.ResultCode),
                "display": maputil.nullInsteadOfEmptyString(v2DataRecord.ResultCodeDescription),
                "primary": true
            }
        ];
        v4DataRecord.status = maputil.nullInsteadOfEmptyOneElementObjectArray(v2DataRecord.ReportStatus, "display");
        v4DataRecord.supervisedBy = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.SupervisedBy, "name");
        v4DataRecord.supervisedDate = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.SupervisedDate);
        v4DataRecord.technologist = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.Technologist, "name");
        v4DataRecord.transcriptionDate = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.TranscriptionDate);
        v4DataRecord.verifiedBy = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.VerifiedBy, "name");
        v4DataRecord.verifiedDate = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.VerifiedDate);

        v4DataList.push(v4DataRecord);

    }

    v4JSON["dataList"] = {"radiologyReports": v4DataList};

    return v4JSON;

};

module.exports.map = map;