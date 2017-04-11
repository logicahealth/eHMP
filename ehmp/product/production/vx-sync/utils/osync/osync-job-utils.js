'use strict';

var _ = require('underscore');
var uuid = require('node-uuid');

var osync = {};

osync.createOpportunisticSyncRequest = function(rootJob) {
    return osync.create(osync.opportunisticSyncRequestType(), rootJob);
};

osync.createActiveUsersJob = function(log, config, environment, rootJob) {
    return osync.create(osync.activeUsersJobType(), rootJob, log);
};

osync.createAdmissionsJob = function(log, config, environment, rootJob) {
    return osync.create(osync.admissionsJobType(), rootJob, log);
};

osync.createAppointmentsJob = function(log, config, environment, rootJob) {
    return osync.create(osync.appointmentsJobType(), rootJob, log);
};

osync.createStoreJobStatusJob = function(log, config, environment, rootJob) {
    return osync.create(osync.storeJobStatusJobType(), rootJob, log);
};

osync.createSyncJob = function(log, config, environment, rootJob) {
    return osync.create(osync.syncJobType(), rootJob, log);
};

osync.createValidationJob = function(log, config, environment, rootJob) {
    return osync.create(osync.validationJobType(), rootJob, log);
};

osync.createPatientListJob = function(log, config, environment, rootJob) {
    return osync.create(osync.patientListJobType(), rootJob, log);
};

osync.opportunisticSyncRequestType = function() {
    return 'opportunistic-sync-request';
};

osync.activeUsersJobType = function() {
    return 'active-users';
};

osync.admissionsJobType = function() {
    return 'admissions';
};

osync.appointmentsJobType = function() {
    return 'appointments';
};

osync.storeJobStatusJobType = function() {
    return 'store-job-status';
};

osync.syncJobType = function() {
    return 'sync';
};

osync.validationJobType = function() {
    return 'validation';
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

    if (!_.isUndefined(meta.jobId)) {
        job.jobId = meta.jobId;
    }

    if (!_.isUndefined(meta.source)) {
        job.source = meta.source;
    }

    if (!_.isUndefined(meta.patient)) {
        job.patient = meta.patient;
    }

    if (!_.isUndefined(meta.users)) {
        job.users = meta.users;
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

    if (missingOrBlank(job, 'type') ) {
        return false;
    }

    if (!_.has(fields, type)) {
        return false;
    }

    var validFields = allFieldsValid(job, fields[type]);

    return validFields;
};

osync.missingOrBlank = function(object, field) {
    return _.isUndefined(object) || _.isNull(object) || _.isUndefined(object[field]) || _.isNull(object[field]) || object[field] === '';
};

osync.allFieldsValid = function(object, requiredFields) {
    return _.every(requiredFields, function(name) {
        return !missingOrBlank(object, name);
    });
};

module.exports = osync;
