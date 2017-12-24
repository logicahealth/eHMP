'use strict';

require('../../env-setup');
var _ = require('underscore');
var async = require('async');
var jobUtil = require(global.OSYNC_UTILS + 'osync-job-utils');
var uidUtils = require(global.VX_UTILS + 'uid-utils');
var util = require('util');
var uuid = require('node-uuid');

/**
 * Creates an instance of the OsyncClinicUtils
 * @constructor
 * @param {object} log - the log object used for this instance of the OsyncClinicUtils
 * @param {object} config - the osync configuration object used for this instance of the OsyncClinicUtils
 * @param {object} environment - the osync environment object used for this instance of the OsyncClinicUtils
 **/
function OsyncClinicUtils(log, config, environment) {
    if (! (this instanceof OsyncClinicUtils)) {
        return new OsyncClinicUtils(log, config, environment);
    }

    this.log = log;
    this.config = config;
    this.environment = environment;
}

// osyncClinicAdd helper function
function clinicAddByUid(self, uid, callback) {
    self.log.debug('osync-clinic-utils.clinicAddByUid: Entering function');
    var site = uidUtils.extractSiteFromUID(uid);
    self.environment.pjds.createOSyncClinic(site, uid, function(error, response) {
        if (error) {
            self.log.error('osync-clinic-utils.clinicAddByUid: Error: %j', error);
            return callback(util.format('Error adding UID %s to osynclinic store', uid));
        }

        if (response.statusCode !== 201) {
            self.log.error('osync-clinic-utils.clinicAddByUid: Error: Status code: %s, Response: %j', response.statusCode, response.body);
            return callback(util.format('Error adding UID %s to osynclinic store', uid));
        }

        self.log.debug('osync-clinic-utils.clinicAddByUid: UID %s added to osynclinic store', uid);
        return callback(null, util.format('UID %s added to osynclinic store', uid));
    });
}

// osyncClinicAdd helper function
function clinicAddByUidCheck(self, uid, type, callback) {
    self.log.debug('osync-clinic-utils.clinicAddByUidCheck: Entering function');
    self.environment.jds.getOperationalDataByUid(uid, function(error, response, result) {
        var odsType;

        if (error) {
            self.log.error('osync-clinic-utils.clinicAddByUidCheck: Error: %j', error);
            return callback(util.format('Error retrieving location operational data from JDS for UID %s', uid));
        }

        if (response.statusCode !== 200) {
            self.log.error('osync-clinic-utils.clinicAddByUidCheck: Error: Status code: %s, Response: %j', response.statusCode, response.body);
            return callback(util.format('Error retrieving location operational data from JDS for UID %s', uid));
        }

        if (result.data.totalItems === 0) {
            self.log.error('osync-clinic-utils.clinicAddByUidCheck: UID %s is not stored in JDS', uid);
            return callback(util.format('Error: UID %s is not stored in JDS', uid));
        }

        odsType = result.data.items[0].type;
        if (type && odsType !== type) {
            self.log.error('osync-clinic-utils.clinicAddByUidCheck: Type %s does not match JDS operational data type %s for UID %s', type, odsType, uid);
            return callback(util.format('Error: Type %s does not match JDS operational data type %s', type, odsType));
        }

        return clinicAddByUid(self, uid, callback);
    });
}

// osyncClinicAdd helper function
function clinicAddBySiteAndClinicCheck(self, site, clinic, type, callback) {
    self.log.debug('osync-clinic-utils.clinicAddBySiteAndClinicCheck: Entering function');
    self.environment.jds.getOperationalDataBySiteAndClinic(site, clinic, function(error, response, result) {
        var count, uid, statusArray = [];

        if (error) {
            self.log.error('osync-clinic-utils.clinicAddBySiteAndClinic: Error: %j', error);
            return callback(util.format('Error retrieving location operational data from JDS for clinic %s at site %s', clinic, site));
        }

        if (response.statusCode !== 200) {
            self.log.error('osync-clinic-utils.clinicAddBySiteAndClinic: Error: Status code: %s, Response: %j', response.statusCode, response.body);
            return callback(util.format('Error retrieving location operational data from JDS for clinic %s at site %s', clinic, site));
        }

        count = 0;
        _.each(result.data.items, function(item) {
            if ((!type && item.type !== 'W') || item.type === type) {
                statusArray.push(item.uid);
                count++;
            }
        });

        if (type && count === 0) {
            self.log.error('osync-clinic-utils.clinicAddBySiteAndClinic: Clinic %s at site %s of type %s is not stored in JDS', clinic, site, type);
            return callback(util.format('Error: Clinic %s at site %s of type %s is not stored in JDS', clinic, site, type));
        } 

        if (count === 0) {
            self.log.error('osync-clinic-utils.clinicAddBySiteAndClinic: Clinic %s at site %s is not stored in JDS', clinic, site);
            return callback(util.format('Error: Clinic %s at site %s is not stored in JDS', clinic, site));
        } 

        if (count === 1) {
            uid = statusArray[0];
            return clinicAddByUid(self, uid, callback);
        }

        self.log.debug('osync-clinic-utils.clinicAddBySiteAndClinic: There are %d clinics to choose from, please rerun with uid', count);
        return callback(null, util.format('There are %d clinics to choose from, please rerun with uid', count), statusArray);
    });
}

