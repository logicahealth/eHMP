'use strict';

require('../../env-setup');
var logUtil = require(global.VX_UTILS + 'log');

var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var _ = require('underscore');
var config = require(global.VX_ROOT + 'worker-config');
var updateConfig = require(global.VX_ROOT + './record-update/update-config');

var log = logUtil._createLogger({
    name: 'vista-site-data-resync-util',
    level: updateConfig.utilityLogLevel,
    child: logUtil._createLogger
});

var VistaResyncUtil = require(global.VX_ROOT + './record-update/utils/vista-site-data-resync-util');
var VistaClient = require(global.VX_SUBSYSTEMS + 'vista/vista-client');

var argv = require('yargs')
    .usage('Usage: $0 [options...]')
    .demand(['domain'])
    .describe('site', 'A siteHash or list of siteHashes to re-pull data. All previously synced patients at these sites will be included in the resync unless the pid parameter is provided. If excluded, the pid parameter must be provided.')
    .describe('pid', 'A patient pid or list of pids for which to re-pull data. Include this to resync specific patients instead of all previously synced patients at a site. If excluded, the site parameter must be provided.')
    .describe('domain', 'A domain or list of domains for which to re-enrich data')
    .describe('updateTime', 'A time formatted as [YYYYMMDDmmhhss]; only update records older than this time (optional) ')
    .string('site') // do not do the auto conversion of site value, always use string type. @DE6501
    .argv;

var jdsClient = new JdsClient(log, log, config);
var vistaClient = new VistaClient(log, log, config);

var sites = parseParameterList(argv.site);
var updateTime = argv.updateTime;
var domains = parseParameterList(argv.domain);
var pids = parseParameterList(argv.pid);

var vistaResyncUtil = new VistaResyncUtil(log, vistaClient, jdsClient, updateConfig);

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

vistaResyncUtil.retrievePatientList(sites, pids, function(error, pidList) {
    if (error) {
        log.error('vista-site-data-resync-util: Exiting due to error returned by retrievePatientList: %s', error);
        return process.exit();
    }

    vistaResyncUtil.retrievePatientSyncStatuses(updateTime, domains, pidList, function(error, pidsToResyncDomains) {
        if (error) {
            log.error('vista-site-data-resync-util: Exiting due to error returned by retrievePatientSyncStatuses: %s', error);
            return process.exit();
        }

        vistaResyncUtil.getRecordsAndCreateJobs(pidsToResyncDomains, updateTime, function(error) {
            if (error) {
                log.error('vista-site-data-resync-util: Exiting due to error returned by getRecordsAndCreateJobs: %s', error);
                return process.exit();
            }

            log.debug('vista-site-data-resync-util: Utility has successfully finished processing.');
            process.exit();
        });
    });
});
