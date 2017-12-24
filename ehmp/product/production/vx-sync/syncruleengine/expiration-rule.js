'use strict';

var _ = require('underscore');
var inspect = require(global.VX_UTILS + 'inspect');
var patientUtil = require(global.VX_UTILS + 'patient-identifier-utils');
var objUtil = require(global.VX_UTILS + 'object-utils');
var moment = require('moment');

// If for some reason - there was no expiration time configured - we are going to default to 3600000 milliseconds
//----------------------------------------------------------------------------------------------------------------
var DEFAULT_EXPIRATION = 3600000;

//----------------------------------------------------------------------------------------------------
// This method will remove the Primary VistA sites that have already been synchronized for this
// patient.  There is no need to send a synchronization request again.  It has already been completed.
//
// log: The logger to be used to log messages.
// config: The worker-config containing configuration information.
// sites: The list of sites where this patient has data.
// patientIdentifiers: The set of patientIdentifiers that this patient has which are being considered
//                     for sync.
// simpleSyncStatus: The simpleSyncStatus information for this patient.
// returns: patientIdentifiers - The patientIdentifiers array that is left after removing the entries
//                               that should not be included.
//-----------------------------------------------------------------------------------------------------
function removeAlreadySyncedVistaDirectSites(log, config, sites, patientIdentifiers, simpleSyncStatus) {
    log.debug('expiration-rule.removeAlreadySyncedVistaDirectSites: Entered method.  Sites: %j, patientIdentifiers: %s; simpleSyncStatus: %s', sites, inspect(patientIdentifiers), inspect(simpleSyncStatus));

    // Check for Vista Direct sites that have been completed.  These do not expire - so if they
    // are completed - we do not need to sync them.
    //------------------------------------------------------------------------------------------
    var vistaSitesToRemove = _.filter(sites, function(site) {
        // Is this a vista site?
        //----------------------
        if ((!_.isEmpty(site)) && (_.isObject(config)) && (_.isObject(config.vistaSites)) && (_.isObject(config.vistaSites[site]))) {

            // Now lets see if this VistA site is in a state to be removed.   Valid states are if sync is complete, or if it is incomplete, but there are no errors
            //------------------------------------------------------------------------------------------------------------------------------------------------------
            var siteStatus = simpleSyncStatus.sites[site];
            // If the site status does not exist - we keep it in the list...
            //--------------------------------------------------------------
            if (!siteStatus) {
                return false;
            }

            // There is an error on this site.   Keep it in the list.
            //-------------------------------------------------------
            if (siteStatus.hasError) {
                return false;
            }

            // Sync has completed previously for this site.   We remove it from the list.
            //---------------------------------------------------------------------------
            if (siteStatus.syncCompleted) {
                return true;
            }

            // No jobs have been started related to this site - so that means we need to keep it in the list.
            //-----------------------------------------------------------------------------------------------
            if ((_.isString(siteStatus.latestJobTimestamp)) && (_.isEmpty(siteStatus.latestJobTimestamp))){
                return false;
            }

            // We have to catch a special case where we have requested a sync on a patient that has already been synchronized.  In this case
            // there is an open job - which is the enterprise-sync-request job, but that should ony be considered a case to sync this patient
            // if they have not already been synchronized on this site yet.   The best way to tell that will be to check the sourceStampTime.
            // If this value is '', null, undefined, etc  (!sourceStampTime) then it means that JDS has never stored a meta-stamp for this
            // patient yet.  Which would be the situation where this is the first request to sync this patient - therefore we should keep it
            // in the list (Return false) If this value has a time, then it means that a meta-stamp has been stored for this patient for this
            // site and therefore, this is a duplicate request - so we should skip it (Return true).
            //--------------------------------------------------------------------------------------------------------------------------------
            if (!siteStatus.sourceStampTime) {
                return false;
            }

            // If it is not any of the cases above - then it is a running sync and it should not be requested again.
            //------------------------------------------------------------------------------------------------------
            return true;
        }
        return false;
    });

    // Remove any patient identifiers for our vista sites that are either currently synchronizing or are complete.
    //-------------------------------------------------------------------------------------------------------------
    patientIdentifiers = _.filter(patientIdentifiers, function(patientIdentifier) {
        if ((patientIdentifier.type === 'pid') && (_.contains(vistaSitesToRemove, patientUtil.extractSiteFromPid(patientIdentifier.value)))) {
            return false;
        }
        return true;
    });

    log.debug('expiration-rule.removeAlreadySyncedVistaDirectSites: Leaving method. patientIdentifiers: %s',  inspect(patientIdentifiers));
    return patientIdentifiers;

}

