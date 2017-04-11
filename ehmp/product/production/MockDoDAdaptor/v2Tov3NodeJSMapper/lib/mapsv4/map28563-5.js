// Inpatient Notes v4 mapper
var maputil = require('./maputil.js');

var mapInpatientNoteRecord = function(v2DataRecord) {

    var v4DataRecord = {
        title: maputil.nullInsteadOfEmptyString(v2DataRecord.NoteTitle),
        content: maputil.nullInsteadOfEmptyString(v2DataRecord.CompleteNote),
        contentType: [{
            code: "text/xml",
            primary: false,
            system: "2.16.840.1.113883.5.79"
        }],
        type: [{
            code: maputil.nullInsteadOfEmptyString(v2DataRecord.NoteTypeCode),
            display: maputil.nullInsteadOfEmptyString(v2DataRecord.NoteTypeName),
            primary: true,
            system: '2.16.840.1.113883.6.1'
        }],
        verifiedDate: maputil.nullInsteadOfFormattedDateObject(v2DataRecord.VerifiedDate),
        verifiedBy: {
            name: maputil.nullInsteadOfEmptyString(v2DataRecord.VerifiedBy)
        }
    };

    return maputil.extendObject(v4DataRecord, maputil.baseTransform(v2DataRecord));
};

module.exports.map = function(v2JSON) {
    var v4JSON = {
        dataList: {
            inpatientNotes: maputil.mapRecords(v2JSON, mapInpatientNoteRecord)
        }
    };
    return maputil.extendObject(v4JSON, maputil.checkQueryComplete(v2JSON));
};