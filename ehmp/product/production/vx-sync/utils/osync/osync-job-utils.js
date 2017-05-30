'use strict';

var _ = require('underscore');
var uuid = require('node-uuid');

var osync = {};

osync.createOpportunisticSyncRequest = function(rootJob) {
    return osync.create(osync.opportunisticSyncRequestType(), rootJob);
};

osync.createAdmissionsJob = function(log, rootJob) {
    return osync.create(osync.admissionsJobType(), rootJob, log);
};

osync.createAppointmentsJob = function(log, rootJob) {
    return osync.create(osync.appointmentsJobType(), rootJob, log);
};

osync.createSyncJob = function(log, rootJob) {
    return osync.create(osync.syncJobType(), rootJob, log);
};

osync.createPatientListJob = function(log, meta) {
    return osync.create(osync.patientListJobType(), meta, log);
};

osync.opportunisticSyncRequestType = function() {
    return 'opportunistic-sync-request';
};

osync.admissionsJobType = function() {
    return 'admissions';
};

osync.appointmentsJobType = function() {
    return 'appointments';
};

osync.syncJobType = function() {
    return 'sync';
};

osync.patientListJobType = function() {
    return 'patientlist';
};

osync.create = function(type, meta, logger) {
    var job = {
        type: type
    };

    if (_.isUndefined(meta)) {
        meta = {};
    }

    if (!_.isUndefined(meta.jpid)) {
        job.jpid = meta.jpid;
    } else {
        job.jpid = uuid.v4();
    }

    if (!_.isUndefined(meta.rootJobId)) {
        job.rootJobId = meta.rootJobId;
    }

    if (!_.isUndefined(meta.forceSync)) {
        job.forceSync = meta.forceSync;
    }

    if (!_.isUndefined(meta.referenceInfo)) {
        job.referenceInfo = meta.referenceInfo;
    }

    if (!_.isUndefined(meta.jobId)) {
        job.jobId = meta.jobId;
    }

    if (!_.isUndefined(meta.source)) {
        job.source = meta.source;
    }

    if (!_.isUndefined(meta.patient)) {
        job.patient = meta.patient;
    }

    if (!_.isUndefined(meta.user)) {
        job.user = meta.user;
    }

    if (!_.isUndefined(meta.siteId)) {
        job.siteId = meta.siteId;
    }

    if (logger) {
        logger.debug('job-utils.create: creating job: ' + JSON.stringify(job));
    }
    return job;
};

osync.isValid = function(type, job) {

    if (_.isEmpty(type) || _.isEmpty(job)) {
        return false;
    }

    if (osync.missingOrBlank(job, 'type') ) {
        return false;
    }

    return true;
};

osync.missingOrBlank = function(object, field) {
    return _.isUndefined(object) || _.isNull(object) || _.isUndefined(object[field]) || _.isNull(object[field]) || object[field] === '';
};

module.exports = osync;
