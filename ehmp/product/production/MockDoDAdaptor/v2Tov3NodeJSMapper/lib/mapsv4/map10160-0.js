// meds

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

        var comments = v2DataRecord.Comments;

        var split = comments.split("\n");
        if (split.length > 0) {
            if (split[0].search(/O/) !== -1) {
                v4DataRecord.prescription = "O";
            }
            else if (split[0].search(/I/) !== -1) {
                v4DataRecord.prescription = "I";
            }
        }

        v4DataRecord.active = (v2DataRecord.Active === true);
        v4DataRecord.comment = v2DataRecord.Comments;
        v4DataRecord.dispensingPharmacy = {};
        v4DataRecord.dispensingPharmacy.name = v2DataRecord.DispensingPharmacy;
        //v4DataRecord.recordId.id = v2DataRecord.EventId;
        v4DataRecord.recordId.id = v2DataRecord.RxId;
        v4DataRecord.fillCost = v2DataRecord.FillCost === "" ? null : v2DataRecord.FillCost;
        v4DataRecord.endDate = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.FillExpirationDate);
        v4DataRecord.startDate = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.IssueDate);
        v4DataRecord.lastFillDate = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.LastFilledDate);

        if (v2DataRecord.MedicationFillDates instanceof  Array) {
            v4DataRecord.fillInfo = v2DataRecord.MedicationFillDates.map(function (medFillDate) {
                var medFillInfo = {};

                medFillInfo.action = [{
                    "display": medFillDate.Action,
                    "primary": true
                }];
                medFillInfo.dispensingPharmacy = {};
                medFillInfo.dispensingPharmacy.name = medFillDate.DispensingPharmacy;
                medFillInfo.enteredBy = {};
                medFillInfo.enteredBy.name = medFillDate.EnteredBy;
                medFillInfo.location = {};
                medFillInfo.location.name = medFillDate.Facility;
                medFillInfo.fillCost = medFillDate.FillCost === "" ? null : medFillDate.FillCost;
                medFillInfo.fillDate = maputil.nullInsteadOfFormattedDateObject(medFillDate.FillDate);
                medFillInfo.fillNumber = medFillDate.FillNumber;
                medFillInfo.quantity = medFillDate.Quantity;
                medFillInfo.units = [{
                    "display": medFillDate.Units,
                    "primary": true
                }];

                return medFillInfo;
            });
        }

        v4DataRecord.drug = [{
            "display": v2DataRecord.MedicationName,
            "code": v2DataRecord.OtherIdentifier,
            "system": "2.16.840.1.113883.3.42.126.100001.16",
            "primary": true
        }];
        v4DataRecord.numberOfRefills = Number(v2DataRecord.NumberOfRefills);
        v4DataRecord.provider = {};
        v4DataRecord.provider.name = v2DataRecord.OrderingProvider;
        v4DataRecord.provider.primary = true;
        v4DataRecord.quantity = v2DataRecord.Quantity;
        v4DataRecord.refillsRemaining = Number(v2DataRecord.RefillsRemaining);
        v4DataRecord.rxNumber = {};
        v4DataRecord.rxNumber.id = v2DataRecord.RxNumber;
        v4DataRecord.sig = v2DataRecord.Sig;
        v4DataRecord.status = [{
            "display": v2DataRecord.Status,
            "primary": true
        }];
        v4DataRecord.daysSupply = Number(v2DataRecord.SupplyDays);
        v4DataRecord.units = [{
            "display": v2DataRecord.Units,
            "primary": true
        }];

        v4DataList.push(v4DataRecord);

    }

    v4JSON["dataList"] = {"medications": v4DataList};

    return v4JSON;

};

module.exports.map = map;