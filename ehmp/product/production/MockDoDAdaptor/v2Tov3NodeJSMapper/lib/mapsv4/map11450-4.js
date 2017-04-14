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

        v4DataRecord.chronicity = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.ChronicityName, "display");
        v4DataRecord.comment = maputil.nullInsteadOfEmptyString(v2DataRecord.Comments);

        if (v2DataRecord.HospitalLocation) {
            if (!v4DataRecord.facility) {
                v4DataRecord.facility = {};
            }

            v4DataRecord.facility.name = v2DataRecord.HospitalLocation;
        }

        if (v2DataRecord.HospitalDmisId) {
            if (!v4DataRecord.facility) {
                v4DataRecord.facility = {};
            }
            v4DataRecord.facility.ids = [{
                "assigningAuthority": "2.16.840.1.113883.3.42.10002.100001.8",
                "id": v2DataRecord.HospitalDmisId
            }];
        }
        v4DataRecord.modifiedDate = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.LastModifiedDate);
        v4DataRecord.onsetDate = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.OnsetDate);
        if  (v2DataRecord.OtherIdentifier) {
            if (v2DataRecord.OtherIdentifier === "-") {
                v4DataRecord.negationInd = true;
            } else if (v2DataRecord.OtherIdentifier === "+") {
                v4DataRecord.negationInd = false;
            }
        }

        if (!v2DataRecord.ProblemName) {
            v4DataRecord.problem = null;
        }
        else {

            v4DataRecord.problem = [];

            var probMedcin = {
                "display":v2DataRecord.ProblemName,
                "primary":true
            };

            if (v2DataRecord.MedcinId) {
                probMedcin.code = v2DataRecord.MedcinId;
                probMedcin.system = "2.16.840.1.113883.6.26"; //DOD MEDCIN
            }

            v4DataRecord.problem.push(probMedcin);

            if (v2DataRecord.IcdCode) {
                var probIcd9 = {
                    "display":v2DataRecord.ProblemName,
                    "primary":false,
                    "code":v2DataRecord.IcdCode,
                    "system":"2.16.840.1.113883.6.103"
                };

                v4DataRecord.problem.push(probIcd9);
            }
        }

        if (v2DataRecord.EnteredDate) {
            v4DataRecord.enteredDate = {
                "start": v2DataRecord.EnteredDate,
                "end": v2DataRecord.EnteredDate
            };
        }

        v4DataRecord.provider = maputil.nullInsteadOfEmptyOneElementObjectWithPrimary(v2DataRecord.Provider, "name");
        v4DataRecord.sourceOfInfo = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.Source, "display");
        v4DataRecord.status = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.StatusName, "display");

        v4DataList.push(v4DataRecord);

    }

    v4JSON["dataList"] = {"problems": v4DataList};

    return v4JSON;

};

module.exports.map = map;