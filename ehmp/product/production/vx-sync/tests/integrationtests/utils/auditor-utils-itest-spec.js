'use strict';

require('../../../env-setup');

var Auditor = require(global.VX_UTILS + 'auditor');
var fsUtil = require(global.VX_UTILS + 'fs-utils');

var auditor = new Auditor();
var config = {
    auditPath: '/tmp/vxsync/auditor-utils-spec/'
};

process.env.VXSYNC_LOG_SUFFIX = "jmeadows";

var createAuditDir = function(auditPath){
    var finished = false;
    fsUtil.createPath(auditPath, '755', function(fsError) {
        if (fsError) {
            throw fsError;
        }
        finished = true;
    });
    waitsFor(function(){
        return finished;
    },'Timeout waiting for creating test log directory',1000);
};

var removeAuditDir = function(auditPath){
    fsUtil.deleteAllFiles(auditPath);
};

describe('auditor util', function () {
    describe('has a getAuditLogger function', function () {

        beforeEach(function() { //need to create directory as its not necessarily there, otherwise tests will fail when bunyan tries to find it.
            createAuditDir(config.auditPath);
        });

        afterEach(function(){
            removeAuditDir(config.auditPath);
        });

        it('returns no logger and audit() returns NO_PATH string if no auditPath is set', function () {
            var anAuditLogger = auditor.getAuditLogger({}, 'anAuditee');
            expect(anAuditLogger).toBeDefined();
            expect(anAuditLogger.logger).not.toBeDefined();
            expect(anAuditLogger.audit()).toEqual("NO_PATH");
        });
        it('returns a logger when config an auditpath defined', function () {
            var anAuditLogger = auditor.getAuditLogger(config, 'auditee');
            expect(anAuditLogger).toBeDefined();
            expect(anAuditLogger.logger).toBeDefined();
        });
        it('returns the same logger object when getting audit logger for same auditee and path', function () {
            var auditLogger1 = auditor.getAuditLogger(config, "auditee_dup");
            expect(auditLogger1).toBeDefined();
            var auditLogger2 = auditor.getAuditLogger(config, "auditee_dup");
            expect(auditLogger2).toBe(auditLogger1);

        });
        it('returns distinct logger object when getting audit logger for different auditee', function () {
            var auditLogger1 = auditor.getAuditLogger(config, "auditee1");
            expect(auditLogger1).toBeDefined();
            var auditLogger2 = auditor.getAuditLogger(config, "auditee2");
            expect(auditLogger2).not.toBe(auditLogger1);

        });
        it('returns distinct logger object when getting audit logger for different auditPath', function () {
            var config2 = {
                auditPath: '/tmp/vxsync/auditor-utils-spec/anotherPath/'
            };
            createAuditDir(config2.auditPath);
            var auditLogger1 = auditor.getAuditLogger(config, "auditee1");
            expect(auditLogger1).toBeDefined();
            var auditLogger2 = auditor.getAuditLogger(config2, "auditee1");
            expect(auditLogger2).not.toBe(auditLogger1);
        });
    });
});