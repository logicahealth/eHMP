'use strict';

var yargs = require('yargs');
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var moment = require('moment');
var fs = require('fs');
var config = require('./config');

var log = require('bunyan').createLogger(config.logger);

var port = config.port;

log.debug('mockHdr: Starting up...');

var app = express();

var stationNumbersToSiteHash = {};

var sites = initializeSites();
//Example of sites structure:
/*
sites = {
    '84F0': {
        'stationNumber': 578,
        'siteId': '84F0',
        '_lastUpdate': {
            prefix: '3',
            moment: moment().format('YYMMDD'),
            hits: 0
        },
        'domain': 'RAPHAEL.VISTACORE.US',
        'lastUpdate': 0,
        'updated': moment().format('YYYYMMDDHHmmss'),
        'waitingPids': [],
        'processingPids': [],
        'waitingIcns': [],
        'waitingPollData': [],
        'patientsSubscribed': {
            '1-578-USVHA': {
                'identifier': '1-578-USVHA',
                'pid': '84F0;1',
                'domainsSynced': {
                    'allergy': '20150826121648'
                }
            }
        }
    }
}
*/

var domains = config.domains || ['allergy', 'patient'];

process.on('exit', function() {
    saveAndExit();
});

process.on('SIGINT', function() {
    saveAndExit();
});

process.on('SIGQUIT', function() {
    saveAndExit();
});

process.on('SIGTERM', function() {
    saveAndExit();
});

app.use(bodyParser.json());

app.get('/ping', function(req, res) {
    res.send('pong');
});

//HDR interface
//Subscribe
app.post('/repositories.URL       /fpds/vpr/subscribe', [validateSubscribeParams, handleSubscribe]);
//Poll
app.get('/repositories.URL       /fpds/vpr/patientdata/:siteId', [validatePollParams, handlePoll]);
//Unsubscribe
app.post('/repositories.URL       /fpds/vpr/cancel', [validateUnsubscribeParams, handleUnsubscribe]);

//Not part of the real HDR interface
//Clear all subscriptions
app.post('/repositories.URL       /fpds/vpr/cancel/all', handleUnsubscribeAll);
//Unsolicited update
app.post('/update', [validateUnsolicitedUpdate, handleUnsolicitedUpdate]);

app.listen(port);
log.debug('mockHdr: Listening on port %s', port);

function initializeSites() {
    var sites;
    log.debug('Checking if save data file exists...');
    try {
        sites = require(config.saveDataPath + '/data');
        if (sites) {
            log.debug('Successfully loaded subscription data.');
        }
    } catch (e) {
        log.debug('Could not open save data file. (Got error: %s) Initializing data...', e);
        sites = require('./initializeData');

        _.each(sites, function(site) {
            site._lastUpdate = {
                prefix: '3',
                moment: moment().format('YYMMDD'),
                hits: 0
            };
            site.updated = moment().format('YYYYMMDDHHmmss');

            site.lastUpdate = getLastUpdate(site);
        });
    }

    _.each(sites, function(site) {
        stationNumbersToSiteHash[site.stationNumber] = site.siteId;
    });

    log.debug('Sites: %s', JSON.stringify(sites));
    return sites;
}

function saveAndExit() {
    try {
        fs.writeFileSync(config.saveDataPath + '/data.json', JSON.stringify(sites));
    } catch (e) {
        log.debug('Error: Could not save data. Got: %s', e);
    }

    process.exit();
}

function getLastUpdate(site) {
    var lastUpdate = site._lastUpdate;
    return lastUpdate.prefix + lastUpdate.moment.toString() + '-' + lastUpdate.hits;
}

function validateCommonRequestParams(req, res) {
    if (!req.param('server')) { // checking the server parameter
        res.status(400).send('Missing required parameter: \'server\'');
        return false;
    }
    if (!req.param('clientName')) { // checking the clientName parameter
        res.status(400).send('Missing required parameter: \'clientName\'');
        return false;
    }
    if (!req.param('requestId')) {
        res.status(400).send('Missing required parameter: \'requestId\'');
        return false;
    }
    if (!req.param('clientRequestInitiationTime')) {
        res.status(400).send('Missing required parameter: \'clientRequestInitiationTime\'');
        return false;
    }
    return true;
}

