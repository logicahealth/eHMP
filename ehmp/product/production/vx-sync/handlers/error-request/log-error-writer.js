'use strict';

var _ = require('underscore');
var path = require('path');
var bunyan = require('bunyan');

function writeErrorRecord(logger, errorRecord, callback) {
    callback = _.isFunction(callback) ? callback : function() {};

    try {
        logger.error({
            'error-record': errorRecord
        });
    } catch (e) {
        // This should never happen
        return setTimeout(callback, 0, e);
    }

    setTimeout(callback);
}

//---------------------------------------------------------------------------------------------
// This function creates the error record writer and returns a handle to it.  (note that since
// environment and logger is not used - those two parameters are omitted from the signature.
// if they are passed, they will be ignored...)
//
// config: The worker-config settings.
// returns: The error record writer function.
//----------------------------------------------------------------------------------------------
function createErrorRecordWriter(config) {
    var loggerConfig = {
        name: 'errors',
        level: 'debug'
    };

    if (config['error-handling'] && config['error-handling']['log-error-writer'] && config['error-handling']['log-error-writer'].logger) {
        loggerConfig = config['error-handling']['log-error-writer'].logger;
        convertStreamConfigEntryToStreams(loggerConfig);
    }

    return writeErrorRecord.bind(null, bunyan.createLogger(loggerConfig));
}

/*
Convert configuration settings of 'process.stdout' and 'process.stderr'
to reference the actual streams.
*/
function convertStreamConfigEntryToStreams(loggerConfig) {
    if (!loggerConfig) {
        return;
    }

    _.each(loggerConfig.streams, function(streamConfigEntry) {
        // this is needed if the config is from a config file
        // need to replace the string 'stout' with the object process.stdout
        if (streamConfigEntry.stream === 'process.stdout') {
            streamConfigEntry.stream = process.stdout;
        }

        if (streamConfigEntry.stream === 'process.stderr') {
            streamConfigEntry.stream = process.stderr;
        }

        if (_.has(process.env, 'VXSYNC_LOG_SUFFIX')) {
            convertFilenames(loggerConfig, '', '-' + process.env.VXSYNC_LOG_SUFFIX);
        }
    });
}

function convertFilenames(singleLoggerConfig, prefix, suffix) {
    prefix = prefix || '';
    suffix = suffix || '';

    var file;
    var parts;
    var newPath;

    _.each(singleLoggerConfig.streams, function(streamConfigEntry) {
        if (streamConfigEntry.path) {
            parts = streamConfigEntry.path.split(path.sep);

            file = parts.pop().split('.');
            newPath = parts.join(path.sep);

            streamConfigEntry.path = (!_.isEmpty(newPath) ? newPath + path.sep : '') + prefix + file[0] + suffix + (!_.isEmpty(file[1]) ? ('.' + file[1]) : '');
        }
    });
}

module.exports.writeErrorRecord = writeErrorRecord;
module.exports.createErrorRecordWriter = createErrorRecordWriter;