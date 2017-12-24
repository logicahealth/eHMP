'use strict';

require('../../../env-setup');

var clearPatientUtil = require(global.VX_UTILS + 'clear-patient-util');

var log = require(global.VX_DUMMIES + '/dummy-logger');
// NOTE: be sure next lines are commented out before pushing
// var logUtil = require(global.VX_UTILS + 'log');
// log = logUtil._createLogger({
//     name: 'test',
//     level: 'debug',
//     child: logUtil._createLogger
// });

var _ = require('underscore');
var async = require('async');
var request = require('request');

var config = require(global.VX_ROOT + 'worker-config');
var testConfig = require(global.VX_INTTESTS + 'test-config');
var host = testConfig.vxsyncIP;
var syncApiPort = testConfig.vxsyncPort;
var val = require(global.VX_UTILS + 'object-utils').getProperty;

var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var solrSmartClient = require('solr-smart-client');
var VistaClient = require(global.VX_SUBSYSTEMS + 'vista/vista-client');
var HdrClient = require(global.VX_SUBSYSTEMS + 'hdr/hdr-client');
var VxSyncForeverAgent = require('http').Agent;

var solrRecord = {
    'uid': 'urn:va:ehmp-activity:SITE:19:29fe0301-14ac-4d8d-95a9-9f538866beba',
    'pid': 'SITE;19',
    'domain': 'ehmp-activity',
    'subDomain': 'consult',
    'consult_name': 'Rheumatology',
    'consult_orders_override_reason': 'Question 2 Override reason...This could also be used for a Lab override reason.\nThis is updated after the Lab results were received...',
    'consult_orders_order_result_comment': 'This is an explanation for Rheumatiod Factor to explain the Satisfied response.\nThis is updated after the Lab results were received',
    'consult_orders_conditions': [
        'Hyperlipidemia Icd 9 Cm 272 4',
        'Diabetes Mellitus'
    ],
    'consult_orders_request': 'This is the Reason for request (Request) entry',
    'consult_orders_comment': [
        'This is the Comment (clinical history) entry',
        'This is the Comment (clinical history) entry'
    ],
    'consult_orders_accepting_provider_uid': 'urn:va:user',
    'consult_orders_accepting_provider_display_name': '',
    'consult_orders_order_results_order_name': [
        'C Reactive Protein',
        'Rheumatoid Factor'
    ],
    'consult_orders_order_results_order_status': [
        'urn:va:order-status:comp',
        'Satisfied'
    ]
};

var solrQuery = {
    'q': 'Rheu*',
    'fq': 'pid:SITE;19'
};

/*
    *** Note ***
    This test requires a patient to be synced before it can test the utility.
    The patient used here is SITE;19.
    This patient will be unsynced after the test runs.
 */