function validateSubscribeParams(req, res, next) {
    if (!validateCommonRequestParams(req, res)) {
        return;
    }
    if (!req.param('resolvedIdentifier') || !verifyResolvedIdentifier(req.param('resolvedIdentifier'))) {
        return res.status(400).send('Missing patient identifier in format DFN-StationNumber-USVHA');
    }
    if (!req.param('rootJobId')) {
        return res.status(400).send('Missing required parameter: \'rootJobId\'');
    }
    // logic to handle the version information
    if (hasVersionInfo(req)) {
        var jobDomainId = getJobDomainId(req);
        if (_.isEmpty(jobDomainId)) {
            return res.status(400).send('Missing required parameter: \'jobDomainId-domain\'');
        }
    }
    else if (!req.param('jobId')) {
        return res.status(400).send('Missing required parameter: \'jobId\'');
    }

    next();
}

// Utility function to check if there is any domain job id information
function hasVersionInfo(req) {
    return req.param('HMPSVERS');
}

// this function will look up for jobDomainId-<domain> params in req.params, body, and query
function getJobDomainId(req) {
    var jobDomainId = {};
    var domainPrefix = 'jobDomainId-';
    _.each([req.params, req.body, req.query], function(reqParam){
        _.each(reqParam, function(val, key){
            if (key.substring(0, domainPrefix.length) === domainPrefix) {
                var domainName = key.substring(domainPrefix.length);
                jobDomainId[domainName] = val;
            }
        });
    });
    return jobDomainId;
}

function verifyResolvedIdentifier(resolvedIdentifier) {
    return /^[0-9]+-[0-9]+-USVHA/.test(resolvedIdentifier);
}

function extractStationNumberFromResolvedIdentifier(resolvedIdentifier) {
    return resolvedIdentifier.split('-')[1];
}

function extractDfnFromResolvedIdentifier(resolvedIdentifier) {
    return resolvedIdentifier.split('-')[0];
}

function extractSiteHashFromPid(pid) {
    return pid.split(';')[0];
}

function handleSubscribe(req, res) {
    var patientId = req.param('resolvedIdentifier');
    var clientName = req.param('clientName');
    log.debug('mockHdr: subscribe patient %s, client: %s', patientId, clientName);

    var stationNumber = extractStationNumberFromResolvedIdentifier(patientId);

    var siteHash = stationNumbersToSiteHash[stationNumber];

    if(!siteHash){
        return res.status(404).send('Site with station number ' + stationNumber + ' not found. Cannot subscribe patient ' + patientId);
    }
    var rootJobId = req.param('rootJobId');
    var jobId = req.param('jobId') || getJobDomainId(req);
    var mockResponse = {};
    var site = sites[siteHash];
    if (jobId) {
        log.debug('mockHdr: subscribe patient %s, rootJobId: %s, jobId: %j', patientId, rootJobId, jobId);

        mockResponse = {
            sites: [subscribePatientToMockSite(req, site, patientId, rootJobId, jobId)]
        };
    }
    res.json(mockResponse);
}


