'use strict';

//var fs = require('fs');
var format = require('util').format;
var path = require('path');
var crypto = require('crypto');
var fs = require('fs');
var _ = require('underscore');

function getPatientDirByJob(job) {
    var uidUtil = require(global.VX_UTILS + 'uid-utils');
    var eventid = uidUtil.extractLocalIdFromUID(job.record.uid);
    var pidHex = new Buffer(job.patientIdentifier.value, 'utf8');
    return pidHex.toString('hex') + '/' + eventid;
}

function getPatientTopDirAbsPath(identifier, config) {
    var pidHex = new Buffer(identifier, 'utf8');
    return path.resolve(config.documentStorage.publish.path + '/' +  pidHex.toString('hex'));
}

function getDodComplexNoteUri(uriRoot, dir, htmlFilename) {
    return format(uriRoot + '?dir=%s&file=%s', dir, htmlFilename);
}

function getDocOutPathByJob(job, config) {
    var dir = getPatientDirByJob(job);
    return getDocOutPath(dir, config);
}

function getDocOutPath(dir, config) {
    return path.resolve(config.documentStorage.publish.path + '/' + dir);
}

function getPdfDocPathByJob(job, config) {
    var pdfFile = config.documentStorage.staging.path + '/' + job.record.fileJobId + '/' + job.record.fileId;
    return path.resolve(pdfFile);
}

function getSha1Filename(hashInput, fileExt) {
    var sha = crypto.createHash('sha1');
    sha.update(hashInput, 'binary');
    return sha.digest('hex') + fileExt;
}

function getStagingPermissons(config) {
    return config.documentStorage.staging.permissions;
}

function getTempStagingFilePath(config, job) {
    return path.resolve(config.documentStorage.staging.path + '/' + job.jobId);
}

/**
 * This method can be utilized to get the file size of all documents stored for a PID.
 * Callers should pass in each PID associated with a patient as a string to get the total
 * size for a patient's documents from all sources.
 *
 * Parameters
 * pid - A single source's PID as a string
 * config - VX Sync config obj
 * Returns the size of the PIDs documents on the VX-Sync published document file system,
 * or NO_DOCUMENTS if no documents are found for the PID.  Other PIDs associated with the JPID
 * may still have documents, and documents still being stored by the sync process will not
 * be included in the total size.
 */
function getPatientDocSize(pid, config) {
    // console.log('Looking for documents for PID: ' + pid);
    var pidHex = new Buffer(pid, 'utf8').toString('hex');
    var patientDocPath = path.resolve(config.documentStorage.publish.path + '/' + pidHex);
    // console.log('Checking size in path: ' + patientDocPath);
    if (!fs.existsSync(patientDocPath)) { 
        // console.log('Patient path does not exist.');
        return 'NO_DOCUMENTS';
    } else {
        var pidSize = getDirSize(patientDocPath);
        // console.log('PID size: ' + pidSize);
        return pidSize;
    }
}

function getDirSize(path) {
    // console.log('Checking path[1]: ' + path);
    if (!fs.existsSync(path)) {
        // console.log('Path does not exist.[2]');
        return 0;
    }
    var files = fs.readdirSync(path);
    // console.log('Read files:');
    // console.log(files);
    var size = 0;
    _.each(files, function(file) {
        var filePath = path + '/' + file;
        // console.log('Checking path[2]: ' + filePath);
        if (!fs.existsSync(filePath)) { return; }
        // console.log('Path exists.');
        var fileStat = fs.statSync(filePath);
        if (fileStat.isFile()) {
            // console.log('Path is file, size: ' + fileStat.size);
            size += fileStat.size;
        } else if (fileStat.isDirectory()) {
            // console.log('Path is folder, recursing.');
            var dirSize = getDirSize(filePath);
            // console.log('Popped recursion, dirSize: ' + dirSize);
            size += dirSize;
        }
        // console.log('New tree size: ' + size);
    });
    // console.log('Final tree size for ' + path + ': ' + size);
    return size;
}

/**************     file exists is not protected against race conditions         ***************/
module.exports.getPatientDirByJob = getPatientDirByJob;
module.exports.getStagingPermissons = getStagingPermissons;
module.exports.getTempStagingFilePath = getTempStagingFilePath;
module.exports.getPatientTopDirAbsPath = getPatientTopDirAbsPath;
module.exports.getDodComplexNoteUri = getDodComplexNoteUri;
module.exports.getPdfDocPathByJob = getPdfDocPathByJob;
module.exports.getSha1Filename = getSha1Filename;
module.exports.getDocOutPath = getDocOutPath;
module.exports.getDocOutPathByJob = getDocOutPathByJob;
module.exports.getPatientDocSize = getPatientDocSize;
