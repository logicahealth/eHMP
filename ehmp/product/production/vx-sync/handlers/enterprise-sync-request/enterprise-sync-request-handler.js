'use strict';

var _ = require('underscore');
var async = require('async');

var errorUtil = require(global.VX_UTILS + 'error');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var logUtil = require(global.VX_UTILS + 'log');
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var patIdCompareUtil = require(global.VX_UTILS + 'patient-id-comparator');
var PtDemographicsUtil = require(global.VX_UTILS + 'ptdemographics-utils');
var inspect = require(global.VX_UTILS + 'inspect');

var jobValidator = jobUtil.isValid.bind(null, jobUtil.enterpriseSyncRequestType());

var SourceSyncJobFactory = require('./source-sync-job-factory');

//--------------------------------------------------------------------------------
// This is the main method - it is called to handle a beanstalk job.
//
// log: The logger that should be used.
// config: The config that represents the information in the worker-config.
// environment: Environment settings/handles to shared resources.
// job: The job that is being processed.
// handlerCallback: function(error, jobsToPublish) - The handler to call when the job
//                                              is done.
//--------------------------------------------------------------------------------
function handle(log, config, environment, job, handlerCallback, touchBack) {
    // log = require('bunyan').createLogger({
    //     name: 'ptDemographics-utils',
    //     level: 'debug'
    // });

    if (!_.isFunction(touchBack)) { touchBack = function() {}; }
    if (_.isUndefined(environment.patientIdComparator)) {
        environment.patientIdComparator = patIdCompareUtil.detectAndResync;
    }
    var options = {
        'jobStatusUpdater': environment.jobStatusUpdater,
        'sourceSyncJobFactory': new SourceSyncJobFactory(log, config, job, environment),
        'log': log || logUtil.getAsChild('enterprise-sync-request-handler'),
        'environment': environment,
        'config': config,
        'job': job,
        'ptDemographicsUtil': new PtDemographicsUtil(log, config, environment),
        'handlerCallback': handlerCallback
    };
    options.log.debug('enterprise-sync-request-handler.handle : Entered method. Received request to enterprise sync patient %s; job: %s', options.job.patientIdentifier.value, inspect(options.job));

    // Validate Job
    //-------------
    if (!jobValidator(job)) {
        log.warn('enterprise-sync-request-handler.validateJob : Invalid job received.  job: %s', inspect(job));
        return handlerCallback(errorUtil.createFatal('enterprise-sync-request-handler.validateJob : Invalid format for job', job));
    }

    async.waterfall([
        queryMVI.bind(options),
        function(data, callback) { touchBack(); callback(null, data); },
        validateDemographics.bind(options),
        options.sourceSyncJobFactory.createVerifiedJobs.bind(options.sourceSyncJobFactory),
        createDemographics.bind(options),
        function(data, callback) { touchBack(); callback(null, data); },
        publishJobs.bind(options),
    ], options.handlerCallback);
}

//-----------------------------------------------------------------------------
// Ensures that the patient will have a demographic record stored. This only
// applies if the patient does not have a primary site. If there is no primary
// site, then demographics should have been passed in as part of the job which
// would have been obtained from the MVI.
//-----------------------------------------------------------------------------
var validateDemographics = function(patientIdentifiers, callback) {
    var self = this;
    if(!self.job.demographics) {
        var allSecondary = _.every(patientIdentifiers, function(identifier){
            var isSecondary = idUtil.isSecondarySitePid(identifier, self.config) || idUtil.isIcn(identifier.value);
            // console.log(identifier.value + ' is secondary ' + isSecondary);
            return isSecondary;
        });
        if(allSecondary) {
            return callback(errorUtil.createFatal('Patient has no demographic record and none was provided.'), null);
        }
    }
    return callback(null, patientIdentifiers);
};

