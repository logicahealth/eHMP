'use strict';

var _ = require('lodash');
var clinicalObjectsSubsystem = require('../../subsystems/clinical-objects/clinical-objects-subsystem');
var rdk = require('../../core/rdk');
var pidValidator = rdk.utils.pidValidator;

var domainList = [
    'allergy',
    'appointment',
    'consult',
    'cpt',
    'discharge',
    'document',
    'vlerdocument',
    'exam',
    'education',
    'factor',
    'immunization',
    'lab',
    'med',
    'mh',
    'obs',
    'order',
    'problem',
    'procedure',
    'patient',
    'pov',
    'ptf',
    'image',
    'skin',
    'surgery',
    'task',
    'visit',
    'vital'
];

function isValidRequest(job, type, log, callback) {
    if (_.isEmpty(job) || _.isNull(job) || _.isUndefined(job)) {
        return callback('Job was empty, null, or undefined');
    }
    if (!job.type || job.type !== type) {
        return callback('Incorrect job type');
    }
    if (_.isUndefined(job.record)) {
        return callback('job record is undefined');
    }
    if (_.isEmpty(job.record)) {
        return callback('job record is empty');
    }

    log.debug(type + '-handler.isValidRequest found valid request');
    return callback(null);
}

function setupIdLogger(job, log) {
    //based on rdk-framework-middleware:addLoggerToRequest function
    if (!_.isUndefined(job) && !_.isNull(job)) {
        var idLogger = log.child({
            requestId: _.get(job, 'referenceInfo.requestId', undefined),
            sid: _.get(job, 'referenceInfo.sessionId', undefined)
        });

        return idLogger;
    }
    return log;
}

function isVPRObject(uid, type, log) {
    log.debug(type + '-handler.isVPRObject beginning with uid: %s', uid);
    var uidParts = uid.split(':');

    if (_.contains(domainList, uidParts[2])) {
        log.debug(type + '-handler.isVPRObject returning true');
        return true;
    } else {
        log.debug(type + '-handler.isVPRObject returning false');
        return false;
    }
}

function findClinicalObject(referenceId, patientUid, config, type, log, loadReference, callback) {
    log.debug(type + '-handler.findClinicalObject - beginning');

    var clinicalObjectFilter = {
        'referenceId': referenceId,
        'patientUid': patientUid
    };

    log.debug(type + '-handler.findClinicalObject - before making call ');

    clinicalObjectsSubsystem.find(log, config, clinicalObjectFilter, loadReference, function(err, response) {
        if (err) {
            if (err[0].toLowerCase().indexOf('not found') > -1) {
                log.debug('There is no clinical object in JDS');
                return callback(null, {});
            }

            log.warn('clinicalObjectsSubsystem error: ', err);
            return callback(err, null);
        }

        var items = response.items;

        if (!items) {
            return callback(null, {
                notes: []
            });
        }
        return callback(null, items);
    });
}

function buildClinicalObject(job, log) {
    var pid = job.patientIdentifier.value;

    var clinicalObject = {};
    clinicalObject.patientUid = constructPatientUid(pid, log);

    clinicalObject.authorUid = job.record.authorUid ? job.record.authorUid : job.record.providerUid;

    var subDomain;
    if ('order' === job.dataDomain) {
        subDomain = _.get(job, 'record.kind');
    } else {
        subDomain = _.get(job, 'dataDomain');
    }
    if (_.isString(subDomain)) {
        clinicalObject.subDomain = subDomain.toLowerCase();
    }
    clinicalObject.domain = 'ehmp-activity';
    clinicalObject.referenceId = job.record.uid;
    clinicalObject.pid = pid;
    clinicalObject.ehmpState = 'active';
    clinicalObject.visit = {
        'location': job.record.locationUid,
        'serviceCategory': job.record.service,
        'dateTime': job.record.entered
    };
    clinicalObject.createdDateTime = job.record.lastUpdateTime;
    clinicalObject.data = job.record;

    return clinicalObject;
}

function constructPatientUid(pid, log) {
    log.debug('In constructPatientUid ', pid);
    var patientUid = 'urn:va:patient:';

    if (pidValidator.isPrimarySite(pid)) {
        log.debug('constructPatientUid not icn ');
        var dfn = pid.substring(pid.indexOf(';') + 1, pid.length);
        var site = pid.substring(0, pid.indexOf(';'));
        patientUid = patientUid + site + ':' + dfn + ':' + dfn;
    } else {
        /**
         * TODO This might not be a valid PID at all. Just because
         * it's not a primary site doesnt mean that it's a valid ICN.
         */
        log.debug('constructPatientUid icn ');
        patientUid = patientUid + 'ICN' + ':' + pid + ':' + pid;
    }
    return patientUid;
}

module.exports.isValidRequest = isValidRequest;
module.exports.setupIdLogger = setupIdLogger;
module.exports.isVPRObject = isVPRObject;
module.exports.findClinicalObject = findClinicalObject;
module.exports.buildClinicalObject = buildClinicalObject;
module.exports.constructPatientUid = constructPatientUid;
