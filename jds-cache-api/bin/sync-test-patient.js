#!/usr/bin/env node
'use strict';
/* eslint-disable no-console */

require('../tests/integrationtests/_environment-setup');

const _ = require('lodash');
const request = require('request');

const SYNC_TIMEOUT = 6000000;  // 100 minutes

const pidsToSync = [
    'SITE;3',
    'SITE;22'
];

let lineWidth = 0;

return main();

/**
 */
function main() {
    let syncedPids = 0;
    _.each(pidsToSync, (pid) => {
        syncPatient(pid, (error) => {
            if (error) {
                console.log(error);
                return process.exit(1);
            }
            syncedPids++;
            if (syncedPids === pidsToSync.length) {
                process.exit(0);
            }
        });
    });
}

/**
 * @param {string} pid
 * @param {function(*)} callback Gets an error argument if there was an error
 */
function syncPatient(pid, callback) {
    const syncStart = new Date();

    console.log('Checking test patient sync status.');

    checkSyncStatus(function (error, isSynced) {
        if (error) {
            return callback(error);
        }

        if (isSynced) {
            console.log('Patient already synced.');
            lineWidth = 0;
            return callback();
        }

        console.log('Syncing ' + pid + '...');
        lineWidth = 0;

        request.get({
            baseUrl: process.env.VXSYNC_URL,
            url: '/sync/doLoad',
            json: true,
            qs: {
                pid: pid
            }
        }, function(error) {
            if (error) {
                return callback(error);
            }
            return setImmediate(waitForSyncComplete);
        });
    });

    /**
     * @param {function} callback
     */
    function checkSyncStatus(callback) {
        request.get({
            baseUrl: process.env.VXSYNC_URL,
            url: '/sync/status',
            json: true,
            qs: {
                pid: pid
            }
        }, function(error, response, body) {
            if (error) {
                return callback(error);
            }

            if (_.isObject(body) && _.isEmpty(body.jobStatus) && !body.inProgress) {
                return callback(null, true);
            }

            const errors = _.compact(_.map(_.get(body, 'jobStatus'), 'error'));
            if (!_.isEmpty(errors)) {
                return callback(new Error(JSON.stringify(errors)), false);
            }

            return callback(null, false);
        });

    }

    /**
     * Poll the sync status until the patient is synced or the timeout is reached.
     * Calls the syncPatient callback.
     *
     * @return {*}
     */
    function waitForSyncComplete() {
        const currentTime = new Date();
        const syncOverTimeLimit = currentTime - syncStart >= SYNC_TIMEOUT;

        if (syncOverTimeLimit) {
            return callback('Not synced in time.');
        }

        process.stdout.write('.');
        lineWidth++;
        if (lineWidth >= 79) {
            process.stdout.write('\n');
            lineWidth = 0;
        }
        checkSyncStatus(function (error, isSynced) {
            if (error) {
                return callback(error);
            }
            if (isSynced) {
                console.log('\nSync for ' + pid + ' complete.');
                lineWidth = 0;
                return callback();
            }
            return setTimeout(waitForSyncComplete, 5000);
        });
    }
}

