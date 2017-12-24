'use strict';

var _ = require('underscore');
var async = require('async');
var idUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var objUtil = require(global.VX_UTILS + 'object-utils');
var uidUtil = require(global.VX_UTILS + 'uid-utils');

function operationalDataSyncRule(log, config, environment, patientIdentifiers, exceptions, callback) {
    log.debug('operational-data-sync-rule.operationalDataSyncRule: Running...');

    var patientPids = idUtil.extractIdsOfTypes(patientIdentifiers, 'pid');
    log.debug('operational-data-sync-rule.operationalDataSyncRule: Got patient pids %j', patientPids);
    var patientVistaPids = _.filter(patientPids, function (patientIdentifier) {
        return idUtil.isVistaDirectSitePid(patientIdentifier, config);
    });
    var patientVistaHdrPids = _.filter(patientPids, function (patientIdentifier) {
        return idUtil.isVistaHdrSitePid(patientIdentifier, config);
    });
    log.debug('operational-data-sync-rule.operationalDataSyncRule: patientVistaPids %j', patientVistaPids);
    var patientSecondaryPids = _.filter(patientPids, function (patientIdentifier) {
        return idUtil.isSecondarySitePid(patientIdentifier, config);
    });
    log.debug('operational-data-sync-rule.operationalDataSyncRule: patientSecondaryPids %j', patientSecondaryPids);

    var patientIcn = idUtil.extractIdsOfTypes(patientIdentifiers, 'icn');

    if(_.isEmpty(patientVistaPids)) {   //no primary sites for this patient, so this rule doesn't apply
        return setTimeout(callback, 0, null, patientIdentifiers);
    }

    var patientIdentifiersToSync = [];
    log.debug('operational-data-sync-rule.operationalDataSyncRule:  Got patient VistA pids %j', patientVistaPids);
    var patientVistaSites = [];
    var patientVistaSitesToPids = {};
    _.each(patientVistaPids, function(pid) {
        var site = idUtil.extractSiteFromPid(pid.value);
        patientVistaSitesToPids[site] = pid; //{'SITE': 'SITE;10000', 'SITE': SITE;10000', etc.}
        patientVistaSites.push(site); //['SITE', 'SITE', etc.]
    });

    log.debug('operational-data-sync-rule.operationalDataSyncRule: Got patient VistA sites %j', patientVistaSites);

    log.debug('operational-data-sync-rule.operationalDataSyncRule: Verifying with JDS that operational data has been synced for %s', patientVistaSites.toString());
    async.each(patientVistaSites, function(site, asyncCallback) {
        var dfn = idUtil.extractDfnFromPid(patientVistaSitesToPids[site].value);
        var ptselectUID = uidUtil.getUidForOperationalDomain('pt-select', site, dfn);
        log.trace('operational-data-sync-rule.operationalDataSyncRule: ptLocalId %j ptselectUID %j', dfn, ptselectUID);
        var opdataFilter = {
            detailed: true,
            filter: 'eq(uid,' + '"' + ptselectUID +'")'
        };
        environment.jds.getOperationalSyncStatusWithParams(site, opdataFilter, function(error, response, result) {
            if (error) {
                log.error('operational-data-sync-rule.operationalDataSyncRule:Got error from JDS: %j', error);
                asyncCallback('FailedJdsError');
            } else if (!response) {
                log.error('operational-data-sync-rule.operationalDataSyncRule: Null response from JDS: %s', response);
                asyncCallback('FailedJdsNoResponse');
            } else if (!result) {
                log.error('operational-data-sync-rule.operationalDataSyncRule: Null result from JDS %j', result);
                asyncCallback('FailedJdsNoResult');
            } else if (response.statusCode !== 200 && response.statusCode !== 404) {
                log.error('operational-data-sync-rule.operationalDataSyncRule: Unexpeceted statusCode %s received from JDS', response.statusCode);
                asyncCallback('FailedJdsWrongStatusCode');
            // Only add patient to sync list if the following condtions are met:
            // Operational Data synced once (Checked using syncCompleteAsOf - which won't exist if it never synced)
            // The pt-select data item for the patient is stored
            } else if (response.statusCode === 200 &&
                ((objUtil.getProperty(result,'completedStamp','sourceMetaStamp',site,'syncCompleteAsOf') &&
                objUtil.getProperty(result,'completedStamp','sourceMetaStamp',site,'domainMetaStamp','pt-select','itemMetaStamp',ptselectUID,'stored')) ||
                (objUtil.getProperty(result,'inProgress','sourceMetaStamp',site,'syncCompleteAsOf') &&
                objUtil.getProperty(result,'inProgress','sourceMetaStamp',site,'domainMetaStamp','pt-select','itemMetaStamp',ptselectUID,'stored')))) {

                log.trace('operational-data-sync-rule.operationalDataSyncRule: objUtil results: completed-syncCompleteAsOf %j completed-Stored %j inProgress-syncCompleteAsOf %j inProgress-Stored %j',
                    objUtil.getProperty(result,'completedStamp','sourceMetaStamp',site,'syncCompleteAsOf'),
                    objUtil.getProperty(result,'completedStamp','sourceMetaStamp',site,'domainMetaStamp','pt-select','itemMetaStamp',ptselectUID,'stored'),
                    objUtil.getProperty(result,'inProgress','sourceMetaStamp',site,'syncCompleteAsOf'),
                    objUtil.getProperty(result,'inProgress','sourceMetaStamp',site,'domainMetaStamp','pt-select','itemMetaStamp',ptselectUID,'stored'));
                // Operational Data Completed at least once and item is stored
                log.debug('operational-data-sync-rule.operationalDataSyncRule: Operational data competed once and pt-select is complete for patient ' + site);
                // Get operational data with filter for pt-select
                log.trace('operational-data-sync-rule.operationalDataSyncRule: Added patient to sync: %j', patientVistaSitesToPids[site].value);
                patientIdentifiersToSync.push(patientVistaSitesToPids[site]);
                asyncCallback();
            // Only pt-select for this patient hasn't completed, tell the log about it
            } else if (response.statusCode === 200 &&
                ((objUtil.getProperty(result,'completedStamp','sourceMetaStamp',site,'syncCompleteAsOf') &&
                !objUtil.getProperty(result,'completedStamp','sourceMetaStamp',site,'domainMetaStamp','pt-select','itemMetaStamp',ptselectUID,'stored')) ||
                (objUtil.getProperty(result,'inProgress','sourceMetaStamp',site,'syncCompleteAsOf') &&
                !objUtil.getProperty(result,'inProgress','sourceMetaStamp',site,'domainMetaStamp','pt-select','itemMetaStamp',ptselectUID,'stored')))) {

                log.warn('operational-data-sync-rule.operationalDataSyncRule: patient %j for site %j not added to sync list due to pt-select not complete', patientVistaSitesToPids[site].value, site);
                log.warn('operational-data-sync-rule.operationalDataSyncRule: checked values: completed-syncCompleteAsOf %j completed-Stored %j inProgress-syncCompleteAsOf %j inProgress-Stored %j',
                    objUtil.getProperty(result,'completedStamp','sourceMetaStamp',site,'syncCompleteAsOf'),
                    objUtil.getProperty(result,'completedStamp','sourceMetaStamp',site,'domainMetaStamp','pt-select','itemMetaStamp',ptselectUID,'stored'),
                    objUtil.getProperty(result,'inProgress','sourceMetaStamp',site,'syncCompleteAsOf'),
                    objUtil.getProperty(result,'inProgress','sourceMetaStamp',site,'domainMetaStamp','pt-select','itemMetaStamp',ptselectUID,'stored'));
                asyncCallback();
            // operational data sync never completed
            } else {
                log.debug('operational-data-sync-rule.operationalDataSyncRule: Operational data has not yet been synced for site: %j patient: ', site, patientVistaSitesToPids[site].value);
                asyncCallback();
            }
        });
    }, function(err) {
        if (err) {
            //Error
            log.error('operational-data-sync-rule.operationalDataSyncRule: Not syncing patient because of error when verifying that operational sync is complete: %s', err);
            setTimeout(callback, 0, err, patientIdentifiersToSync);
        } else if (_.isEmpty(patientIdentifiersToSync)) {
            //Operational data not synced for the patient's sites; Reject patient sync
            log.error('operational-data-sync-rule.operationalDataSyncRule: Patient sync rejected because operational data has not been synced for any of the primary site(s) associated with this patient: %s', patientVistaSites.toString());
            setTimeout(callback, 0, 'NO_OPDATA', patientIdentifiersToSync);
        } else {
            //Continue as normal
            log.debug('operational-data-sync-rule.operationalDataSyncRule: Operational data for at least one pimary site associated with this patient has been synced. Continuing...');
            patientIdentifiersToSync = patientIdentifiersToSync.concat(patientVistaHdrPids); //add vista hdr back in
            patientIdentifiersToSync = patientIdentifiersToSync.concat(patientIcn); //Add icn back in
            patientIdentifiersToSync = patientIdentifiersToSync.concat(patientSecondaryPids); //Add secondary site pids back in
            log.debug('operational-data-sync-rule.operationalDataSyncRule: Patient Identifiers remaining after applying rule:', patientIdentifiersToSync.toString());
            setTimeout(callback, 0, null, patientIdentifiersToSync);
        }
    });

    //return patientIdentifiersToSync;
}

function loadRule() {
    return operationalDataSyncRule;
}

module.exports = loadRule;