// osyncClinicRemove helper function
function clinicRemoveByUid(self, uid, callback) {
    self.log.debug('osync-clinic-utils.clinicRemoveByUid: Entering function');
    self.environment.pjds.deleteOSyncClinic(uid, function(error, response) {
        if (error) {
            self.log.error('osync-clinic-utils.clinicRemoveByUid: Error: %j', error);
            return callback(util.format('Error removing UID %s from osynclinic store', uid));
        }

        if (response.statusCode !== 200) {
            self.log.error('osync-clinic-utils.clinicRemoveByUid: Error: Status code: %s, Response: %j', response.statusCode, response.body);
            return callback(util.format('Error removing UID %s from osynclinic store', uid));
        }

        self.log.debug('osync-clinic-utils.clinicRemoveByUid: UID %s removed from osynclinic store', uid);
        return callback(null, util.format('UID %s removed from osynclinic store', uid));
    });
}

// osyncClinicRun helper function
function clinicRunByUid(self, uid, referenceInfo, callback) {
    self.log.debug('osync-clinic-utils.clinicRunByUid: Entering function');

    var job = jobUtil.createAppointmentsJob(self.log, {});
    job.siteId = uidUtils.extractSiteFromUID(uid);
    job.clinic = uidUtils.extractPatientFromUID(uid);
    job.jobId = uuid.v4();

    if(referenceInfo){
        job.referenceInfo = referenceInfo;
    }

    self.environment.publisherRouter.publish(job, function(error) {
        if (error) {
            self.log.error('osync-clinic-utils.clinicRunByUid: Error: %j', error);
            return callback(util.format('Error publishing jobId %s to osync-appointments tube', job.jobId));
        }

        self.log.debug('osync-clinic-utils.clinicRunByUid: Published jobId %s to osync-appointments tube: Complete status %j', job.jobId, job);
        return callback(null, util.format('Published jobId %s to osync-appointments tube', job.jobId));
    });
}

/**
 ** Adds an osync clinic to the pJDS osynclinic data store, validating data against the ODS clinic data
 ** @param {string} site - The site used along with clinic to check the ODS data for an osync clinic to add
 ** @param {string} clinic - The clinic used along with site to check the ODS data for an osync clinic to add
 ** @param {string} uid - The clinic UID used to add an osync clinic to the pJDS osynclinic data store
 ** @param {string} type - The clinic type used to filter the osync clinic list from ODS clinic data
 ** @param {boolean} override - The clinic validation override flag
 ** @param {function} callback - The callback function that should be called when the action is completed
 **/
OsyncClinicUtils.prototype.osyncClinicAdd = function(site, clinic, uid, type, override, callback) {
    var self = this;
    self.log.debug('osync-clinic-utils.osyncClinicAdd: Entering method');

    if (!(site && clinic) && !uid) {
        self.log.error('osync-clinic-utils.osyncClinicAdd: You must provide either site and clinic, or uid');
        return callback('Error: You must provide either site and clinic, or uid');
    }

    if (override && !uid) {
        self.log.error('osync-clinic-utils.osyncClinicAdd: You must provide the uid parameter when you set override to true');
        return callback('Error: You must provide the uid parameter when you set override to true');
    }

    if (override && uid) {
        return clinicAddByUid(self, uid, callback);
    } else if (uid) {
        return clinicAddByUidCheck(self, uid, type, callback);
    } else if (site && clinic) {
        return clinicAddBySiteAndClinicCheck(self, site, clinic, type, callback);
    }
};

/**
 ** Removes an osync clinic from the pJDS osynclinic data store, validating data against the ODS clinic data
 ** @param {string} site - The site to use to determine what osync clinics to remove from the pJDS osynclinic data store
 ** @param {string} uid - The clinic UID used to remove an osync clinic from the pJDS osynclinic data store
 ** @param {function} callback - The callback function that should be called when the action is completed
 **/
