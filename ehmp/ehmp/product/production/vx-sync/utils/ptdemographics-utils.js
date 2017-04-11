'use strict';

//-------------------------------------------------------------------------
// This class contains utility functions for storing patient demographic
// data.
//
// @Author: Les Westberg
//-------------------------------------------------------------------------
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var _ = require('underscore');
var timeUtil = require(global.VX_UTILS + 'time-utils');
var async = require('async');
var mapUtil = require(global.VX_UTILS + 'map-utils');
var xformerPtRecEnrichment = require(global.VX_HANDLERS + 'record-enrichment-request/record-enrichment-patient-xformer');
var inspect = require(global.VX_UTILS + 'inspect');
var format = require('util').format;
var metastampUtil = require(global.VX_UTILS + 'metastamp-utils');

/**
 * Remember, Remember the Fifth of November
 * The Gunpowder Treason and Plot.
 * I see no reason The Gunpowder Treason
 * Should ever be after a real demographics stampTime.
 * (DE4136)
 */
var BASIS_STAMPTIME = '16051105010000';

//-------------------------------------------------------------------------
// Constructor for this class.
//
// log: The logger to be used.
// config: Standard config information
// environment: Standard environment information.
//-------------------------------------------------------------------------
function PtDemographicsUtil(log, config, environment) {
	if (!(this instanceof PtDemographicsUtil)) {
		return new PtDemographicsUtil(log, config, environment);
	}
	this.log = log;
	// this.log = require('bunyan').createLogger({
	// 	name: 'ptDemographics-utils',
	// 	level: 'debug'
	// });

	this.config = config;
	this.environment = environment;
}

