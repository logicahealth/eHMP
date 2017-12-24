'use strict';

var _ = require('underscore');
var bunyan = require('bunyan');
var fsUtil = require(__dirname+'/fs-utils');
var crypto = require('crypto');
var auditLoggers = {};

function Auditor(){
    if (!(this instanceof Auditor)) {
        return new Auditor();
    }
}

function generateAuditLoggerHash(auditFile){
    return crypto.createHash('md5').update(auditFile).digest('hex');
}

Auditor.prototype.getAuditLogger = function(config, auditee) {
    var auditPath = config.auditPath;
    if (_.isEmpty(auditPath)) {
        return {
            'audit': function() { return 'NO_PATH'; }
        };
    }
    var auditFile = auditPath+'audit_'+auditee+'_'+process.env.VXSYNC_LOG_SUFFIX+'.log';
    var loggerConfig = {
        'name': auditee,
        'process': process.env.VXSYNC_LOG_SUFFIX,
        'userId': 'VX-Sync',
        'streams': [
            {
                'path': auditFile
            }
        ]
    };
    var auditLoggerHash = generateAuditLoggerHash(auditFile);

    if(auditLoggers.hasOwnProperty(auditLoggerHash)){
        auditLogger = auditLoggers[auditLoggerHash];
    } else {

        var auditLogger = {
            'logger': bunyan.createLogger(loggerConfig),
            'audit': function(txt) {
                var self = this;
                self.logger.on('error', function(error) {
                    if (error.code === 'ENOENT') { // Audit log directory not present. Create dir and attempt to log again.
                        fsUtil.createPath(auditPath, '755', function(fsError) {
                            if (fsError) {
                                throw fsError;
                            } else {
                                self.logger.info(txt);
                            }
                        });
                    }
                });
                self.logger.info(txt);
            }
        };
        auditLoggers[auditLoggerHash] = auditLogger;
    }
    return auditLogger;
}

module.exports = Auditor;