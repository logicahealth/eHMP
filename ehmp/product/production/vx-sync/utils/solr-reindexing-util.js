'use strict';

var async = require('async');
var _ = require('underscore');
var solrStore = require(global.VX_HANDLERS + 'solr-record-storage/solr-record-storage-handler');
var patientIdUtils = require(global.VX_UTILS + 'patient-identifier-utils');
var ReEnrichUtil = require(global.VX_ROOT + './record-update/utils/record-re-enrichment-util');
var jobUtil = require(global.VX_UTILS + 'job-utils');
var pidUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var uidUtil = require(global.VX_UTILS + 'uid-utils');

/**
 * This function is used to retrieve a single patient's data for one or more JDS and/or pJDS data domains and store
 * the domain data in solr.
 *
 * This function can take a patientID as either pid or icn. If an icn is passed in then it is assumed the caller wants
 * to retrieve pjds domain data for the icn as well as all vista pids known to ehmp (in JDS). pjds data domains support
 * storing domain data using a pid or icn as the patient identifier.
 *
 * @param log               the log object to use for this method call
 * @param config            the config object to use for this method call
 * @param environment       the environment object that contains a JDS client and pJDS client
 * @param reindexingContext contains runtime information used to retrieve and save domain data to solr.  Includes:
 *                              jdsDomains      array of data domains to retrieve from JDS for the patient
 *                              pjdsDomains     array of data domains to retrieve from pJDS for the patient
 *                              patientId       single valid patient pid or icn
 *                              saveFunction    either storeDataToSolr or createAndPublishSolrStoreJob. Default is storeDataToSolr.
 * @param callback          returns either an error or status of the method call
 */
function processPatient(log, config, environment, reindexingContext, callback) {
    if (!reindexingContext || !reindexingContext.patientId) {
        setTimeout(callback, 0, 'Invalid reindexing context. patientId is required.');
    }

    var buildTasks = [
        buildJdsDomainRetrievalTasks.bind(null, log, config, environment, reindexingContext),
        buildPjdsDomainRetrievalTasks.bind(null, log, config, environment, reindexingContext)
    ];

    async.series(buildTasks, function(err, results) {
        if (err) {
            log.error('solr-reindexing-util.processPatient: Error building retrieval tasks for patient %s for the following JDS domains: %s and the following pjds domains: %s.', reindexingContext.patientId, reindexingContext.jdsDomains, reindexingContext.pjdsDomains);
            return callback(err);
        }

        //each build function returns an array in the results - [array, array]
        var retrievalTasks = _.flatten(results);

        log.debug('solr-reindexing-util.processPatient: Beginning domain data retrieval for patient %s.', reindexingContext.patientId);

        async.parallel(retrievalTasks, function(error, results) {
            callback(error, results);
        });
    });
}

// Returns an array of retrieval functions; one per JDS domain. The return function is a partial with one of the parameters
// being the jds client's getPatientDomainData function as a partial function. This allow the retrieval function to be generic
// and apply for both the jds and pjds queries.
//
// Note: jdsDomains can be null or empty
//
function buildJdsDomainRetrievalTasks(log, config, environment, reindexingContext, callback) {
    var patientId = reindexingContext.patientId;
    var jdsDomains = reindexingContext.jdsDomains;
    var saveFunction = reindexingContext.saveFunction || storeDataToSolr;

    if (!jdsDomains) {
        return callback(null, []);
    }

    var retrievalTasks = _.map(jdsDomains, function(jdsDomain) {
        var queryFunction = environment.jds.getPatientDomainData.bind(environment.jds, patientId, jdsDomain);
        return retrieveDomainData.bind(null, log, config, environment, jdsDomain, patientId, queryFunction, saveFunction);
    });

    log.debug('solr-reindexing-util.buildJdsDomainRetrivalTasks: %s JDS retrieval task created for patient id %s for the following domains: %s.', retrievalTasks.length, patientId, jdsDomains);

    callback(null, retrievalTasks);
}

