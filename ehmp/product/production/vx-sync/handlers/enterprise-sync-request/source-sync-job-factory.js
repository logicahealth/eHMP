'use strict';

var _ = require('underscore');

// var inspect = require(global.VX_UTILS + 'inspect');

var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var logUtil = require(global.VX_UTILS + 'log');
var SyncRulesEngine = require(global.VX_SYNCRULES + '/rules-engine');

var JobMiddleware = require(global.VX_UTILS + 'middleware/job-middleware');

//--------------------------------------------------------------------------
// Constructor for the SourceSyncJobFactory.
//
// log: The logger to be used.
// config: The configuration information.
// job: The job that triggered the handler using this object.
// environment: The environment information (cross cutting information)
//-------------------------------------------------------------------------
function SourceSyncJobFactory(log, config, job, environment) {
    if (!(this instanceof SourceSyncJobFactory)) {
        return new SourceSyncJobFactory(log, config, job, environment);
    }
    var jobMiddleware = new JobMiddleware(log, config, environment);
    this.primaryJobVerifier = jobMiddleware.jobVerification.bind(null, [], {}); // Any record exists we consider patient synced.
    this.secondaryJobVerifier = jobMiddleware.jobVerification.bind(null, ['completed'], {}); //  Allows for resync on secondary site - if the state is in completed state

    if ((environment) && (environment.jobStatusFunction)) {
        this.jobStatus = environment.jobStatusFunction;
    }
    else {
        this.jobStatus = jobMiddleware.getJobHistory.bind(null, {});
    }

    this.engine = new SyncRulesEngine(log, config, environment);
    this.log = logUtil.getAsChild('source-sync-job-factory', log);
    this.jobMiddleware = jobMiddleware;
    this.config = config;
    this.job = job;
}

//--------------------------------------------------------------------------------------------------------
// Using the given identifiers, this routine creates jobs to sync the systems associated by those
// identifiers.  If the system is already synced, being synced, or in the case of a secondary system,
// has been synced recent enough, it will not send a sync request for that system.
//
// patientIdentifiers:  This is an array of patientIdentifier objects
// callback: This is the callback handler that is called when it is done.
//--------------------------------------------------------------------------------------------------------
SourceSyncJobFactory.prototype.createVerifiedJobs = function(patientIdentifiers, callback) {
    var self = this;
    self.log.debug('source-sync-job-factory.createVerifiedJobs: SourceSyncJobFactory.createVerifiedJobs().  patientIdentifiers that we are starting with.  patientIdentifiers: %j', patientIdentifiers);

    self.engine.getSyncPatientIdentifiers(patientIdentifiers, self.job.forceSync, function(err, patientIdentifiers){
        self.log.debug('source-sync-job-factory.createVerifiedJobs: patientIdentifiers returned from rules engine.  patientIdentifiers: %j, error: %j', patientIdentifiers, err);
        if (_.isEmpty(err)) {
            var jobsToPublish = createJobsToPublish(self, patientIdentifiers);
            self.log.debug('source-sync-job-factory.createVerifiedJobs: jobsToPublish: %j', jobsToPublish);
            callback(null, jobsToPublish);
        } else if (err === 'NO_OPDATA') {
            callback(err);
        }
    });
};

