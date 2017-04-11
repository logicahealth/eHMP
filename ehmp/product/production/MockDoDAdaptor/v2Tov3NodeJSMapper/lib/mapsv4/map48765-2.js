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

        if (v2DataRecord.OtherIdentifier) {
            v4DataRecord.allergen = [{
                "code": v2DataRecord.OtherIdentifier,
                "display": v2DataRecord.Allergen,
                "system":"2.16.840.1.113883.3.42.127.100001.209", //v2 coding system is presumed to be allergy_ien
                "primary": true
            }];
        }
        else {
            v4DataRecord.allergen = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.Allergen, "display");
        }


        v4DataRecord.comment = maputil.nullInsteadOfEmptyString(v2DataRecord.Comments);
        v4DataRecord.onsetDate = maputil.nullInsteadOfFormattedDateObject(v2DataRecord.OnsetDate);
        v4DataRecord.reactions = [
            {
                "reaction": [
                    {
                        "display": maputil.nullInsteadOfEmptyString(v2DataRecord.Reaction),
                        "primary": true
                    }
                ],
                "comment": maputil.nullInsteadOfEmptyString(v2DataRecord.ReactionComment)
            }
        ];
        v4DataRecord.sourceOfInfo = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.Source, "display");
        v4DataRecord.type = maputil.emptyArrayInsteadOfEmptyOneElementObjectArrayWithPrimary(v2DataRecord.Type, "display");


        v4DataList.push(v4DataRecord);

    }

    v4JSON["dataList"] = {"allergies": v4DataList};

    return v4JSON;

};

module.exports.map = map;