function subscribePatientToMockSite(req, site, identifier, rootJobId, jobId) {
    var siteId = site.siteId;
    var localId = extractDfnFromResolvedIdentifier(identifier);
    var pid = siteId + ';' + localId;

    if ( /*patientIsAtSite(siteId) && */ !site.patientsSubscribed[identifier]) {
        var newPatientObj = {};
        newPatientObj.pid = pid;
        newPatientObj.identifier = identifier;
        newPatientObj.domainsSynced = {};
        newPatientObj.localId = localId;
        newPatientObj.isSubscribed = true;
        newPatientObj.rootJobId = rootJobId;
        newPatientObj.jobId = jobId;
        site.patientsSubscribed[identifier] = newPatientObj;
        site.waitingPids.push(newPatientObj.pid);
        site.waitingIcns.push(identifier);

        log.debug('mockHdr.subscribePatientToMockSite: generated and subscribed new patient identifier %s for site %s', identifier, siteId);
        return constructMockSubscribeResponse(req, site, pid);
    } else /*if*/ {
        log.debug('mockHdr: subscribed patient identifier %s that exists on site %s.', identifier, siteId);
        if (!_.contains(site.waitingIcns, identifier)) {
            site.patientsSubscribed[identifier].isSubscribed = true;
            site.patientsSubscribed[identifier].rootJobId = rootJobId;
            site.patientsSubscribed[identifier].jobId = jobId;
            site.waitingPids.push(site.patientsSubscribed[identifier].pid);
            site.waitingIcns.push(site.patientsSubscribed[identifier].identifier);
        }
        return constructMockSubscribeResponse(req, site, site.patientsSubscribed[identifier].pid);
    }
    /*else  {
           //Patient is not at this site
           return {apiVersion: '1.0', error: { message: 'Patient not found' }};
       }*/

    log.debug('mockHdr.handleSubscribe: Patients currently subscribed to site %s: %s', site.siteId, _.filter(site.patientsSubscribed, function(patient) {
        return patient.isSubscribed;
    }).map(function(patient) {
        return patient.identifier;
    }));
}

function constructMockSubscribeResponse(req, site, pid) {
    return {
        apiVersion: "1.0",
        location: "/hmp/subscription/" + req.param('server') + '/patient/' + pid,
        waitingPids: site.waitingPids,
        processingPids: site.processingPids,
        remainingObjects: 0
    };
}

function validatePollParams(req, res, next) {
    if (!validateCommonRequestParams(req, res)) {
        return;
    }
    if (!req.param('extractSchema')) {
        return res.status(400).send('Missing required parameter: \'extractSchema\'');
    }
    if (!req.param('last')) {
        return res.status(400).send('Missing required parameter: \'last\'');
    }
    if (!req.param('max')) {
        return res.status(400).send('Missing required parameter: \'max\'');
    }
    if (!req.param('siteId')) {
        return res.status(400).send('Missing required parameter: \'siteId\'');
    }

    next();
}

function handlePoll(req, res) {
    //log.debug('mockHdr: poll site with station number %s', req.param('siteId'));

    var siteHash = stationNumbersToSiteHash[req.param('siteId')];

    if (!siteHash) {
        res.status(404).send('Site with station number ' + req.param('siteId') + ' not found.');
        return;
    }

    var mockResponse = {
        sites: [getSyncDataFromMockSite(sites[siteHash])]
    };

    res.json(mockResponse);
}

function getSyncDataFromMockSite(site) {
    var dataForAllWaitingPids = [];
    _.each(site.waitingIcns, function(identifier) {
        dataForAllWaitingPids = dataForAllWaitingPids.concat(getSyncDataForPatient(site.patientsSubscribed[identifier], site));
    });

    dataForAllWaitingPids = dataForAllWaitingPids.concat(site.waitingPollData);

    site.waitingIcns = [];
    site.waitingPids = [];
    site.waitingPollData = [];

    return {
        apiVersion: '1.0',
        params: {
            domain: site.domain,
            systemId: site.siteId
        },
        data: {
            updated: site.updated,
            totalItems: dataForAllWaitingPids.length,
            lastUpdate: site.lastUpdate,
            waitingPids: site.waitingPids,
            processingPids: site.processingPids,
            remainingObjects: 0,
            items: dataForAllWaitingPids
        }
    };
}

