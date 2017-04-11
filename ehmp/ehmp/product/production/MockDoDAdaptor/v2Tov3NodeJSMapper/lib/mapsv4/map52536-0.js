// demographics

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

        v4DataRecord.addresses = [{
            "type": maputil.nullInsteadOfEmptyString(v2DataRecord.AddressType),
            "city": maputil.nullInsteadOfEmptyString(v2DataRecord.City),
            "country": maputil.nullInsteadOfEmptyString(v2DataRecord.Country),
            "county": maputil.nullInsteadOfEmptyString(v2DataRecord.County),
            "postalCode": maputil.nullInsteadOfEmptyString(v2DataRecord.PostCode),
            "state": maputil.nullInsteadOfEmptyString(v2DataRecord.State),
            "street": [v2DataRecord.Street]
        }];
        if (v2DataRecord.Street2) {
            v4DataRecord.address.street.push(v2DataRecord.Street2);
        }

        var telecoms = [];
        if (v2DataRecord.LocalNumber) {
            var phNumber = v2DataRecord.LocalNumber;
            if (v2DataRecord.AreaCode) {
                phNumber = v2DataRecord.AreaCode + "-" + phNumber;
                if (v2DataRecord.CountryCode) {
                    phNumber = v2DataRecord.CountryCode + "-" + phNumber;
                }
            }
            telecoms.push({
                "useType": "Home",
                "uriPrefix": "tel:",
                "value": phNumber
            });
        }
        var email = "No current email consent form on file";
        if (v2DataRecord.Email) {
            email = v2DataRecord.Email;
        }
        telecoms.push({
            "uriPrefix": "mailto:",
            "value": email
        })

        v4DataRecord.branch = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.BranchOfService, "display");
        v4DataRecord.birthDate = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.DateOfBirth);
        v4DataRecord.deersEligibility = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.DeersEligibility, "display");
        v4DataRecord.patientId = [{
           "id": v2DataRecord.EdiPn
        }];
        v4DataRecord.enrollmentLocation = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.EnrollmentFacility, "name");
        v4DataRecord.name = {};
        v4DataRecord.name.first = v2DataRecord.FirstName;
        v4DataRecord.name.middle = maputil.nullInsteadOfEmptyString(v2DataRecord.MiddleName);
        v4DataRecord.name.last = v2DataRecord.LastName;
        v4DataRecord.name.suffix = maputil.nullInsteadOfEmptyString(v2DataRecord.Suffix);
        v4DataRecord.fmp = maputil.nullInsteadOfEmptyString(v2DataRecord.Fmp);
        v4DataRecord.maritalStatus = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.MaritalStatus, "display");
        v4DataRecord.patientCategory = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.PatientCategory, "display");
        v4DataRecord.race =maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.Race, "display");
        v4DataRecord.rank = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.Rank, "display");
        v4DataRecord.religion = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.Religion, "display");
        v4DataRecord.sex = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.Sex, "display");
        v4DataRecord.sponsor = {};
        v4DataRecord.sponsor.branch = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.SponsorBranchOfService, "display");
        v4DataRecord.sponsor.rank = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.SponsorRank, "display");
        v4DataRecord.sponsor.ssn = maputil.nullInsteadOfEmptyString(v2DataRecord.SponsorSsn);
        v4DataRecord.sponsor.assignedUnit = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.SponsorUic, "name");
        v4DataRecord.assignedUnit = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.Uic, "name");


        v4DataList.push(v4DataRecord);

    }

    v4JSON["dataList"] = {"demographics": v4DataList};

    return v4JSON;

};

module.exports.map = map;