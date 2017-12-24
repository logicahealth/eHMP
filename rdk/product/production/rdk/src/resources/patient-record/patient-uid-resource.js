'use strict';

var rdk = require('../../core/rdk');
var nullchecker = rdk.utils.nullchecker;
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
    req.audit.logCategory = 'RETRIEVE';

    var uid = req.param('uid');
    var pid = req.param('pid');
    if (nullchecker.isNullish(uid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing uid parameter');
    } else if (nullchecker.isNullish(pid)) {
        return res.status(rdk.httpstatus.bad_request).rdkSend('Missing pid parameter');
    }

    req.app.subsystems.jds.getByUid(req, pid, uid, function(err, data, statusCode) {
        if(!nullchecker.isNullish(err)) {
            if (_.isNumber(err.code)) {
                res.status(err.code).rdkSend(data);
            } else {
                err = new Error('Unable to retrieve the Patient Uid');
                req.logger.error(err);
                return res.status(rdk.httpstatus.internal_server_error).rdkSend(err.message);
            }
            return;
        }
        req.logger.info('PatientUidResource.filterAsuDocuments: Asu data %j',data);

         var checkASU=isCheckASU(data);
        if(checkASU==='true'){
            filterAsuDocuments(req, res, statusCode, data);
        }else{
            return res.set('Content-Type', 'application/json').status(statusCode).rdkSend(data);
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
    if (nullchecker.isNullish(details) || nullchecker.isNullish(details.data) ||
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

//used for unit testing
module.exports._getPatientUid = getPatientUid;
module.exports._isCheckASU = isCheckASU;
module.exports._filterAsuDocuments = filterAsuDocuments;