function getSyncDataForPatient(patient, site) {
    var messageTriad = [];
    var patientData = [];
    var siteId = site.siteId;

    var stampTime = moment().format('YYYYMMDDHHmmss'); //FUTURETODO: Figure out whether this is supposed to equal lastUpdateTime...
    var metaStamp = {};

    log.debug('mockHdr.getSyncDataForPatient: Generating syncStatus object for patient %s', patient.pid);
    var syncStatusObject = generateSyncStatusTemplate(patient, siteId);

    log.debug('mockHdr.getSyncDataForPatient: Generating syncStart object for patient %s', patient.pid);
    var syncStartObject = {};
    if (!_.isObject(patient.jobId)) {
        metaStamp = generateMetaStamp(stampTime, patient, siteId);
        syncStartObject = generateSyncStartTemplate(patient, siteId);

        if (_.isEmpty(patient.domainsSynced)) {
            log.debug('mockHdr.getSyncDataForPatient: Including demographics object in syncStart message for patient %s', patient.pid);
            addDemographicDataForSyncStart(patient, site, syncStartObject);
        }

        _.each(domains, function(domain) {
            if (!patient.domainsSynced[domain] || domain === 'patient') {
                log.debug('mockHdr.getSyncDataForPatient: Getting %s data for patient %s', domain, patient.pid);
                addDomainDataAndMetaStamp(stampTime, patient, site, domain, metaStamp, patientData, syncStatusObject);
            }
        });

        syncStartObject.metaStamp = metaStamp;
        log.debug('mockHdr.getSyncDataForPatient: Compiling final poll response for patient %s', patient.pid);
        messageTriad.push(syncStartObject);
    }
    else {
        _.each(patient.jobId, function(jobId, domain){
            metaStamp = generateMetaStamp(stampTime, patient, siteId);
            syncStartObject = generateSyncStartTemplate(patient, siteId, jobId);
            if (_.isEmpty(patient.domainsSynced)) {
                log.debug('mockHdr.getSyncDataForPatient: Including demographics object in syncStart message for patient %s', patient.pid);
                addDemographicDataForSyncStart(patient, site, syncStartObject);
            }
            if (!patient.domainsSynced[domain] || domain === 'patient') {
                log.debug('mockHdr.getSyncDataForPatient: Getting %s data for patient %s', domain, patient.pid);
                addDomainDataAndMetaStamp(stampTime, patient, site, domain, metaStamp, patientData, syncStatusObject);
            }
            syncStartObject.metaStamp = metaStamp;
            messageTriad.push(syncStartObject);
        });
    }

    _.each(patientData, function(item) {
        messageTriad.push(item);
    });
    messageTriad.push(syncStatusObject);

    return messageTriad;
}

function addDemographicDataForSyncStart(patient, site, syncStartObject) {
    var demographicsTemplate = require('./data/templates/patient');
    var demographicsData = JSON.parse(JSON.stringify(demographicsTemplate));
    fillInObjectData(demographicsData.object, patient, site, 'patient');
    syncStartObject.object = demographicsData.object;
}

function addDomainDataAndMetaStamp(stampTime, patient, site, domain, metaStamp, patientData, syncStatusObject) {
    var siteId = site.siteId;
    var domainTemplate;
    try {
        domainTemplate = require('./data/templates/' + domain);
    } catch (e){
        //   not needed,  not an error
        // log.info('Error getting data for domain: %s: error: %s , Sending and empty metaStamp indicating that there is no data for that domain', domain, e);
        // send out empty domainStamp
        metaStamp.sourceMetaStamp[siteId].domainMetaStamp[domain] = getDomainMetaStamp(stampTime, domain);
        patient.domainsSynced[domain] = stampTime;
        return;
    }

    var domainData = JSON.parse(JSON.stringify(domainTemplate));
    fillInCollectionData(domainData, patient, siteId);
    fillInObjectData(domainData.object, patient, site, domain);
    domainData.object.stampTime = domainData.object.lastUpdateTime.toString();
    var domainMetaStamp = getDomainMetaStamp(stampTime, domain, domainData.object);

    metaStamp.sourceMetaStamp[siteId].domainMetaStamp[domain] = domainMetaStamp;
    patientData.push(domainData);
    patient.domainsSynced[domain] = stampTime;
    syncStatusObject.object.domainTotals[domain] = 1;
}

function fillInCollectionData(data, patient, siteId) {
    if (data.pid) {
        data.pid = patient.pid;
    }
    if (data.systemId) {
        data.systemId = siteId;
    }
    if (data.localId) {
        data.localId = patient.localId;
    }
}

