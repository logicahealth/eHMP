'use strict';
var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var _ = require('lodash');

var fhirToJDSMap = {

    date: 'observed',
//    diagnosis: '',                // Missing fhir::codedDiagnosis attribute
//    encounter: '',                // Missing fhir::encounter attribute
    identifier: 'uid',
//    image: '',                    // Missing fhir::image attribute
    issued: 'resulted',
//    name: ''                      // Name of the report as a whole
//    patient: 'pid',               // We are already filtering by patient, makes no sense to sort here
    performer: 'facilityName',
//    request: '',                  // Missing fhir::requestDetail attribute
    result: 'resultNumber',
    service: 'categoryName',
    specimen: 'specimen',
    status: 'statusName',
//    subject: 'pid'                // We are already filtering by patient, doesn't sense to sort here
};

function getFhirToJDSMap(){
    return fhirToJDSMap;
}

function sortEntries(req, entries){
    var params = req.query;
    var sortParamName;

    var sortDesc = false;
    if (nullchecker.isNotNullish(params._sort)) {
        sortParamName = params._sort;
    } else if (nullchecker.isNotNullish(params['_sort:asc'])) {
        sortParamName = params['_sort:asc'];
    } else if (nullchecker.isNotNullish(params['_sort:dsc'])) {
        sortParamName = params['_sort:dsc'];
        sortDesc = true;
    } else {
        return entries;
    }

    switch(sortParamName){
        case 'date':
            entries = sort(entries, ['resource','diagnosticDateTime']);
            break;
        case 'identifier':
            entries = sort(entries, ['resource','identifier','value']);
            break;
        case 'issued':
            entries = sort(entries, ['resource','issued']);
            break;
        case 'performer':
            entries = sort(entries, ['resource','performer','display']);
            break;
        case 'result':
            //Special case - must iterate through extensions to find the correct value
            entries = _.sortBy(entries, function (report) {
                var extension = _.get(report, ['resource','extension']);
                var val;
                _.filter(extension, function(ext) {
                        if(ext.url === 'http://vistacore.us/fhir/extensions/lab#result'){
                            val = ext.valueString;
                            return val;
                        }
                    });
                return Number(val);
            });
            break;
        case 'service':
            entries = sort(entries, ['resource','serviceCategory','text']);
            break;
        case 'specimen':
            entries = sort(entries, ['resource','specimen','display']);
            break;
        case 'status':
            entries = sort(entries, ['resource','status']);
            break;
        }

    if(sortDesc){
        entries.reverse();
    }
    return entries;
}

function sort(entries, path){
    entries = _.sortBy(entries, function (report) {
        return _.get(report, path);
    });
    return entries;
}

module.exports.sortEntries = sortEntries;
module.exports.getFhirToJDSMap = getFhirToJDSMap;
