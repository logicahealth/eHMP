'use strict';

var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
var fetchPatientUid = require('./get-patient-uid');
var _ = require('lodash');
var asuUtils = require('./asu-utils');

module.exports.getResourceConfig = function () {
    return [{
        name: 'uid',
        path: '',
        get: getPatientUid,
        outerceptors: ['asu'],
        subsystems: ['patientrecord','jds','solr','jdsSync','authorization'],
        requiredPermissions: ['read-patient-record'],
        isPatientCentric: true
    }];
};

function getPatientUid(req, res) {
    fetchPatientUid.getPatientUid(req, function(err, response, data) {
        if(!nullchecker.isNullish(err)) {
            if (_.isNumber(err.code)) {
                res.status(err.code).rdkSend(err.message);
            } else {
                res.status(500).rdkSend('500');  // TODO respond with real error
            }
            return;
        }
        req.logger.info('PatientUidResource.filterAsuDocuments: Asu data %j',data);

         var checkASU=isCheckASU(data);
        if(checkASU==='true'){
            filterAsuDocuments(req, res, response.statusCode, data);
        }else{
            return res.set('Content-Type', 'application/json').status(response.statusCode).rdkSend(data);
        }
   });
}

function isCheckASU(details)
{
    var checkASU='false';

    if (nullchecker.isNullish(details) || nullchecker.isNullish(details.data) ||
        nullchecker.isNullish(details.data.items) || _.isUndefined(details.data.items)) {

        return checkASU;
    }

    _.forEach(details.data.items, function(item){
        if(!_.isUndefined(item.documentDefUid) &&
            !nullchecker.isNullish(item.documentDefUid)) {
            checkASU='true';
        }
    });

    return checkASU;

}

function filterAsuDocuments(req, res, statusCode,details) {
    if (nullchecker.isNullish(details) && nullchecker.isNullish(details.data) &&
        nullchecker.isNullish(details.data.items) || !details.data.items.length) {
        return res.set('Content-Type', 'application/json').status(statusCode).rdkSend(details);
    }

    asuUtils.applyAsuRules(req, details, function(error, response){
        if(error)
        {
            req.logger.info('PatientUidResource.filterAsuDocuments: Asu Error: %j',error);
            //return res.set('Content-Type', 'application/json').status('500').rdkSend(error);
            res.set('Content-Type', 'application/json').status('500').rdkSend(error);

        }
        else
        {
            req.logger.info('PatientUidResource.filterAsuDocuments: Asu response %j',response);
            //return res.set('Content-Type', 'application/json').status(statusCode).rdkSend(response);
            res.set('Content-Type', 'application/json').status(statusCode).rdkSend(response);

        }
    });
}