function fillInObjectData(data, patient, site, domain) {
    var patientLocalId = patient.localId;
    var siteId = site.siteId;

    if (data.pid) {
        data.pid = patient.pid;
    }
    if (data.systemId) {
        data.systemId = siteId;
    }

    if (data.comments) {
        _.each(data.comments, function(comment) {
            if (comment.enteredByUid) {
                comment.enteredByUid = fixSiteInUid(comment.enteredByUid, siteId);
            }

            if (comment.enteredByCode) {
                comment.enteredByCode = fixSiteInUid(comment.enteredByCode, siteId);
            }
        });
    }

    if (data.locationUid) {
        data.locationUid = fixSiteInUid(data.locationUid, siteId);
    }

    if (data.facilityCode) {
        data.facilityCode = site.stationNumber;
    }

    if (data.providers) {
        _.each(data.providers, function(provider) {
            provider.providerUid = fixSiteInUid(provider.providerUid, siteId);
        });
    }

    if (data.orderUid) {
        data.orderUid = fixSiteAndDfnInUid(data.orderUid, patientLocalId, siteId);
    }

    if (data.encounterUid) {
        data.encounterUid = fixSiteAndDfnInUid(data.encounterUid, patientLocalId, siteId);
    }

    if (data.text) {
        _.each(data.text, function(text) {
            if (text.clinicians) {
                _.each(text.clinicians, function(clinician) {
                    clinician.uid = fixSiteInUid(clinician.uid, siteId);
                    clinician.summary = fixSiteInUid(clinician.summary, siteId);
                });
            }
            text.summary = fixSiteAndDfnInUid(text.summary, patientLocalId, siteId);
            text.uid = fixSiteAndDfnInUid(text.uid, patientLocalId, siteId);
        });
    }

    if (data.clinicians) {
        _.each(data.clinicians, function(clinician) {
            clinician.uid = fixSiteInUid(clinician.uid, siteId);
            clinician.summary = fixSiteInUid(clinician.summary, siteId);
        });
    }

    if (data.documentDefUid) {
        data.documentDefUid = fixSiteInUid(data.documentDefUid, siteId);
    }

    if (data.locationUid) {
        data.locationUid = fixSiteInUid(data.locationUid, siteId);
    }

    if (data.performerUid) {
        data.performerUid = fixSiteInUid(data.performerUid, siteId);
    }

    if (data.providerUid) {
        data.providerUid = fixSiteInUid(data.providerUid, siteId);
    }

    if (data.results) {
        _.each(data.results, function(result) {
            result.uid = fixSiteAndDfnInUid(result.uid, patientLocalId, siteId);
        });
    }

    if (data.groupUid) {
        data.groupUid = fixSiteInUid(data.groupUid, siteId);
    }

    if (data.orders) {
        _.each(data.orders, function(order) {
            order.locationUid = fixSiteInUid(order.locationUid, siteId);
            order.orderUid = fixSiteAndDfnInUid(order.orderUid, patientLocalId, siteId);
            order.pharmacistUid = fixSiteInUid(order.pharmacistUid, siteId);
            order.providerUid = fixSiteInUid(order.providerUid, siteId);
        });
    }

    if (data.facility && domain === 'patient') {
        var facility = _.find(data.facility, function(facility) {
            return facility.code === 451;
        });

        if (facility) {
            facility.code = site.stationNumber;
            facility.localPatientId = patientLocalId;
            facility.systemId = siteId;
        }
    }

    if (data.teamInfo && data.teamInfo.team) {
        data.teamInfo.team.uid = fixSiteInUid(data.teamInfo.team.uid, siteId);
    }

    var localId;
    if (domain === 'patient') {
        localId = patientLocalId;
        data.localId = localId;
    } else {
        localId = _.last(data.uid.split(':'));
    }

    var uid = getUidForPidAndDomain(patient.pid, domain, localId);
    data.uid = uid;
}

