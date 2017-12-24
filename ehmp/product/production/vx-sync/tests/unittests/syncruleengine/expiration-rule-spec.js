'use strict';

var _ = require('underscore');

require('../../../env-setup');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var expirationRule = require(global.VX_SYNCRULES + 'expiration-rule');
var expirationRuleFunction = expirationRule();
var moment = require('moment');

var icn = '10108V420871';

var log = require(global.VX_DUMMIES + 'dummy-logger');
//--------------------------------------------------------------
// Uncomment the following to see the logging out on the screen.
//--------------------------------------------------------------
//var logUtil = require(global.VX_UTILS + 'log');
// logUtil.initialize([{
//     name: 'root',
//     stream: process.stdout,
//     level: 'debug'
// }]);
// log = logUtil.get('test', 'debug');
//------------------------------------------
// End of logging stuff to comment out....
//------------------------------------------
// log = require('bunyan').createLogger({
//     name: 'expiration-rule-spec',
//     level: 'debug'
// });

//---------------------------------------------------------------------
// Create an instance of the environment variable.
//
// config:  The config object to be used in the environment.
// returns: The environment that was created.
//---------------------------------------------------------------------
function createEnvironment(config) {
    var environment = {
        jds: new JdsClientDummy(log, config),
        metrics: log
    };

    spyOn(environment.jds, 'getSimpleSyncStatus').andCallThrough();

    return environment;
}


//--------------------------------------------------------------------------------
// Create the config needed for the tests.
//--------------------------------------------------------------------------------
function createConfig() {
    var config = {
        vistaSites: {
            'AAAA': {},
            'BBBB': {}
        },
        rules: {
            'expiration': {
                'default': 300000, // 5 minutes
                'dod': 60000, // 1 minute
                'hdr': 120000, // 2 minutes
                'vler': 180000 // 3 minutes
            }
        },
        'hdr': {
            'operationMode': 'REQ/RES'
        }
    };
    return config;
}


//---------------------------------------------------------------------------------
// This function creates the pid based on the site and icn and returns it.
//
// site: The site for which the pid is being created.
// icn: The ICN for this patient.
// returns: The pid that was created.
//---------------------------------------------------------------------------------
function createPid(site) {
    var patientId = '';
    if (site === 'DOD') {
        patientId = '0000000003';
    } else if (_.contains(['HDR', 'VLER'], site)) {
        patientId = icn;
    } else {
        patientId = '3';
    }

    return site + ';' + patientId;
}

//-----------------------------------------------------------------------------------
// Create the set of patientIdentifiers that will be used for this testing.
//
// sites: The sites to create the patient identifiers for.
// returns: The patientIdentifiers array.
//-----------------------------------------------------------------------------------
function createPatientIdentifiers(sites) {
    var patientIdentifiers = [{
        'type': 'icn',
        'value': icn
    }, {
        'type': 'pid',
        'value': 'JPID;6ce7225e-88d0-488f-82bc-01908f98ecb2'
    }];

    _.each(sites, function(site) {
        var patientIdentifier = {
            'type': 'pid',
            'value': createPid(site)
        };
        patientIdentifiers.push(patientIdentifier);

    });


    return patientIdentifiers;
}

//--------------------------------------------------------------------------------
// Create a simpleSyncStatus for the given sites that reflects a completed state
// on all sites.
//
// sites: the sites to put in the sync status.
// baseTime:  The time to start basing the sync status times on.  Each site will
//            subtract from there to simulate a real sync status.
// returns: The simple sync status
//--------------------------------------------------------------------------------
function createSimpleSyncStatusAllComplete(sites, baseTime) {
    // var rightNow = Date.now();

    var simpleSyncStatus = {
        'icn': icn,
        // 'latestEnterpriseSyncRequestTimestamp': baseTime,
        'latestJobTimestamp': baseTime,
        'latestSourceStampTime': moment(baseTime).format('YYYYMMDDHHmmss'),
        'sites': {},
        'syncCompleted': true
    };

    var offset = 0;
    _.each(sites, function(site) {
        var pid = createPid(site);
        var siteStatus = {
            'latestJobTimestamp': baseTime - offset,
            'pid': pid,
            'sourceStampTime': moment(baseTime - offset).format('YYYYMMDDHHmmss'),
            'syncCompleted': true
        };

        simpleSyncStatus.sites[site] = siteStatus;
        offset += 600000; // each entry will be 10 minutes older than the previous one...
    });

    simpleSyncStatus.latestEnterpriseSyncRequestTimestamp = baseTime - offset; // Make sure that the enterpriseSyncRequest time is before all site jobs.

    return simpleSyncStatus;
}