//----------------------------------------------------------------------------------------------------
// This method will check to see if the site data is considered stale.  This is done by using the
// stale time frame set up in the config and comparing it to the last time that the sync was done
// for the site.  If it is older than the configured timeframe, it will return true.  If it is not,
// it will return false.
//
// log: The logger to be used to log messages.
// config: The worker-config containing configuration information.
// site: The site where this patient has data that is to be checked for possible removal.
// siteSyncStatus: The sync status information for that site.
// returns: True if the site data is considered stale.  False if it is not.
//-----------------------------------------------------------------------------------------------------
function isSiteDataStale(log, config, site, siteSyncStatus) {
    log.debug('expiration-rule.isSiteDataStale: Entered method.  Site: %s, siteSyncStatus: %j', site, siteSyncStatus);

    // If we have a sourceStampTime - we should use it.  If we do not - then we should use
    // the latestJobTimestamp value to check from...
    //------------------------------------------------------------------------------------
    var lastSyncTime;
    if (siteSyncStatus.sourceStampTime) {
        try {
            lastSyncTime = moment(siteSyncStatus.sourceStampTime, 'YYYYMMDDHHmmss');
        } catch (e) {
            log.error('expiration-rule.isSiteDataStale: sourceStampTime for site: %s was not in the correct format of YYYYMMDDHHmmss. Value was: %s  Will try to use latestJobTimestamp instead.',
                      site, siteSyncStatus.sourceStampTime);
            lastSyncTime = null;
        }
    }

    if ((!lastSyncTime) && (siteSyncStatus.latestJobTimestamp)) {
        try {
            lastSyncTime = parseInt(siteSyncStatus.latestJobTimestamp);
        } catch (e) {
            log.error('expiration-rule.isSiteDataStale: latestJobTimestamp for site: %s was not in the correct format.  It should have been an int value.   Value was: %s  Will try to use latestJobTimestamp instead.',
                      site, siteSyncStatus.latestJobTimestamp);
            lastSyncTime = null;
        }
    }

    // If we get here and we still do not have a lastSyncTime - we will have to assume that one of two cases has occurred:
    // An error has occurred on this patient that will require a manual unsync/sync of the patient, or we were just too fast
    // and we have a sync in progress - but checked it very soon after it started.  So in both of those cases - we do not want
    // to sync the patient.  So return false.
    //-------------------------------------------------------------------------------------------------------------------------
    if (!lastSyncTime) {
        log.warn('expiration-rule.isSiteDataStale: There was no valid sourceStampTime or lastJobTimestamp in the simple sync status.   ' +
                 'Assuming that the patient is synchronizing now, so no this site is considered NOT stale. Site: %s, siteSyncStatus: %j', site, siteSyncStatus);
        return false;
    }

    var expirationDuration = objUtil.getProperty(config, 'rules', 'expiration', site.toLowerCase());
    if ((!expirationDuration) || (expirationDuration <= 0)) {
        expirationDuration = objUtil.getProperty(config, 'rules', 'expiration', 'default');
    }
    // If for some reason - there was no expiration time configured - we are going to default it to 60 minutes
    //--------------------------------------------------------------------------------------------------------
    if (!expirationDuration) {
        expirationDuration = DEFAULT_EXPIRATION;
    }

    var elapsedTime = Date.now() - lastSyncTime;
    if (elapsedTime < expirationDuration) {
        log.debug('expiration-rule.isSiteDataStale: The elapsed time for this site was < configured duration. No sync for this site needed.  Site: %s, siteSyncStatus: %j', site, siteSyncStatus);
        return false;
    }

    // If we got here - then we are considered stale - return true...
    //---------------------------------------------------------------
    log.debug('expiration-rule.isSiteDataStale: The elapsed time for this site was >= configured duration. Sync will be done for this site.  Site: %s, siteSyncStatus: %j', site, siteSyncStatus);
    return true;

}