function fixSiteInUid(uid, siteId) {
    return uid.replace(/ABCD/, siteId);
}

function fixSiteAndDfnInUid(uid, patientLocalId, siteId) {
    return uid.replace(/ABCD:[0-9]+/, siteId + ':' + patientLocalId);
}

function getUidForPidAndDomain(pid, domain, localId) {
    return 'urn:va:' + domain + ':' + pid.replace(/;/, ':') + ':' + localId;
}

function validateUnsubscribeParams(req, res, next) {
    if (!validateCommonRequestParams(req, res)) {
        return;
    }
    if (!req.param('resolvedIdentifier') || !verifyResolvedIdentifier(req.param('resolvedIdentifier'))) {
        return res.status(400).send('Missing patient identifier in format DFN-StationNumber-USVHA');
    }
    next();
}

function handleUnsubscribe(req, res) {
    var patientId = req.param('resolvedIdentifier');
    log.debug('mockHdr: unsubscribe patient %s', patientId);
    var site = sites[stationNumbersToSiteHash[extractStationNumberFromResolvedIdentifier(patientId)]];
    var mockResponse = {
        sites: [unsubscribePatient(site, patientId)]
    };

    res.json(mockResponse);
}

function unsubscribePatient(site, identifier) {
    log.debug('mockHdr.unsubscribePatient: unsubscribing patient with identifier %s from site %s', identifier, site.siteId);
    var patient = site.patientsSubscribed[identifier];
    if (patient) {
        patient.domainsSynced = {};
        patient.isSubscribed = false;
        site.waitingPids = _.without(site.waitingPids, patient.pid);
        site.waitingIcns = _.without(site.waitingIcns, patient.identifier);
        site.waitingPollData = _.filter(site.waitingPollData, function(item){return item.pid !== patient.pid;});
        log.debug('mockHdr.unsubscribePatient: Remaining patients at site %s: %s', site.siteId, _.filter(site.patientsSubscribed, function(patient) {
            return patient.isSubscribed;
        }).map(function(patient) {
            return patient.identifier;
        }));
    } else {
        log.debug('mockHdr.unsubscribePatient: patient with identifier %s doesn\'t exist at site %s', identifier, site);
    }
    return {
        'apiVersion': '1.0',
        'sucess': true
    };
}

function handleUnsubscribeAll(req, res) {
    log.debug('mockHdr: unsubscribe all patients from all sites');
    _.each(sites, function(site) {
        _.each(site.patientsSubscribed, function(patient) {
            unsubscribePatient(site, patient.identifier);
        });
    });

    res.send('All patients unsubscribed.');
}

function validateUnsolicitedUpdate(req, res, next) {
    var data = req.body;
    if (!data) {
        return res.status(400).send('Invalid or empty JSON data recieved in POST message body');
    } else if (!data.uid) {
        return res.status(400).send('Missing uid in POST message body');
    } else if(!isValidUid(data.uid)){
        return res.status(400).send('invalid uid in POST message body: ' + data.uid);
    }

    var pid = extractPidFromUid(data.uid);
    var siteHash = extractSiteHashFromPid(pid);
    var site = sites[siteHash];
    if (!site) {
        return res.status(400).send('pid does not correspond to any configured mock HDR site');
    }

    var patientsSubscribed = site.patientsSubscribed;
    var resolvedIdentifier = _.findKey(patientsSubscribed, function(patient) {
        return patient.pid === pid;
    });

    var patient = patientsSubscribed[resolvedIdentifier];

    if (!resolvedIdentifier || !patient.isSubscribed) {
        return res.status(400).send('patient with pid ' + pid + ' has not been subscribed');
    }

    var domain = extractDomainFromUid(data.uid);
    if (!_.contains(domains, domain)) {
        return res.status(400).send('domain ' + domain + ' is not present in the list of configured HDR domains');
    }

    req.site = site;
    req.patient = patient;
    req.dataDomain = domain;

    next();
}

function extractDomainFromUid(uid) {
    var domain = uid.split(':')[2];
    return domain;
}

