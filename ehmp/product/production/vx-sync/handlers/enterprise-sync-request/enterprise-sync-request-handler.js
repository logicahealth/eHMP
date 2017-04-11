'use strict';

var _ = require('underscore');
var async = require('async');

var errorUtil = require(global.VX_UTILS + 'error');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var logUtil = require(global.VX_UTILS + 'log');
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var patIdCompareUtil = require(global.VX_UTILS + 'resync/patient-id-comparator');
var jdsIdConflictUtil = require(global.VX_UTILS + 'resync/resync-jds-id-conflicts');
var PtDemographicsUtil = require(global.VX_UTILS + 'ptdemographics-utils');
var inspect = require(global.VX_UTILS + 'inspect');
var moment = require('moment');
var jobValidator = jobUtil.isValid.bind(null, jobUtil.enterpriseSyncRequestType());
var format = require('util').format;

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
        writeSyncMetrics.bind(options),
        publishJobs.bind(options),
    ], function(waterfallError, waterfallResult) {
        if (waterfallError === 'NO_OPDATA') {
            var odsRule = config.rules['operational-data-sync'];
            if (!_.isUndefined(job.odsAttempts) && ++job.odsAttempts > odsRule.odsAttempts) {
                var odsTime = odsRule.odsAttempts * odsRule.odsDelay;
                var odsError = errorUtil.createTransient('enterprise-sync-request-handler : Operational Data failed after '+odsTime);
                options.handlerCallback(odsError);
            } else {
                if (_.isUndefined(job.odsAttempts)) {
                    job.odsAttempts = 1;
                }
                environment.publisherRouter.publish(job, { 'delay': odsRule.odsDelay }, options.handlerCallback);
            }
        } else {
            options.handlerCallback(waterfallError, waterfallResult);
        }
    });
}

