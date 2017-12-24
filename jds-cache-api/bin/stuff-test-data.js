#!/usr/bin/env node
'use strict';
/* eslint-disable no-console */

require('../tests/integrationtests/_environment-setup');

const async = require('async');
const request = require('request');

const jdsBaseUrl = `http://${process.env.JDS_IP_ADDRESS}:${process.env.JDS_HTTP_PORT}`;

const maxLineWidth = 79;
let lineWidth = 0;
let responseCount = 0;

return main();

/**
 */
function main() {
    getRequiredRequests((err, requests) => {
        if (err) {
            console.log('err', err);
            return process.exit(1);
        }
        if (requests.length === 0) {
            console.log('Test data already exists.');
            return;
        }
        sendRequests(requests);
    });
}

/**
 * @param {Array} requests
 */
function sendRequests(requests) {
    let progressWidthMessage = ',- Stuffing test data into JDS ';
    progressWidthMessage += new Array(maxLineWidth - progressWidthMessage.length).join('-') + ',';
    console.log(progressWidthMessage);

    async.eachSeries(requests, (req, callback) => {
        req.baseUrl = jdsBaseUrl;
        let attemptCount = 0;
        sendRequest();

        /**
         */
        function sendRequest() {
            request(req, (error, response, body) => {
                if (error) {
                    if (error.code === 'ENETUNREACH' && attemptCount < 5) {
                        // work around VirtualBox network bug
                        attemptCount += 1;
                        process.stdout.write('\x07'); // bell
                        return setTimeout(sendRequest, 300);
                    }
                    process.stdout.write('\n');
                    console.error('error', error);
                    process.exit(1);
                }
                responseCount++;
                if (maxLineWidth * responseCount / requests.length > lineWidth) {
                    if (lineWidth === 0 || lineWidth === maxLineWidth - 1) {
                        process.stdout.write('\'');
                    } else {
                        process.stdout.write('=');
                    }
                    lineWidth++;
                }
                setImmediate(callback);
            });
        }
    }, (error) => {
        process.stdout.write('\n');
        if (error) {
            console.error('error', error);
            process.exit(1);
        }
        console.log('Done');
    });
}

/**
 * @param {function(null, Array)} callback
 */
function getRequiredRequests(callback) {
    let requests = [];
    request.get({
        baseUrl: jdsBaseUrl,
        url: '/statusod/SITE'
    }, (error, response) => {
        if (error || response.statusCode !== 200) {
            requests = requests.concat(require(__dirname + '/../tests/integrationtests/itest-data-odata.json'));
        }
        request.get({
            baseUrl: jdsBaseUrl,
            url: '/status/10108V300000'
        }, (error, response) => {
            if (error || response.statusCode !== 200) {
                requests = requests.concat(require(__dirname + '/../tests/integrationtests/itest-data-SITE-3.json'));
            }
            request.get({
                baseUrl: jdsBaseUrl,
                url: '/status/SITE;-22'
            }, (error, response) => {
                if (error || response.statusCode !== 200) {
                    requests = requests.concat(require(__dirname + '/../tests/integrationtests/itest-data-SITE-22.json'));
                }
                return callback(null, requests);
            });
        });
    });
}
