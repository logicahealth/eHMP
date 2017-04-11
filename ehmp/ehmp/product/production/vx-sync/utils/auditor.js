'use strict';

var _ = require('underscore');
var bunyan = require('bunyan');
var fsUtil = require(__dirname+'/fs-utils');
function getAuditLogger(config, auditee) {
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

    var auditLogger = {
        'logger': bunyan.createLogger(loggerConfig),
        'audit': function(txt) {
            var self = this;
            self.logger.on('error', function(error) {
                if (error.code === 'ENOENT') {
                    fsUtil.createPath(auditPath, '755', function(fsError) {
                        if (fsError) {
                            throw fsError;
                        } else {
                            self.logger = bunyan.createLogger(loggerConfig);
                            self.logger.info(txt);
                        }
                    });
                }
            });

            self.logger.info(txt);
        }
    };

    return auditLogger;
}

module.exports = getAuditLogger;