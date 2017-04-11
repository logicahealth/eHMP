'use strict';

require('../../env-setup');
var exec = require('child_process').exec;
var async = require('async');
var fs = require('fs');
var _ = require('underscore');
var JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');
var bunyan = require('bunyan');
var clc = require('cli-color');
var config = require(global.VX_ROOT + 'worker-config.json').vxsync;
var moment = require('moment');
var diagnosticsConfig = require('./sync-diagnostics-config');
var path = require('path');

var log = bunyan.createLogger({
    name: 'sync-diagnostic-util',
    streams: [{
        level: diagnosticsConfig.logOutputLevel || 'info',
        stream: process.stdout
    }]
});

log.show = function(obj) {
    if (obj.msg) {
        obj.message = obj.msg;
    }
    log.info(obj);
};

console.log('Gathering log information...');

var pidToJpid = {};

var results = {};
var totalErrorCount = 0;
var patientSyncErrorCount = 0;
var patientsAffectedByErrorsCount = 0;
var handlersWithErrors = [];

getLogFilenameList();

function getLogFilenameList() {
    var logDir = diagnosticsConfig.vxsyncLogDir || "/var/log/vxsync/";
    console.log("Looking for log files under: " + logDir);
    var logFilePat = path.join(logDir, "*.log*");
    var child = exec('ls ' + logFilePat, function(error, stdout, stderr) {
        log.debug('stdout: ' + stdout);
        log.debug('stderr: ' + stderr);
        if (error) {
            console.log('exec error: ' + error);
        }

        if (!stdout) {
            console.log('No log files found!');
        }

        var rawList = stdout.split('\n');

        //Filter out empty strings
        var logFileList = _.filter(rawList, function(rawListItem) {
            return rawListItem;
        });

        //console.log(logFileList);

        retrieveLogFiles(logFileList);
    });
}

function retrieveLogFiles(logFileList) {
    var tasks = [];

    _.each(logFileList, function(filename) {
        console.log("Reading log file: " + filename);
        tasks.push(function(callback) {
            fs.readFile(filename, {
                    encoding: 'utf8'
                }, function(err, data) {
                    processLogFile(err, data, callback);
                }
            );
        });
    });

    async.parallel(tasks, function(err, res) {
        if (err) {
            console.log('Error reading file(s): ' + err);
        }

        sortResultsByPatient(results);
        //displayResults(results);
        console.log('Done!');
    });
}

function processLogFile(err, data, callback) {
    if (err) {
        return callback('Error reading file:' + err);
    }

    var rawLogLines = data.split('\n');
    //Filter out empty strings
    var logLines = _.filter(rawLogLines, function(rawItem) {
        return rawItem;
    });

    _.each(logLines, function(line) {
        try {
            var result = JSON.parse(line);
            checkForPatientSyncError(result);
        } catch (e) {
            log.debug('processLogFile: Error parsing JSON (File might not be a bunyan log): ' + e);
        }
    });

    callback(err, 'success');
}

function checkForPatientSyncError(logLineObject) {
    var errorMessages = diagnosticsConfig.errorMessages;
    var msg = logLineObject.msg;
    var level = logLineObject.level;

    if (!level) {
        return log.debug('\'level\' property is missing from log json');
    } else if (level !== 50) {
        return; // console.log('Skipping, not an error message.');
    } else if (!msg) {
        return log.debug('\'msg\' property is missing from log json');
    }

    totalErrorCount++;

    var handlerName = getHandlerName(logLineObject.name);
    if (!handlerName) {
        return log.debug('\'name\' property is missing from log json');
    }

    if(!_.contains(handlersWithErrors, handlerName)) {handlersWithErrors.push(handlerName);}

    var handlerErrorMsgs = errorMessages[handlerName];
    if (!handlerErrorMsgs) {
        return log.debug('No messages to scan for are configured for this handler: ' + handlerName);
    }

    _.each(handlerErrorMsgs, function(messageToScanFor) {
        if (msg.indexOf(messageToScanFor) !== -1) {
            //We have a match!
            //Get a pid if it is there, otherwise use 'No pid'
            //Add logLineObject to results, organize by pid]
            patientSyncErrorCount++;

            var pid = 'No_pid';
            var pidsInMessage = msg.match(/(((([0-9]|[A-F]){4})|(DOD));[0-9]+)|(((HDR)|(VLER));([0-9]+V[0-9]+))|([0-9]+V[0-9]+)/g);
            if (pidsInMessage) {
                //Error messages pertain to 1 patient, so just take the first item found by the match
                pid = pidsInMessage[0];
            }

            if (!results[pid]) {
                results[pid] = {};
                results[pid].pid = pid;
                results[pid].handlers = {};
            }

            if (!results[pid].handlers[handlerName]) {
                results[pid].handlers[handlerName] = {
                    name: handlerName,
                    errorsFound: []
                };
            }

            results[pid].handlers[handlerName].errorsFound.push(logLineObject);

            // console.log(logLineObject);
        }
    });
}