//---------------------------------------------------------------------------------------
// This method creates a sync job for the systems associated with each patientIdentifier
// and places it in the return array.
//
// self: A handle to the "this" pointer.
// patientIdentifiers:  This is an array of patientIdentifier objects
// returns: The array of sync jobs that was created.
//---------------------------------------------------------------------------------------
function createJobsToPublish(self, patientIdentifiers) {
    self.log.debug('source-sync-job-factory.createJobsToPublish: Entered method.  patientIdentifiers: %j', patientIdentifiers);

    var pidList = idUtil.extractIdsOfTypes(patientIdentifiers, 'pid');
    self.log.debug('source-sync-job-factory.createJobsToPublish: PID identifiers in the list: %j', pidList);

    var vistaDirectPidList = removeNonPrimaryVistaSites(self, pidList);
    self.log.debug('source-sync-job-factory.createJobsToPublish: PID identifiers for primary VistA sites in the list: %j', vistaDirectPidList);

    var icnList = idUtil.extractIdsOfTypes(patientIdentifiers, 'icn');
    self.log.debug('source-sync-job-factory.createJobsToPublish: ICN identifiers in the list: %j', icnList);

    var dodList = idUtil.extractPidBySite(patientIdentifiers, 'DOD');
    self.log.debug('source-sync-job-factory.createJobsToPublish: DOD identifiers in the list: %j', dodList);


    var hdrList = null;
    if (idUtil.isHdrPubSubMode(self.config)) {
        hdrList = removeNonVistaHdrSites(self, pidList);
        self.log.debug('source-sync-job-factory.createJobsToPublish: HDR in PUB/SUB mode: PID identifiers for VistaHdr sites in the list: %j', hdrList);
    }
    else {
        hdrList = idUtil.extractPidBySite(patientIdentifiers, 'HDR');
        self.log.debug('source-sync-job-factory.createJobsToPublish: HDR in REQ/RES mode: HDR identifiers in the list: %j', hdrList);
    }

    var vlerList = idUtil.extractPidBySite(patientIdentifiers, 'VLER');
    self.log.debug('source-sync-job-factory.createJobsToPublish: VLER identifiers in the list: %j', vlerList);

    // PGD no longer exists so this code is obsolete
    // var pgdList = idUtil.extractPidBySite(patientIdentifiers, 'DAS');
    // self.log.debug('source-sync-job-factory.createJobsToPublish: DAS (pgd) identifiers in the list: %j', pgdList);

    var jobs = [];

    // Create the jobs for the VistA sites
    //--------------------------------------
    if ((vistaDirectPidList) && (vistaDirectPidList.length >= 1)) {
        jobs = jobs.concat(createVistaJobs(self, vistaDirectPidList));
    }

    // Create the jobs for the VistA HDR sites - if we are configured in pub/sub mode
    //--------------------------------------------------------------------------------
    if ((idUtil.isHdrPubSubMode(self.config)) && (hdrList) && (hdrList.length >= 1)) {
        jobs = jobs.concat(createVistaHdrJobs(self, hdrList));
    }

    // If we have DoD identifiers, then create a JMeadows job
    if ((dodList) && (dodList.length >= 1) && !isSecondarySiteDisabled(self.config, 'jmeadows')) {
        jobs = jobs.concat(createJmeadowsJob(self, _.first(dodList)));
    }

    // If we have an ICN then create the jobs for the secondary sites.
    //---------------------------------------------------------------
    if (icnList.length > 0) {
        // if HDR is in REQ/RES mode and we have some hdr  IDs - then eadd them.
        //-----------------------------------------------------------------------
        if ((!idUtil.isHdrPubSubMode(self.config)) && (hdrList) && (hdrList.length >= 1) && !isSecondarySiteDisabled(self.config, 'hdr')) {
             jobs = jobs.concat(createHdrJob(self, _.first(hdrList)));
        }

         if ((vlerList) && (vlerList.length >= 1) && !isSecondarySiteDisabled(self.config, 'vler')) {
             self.log.debug('source-sync-job-factory.createJobsToPublish: VLER identifiers in the list: %j', vlerList);
             jobs = jobs.concat(createVlerJob(self, _.first(vlerList)));
         }

        // PGD no longer exists so this code is obsolete
        // if ((pgdList) && (pgdList.length >= 1)) {
        //     jobs = jobs.concat(createVlerJob(self, _.first(vlerList)));
        // }
    }


    self.log.debug('source-sync-job-factory.createJobsToPublish: Prepared sync jobs: %j', jobs);
    return jobs;
}

//-----------------------------------------------------------------------------------------------
// This method returns any PIDs that are for any VistA site that is configured as a primary
// vista site.
//
// self:  "this" pointer containing the config and log.
// patientIdentifiers: An array of patientIdenfifier objects.
// returns: An array of patientIdentifier objects that are associated with a primary VistA site.
//-----------------------------------------------------------------------------------------------
function removeNonPrimaryVistaSites (self, patientIdentifiers) {
    var vistaSites = self.config.vistaSites;
    self.log.debug('enterprise-sync-request-handler.removeNonPrimaryVistaSites: Primary Vista Sites: %j ', vistaSites);
    return _.filter(patientIdentifiers, function(patientIdentifier) {
        return patientIdentifier.type === 'pid' && _.isObject(vistaSites[idUtil.extractSiteFromPid(patientIdentifier.value)]);
    });
}

//-----------------------------------------------------------------------------------------------
// This method returns any PIDs that are for any VistA site that is configured as an HDR PUB/SUB
// vista site.
//
// self:  "this" pointer containing the config and log.
// patientIdentifiers: An array of patientIdenfifier objects.
// returns: An array of patientIdentifier objects that are associated with a primary VistA site.
//-----------------------------------------------------------------------------------------------
function removeNonVistaHdrSites (self, patientIdentifiers) {
    if ((!_.isObject(self.config.hdr)) || (!_.isObject(self.config.hdr.hdrSites))) {
        return null;
    }
    var hdrSites = self.config.hdr.hdrSites;
    self.log.debug('enterprise-sync-request-handler.removeNonPrimaryVistaSites: Vista HDR Sites: %j ', hdrSites);
    return _.filter(patientIdentifiers, function(patientIdentifier) {
        return patientIdentifier.type === 'pid' && _.isObject(hdrSites[idUtil.extractSiteFromPid(patientIdentifier.value)]);
    });
}

//--------------------------------------------------------------------------------------------
// This method creates a sync job for each  VistA site in the given patientIdentifiers array.
//
// self: A handle to the this pointer.
// patientIdentifiers: This is an array of patientIdentifier objects for VistA sites.
// returns: An array of vista sync jobs that were created.
//--------------------------------------------------------------------------------------------
function createVistaJobs(self, patientIdentifiers) {
    return _.map(patientIdentifiers, function(patientId) {
        var meta;
        if (self.job) {
            meta = _createMetaForJob(self.job);
        }
        var newJob = jobUtil.createVistaSubscribeRequest(idUtil.extractSiteFromPid(patientId.value), patientId, meta);
        return newJob;
    });
}