function extractPidFromUid(uid){
    var uidParts = uid.split(':');
    return uidParts[3] + ';' + uidParts[4];
}

function isValidUid(uid){
    return /^urn:va:\w*:([0-9]|[A-F]){4}:[0-9]*:[\s\S]+/.test(uid);
}

function handleUnsolicitedUpdate(req, res) {
    var data = req.body;
    var newLastUpdateTime = moment().format('YYYYMMDDHHmmss');
    data.lastUpdateTime = newLastUpdateTime;

    var patient = req.patient;
    var siteId = req.site.siteId;
    var domain = req.dataDomain;

    var metaStamp = generateMetaStamp(newLastUpdateTime, patient, siteId, domain, data);
    var collectionWrapper = getCollectionWrapper(domain, patient, siteId, 1, 1);
    collectionWrapper.object = data;
    var syncStart = generateSyncStartTemplate(patient, siteId);
    syncStart.metaStamp = metaStamp;
    var syncStatus = generateSyncStatusTemplate(patient, siteId, domain);

    req.site.waitingPollData.push(syncStart);
    req.site.waitingPollData.push(collectionWrapper);
    req.site.waitingPollData.push(syncStatus);

    res.status(201).send();
}

function getCollectionWrapper(domain, patient, siteId, seq, total) {
    return {
        collection: domain,
        pid: patient.pid,
        systemId: siteId,
        localId: patient.localId,
        seq: seq,
        total: total,
        object: {}
    };
}

function generateMetaStamp(stampTime, patient, siteId, domain, data) {
    var metaStamp = {
        icn: null,
        stampTime: stampTime,
        sourceMetaStamp: {}
    };

    metaStamp.sourceMetaStamp[siteId] = getSourceMetaStamp(stampTime, patient, domain, data);
    return metaStamp;
}

//Variadic function: domain and data are optional parameters.
//                   Include them when the sourceMetaStamp is only for 1 patient data object, as in an unsolicited update.
//                   otherwise, domainMetaStamp needs to be filled in seperately for each domain
function getSourceMetaStamp(stampTime, patient, domain, data) {
    var sourceMetaStamp = {
        pid: patient.pid,
        localId: patient.localId,
        stampTime: stampTime,
        domainMetaStamp: {}
    };

    if(domain && data){
        sourceMetaStamp.domainMetaStamp[domain] = getDomainMetaStamp(stampTime, domain, data);
    }

    return sourceMetaStamp;
}

function getDomainMetaStamp(stampTime, domain, data) {
    return {
        domain: domain,
        stampTime: stampTime,
        eventMetaStamp: data ? getEventMetaStamp(data) : {}
    };
}

function getEventMetaStamp(dataObject) {
    var eventMetaStamp = {};
    eventMetaStamp[dataObject.uid] = {
        stampTime: dataObject.lastUpdateTime.toString()
    };
    return eventMetaStamp;
}

//Note: this returns an incomplete sync start object; The 'metaStamp' and 'object' attributes need to be set seperately.
function generateSyncStartTemplate(patient, siteId, jobId) {
    return {
        collection: 'syncStart',
        pid: patient.pid,
        systemId: siteId,
        localId: patient.localId,
        icn: null,
        rootJobId: patient.rootJobId,
        jobId: jobId || patient.jobId,
        seq: 1,
        total: 1
    };
}

//Variadic function: domain is an optional parameter;
//                   include when the syncStatus is only intended for 1 patient data object, as in an unsolicited update
//                   otherwise domainTotals will need to be seperately filled in for each domain
function generateSyncStatusTemplate(patient, siteId, domain) {
    var object = {
        domainTotals: {},
        initialized: true,
        uid: 'urn:va:syncStatus:' + patient.pid.replace(/;/, ':') + ':H4680'
    };

    if(domain){
        object.domainTotals[domain] = 1;
    }

    return {
        collection: 'syncStatus',
        pid: patient.pid,
        systemId: siteId,
        localId: patient.localId,
        //icn: patient.icn,
        seq: 1,
        total: 1,
        object: object
    };
}