//----------------------------------------------------------------------------------------------------
// This method will remove the specified Secondary Site if it has already been synchronized and is not
// stale.   A secondary site is considered stale if it has not been scynchronized since the timeframe
// configured in the worker-config for that site.   If it has passed that amount time it should be
// syncrhonized again.  If it has not, then it should be dropped from the list.
//
// log: The logger to be used to log messages.
// config: The worker-config containing configuration information.
// site: The site where this patient has data that is to be checked for possible removal.
// patientIdentifiers: The set of patientIdentifiers that this patient has which are being considered
//                     for sync.
// simpleSyncStatus: The simpleSyncStatus information for this patient.
// returns: patientIdentifiers - The patientIdentifiers array that is left after removing the entries
//                               that should not be included.
//-----------------------------------------------------------------------------------------------------
function removeUnwantedSecondarySiteEntry(log, config, site, patientIdentifiers, simpleSyncStatus) {
    log.debug('expiration-rule.removeUnwantedSecondarySiteEntry: Entered method.  Site: %s, patientIdentifiers: %s; simpleSyncStatus: %s', site, inspect(patientIdentifiers), inspect(simpleSyncStatus));

    var siteSyncStatus = simpleSyncStatus.sites[site];
    var keepInList = true;

    // We should never have the case that the site sync status does not exist - since we already
    // checked it earlier - but we will make sure again...  Just in case...
    //------------------------------------------------------------------------------------------
    if (_.isObject(siteSyncStatus)) {

        // If there is an error condition - we should attempt to sync again.
        //------------------------------------------------------------------
        if (siteSyncStatus.hasError) {
            keepInList = true;

        // If  sourceStampTime is empty that means we have not synced this site - we need to sync
        //---------------------------------------------------------------------------------------
        } else if (_.isString(siteSyncStatus.sourceStampTime) && _.isEmpty(siteSyncStatus.sourceStampTime)) {
            keepInList = true;

        // This means that there is no error, and sync was complete previuosly - so now lets
        // see if the data is stale.
        //-----------------------------------------------------------------------------------
        } else {
            keepInList = isSiteDataStale(log, config, site, siteSyncStatus);
        }
    }

    // Remove any patient identifiers for our vista sites that are either currently synchronizing or are complete.
    //-------------------------------------------------------------------------------------------------------------
    if (!keepInList) {
        patientIdentifiers = _.filter(patientIdentifiers, function(patientIdentifier) {
            if ((patientIdentifier.type === 'pid') && (site === patientUtil.extractSiteFromPid(patientIdentifier.value))) {
                return false;
            }
            return true;
        });
    }

    log.debug('expiration-rule.removeUnwantedSecondarySiteEntry: Leaving method.  patientIdentifiers: %s', inspect(patientIdentifiers));
    return patientIdentifiers;
}

//----------------------------------------------------------------------------------------------------
// This method will remove the Secondary Sites that have already been synchronized and that are not
// stale.   A secondary site is considered stale if it has not been scynchronized since the timeframe
// configured in the worker-config for that site.   If it has passed that amount time it should be
// syncrhonized again.  If it has not, then it should be dropped from the list.
//
// log: The logger to be used to log messages.
// config: The worker-config containing configuration information.
// sites: The list of sites where this patient has data.
// patientIdentifiers: The set of patientIdentifiers that this patient has which are being considered
//                     for sync.
// simpleSyncStatus: The simpleSyncStatus information for this patient.
// forceSync: This tells whether secondary sites should be forced or not...  It can be a boolean, a
//            single site or an array of sites.   If boolean, then all secondary sites will be forced
//            to sync again.  If it is a single site, then that site will be forced.  If it is an array
//            then the sites in the array will be forced.
// returns: patientIdentifiers - The patientIdentifiers array that is left after removing the entries
//                               that should not be included.
//-----------------------------------------------------------------------------------------------------
function removeUnwantedSecondarySiteEntries(log, config, sites, patientIdentifiers, simpleSyncStatus, forceSync) {
    log.debug('expiration-rule.removeUnwantedSecondarySiteEntries: Entered method.  Sites: %j, patientIdentifiers: %s', sites, inspect(patientIdentifiers));

    // If we are forcing all secondary sites - then we remove nothing - we are done...
    //---------------------------------------------------------------------------------
    if (forceSync === true) {
        return patientIdentifiers;
    }

    if ((forceSync === false) || (forceSync === null) || (forceSync === undefined)) {
        forceSync = [];
    } else if (_.isString(forceSync)) {
        forceSync = [forceSync];
    }

    if ((_.contains(sites, 'DOD')) && (!_.contains(forceSync, 'DOD'))) {
        patientIdentifiers = removeUnwantedSecondarySiteEntry(log, config, 'DOD', patientIdentifiers, simpleSyncStatus);
    }
    if ((_.contains(sites, 'HDR')) && (!_.contains(forceSync, 'HDR'))) {
        patientIdentifiers = removeUnwantedSecondarySiteEntry(log, config, 'HDR', patientIdentifiers, simpleSyncStatus);
    }
    if ((_.contains(sites, 'VLER')) && (!_.contains(forceSync, 'VLER'))) {
        patientIdentifiers = removeUnwantedSecondarySiteEntry(log, config, 'VLER', patientIdentifiers, simpleSyncStatus);
    }

    log.debug('expiration-rule.removeUnwantedSecondarySiteEntries: Leaving method. patientIdentifiers: %s', inspect(patientIdentifiers));

    return patientIdentifiers;
}