//---------------------------------------------------------------------------------
// This method queries the MVI to recieve all of the identifiers that this patient
// is linked to.  It then saves the patient identifiers for this patient and then
// calls the given callback (via saveMviResults()) with the array of
// patientIdentifiers that were  created.
//
// callback: function (error, patientIdentifiers) - This is the async.waterfall call
//           back handler.  The async.waterfall will absorb the error parameter
//           and if it is null, will pass the next parameter as the first
//           parameters to the options.sourceSyncJobFactory.createVerifiedJobs method.
//             error: The error for async.waterfall to trigger it to stop or continue.
//             patientIdentifiers: The array of patientIdentifier objects that are
//                                 associated with this patient.
//---------------------------------------------------------------------------------
var queryMVI = function(callback) {
    var self = this;
    self.log.debug('enterprise-sync-request-handler.queryMVI : Entered method: job: %s', inspect(self.job));

    self.environment.mvi.lookup(self.job.patientIdentifier, function(mviError, mviResponse) {
        self.log.debug('enterprise-sync-request-handler.queryMVI: Entered routine.  error: %j; mviResponse: %j', mviError, mviResponse);

        if (mviError) {
            self.log.error('enterprise-sync-request-handler.queryMVI : got the kind of error that we shouldn\'t get from MVI.  patient: %j error: %j', self.job.patientIdentifier, mviError);
            return callback(errorUtil.createTransient(mviError), mviResponse);
        }

        var jdsPatientIdentifiers = createValidIdentifiers.call(self, mviResponse);

        //**********************************************************************
        // check for association change here, resync if needed.
        ///**********************************************************************
        self.log.debug('enterprise-sync-request-handler.saveMviResults(): Calling patient-id-comparator');
        self.environment.patientIdComparator(self.log, self.environment, self.job, jdsPatientIdentifiers, function(error, result) {
            if (error) {
                self.log.error('enterprise-sync-request-handler.queryMVI(): Error checking if resync required: %s for patient %j.', error, self.job.patientIdentifier);
            } else if (result === 'RESYNCING') {
                self.log.info('enterprise-sync-request-handler.queryMVI(): This patient needs to be Resyncd,  a resync request was publised for %j,', self.job.patientIdentifier);
            } else {
                self.log.debug('enterprise-sync-request-handler.queryMVI(): This patient doe NOT need to be Resyncd id=', self.job.patientIdentifier);
            }

            self.log.debug('enterprise-sync-request-handler.queryMVI(): Saving identifiers to JDS.  jdsPatientIdentifiers: %j', jdsPatientIdentifiers);
            return saveMviResults.call(self, jdsPatientIdentifiers, callback);
        });
    });
};