OsyncClinicUtils.prototype.osyncClinicRemove = function(site, uid, callback) {
    var self = this;
    self.log.debug('osync-clinic-utils.osyncClinicRemove: Entering method');

    if (!site && !uid) {
        self.log.error('osync-clinic-utils.osyncClinicRemove: You must provide either site or uid');
        return callback('Error: You must provide either site or uid');
    }

    if (uid) {
        self.environment.pjds.getOSyncClinicsByUid(uid, function(error, response) {
            if (error) {
                self.log.error('osync-clinic-utils.osyncClinicRemove: Error: %j', error);
                return callback(util.format('Error retrieving clinics from osynclinic data store for UID %s', uid));
            }

            if (response.statusCode !== 200) {
                self.log.error('osync-clinic-utils.osyncClinicRemove: Error: Status code: %s, Response: %j', response.statusCode, response.body);
                return callback(util.format('Error retrieving clinics from osynclinic data store for UID %s', uid));
            }

            return clinicRemoveByUid(self, uid, callback);
        });
    } else if (site) {
        self.osyncClinicGet(site, function(error, result, clinicList) {
            var count, statusArray = [];

            if (error) {
                self.log.error('osync-clinic-utils.clinicClinicRemove: Error: %j', error);
                return callback(util.format('Error retrieving clinics from osynclinic data store for site %s', site));
            }

            count = 0;
            async.eachSeries(clinicList, function(item, cb) {
                return clinicRemoveByUid(self, item, function(error) {
                    if (error) {
                        return cb(error);
                    }

                    statusArray.push(item);
                    count++;
                    return cb();
                });
            }, function(error) {
                self.log.debug('osync-clinic-utils.osyncClinicRemove: Successfully removed %d clinic(s)', count);
                return callback(error, util.format('Successfully removed %d clinic(s)', count), statusArray);
            });
        });
    }
};

/**
 ** Gets a list of osync clinics from the pJDS osynclinic data store
 ** @param {string} site - The site to use to determine what osync clinics to list
 ** @param {function} callback - The callback function that should be called when the action is completed
 **/
OsyncClinicUtils.prototype.osyncClinicGet = function(site, callback) {
    var self = this;
    self.log.debug('osync-clinic-utils.osyncClinicGet: Entering method');

    self.environment.pjds.getOSyncClinicsBySite(site, function(error, response, result) {
        var count, statusArray = [];

        if (error) {
            self.log.error('osync-clinic-utils.osyncClinicGet: Error: %j', error);
            return callback(util.format('Error retrieving clinics from osynclinic data store for site %s', site));
        }

        if (response.statusCode !== 200) {
            self.log.error('osync-clinic-utils.osyncClinicGet: Error: Status code: %s, Response: %j', response.statusCode, response.body);
            return callback(util.format('Error retrieving clinics from osynclinic data store for site %s', site));
        }

        count = 0;
        _.each(result.items, function(item) {
            statusArray.push(item.uid);
            count++;
        });

        self.log.debug('osync-clinic-utils.osyncClinicGet: Successfully listed %d clinic(s)', count);
        return callback(null, util.format('Successfully listed %d clinic(s)', count), statusArray);
    });
};

/**
 ** Process a site's osync clinics from the pJDS osynclinic data store
 ** @param {string} site - The site to use to determine what osync clinics to process from the pJDS osynclinic data store
 ** @param {string} uid - The clinic UID to process an osync clinic from the pJDS osynclinic data store
 ** @param {function} callback - The callback function that should be called when the action is completed
 **/
OsyncClinicUtils.prototype.osyncClinicRun = function(site, uid, referenceInfo, callback) {
    var self = this;
    self.log.debug('osync-clinic-utils.osyncClinicRun: Entering method');

    if (!site && !uid) {
        self.log.error('osync-clinic-utils.osyncClinicRun: You must provide either site or uid');
        return callback('Error: You must provide either site or uid');
    }

    if (uid) {
        self.environment.pjds.getOSyncClinicsByUid(uid, function(error, response) {
            if (error) {
                self.log.error('osync-clinic-utils.osyncClinicRun: Error: %j', error);
                return callback(util.format('Error retrieving clinics from osynclinic data store for UID %s', uid));
            }

            if (response.statusCode !== 200) {
                self.log.error('osync-clinic-utils.osyncClinicRun: Error: Status code: %s, Response: %j', response.statusCode, response.body);
                return callback(util.format('Error retrieving clinics from osynclinic data store for UID %s', uid));
            }

            return clinicRunByUid(self, uid, referenceInfo, callback);
        });
    } else if (site) {
        self.osyncClinicGet(site, function(error, result, clinicList) {
            var count, statusArray = [];

            if (error) {
                self.log.error('osync-clinic-utils.clinicClinicRun: Error: %j', error);
                return callback(util.format('Error retrieving clinics from osynclinic data store for site %s', site));
            }

            count = 0;
            async.eachSeries(clinicList, function(item, cb) {
                return clinicRunByUid(self, item, referenceInfo, function(error) {
                    if (error) {
                        return cb(error);
                    }

                    statusArray.push(item);
                    count++;
                    return cb();
                });
            }, function(error) {
                self.log.debug('osync-clinic-utils.osyncClinicRun: Successfully published %d osync clinic job(s) to osync-appointments tube', count);
                return callback(error, util.format('Successfully published %d osync clinic job(s) to osync-appointments tube', count), statusArray);
            });
        });
    }
};

module.exports = OsyncClinicUtils;
