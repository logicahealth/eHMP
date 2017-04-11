'use strict';

require('../../env-setup');

var _ = require('underscore');
var async = require('async');

var solrStore = require(global.VX_HANDLERS + 'solr-record-storage/solr-record-storage-handler');
var config = require(global.VX_ROOT + 'worker-config.json').vxsync;
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var solrSmartClient = require('solr-smart-client');
var VxSyncForeverAgent = require(global.VX_UTILS + 'vxsync-forever-agent');

var argv = require('yargs')
    .usage('Usage: $0 --pid <pid> --log-level <log-level>')
    .demand(['pid'])
    .alias('p', 'pid')
    .describe('pid', 'a pid to re-index data in solr')
    .argv;

var logger = require('bunyan').createLogger({
    name: 'solr-reindex',
    level: argv['log-level'] || 'error'
});

var environment = {
    jds: new JdsClient(logger, logger, config),
    metrics: logger,
    solr: solrSmartClient.initClient(config.solrClient.core, config.solrClient.zooKeeperConnection, logger, new VxSyncForeverAgent())
};

console.log('Starting solr re-indexing for pid ' + argv.pid + ' ...');

reindexPatient(logger, argv.pid, environment, function(err){
    if (err){
        console.log('Error re-indexing patient. ' + err);
    } else {
        console.log('solr re-indexing complete.');
    }
    process.exit();
});

function reindexPatient(log, pid, environment, callback){
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

    async.eachSeries(domains, function(domain, callback){
            retrieveDomainDataAndStoreToSolr(pid, domain, log, environment, callback);
        },
        function(err){
            if (err){
                log.error('reindexPatient: Error: ' + err);
                return callback(err);
            }
            log.debug('reindexPatient: Completed without error.');
            callback();
        });
}

function retrieveDomainDataAndStoreToSolr(pid, domain, log, environment, retrieveCallback) {
    console.log('Retrieving domain ' + domain + ' from JDS and storing in solr.');

    environment.jds.getPatientDomainData(pid, domain, function (err, response, result) {
        if (err) {
            log.error('retrieveDomainDataAndStoreToSolr: Error retrieving patient data from jds for pid ' + pid +'. Error: ' + err);
            return retrieveCallback(err);
        }

        if (response.statusCode !== 200) {
            log.error('retrieveDomainDataAndStoreToSolr: Error retrieving patient data from jds for pid ' + pid +'. Error: ' + response.body);
            return retrieveCallback(response.body);
        }

        log.debug('retrieveDomainDataAndStoreToSolr: JDS info retrieved');

        if (result.data){
            log.debug('retrieveDomainDataAndStoreToSolr: Sending ' + domain + ' data to Solr.');

            async.eachSeries(result.data.items, function(domainRecord, storeCallback){
                    solrStore.writebackWrapper(log, config, environment, domain, domainRecord, storeCallback);
                },
                function(err){
                    if (err){
                        log.error('retrieveDomainDataAndStoreToSolr: Error encountered storing data to solr. Error: ' + err);
                        return retrieveCallback(err);
                    }
                    log.debug('retrieveDomainDataAndStoreToSolr: Sending ' + domain + ' data to solr completed.');
                    retrieveCallback();
                });
        }
        else{
            log.warn('No' + domain + ' records found for pid ' + pid + ' in JDS.');
            retrieveCallback();
        }
    });
}