//------------------------------------------------------------------------------------------
// This method creates the demographics needed to support the subscription jobs
// that are about to be published.   This is done by first making sure that
// demographics exist for the primary site that triggered this sync.  Then it
// makes sure they exist for each of the sites that will be subscribed based on the
// jobsToPublish list.
//
// originalSyncJob: This is the job that started the sync process.
// syncJobsToPublish: This is a list of sync jobs that are about to be publised (triggered)
// callback: The call back handler to call when the demographics are up-to-date.
//           function(error, syncJobsToPublish)
//------------------------------------------------------------------------------------------
PtDemographicsUtil.prototype.createPtDemographics = function(originalSyncJob, syncJobsToPublish, callback) {
	var self = this;
	self.log.debug('ptdemographics-utils.createPtDemographics: Entered method: originalSyncJob: %j; syncJobsToPublish: %j', originalSyncJob, syncJobsToPublish);

	// Make sure we have the patient identifier in the original sync job
	//-------------------------------------------------------------------
	if ((!originalSyncJob) || (!originalSyncJob.patientIdentifier)) {
		self.log.error('ptdemographics-utils.createPtDemographics:  originalSyncJob did not contain a valid patient identifier.  originalSyncJob: %j', originalSyncJob);
		return setTimeout(callback, 0, 'OriginalSyncJob did not contain a patientIdentifier', syncJobsToPublish);
	}

	var patientIdentifier = originalSyncJob.patientIdentifier;
	self.log.debug('ptdemographics-utils.createPtDemographics: patientIdentifier: %j', patientIdentifier);

	// Make sure the identifier is one we can use...  Right now it needs to be a PID for a primary site
	// or an ICN that we can use to get a PID for a primary site.
	//--------------------------------------------------------------------------------------------------
	if ((patientIdentifier.type !== 'icn') && (patientIdentifier.type !== 'pid')) {
		self.log.error('ptdemographics-utils.createPtDemographics:  patientIdentifier must be an icn or a pid.  patientIdentifier: %j', patientIdentifier);
		return setTimeout(callback, 0, 'patientIdentifier must be an icn or a pid.', syncJobsToPublish);
	}

	if ((!self.config) || (!self.config.vistaSites)) {
		self.log.error('ptdemographics-utils.createPtDemographics:  No primary vista sites are configured on the system.  config: %j', self.config);
		return setTimeout(callback, 0, 'No primary vista sites are configured on the system.', syncJobsToPublish);
	}

	if ((patientIdentifier.type === 'pid') && (! idUtil.isVistaDirect(patientIdentifier.value, self.config)) && (!idUtil.isDod(patientIdentifier.value))) {
		self.log.error('ptdemographics-utils.createPtDemographics:  The given patientIdentifier pid was not for a primary vista site or DoD.  patientIdentifier: %j', patientIdentifier);
		return setTimeout(callback, 0, 'The given patientIdentifier pid was not for a primary vista site or DoD.', syncJobsToPublish);
	}

	self.log.debug('ptdemographics-utils.createPtDemographics: after primaryVistaSites check - we passed checks for this patient identifier: %j', patientIdentifier);

	// If this is an ICN or DOD only sync.
	//------------------------------------
	if ((patientIdentifier.type === 'icn') || (idUtil.isDod(patientIdentifier.value))) {
		self.retrievePrimaryPidFromSyncJobs(syncJobsToPublish, function(error, pid) {
			self.log.debug('ptdemographics-utils.createPtDemographics:  Returned from calling retrievePrimaryPidFromSyncJobs for icn: %s; error: %s; pid: %j', patientIdentifier.value, error, pid);
			if (error) {
				self.log.error('ptdemographics-utils.createPtDemographics:  Error returned from calling retrievePrimaryPidFromSyncJobs for icn: %s; error: %s; pid: %j', patientIdentifier.value, error, pid);
				return callback(error, syncJobsToPublish);
			}

			if (!pid) {
                if(!originalSyncJob.demographics) {
				    self.log.error('ptdemographics-utils.createPtDemographics:  There was no pid for a primary site.  No demographics will be created. icn: %s; error: %s; pid: %j',
					   patientIdentifier.value, error, pid);
				    return callback(null, syncJobsToPublish);
                } else {
                    self.createPtDemographicsForJobsUsingPid(pid, syncJobsToPublish, originalSyncJob.demographics, function(error, filteredSyncJobsToPublish) {
                    	if (error) {
	                        self.log.error('ptdemographics-utils.createPtDemographics:  Returned from calling createPtDemographicsByPid for pid: %s; error: %s; filteredSyncJobsToPublish: %j',
	                            pid, error, filteredSyncJobsToPublish);
	                    } else {
	                        self.log.debug('ptdemographics-utils.createPtDemographics:  Returned from calling createPtDemographicsByPid for pid: %s; error: %s; filteredSyncJobsToPublish: %j',
	                            pid, error, filteredSyncJobsToPublish);
	                    }
                        return callback(error, filteredSyncJobsToPublish);
                    });
                }
			} else {
    			self.createPtDemographicsForJobsUsingPid(pid, syncJobsToPublish, null, function(error, filteredSyncJobsToPublish) {
    				if (error) {
	    				self.log.error('ptdemographics-utils.createPtDemographics:  Returned from calling createPtDemographicsByPid for pid: %s; error: %s; filteredSyncJobsToPublish: %j',
	    					pid, error, filteredSyncJobsToPublish);
    				} else {
	    				self.log.debug('ptdemographics-utils.createPtDemographics:  Returned from calling createPtDemographicsByPid for pid: %s; error: %s; filteredSyncJobsToPublish: %j',
	    					pid, error, filteredSyncJobsToPublish);
	    			}
    				return callback(error, filteredSyncJobsToPublish);
    			});
            }
		});
	} else if (patientIdentifier.type === 'pid') {
		self.log.debug('ptdemographics-utils.createPtDemographics: Calling createPtDemographicsByPid: pid: %s', patientIdentifier.value);
		self.createPtDemographicsForJobsUsingPid(patientIdentifier.value, syncJobsToPublish, null, function(error, filteredSyncJobsToPublish) {
			self.log.debug('ptdemographics-utils.createPtDemographics:  Returned from calling createPtDemographicsByPid for pid: %s; error: %s; filteredSyncJobsToPublish: %j',
				patientIdentifier.value, error, filteredSyncJobsToPublish);
			return callback(error, filteredSyncJobsToPublish);
		});
	}
};

//----------------------------------------------------------------------------------------
// This method looks at the given syncJobs to look for any site that is a primary site
// which would have demographics  And uses that to retrieve demographics.  It does not matter
// which one we use.
//
// callback: The call back handler to call when this is done.   It has the following
//           signature:
//           function(error, pid) where:
//              error:  Is the error that occurred or null
//              pid: Is a pid for one of the primary sites for this patient.
//----------------------------------------------------------------------------------------
PtDemographicsUtil.prototype.retrievePrimaryPidFromSyncJobs = function(syncJobsToPublish, callback) {
	var self = this;
	self.log.debug('ptdemographics-utils.retrievePrimaryPidFromSyncJobs: Entered method. syncJobsToPublish: %j', syncJobsToPublish);

    var identifiers = _.pluck(syncJobsToPublish, 'patientIdentifier');
    var primaryVistaPids = _.filter(identifiers, function(id) {
        return idUtil.isVistaDirect(id.value, self.config);
    });

    if ((!primaryVistaPids) || (primaryVistaPids.length <= 0)) {
        self.log.debug('ptdemographics-utils.retrievePrimaryPidFromSyncJobs:  Called ptdemographics-utils.retrievePrimaryPidFromSyncJobs - no results found.');
        return callback(null, null);
    } else {
        return callback(null, primaryVistaPids[0].value);
    }
};

