'use strict';

require('../../env-setup');

var _ = require('underscore');
var async = require('async');

var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var PjdsClient = require(global.VX_SUBSYSTEMS + 'jds/pjds-client');
var config = require(global.VX_ROOT + 'worker-config');
var updateConfig = require(global.VX_ROOT + './record-update/update-config');
var solrReindexingUtil = require(global.VX_UTILS + 'solr-reindexing-util');
var patientIdUtils = require(global.VX_UTILS + 'patient-identifier-utils');
var uuid = require('node-uuid');

var argv = require('yargs')
    .usage('Usage: $0 [options...]')
    .demand(['domain'])
    .describe('domain', 'a domain or list of domains for which to re-enrich data')
    .describe('pid', 'a pid or list of pids for which to reindex pjds data in solr')
    .describe('icn', 'an icn or list of icns for which to reindex pjds data in solr')
    .argv;

var referenceInfo = {
    sessionId: uuid.v4(),
    utilityType: 'solr-reindexing-util'
};

var log = require('bunyan').createLogger({
    name: 'solr-reindexing-util',
    level: updateConfig.utilityLogLevel
}).child(referenceInfo);

var environment = {
    jds: new JdsClient(log, log, config),
    pjds: new PjdsClient(log, log, config),
    metrics: log
};

updateConfig.vistaSites = config.vistaSites;

var patientIds = parseParameterList(argv.pid || argv.icn);

console.log('run-pjds-solr-reindexing-util: Utility started. sessionId: %s', referenceInfo.sessionId);

retrievePatientList(patientIds, function(error, result) {
    if (error) {
        console.log('Exiting due to patient retrieval error: . ' + error);
        process.exit();
    }
    processPatients(result);
});

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

function retrievePatientList(pidList, callback) {
    log.debug('run-pjds-solr-reindexing.retrievePatientList: entering method');
    if (pidList) {
        log.info('run-pjds-solr-reindexing.retrievePatientList: pids already provided via parameter. Skipping to next step...');
        return callback(null, pidList);
    }

    pidList = [];

    log.debug('run-pjds-solr-reindexing.retrievePatientList: attempting to retrieve patient list from JDS');
    environment.jds.getPatientList(null, function(error, response, result) {
        if (error) {
            log.error('run-pjds-solr-reindexing.retrievePatientList: got error from JDS: %j', error);
            return callback(error);
        }

        if (!response || response.statusCode !== 200) {
            log.error('run-pjds-solr-reindexing.retrievePatientList: got unexpected response from JDS: Error %s, Response %j', error, response);
            return callback(error);
        }

        _.each(result.items, function(patient) {
            if (patientIdUtils.hasIdsOfTypes(patient, ['icn'])) {
                patient.push(_.first(patientIdUtils.extractIdsOfTypes(patient, ['icn'])));
            } else {
                pidList.push(_.first(patient.patientIdentifiers));
            }
        });

        return callback(null, pidList);
    });
}

function processPatients(patientIds) {
    async.eachLimit(patientIds, 200, function(patientId, callback) {
            var reindexingConfig = {
                patientId: patientId,
                pjdsDomains:  parseParameterList(argv.domain),
                saveFunction: solrReindexingUtil.createAndPublishSolrStoreJob
            };

            var patientReferenceInfo = _.extend({
                requestId: uuid.v4()
            }, referenceInfo);

            var childLog = log.child(patientReferenceInfo);
            var childEnvironement = {
                jds: environment.jds.childInstance(childLog),
                pjds: environment.pjds.childInstance(childLog),
                metrics: childLog
            };

            solrReindexingUtil.processPatient(childLog, updateConfig, childEnvironement, reindexingConfig, function(error, results) {
                if (error){
                    return callback(error);
                }

                console.log('solr re-indexing for patient id ' + reindexingConfig.patientId + ' results:');
                console.log(results);

                callback();
            });
        },
        function(error) {
            if (error) {
                console.log('Exiting due to solr reindexing error: . ' + error);
            }
            console.log('Utility has finished processing.');
            process.exit();
        }
    );
}
