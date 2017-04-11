'use strict';

var _ = require('lodash');


// Extracts and returns and array containing a list of sites belonging to a patient
// Result from sync status passed as parameter
function getVistaSites(syncStatus, req) {
    var siteSyncStatusCollection;
    var sites = [];
    if (_.isUndefined(syncStatus) || _.isUndefined(syncStatus.data) || _.isUndefined(syncStatus.data.syncStatus)) {
        return sites;
    }
    var syncStatusInfo = syncStatus.data.syncStatus;
    _.each(['completedStamp', 'inProgress'], function(element){
        if (_.isUndefined(syncStatusInfo[element]) || _.isUndefined(syncStatusInfo[element].sourceMetaStamp)) {
            return;
        }
        siteSyncStatusCollection =  syncStatusInfo[element].sourceMetaStamp;
        _getSiteFromCollection(siteSyncStatusCollection, sites, req);
    });
    // check the job status array
    var jobStatus = syncStatus.data.jobStatus;
    if (_.isArray(jobStatus) && jobStatus.length >= 1) {
        _.each(jobStatus, function(element){
            var siteInfo = '';
            if (element.type) {
                var typeInfo = element.type.toLowerCase();
                var idx = typeInfo.indexOf('-');
                if (idx > 0) { // the first char should not be -
                    siteInfo = typeInfo.substring(0,idx);
                    if (siteInfo === 'jmeadows') {
                        sites.push('DOD');
                    }
                    else if (siteInfo === 'vler') {
                        sites.push('VLER');
                    }
                    else if (siteInfo === 'cds') {
                        sites.push('CDS');
                    }
                    else if (siteInfo === 'hdr') {
                        sites.push('HDR');
                    }
                    else if (siteInfo === 'vista' || siteInfo === 'vistahdr') {
                        sites.push(typeInfo.substring(idx+1, typeInfo.indexOf('-', idx+1)).toUpperCase());
                    }
                }
            }
        });
    }
    return _.uniq(sites);
}

// internal function
function _getSiteFromCollection(siteSyncStatusCollection, sites, req) {
    _.each(siteSyncStatusCollection, function(value, site) {
        if (req && req.logger) {
            req.logger.debug('Got Site: ' + site);
        }
        sites.push(site);
    });
}


// JSON Representing Sync Status passed together with a list of sites expected
// Confirms whether all sites synced
function isSyncMarkedCompleted(syncStatus, sites, req) {
    // sanity check
    if (_.isUndefined(syncStatus) || _.isUndefined(sites) || sites.length === 0) {
        return false;
    }
    // make sure every site is marked sync completed.
    var syncCompleted = _.every(sites, function(site) {
        var siteSynced = isSiteSynced(syncStatus, site, req);
        if (req && req.logger) {
            req.logger.debug(site + ' sync complete: ' + siteSynced);
        }
        return siteSynced;
    });
    return syncCompleted;
}

// Inspect syncStatus result to check if all patient's data is synced.
function isSyncCompleted(syncStatus) {
    if (_.isUndefined(syncStatus) ||
        _.isUndefined(syncStatus.data) ||
        _.isUndefined(syncStatus.data.syncStatus) ) {
        return false;
    }
    var syncStatusData = syncStatus.data.syncStatus;
    var jobStatusData = syncStatus.data.jobStatus;
    if (syncStatusData.inProgress) { // anything in progress
        return false;
    }
    if (_.isArray(jobStatusData) && jobStatusData.length > 0) { // job array is not empty
        return false;
    }
    if (syncStatusData.completedStamp) {
        return true;
    }
    return false;
}

// JSON Representing Sync Status passed together with a single site expected
// Confirms whether this sites sync is complete
function isSiteSynced(syncStatus, site, req) {
    // some sanity check
    if (_.isUndefined(syncStatus) ||
        _.isUndefined(syncStatus.data) ||
        _.isUndefined(syncStatus.data.syncStatus) ||
        _.isUndefined(site)) {
        if (req && req.logger) {
            req.logger.debug('either syncStatus or site is undefined');
        }
        return false;
    }
    var syncStatusData = syncStatus.data.syncStatus;
    // if syncStatus does not have completedStamp attribute, just return false.
    if (_.isUndefined(syncStatusData.completedStamp) ||
        _.isUndefined(syncStatusData.completedStamp.sourceMetaStamp) ||
        _.isUndefined(syncStatusData.completedStamp.sourceMetaStamp[site])) {
        if (req && req.logger) {
            req.logger.debug('either completeStamp or sourceMetaStamp or sourceMetaStamp.site is undefined');
        }
        return false;
    }
    var siteInfo = syncStatusData.completedStamp.sourceMetaStamp[site];
    if (_.isUndefined(siteInfo)) {
        if (req && req.logger) {
            req.logger.debug('site is undefined');
        }
        return false;
    }
    if (siteInfo.syncCompleted === true) {
        if (!_hasOngoingJobForSite(syncStatus, site, req)) {
            return true;
        }
    }
    return false;
}