//-------------------------------------------------------------------------------------------------
// This method retrieves the demographics for this pid and then attempts to create the demographics
// for each site represented in the syncJobsToPublish array.
//
// pid: The pid for a patient for one of the primary sites.
// syncJobsToPublish: The list of jobs to be published.
// defaultDemographics: a default demographics to use if none can be found
// callback: The handler to call when after the demographics have all be created.  The signature is:
//			function (error, syncJobsToPublish) where
//				error: Is the error if one occurs, otherwise it is null.
//              syncJobsToPublish: This is the list of syncJobsToPublish.  Any site that demographics
//                                 could not be stored - will be removed from the array - so that
//                                 we do not store data on a patient that has no demographics data.
//--------------------------------------------------------------------------------------------------
PtDemographicsUtil.prototype.createPtDemographicsForJobsUsingPid = function(pid, syncJobsToPublish, defaultDemographics, callback) {
	var self = this;
	self.log.debug('ptdemographics-utils.createPtDemographicsForJobsUsingPid: Entered method: pid: %s; syncJobsToPublish: %j', pid, syncJobsToPublish);

	self.retrieveOrCreateDemographicsForPrimaryPid(pid, defaultDemographics, function(error, ptDemographics) {
		self.log.debug('ptdemographics-utils.createPtDemographicsForJobsUsingPid: Returned from retrieveDemographicsByPid: pid: %s; error: %s, ptDemographics: %j', pid, error, ptDemographics);

		if (!ptDemographics && !defaultDemographics) {
			self.log.error('ptdemographics-utils.createPtDemographicsForJobsUsingPid: No demographics were returned from createPtDemographicsForJobsUsingPid for pid: %s.  Cannot create job demographics either.', pid);
            if (error) {
                return callback(error);
            } else {
    			return callback('FailedToCreateDemographicsForPrimaryPid');
            }
		}

		var tasksToCreateDemographics = mapUtil.filteredMap(syncJobsToPublish, function(syncJobToPublish) {
			var demographicsCreatorTask;
			// Primary Site...
			//----------------
			if ((syncJobToPublish) && (syncJobToPublish.patientIdentifier) && (idUtil.isVistaDirect(syncJobToPublish.patientIdentifier.value, self.config))) {
				self.log.debug('ptdemographics-utils.createPtDemographicsForJobsUsingPid: Creating demographics for primary site: pid: %s', syncJobToPublish.patientIdentifier.value);
				demographicsCreatorTask = self.retrieveOrCreateDemographicsForPrimaryPid.bind(self, syncJobToPublish.patientIdentifier.value, null);
				return _demographicsCreationTaskWrapper.bind(self, syncJobToPublish.patientIdentifier.value, demographicsCreatorTask);
			}
			// VistaHdr site... (means we are in HDR PUB/SUB mode.)
			//------------------------------------------------------
			else if ((syncJobToPublish) && (syncJobToPublish.patientIdentifier) && (idUtil.isVistaHdr(syncJobToPublish.patientIdentifier.value, self.config))) {
				self.log.debug('ptdemographics-utils.createPtDemographicsForJobsUsingPid: Creating demographics for primary site: pid: %s', syncJobToPublish.patientIdentifier.value);
				demographicsCreatorTask = self.retrieveOrCreateDemographicsForSecondaryOrVistaHdrPid.bind(self, syncJobToPublish.patientIdentifier.value, ptDemographics);
				return _demographicsCreationTaskWrapper.bind(self, syncJobToPublish.patientIdentifier.value, demographicsCreatorTask);
			}
			// If secondary site...  (i.e. DOD, VLER, HDR [for REQ/RES] mode.)
			//-----------------------------------------------------------------
			else if ((syncJobToPublish) && (syncJobToPublish.patientIdentifier) && (idUtil.isSecondarySite(syncJobToPublish.patientIdentifier.value, self.config))) {
				self.log.debug('ptdemographics-utils.createPtDemographicsForJobsUsingPid: Creating demographics for secondary site: pid: %s', syncJobToPublish.patientIdentifier.value);
				demographicsCreatorTask = self.retrieveOrCreateDemographicsForSecondaryOrVistaHdrPid.bind(self, syncJobToPublish.patientIdentifier.value, ptDemographics);
				return _demographicsCreationTaskWrapper.bind(self, syncJobToPublish.patientIdentifier.value, demographicsCreatorTask);
			}
			else {
				var pidOutput = '';
				if ((_.isObject(syncJobToPublish)) && (_.isObject(syncJobToPublish.patientIdentifier))) {
					pidOutput = syncJobToPublish.patientIdentifier.value;
				}
				self.log.error('ptdemographics-utils.createPtDemographicsForJobsUsingPid: Not primary or secondary site - no demographics being created: pid: %s', pidOutput);
				return null;
			}
		}, [undefined, null]);

		self.log.debug('ptdemographics-utils.createPtDemographicsForJobsUsingPid: Tasks.length: %i; Tasks: %j', tasksToCreateDemographics.length, tasksToCreateDemographics);

		if (!_.isEmpty(tasksToCreateDemographics)) {
			async.series(tasksToCreateDemographics, function(error, ptDemographicsList) {
//			async.parallelLimit(tasksToCreateDemographics, 10, function(error, ptDemographicsList) {
				self.log.debug('ptdemographics-utils.createPtDemographicsForJobsUsingPid: Returned from running all tasks to verify and possibly ' +
					'create demographics for all sites being subscribed. pid: %s; error: %s, ptDemographicsList: %j', pid, error, ptDemographicsList);

				// Because of the way we created this - if we get an error - it will be because async had a problem - not because of our code... So this is a case that we stop everything.
				//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------
				if (error) {
					self.log.error('ptdemographics-utils.createPtDemographicsForJobsUsingPid: Returned from running all tasks.  ' +
						'A fatal error occurred - this patient will not be synchronized.  pid: %s; error: %s', pid, error);
					return callback(error, []);
				}

				if (_.isEmpty(ptDemographicsList)) {
					self.log.info('ptdemographics-utils.createPtDemographicsForJobsUsingPid: Returned from running all tasks.  There are no sync jobs left to publish.  pid: %s;', pid, error, ptDemographicsList);
					return callback(null, []);
				}

				// Need to figure out if we have any that errored out.
				//----------------------------------------------------
				var errorPids = [];
				if (!_.isEmpty(ptDemographicsList)) {
					errorPids = _.pluck(ptDemographicsList, 'errorPid');
				}
				var filteredSyncJobsToPublish = syncJobsToPublish;

				if (!_.isEmpty(errorPids)) {
					filteredSyncJobsToPublish = _.filter(syncJobsToPublish, function(syncJobToPublish) {
						if ((syncJobToPublish) && (syncJobToPublish.patientIdentifier) && (syncJobToPublish.patientIdentifier.value) &&
							(_.contains(errorPids, syncJobToPublish.patientIdentifier.value))) {
							var errorMessage = '';
							var errorObject = _.findWhere(syncJobsToPublish, {
								patientIdentifier: {
									type: 'pid',
									value: syncJobToPublish.patientIdentifier.value
								}
							});
							if (errorObject) {
								errorMessage = errorObject.errorMessage;
							}
							self.log.error('ptdemographics-utils.createPtDemographicsForJobsUsingPid: Failed to create demographics for pid: %s.  ' +
								'Sync for this site will NOT be done.  Error: %s', ptDemographics.pid, errorMessage);
							return false;
						}
						else if ((syncJobToPublish) && (syncJobToPublish.patientIdentifier) && (syncJobToPublish.patientIdentifier.value)) {
							return true;
						} else {
							self.log.error('ptdemographics-utils.createPtDemographicsForJobsUsingPid: job did not contain a patientIdentifier. job: %j', syncJobToPublish);
							return false;
						}
					});
				}

				self.log.debug('ptdemographics-utils.createPtDemographicsForJobsUsingPid: Completed demographics creation.  ' +
					'pid: %s; filteredSyncJobsToPublish: %j', pid, filteredSyncJobsToPublish);
				return callback(null, filteredSyncJobsToPublish);
			});
		} else {
			self.log.debug('ptdemographics-utils.createPtDemographicsForJobsUsingPid: Completed demographics creation. pid: %s; filteredSyncJobsToPublish: []]', pid);
			return callback(null, []);
		}
	});
};