describe('clearPatientUtil', function() {
    it('clearPatient', function() {

        var pid = 'SITE;19';
        var solrDocumentUid = 'urn:va:ehmp-activity:SITE:19:29fe0301-14ac-4d8d-95a9-9f538866beba';
        var identifiers;
        var jpid;

        var environment = {
            vistaClient: new VistaClient(log, log, config, null),
            jds: new JdsClient(log, log, config),
            solr: solrSmartClient.createClient(log, config.solrClient, new VxSyncForeverAgent({keepAlive: true, maxSockets: config.handlerMaxSockets || 5})),
            hdrClient: new HdrClient(log, log, config)
        };

        var syncRequestError;
        var syncRequestResponse;
        var syncRequestComplete = false;
        var syncIsComplete = false;
        var syncStatusCalledCounter = 0;
        var solrAddComplete = false;
        var solrSearchFullComplete = false;
        var solrDeleteComplete = false;
        var solrSearchEmptyComplete = false;

        //---------------------------------------------------------------------------------------------------
        // This function checks the sync status to see if there is nothing in progress and there are no
        // open jobs.  If that is the case, it will set syncIsComplete to true.
        //
        // callback: The function to call when the check is done.
        //---------------------------------------------------------------------------------------------------
        function checkSyncComplete(callback) {
            log.debug('clear-patient-util-itest-spec.checkSyncComplete: Entered method.');
            var syncStatusCallComplete = false;
            var syncStatusCallError;
            var syncStatusCallResponse;
            runs(function() {
                var options = {
                    url: config.syncRequestApi.protocol + '://' + host + ':' + syncApiPort + config.syncRequestApi.patientStatusPath + '?pid=' + pid,
                    method: 'GET'
                };

                syncStatusCalledCounter++;
                log.debug('clear-patient-util-itest-spec.checkSyncComplete: Retrieving status: syncStatusCalledCounter: %s; options: %j', syncStatusCalledCounter, options);
                request.get(options, function(error, response, body) {
                    log.debug('clear-patient-util-itest-spec.checkSyncComplete: Retrieving status - Call back called: error: %j, response: %j, body: %j', error, response, body);
                    expect(response).toBeTruthy();
                    expect(val(response, 'statusCode')).toBe(200);
                    expect(body).toBeTruthy();

                    var syncStatusData;
                    try {
                        syncStatusData = JSON.parse(body);
                    } catch (parseError) {}

                    log.debug('clear-patient-util-itest-spec.checkSyncComplete: Retrieving status - Call back called: syncStatusData: %j', syncStatusData);
                    expect(syncStatusData).toBeTruthy();
                    if (syncStatusData && (_.isObject(syncStatusData.syncStatus)) && (_.isEmpty(syncStatusData.syncStatus.inProgress)) &&
                        (_.isArray(syncStatusData.jobStatus)) && (_.isEmpty(syncStatusData.jobStatus))) {
                        syncIsComplete = true;
                    }

                    syncStatusCallError = error;
                    syncStatusCallResponse = response;
                    syncStatusCallComplete = true;
                    return callback();
                });
            });

            waitsFor(function() {
                return syncStatusCallComplete;
            }, 'Timed out waiting for syncRequest sync status retrieval.', 60000);
        }

        //------------------------------------------------------------------------------------------------------
        // Returns the value of syncIsComplete.
        //
        // returns TRUE if the sync is complete.  False if it is not.
        //------------------------------------------------------------------------------------------------------
        function isSyncComplete() {
            log.debug('clear-patient-util-itest-spec.isSyncComplete: Entered method.  syncIsComplete: %j', syncIsComplete);
            return syncIsComplete;
        }


        //------------------------------------------------------------------------------------------------------
        // Test code starts here....
        //------------------------------------------------------------------------------------------------------
        runs(function() {
            var options = {
                url: config.syncRequestApi.protocol + '://' + host + ':' + syncApiPort + config.syncRequestApi.patientSyncPath + '?pid=' + pid,
                method: 'GET'
            };

            log.debug('clear-patient-util-itest-spec: Sync Request.  options: %j', options);
            request.get(options, function(error, response, body) {
                log.debug('clear-patient-util-itest-spec: Sync Request call back called.  error: %j; response: %j, body: %j', error, response, body);
                syncRequestError = error;
                syncRequestResponse = response;
                expect(val(response, 'statusCode')).toBe(202);
                syncRequestComplete = true;
            });
        });

        waitsFor(function() {
            return syncRequestComplete;
        }, 'Timed out waiting for syncRequest to sync patient.', 60000);

        // Need to wait for the sync to complete.
        //----------------------------------------
        runs(function() {
            log.debug('clear-patient-util-itest-spec: Starting async.doWhilst.');
            async.doUntil(checkSyncComplete, isSyncComplete, function(error) {
                expect(error).toBeFalsy();
                log.debug('clear-patient-util-itest-spec: async.doWhilst call back called.  error: %j', error);
            });
        });

        waitsFor(function() {
            return syncIsComplete;
        }, 'Timed out waiting for sync to complete.', 60000);

        // Store an ehmp-activity document to SOLR to test that it is not removed when clearPatient is called
        //---------------------------------------------------------------------------------------------------
        runs(function() {
            environment.solr.add(solrRecord, function (error, data) {
                expect(error).toBeNull();
                expect(data).not.toBeUndefined();
                expect(val(data, 'responseHeader')).not.toBeUndefined();
                expect(val(data, 'responseHeader', 'status')).toBe(0);

                environment.solr.commit(function (error, data) {
                    expect(error).toBeNull();
                    expect(data).not.toBeUndefined();
                    expect(val(data, 'responseHeader')).not.toBeUndefined();
                    expect(val(data, 'responseHeader', 'status')).toBe(0);

                    solrAddComplete = true;
                });
            });
        });

        waitsFor(function() {
            return solrAddComplete;
        }, 'Timed out storing an ehmp-activity document to SOLR', 10000);

        // Before we call clearPatient we must get the patient identifiers
        //----------------------------------------------------------------
        var getIdentifiersComplete = false;
        runs(function() {
            log.debug('clear-patient-util-itest-spec: Done Syncing syncStatusCalledCounter: %s; ', syncStatusCalledCounter);
            environment.jds.getPatientIdentifierByPid(pid, function(error, response, result) {
                expect(error).toBeFalsy();
                expect(response).toBeTruthy();
                expect(result).toBeTruthy();
                expect(val(result, 'patientIdentifiers')).toBeTruthy();
                expect(val(result, 'jpid')).toBeTruthy();

                identifiers = result.patientIdentifiers;
                jpid = result.jpid;
                getIdentifiersComplete = true;
            });
        });

        waitsFor(function() {
            return getIdentifiersComplete;
        }, 'waiting to get identifiers from JDS', 10000);

        // Now we can test clearPatient
        //-----------------------------
        var clearPatientDone = false;
        runs(function() {
            log.debug('clear-patient-util-itest-spec: now testing clearPatient');
            clearPatientUtil.clearPatient(log, config, environment, false, identifiers, jpid, function(error) {
                expect(error).toBeFalsy();
                clearPatientDone = true;
            });
        });

        waitsFor(function() {
            return clearPatientDone;
        }, 'waiting for clearPatientUtil.clearPatient', 10000);

        // Double check with JDS that the patient has been unsynced
        //---------------------------------------------------------
        var statusCheckDone = false;
        runs(function() {
            log.debug('clear-patient-util-itest-spec: verifying that patient was unsynced');
            environment.jds.getSyncStatus({
                value: pid
            }, function(error, response) {
                expect(error).toBeFalsy();
                expect(response).toBeTruthy();
                expect(val(response, 'statusCode')).toEqual(404);
                statusCheckDone = true;
            });
        });

        waitsFor(function() {
            return statusCheckDone;
        }, 'waiting to verify patient was unsynced', 10000);

        // Query SOLR to ensure that the ehmp-activity document was not removed when clearPatient was called
        //--------------------------------------------------------------------------------------------------
        runs(function() {
            environment.solr.search(solrQuery, function (error, data) {
                expect(error).toBeNull();
                expect(data).toBeDefined();
                expect(val(data, 'responseHeader')).toBeDefined();
                expect(val(data, 'responseHeader', 'status')).toBe(0);
                expect(val(data, 'response', 'numFound')).toBe(1);
                expect(val(data, 'response', 'docs', 0, 'pid')).toBe(pid);
                expect(val(data, 'response', 'docs', 0, 'uid')).toBe(solrDocumentUid);

                solrSearchFullComplete = true;
            });
        });

        waitsFor(function() {
            return solrSearchFullComplete;
        }, 'Timed out retrieving an ehmp-activity document from SOLR', 10000);

        // Delete all patient documents in SOLR for this patient as part of cleanup
        //-------------------------------------------------------------------------
        runs(function() {
            environment.solr.deleteByQuery('pid:' + pid, function (error, data) {
                expect(error).toBeNull();
                expect(data).toBeDefined();
                expect(val(data, 'responseHeader')).toBeDefined();
                expect(val(data, 'responseHeader', 'status')).toBe(0);

                environment.solr.commit(function (error, data) {
                    expect(error).toBeNull();
                    expect(data).not.toBeUndefined();
                    expect(val(data, 'responseHeader')).not.toBeUndefined();
                    expect(val(data, 'responseHeader', 'status')).toBe(0);

                    solrDeleteComplete = true;
                });
            });
        });

        waitsFor(function() {
            return solrDeleteComplete;
        }, 'Timed out removing all patient documents from SOLR', 20000);

        // Query SOLR to ensure that all documents were deleted for patient
        //-----------------------------------------------------------------
        runs(function() {
            environment.solr.search(solrQuery, function (error, data) {
                expect(error).toBeNull();
                expect(data).toBeDefined();
                expect(val(data, 'responseHeader')).toBeDefined();
                expect(val(data, 'responseHeader', 'status')).toBe(0);
                expect(val(data, 'response', 'numFound')).toBe(0);
                expect(val(data, 'response', 'docs', 'pid')).toBeUndefined();

                solrSearchEmptyComplete = true;
            });
        });

        waitsFor(function() {
            return solrSearchEmptyComplete;
        }, 'Timed out retrieving an ehmp-activity document from SOLR', 10000);
    });
});
