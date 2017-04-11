'use strict';

var order = require('../order');

function getData(appConfig, logger, pid, params, callback) {
    // TODO: Replace hardcoded start once paging is supported
    // TODO: Replace null service array with an array of the VPR order services that map to DeviceUseRequest
    return order.getVprData(appConfig, logger, pid, callback, 0 /*start*/ , params, null /*service array*/ );
}

function convertToFhir(inputJSON, req) {
    // TODO: Implement VPR-to-FHIR mapping
    return inputJSON;
}

module.exports.getData = getData;
module.exports.convertToFhir = convertToFhir;
