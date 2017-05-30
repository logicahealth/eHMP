'use strict';

require('../../env-setup');

var _ = require('underscore');
var async = require('async');

var moment = require('moment');
var inspect = require('util').inspect;
var format = require('util').format;

var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var nullUtil = require(global.VX_UTILS + 'null-utils');
var PatientIdentifierAPI = require(global.VX_UTILS + 'middleware/patient-identifier-middleware');
var JobAPI = require(global.VX_UTILS + 'middleware/job-middleware');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var docUtil = require(global.VX_UTILS + 'doc-utils');
var clearPatientUtil = require(global.VX_UTILS + 'clear-patient-util');
var HttpHeaderUtility = require(global.VX_UTILS + 'http-header-utils');

var healthcheckUtil = require(global.VX_UTILS + 'healthcheck-utils');

function registerSyncAPI(log, config, environment, app) {
    var httpHeaderUtility = new HttpHeaderUtility(log);
    var jobFactory = function (req) {
        var forcedSync = [];
        var priority = 1 ; // level one is the hightest priority and it is the default value
        var referenceInfo = httpHeaderUtility.extractReferenceInfo(req);
        log = log.child(referenceInfo);
        if (req && _.isFunction(req.param)) {
            if (!_.isUndefined(req.param('forcedSync'))) {
                var forceSyncParam = req.param('forcedSync');
                if (forceSyncParam !== true) {
                    try {
                        forcedSync = JSON.parse(forceSyncParam);
                    } catch (e) {
                        log.warn('Error parsing forcedSync : %s, %s', forceSyncParam, e);
                    }
                }
                else {
                    forcedSync = forceSyncParam;
                }
            }
            if (!_.isUndefined(req.param('priority'))){
                var priParam;
                try {
                    priParam = parseInt(req.param('priority'), 10); // use 10 based.
                    if (isNaN(priParam)) {
                        log.warn('invalid priority value: %s, not a valid number', priParam);
                    }
                    else if (!_.isNumber(priParam)) {
                        log.warn('invalid priority value: %s, not a valid number', priParam);
                    }
                    else if (priParam < 1) {
                        log.warn('priority value: %s is less than 1, reset to 1', priParam);
                        priority = 1;
                    }
                    else if (priParam > 100) {
                        log.warn('priority value: %s is greater than 100, reset to 100', priParam);
                        priority = 100;
                    }
                    else {
                        priority = priParam;
                    }
                }
                catch(err) {
                    log.warn('error parsing priority parameter: %s, %s', priParam, err);
                }
            }
        }

        // Put the original ID that was used to sync this patient in referenceInfo so that it can
        // be used later in rules engine(s).
        //----------------------------------------------------------------------------------------
        if ((!_.isEmpty(req.patientIdentifier)) && (req.patientIdentifier.value)) {
            referenceInfo.initialSyncId = req.patientIdentifier.value;
        }

        // validate the priority parameter
        return jobUtil.createEnterpriseSyncRequest(req.patientIdentifier, req.jpid, forcedSync,
                                                    req.body.demographics, priority, referenceInfo);
    };
    module.exports._jobFactory = jobFactory;

    var vistaConnector = environment.vistaClient,
        router = environment.publisherRouter;

    var doLoadMethods = [
        function(req, res, next) {
            var childLog = log.child(httpHeaderUtility.extractReferenceInfo(req));
            var jobMiddleware = new JobAPI(childLog, config, environment);
            var idMiddleware = new PatientIdentifierAPI(childLog, config, environment.jds.childInstance(childLog),
                    environment.mvi.childInstance(childLog));

            async.series([
                idMiddleware.validatePatientIdentifier.bind(idMiddleware, req, res),  // verify patient identifier exists and is a valid type
                idMiddleware.verifyPatientExists.bind(idMiddleware, req, res),  // verify patient exists in JDS
                idMiddleware.resolveJPID.bind(idMiddleware, req, res),  // find JPID or create one if it doesn't exist
                jobMiddleware.buildJob.bind(jobMiddleware, jobFactory, req, res),  // build an enterprise-sync-request job
                logSyncMetrics.bind(null, req, res), // log metrics
                injectEnterpriseSyncRequestFilter.bind(null, req, res), // add a filter attribute to the res to limit job type to enterprise-sync-request
                jobMiddleware.getJobHistory.bind(jobMiddleware, req, res), // add a filter attribute to the res to limit job type to enterprise-sync-request
                jobMiddleware.jobVerification.bind(jobMiddleware, ['completed', 'error'], req, res), // get job status and place in res.jobStates
                jobMiddleware.publishJob.bind(jobMiddleware, router.childInstance(childLog), req, res) // publish the enterprise-sync-request
            ], function (err) {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.status(202).json(res.job);
                }
                next();
            });
        }
    ];

    var doDemoLoadMethods = [
        function(req, res, next) {
            var childLog = log.child(httpHeaderUtility.extractReferenceInfo(req));
            var jobMiddleware = new JobAPI(childLog, config, environment);
            var idMiddleware = new PatientIdentifierAPI(childLog, config, environment.jds.childInstance(childLog),
                    environment.mvi.childInstance(childLog));

            async.series([
                validateDemoParams.bind(null, req, res), // validates that the request object contains valid parameters for demographics sync.
                idMiddleware.resolveJPID.bind(idMiddleware, req, res), // find JPID or create one if it doesn't exist
                jobMiddleware.buildJob.bind(jobMiddleware, jobFactory, req, res), // build an enterprise-sync-request job
                logSyncMetrics.bind(null, req, res), // log metrics
                injectEnterpriseSyncRequestFilter.bind(null, req, res), // add a filter attribute to the res to limit job type to enterprise-sync-request
                jobMiddleware.getJobHistory.bind(jobMiddleware, req, res), // get job status and place in res.jobStates
                jobMiddleware.jobVerification.bind(jobMiddleware, ['completed', 'error'], req, res), // verify job not already started
                jobMiddleware.publishJob.bind(jobMiddleware, router.childInstance(childLog), req, res) // publish the enterprise-sync-request
            ], function(err) {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.status(202).json(res.job);
                }
                next();
            });
        }
    ];

    var getStatusMethods = [
        function(req, res, next) {
            var childLog = log.child(httpHeaderUtility.extractReferenceInfo(req));
            var jobMiddleware = new JobAPI(childLog, config, environment);
            var idMiddleware = new PatientIdentifierAPI(childLog, config, environment.jds.childInstance(childLog),
                    environment.mvi.childInstance(childLog));

            async.series([
                idMiddleware.validatePatientIdentifier.bind(idMiddleware, req, res), // verify patient identifier exists and is a valid type
                idMiddleware.getJPID.bind(idMiddleware, req, res), // retrieve jpid and patient identifiers and place in req.jpid and result.patientIdentifiers
                getStatusJob.bind(null, req, res), // retrieve the job states
                jobMiddleware.getJobHistory.bind(jobMiddleware, req, res), // get job status and place in res.jobStates
                jobMiddleware.getSyncStatus.bind(jobMiddleware, req, res), // get the sync status and place in res.syncStatus
                getHealthStatus.bind(null, req, res), // check health of system
                returnSyncStatus.bind(null, req, res) // return job and sync status
            ], function(err) {
                if (err) {
                    childLog.error(err);
                }
                next();
            });
        }
    ];

    app.get('/sync/status', getStatusMethods);

    app.post('/sync/load', doLoadMethods);
    app.get('/sync/doLoad', doLoadMethods);

    var clearPatientMethods = [
        function(req, res, next) {
            var childLog = log.child(httpHeaderUtility.extractReferenceInfo(req));
            var idMiddleware = new PatientIdentifierAPI(childLog, config, environment.jds.childInstance(childLog),
                    environment.mvi.childInstance(childLog));

            async.series([
                idMiddleware.validatePatientIdentifier.bind(idMiddleware, req, res),
                idMiddleware.getJPID.bind(idMiddleware, req, res),
                unsyncPatient.bind(null, req, res)
            ], function(err) {
                if (err) {
                    childLog.error(err);
                }
                next();
            });
        }
    ];

    app.post('/sync/clearPatient', clearPatientMethods);
    app.get('/sync/doClearPatient', clearPatientMethods);
    app.post('/sync/demographicSync', doDemoLoadMethods);
    app.get('/sync/doDemographicSync', doDemoLoadMethods);

    function injectEnterpriseSyncRequestFilter(req, res, next) {
        res.filter = {
            filter: '?filter=eq(type,"' + jobUtil.enterpriseSyncRequestType() + '")'
        };

        return next();
    }

    function logSyncMetrics(req, res, next) {
        var metricsObj = {
            'pid':req.patientIdentifier.value,
            'jpid':req.jpid,
            'action': 'patient sync',
            // 'jobId': req.job.jobId,
            // 'rootJobId': req.job.jobId
        };
        environment.metrics.warn('Patient Sync started', metricsObj);
        return next();
    }

    //-------------------------------------------------------------------------
    // This function validates whether the request object contains a valid
    // set of parameters for doing a demographics based sync.   This is one for
    // a patient that does not have a primary site.  So it would be either by
    // icn or edipi.
    //
    // req: The request object received
    // res: The response object to be sent out,
    // next: The next method in the process of parsing.
    //--------------------------------------------------------------------------
    function validateDemoParams(req, res, next) {
        /*{
            'pid': ["","",""],
            'edipi': "",
            'icn': "",
            'demographics': {
                "displayName": "",
                "familyName": "",
                "fullName": "",
                "givenNames": "",
                "genderName": "Male",
                "genderCode": "M",
                "ssn": "",
                "dob": ""
            }
        }*/
        var childLog = log.child(httpHeaderUtility.extractReferenceInfo(req));
        childLog.debug('sync-request-endpoint.validateDemoParams(): Entered method.  req.body: %j', req.body);

        //validate icn
        if(!nullUtil.isNullish(req.body, 'icn')) {
            var isValidIcn = idUtil.isIdFormatValid(['icn'], req.body.icn, config);
            // var isValid = idUtil.isIdFormatValid(['icn', 'pid'], req.body.icn, config);
            if(!isValidIcn) {
                return res.status(400).send('The patient icn was not in a valid format');
            }
        } else if (!nullUtil.isNullish(req.body, 'edipi')) {
            var isValidEdipi = idUtil.isIdFormatValid(['edipi'], req.body.edipi, config);
            if(!isValidEdipi) {
                return res.status(400).send('The patient edipi was not in a valid format');
            }
        } else {
            return res.status(400).send('ICN or EDIPI must be provided');
        }
        //vaidate demographics
        if(!nullUtil.isNullish(req.body.demographics)) {
            if(nullUtil.isNullish(req.body.demographics,'displayName')) {
                childLog.warn('No display name found in demographic record');
            }
            if(nullUtil.isNullish(req.body.demographics,'familyName')) {
                childLog.warn('No family name found in demographic record');
            }
            if(nullUtil.isNullish(req.body.demographics,'fullName')) {
                childLog.warn('No full name found in demographic record');
            }
            if(nullUtil.isNullish(req.body.demographics,'givenNames')) {
                childLog.warn('No given names found in demographic record');
            }
            if(nullUtil.isNullish(req.body.demographics,'genderName')) {
                childLog.warn('No gender name found in demographic record');
            }
            if(nullUtil.isNullish(req.body.demographics,'genderCode')) {
                childLog.warn('No genderCode found in demographic record');
            }
            if(nullUtil.isNullish(req.body.demographics,'ssn')) {
                childLog.warn('No ssn found in demographic record');
            }
            if(nullUtil.isNullish(req.body.demographics,'birthDate')) {
                if(!nullUtil.isNullish(req.body.demographics,'dob')) {
                    req.body.demographics.birthDate = req.body.demographics.dob;
                } else {
                    childLog.warn('No birthDate found in demographic record');
                }
            }

            if (nullUtil.isNullish(req.body.demographics, 'address')) {
                childLog.warn('No address found in demographic record');
            }

            if (nullUtil.isNullish(req.body.demographics, 'telecom')) {
                childLog.warn('No telecom found in demographic record');
            }

            if(!nullUtil.isNullish(req.body, 'icn')) {
                req.body.demographics.icn = req.body.icn;
            }
        }
        req.body.demographics = _.pick(req.body.demographics, 'icn','displayName','fullname','givenNames','familyName','genderCode','genderName','birthDate','ssn','address','telecom');
        if(!nullUtil.isNullish(req.body, 'icn')) {
            req.patientIdentifier = idUtil.create('icn', req.body.icn);
        } else if (!nullUtil.isNullish(req.body, 'edipi')) {
            req.patientIdentifier = idUtil.create('pid', 'DOD;' + req.body.edipi);
        }
        next();
    }

    function unsyncPatient(req, res) {
        var childLog = log.child(httpHeaderUtility.extractReferenceInfo(req));
        if (!_.isUndefined(req.identifiers) && !_.isUndefined(req.identifiers.length)) {
            clearPatientUtil.clearPatient(childLog, config, environment, req.param('force'), req.identifiers, req.jpid, function(error){
                if (error) {
                    res.status(500).json(error);
                } else {
                    res.status(202).json({
                        'success': true
                    });
                }
            });
        } else {
            res.status(404).send('Patient not found');
        }
    }

    /**
     * Configure request to retrieve job states
     */
    function getStatusJob(req, res, next) {
        var childLog = log.child(httpHeaderUtility.extractReferenceInfo(req));
        childLog.debug('sync-request-endpoint.getStatus() : Enter');
        if (req.jpid === false) {
            return res.status(404).send('Patient identifier not found ');
        }
        res.job = {
            'jpid': req.jpid
        };
        res.filter = {
            'filter': '?filter=ne(status,\"completed\")'
        };

        next();
    }

    /**
     * Assemble sync status response from sync status and job status
     */
    function returnSyncStatus(req, res, next) {
        var syncStateJSON = {
            'jpid': res.job.jpid
        };

        /**
         * This section loops through the saved list of associated identifiers retrieved when the PID
         * was validated in JDS, and gets the size of the published documents saved for each PID, including
         * each PID, the size of its documents, and the total size of all documents for the patient in the
         * sync status.  It is only returned if the docStatus parameter is set to a truthy value in the
         * status request and the file system checks and the response section are omitted otherwise.
         */
        if (req.param('docStatus')) {
            syncStateJSON.identifierDocSizes = { 'totalSize': 0 };

            _.each(req.identifiers, function(id) {
                var pidSize = syncStateJSON.identifierDocSizes[id] =  docUtil.getPatientDocSize(id, config);
                if (pidSize !== 'NO_DOCUMENTS') { syncStateJSON.identifierDocSizes.totalSize += pidSize; }
            });
        }

        syncStateJSON.syncStatus = removeProp(res.syncStatus, 'eventMetaStamp');

        if (typeof res.jobStates !== 'undefined') {
            syncStateJSON.jobStatus = res.jobStates;
        } else {
            syncStateJSON.jobStatus = JSON.parse('[]');
        }
        if (config.healthcheck && config.healthcheck.heartbeatEnabled) {
            if (typeof res.healthStatus !== 'undefined') {
                syncStateJSON.healthStatus = res.healthStatus;
            } else {
                syncStateJSON.healthStatus = JSON.parse('[]');
            }
        }

        var pollerJobs = _.filter(syncStateJSON.jobStatus, function(jobState) {
            return jobState.type.indexOf('poller') && (Date.now()-jobState.timestamp)>120000;
        });
        if (_.isEmpty(pollerJobs) || (!req.param('vistaStatus'))) {
            res.json(syncStateJSON);
            return next();
        }

        // This should only be run if the vistaStatus parameter was passed in
        //--------------------------------------------------------------------
        if (req.param('vistaStatus')) {
            // get subscription status
            // var vistaClient = new VistaClient(log, {}, config);
            var vistaPids = _.filter(req.identifiers, function(identifier) {
                return idUtil.isVistaDirect(identifier);
            });
            async.map(vistaPids, vistaConnector.status.bind(vistaConnector), function(error, response) {
                var vistaIds = _.pluck(response, 'siteId');
                syncStateJSON.vistaSubscriptionStatus = _.object(vistaIds, response);
                res.json(syncStateJSON);
                return next();
            });
        }
        else {
            res.json(syncStateJSON);
            return next();
        }
    }

    function removeProp(obj, propName) {

        for (var p in obj) {

            if (obj.hasOwnProperty(p)) {

                if (p === propName) {
                    delete obj[p];

                } else if (typeof obj[p] === 'object') {
                    removeProp(obj[p], propName);
                }
            }
        }
        return obj;
    }

    function getHealthStatus(req, res, next){
        var childLog = log.child(httpHeaderUtility.extractReferenceInfo(req));
        childLog.debug('sync-request-endpoint.getHealthStatus()');
        if(!config.healthcheck || !config.healthcheck.heartbeatEnabled){
            childLog.debug('sync-request-endpoint.getHealthStatus(): healthcheck is disabled in configiuration. Skipping getHealthStatus...');
            next();
        }

        var currentTime = moment();

        healthcheckUtil.retrieveStaleHeartbeats(log, config, environment, currentTime, function(error, response){
            if(error){
                childLog.error('sync-request-endpoint.getHealthStatus(): Received error from healthcheckUtil.retrieveStaleHeartbeats(): %s', error);
                var errorTemplate = 'Error received from JDS when retrieving health status messages. Error: %s';
                res.status(500).send(format(errorTemplate, inspect(error)));
            } else {
                childLog.debug('sync-request-endpoint.getHealthStatus(): Adding healthStatus to response: %s', response);
                res.healthStatus = response;
            }
            next();
        });
    }
}

module.exports = registerSyncAPI;
