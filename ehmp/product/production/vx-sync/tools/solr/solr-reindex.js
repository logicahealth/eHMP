'use strict';

require('../../env-setup');

var _ = require('underscore');
var async = require('async');
var request = require('request');
var yargs = require('yargs');
var fs = require('fs');

var config = require(global.VX_ROOT + 'worker-config');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var solrSmartClient = require('solr-smart-client');
var solrXform = require(global.VX_UTILS + 'solr-xform');
var VxSyncForeverAgent = require(global.VX_UTILS+'vxsync-forever-agent');

var log = require('bunyan').createLogger({
    name: 'solr-reindex',
    level: 'info'
});

//TODO: Replace jds/solr client creation with poller-utils buildEnvironment
var jdsClient = new JdsClient(log, log, config);
var solr = solrSmartClient.initClient(config.solrClient.core, config.solrClient.zooKeeperConnection, log);

var argv = parseOptions(log);

var optionConfig = _.clone(config.syncRequestApi);

//Default to using VM sync endpoint
if (!argv.local && !argv.l) {
    optionConfig.host = 'IP      ';
}
log.debug('Using sync endpoint location: ', optionConfig.host);

log.info('check-solr: Starting process for pid ' + argv.p + ' ...');

reindexPatient(log, argv, function(err, results){
    if (err){
        log.error('Error Re-Indexing Patient');
        log.error(err);
        return;
    }
    log.info('Done');
    process.exit();
});

function storeDomainRecordToSolr(record, log, callback) {
    storeSolr(record, function (err, result) {
        if (err) {
            log.error(err);
            callback(err);
        }
        callback();  //done, no error
    })
}
function retrieveDomainDataAndStoreToSolr(pid, domain, log, retrieveCallback) {
    jdsClient.getPatientDomainData(pid, domain, function (err, response, result) {
        if (err) {
            log.error('Error retrieving patient data from jds');
            log.error(err);
            return retrieveCallback(err);
        }
        log.debug('JDS info retrieved');

        var data = result.data;

        if (data !== undefined){
            var domainRecords = result.data.items;

            log.info('Sending ' + domain + ' data to Solr');

            //for each domain record, send it to solr
            async.eachSeries(domainRecords, function(domainRecord, storeCallback){
                    storeDomainRecordToSolr(domainRecord, log, storeCallback);
                },
                function(err){
                    if (err){
                        log.error('Error encountered storeDomainRecordToSolr');
                        retrieveCallback(err);
                    }
                    else{
                        log.info('Sending ' + domain + ' data to Solr: COMPLETE');
                        log.debug('storeDomainRecordToSolr complete');
                        retrieveCallback();  //done, no errors
                    }
                });
        }
        else{
            log.info('No JDS records found for pid ' + pid + ' Domain: ' + domain);
            retrieveCallback();  //done
        }

    });
}
function reindexPatient(log, argv, callback){
    //retrieve data from jds

    var domains = [
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

    //for each domain, get the domain data for the patient from JDS
    async.eachSeries(domains, function(domain, callback){
        retrieveDomainDataAndStoreToSolr(argv.p, domain, log, callback);
    },
    function(err){
        if (err){
            log.error('Error encountered retrieveDomainDataAndStoreToSolr');
            callback(err);
        }
        else{
            log.info('retrieveDomainDataAndStoreToSolr complete');
            callback();  //done, no errors
        }
    });
};

//essentially copied from store-record-request-handler, should we just re-use?
function storeSolr(record, callback) {
    var solrClient = solr;

    var solrRecord = solrXform(record, log);
    if (_.isObject(solrRecord)) {
        log.debug('store-record-request-handler.handle: Storing SOLR record.  uid: %s; solrRecord: %j', record.uid, solrRecord);
        solrClient.add(solrRecord, function(error) {
            if (error) {
                // error storing to solr.  log it, but don't kill stuff
                log.error('store-record-request-handler.handle: Error storing to SOLR.  error: %s; uid: %s, solrRecord: %j', error, record.uid, solrRecord);
                return callback();
            } else {
                log.debug('store-record-request-handler.handle: Record stored to SOLR successfully.  uid: %s', record.uid);
                return callback();
            }
        });
    } else {
        log.debug('store-record-request-handler.handle: SOLR xform returned null There is no SOLR record to store.  uid: %s', record.uid);
        return callback();
    }
}


function parseOptions(logger) {
    var argv = yargs
        .check(function(args) {
            if ((!args.p)) {
                logger.error('Invalid arguments. See usage.');
                return false;
            }
            return true;
        })
        .option('pid', {
            alias: 'pid',
            describe: 'Patient pid to re-index',
            type: 'string'
        })
        .usage('Usage: ./solr-reindex.sh -p <string>')
        .argv;

    return argv;
}