//--------------------------------------------------------------------------------
// Create a simpleSyncStatus that mirrors what it will look like when the only
// thing that has happened is that patient identifiers have been posted.  There
// are no jobs, no meta-stamps, etc.
//
// sites: the sites to put in the sync status.
// returns: The simple sync status
//--------------------------------------------------------------------------------
function createSimpleSyncStatusImmediatelyAfterStoredIds(sites) {
    // var rightNow = Date.now();

    var simpleSyncStatus = {
        'icn': '10108V420871',
        'latestEnterpriseSyncRequestTimestamp': '',
        'sites': {},
        'syncCompleted': false
    };

    var offset = 0;
    _.each(sites, function(site) {
        var patientId = '';
        if (site === 'DOD') {
            patientId = '0000000003';
        } else if (_.contains(['HDR', 'VLER'], site)) {
            patientId = simpleSyncStatus.icn;
        } else {
            patientId = '3';
        }
        var siteStatus = {
            'latestJobTimestamp': '',
            'pid': site + ';' + patientId,
            'sourceStampTime': '',
            'syncCompleted': false
        };

        simpleSyncStatus.sites[site] = siteStatus;
        offset += 600000; // each entry will be 10 minutes older than the previous one...
    });

    return simpleSyncStatus;
}

describe('expiration-rule-unittest', function() {
    describe('removeAlreadySyncedVistaDirectSites tests', function() {
        it('Patient is not synchronized.   Return all identifiers back.', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var simpleSyncStatus = createSimpleSyncStatusImmediatelyAfterStoredIds(sites);
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(sites);
            var result = expirationRule._steps._removeAlreadySyncedVistaDirectSites(log, config, sites, patientIdentifiers, simpleSyncStatus);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Patient is synchronized for some VistA sites, but one site has no sync status entry.', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = ['AAAA', 'DOD', 'HDR', 'VLER'];
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, Date.now());
            simpleSyncStatus.sites = _.omit(simpleSyncStatus.sites, 'AAAA');
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeAlreadySyncedVistaDirectSites(log, config, sites, patientIdentifiers, simpleSyncStatus);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Patient is synchronized for some VistA sites, one VistA site has an error.', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = ['AAAA', 'DOD', 'HDR', 'VLER'];
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, Date.now());
            simpleSyncStatus.hasError = true;
            simpleSyncStatus.syncCompleted = false;
            simpleSyncStatus.sites.AAAA.hasError = true;
            simpleSyncStatus.sites.AAAA.syncCompleted = false;
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeAlreadySyncedVistaDirectSites(log, config, sites, patientIdentifiers, simpleSyncStatus);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Patient is synchronized for all VistA sites.', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = ['DOD', 'HDR', 'VLER'];
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, Date.now());
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeAlreadySyncedVistaDirectSites(log, config, sites, patientIdentifiers, simpleSyncStatus);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Patient is synchronized for some VistA sites, one VistA site there have been no jobs started for it (Implies need to sync it).', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = ['AAAA', 'DOD', 'HDR', 'VLER'];
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites);
            simpleSyncStatus.syncCompleted = false;
            simpleSyncStatus.sites.AAAA.latestJobTimestamp = '';
            simpleSyncStatus.sites.AAAA.syncCompleted = false;
            var patientIdentifiers = createPatientIdentifiers(sites, Date.now());
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeAlreadySyncedVistaDirectSites(log, config, sites, patientIdentifiers, simpleSyncStatus);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Patient is synchronized for some VistA sites, but the site that we want has not been synchronized. (Implies need to sync it).', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, Date.now());
            simpleSyncStatus.syncCompleted = false;
            simpleSyncStatus.sites.AAAA.sourceStampTime = '';
            simpleSyncStatus.sites.AAAA.syncCompleted = false;
            simpleSyncStatus.sites.BBBB.sourceStampTime = '';
            simpleSyncStatus.sites.BBBB.syncCompleted = false;
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeAlreadySyncedVistaDirectSites(log, config, sites, patientIdentifiers, simpleSyncStatus);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Patient is synchronized for some VistA sites, but the site that we want has already been synchronized.. (Implies do NOT sync it).', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = ['DOD', 'HDR', 'VLER'];
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, Date.now());
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeAlreadySyncedVistaDirectSites(log, config, sites, patientIdentifiers, simpleSyncStatus);
            expect(result).toEqual(patientIdentifiersExpected);
        });
    });
    describe('isSiteDataStale tests', function() {
        it('Secondary site not stale. Using sourceStampTime.', function() {
            var config = createConfig();
            var sites = ['DOD'];
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, Date.now());
            var result = expirationRule._steps._isSiteDataStale(log, config, sites[0], simpleSyncStatus.sites.DOD);
            expect(result).toEqual(false);
        });
        it('Secondary site not stale. Using latestJobTimestamp because of missing sourceStampTime.', function() {
            var config = createConfig();
            var sites = ['DOD'];
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, Date.now());
            simpleSyncStatus.sites.DOD.sourceStampTime = undefined;
            var result = expirationRule._steps._isSiteDataStale(log, config, sites[0], simpleSyncStatus.sites.DOD);
            expect(result).toEqual(false);
        });
        it('Secondary site not stale. No sourceStampTime or latestJobTimestamp.', function() {
            var config = createConfig();
            var sites = ['DOD'];
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, Date.now());
            simpleSyncStatus.sites.DOD.sourceStampTime = undefined;
            simpleSyncStatus.sites.DOD.latestJobTimestamp = undefined;
            var result = expirationRule._steps._isSiteDataStale(log, config, sites[0], simpleSyncStatus.sites.DOD);
            expect(result).toEqual(false);
        });
        it('Secondary site (DOD) stale compared against config DOD setting. Using sourceStampTime.', function() {
            var config = createConfig();
            var sites = ['DOD'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.DOD.sourceStampTime = moment(now - 90000).format('YYYYMMDDHHmmss');
            var result = expirationRule._steps._isSiteDataStale(log, config, sites[0], simpleSyncStatus.sites.DOD);
            expect(result).toEqual(true);
        });
        it('Secondary site (DOD) stale compared against config DOD setting. Using latestJobTimestamp because of missing sourceStampTime.', function() {
            var config = createConfig();
            var sites = ['DOD'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.DOD.sourceStampTime = undefined;
            simpleSyncStatus.sites.DOD.latestJobTimestamp = now - 90000;
            var result = expirationRule._steps._isSiteDataStale(log, config, sites[0], simpleSyncStatus.sites.DOD);
            expect(result).toEqual(true);
        });
        it('Secondary site (DOD) not stale compared against config default setting. Using sourceStampTime.', function() {
            var config = createConfig();
            config.rules.expiration = _.omit(config.rules.expiration, 'dod');
            var sites = ['DOD'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.DOD.sourceStampTime = moment(now - 90000).format('YYYYMMDDHHmmss');
            var result = expirationRule._steps._isSiteDataStale(log, config, sites[0], simpleSyncStatus.sites.DOD);
            expect(result).toEqual(false);
        });
        it('Secondary site (DOD) stale compared against config default setting. Using sourceStampTime.', function() {
            var config = createConfig();
            config.rules.expiration = _.omit(config.rules.expiration, 'dod');
            var sites = ['DOD'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.DOD.sourceStampTime = moment(now - 300001).format('YYYYMMDDHHmmss');
            var result = expirationRule._steps._isSiteDataStale(log, config, sites[0], simpleSyncStatus.sites.DOD);
            expect(result).toEqual(true);
        });
        it('Secondary site (DOD) not stale compared against in-code default setting. Using sourceStampTime.', function() {
            var config = createConfig();
            config.rules.expiration = _.omit(config.rules.expiration, 'default');
            config.rules.expiration = _.omit(config.rules.expiration, 'dod');
            var sites = ['DOD'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.DOD.sourceStampTime = moment(now - 90000).format('YYYYMMDDHHmmss');
            var result = expirationRule._steps._isSiteDataStale(log, config, sites[0], simpleSyncStatus.sites.DOD);
            expect(result).toEqual(false);
        });
        it('Secondary site (DOD) stale compared against in-code default setting. Using sourceStampTime.', function() {
            var config = createConfig();
            config.rules.expiration = _.omit(config.rules.expiration, 'dod');
            config.rules.expiration = _.omit(config.rules.expiration, 'dod');
            var sites = ['DOD'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.DOD.sourceStampTime = moment(now - 3600001).format('YYYYMMDDHHmmss');
            var result = expirationRule._steps._isSiteDataStale(log, config, sites[0], simpleSyncStatus.sites.DOD);
            expect(result).toEqual(true);
        });
        it('Secondary site (HDR) not stale compared against config setting. Using sourceStampTime.', function() {
            var config = createConfig();
            var sites = ['HDR'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.HDR.sourceStampTime = moment(now - 110000).format('YYYYMMDDHHmmss');
            var result = expirationRule._steps._isSiteDataStale(log, config, sites[0], simpleSyncStatus.sites.HDR);
            expect(result).toEqual(false);
        });
        it('Secondary site (HDR) stale compared against config setting. Using sourceStampTime.', function() {
            var config = createConfig();
            var sites = ['HDR'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.HDR.sourceStampTime = moment(now - 120001).format('YYYYMMDDHHmmss');
            var result = expirationRule._steps._isSiteDataStale(log, config, sites[0], simpleSyncStatus.sites.HDR);
            expect(result).toEqual(true);
        });
        it('Secondary site (VLER) not stale compared against config setting. Using sourceStampTime.', function() {
            var config = createConfig();
            var sites = ['VLER'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.VLER.sourceStampTime = moment(now - 179000).format('YYYYMMDDHHmmss');
            var result = expirationRule._steps._isSiteDataStale(log, config, sites[0], simpleSyncStatus.sites.VLER);
            expect(result).toEqual(false);
        });
        it('Secondary site (VLER) stale compared against config setting. Using sourceStampTime.', function() {
            var config = createConfig();
            var sites = ['VLER'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.VLER.sourceStampTime = moment(now - 180000).format('YYYYMMDDHHmmss');
            var result = expirationRule._steps._isSiteDataStale(log, config, sites[0], simpleSyncStatus.sites.VLER);
            expect(result).toEqual(true);
        });
    });
    describe('removeUnwantedSecondarySiteEntry tests', function() {
        it('Patient is not synchronized.   Return all identifiers including DOD back.', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var simpleSyncStatus = createSimpleSyncStatusImmediatelyAfterStoredIds(sites);
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(sites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntry(log, config, 'DOD', patientIdentifiers, simpleSyncStatus);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Patient is not synchronized.   Return all identifiers including HDR back.', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var simpleSyncStatus = createSimpleSyncStatusImmediatelyAfterStoredIds(sites);
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(sites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntry(log, config, 'HDR', patientIdentifiers, simpleSyncStatus);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Patient is not synchronized.   Return all identifiers including VLER back.', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var simpleSyncStatus = createSimpleSyncStatusImmediatelyAfterStoredIds(sites);
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(sites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntry(log, config, 'VLER', patientIdentifiers, simpleSyncStatus);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Attempt to sync patient previously, DOD site has an error.  (Keep in list)', function() {
            var config = createConfig();
            var sites = ['DOD'];
            var resultSites = ['DOD'];
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, Date.now());
            simpleSyncStatus.hasError = true;
            simpleSyncStatus.syncCompleted = false;
            simpleSyncStatus.sites.DOD.hasError = true;
            simpleSyncStatus.sites.DOD.syncCompleted = false;
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntry(log, config, 'DOD', patientIdentifiers, simpleSyncStatus);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Patient is synchronized for some sites, DoD site there have been no jobs started for it (Implies need to sync it).', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites);
            simpleSyncStatus.syncCompleted = false;
            simpleSyncStatus.sites.DOD.latestJobTimestamp = '';
            simpleSyncStatus.sites.DOD.syncCompleted = false;
            var patientIdentifiers = createPatientIdentifiers(sites, Date.now());
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntry(log, config, 'DOD', patientIdentifiers, simpleSyncStatus);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Patient is synchronized for some sites, DOD site - the only job appears to be the enterprise-sync-request job. (Implies need to sync it).', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, Date.now());
            simpleSyncStatus.syncCompleted = false;
            simpleSyncStatus.sites.DOD.latestJobTimestamp = simpleSyncStatus.latestEnterpriseSyncRequestTimestamp;
            simpleSyncStatus.sites.DOD.syncCompleted = false;
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntry(log, config, 'DOD', patientIdentifiers, simpleSyncStatus);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Patient is synchronized for some sites, DOD site - there appears to be a job newer than the enterprise-sync-request job. (Implies do NOT sync it).', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = ['AAAA', 'BBBB', 'HDR', 'VLER'];
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, Date.now());
            simpleSyncStatus.syncCompleted = true;
            simpleSyncStatus.sites.DOD.sourceStampTime = moment(Date.now() + 60000).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.DOD.syncCompleted = true;
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntry(log, config, 'DOD', patientIdentifiers, simpleSyncStatus);
            expect(result).toEqual(patientIdentifiersExpected);
        });


        it('Attempt to sync patient previously, DOD Site is complete and is not stale.  (Remove from list)', function() {
            var config = createConfig();
            var sites = ['DOD', 'HDR'];
            var resultSites = ['HDR'];
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, Date.now());
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntry(log, config, 'DOD', patientIdentifiers, simpleSyncStatus);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Attempt to sync patient previously, DOD Site is complete and is stale.  (Keep in list)', function() {
            var config = createConfig();
            var sites = ['DOD', 'HDR'];
            var resultSites = ['DOD', 'HDR'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.DOD.sourceStampTime = moment(now - 90000).format('YYYYMMDDHHmmss');
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntry(log, config, 'DOD', patientIdentifiers, simpleSyncStatus);
            expect(result).toEqual(patientIdentifiersExpected);
        });
    });
    describe('removeUnwantedSecondarySiteEntries tests', function() {
        it('Attempt to sync patient previously, Force all secondary sites to sync.  (All sites kept in the list)', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, Date.now());
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntries(log, config, sites, patientIdentifiers, simpleSyncStatus, true);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Attempt to sync patient previously, Nothing forced and all are not stale  (All secondary sites removed from list.)', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = ['AAAA', 'BBBB'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.AAAA.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.BBBB.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.DOD.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.HDR.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.VLER.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntries(log, config, sites, patientIdentifiers, simpleSyncStatus, false);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Attempt to sync patient previously, HDR forced and all are not stale  (All secondary sites removed from list.)', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = ['AAAA', 'BBBB', 'HDR'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.AAAA.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.BBBB.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.DOD.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.HDR.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.VLER.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntries(log, config, sites, patientIdentifiers, simpleSyncStatus, 'HDR');
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Attempt to sync patient previously, DOD and HDR forced and all are not stale  (All secondary sites removed from list.)', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = ['AAAA', 'BBBB', 'DOD', 'HDR'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.AAAA.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.BBBB.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.DOD.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.HDR.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.VLER.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntries(log, config, sites, patientIdentifiers, simpleSyncStatus, ['DOD', 'HDR']);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Attempt to sync patient previously, VLER forced and all are not stale  (All secondary sites removed from list.)', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = ['AAAA', 'BBBB', 'VLER'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.AAAA.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.BBBB.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.DOD.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.HDR.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.VLER.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntries(log, config, sites, patientIdentifiers, simpleSyncStatus, ['VLER']);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Attempt to sync patient previously, Request DOD by itself and it is stale.  (Keep in the list)', function() {
            var config = createConfig();
            var sites = ['DOD'];
            var resultSites = ['DOD'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.DOD.sourceStampTime = moment(now - 90000).format('YYYYMMDDHHmmss');
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntries(log, config, sites, patientIdentifiers, simpleSyncStatus, undefined);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Attempt to sync patient previously, Request DOD by itself and it is not stale.  (Keep in the list)', function() {
            var config = createConfig();
            var sites = ['DOD'];
            var resultSites = [];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntries(log, config, sites, patientIdentifiers, simpleSyncStatus, undefined);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Attempt to sync patient previously, Request HDR by itself and it is stale.  (Keep in the list)', function() {
            var config = createConfig();
            var sites = ['HDR'];
            var resultSites = ['HDR'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.HDR.sourceStampTime = moment(now - 150000).format('YYYYMMDDHHmmss');
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntries(log, config, sites, patientIdentifiers, simpleSyncStatus, undefined);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Attempt to sync patient previously, Request HDR by itself and it is not stale.  (Keep in the list)', function() {
            var config = createConfig();
            var sites = ['HDR'];
            var resultSites = [];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntries(log, config, sites, patientIdentifiers, simpleSyncStatus, undefined);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Attempt to sync patient previously, Request VLER by itself and it is stale.  (Keep in the list)', function() {
            var config = createConfig();
            var sites = ['VLER'];
            var resultSites = ['VLER'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.VLER.sourceStampTime = moment(now - 200000).format('YYYYMMDDHHmmss');
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntries(log, config, sites, patientIdentifiers, simpleSyncStatus, undefined);
            expect(result).toEqual(patientIdentifiersExpected);
        });
        it('Attempt to sync patient previously, Request VLER by itself and it is not stale.  (Keep in the list)', function() {
            var config = createConfig();
            var sites = ['VLER'];
            var resultSites = [];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);
            var result = expirationRule._steps._removeUnwantedSecondarySiteEntries(log, config, sites, patientIdentifiers, simpleSyncStatus, undefined);
            expect(result).toEqual(patientIdentifiersExpected);
        });
    });
    describe('expiration tests', function() {
        it('Patient synchronized previously, Everything is up-to-date.  (All sites removed from the list)', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = [];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.AAAA.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.BBBB.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.DOD.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.HDR.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.VLER.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');

            var environment = createEnvironment(config);
            environment.jds._setResponseData([null], [{
                'statusCode': 200
            }], [simpleSyncStatus]);

            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);

            var finished = false;

            runs(function() {
                log.debug('Before calling expirationRule...');
                expirationRuleFunction(log, config, environment, patientIdentifiers, false, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toEqual(patientIdentifiersExpected);
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            });
        });
        it('JDS returns an error', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.AAAA.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.BBBB.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.DOD.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.HDR.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.VLER.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');

            var environment = createEnvironment(config);
            environment.jds._setResponseData(['error'], [null], [null]);

            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);

            var finished = false;

            runs(function() {
                log.debug('Before calling expirationRule...');
                expirationRuleFunction(log, config, environment, patientIdentifiers, false, function(error, result) {
                    expect(error).toBe('error');
                    expect(result).toEqual(patientIdentifiersExpected);
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            });
        });
        it('JDS returns no response', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.AAAA.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.BBBB.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.DOD.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.HDR.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.VLER.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');

            var environment = createEnvironment(config);
            environment.jds._setResponseData([null], [null], [null]);

            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);

            var finished = false;

            runs(function() {
                log.debug('Before calling expirationRule...');
                expirationRuleFunction(log, config, environment, patientIdentifiers, false, function(error, result) {
                    expect(error).toBe('JDS-NO-RESPONSE');
                    expect(result).toEqual(patientIdentifiersExpected);
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            });
        });
        it('JDS returns incorrect status code', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.AAAA.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.BBBB.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.DOD.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.HDR.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.VLER.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');

            var environment = createEnvironment(config);
            environment.jds._setResponseData([null], [{
                'statusCode': 404
            }], [null]);

            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);

            var finished = false;

            runs(function() {
                log.debug('Before calling expirationRule...');
                expirationRuleFunction(log, config, environment, patientIdentifiers, false, function(error, result) {
                    expect(error).toBe('JDS-WRONG-STATUS-CODE');
                    expect(result).toEqual(patientIdentifiersExpected);
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            });
        });
        it('JDS returns no result', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus.sites.AAAA.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.BBBB.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.DOD.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.HDR.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');
            simpleSyncStatus.sites.VLER.sourceStampTime = moment(now).format('YYYYMMDDHHmmss');

            var environment = createEnvironment(config);
            environment.jds._setResponseData([null], [{
                'statusCode': 200
            }], [null]);

            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);

            var finished = false;

            runs(function() {
                log.debug('Before calling expirationRule...');
                expirationRuleFunction(log, config, environment, patientIdentifiers, false, function(error, result) {
                    expect(error).toBe('JDS-NO-RESULT');
                    expect(result).toEqual(patientIdentifiersExpected);
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            });
        });
        it('JDS returns result with no sites', function() {
            var config = createConfig();
            var sites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var resultSites = ['AAAA', 'BBBB', 'DOD', 'HDR', 'VLER'];
            var now = Date.now();
            var simpleSyncStatus = createSimpleSyncStatusAllComplete(sites, now);
            simpleSyncStatus  = _.omit(simpleSyncStatus, 'sites');

            var environment = createEnvironment(config);
            environment.jds._setResponseData([null], [{
                'statusCode': 200
            }], [simpleSyncStatus]);

            var patientIdentifiers = createPatientIdentifiers(sites);
            var patientIdentifiersExpected = createPatientIdentifiers(resultSites);

            var finished = false;

            runs(function() {
                log.debug('Before calling expirationRule...');
                expirationRuleFunction(log, config, environment, patientIdentifiers, false, function(error, result) {
                    expect(error).toBeFalsy();
                    expect(result).toEqual(patientIdentifiersExpected);
                    finished = true;
                });
            });

            waitsFor(function() {
                return finished;
            });
        });
    });
});