//--------------------------------------------------------------------------------------------
// This method creates a sync job for each  VistA site in the given patientIdentifiers array.
//
// self: A handle to the this pointer.
// patientIdentifiers: This is an array of patientIdentifier objects for VistA sites.
// returns: An array of vista sync jobs that were created.
//--------------------------------------------------------------------------------------------
function createVistaHdrJobs(self, patientIdentifiers) {
    return _.map(patientIdentifiers, function(patientId) {
        var meta;
        if (self.job) {
            meta = _createMetaForJob(self.job);
        }
        var newJob = jobUtil.createVistaHdrSubscribeRequest(idUtil.extractSiteFromPid(patientId.value), patientId, meta);
        return newJob;
    });
}

//--------------------------------------------------------------------------------------------
// This method creates a VLER sync job for the patient in the patientIdentifier object.
//
// self: A handle to the this pointer.
// patientIdentifier: This is patientIdentifier containing the PID for VLER.
// returns: The VLER sync jobs that was created.
//--------------------------------------------------------------------------------------------
function createVlerJob(self, patientIdentifier) {
    var meta;
    if (self.job) {
        meta = _createMetaForJob(self.job);
    }
    var vler = jobUtil.createVlerSyncRequest(patientIdentifier, meta);
    self.log.debug('createVlerJob: sync request: %j with pid: %j', vler, patientIdentifier);
    return vler;
}

//--------------------------------------------------------------------------------------------
// This method creates a PGD sync job for the patient in the patientIdentifier object.
//
// self: A handle to the this pointer.
// patientIdentifier: This is patientIdentifier containing the PID for VLER.
// returns: The PGD sync jobs that was created.
//--------------------------------------------------------------------------------------------
function createPgdJob(self, patientIdentifier) {
    var meta;
    if (self.job) {
        meta = _createMetaForJob(self.job);
    }
    var pgd = jobUtil.createPgdSyncRequest(patientIdentifier, meta);
    return pgd;
}

//--------------------------------------------------------------------------------------------
// This method creates a HDR sync job for the patient in the patientIdentifier object.
//
// self: A handle to the this pointer.
// patientIdentifier: This is patientIdentifier containing the PID for HDR.
// returns: The HDR sync jobs that was created.
//--------------------------------------------------------------------------------------------
function createHdrJob(self, patientIdentifier) {
    var meta;
    if (self.job) {
        meta = _createMetaForJob(self.job);
    }
    var hdr = jobUtil.createHdrSyncRequest(patientIdentifier, meta);
    return hdr;
}

//--------------------------------------------------------------------------------------------
// This method creates a DOD (Jmeadows) sync job for the patient in the patientIdentifier object.
//
// self: A handle to the this pointer.
// patientIdentifier: This is patientIdentifier containing the PID for VLER.
// returns: The DOD sync jobs that was created.
//--------------------------------------------------------------------------------------------
function createJmeadowsJob(self, patientIdentifier) {
    var meta;
    if (self.job) {
        meta = _createMetaForJob(self.job);
    }
    var jMeadows = jobUtil.createJmeadowsSyncRequest(patientIdentifier, meta);
    return jMeadows;
}

//-----------------------------------------------------------------------------------------------
// This utility function checks if any secondary sites is disabled in config
//
//-----------------------------------------------------------------------------------------------
function isSecondarySiteDisabled(config, siteName) {
    if (! config || ! siteName) {
        return false;
    }
    if (config[siteName] && config[siteName].disabled && config[siteName].disabled === true) {
        return true;
    }
    return false;
}

//-----------------------------------------------------------------------------------------------
// This utility function to create meta data based on job passed in
//
//-----------------------------------------------------------------------------------------------
function _createMetaForJob(job) {
    var meta = {
        jpid: job.jpid,
        priority: job.priority || 1,
        rootJobId: job.rootJobId
    };

    if (job.referenceInfo) {
        meta.referenceInfo = job.referenceInfo;
    }

    return meta;
}

module.exports = SourceSyncJobFactory;
module.exports.isSecondarySiteDisabled = isSecondarySiteDisabled;
module.exports.removeNonPrimaryVistaSites = removeNonPrimaryVistaSites;
module.exports.removeNonVistaHdrSites = removeNonVistaHdrSites;
SourceSyncJobFactory._test = {
    '_steps': {
        '_createJobsToPublish': createJobsToPublish
    },
    '_createJobs': {
        '_createVistaJobs': createVistaJobs,
        '_createVistaHdrJobs': createVistaHdrJobs,
        '_createVlerJob': createVlerJob,
        '_createPgdJob': createPgdJob,
        '_createHdrJob': createHdrJob,
        '_createJmeadowsJob': createJmeadowsJob
    },
};