//-----------------------------------------------------------------------------------------------
// This method attempts to retrieve the demographics for the given primary site pid.  If it
// does not exist, it will retrieve the demographics from the site and then store it in JDS.  If
// it exists, it will retrieve the one it received.
//
// pid: The pid for the patient.
// demographics: fallback demographic record
// callback: The handler to call when this method is done.  The signature is:
//           function (error, ptDemographics) where:
//               error: The error if one occurs.
//               ptDemographics: The patient demographics for this patient.
//------------------------------------------------------------------------------------------------
PtDemographicsUtil.prototype.retrieveOrCreateDemographicsForPrimaryPid = function(pid, demographics, callback) {
	var self = this;
	self.log.debug('ptdemographics-utils.retrieveOrCreateDemographicsForPrimaryPid: Entered method: pid: %s', pid);

    if (!pid) {
        return callback(null, demographics);
    }

	self.environment.jds.getPtDemographicsByPid(pid, function(error, response, ptDemographics) {
		self.log.debug('ptdemographics-utils.retrieveOrCreateDemographicsForPrimaryPid: Returned from call to jds.getPtDemgraphicsByPid: ' +
			'pid: %s, error: %s; response: %j; ptDemographics: %j', pid, error, response, ptDemographics);

		if ((ptDemographics) && (ptDemographics.data) && (!_.isEmpty(ptDemographics.data.items))) {
			return callback(null, ptDemographics.data.items[0]);		// Should only be one result by pid.
		} else if(demographics){
            return callback(null, demographics);
        } else {
			self.retrieveDemographicsFromVistAandStoreInJds(pid, function(error, ptDemographics) {
				self.log.debug('ptdemographics-utils.retrieveOrCreateDemographicsForPrimaryPid: Returned from call to retrieveDemographicsFromVistAandStoreInJds: ' +
					'pid: %s, error: %s; ptDemographics: %j', pid, error, ptDemographics);
				return callback(error, ptDemographics);
			});
		}
	});
};

