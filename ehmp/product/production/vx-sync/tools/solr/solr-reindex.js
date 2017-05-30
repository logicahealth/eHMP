'use strict';

require('../../env-setup');

var _ = require('underscore');

var config = require(global.VX_ROOT + 'worker-config.json').vxsync;
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var PjdsClient = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');
var solrSmartClient = require('solr-smart-client');
var VxSyncForeverAgent = require(global.VX_UTILS + 'vxsync-forever-agent');
var domainUtil = require(global.VX_UTILS + 'domain');
var solrReindexingUtil = require(global.VX_UTILS + 'solr-reindexing-util');

var argv = require('yargs')
    .usage('Usage: $0 --pid <pid> --icn <icn> --log-level <log-level>')
    .alias('p', 'pid')
    .alias('i', 'icn')
    .describe('pid', 'a pid to re-index data in solr')
    .describe('icn', 'an icn to re-index data in solr')
    .string('pid')
    .string('icn')
    .help()
    .argv;

if ((_.isEmpty(argv.pid)) && (_.isEmpty(argv.icn))) {
    console.error('You must define either --pid or --icn');
    process.exit(1);
}

var logger = require('bunyan').createLogger({
    name: 'solr-reindex',
    level: argv['log-level'] || 'error'
});

var environment = {
    jds: new JdsClient(logger, logger, config),
    pjds: new PjdsClient(logger, logger, config),
    metrics: logger,
    solr: solrSmartClient.initClient(config.solrClient.core, config.solrClient.zooKeeperConnection, logger, new VxSyncForeverAgent())
};

var reindexingConfig = {
    patientId:  argv.pid || argv.icn,
    jdsDomains: domainUtil.getSolrDomainList(),
    pjdsDomains: domainUtil.getPjdsDomainList(),
    saveFunction: solrReindexingUtil.storeDataToSolr
};

console.log('Starting solr re-indexing for patient id ' + reindexingConfig.patientId + ' ...');


solrReindexingUtil.processPatient(logger, config, environment, reindexingConfig, function(error, results) {
    if (error){
        console.log('Error re-indexing patient. ' + error);
    } else {
        console.log(results);
        console.log('solr re-indexing complete.');
    }
    process.exit();
});
