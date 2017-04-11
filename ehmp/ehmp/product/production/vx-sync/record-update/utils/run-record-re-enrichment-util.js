'use strict';

require('../../env-setup');

var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var _ = require('underscore');
var config = require(global.VX_ROOT + 'worker-config');
var updateConfig = require(global.VX_ROOT + './record-update/update-config');

var log = require('bunyan').createLogger({
    name: 'record-re-enrichment-util',
    level: updateConfig.utilityLogLevel
});

var ReErnichUtil = require(global.VX_ROOT + './record-update/utils/record-re-enrichment-util');

var argv = require('yargs')
    .usage('Usage: $0 [options...]')
    .demand(['domain'])
    .describe('domain', 'a domain or list of domains for which to re-enrich data')
    .describe('updateTime', 'a time formatted as [YYYYMMDDmmhhss]; only update records older than this time (optional) ')
    .describe('pid', 'a pid or list of pids for which to re-enrich data; if excluded, all previously-synced patients\' records will be re-enriched (optional) ')
    .describe('solr-only', 'a flag to signify that only the Patient Record Text Indexing should be performed')
    .argv;

var jdsClient = new JdsClient(log, log, config);

var updateTime = argv.updateTime;
var domains = parseParameterList(argv.domain);
var pids = parseParameterList(argv.pid);
updateConfig.solrOnly = argv['solr-only'];

var reEnrichUtil = new ReErnichUtil(log, jdsClient, updateConfig);

/*
    Parses a comma-delimited list of arguments passed into one argv parameter
*/
function parseParameterList(param) {
    if (!param) {
        return null;
    }

    var paramArray = param;
    if (!_.isArray(param)) {
        paramArray = [param];
    }

    paramArray = _.flatten(_.map(paramArray, function(param) {
        return _.without(_.isString(param) || _.isNumber(param) ? _.invoke(String(param).split(','), 'trim') : [''], '');
    }));

    return paramArray;
}

reEnrichUtil.retrievePatientList(pids, function(error, pidList) {
    if (error) {
        log.error('record-re-enrichment-util: Exiting due to error returned by retrievePatientList: %s', error);
        return process.exit();
    }

    reEnrichUtil.retrievePatientSyncStatuses(updateTime, domains, pidList, function(error, pidsToResyncDomains) {
        if (error) {
            log.error('record-re-enrichment-util: Exiting due to error returned by retrievePatientSyncStatuses: %s', error);
            return process.exit();
        }

        reEnrichUtil.getRecordsAndCreateJobs(pidsToResyncDomains, updateTime, function(error) {
            if (error) {
                log.error('record-re-enrichment-util: Exiting due to error returned by getRecordsAndCreateJobs: %s', error);
                return process.exit();
            }

            log.debug('record-re-enrichment-util: Utility has successfully finished processing.');
            process.exit();
        });
    });
});