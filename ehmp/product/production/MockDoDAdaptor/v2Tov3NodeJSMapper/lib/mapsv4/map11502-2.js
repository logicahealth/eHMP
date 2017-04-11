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

        v4DataRecord.order = {};
        v4DataRecord.order.accession = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.Accession, "id");
        v4DataRecord.order.collectionDate = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.CollectionDateTime);
        v4DataRecord.order.collectionSample = maputil.nullInsteadOfEmptyString(v2DataRecord.CollectionSample);
        v4DataRecord.order.date = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.OrderDateTime);
        v4DataRecord.order.id = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.OrderId, "id");
        v4DataRecord.order.orderNumber = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.OrderNumber, "id");
        v4DataRecord.order.priority = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.OrderPriority, "display");
        v4DataRecord.order.provider = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.OrderingProvider, "name");
        v4DataRecord.order.requestingLocation = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.RequestingLocation, "name");
        v4DataRecord.order.specimen = [
            {
                "code": maputil.nullInsteadOfEmptyString(v2DataRecord.Specimen),
                "display": maputil.nullInsteadOfEmptyString(v2DataRecord.SpecimenName),
                "primary": true

            }
        ];
        v4DataRecord.order.status = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.OrderStatus, "display");
        v4DataRecord.order.test = [
            {
                "code": maputil.nullInsteadOfEmptyString(v2DataRecord.TestId),
                "display": maputil.nullInsteadOfEmptyString(v2DataRecord.TestName),
                "primary": true
            }
        ];
        v4DataRecord.results = [];
        if (v2DataRecord.Results && v2DataRecord.Results.length > 0) {
            for (var j = 0; j < v2DataRecord.Results.length; j++) {
                var v2Result = v2DataRecord.Results[j];
                var v4LabResult = {};

                v4LabResult.codeInterpretation = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2Result.Abnormal, "display");
                v4LabResult.certifiedBy = maputil.nullInsteadOfEmptyOneElementObject(v2Result.CertifyName, "name");
                v4LabResult.certifiedDate = maputil.nullInsteadOfFormattedDateObject(v2Result.DateCertified);
                v4LabResult.comment = maputil.nullInsteadOfEmptyString(v2Result.ResultComment);
                v4LabResult.performingLabLocation = maputil.nullInsteadOfEmptyOneElementObject(v2Result.Facility, "name");
                v4LabResult.status = [
                    {
                        "code": maputil.nullInsteadOfEmptyString(v2Result.TestResultedCode),
                        "display": maputil.nullInsteadOfEmptyString(v2Result.TestResultedCodeDescription),
                        "primary": true

                    }
                ];
                v4LabResult.test = [
                    {
                        "code": maputil.nullInsteadOfEmptyString(v2Result.LabId),
                        "display": maputil.nullInsteadOfEmptyString(v2Result.LabTest),
                        "system":"2.16.840.1.113883.3.42.126.100001.16", //DOD_NCID
                        "primary": true
                    }
                ];

                v4LabResult.codedInterpretation = maputil.nullInsteadOfEmptyOneElementObjectArray(v2Result.Abnormal, "display");
                v4LabResult.referenceRange = maputil.nullInsteadOfEmptyString(v2Result.ReferenceRange);
                v4LabResult.result = maputil.nullInsteadOfEmptyString(v2Result.Result);
                v4LabResult.units = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2Result.Units, "display");

                v4DataRecord.results.push(v4LabResult);
            }
        }

        if (!v4DataRecord.facility) {
            v4DataRecord.facility = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.OrderFacility);
        }

        v4DataList.push(v4DataRecord);

    }

    v4JSON["dataList"] = {"labChemResults": v4DataList};

    return v4JSON;

};

module.exports.map = map;