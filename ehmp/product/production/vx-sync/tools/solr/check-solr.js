'use strict';

require('../../env-setup');

var _ = require('underscore');
var async = require('async');
var yargs = require('yargs');
var fs = require('fs');
var errorUtil = require(global.VX_UTILS + 'error');

var config = require(global.VX_ROOT + 'worker-config');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var solrSmartClient = require('solr-smart-client');

var log = require('bunyan').createLogger({
    name: 'check-solr',
    level: 'info'
});

//TODO: Replace jds/solr client creation with poller-utils buildEnvironment
var jdsClient = new JdsClient(log, log, config);
var solr = solrSmartClient.createClient(log, config.solrClient);

var argv = parseOptions(log);

var optionConfig = _.clone(config.syncRequestApi);

//Default to using VM sync endpoint
if (!argv.local && !argv.l) {
    optionConfig.host = 'IP      ';
}
log.debug('Using sync endpoint location: ', optionConfig.host);

log.info('check-solr: Starting process...');

// http://ip:port/solr/vpr/select?q=*&fq=pid:(SITE;100826+OR+SITE;100826+OR+HDR;5000000327V828570)&wt=json&fl=uid,pid,domain
function buildSolrSearchUrl(completedPids) {
    var pidJoin = completedPids.join('+OR+');
    //Use very large number for rows, more than could conceivably be returned, so that all data is returned on a single call
    var url = 'q=*&fq=pid:(' + pidJoin + ')&wt=json&fl=uid,pid,domain&rows=1000000000';
    return url;
}


getListOfPatients(log, argv, function(err, patients) {
    if (err) {
        log.error(err);
        log.error('solr-check: Error encountered getting list of patients.');
        return;
    }

    //in absence of support for Set until node v0.12, use a collection with named properties/keys, null value, will collect the keys at the end
    var allPids = [];

    log.info('Using patient simple status to determine unique Pids to process...');

    async.eachSeries(patients, function(patient, uniquePidCallback){
        //query simple status
        var path = '/sync/combinedstat/' + patient;
        log.info('Processing find patient result ' + patient);

        jdsClient.execute(path, null, 'GET', {}, function (err, response, result) {
            if (err) {
                log.error('Error querying JDS: ' + path);
                log.error(err);
                return;
            }

            var sites = result.sites;
            log.info('Simple JDS status for pid ' + patient);
            log.info(sites);

            _.each(sites, function(site){
                log.info('Site pid: ' + site.pid);
                allPids.push(site.pid);
            });
            uniquePidCallback(null);
        });
    },
    function(err){
        if (err){
            log.error('Error encountered eachSeries within patients');
            process.exit();
        }
        else{
            log.debug('async.eachSeries patients complete...');
            //write results

            //now get unique set
            var uniquePids = _.uniq(allPids);
            log.info('uniquePids: ');
            log.info(uniquePids);

            log.info('Unique Pids determined');
            processPatients(log, uniquePids);

        }
    });

    //query jds detailed status
    function processPatients(logger, patients) {


        logger.debug('processPatients');
        logger.debug('input patients:');
        logger.debug(patients);

        var patientTasksInfo = _.map(patients, function(patient){
            var taskInfo = {pid: patient,
                queryComplete: false,
                dataMissing: false};
            return taskInfo;
        });


        async.eachSeries(patientTasksInfo, function(patientTask, eachPatientCallback){

            var patient = patientTask.pid;
            var path = '/status/' + patient + '?detailed=true';

            jdsClient.execute(path, null, 'GET', {}, function (err, response, result) {
                if (err) {
                    logger.error('Error querying JDS: ' + path);
                    logger.error(err);
                    return eachPatientCallback(err);
                }

                if (result.completedStamp === undefined){
                    //No completedStamp, so no solr records expected
                    logger.debug('Patient ' + patient + ' Status missing completedStamp.');
                    return eachPatientCallback(null, patient);
                }

                logger.trace('sourceMetaStamp');
                var sourceMetaStamp = result.completedStamp.sourceMetaStamp;
                logger.trace(sourceMetaStamp);

                var completedPids = [];
                var completedSourceKeys = _.keys(sourceMetaStamp);


                //TODO: change references to "facility" with "source" to be in line with vx-sync terminology
                //gather all the completed Pids
                completedSourceKeys.forEach(function(completedSource){
                    //get the pid
                    var sourceData = sourceMetaStamp[completedSource];
                    var pid = sourceData.pid;
                    //save the pid
                    completedPids.push(pid);
                });

                //for each facility defined in sourceMetaStamp
                async.eachSeries(completedSourceKeys, function(completedSource, eachFacilityCallback){

                    //If the facility isn't for the specific pid we're working under, skip it...
                    var patientPidSource = patient.split(';')[0];
                    if (completedSource !== patientPidSource){
                        logger.debug('Skipping Facility ' + completedSource + ' did not match patient ' + patient);
                        return eachFacilityCallback(null);
                    }
                   //get the pid
                    var sourceData = sourceMetaStamp[completedSource];
                    var pid = sourceData.pid;

                    logger.info('processing pid ' + pid);

                    var domainMetaStamp = sourceData.domainMetaStamp;
                    var facilityDomainKeys = _.keys(domainMetaStamp);
                    var patientSourceEventUids = [];   //hold all found event uids

                    _.each(facilityDomainKeys, function(facilityDomainKey){
                        if (isSolrDomain(facilityDomainKey)){
                            log.debug('checking domain ' + facilityDomainKey);
                            var eventMetaStamp = domainMetaStamp[facilityDomainKey].eventMetaStamp;

                            var eventUids = _.keys(eventMetaStamp);

                            //check stored value for each eventuid before adding it
                            eventUids.forEach(function(eventUid){
                                var eventData = eventMetaStamp[eventUid];
                                if (eventData.stored === true){
                                    patientSourceEventUids = patientSourceEventUids.concat(eventUid);
                                }
                            });
                        }
                    });

                    logger.debug('Finished eachSeries on facilityDomainKeys');

                    //all pids and event uids have been saved
                    //now query solr

                    //search with just the current facility pid
                    var url = buildSolrSearchUrl([pid]);
                    logger.debug('Querying Solr with query: ' + url);
                    // "docs": [
                    //     {
                    //         "uid": "urn:va:allergy:SITE:3:751",
                    //         "pid": "SITE;3",
                    //         "domain": "allergy"
                    //     },
                    //     {
                    //         "uid": "urn:va:allergy:SITE:3:874",
                    //         "pid": "SITE;3",
                    //         "domain": "allergy"
                    //     },
                    //

                    solr.search(url, function(err, result){
                        if (err){
                            logger.error('Error on solr.search');
                            logger.error(err);

                            return eachFacilityCallback(err);
                        }

                        logger.trace('eval solr search result');
                        logger.trace(result);

                        logger.debug('execution of solr query: ' + url + ', numFound: ' + result.response.numFound);
                        patientTask.queryComplete = true;

                        var docs = result.response.docs;

                        patientTask.dataMissing = !(_.every(patientSourceEventUids, function(eventUid) {
                            var matchingDocs = _.findWhere(docs, {uid: eventUid});
                            if (matchingDocs === undefined) {
                                logger.info('Unable to find record ' + eventUid + ' in Solr');
                                return false;
                            }
                            return true;
                        }));

                        eachFacilityCallback(null);
                    });
                },
                function(err){
                    if (err) {
                        logger.error('Error eachSeries on completedFacilityKeys');
                        logger.error(err);
                        return eachPatientCallback(err);
                    }
                    else{
                        logger.debug('Finished eachSeries on completedFacilityKeys');
                        return eachPatientCallback(null);
                    }
                });  //end eachSeries on completedFacilityKeys

            });  //end jds execute status
            },
            //series callback patientTasksInfo
            function(err){
                if (err){
                    logger.error('Error encountered eachSeries within processPatients');
                    process.exit();
                }
                else{
                    log.debug('processPatients complete...');
                    //write results

                    writeOutputFile(log, patientTasksInfo, function(){
                        process.exit();
                    });
                }
            }); //end eachSeries patientTasksInfo
    }

    // processPatients(patients);
});

