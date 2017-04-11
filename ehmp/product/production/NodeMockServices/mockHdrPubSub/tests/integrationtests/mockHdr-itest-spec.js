'use strict';

var request = require('request');
var _ = require('underscore');

var mocksVmIp = 'IP        ';
var mockHdrPort = '8999';

var testPatientLocalId = '0';
var testPatientStationNumber = '547';
var testPatientSiteHash = '76C6';
var querystring = require('querystring');
var config = require('../../config.js');
var domain = config.domains;
//var uuid = require('node-uuid');
var moment = require('moment');


var pubsubConfig = {
  "host": "IP        ",
  "port": 8999,
  "protocol": "http",
  "path": "repositories.med.DNS   /fpds/vpr/",
  "server": "HMPTest",
  "clientName": "eHMP",
  "_type": "json",
  "identifier": "USVHA",
  "extractSchema": "3.001",
  "maxBatchSize": 500,
  "timeout": 60000
};

function getHDRBaseUrl () {
    return pubsubConfig.protocol + '://' + pubsubConfig.host + ':' + pubsubConfig.port + '/' + pubsubConfig.path;
}

var queryParams = {
    server: pubsubConfig.server,
    _type: pubsubConfig._type,
    clientName: pubsubConfig.clientName
};

var requestId = 'ab6e882b-2c54-4434-9724-30c9f89d42bc';
var jobId = 'jobId';
var rootJobId = 'rootJobId';
var resolvedIdentifier = testPatientLocalId + '-' + testPatientStationNumber + '-USVHA';
var pid = testPatientSiteHash + ';' + testPatientLocalId;

function getUnsubscribeUrl() {
    var cleanUpParam = {
        resolvedIdentifier: resolvedIdentifier,
        requestId: requestId,
        clientRequestInitiationTime: moment().format()
    };
    return getHDRBaseUrl() + 'cancel?' + querystring.stringify(_.defaults(cleanUpParam, queryParams));
}

function getSubscribeUrl(domainList) {
    var subscribeParam = {
        resolvedIdentifier: resolvedIdentifier,
        requestId: requestId,
        clientRequestInitiationTime: moment().format(),
        rootJobId: rootJobId
    };
    if (domainList) {
        _.each(domainList, function(domain){
            subscribeParam['jobDomainId-'+ domain] = 'jobId-' + domain;
        });
        subscribeParam.HMPSVERS = 1;
    }
    else {
        subscribeParam.jobId = jobId;
    }
    return getHDRBaseUrl() + 'subscribe?' + querystring.stringify(_.defaults(subscribeParam, queryParams));
}

function getPollUrl() {
    var subscribeParam = {
        requestId: requestId,
        clientRequestInitiationTime: moment().format(),
        extractSchema: pubsubConfig.extractSchema,
        last: '3150120-500',
        max: pubsubConfig.maxBatchSize
    };
    return getHDRBaseUrl() + 'patientdata/' + testPatientStationNumber + '?' + querystring.stringify(_.defaults(subscribeParam, queryParams));
}
//Note: running this test will leave the test patient 0-547-USVHA in mockHdr's memory, but it won't be subscribed.