function _isValidJobArrayOrSite(syncStatus, site) {
    if (_.isUndefined(syncStatus) ||
        _.isUndefined(syncStatus.data) ||
        _.isUndefined(syncStatus.data.jobStatus) ||
        _.isUndefined(site)) {
        return false;
    }
    var jobStatus = syncStatus.data.jobStatus;
    if (!_.isArray(jobStatus) || jobStatus.length === 0) {
        return false;
    }
    return true;
}

/// Check to see if there is an ongoing job for a specific site
function _hasOngoingJobForSite(syncStatus, site, req) {
    if (!_isValidJobArrayOrSite(syncStatus, site)){
        return false;
    }
    var cSite = site.toLowerCase();
    if (cSite === 'dod') {
        cSite = 'jmeadows';
    }
    var jobStatus = syncStatus.data.jobStatus;
    var ongoing = _.find(jobStatus, function(jobData){
        var jobType = (jobData || {}).type;
        if (_.isString(jobType)) {
            jobType = jobType.toLowerCase();
        } else {
            if (req && req.logger) {
                req.logger.warn({ syncStatus: syncStatus, jobType: jobType }, 'Wrong type for jobStatus');
            }
            jobType = '';
        }
        if (jobType === 'enterprise-sync-request') {// return true if we have an entry of enterprise-sync-request
            return true;
        }
        if (jobType.indexOf(cSite) >=0) {
            return true;
        }
        return false;
    });
    return ongoing !== undefined;
}

function getSiteSyncDataStatus(syncStatus, site, req) {
    var dataStatusRet = {};
    if (_.isUndefined(syncStatus) ||
        _.isUndefined(syncStatus.data) ||
        _.isUndefined(syncStatus.data.syncStatus) ||
        _.isUndefined(site)) {
        return dataStatusRet;
    }
    var syncStatusData = syncStatus.data.syncStatus;
    req.logger.debug(syncStatusData);
    var hasError = hasSyncStatusErrorForSite(syncStatus, site);
    if (hasError) { // make sure we do not have any errors
        dataStatusRet.hasError = true;
        dataStatusRet.isSyncCompleted = false;
        return dataStatusRet;
    }
    // if site has ongoing jobs, then return inProgress.
    if (_hasOngoingJobForSite(syncStatusData, site)) {
        dataStatusRet.isSyncCompleted = false;
        return dataStatusRet;
    }
    if (_.isUndefined(syncStatusData.completedStamp) ||
        _.isUndefined(syncStatusData.completedStamp.sourceMetaStamp) ||
        _.isUndefined(syncStatusData.completedStamp.sourceMetaStamp[site])) {
        dataStatusRet.isSyncCompleted = false;
        dataStatusRet.hasError = false;
    }
    else {
        var siteInfo = syncStatusData.completedStamp.sourceMetaStamp[site];
        dataStatusRet.isSyncCompleted = siteInfo.syncCompleted;
        if (dataStatusRet.isSyncCompleted) {
            dataStatusRet.completedStamp = siteInfo.stampTime;
        }
    }
    return dataStatusRet;
}

// THis function will convert JDS simplified version sync status for a site to the format that UI wants.
function getSiteSyncDataStatusSimple(siteSyncStatus) {
    var dataStatusRet = {};
    if (!siteSyncStatus || _.isEmpty(siteSyncStatus)) {
        return dataStatusRet;
    }

    dataStatusRet.isSolrSyncCompleted = siteSyncStatus.solrSyncCompleted;

    if (siteSyncStatus.hasError) {
        dataStatusRet.hasError = true;
        dataStatusRet.isSyncCompleted = false;
        return dataStatusRet;
    }
    if (siteSyncStatus.syncCompleted) {
        dataStatusRet.isSyncCompleted = true;
        dataStatusRet.completedStamp =  siteSyncStatus.sourceStampTime;
        return dataStatusRet;
    }
    dataStatusRet.isSyncCompleted = false;
    dataStatusRet.hasError = false;
    return dataStatusRet;
}

function hasSyncStatusErrorForSite(syncStatus, site) {
    if (!_isValidJobArrayOrSite(syncStatus, site)) {
        return false;
    }
    var cSite = site.toLowerCase();
    if (cSite === 'dod') {
        cSite = 'jmeadows';
    }
    var jobStatus = syncStatus.data.jobStatus;
    for(var idx=0, len=jobStatus.length; idx < len; idx++){
        var jobData = jobStatus[idx];
        if (jobData && jobData.error) {
            if (jobData.type === 'enterprise-sync-request') {// return true if having a problem with sync
                return true;
            }
            if (jobData.type.indexOf(cSite) >=0 || jobData.type.indexOf(site) >=0) {
                return true;
            }
        }
    }
    return false;
}


module.exports.getVistaSites = getVistaSites;
module.exports.isSyncMarkedCompleted = isSyncMarkedCompleted;
module.exports.isSyncCompleted = isSyncCompleted;
module.exports.getSiteSyncDataStatus = getSiteSyncDataStatus;
module.exports.getSiteSyncDataStatusSimple = getSiteSyncDataStatusSimple;

// Exports for unit testing

module.exports._hasSyncStatusErrorForSite = hasSyncStatusErrorForSite;
module.exports._isSiteSynced = isSiteSynced;