//-----------------------------------------------------------------------------------------------
// This method retrieves the demographics from VistA using an RPC call and stores them into JDS.
//
// pid: The pid or icn for the patient.
// callback: The handler to call when this method is done.  The signature is:
//           function (error, ptDemographics) where:
//               error: The error if one occurs.
//               ptDemographics: The patient demographics for this patient.
//-----------------------------------------------------------------------------------------------
PtDemographicsUtil.prototype.retrieveDemographicsFromVistAandStoreInJds = function(pid, callback) {
	var self = this;
	self.log.debug('ptdemographics-utils.retrieveDemographicsFromVistAandStoreInJds: Entered method: id: %s', pid);

	if (!pid) {
		self.log.error('ptdemographics-utils.retrieveDemographicsFromVistAandStoreInJds: No id was passed in.  We should not see this error - id should have been checked earlier.');
		return callback('FailedNoPid', null);
	}

	var vistaId = idUtil.extractSiteFromPid(pid);
	var dfn = idUtil.extractDfnFromPid(pid);

	if ((!vistaId) || (!dfn)) {
		self.log.error('ptdemographics-utils.retrieveDemographicsFromVistAandStoreInJds: Pid was not a valid id: %s', pid);
		return callback('FailedPidInvalid', null);
	}

	self.environment.vistaClient.getDemographics(vistaId, dfn, function(error, ptDemographics) {
		self.log.debug('ptdemographics-utils.retrieveDemographicsFromVistAandStoreInJds: Returned from call to vista-subscribe.getDemographics.  id: %s; error: %s; ptDemographics: %j', pid, error, ptDemographics);

		if (error) {
			self.log.error('ptdemographics-utils.retrieveDemographicsFromVistAandStoreInJds: VistA failed to return demographics data.  id: %s; error: %s', pid, error);
			return callback(error, null);
		}

		if (!ptDemographics) {
			self.log.warn('ptdemographics-utils.retrieveDemographicsFromVistAandStoreInJds: VistA failed to return demographics data but there was no error.  id: %s;', pid);
			return callback(null, null);
		}

		// All data events even demographics must contain a stampTime to be stored.
		//-------------------------------------------------------------------------
		if (!ptDemographics.stampTime) {
			ptDemographics.stampTime = timeUtil.createStampTime();
		}

		// Add in record enrichment information into demographic before we store it.
		//--------------------------------------------------------------------------
		xformerPtRecEnrichment.transformAndEnrichRecordAPI(ptDemographics);

		// Store the demographics data
		//-----------------------------

        // Store the meta-stamp first then the data if successful
        //-------------------------------------------------------
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // WARNING: This process is dependent on this being handled as a
        //          Synchronous call to JDS and not in a tube/handler.
        //          If this is ever moved to a tube/handler a race condition
        //          will exist that may overwrite the demographic object written
        //          here
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        // metastampUtil requires the data to be in the format as returned by the poller
        var record = {
            'data': {
                'items': [ptDemographics]
            }
        };

        var metastamp = metastampUtil.metastampDomain(record,ptDemographics.stampTime,'');
        if(metastamp.error){
            self.log.error('ptdemographics-utils.retrieveDemographicsFromVistAandStoreInJds: Got error when creating metastamp for patient demographics for pid: %s, demographics record: %s, error: %s', pid, inspect(ptDemographics), metastamp.error);
            return callback('FailedMetastampError', null);
        }

        var patientIdentifier = idUtil.create('pid', pid);

        self.environment.jds.saveSyncStatus(metastamp, patientIdentifier, function(error,response) {
            self.log.debug('ptdemographics-utils.retrieveDemographicsFromVistAandStoreInJds: jds.storeSyncStatus.  id: %s; error: %s; response %j', pid, error,response);

            if (error) {
                self.log.error('ptdemographics-utils.retrieveDemographicsFromVistAandStoreInJds:  Received error while calling jds.storeSyncStatus id: %s.  Error: %s;', pid, error);
                return callback('FailedJdsError', null);
            }

            if (!response) {
                self.log.error('ptdemographics-utils.retrieveDemographicsFromVistAandStoreInJds:  Failed to call jds.saveSyncStatus. id: %s - no response returned.', pid);
                return callback('FailedJdsNoResponse', null);
            }

            if (response.statusCode !== 200) {
                var errors;
                if(response.body && response.body.error && response.body.error.errors){
                    errors = response.body.error.errors;
                }
                self.log.error('ptdemographics-utils.retrieveDemographicsFromVistAandStoreInJds:  Failed to call jds.saveSyncStatus id: %s - incorrect status code returned. Response.statusCode: %s Errors: %s', pid, response.statusCode, inspect(errors));
                return callback('FailedJdsWrongStatusCode', null);
            }
            self.log.debug('ptdemographics-utils.retrieveDemographicsFromVistAandStoreInJds: Saved Metastamp.  response: %j', response);

            // now store the actual demographic object in JDS
    		self.environment.jds.storePatientData(ptDemographics, function(error, response) {
    			self.log.debug('ptdemographics-utils.retrieveDemographicsFromVistAandStoreInJds: jds.storePatientData.  id: %s; error: %s; response: %j', pid, error, response);

    			if (error) {
    				self.log.error('ptdemographics-utils.retrieveDemographicsFromVistAandStoreInJds:  Received error while calling jds.storePatientData id: %s.  Error: %s;', pid, error);
    				return callback('FailedJdsError', null);
    			}

    			if (!response) {
    				self.log.error('ptdemographics-utils.retrieveDemographicsFromVistAandStoreInJds:  Failed to call jds.storePatientData. id: %s - no response returned.', pid);
    				return callback('FailedJdsNoResponse', null);
    			}

    			if (response.statusCode !== 201) {
                    var errors;
                    if(response.body && response.body.error && response.body.error.errors){
                        errors = response.body.error.errors;
                    }
                    if (response.statusCode === 400) {
                        self.log.error('ptDemographics-utils.retrieveDemographicsFromVistAandStoreInJds: JPID Collision Detected. Errors: %s', inspect(errors));
                        return callback('FailedJdsJpidCollision', null);
                    } else {
        				self.log.error('ptdemographics-utils.retrieveDemographicsFromVistAandStoreInJds:  Failed to call jds.storePatientData id: %s - incorrect status code returned. Response.statusCode: %s Errors: %s', pid, response.statusCode, inspect(errors));
        				return callback('FailedJdsWrongStatusCode', null);
                    }
    			}

			return callback(null, ptDemographics);
    		});
        });
	});
};