//--------------------------------------------------------------------------------------------
// This method creates all of the identifiers that we will know this patient by in JDS.
// It should contain only ICN and PIDs.  There will be a PID for each known Vista Site.
// If the patient has an EDIPI, then there will be a pid created for DOD.  If the patient has
// an ICN, then there will be PID created for HDR, VLER, and DAS.
//
// mviResponse: What came back from the call to MVI.
// returns: an array of patientIdentifier objects
//--------------------------------------------------------------------------------------------
var createValidIdentifiers = function(mviResponse) {
    var self = this;
    var patientIdentifiers = [];

    self.log.debug('enterprise-sync-request-handler.createValidIdentifiers: results from MVI: %j', mviResponse);

    if ((!mviResponse) ||
        ((mviResponse) && (!mviResponse.ids))) {
        self.log.warn('enterprise-sync-request-handler.createValidIdentifiers:  No IDs were returned from MVI.');
        return patientIdentifiers;
    }

    // Extract out any PIDs - these represent VistA sites.
    //-----------------------------------------------------
    var pidList = idUtil.extractIdsOfTypes(mviResponse.ids, 'pid');
    var pidListForVistaSites = SourceSyncJobFactory.removeNonPrimaryVistaSites(self, pidList);
    self.log.debug('enterprise-sync-request-handler.createValidIdentifiers: pidListForVistaSites: %j', pidListForVistaSites);
    if (pidListForVistaSites) {
        patientIdentifiers = patientIdentifiers.concat(pidListForVistaSites);
    }

    // If we are configured in HDR Pub/Sub mode - then we need to pull the HDR sites out of the list.
    //-----------------------------------------------------------------------------------------------
    if ((! SourceSyncJobFactory.isSecondarySiteDisabled(self.config, 'hdr')) && (idUtil.isHdrPubSubMode(self.config))) {
        self.log.debug('enterprise-sync-request-handler.createValidIdentifiers: HDR is in PUB/SUB operation mode');
        var pidListForVistaHdrSites = SourceSyncJobFactory.removeNonVistaHdrSites(self, pidList);
        self.log.debug('enterprise-sync-request-handler.createValidIdentifiers: pidListForVistaHdrSites: %j', pidListForVistaHdrSites);
        if (pidListForVistaHdrSites) {
            patientIdentifiers = patientIdentifiers.concat(pidListForVistaHdrSites);
        }
    }

    // Extract the ICN
    //----------------
    var icnList = idUtil.extractIdsOfTypes(mviResponse.ids, 'icn');
    var icn;
    if (icnList) {
        patientIdentifiers = patientIdentifiers.concat(icnList);
    }
    if ((_.isArray(icnList)) &&
        (icnList.length >= 1) &&
        (icnList[0].type === 'icn')) {
        icn = icnList[0].value;
    }

    // Extract  EDIPI
    //---------------
    var edipiList = idUtil.extractIdsOfTypes(mviResponse.ids, 'edipi');
    var edipi;
    if ((_.isArray(edipiList)) &&
        (edipiList.length >= 1) &&
        (edipiList[0].type === 'edipi')) {
        edipi = edipiList[0].value;
    }

    // Extract the VHICID
    //-------------------
    var vhicidList = idUtil.extractIdsOfTypes(mviResponse.ids, 'vhicid');
    var vhicid;
    if ((_.isArray(vhicidList)) &&
        (vhicidList.length >= 1) &&
        (vhicidList[0].type === 'vhicid')) {
        vhicid = vhicidList[0].value;
    }


    // Create the identifiers for the secondary sites
    //-----------------------------------------------
    if (edipi && ! SourceSyncJobFactory.isSecondarySiteDisabled(self.config, 'jmeadows')) {
        patientIdentifiers = patientIdentifiers.concat(idUtil.create('pid', 'DOD;' + edipi));
    }

    if (icn) {
        if ((! SourceSyncJobFactory.isSecondarySiteDisabled(self.config, 'hdr')) && (! idUtil.isHdrPubSubMode(self.config))) {
            patientIdentifiers = patientIdentifiers.concat(idUtil.create('pid', 'HDR;' + icn));
        }
        if (! SourceSyncJobFactory.isSecondarySiteDisabled(self.config, 'vler')) {
            patientIdentifiers = patientIdentifiers.concat(idUtil.create('pid', 'VLER;' + icn));
        }
        // patientIdentifiers = patientIdentifiers.concat(idUtil.create('pid', 'DAS;' + icn));
    }

    // Add in the VHIC ID - It is not a site - but we need to put the identifier into JDS as an associated identifier.
    //-----------------------------------------------------------------------------------------------------------------
    if (vhicid) {
        patientIdentifiers = patientIdentifiers.concat(idUtil.create('pid', 'VHICID;' + vhicid));
    }

    self.log.debug('enterprise-sync-request-handler.createValidIdentifiers: returning patientIdentifiers: %j', patientIdentifiers);

    return patientIdentifiers;
};

//--------------------------------------------------------------------------------------
// This method takes an array of patientIdentifier objects that will be used as official
// JDS identifiers and stores them in JDS.   When it is done, it calls the
// given callback with the array of patientIdentifiers that were  created.
//
// patientIdentifiers: An array of patientIdentifier objects to be stored in JDS
// callback: function (error, patientIdentifiers) - This is the async.waterfall call
//            back handler.  The async.waterfall will absorb the error parameter
//           and if it is null, will pass the next parameter as the first
//           parameters to the options.sourceSyncJobFactory.createVerifiedJobs method.
//             error: The error for async.waterfall to trigger it to stop or continue.
//             patientIdentifiers: The array of patientIdentifier objects that are
//                                 associated with this patient.
//--------------------------------------------------------------------------------------
var saveMviResults = function(patientIdentifiers, callback) {
    var self = this;

    var jdsSave = {
        'patientIdentifiers': _.pluck(patientIdentifiers, 'value'),
        'jpid': self.job.jpid
    };

    self.log.debug('enterprise-sync-request-handler.saveMviResults(): Identifiers to pass to JDS: %j', jdsSave);
    self.environment.jds.storePatientIdentifier(jdsSave, function(error) {
        if (error) {
            self.log.error('enterprise-sync-request-handler.saveMviResults():Error Storing Identifiers %j', error);
            return callback(errorUtil.createTransient(error), patientIdentifiers);
        }

        return callback(null, patientIdentifiers);
    });
};

