/*jslint node: true */
'use strict';

var config = require('./config.js');
var bunyan = require('bunyan');
var logger = bunyan.createLogger(config.logger);
var _ = require('lodash');
var async = require('async');
var fs = require('fs');

var data_path = '/data/hdr/';
var data_file_extension = '.json';
var no_content = 204;

function fetchHdrData(pid, domain, excludeIdentifier, res, actualpid) {
    logger.debug('mockHdrProcess.fetchHdrData() pid=%s domain=%s excludeIdentifier=%s', pid, domain, excludeIdentifier);
    if (!actualpid) {
        actualpid = pid;
    }

    var filename = __dirname + data_path + pid + '/' + domain + data_file_extension;
    fs.exists(filename, function (exists) {
        if (!exists) {
            if (pid != 'default') {
                logger.trace('No ' + domain + ' data found for ' + pid + '; checking for default ' + domain + ' data');
                fetchHdrData('default', domain, excludeIdentifier, res, pid);
                return;
            } else {
                logger.debug('No ' + domain + ' data found for ' + actualpid);
                res.status(no_content).end();
                return;
            }
        }

        var data = require(filename);

        if (pid === 'default') {
            // Replace the patient ID portion of the UID with the (actual) pid.
            _.each(data.sites, function(siteData) {
                var uid = siteData.data.items[0].uid;
                logger.debug('mockHdrProcess.fetchHdrData: uid found was %s', uid);
                var uidFields = uid.split(':');
                logger.debug('mockHdrProcess.fetchHdrData: replacing %a with %b', uidFields[4], actualpid);
                uidFields[4] = actualpid;
                uid = uidFields[0];
                for (var i = 1; i < uidFields.length; i++) {
                    uid = uid + ':' + uidFields[i];
                }
                logger.debug('mockHdrProcess.fetchHdrData: uid being stored is %s', uid);
                siteData.data.items[0].uid = uid;
            });
        }

        res.type('application/json').send(data);
        logger.debug(filename + ' sent');
    });
}


module.exports.fetchHdrData = fetchHdrData;
