'use strict';

require('../../../env-setup');

var logger = require(global.VX_DUMMIES + 'dummy-logger');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var PjdsClientDummy = require(global.VX_DUMMIES + 'pjds-client-dummy');

var solrStore = require(global.VX_HANDLERS + 'solr-record-storage/solr-record-storage-handler');
var ReEnrichUtil = require(global.VX_ROOT + './record-update/utils/record-re-enrichment-util');
var solrReindexingUtil = require(global.VX_UTILS + 'solr-reindexing-util');

var domain = 'ehmp-activity';
var pid = 'SITE;3';
var icn ='10110V004877';

// var logger = require('bunyan').createLogger({
//     name: 'solr-reindexing-util',
//     level: 'debug'
// });

var config = {
    jds: {
    protocol: 'http',
    host: 'IP        ',
    port: '9082',
    timeout: 300000
    },
    pjds: {
        protocol: 'http',
        host: 'IP        ',
        port: '9082',
        timeout: 300000
    },
    vistaSites: {'SITE': {}, 'SITE': {}}
};

function createEnvironment(log, config) {
    return {
        jds: new JdsClientDummy(log, config),
        pjdsHttp: new PjdsClientDummy(log, config),
        metrics: logger
    };
}

describe('solr-reindexing-util', function() {
    describe('storeDataToSolr', function() {
       var done;

       beforeEach(function() {
           spyOn(solrStore, 'writebackWrapper').andCallFake(function(log, config, environment, domain, domainRecord, storeCallback) {
               return setTimeout(storeCallback, 0, null, 'success');
           });

           done = false;
       });

       it('no domain data to store', function() {
           var environment = createEnvironment(logger, config);

           runs(function() {
               solrReindexingUtil.storeDataToSolr(logger, config, environment, domain, [], function(err, result) {
                   expect(solrStore.writebackWrapper).not.toHaveBeenCalled();
                   expect(err).toBeFalsy();
                   expect(result).toBe('Successfully stored all ehmp-activity domain data for patient.');

                   done = true;
               });
           });

           waitsFor(function() { return done; }, 'done', 200);
       });

       it('undefined data to store', function() {
           var environment = createEnvironment(logger, config);

           runs(function() {
               solrReindexingUtil.storeDataToSolr(logger, config, environment, domain, undefined, function (err, result) {
                   expect(solrStore.writebackWrapper).not.toHaveBeenCalled();
                   expect(err).toBeFalsy();
                   expect(result).toBe('Successfully stored all ehmp-activity domain data for patient.');

                   done = true;
               });
           });

           waitsFor(function() { return done; }, 'done', 200);
       });

       it('domain data stored', function() {
           var environment = createEnvironment(logger, config);
           var dataItems = [{}, {}];

           runs(function() {
               solrReindexingUtil.storeDataToSolr(logger, config, environment, domain, dataItems, function (err, result) {
                   expect(solrStore.writebackWrapper.calls.length).toBe(2);
                   expect(err).toBeFalsy();
                   expect(result).toBe('Successfully stored all ehmp-activity domain data for patient.');

                   done = true;
               });
           });

           waitsFor(function() { return done; }, 'done', 200);
       });
    });

    describe('createAndPublishSolrStoreJob', function() {
        var done;
        var reEnrichUtil;

        beforeEach(function() {
            reEnrichUtil = spyOn(ReEnrichUtil.prototype, 'writeJobsToBeanstalk').andCallFake(function(log, jobsToPublish, callback) {
                return setTimeout(callback, 0, null, 'success');
            });

            done = false;
        });

        it('no domain data to publish', function() {
            var environment = createEnvironment(logger, config);

            runs(function() {
                solrReindexingUtil.createAndPublishSolrStoreJob(logger, config, environment, domain, [], function(err, result) {
                    expect(reEnrichUtil).not.toHaveBeenCalled();
                    expect(err).toBeFalsy();
                    expect(result).toBe('Successfully published all ehmp-activity domain data jobs for patient.');

                    done = true;
                });
            });

            waitsFor(function() { return done; }, 'done', 200);
        });

        it('undefined data to publish', function() {
            var environment = createEnvironment(logger, config);

            runs(function() {
                solrReindexingUtil.createAndPublishSolrStoreJob(logger, config, environment, domain, undefined, function (err, result) {
                    expect(reEnrichUtil).not.toHaveBeenCalled();
                    expect(err).toBeFalsy();
                    expect(result).toBe('Successfully published all ehmp-activity domain data jobs for patient.');

                    done = true;
                });
            });

            waitsFor(function() { return done; }, 'done', 200);
        });

        it('domain data published', function() {
            var environment = createEnvironment(logger, config);
            var dataItems = [{pid: 'SITE;3'}, {patientUid: 'urn:va:patient:ICN:10108V420871:10108V420871'}];

            runs(function() {
                solrReindexingUtil.createAndPublishSolrStoreJob(logger, config, environment, domain, dataItems, function (err, result) {
                    expect(reEnrichUtil.calls.length).toBe(1);
                    expect(reEnrichUtil.calls[0].args[1].length).toBe(2);
                    expect(err).toBeFalsy();
                    expect(result).toBe('Successfully published all ehmp-activity domain data jobs for patient.');

                    done = true;
                });
            });

            waitsFor(function() { return done; }, 'done', 200);
        });
    });

    describe('retrieveDomainData', function() {
        var done;

        beforeEach(function() {
            spyOn(solrStore, 'writebackWrapper').andCallFake(function(log, config, environment, domain, domainRecord, storeCallback) {
                return setTimeout(storeCallback, 0, null, 'success');
            });

            done =false;
        });

        it('query returned an error', function() {
            var environment = createEnvironment(logger, config);
            var queryFunction = function(callback) {
                callback('Failed to connect');
            };

            runs(function() {
                solrReindexingUtil._retrieveDomainData(logger, config, environment, domain, pid, queryFunction, solrReindexingUtil.storeDataToSolr, function(err, result) {
                    expect(solrStore.writebackWrapper).not.toHaveBeenCalled();
                    expect(err).toBeTruthy();
                    expect(result).toBeFalsy();

                    done = true;
                });
            });

            waitsFor(function() { return done; }, 'done', 200);
        });

        it('query returned an error result', function() {
            var environment = createEnvironment(logger, config);
            var queryFunction = function(callback) {
                callback(null, {statusCode: 400, body: {error: 'invalid connection'}}, {error: 'invalid connection'});
            };

            runs(function() {
                solrReindexingUtil._retrieveDomainData(logger, config, environment, domain, pid, queryFunction, solrReindexingUtil.storeDataToSolr, function(err, result) {
                    expect(solrStore.writebackWrapper).not.toHaveBeenCalled();
                    expect(err).toBeTruthy();
                    expect(result).toBeFalsy();

                    done = true;
                });
            });

            waitsFor(function() { return done; }, 'done', 200);
        });

        it('query returned no data', function() {
            var environment = createEnvironment(logger, config);
            var queryFunction = function(callback) {
                callback(null, {statusCode: 200, body: {data: {items: []}}}, {data: {items: []}});
            };

            runs(function() {
                solrReindexingUtil._retrieveDomainData(logger, config, environment, domain, pid, queryFunction, solrReindexingUtil.storeDataToSolr, function(err, result) {
                    expect(solrStore.writebackWrapper).not.toHaveBeenCalled();
                    expect(err).toBeFalsy();
                    expect(result).toBe('No ' + domain + ' domain data to store for patient.');

                    done = true;
                });
            });

            waitsFor(function() { return done; }, 'done', 200);
        });

        it('query returned data', function() {
            var environment = createEnvironment(logger, config);
            var queryFunction = function(callback) {
                callback(null, {statusCode: 200, body: {data: {items: [{}, {}]}}}, {data: {items: [{}, {}]}});
            };

            runs(function() {
                solrReindexingUtil._retrieveDomainData(logger, config, environment, domain, pid, queryFunction, solrReindexingUtil.storeDataToSolr, function(err, result) {
                    expect(solrStore.writebackWrapper.calls.length).toBe(2);
                    expect(err).toBeFalsy();
                    expect(result).toBe('Successfully stored all ehmp-activity domain data for patient.');

                    done = true;
                });
            });

            waitsFor(function() { return done; }, 'done', 200);
        });
    });

    describe('getAllPatientIds', function() {
        it('error getting pids by icn from jds', function() {
            var environment = createEnvironment(logger, config);

            environment.jds._setResponseData('Error connecting', null, null);

            solrReindexingUtil._getAllPatientIds(logger, config, environment, icn, function(err, result) {
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });

        it('error returned by JDS getting pids by icn', function() {
            var environment = createEnvironment(logger, config);

            environment.jds._setResponseData(null, {statusCode: 400}, {error: 'error'});

            solrReindexingUtil._getAllPatientIds(logger, config, environment, icn, function(err, result) {
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });

        it('generate multiple patient uuids when icn used', function() {
            var environment = createEnvironment(logger, config);

            environment.jds._setResponseData(null, {statusCode: 200}, {patientIdentifiers: ['SITE;3', 'SITE;3', 'WE3D;3']});

            solrReindexingUtil._getAllPatientIds(logger, config, environment, icn, function(err, result) {
                expect(err).toBeFalsy();
                expect(result.length).toBe(3);
                expect(result).toContain('urn:va:patient:SITE:3:3');
                expect(result).toContain('urn:va:patient:SITE:3:3');
                expect(result).toContain('urn:va:patient:ICN:' + icn + ':' + icn);
                expect(result).not.toContain('urn:va:patient:WE3D:3:3');
            });
        });

        it('generate patient uuids for pid', function() {
            var environment = createEnvironment(logger, config);

            solrReindexingUtil._getAllPatientIds(logger, config, environment, pid, function(err, result) {
                expect(err).toBeFalsy();
                expect(result).toContain('urn:va:patient:SITE:3:3');
                expect(result.length).toBe(1);
            });
        });
    });

    describe('buildPjdsDomainRetrievalTasks', function() {
        it('no tasks created when there are no pjds domains', function() {
            var environment = createEnvironment(logger, config);
            var reindexingContext = {pjdsDomains: null, patientId: pid};

            solrReindexingUtil._buildPjdsDomainRetrievalTasks(logger, config, environment, reindexingContext, function(err, result) {
                expect(err).toBeFalsy();
                expect(result.length).toBe(0);
            });
        });

        it('no tasks created when there is a jds error retrieving pids for an icn', function() {
            var environment = createEnvironment(logger, config);
            var reindexingContext = {pjdsDomains: [domain], patientId: icn};

            environment.jds._setResponseData('Error connecting', null, null);

            solrReindexingUtil._buildPjdsDomainRetrievalTasks(logger, config, environment, reindexingContext, function(err, result) {
                expect(err).toBeTruthy();
                expect(result).toBeFalsy();
            });
        });

        it('single task created for a single pid and a single pjds domain', function() {
            var environment = createEnvironment(logger, config);
            var reindexingContext = {pjdsDomains: [domain], patientId: pid};

            solrReindexingUtil._buildPjdsDomainRetrievalTasks(logger, config, environment, reindexingContext, function(err, result) {
                expect(err).toBeFalsy();
                expect(result.length).toBe(1);
                expect(typeof result[0]).toBe('function');
            });
        });

        it('multiple task created for an inc and multiple pjds domains', function() {
            var environment = createEnvironment(logger, config);
            var reindexingContext = {pjdsDomains: [domain, 'ehmp-med'], patientId: icn};

            environment.jds._setResponseData(null, {statusCode: 200}, {patientIdentifiers: [pid, icn]});

            solrReindexingUtil._buildPjdsDomainRetrievalTasks(logger, config, environment, reindexingContext, function(err, result) {
                expect(err).toBeFalsy();
                expect(result.length).toBe(4);
                expect(typeof result[0]).toBe('function');
                expect(typeof result[1]).toBe('function');
                expect(typeof result[2]).toBe('function');
                expect(typeof result[3]).toBe('function');
            });
        });
    });

    describe('buildJdsDomainRetrievalTasks', function() {
        it('no tasks created when there are no jds domains', function() {
            var environment = createEnvironment(logger, config);
            var reindexingContext = {jdsDomains: null, patientId: pid};

            solrReindexingUtil._buildJdsDomainRetrievalTasks(logger, config, environment, reindexingContext, function(err, result) {
                expect(err).toBeFalsy();
                expect(result.length).toBe(0);
            });
        });

        it('single task created for a single pid and a single pjds domain', function() {
            var environment = createEnvironment(logger, config);
            var reindexingContext = {jdsDomains: [domain], patientId: pid};

            solrReindexingUtil._buildJdsDomainRetrievalTasks(logger, config, environment, reindexingContext, function(err, result) {
                expect(err).toBeFalsy();
                expect(result.length).toBe(1);
                expect(typeof result[0]).toBe('function');
            });
        });

        it('multiple task created for an inc and multiple jds domains', function() {
            var environment = createEnvironment(logger, config);
            var reindexingContext = {jdsDomains: [domain, 'ehmp-med'], patientId: icn};

            solrReindexingUtil._buildJdsDomainRetrievalTasks(logger, config, environment, reindexingContext, function(err, result) {
                expect(err).toBeFalsy();
                expect(result.length).toBe(2);
                expect(typeof result[0]).toBe('function');
                expect(typeof result[1]).toBe('function');
            });
        });
    });

    describe('processPatient', function() {
        it('process one pjdsDomain with no patient data for a pid', function() {
            var environment = createEnvironment(logger, config);
            var reindexingContext = {jdsDomains: null, pjdsDomains: [domain], patientId: pid};

            environment.pjdsHttp._setResponseData(null, {statusCode: 200}, {data: {items: []}});

            solrReindexingUtil.processPatient(logger, config, environment, reindexingContext, function(err, result) {
                expect(err).toBeFalsy();
                expect(result.length).toBe(1);
                expect(result[0]).toBe('No ehmp-activity domain data to store for patient.');
            });
        });
    });
});