//-------------------------------------------------------------------------------------------------
// This method attempts to retrieve the demographics for the given secondary or VistaHdr site pid.
// If it does not exist, it will create the demopgraphics using the given demographics as the basis
// of the content.
//
// pid: The pid for the patient.
// ptDemogrpahicsBasis: The patient demographics to be used as the basis of a new demographics
//                      record for the patient - if one did not exist already.
// callback: The handler to call when this method is done.  The signature is:
//           function (error, ptDemographics) where:
//               error: The error if one occurs.
//               ptDemographics: The patient demographics for this patient.
//--------------------------------------------------------------------------------------------------
PtDemographicsUtil.prototype.retrieveOrCreateDemographicsForSecondaryOrVistaHdrPid = function(pid, ptDemographicsBasis, callback) {
	var self = this;
	self.log.debug('ptdemographics-utils.retrieveOrCreateDemographicsForSecondaryOrVistaHdrPid: Entered method: pid: %s; ptDemographicsBasis: %j', pid, ptDemographicsBasis);

	// Make sure that this is a secondary site PID or a VistaHDR pid
	//--------------------------------------------------------------
	if ((!idUtil.isSecondarySite(pid, self.config)) && (!idUtil.isVistaHdr(pid, self.config))) {
		self.log.error('ptdemographics-utils.retrieveOrCreateDemographicsForSecondaryOrVistaHdrPid: Pid was not for a valid secondary or VistaHDR site.  pid: %s', pid);
		return callback('FailedPidNotSecondarySite', null);
	}

	self.environment.jds.getPtDemographicsByPid(pid, function(error, response, ptDemographics) {
		self.log.debug('ptdemographics-utils.retrieveOrCreateDemographicsForSecondaryOrVistaHdrPid: Returned from call to jds.getPtDemgraphicsByPid: pid: %s, error: %s; response: %j; ptDemographics: %j', pid, error, response, ptDemographics);

		if ((ptDemographics) && (ptDemographics.data) && (!_.isEmpty(ptDemographics.data.items))) {
			return callback(null, ptDemographics.data.items[0]);		// Should only be one result by pid.
		} else {
			self.storeDemographicsInJdsUsingBasisDemographics(pid, ptDemographicsBasis, function(error, ptDemographics) {
				var logMessage = format('ptdemographics-utils.retrieveOrCreateDemographicsForSecondaryOrVistaHdrPid: Returned from call to storeDemographicsInJdsUsingBasisDemographics: pid: %s, error: %s; ptDemographics: %j', pid, error, ptDemographics);
                if(error){
                  self.log.error(logMessage);
                } else {
                  self.log.debug(logMessage);
                }
				return callback(error, ptDemographics);
			});
		}
	});
};

