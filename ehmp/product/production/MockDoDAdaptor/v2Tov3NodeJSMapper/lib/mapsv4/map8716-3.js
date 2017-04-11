/**
 * Vitals
 */

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

//        v4DataRecord.enteredBy = ["enteredby": {"name": "", ids: [ {"assigningAuthorty": "", "id": ""}]}];
//        v4DataRecord.facility;
        
        var results = [];
    	for (var j = 0; j < v2JSON.dataList[i].dataRecord.VitalsResults.length; j++) {
    		var result = Object();
    		var start = maputil.nullInsteadOfEmptyString(v2JSON.dataList[i].dataRecord.VitalsResults[j].StartTime);
    		var end = maputil.nullInsteadOfEmptyString(v2JSON.dataList[i].dataRecord.VitalsResults[j].EndTime);
    		result.endTime = {"start": start, "end": end};
    		result.enteredBy = {"name": maputil.nullInsteadOfEmptyString(v2JSON.dataList[i].dataRecord.VitalsResults[j].EnteredBy), 
    				"ids" : [{"assigningAuthority": v2DataRecord.RepositoryId,
    				         "id": v2DataRecord.EventId}]};
    		result.modifiers = getModifiers(v2JSON.dataList[i].dataRecord.VitalsResults[j].Modifiers);
    		result.performedDate =  {"start": start, "end": end};
    		result.performingProvider = [{"code": maputil.nullInsteadOfEmptyString(v2JSON.dataList[i].dataRecord.VitalsResults[j].UniqueId), 
    			"display": maputil.nullInsteadOfEmptyString(v2JSON.dataList[i].dataRecord.VitalsResults[j].PerformingProvider),
    			"primary": true,
    			"system": v2DataRecord.RepositoryId}];
    		result.startTime = {"start": start, "end": end};
    		var vitalUnits = [{"code": maputil.nullInsteadOfEmptyString(v2JSON.dataList[i].dataRecord.VitalsResults[j].TestUnitsCode), 
    			"display": maputil.nullInsteadOfEmptyString(v2JSON.dataList[i].dataRecord.VitalsResults[j].TestUnits), 
    			"primary": true, 
    			"system": v2DataRecord.RepositoryId}];
    		var vitalValue = [{"display": maputil.nullInsteadOfEmptyString(v2JSON.dataList[i].dataRecord.VitalsResults[j].TestValue), 
    			"primary": ""}];
    		result.test = {"type" : [
    		    {"code": maputil.nullInsteadOfEmptyString(v2JSON.dataList[i].dataRecord.VitalsResults[j].TestCode),
    			"display": v2JSON.dataList[i].dataRecord.VitalsResults[j].TestName,
    			"primary": true,
    			"system": v2DataRecord.RepositoryId}],
    			"units": vitalUnits,
    			"value": vitalValue};
    		
    		result.uniqueId = maputil.nullInsteadOfEmptyString(v2JSON.dataList[i].dataRecord.VitalsResults[j].UniqueId);
    		results.push(result);
    	}
        v4DataRecord.results = results;

        v4DataList.push(v4DataRecord);

    }

    v4JSON["dataList"] = {"vitals": v4DataList};
    return v4JSON;

};

function getModifiers(Modifiers){
	var modifiers = [];
	for(var modIter = 0; modIter < Modifiers.length; modIter++){
		var modifier = Object();
		modifier.type = [{ "code": Modifiers[modIter].UnitsCode, "display": "", "primary": true, "system": ""}];
		modifiers.push(modifier);
	}
	return modifiers;
	
}

module.exports.map = map;