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
        v4DataRecord.order.comment = maputil.nullInsteadOfEmptyString(v2DataRecord.OrderComment);
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

        v4DataRecord.tests = [];
        if (v2DataRecord.Tests && v2DataRecord.Tests.length > 0) {
            for (var testNum = 0; testNum < v2DataRecord.Tests.length; testNum++) {
                var v2TestRecord = v2DataRecord.Tests[testNum];
                var v4TestRecord = {};

                v4TestRecord.results = [];
                if (v2TestRecord.Results && v2TestRecord.Results.length > 0) {
                    for (var j = 0; j < v2TestRecord.Results.length; j++) {
                        var v2Result = v2TestRecord.Results[j];
                        var v4LabResult = {};

                        v4LabResult.certifiedBy = maputil.nullInsteadOfEmptyOneElementObject(v2Result.CertifyName, "name");
                        v4LabResult.certifiedDate = maputil.nullInsteadOfFormattedDateObject(v2Result.CertifiedDate);
                        v4LabResult.content = maputil.nullInsteadOfEmptyString(v2Result.FullReport);
                        if (v2Result.Organisms && v2Result.Organisms.length > 0) {
                            v4LabResult.organisms = [];
                            for (var organismNum = 0; organismNum < v2Result.Organisms.length; organismNum++) {
                                var v2Organism = v2Result.Organisms[organismNum];
                                var v4Organism = {};

                                v4Organism.organism = maputil.nullInsteadOfEmptyString(v2Organism.Organism);
                                v4Organism.quantity = maputil.nullInsteadOfEmptyString(v2Organism.Quantity);

                                if (v2Organism.Antibiotics && v2Organism.Antibiotics.length > 0) {
                                    v4Organism.sensitivities =[];
                                    for (var sensNum = 0; sensNum < v2Organism.Antibiotics.length; sensNum++) {
                                        var v2Sensitivity = v2Organism.Antibiotics[sensNum];
                                        var v4Sensitivity = {};

                                        v4Sensitivity.interpretation = maputil.nullInsteadOfEmptyString(v2Sensitivity.Interpretation);
                                        v4Sensitivity.result = maputil.nullInsteadOfEmptyString(v2Sensitivity.AntibioticResult);
                                        v4Sensitivity.sensitivity = maputil.nullInsteadOfEmptyString(v2Sensitivity.AntibioticName);

                                        v4Organism.sensitivities.push(v4Sensitivity);
                                    }
                                }

                                v4LabResult.organisms.push(v4Organism);
                            }
                        }

                        v4LabResult.performingLabLocation = maputil.nullInsteadOfEmptyOneElementObject(v2Result.Facility, "name");
                        v4LabResult.status = [
                            {
                                "code": maputil.nullInsteadOfEmptyString(v2Result.ResultStatus),
                                "display": maputil.nullInsteadOfEmptyString(v2Result.ResultStatusDescription),
                                "primary": true
                            }
                        ];
                        v4LabResult.result = maputil.nullInsteadOfEmptyString(v2Result.Result);
                        v4LabResult.resultIndependent = maputil.nullInsteadOfEmptyString(v2Result.ResultIndependent);
                        v4LabResult.type = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2Result.Name, "display");

                        v4TestRecord.results.push(v4LabResult);
                    }
                }
                v4TestRecord.type = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2TestRecord.Name, "display");

                v4DataRecord.tests.push(v4TestRecord);
            }
        }

        v4DataRecord.panel = maputil.nullInsteadOfEmptyString(v2DataRecord.IsPanel);
        v4DataRecord.display = maputil.nullInsteadOfEmptyString(v2DataRecord.TestStatusName);

        v4DataList.push(v4DataRecord);

    }

    v4JSON["dataList"] = {"labMicroResults": v4DataList};

    return v4JSON;

};

module.exports.map = map;