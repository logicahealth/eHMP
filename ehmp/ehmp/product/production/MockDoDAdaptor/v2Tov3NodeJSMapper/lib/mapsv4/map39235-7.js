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

        v4DataRecord.manufacturer = [
            {
                "display": maputil.nullInsteadOfEmptyString(v2DataRecord.CVX),
                "code": maputil.nullInsteadOfEmptyString(v2DataRecord.ManufacturerName),
                "primary": true
            }
        ];
        v4DataRecord.dosage = {
            "quantity": maputil.nullInsteadOfEmptyString(v2DataRecord.Dosage),
            "raw": maputil.nullInsteadOfEmptyString(v2DataRecord.VaccineDosage)
        };
        var units = null;
        if (v2DataRecord.DosageUnits) {
            v4DataRecord.dosage.units = [{
                "display": v2DataRecord.DosageUnits,
                "primary": true
            }];
        }
        v4DataRecord.lotNumber = maputil.nullInsteadOfEmptyString(v2DataRecord.LotNumberText);
        v4DataRecord.vaccine = [
            {
                "code": maputil.nullInsteadOfEmptyString(v2DataRecord.ManufacturedMaterial),
                "display": maputil.nullInsteadOfEmptyString(v2DataRecord.Vaccine),
                "primary": true
            }
        ];
        v4DataRecord.nextDueDate = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.NextVaccineDueDate);
        v4DataRecord.provider = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.ProviderName, "name");
        v4DataRecord.date = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.VaccineDate);
        v4DataRecord.negationReason = maputil.nullInsteadOfEmptyString(v2DataRecord.VaccineExemption);
        v4DataRecord.seriesInfo = maputil.nullInsteadOfEmptyString(v2DataRecord.VaccineSeries);

        v4DataList.push(v4DataRecord);

    }

    v4JSON["dataList"] = {"immunizations": v4DataList};

    return v4JSON;

};

module.exports.map = map;