//--------------------------------------------------------------------------------------
// This method takes an array of sync job objects and makes sure that there demographics
// are stored for each system that will be doing a sync.
//
// jobsToPublish: An array of sync job objects to be published.
// callback: function (error, jobsToPublish) - This is the async.waterfall call
//            back handler.  The async.waterfall will absorb the error parameter
//           and if it is null, will pass the next two parameters to the
//           publishJobs method.
//             error: The error for async.waterfall to trigger it to stop or continue.
//             jobsToPublish: The array of jobs that were published.
//--------------------------------------------------------------------------------------
var createDemographics = function(jobsToPublish, callback) {
    var self = this;
    self.log.debug('enterprise-sync-request-handler.createDemographics(..):  Entered method.  jobsToPublish: %j', jobsToPublish);

    // make sure that there is something to publish.
    //----------------------------------------------
    if ((jobsToPublish) && (jobsToPublish.length > 0)) {
        self.ptDemographicsUtil.createPtDemographics(self.job, jobsToPublish, function(error, filteredJobsToPublish) {
            self.log.debug('enterprise-sync-request-handler.createDemographics(..): Returned from calling createPtDemographics.  error: %s; filteredJobsToPublish: %j', error, filteredJobsToPublish);
            if (error) {
                self.log.error('enterprise-sync-request-handler.createDemographics: Error creating demographics: %s', error);
                return callback(errorUtil.createTransient(error), filteredJobsToPublish);
            }
            else {
                return callback(null, filteredJobsToPublish);
            }
        });
    } else {
        return callback(null, jobsToPublish);
    }
};

//--------------------------------------------------------------------------------------
// This method takes an array of job objects and publishes them.
//
// jobsToPublish: An array of job objects to be published.
// callback: function (error, jobsToPublish) - This is the async.waterfall call
//            back handler.  The async.waterfall will absorb the error parameter
//           and if it is null, will pass the next two parameters to the
//           final callback method.
//             error: The error for async.waterfall to trigger it to stop or continue.
//             jobsToPublish: The array of jobs that were published.
//--------------------------------------------------------------------------------------
var publishJobs = function(jobsToPublish, callback) {
    var self = this;
    self.log.debug('enterprise-sync-request-handler.publishJobs: Entered method.');

    // make sure that there is something to publish.
    //----------------------------------------------
    if ((jobsToPublish) && (jobsToPublish.length > 0)) {
        self.log.debug('enterprise-sync-request-handler.publishJobs: Entered method. %s jobsToPublish: %j', jobsToPublish.length, jobsToPublish);
        self.environment.publisherRouter.publish(jobsToPublish, function(error) {
            if (error) {
                self.log.error('enterprise-sync-request-handler.publishJobs: publisher error: %s', error);
                return callback(errorUtil.createTransient(error));
            }

            self.log.debug('enterprise-sync-request-handler.publishJobs : jobs published, complete status. jobId: %s, jobsToPublish: %j', self.job.jobId, jobsToPublish);
            return callback(null, jobsToPublish);
        });
    } else {
        return callback(null, jobsToPublish);
    }
};

module.exports = handle;
handle._steps = {
    '_mviSteps': {
        '_queryMVI': queryMVI,
        '_saveMviResults': saveMviResults,
        '_createValidIdentifiers': createValidIdentifiers
    },
    '_publishJobs': publishJobs,
    '_createDemographics': createDemographics,
    '_validateDemographics': validateDemographics
};