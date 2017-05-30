'use strict';

require('../../../../env-setup');

var JobStatusUpdater = require(global.VX_SUBSYSTEMS + 'jds/JobStatusUpdater');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var logger = require(global.VX_DUMMIES + 'dummy-logger');

var config = {
    jds: {
        protocol: 'http',
        host: 'IP        ',
        port: PORT
    },
    trackErrorsByMetastamp: ['record-enrichment', 'store-record', 'solr-record-storage', 'event-prioritization-request']
};

describe('JobStatusUpdater.js', function(){
    var job, jobStatusUpdater;
    var jds = new JdsClientDummy(logger, config);

    beforeEach(function() {
        jobStatusUpdater = new JobStatusUpdater(logger, config, jds);

        job = {rootJobId: '212', jpid: '123'};
    });

    it('storeMetaStampErrorEvent for solr job', function(){
        var jdsSpy = spyOn(jds, 'setEventStoreStatus').andCallThrough();

        job.status = 'error';
        job.type = 'solr-record-storage';
        job.record = {pid: '9E7A;3', uid: '123', timeStamp: 'now'};

        jobStatusUpdater.errorJobStatus(job, {error: 'connection failed'}, function(error, response, result) {
            expect(error).toBeFalsy();
            expect(jds.setEventStoreStatus).toHaveBeenCalled();

            var storeEventInfo = jdsSpy.mostRecentCall.args[1];
            expect(storeEventInfo.type).toBe('solrError');
        });
    });

    it('storeMetaStampErrorEvent for store record job', function(){
        var jdsSpy = spyOn(jds, 'setEventStoreStatus').andCallThrough();

        job.status = 'error';
        job.type = 'store-record';
        job.record = {pid: '9E7A;3', uid: '123', timeStamp: 'now'};

        jobStatusUpdater.errorJobStatus(job, {error: 'connection failed'}, function(error, response, result) {
            expect(error).toBeFalsy();
            expect(jds.setEventStoreStatus).toHaveBeenCalled();

            var storeEventInfo = jdsSpy.mostRecentCall.args[1];
            expect(storeEventInfo.type).toBe('syncError');
        });
    });

    it('writeStatus fails for invalid jobState', function(){
        spyOn(jds, 'saveJobState').andCallThrough();
        var invalidJob = '';

        jobStatusUpdater.writeStatus(invalidJob, function(error, response, result) {
            expect(error).toBe('Invalid job state');
            expect(jds.saveJobState).not.toHaveBeenCalled();
        });
    });

    it('writeStatus enterprise-sync-request job pending', function(){
        spyOn(jds, 'saveJobState').andCallThrough();

        job.status = 'started';
        job.type = 'enterprise-sync-request';
        job.rootJobId = undefined;
        job.jobId = '4567';

        jobStatusUpdater.writeStatus(job, function(error, response, result) {
            expect(error).toBeFalsy();
            expect(jds.saveJobState).toHaveBeenCalled();
            expect(result.rootJobId).toBe(result.jobId);
            expect(result.timestamp).toBeDefined();
        });
    });

    it('writeStatus does not save metastamp for stated job', function(){
        spyOn(jds, 'saveJobState').andCallThrough();

        job.status = 'started';
        job.type = 'enterprise-sync-request';
        job.record = {};

        jobStatusUpdater.writeStatus(job, function(error, response, result) {
            expect(error).toBeFalsy();
            expect(jds.saveJobState).not.toHaveBeenCalled();
        });
    });

    it('errorJobStatus for solr job', function(){
        spyOn(jobStatusUpdater, 'storeMetaStampErrorEvent').andCallThrough();
        spyOn(jobStatusUpdater, 'writeStatus').andCallThrough();

        job.status = 'error';
        job.type = 'solr-record-storage';
        job.record = {pid: '9E7A;3', uid: '123', timeStamp: 'now'};

        jobStatusUpdater.errorJobStatus(job, {error: 'connection failed'}, function(error, response, result) {
            expect(error).toBeFalsy();
            expect(result.status).toBe('error');
            expect(jobStatusUpdater.writeStatus).not.toHaveBeenCalled();
            expect(jobStatusUpdater.storeMetaStampErrorEvent).toHaveBeenCalled();
        });
    });

    it('errorJobStatus for job', function(){
        spyOn(jobStatusUpdater, 'storeMetaStampErrorEvent').andCallThrough();
        spyOn(jobStatusUpdater, 'writeStatus').andCallThrough();

        job.status = 'error';
        job.type = 'x';

        jobStatusUpdater.errorJobStatus(job, {error: 'connection failed'}, function(error, response, result) {
            expect(error).toBeFalsy();
            expect(result.status).toBe('error');
            expect(jobStatusUpdater.writeStatus).toHaveBeenCalled();
            expect(jobStatusUpdater.storeMetaStampErrorEvent).not.toHaveBeenCalled();
        });
    });

    it('createJobStatus is written', function(){
        spyOn(jobStatusUpdater, 'writeStatus').andCallThrough();

        job.status = 'created';
        job.type = 'x';

        jobStatusUpdater.createJobStatus(job, function(error, response, result) {
            expect(error).toBeFalsy();
            expect(result.status).toBe('created');
            expect(jobStatusUpdater.writeStatus).toHaveBeenCalled();
        });
    });

    it('startJobStatus is written', function(){
        spyOn(jobStatusUpdater, 'writeStatus').andCallThrough();

        job.status = 'started';
        job.type = 'x';

        jobStatusUpdater.startJobStatus(job, function(error, response, result) {
            expect(error).toBeFalsy();
            expect(result.status).toBe('started');
            expect(jobStatusUpdater.writeStatus).toHaveBeenCalled();
        });
    });

    it('completeJobStatus is written', function(){
        spyOn(jobStatusUpdater, 'writeStatus').andCallThrough();

        job.status = 'started';
        job.type = 'x';

        jobStatusUpdater.startJobStatus(job, function(error, response, result) {
            expect(error).toBeFalsy();
            expect(result.status).toBe('started');
            expect(jobStatusUpdater.writeStatus).toHaveBeenCalled();
        });
    });
});