//----------------------------------------------------------------------------------------------------
// This method is the heart of the expiration rule.  It will go through the analysis of whether
// one of the identifiers in the patientIdentifiers represents a site that has already been
// synchronized and does not need to be synchronized again.  If that is the case, the identifier
// will be removed from the array.   When we are done the patientIdentifiers array that is left will
// contain only those items that this rule thinks still needs to be synchronized.
//
// log: The logger to be used to log messages.
// config: The worker-config containing configuration information.
// patientIdentifiers: The set of patientIdentifiers that this patient has which are being considered
//                     for sync.
// exceptions: This tells whether secondary sites should be forced or not...  It can be a boolean, a
//            single site or an array of sites.   If boolean, then all secondary sites will be forced
//            to sync again.  If it is a single site, then that site will be forced.  If it is an array
//            then the sites in the array will be forced.
// callback:  function (error, patientIdentifiers) where
//                         error: is the error if one occurs or null if there is no error.
//                         patientIdentifiers: Is the patientIdentifiers array that is left after
//                                             removing the entries that should not be included.
//-----------------------------------------------------------------------------------------------------
function expiration(log, config, environment, patientIdentifiers, exceptions, callback) {
    log.debug('expiration-rule.expiration: Running expiration-rule on patientIdentifiers: ' + inspect(patientIdentifiers));
    log.debug('expiration-rule.expiration: Getting simple sync status for %s', patientIdentifiers[0].value);
    environment.jds.getSimpleSyncStatus(patientIdentifiers[0], function (error, response, simpleSyncStatus) {
        if (error) {
            log.error('expiration-rule.expiration: Error occurred retrieving simple sync status for pid: %s; error: %s', patientIdentifiers[0].value, error);
            return callback(error, patientIdentifiers);
        }

        if (!response) {
            log.error('expiration-rule.expiration: No response code received when retrieving simple sync status for pid: %s', patientIdentifiers[0].value);
            return callback('JDS-NO-RESPONSE', patientIdentifiers);
        }

        if (response.statusCode !== 200) {
            log.error('expiration-rule.expiration: Incorrect status code received when retrieving simple sync status for pid: %s; statusCode', patientIdentifiers[0].value, response.statusCode);
            return callback('JDS-WRONG-STATUS-CODE', patientIdentifiers);
        }

        if (!simpleSyncStatus) {
            log.error('expiration-rule.expiration: No result received when retrieving simple sync status for pid: %s; response: %j', patientIdentifiers[0].value, response);
            return callback('JDS-NO-RESULT', patientIdentifiers);
        }

        if (!simpleSyncStatus.sites) {
            log.warn('expiration-rule.expiration: There were no sites in the result status so assume all patientIdentifiers need to be synchronized.  pid: %s; result: %j', 
                     patientIdentifiers[0].value, simpleSyncStatus);
            return callback(null, patientIdentifiers);
        }

        var sites = _.keys(simpleSyncStatus.sites);


        // VistaDirect Sites...
        //----------------------
        patientIdentifiers = removeAlreadySyncedVistaDirectSites(log, config, sites, patientIdentifiers, simpleSyncStatus);

        // VistaHdr Sites: NOTE:  Since it has been determined that there will for sure be no VistA HDR sites,
        //                        this rule will no longer check that condition.
        //----------------------------------------------------------------------------------------------------

        // Secondary Sites
        //----------------------------------------------------------------------------------------------------
        patientIdentifiers = removeUnwantedSecondarySiteEntries(log, config, sites, patientIdentifiers, simpleSyncStatus, exceptions);

        return callback(null, patientIdentifiers);
    });
}

//----------------------------------------------------------------------------------------------------
// This method is the entry point for this rule.   It returns the actual rule function that should be
// called by the rule engine.
//
// returns: The handle to the main rule function.  In this rule it is the expiration function.
//-----------------------------------------------------------------------------------------------------
function loadRule() {
    return expiration;
}

module.exports = loadRule;
loadRule._steps = {
    '_removeUnwantedSecondarySiteEntries': removeUnwantedSecondarySiteEntries,
    '_removeUnwantedSecondarySiteEntry': removeUnwantedSecondarySiteEntry,
    '_isSiteDataStale': isSiteDataStale,
    '_removeAlreadySyncedVistaDirectSites': removeAlreadySyncedVistaDirectSites
};
