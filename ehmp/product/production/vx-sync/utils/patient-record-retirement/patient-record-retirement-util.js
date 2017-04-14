'use strict';

require('../../env-setup');

var _ = require('underscore');
var async = require('async');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var inspect = require('util').inspect;
var format = require('util').format;
var RetirementRulesEngine = require(global.VX_RETIREMENTRULES + 'rules-engine');
var util = require('util');
var pidUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var moment = require('moment');

function PatientRecordRetirementUtil(log, config, environment, lastAccessDays) {
    if (!(this instanceof PatientRecordRetirementUtil)) {
        return new PatientRecordRetirementUtil(log, config, environment);
    }

    this.log = log;
    this.config = config;
    this.environment = environment;
    this.rulesEngine = new RetirementRulesEngine(log, config, environment);
    this.lastAccessDays = lastAccessDays;
}

PatientRecordRetirementUtil.prototype.getPidsToRetire = function(callback) {
    var self = this;
    self.log.debug('patient-record-retirement-util.getPidsToRetire: entering method');

    var lastAccessDays = (_.isNull(self.lastAccessDays) || _.isUndefined(self.lastAccessDays))? self.config.recordRetirement.lastAccessed : self.lastAccessDays;
    var lastAccessTime = moment().subtract(lastAccessDays, 'days').format('YYYYMMDDHHmmss');

    self.log.debug('patient-record-retirement-util.getPidsToRetire: getting patient list from jds with lastAccessDays %s, lastAccessTime %s', lastAccessDays, lastAccessTime);
    self.environment.jds.getPatientList(lastAccessTime, function(error, response, result) {
        var errorMessage;
        if (error) {
            errorMessage = format('patient-record-retirement-util.getPatientList: received error from JDS when attempting to get patient list. error: %s', inspect(error));
            self.log.error(errorMessage);
            return callback(errorMessage);
        }
        if (!response || response.statusCode !== 200) {
            errorMessage = format('patient-record-retirement-util.getPatientList: received unexpected response from JDS when attempting to get patient list. response: %s', inspect((response) ? response.body : null));
            self.log.error(errorMessage);
            return callback(errorMessage);
        }
        if (!result) {
            errorMessage = format('patient-record-retirement-util.getPatientList: received null result from JDS when attempting to get patient list.');
            self.log.error(errorMessage);
            return callback(errorMessage);
        }

        var patientList = result.items;
        if (patientList && patientList.length > 0) {
            self.log.debug('patient-record-retirement-util.getPatientList(): Returning with list containing %s patients.', patientList.length);
            callback(null, patientList);
        } else {
            self.log.debug('patient-record-retirement-util.getPatientList(): JDS returned no patients eligible for record retirement.');
            callback();
        }
    });
};

PatientRecordRetirementUtil.prototype.runRetirementRules = function(patientList, callback) {
    var self = this;
    self.log.debug('patient-record-retirement-util.runRetirementRules: entering method');

    if(_.isEmpty(patientList)){
        self.log.debug('patient-record-retirement-util.runRetirementRules: no patients in list');
        return callback();
    }

    self.rulesEngine.processRetirementRules(patientList, function(error, filteredIdList) {
        if (error) {
            var errorMessage = format('patient-record-retirement-util.runRetirementRules: received error from rules engine: error: %s', inspect(error));
            self.log.error(errorMessage);
            return callback(errorMessage);
        }

        if (filteredIdList && filteredIdList.length > 0) {
            self.log.debug('patient-record-retirement-util.runRetirementRules(): List filtered to %s patients after running rules engine.', filteredIdList.length);
            callback(null, filteredIdList);
        } else {
            self.log.debug('patient-record-retirement-util.runRetirementRules(): No patients remain after running rules engine.');
            callback();
        }
    });
};

PatientRecordRetirementUtil.prototype.sendRetirementJobs = function(patientList, callback) {
    var self = this;
    self.log.debug('patient-record-retirement-util.sendRetirementJobs: entering method');

    if(_.isEmpty(patientList)){
        self.log.debug('patient-record-retirement-util.sendRetirementJobs: no patients in list');
        return callback(null, 0);
    }

    var jobsPublishedCount = 0;
    async.each(patientList, function(patient, asyncCallback) {
        var idList = patient.patientIdentifiers;
        if (_.isEmpty(idList)) {
            return asyncCallback();
        }

        var id = idList[0];

        var jobPatientIdentifier = {
            type: pidUtil.isIcn(id) ? 'icn' : 'pid',
            value: id
        };

        var job = jobUtil.createPatientRecordRetirement(jobPatientIdentifier, null);
        job.identifiers = idList;
        job.jpid = patient.jpid;

        self.log.debug('patient-record-retirement-util.sendRetirementJobs: created job %s; preparing to send job to beanstalk', inspect(job));

        self.environment.publisherRouter.publish(job, function(error){
            if(!error){
                jobsPublishedCount++;
            }
            asyncCallback(error);
        });
    }, function(error) {
        self.log.debug('patient-record-retirement-util.sendRetirementJobs: published %s jobs to beanstalk', jobsPublishedCount);
        if (error) {
            self.log.error('patient-record-retirement-util.sendRetirementJobs: error returned by writeJobsToBeanstalk: %s', inspect(error));
        }
        callback(error, jobsPublishedCount);
    });
};

PatientRecordRetirementUtil.prototype.runUtility = function(callback) {
    var self = this;
    var errorMessage;

    self.getPidsToRetire(function(error, patientList) {
        if (error) {
            errorMessage = format('patient-record-retirement-util: Exiting due to error returned by getPidsToRetire: %s', inspect(error));
            self.log.error(errorMessage);
            return callback(errorMessage);
        }

        self.runRetirementRules(patientList, function(error, filteredIdList) {
            if (error) {
                errorMessage = format('patient-record-retirement-util: Exiting due to error returned by runRetirementRules: %s', inspect(error));
                self.log.error(errorMessage);
                return callback(errorMessage);
            }

            self.sendRetirementJobs(filteredIdList, function(error, jobCount) {
                if (error) {
                    errorMessage = format('patient-record-retirement-util: Exiting due to error returned by sendRetirementJobs: %s; %s jobs sent to beanstalk', inspect(error), jobCount);
                    self.log.error(errorMessage);
                    return callback(errorMessage);
                }

                self.log.info('patient-record-retirement-util: Utility has successfully finished processing. Created and sent %s patient record retirement jobs to beanstalk', jobCount);
                callback(null, 'success');
            });
        });
    });
};

module.exports = PatientRecordRetirementUtil;