//-----------------------------------------------------------------------------------------------
// This method stores the demographics into JDS for the given secondary of VistaHdr site pid and
// uses the given demographics as the basis of the new one.
//
// pid: The pid for the patient.
// ptDemogrpahicsBasis: The patient demographics to be used as the basis of a new demographics
//                      record for the patient - if one did not exist already.
// callback: The handler to call when this method is done.  The signature is:
//           function (error, ptDemographics) where:
//               error: The error if one occurs.
//               ptDemographics: The patient demographics for this patient.
//-----------------------------------------------------------------------------------------------
PtDemographicsUtil.prototype.storeDemographicsInJdsUsingBasisDemographics = function(pid, ptDemographicsBasis, callback) {
	var self = this;
	self.log.debug('ptdemographics-utils.storeDemographicsInJdsUsingBasisDemographics: Entered method: pid: %s; ptDemographicsBasis: %j', pid, ptDemographicsBasis);

	if (!pid) {
		self.log.error('ptdemographics-utils.storeDemographicsInJdsUsingBasisDemographics: No pid was passed in.  We should not see this error - pid should have been checked earlier.');
		return callback('FailedNoPid', null);
	}

	if (!ptDemographicsBasis) {
		self.log.error('ptdemographics-utils.storeDemographicsInJdsUsingBasisDemographics: No basis demographics were passed in.  We should not see this error - this should have been checked earlier.');
		return callback('FailedNoPtDemographicsBasis', null);
	}

	// Make sure that this is a secondary site PID or a VistaHDR pid
	//--------------------------------------------------------------
	if ((!idUtil.isSecondarySite(pid, self.config)) && (!idUtil.isVistaHdr(pid, self.config))) {
		self.log.error('ptdemographics-utils.storeDemographicsInJdsUsingBasisDemographics: Pid was not for a valid secondary or VistaHdr site.  pid: %s', pid);
		return callback('FailedPidNotSecondarySite', null);
	}

	var siteId = idUtil.extractSiteFromPid(pid);
	var localId = idUtil.extractDfnFromPid(pid);

    // take out the irrelevant fields for secondary site
    var ptDemographics = _morphToSecondaryDemographics(ptDemographicsBasis);
    // Fix the PID and UID values
	//----------------------------
	ptDemographics.pid = pid;
	ptDemographics.uid = 'urn:va:patient:' + siteId + ':' + localId + ':' + localId;
	ptDemographics.stampTime = BASIS_STAMPTIME;

	// Add in record enrichment information into demographic before we store it.
	//--------------------------------------------------------------------------
	xformerPtRecEnrichment.transformAndEnrichRecordAPI(ptDemographics);

	// Store the demographics data
	//-----------------------------

    // Store the meta-stamp first then the data if successful
    //-------------------------------------------------------
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // WARNING: This process is dependent on this being handled as a
    //          Synchronous call to JDS and not in a tube/handler.
    //          If this is ever moved to a tube/handler a race condition
    //          will exist that may overwrite the demographic object written
    //          here
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // metastampUtil requires the data to be in the format as returned by the poller
    var record = {
        'data': {
            'items': [ptDemographics]
        }
    };

    var metastamp = metastampUtil.metastampDomain(record,ptDemographics.stampTime,'');
    if(metastamp.error){
        //This should never be reached, since we generate the stampTime and ensure the record is passed in the correct format.
        self.log.error('ptdemographics-utils.storeDemographicsInJdsUsingBasisDemographics: Got error when creating metastamp for patient demographics for pid: %s, demographics record: %s, error: %s', pid, inspect(ptDemographics), metastamp.error);
        return callback('FailedMetastampError', null);
    }

    var patientIdentifier = idUtil.create('pid', pid);

    self.environment.jds.saveSyncStatus(metastamp, patientIdentifier, function(error,response) {
        self.log.debug('ptdemographics-utils.storeDemographicsInJdsUsingBasisDemographics: jds.storeSyncStatus.  id: %s; error: %s; response %j', pid, error,response);

        if (error) {
            self.log.error('ptdemographics-utils.storeDemographicsInJdsUsingBasisDemographics: Received error while calling jds.storeSyncStatus id: %s.  Error: %s;', pid, error);
            return callback('FailedJdsError', null);
        }

        if (!response) {
            self.log.error('ptdemographics-utils.storeDemographicsInJdsUsingBasisDemographics: Failed to call jds.storeSyncStatus. id: %s - no response returned.', pid);
            return callback('FailedJdsNoResponse', null);
        }

        if (response.statusCode !== 200) {
            var errors;
            if(response.body && response.body.error && response.body.error.errors){
                errors = response.body.error.errors;
            }
            self.log.error('ptdemographics-utils.storeDemographicsInJdsUsingBasisDemographics: Failed to call jds.storeSyncStatus id: %s - incorrect status code returned. Response.statusCode: %s Errors: %s', pid, response.statusCode, inspect(errors));
            return callback('FailedJdsWrongStatusCode', null);
        }

        self.log.debug('ptdemographics-utils.storeDemographicsInJdsUsingBasisDemographics: Saved Metastamp.  response: %j', response);

        // now store the actual demographic object in JDS

    	self.environment.jds.storePatientData(ptDemographics, function(error, response) {
    		self.log.debug('ptdemographics-utils.storeDemographicsInJdsUsingBasisDemographics: jds.storePatientData.  id: %s; error: %s; response: %j', pid, error, response);

    		if (error) {
    			self.log.error('ptdemographics-utils.storeDemographicsInJdsUsingBasisDemographics:  Received error while calling jds.storePatientData id: %s.  Error: %s;', pid, error);
    			return callback('FailedJdsError', null);
    		}

    		if (!response) {
    			self.log.error('ptdemographics-utils.storeDemographicsInJdsUsingBasisDemographics:  Failed to call jds.storePatientData. id: %s - no response returned.', pid);
    			return callback('FailedJdsNoResponse', null);
    		}

    		if (response.statusCode !== 201) {
    			self.log.error('ptdemographics-utils.storeDemographicsInJdsUsingBasisDemographics:  Failed to call jds.storePatientData id: %s - incorrect status code returned. Response.statusCode: %s', pid, response.statusCode);
    			return callback('FailedJdsWrongStatusCode', null);
    		}

			return callback(null, ptDemographics);
    	});
    });
};

