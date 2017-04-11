// encounters

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


        v4DataRecord.arrivalDate = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.AppointmentDate);
        v4DataRecord.type = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.AppointmentType, "display");
        v4DataRecord.encounterLocations = maputil.nullInsteadOfEmptyOneElementObjectArray(v2DataRecord.Clinic, "name");

        var v4Diagnoses = [];
        for (var diagnosisNum = 0; diagnosisNum < v2DataRecord.Diagnosis.length; diagnosisNum++) {
            var v2Diagnosis = v2DataRecord.Diagnosis[diagnosisNum];
            var diagnosis = {
                "enteredBy": maputil.nullInsteadOfEmptyOneElementObject(v2Diagnosis.EnteredBy, "name"),
                "enteredDate": maputil.nullInsteadOfFormattedDateObject(v2Diagnosis.EnteredByDate),
                "location": maputil.nullInsteadOfEmptyOneElementObject(v2Diagnosis.Facility, "name"),
                "status": maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2Diagnosis.Status, "display"),
                "diagnosis": [
                    {
                        "code": maputil.nullInsteadOfEmptyString(v2Diagnosis.Code),
                        "display": maputil.nullInsteadOfEmptyString(v2Diagnosis.Diagnosis),
                        "primary": true
                    }
                ]
            }

            v4Diagnoses.push(diagnosis);
        }
        v4DataRecord.diagnoses = v4Diagnoses;
        var v4Procedures = [];
        for (var procedureNum = 0; procedureNum < v2DataRecord.Procedures.length; procedureNum++) {
            var v2Procedure = v2DataRecord.Procedures[procedureNum];
            var procedure = {
                "enteredBy": maputil.nullInsteadOfEmptyOneElementObject(v2Procedure.EnteredBy, "name"),
                "enteredDate": maputil.nullInsteadOfFormattedDateObject(v2Procedure.EnteredByDate),
                //"location": maputil.nullInsteadOfEmptyOneElementObject(v2Procedure.Facility, "name"),
                "status": maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2Procedure.Status, "display"),
                "procedure": [
                    {
                        "code": maputil.nullInsteadOfEmptyString(v2Procedure.Code),
                        "display": maputil.nullInsteadOfEmptyString(v2Procedure.Procedure),
                        "primary": true
                    }
                ],
                "date": maputil.nullInsteadOfFormattedDateObject(v2Procedure.ProcedureDate),
                "recordId": maputil.nullInsteadOfEmptyOneElementObject(v2Procedure.ProcedureId, "id")
            }

            v4Procedures.push(procedure);
        }
        v4DataRecord.procedures = v4Procedures;
        v4DataRecord.emCode = [maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.EvalManagementCode, "code")];
        v4DataRecord.encounterNumber = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.EncounterNumber, "id");
        v4DataRecord.provider = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.Provider, "name");
        v4DataRecord.status = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.Status, "display");
        v4DataRecord.reason = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.VisitReason, "display");
        v4DataRecord.disposition = maputil.nullInsteadOfEmptyOneElementObjectArray(v2DataRecord.DischargeDisposition, "display");

        v4DataList.push(v4DataRecord);

    }

    v4JSON["dataList"] = {"encounters": v4DataList};

    return v4JSON;

};

module.exports.map = map;