var writeSyncMetrics = function(jobsToPublish, callback) {
    var self = this;
    var metricsObj = {
        'patientIdentifier': self.job.patientIdentifier,
        'sites': _.map(jobsToPublish, function(job) {
            return job.patientIdentifier.value.split(';')[0];
        })
    };

    self.environment.metrics.warn('Sending synchronization request to sites', metricsObj);
    callback(null, jobsToPublish);
};

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
        var vhicIdEvent = createVhicIdEvent.call(self, mviResponse);

        self.log.debug('enterprise-sync-request-handler.saveMviResults(): Calling patient-id-comparator to see if resync needed.');
        self.environment.patientIdComparator(self.log, self.environment, self.job, jdsPatientIdentifiers, function(error, result) {
            if (error) {
                self.log.error('enterprise-sync-request-handler.queryMVI(): Error checking if resync required: %s for patient %j.', error, self.job.patientIdentifier);
            } else if (result === 'RESYNCING') {
                self.log.info('enterprise-sync-request-handler.queryMVI(): This patient needs to be resynced, a resync request was published for %j,', self.job.patientIdentifier);
            } else {
                self.log.debug('enterprise-sync-request-handler.queryMVI(): This patient identifier %j does NOT need to be resynced.', self.job.patientIdentifier);
            }

            self.log.debug('enterprise-sync-request-handler.queryMVI(): Saving identifiers to JDS.  jdsPatientIdentifiers: %j', jdsPatientIdentifiers);
            return saveMviResults.call(self, jdsPatientIdentifiers, vhicIdEvent, callback);
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

    // Don't add in the VHIC ID; it will be stored in a separate event
    //-----------------------------------------------------------------------------------------------------------------
    // if (vhicid) {
    //     patientIdentifiers = patientIdentifiers.concat(idUtil.create('pid', 'VHICID;' + vhicid));
    // }

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
var saveMviResults = function(patientIdentifiers, vhicIdEvent, callback) {
    var self = this;

    var jdsSave = {
        'patientIdentifiers': _.pluck(patientIdentifiers, 'value'),
        'jpid': self.job.jpid
    };

    self.log.debug('enterprise-sync-request-handler.saveMviResults(): Identifiers to pass to JDS: %j', jdsSave);
    self.environment.jds.storePatientIdentifier(jdsSave, function(error, response, results) {
        if (error) {
            self.log.error('enterprise-sync-request-handler.saveMviResults():Error Storing Identifiers %j', error);
            return callback(errorUtil.createTransient(error), patientIdentifiers);
        }

        if (response.statusCode === 400) {
            self.log.warn('enterprise-sync-request-handler.saveMviResults(): Checking for Id conflict in JDS for %j.', results);
            jdsIdConflictUtil.resyncJdsIdConflicts(self.log, self.config, self.environment, self.job, results, function(error, results) {
                if (error) {
                    self.log.error('enterprise-sync-request-handler.saveMviResults(): Error checking if resync required: %s for patient %j.', error, self.job.patientIdentifier);
                    return callback(errorUtil.createTransient(error), patientIdentifiers);
                }
                if (results === 'RESYNCING') {
                    self.log.info('enterprise-sync-request-handler.saveMviResults(): Patient identifier conflicts detected, resync request(s) were published related to patient identifier %j,', self.job.patientIdentifier);
                } else {
                    self.log.debug('enterprise-sync-request-handler.saveMviResults(): Patient identifier conflicts were NOT detected. This patient identifier %j does NOT need to be resynced.', self.job.patientIdentifier);
                }
                return storeVhicIdEvent.call(self, vhicIdEvent, patientIdentifiers, callback);
            });
        } else {
            return storeVhicIdEvent.call(self, vhicIdEvent, patientIdentifiers, callback);
        }
    });
};

//--------------------------------------------------------------------------------------------
// This method creates an instance of the vhic-id event containing all of the VHIC IDs that
// were contained in the MVI Reponse {ids: []}
//
// mviResponse: What came back from the call to MVI.
// returns: An instance of the vhid-id event containing the VHIC IDs that were in the
//          MVI response.  If there were no VHIC IDs then this will return null.
//--------------------------------------------------------------------------------------------
var createVhicIdEvent = function(mviResponse) {
    var self = this;
    if(!mviResponse || !mviResponse.ids || _.isEmpty(mviResponse.ids)){
        self.log.error('enterprise-sync-request-handler.createVhicIdEvent: mviResponse missing: %s', mviResponse);
        return null;
    }

    var jpid = self.job.jpid;
    var vhicIds = [];

    _.each(mviResponse.ids, function(patientIdentifier){
        if(patientIdentifier.type === 'vhicid'){
            var vhicId = {
                'vhicId' : patientIdentifier.value
            };
            if(patientIdentifier.active){
                vhicId.active = patientIdentifier.active;
            }
            vhicIds.push(vhicId);
        }
    });

    var currentTime = moment().format('YYYYMMDDHHmmss');

    var vhicIdEvent = {
        'lastUpdateTime': currentTime,
        'localId': jpid,
        'pid': 'JPID;' + jpid,
        'stampTime': currentTime,
        'uid': 'urn:va:vhic-id:JPID:'+jpid+':'+jpid,
        'vhicIds': vhicIds
    };
    return vhicIdEvent;
};


//--------------------------------------------------------------------------------------
// This method handles storing the vhicIdEvent to JDS. When it is done, it calls the
// given callback with the array of patientIdentifiers that were stored in
// the previous step, saveMviResults.
// vhicIdEvent: The event containing all of the VHIC IDs that needs to be stored. If null, the
//              storage step will be skipped.
// patientIdentifiers:  An array of patientIdentifier objects to be returned via the callback
// callback: function (error, patientIdentifiers) - This is the async.waterfall call
//            back handler.  The async.waterfall will absorb the error parameter
//           and if it is null, will pass the next parameter as the first
//           parameters to the options.sourceSyncJobFactory.createVerifiedJobs method.
//             error: The error for async.waterfall to trigger it to stop or continue.
//             patientIdentifiers: The array of patientIdentifier objects that are
//                                 associated with this patient.
//--------------------------------------------------------------------------------------
var storeVhicIdEvent = function(vhicIdEvent, patientIdentifiers, callback){
    var self = this;
    if(!vhicIdEvent){
        self.log.debug('enterprise-sync-request-handler.storeVhicIdEvent(): No vhicIdEvent passed in; Skipping this step.');
        return callback(null, patientIdentifiers);
    }

    self.log.debug('enterprise-sync-request-handler.storeVhicIdEvent(): Storing vhicIdEvent to JDS');
    self.environment.jds.storePatientData(vhicIdEvent, function(error, response){
        var errorMessage;
        if(error){
            errorMessage = format('enterprise-sync-request-handle.storeVhicIdEvent(): Error storing vhicIdEvent to JDS. error: %s, vhicIdEvent %s', inspect(error), inspect(vhicIdEvent));
            self.log.error(errorMessage);
            return callback(errorUtil.createTransient(errorMessage), patientIdentifiers);
        } else if (!response || response.statusCode !== 201){
            var statusCode = (response)? response.statusCode: null;
            errorMessage = format('enterprise-sync-request-handle.storeVhicIdEvent(): Unexpected response when storing vhicIdEvent to JDS: response.statusCode: %s, vhicIdEvent %s', inspect(statusCode), inspect(vhicIdEvent));
            self.log.error(errorMessage);
            return callback(errorUtil.createTransient(errorMessage), patientIdentifiers);
        }

        self.log.debug('enterprise-sync-request-handler.storeVhicIdEvent(): vhicIdEvent succesfully stored to JDS');
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
        '_createValidIdentifiers': createValidIdentifiers,
        '_createVhicIdEvent': createVhicIdEvent,
        '_storeVhicIdEvent': storeVhicIdEvent
    },
    '_publishJobs': publishJobs,
    '_createDemographics': createDemographics,
    '_validateDemographics': validateDemographics
};