// Returns an array of retrieval functions; one per pjdsDomain. The return function is a partial with one of the parameters
// being the pjds client's getClinicalObject function as a partial function. This allow the retrieval function to generic
// and apply for both the jds and pjds queries.
//
// This function support either a single pid or an icn as the patientId. In the case of icn, JDS is queried for all pids
// and an array of vista pids and the icn are used in conjunction with the pjdsDomains to build the array of retrieval functions.
//
// Note: pjdsDomains can be null or empty
//
function buildPjdsDomainRetrievalTasks(log, config, environment, reindexingContext, callback) {
    var patientId = reindexingContext.patientId;
    var pjdsDomains = reindexingContext.pjdsDomains;
    var saveFunction = reindexingContext.saveFunction || storeDataToSolr;

    if (!pjdsDomains) {
        return callback(null, []);
    }

    getAllPatientIds(log, config, environment, patientId, function(err, patientUUIDs) {
        if (err) {
            return callback(err);
        }

        //explain plan: convert array of patient uuids to query filter string by patient uuid
        //              for each patient query filter string create a retrieval task partial function per pjds domain (array of arrays)
        //              flatten array of arrays to one set of retrieval functions
        var retrievalTasks = _.chain(patientUUIDs)
            .map(function(patientUUID) { return 'filter=eq(patientUid, "' + patientUUID + '")'; })
            .map(function(patientFilter) {
                return _.map(pjdsDomains, function(pjdsDomain) {
                    var queryFunction = environment.pjds.getClinicalObject.bind(environment.pjds, patientFilter + ', eq(domain, "' + pjdsDomain +'")');
                    return retrieveDomainData.bind(null, log, config, environment, pjdsDomain, patientId, queryFunction, saveFunction);
                });
            })
            .flatten()
            .value();

        log.debug('solr-reindexing-util.buildPjdsDomainRetrivalTasks: %s pJDS retrieval task created for patient id %s for the following domains: %s.', retrievalTasks.length, patientId, pjdsDomains);

        callback(null, retrievalTasks);
    });
}

// Returns an array of patient uuids.  If the patientId parameter is an icn then pids are retrieved from JDS and the array
// of patient uuids is created from the icn and patient vista pids.
//
function getAllPatientIds(log, config, environment, patientId, callback) {
    if (patientIdUtils.isIcn(patientId)) {
        environment.jds.getPatientIdentifierByIcn(patientId, function(err, response, result) {
            if (err) {
                log.error('solr-reindexing-util.getAllPatientIds: Error retrieving patient ids from JDS for patient id %s. Error: %j', patientId, err);
                return callback(err);
            }

            if (response.statusCode !== 200) {
                log.error('solr-reindexing-util.getAllPatientIds: Error retrieving patient ids from JDS for patient id %s. Error: %j', patientId, result);
                return callback(result);
            }

            callback(null, generatePatientUUIDs(log, config, patientId, result.patientIdentifiers));
        });
    } else {
        callback(null, generatePatientUUIDs(log, config, patientId));
    }
}

function generatePatientUUIDs(log, config, patientId, patientIdentifiers) {
    var patientUUIDs = [];

    patientUUIDs.push(patientIdUtils.createPatientUUID(patientId));

    if (patientIdentifiers)  {
        _.each(patientIdentifiers, function(pid) {
            if (patientIdUtils.isVistaDirect(pid, config)) {
                patientUUIDs.push(patientIdUtils.createPatientUUID(pid));
            }
        });
    }

    log.debug('solr-reindexing-util.generatePatientUUIDs: Generated the following patient uuids: %s', patientUUIDs);

    return patientUUIDs;
}