//--------------------------------------------------------------------------------------------------
// This function is used to wrap the demographics creation tasks in a way so that we guarantee that
// all of the tasks are run by the parallel processor.   We need error information, but we cannot
// return it in the error field or it will stop the paralell processor from completing.  So we are
// going to place the information in the result stream - if an error occurs and then we can inspect
// results that are valid and results that have errors when it is all done.
//
// pid: The pid associated with the task.
// demographicsCreationTask: The task that is going to be run to retrieve or create the demographics.
// callback: The callback handler for this task.   It has the following signature:
//           function (error, ptDemographics) where:
//                error:  Any error that occurs  (We will always set this to null)
//                ptDemographics: If success, then this is the patient demographics object.  If there
//                                is an error, then this is an object that looks as follows:
//                                {
//                                   errorPid: <thePid>,
//                                   errorMessage: <theErrorMessage>
//                                }
//---------------------------------------------------------------------------------------------------
function _demographicsCreationTaskWrapper(pid, demographicsCreationTask, callback) {
	demographicsCreationTask(function(error, ptDemographics) {
		if (error) {
			ptDemographics = {
				errorPid: pid,
				errorMessage: error
			};
		}
		return callback(null, ptDemographics);
	});
}

//----------------------------------------------------------------------------------
// This method is created to facilitate testing more than anything else.
// The idea is to strip the fields that are only relevant for Vista sites.
// it does not use _clone anymore for better code safety
//
// primaryDemographics: the original demographics that we are to replicate
// return the pruned out version
//
//----------------------------------------------------------------------------------
function _morphToSecondaryDemographics (primaryDemographics) {
    // Safer than _.clone
    var ptDemographics = JSON.parse(JSON.stringify(primaryDemographics));

    if (ptDemographics.shortInpatientLocation) {
        delete ptDemographics.shortInpatientLocation;
    }

    if (ptDemographics.roomBed) {
        delete ptDemographics.roomBed;
    }

    if (ptDemographics.inpatientLocation) {
        delete ptDemographics.inpatientLocation;
    }

    if (ptDemographics.admissionUid) {
        delete ptDemographics.admissionUid;
    }

    if (ptDemographics.cwadf) {
        delete ptDemographics.cwadf;
    }

    return ptDemographics;
}


module.exports = PtDemographicsUtil;
PtDemographicsUtil._demographicsCreationTaskWrapper = _demographicsCreationTaskWrapper;
PtDemographicsUtil._morphToSecondaryDemographics = _morphToSecondaryDemographics;
PtDemographicsUtil.BASIS_STAMPTIME = BASIS_STAMPTIME;