function getHandlerName(name) {
    if (!name) {
        return null;
    } else if (/jmeadows-sync-\w+-request/.test(name)) {
        return 'jmeadows-sync-domain-request';
    } else if (/hdr-sync-\w+-request/.test(name)) {
        return 'hdr-sync-domain-request';
    } else if (/poller-host.([0-9]|[A-F]){4}/.test(name)){
        return 'poller-host';
    } else if (/vista-([0-9]|[A-F]){4}-subscribe-request/.test(name)){
        return 'vista-subscribe-request';
    } else {
        return name;
    }
}

function sortResultsByPatient(assortedResults){
    var jdsClient = new JdsClient(log, log, config);

    var organizedResults = {};
    var identifierList = _.keys(assortedResults);

    async.eachSeries(identifierList, function(id, callback){
        var pid = assortedResults[id];

        var correspondingJpid = pidToJpid[pid.pid];

        if(pid.pid === 'No_pid'){
            organizedResults[pid.pid] = pid;
            callback();
        } else if(!correspondingJpid){
            jdsClient.getPatientIdentifierByPid(pid.pid, function(error, response, result){
                if(error || !response || response.statusCode !== 200 || !result){
                    log.debug('Could not get corresponding patient identifiers for: ' + pid.pid);
                    organizedResults[pid] = pid;
                    callback();
                } else {
                    var jpid = result.jpid;
                    log.debug('Got jpid %s for pid %s', jpid, pid.pid);
                    organizedResults[jpid] = {
                        //jpid: jpid,
                        pid: jpid,
                        patientIdentifiers: result.patientIdentifiers,
                        handlers: assortedResults[pid.pid].handlers
                    };
                    _.each(result.patientIdentifiers, function(identifier){
                        pidToJpid[identifier] = jpid;
                    });
                    callback();
                }
            });
        } else {
            _.each(pid.handlers, function(handler){
                organizedResults[correspondingJpid].handlers[handler.name]=handler;
            });
            callback();
        }
    }, function(){
        log.debug('Async.eachSeries finished');
        patientsAffectedByErrorsCount = _.keys(organizedResults).length;
        displayResults(organizedResults);
    });
}

function displayResults(results) {
    console.log(clc.cyan.bold('\nSync Diagnostic Utility\n- Results of log file scan -'));
    console.log(clc.yellow('Total Logged Errors: ' + totalErrorCount + '\nPatient Sync Errors: ' + patientSyncErrorCount + '\nNumber of Patients Affected by Sync Errors: ' + patientsAffectedByErrorsCount + '\nSystem Components with Logged Errors: ' + handlersWithErrors + '\n\n'));
    console.log('Current time is: ' + moment.utc().format() + ' (UTC)\n');
    _.each(results, function(pid) {
        if(pid.patientIdentifiers){
            console.log(clc.red('Patient sync errors found for patient with identifiers: ') + clc.green.bold(pid.patientIdentifiers) + '\n');
        } else {
            console.log(clc.red('Patient sync errors found for: ') + clc.green.bold(pid.pid) + '\n');
        }

        _.each(pid.handlers, function(handler) {
            console.log(clc.blueBright.bold('\n' + handler.name));
            _.each(handler.errorsFound, function(logErrorObject) {
                log.show(logErrorObject);
            });
        });
        console.log('\n');
    });

    //Explicit exit because jds client will leave a persistent socket open
    process.exit();
}