describe('mockHdr endpoint integration test', function() {
    var dummyUnsolicitedUpdateAllergy = {
        "lastUpdateTime": 20150811104725,
        "uid": "urn:va:allergy:" + testPatientSiteHash + ':' + testPatientLocalId + ":TEST",
    };

    //Steps must be done in order
    it('Smoke test: clean up test patient, subscribe patient to a site, poll for data, send unsolicited update, poll again, unsubscribe', function() {
        var cleanUpDone, done1, done2, done3, done4, done5 = false;
        //Clean up
        request.post({
            url: getUnsubscribeUrl(),
        }, function(error, response, body) {
            expect(error).toBeFalsy();
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(200);
            cleanUpDone = true;
        });

        waitsFor(function() {
            return cleanUpDone;
        });


        //Subscribe test patient
        request.post(getSubscribeUrl(), function(error, response, body) {
            expect(error).toBeFalsy();
            expect(response).toBeTruthy();
            var bodyJSON = JSON.parse(body);
            expect(bodyJSON.sites).toBeTruthy();
            expect(bodyJSON.sites[0].waitingPids).toContain(pid);

            done1 = true;
        });

        waitsFor(function() {
            return done1;
        });

        //Poll for patient data
        request(getPollUrl(), function(error, response, body) {
            expect(error).toBeFalsy();
            expect(response).toBeTruthy();
            var bodyJSON = JSON.parse(body);
            expect(bodyJSON.sites).toBeTruthy();
            expect(bodyJSON.sites[0].data).toBeTruthy();
            expect(bodyJSON.sites[0].data.items).toBeTruthy();
            expect(_.isEmpty(bodyJSON.sites[0].data.items)).toBe(false);
            done2 = true;
        });

        waitsFor(function() {
            return done2;
        });

        //Send unsolicited update data
        request.post({
            url: 'http://' + mocksVmIp + ':' + mockHdrPort + '/update',
            body: dummyUnsolicitedUpdateAllergy,
            json: true
        }, function(error, response, body) {
            expect(error).toBeFalsy();
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(201);
            done3 = true;
        });

        waitsFor(function() {
            return done3;
        });

        //Poll for unsolicited update
        request(getPollUrl(), function(error, response, body) {
            expect(error).toBeFalsy();
            expect(response).toBeTruthy();
            var bodyJSON = JSON.parse(body);
            expect(bodyJSON.sites).toBeTruthy();
            expect(bodyJSON.sites[0].data).toBeTruthy();
            expect(bodyJSON.sites[0].data.items).toBeTruthy();
            expect(_.isEmpty(bodyJSON.sites[0].data.items)).toBe(false);
            expect(_.find(bodyJSON.sites[0].data.items, function(item){
                if(!item.object){return false;}
                return item.object.uid === dummyUnsolicitedUpdateAllergy.uid;
            })).toBeTruthy();
            done4 = true;
        });

        waitsFor(function() {
            return done4;
        });

        //Unsubscribe
        request.post({
            url: getUnsubscribeUrl()
        }, function(error, response, body) {
            expect(error).toBeFalsy();
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(200);
            done5 = true;
        });

        waitsFor(function() {
            return done5;
        });
    });

    it('Version 1: Smoke test: clean up test patient, subscribe patient to a site, poll for data, send unsolicited update, poll again, unsubscribe', function() {
        var cleanUpDone, done1, done2, done3, done4, done5 = false;

        //Clean up
        request.post({
            url: getUnsubscribeUrl(),
        }, function(error, response, body) {
            expect(error).toBeFalsy();
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(200);
            cleanUpDone = true;
        });

        waitsFor(function() {
            return cleanUpDone;
        });

        //Subscribe test patient V1
        request.post(getSubscribeUrl(domain), function(error, response, body) {
            expect(error).toBeFalsy();
            expect(response).toBeTruthy();
            var bodyJSON = JSON.parse(body);
            expect(bodyJSON.sites).toBeTruthy();
            expect(bodyJSON.sites[0].waitingPids).toContain(pid);
            done1 = true;
        });

        waitsFor(function() {
            return done1;
        });

        //Poll for patient data
        request(getPollUrl(), function(error, response, body) {
            expect(error).toBeFalsy();
            expect(response).toBeTruthy();
            var bodyJSON = JSON.parse(body);
            expect(bodyJSON.sites).toBeTruthy();
            expect(bodyJSON.sites[0].data).toBeTruthy();
            expect(bodyJSON.sites[0].data.items).toBeTruthy();
            var items = bodyJSON.sites[0].data.items;
            expect(_.isEmpty(items)).toBe(false);
            var syncStartList = _.where(items, {collection: "syncStart"});
            expect(syncStartList).toBeTruthy();
            expect(syncStartList.length).toEqual(domain.length);
            done2 = true;
        });

        waitsFor(function() {
            return done2;
        });

        //Send unsolicited update data
        request.post({
            url: 'http://' + mocksVmIp + ':' + mockHdrPort + '/update',
            body: dummyUnsolicitedUpdateAllergy,
            json: true
        }, function(error, response, body) {
            expect(error).toBeFalsy();
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(201);
            done3 = true;
        });

        waitsFor(function() {
            return done3;
        });

        //Poll for unsolicited update
        request(getPollUrl(), function(error, response, body) {
            expect(error).toBeFalsy();
            expect(response).toBeTruthy();
            var bodyJSON = JSON.parse(body);
            expect(bodyJSON.sites).toBeTruthy();
            expect(bodyJSON.sites[0].data).toBeTruthy();
            expect(bodyJSON.sites[0].data.items).toBeTruthy();
            expect(_.isEmpty(bodyJSON.sites[0].data.items)).toBe(false);
            expect(_.find(bodyJSON.sites[0].data.items, function(item){
                if(!item.object){return false;}
                return item.object.uid === dummyUnsolicitedUpdateAllergy.uid;
            })).toBeTruthy();
            done4 = true;
        });

        waitsFor(function() {
            return done4;
        });

        //Unsubscribe
        request.post({
            url: getUnsubscribeUrl(),
        }, function(error, response, body) {
            expect(error).toBeFalsy();
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(200);
            done5 = true;
        });

        waitsFor(function() {
            return done5;
        });
    });
    it('Version 1: subscribe with specific domain or domain that does not exits', function() {
        var cleanUpDone, done1, done2, done3, done4, done5, done6, done7, done8 = false;
        var nonExistDomain = 'foo';
        var testDomain = domain.slice(0,2);
        var testDomain1 = domain.slice(0,2);
        testDomain1.push(nonExistDomain);

        //Clean up
        request.post({
            url: getUnsubscribeUrl(),
        }, function(error, response, body) {
            expect(error).toBeFalsy();
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(200);
            cleanUpDone = true;
        });

        waitsFor(function() {
            return cleanUpDone;
        });

        //Subscribe test patient V1 with two domains
        request.post(getSubscribeUrl(testDomain), function(error, response, body) {
            expect(error).toBeFalsy();
            expect(response).toBeTruthy();
            var bodyJSON = JSON.parse(body);
            expect(bodyJSON.sites).toBeTruthy();
            expect(bodyJSON.sites[0].waitingPids).toContain(pid);
            done1 = true;
        });

        waitsFor(function() {
            return done1;
        });

        //Poll for patient data
        request(getPollUrl(), function(error, response, body) {
            expect(error).toBeFalsy();
            expect(response).toBeTruthy();
            var bodyJSON = JSON.parse(body);
            expect(bodyJSON.sites).toBeTruthy();
            expect(bodyJSON.sites[0].data).toBeTruthy();
            expect(bodyJSON.sites[0].data.items).toBeTruthy();
            var items = bodyJSON.sites[0].data.items;
            expect(_.isEmpty(items)).toBe(false);
            var syncStartList = _.where(items, {collection: "syncStart"});
            expect(syncStartList).toBeTruthy();
            expect(syncStartList.length).toEqual(testDomain.length);
            done2 = true;
        });

        waitsFor(function() {
            return done2;
        });

        //Unsubscribe
        request.post({
            url: getUnsubscribeUrl(),
        }, function(error, response, body) {
            expect(error).toBeFalsy();
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(200);
            done5 = true;
        });

        waitsFor(function() {
            return done5;
        });

        //Subscribe test patient V1 with a domain does not exit
        request.post(getSubscribeUrl(testDomain1), function(error, response, body) {
            expect(error).toBeFalsy();
            expect(response).toBeTruthy();
            var bodyJSON = JSON.parse(body);
            expect(bodyJSON.sites).toBeTruthy();
            expect(bodyJSON.sites[0].waitingPids).toContain(pid);
            done6 = true;
        });

        waitsFor(function() {
            return done6;
        });

        //Poll for patient data
        request(getPollUrl(), function(error, response, body) {
            expect(error).toBeFalsy();
            expect(response).toBeTruthy();
            var bodyJSON = JSON.parse(body);
            expect(bodyJSON.sites).toBeTruthy();
            expect(bodyJSON.sites[0].data).toBeTruthy();
            expect(bodyJSON.sites[0].data.items).toBeTruthy();
            var items = bodyJSON.sites[0].data.items;
            expect(_.isEmpty(items)).toBe(false);
            var syncStartList = _.where(items, {collection: "syncStart"});
            expect(syncStartList).toBeTruthy();
            expect(syncStartList.length).toEqual(testDomain1.length);
            console.log(syncStartList);
            // now verify that foo domain does not have any metaStamp information.
            var nonExistSyncStart = _.findWhere(syncStartList, {jobId: 'jobId-' + nonExistDomain});
            console.log(nonExistSyncStart);
            expect(_.isObject(nonExistSyncStart)).toBeTruthy();
            console.log(nonExistSyncStart);
            // var eventMetaStamp = nonExistSyncStart.metaStamp.sourceMetaStamp[siteId].domainMetaStamp[domain].eventMetaStamp;
            // expect(eventMetaStamp).toBeDefined();
            // expect(_.isEmpty(eventMetaStamp)).toBeTruthy();
            done7 = true;
        });

        waitsFor(function() {
            return done7;
        });
        //Unsubscribe
        request.post({
            url: getUnsubscribeUrl(),
        }, function(error, response, body) {
            expect(error).toBeFalsy();
            expect(response).toBeTruthy();
            expect(response.statusCode).toBe(200);
            done8 = true;
        });

        waitsFor(function() {
            return done8;
        });
    });
});