//takes collection of {pid, dataMissing}
function writeOutputFile(logger, results, writeOutputFileCallback) {
    var fileContents = '';
    results.forEach(function (patientInfo) {
        if (patientInfo.dataMissing) {
            logger.debug('adding ' + patientInfo.pid + ' to results');
            fileContents += patientInfo.pid + '\n';
        }
    });

    //write results to file
    fs.writeFile('/tmp/check-solr-results.txt', fileContents, function(err){
        if (err) {
            logger.debug('err: ' + err);
        }
        logger.debug('File written');

        writeOutputFileCallback(err);
    });
}



var solrDomains = [
    'allergy',
    'appointment',
    'consult',
    'cpt',
    'document',
    'factor',
    'image',
    'immunization',
    'lab',
    'med',
    'order',
    'pov',
    'problem',
    'procedure',
    'surgery',
    'visit',
    'vital',
    'vlerdocument'
];

function isSolrDomain(key){
    return _.contains(solrDomains, key);
}

function parseOptions(logger) {
    var argv = yargs
        .check(function(args) {
            if ((!args.s && !args.e)) {
                logger.error('Invalid arguments. See usage.');
                return false;
            }
            return true;
        })
        .option('s', {
            alias: 'startdate',
            describe: 'Sync Start date (according to JDS)',
            type: 'string'
        })
        .option('e', {
            alias: 'enddate',
            describe: 'Sync End date (according to JDS)',
            type: 'string'
        })
        .usage('Usage: ./check-solr.sh -startdate <string> -enddate <string>')
        .argv;

    return argv;
}

function getListOfPatients(logger, argv, callback) {

    logger.trace('getListOfPatients(): entering method...');
    //query jds by argument dates
    queryJdsPatientsBySyncDateRange(logger, argv.startdate, argv.enddate, function(err, response, result){
        logger.debug('queryJdsPatientsBySyncDateRange callback');
        if (err){
            logger.debug('error' + err);
            callback(err, null);
        }

        // var body = val(result, 'body');
        logger.info('getListOfPatients (initial JDS query) totalItems: ' + result.data.totalItems);

        var pidArray = _.map(result.data.items, 'pid');
        callback(null, pidArray);
    });

}

function queryJdsPatientsBySyncDateRange(logger, startdate, enddate, callback) {
    logger.debug('solr-check.querySyncsforDateRange() %s %s', startdate, enddate);

    if (_.isEmpty(startdate)) {
        logger.error('solr-check.querySyncsforDateRange() No startdate passed in');
        return setTimeout(callback, 0, errorUtil.createFatal('No startdate passed in'));
    }
    if (_.isEmpty(enddate)) {
        logger.error('solr-check.querySyncsforDateRange() No enddate passed in');
        return setTimeout(callback, 0, errorUtil.createFatal('No enddate passed in'));
    }

    // var path = '/vpr/' + pid;
    var path = '/vpr/all/find/patient?filter=dgt(stampTime,' + startdate + '),dlt(stampTime,' + enddate + ')';
    jdsClient.execute(path, null, 'GET', {}, callback);
}