// Generic function that can support retrieving data from JDS and pJDS.  The data is then written to solr using the
// solr-record-storage-handler business logic.
//
// The queryFunction parameter is either a jds client or pjds client function that had all parameters bound except the
// callback. Both clients use the same callback signature.
//
function retrieveDomainData(log, config, environment, domain, patientId, queryFunction, saveFunction, callback) {
    log.debug('solr-reindexing-util.retrieveDomainData: Retrieving domain %s for patient id %s from data store and storing in solr.', domain, patientId);

    queryFunction(function (err, response, result) {
        if (err) {
            log.error('solr-reindexing-util.retrieveDomainData: Error retrieving patient data from data store for patient id %s. Error: %j' ,patientId, err);
            return callback(err);
        }

        if (response.statusCode !== 200) {
            log.error('solr-reindexing-util.retrieveDomainData: Error retrieving patient data from data store for patient id %s. Error: %j', patientId, result);
            return callback(result);
        }

        var domainData = extractDomainData(result);
        if (domainData && domainData.length > 0){
            log.debug('solr-reindexing-util.retrieveDomainData: Sending %s data for patient id %s to Solr.', domain, patientId);

            saveFunction(log, config, environment, domain, domainData, callback);
        }
        else{
            log.warn('No %s records found for patient id %s.', domain, patientId);
            callback(null, 'No ' + domain + ' domain data to store for patient.');
        }
    });
}

function extractDomainData(result) {
    return result.data ? result.data.items : result.items;
}

function storeDataToSolr(log, config, environment, domain, dataItems, callback) {
    async.eachSeries(dataItems, function(domainRecord, storeCallback){
            solrStore.writebackWrapper(log, config, environment, domain, domainRecord, storeCallback);
        },
        function(err){
            if (err){
                log.error('solr-reindexing-util.storeDataToSolr: Error encountered storing %s domain data to solr. Error: %j.', domain, err);
                return callback(err);
            }

            callback(null, 'Successfully stored all ' + domain + ' domain data for patient.');
        }
    );
}

function createAndPublishSolrStoreJob(log, config, environment, domain, dataItems, callback) {
    var jobsToPublish = [];
    var domainJobsCreated = 0;

    _.each(dataItems, function(item) {
        var newJob = jobUtil.createRecordUpdate(getPatientIdentifierFromItem(item), domain, item, null);
        newJob.solrOnly = true;
        jobsToPublish.push(newJob);
        domainJobsCreated++;
    });

    if (jobsToPublish.length === 0) {
        return setTimeout(callback, 0, null, 'Successfully published all ' + domain + ' domain data jobs for patient.');
    }

    var reEnrichUtil = new ReEnrichUtil(log, environment.jds, config);

    log.debug('solr-reindexing-util.createAndPublishSolrStoreJob: Created %s record update jobs for %s domain data. Now publishing jobs.', domainJobsCreated, domain);

    reEnrichUtil.writeJobsToBeanstalk(log, jobsToPublish, function(error){
        if (error) {
            log.error('solr-reindexing-util.createAndPublishSolrStoreJob: Error returned by writeJobsToBeanstalk: %s', error);
            return setTimeout(callback, 0, error);
        }

        log.debug('solr-reindexing-util.createAndPublishSolrStoreJob: Finished call to writeJobsToBeanstalk for domain %s. Jobs published successfully.', domain);
        setTimeout(callback, 0, null, 'Successfully published all ' + domain + ' domain data jobs for patient.');
    });

    function getPatientIdentifierFromItem(item) {
        var pid = item.pid ? item.pid : uidUtil.extractPidFromUID(item.patientUid);

        if (pid.toLowerCase().lastIndexOf('icn', 0) === 0) {
            pid = pidUtil.extractDfnFromPid(pid);
        }

        return pidUtil.create(pidUtil.isIcn(pid) ? 'icn' : 'pid', pid);
    }
}

module.exports.processPatient = processPatient;
module.exports._buildJdsDomainRetrievalTasks = buildJdsDomainRetrievalTasks;
module.exports._buildPjdsDomainRetrievalTasks = buildPjdsDomainRetrievalTasks;
module.exports._getAllPatientIds = getAllPatientIds;
module.exports._retrieveDomainData = retrieveDomainData;
module.exports.storeDataToSolr = storeDataToSolr;
module.exports.createAndPublishSolrStoreJob = createAndPublishSolrStoreJob;
