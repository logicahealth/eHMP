// notes

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

        v4DataRecord.complexDataUrl = maputil.nullInsteadOfEmptyString(v2DataRecord.ComplexDataUrl);

        if (!v2DataRecord.ComplexDataUrl) {
            v4DataRecord.content = maputil.nullInsteadOfEmptyString(v2DataRecord.CompleteNote);
        }

        v4DataRecord.contentType = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.NoteFormat, "code");
        v4DataRecord.title = maputil.nullInsteadOfEmptyString(v2DataRecord.NoteTitle);
        v4DataRecord.type = [
            {
                "code": maputil.nullInsteadOfEmptyString(v2DataRecord.NoteTypeCode),
                "display": maputil.nullInsteadOfEmptyString(v2DataRecord.NoteTypeName),
                "system": "2.16.840.1.113883.3.42.126.100001.16",
                "primary": true
            }
        ];
        v4DataRecord.status = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.Status, "display");
        v4DataRecord.verifiedBy = maputil.nullInsteadOfEmptyOneElementObject(v2DataRecord.VerifiedBy, "name");
        v4DataRecord.verifiedDate = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.VerifiedDate);

        if (v2DataRecord.NoteTitle && v2DataRecord.NoteTitle.search(/\*{5}/g) > -1) {
            v4DataRecord.sensitive = true;
        }

        v4DataList.push(v4DataRecord);

    }

    v4JSON["dataList"] = {"notes": v4DataList};

    return v4JSON;

};

module.exports.map = map;