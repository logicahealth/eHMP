#!/usr/bin/env node
'use strict';

/* eslint-disable no-console */

// At the time of writing, node.js can only handle requiring json files <256MB
// so use filter-test-data.py instead

// To run integration tests without requiring a full patient sync from the
// backend, we want to capture the network traffic while a patient gets synced,
// so that we can send the same requests adding the patient data in the future.
// This only needs to be done occasionally, when the test data for a patient
// gets updated.
//
// Overview:
// 1. Capture network data
// 2. Convert request data into the request.js configuration format
// 3. Replace the patient identifiers with custom non-conflicting identifiers
// 4. Send the captured requests to create the test patient before integration tests
//
// Detail:
//
// 1. Capture network data
//
// Get JDS to a clean state first:
// $ gradle resetSync
//
// Install tcpdump or wireshark on the host, and install wireshark on the client, then start the network capture
// (tcpdump version)
// $ ssh jds sudo -i "tcpdump -U -w - -B 10240 -s 0 -l -i any 'tcp port PORT or tcp port PORT'" | wireshark -k -i -
// (wireshark version)
// $ ssh jds sudo -i "tshark -w - -B 10240 -i any -F libpcap -f 'tcp port PORT or tcp port PORT'"|wireshark -k -i -
//
// Synchronize a patient, wait for completion, ensure data looks good, save a pcapng file from Wireshark
//
//
// 2. Convert request data into the request.js configuration format
//
// Convert the pcapng file to a JSON file
// $ tshark -r captured.pcapng -T json > captured.json
// Run this file to do the conversion
// $ filter-test-data.js > itest-data.json
//
// 3. Replace the patient identifiers with custom non-conflicting identifiers
// (don't forget both ; and : separators, don't forget lowercase)
//
// Use these commands to check the patient identifiers in the file:
// $ cat itest-data.json | grep -o '"uri":"/status/[^"/]*"' | sort -u
// $ grep patientIdentifiers itest-data.json
// $ cat itest-data.json | grep '/status' | grep -o '"localId":"[^"]*"' | sort -u
//
// These commands were used to replace the patient identifiers for SITE;3:
// $ sed -i.bak 's/SITE;3/SITE;3000000000/g' itest-data.json
// $ sed -i.bak 's/SITE;3/SITE;3000000000/g' itest-data.json
// $ sed -i.bak 's/9e7a;3/9e7a;3000000000/g' itest-data.json
// $ sed -i.bak 's/c877;3/c877;3000000000/g' itest-data.json
// $ sed -i.bak 's/SITE:3:3/SITE:3000000000:3000000000/g' itest-data.json
// $ sed -i.bak 's/SITE:3:3/SITE:3000000000:3000000000/g' itest-data.json
// $ sed -i.bak 's/9e7a:3:3/9e7a:3000000000:3000000000/g' itest-data.json
// $ sed -i.bak 's/c877:3:3/c877:3000000000:3000000000/g' itest-data.json
// $ sed -i.bak 's/SITE:3:/SITE:3000000000:/g' itest-data.json
// $ sed -i.bak 's/9e7a:3:/9e7a:3000000000:/g' itest-data.json
// $ sed -i.bak 's/SITE:3:/SITE:3000000000:/g' itest-data.json
// $ sed -i.bak 's/c877:3:/c877:3000000000:/g' itest-data.json
// $ sed -i.bak 's/32758/30000/g' itest-data.json
// $ sed -i.bak 's/10108V420871/10108V300000/g' itest-data.json
// $ sed -i.bak 's/"0000000003"/"3000000000"/g' itest-data.json
// $ sed -i.bak 's/DOD;0000000003/DOD;3000000000/g' itest-data.json
// $ sed -i.bak 's/"localId":"3"/"localId":"3000000000"/g' itest-data.json
// $ sed -i.bak 's/"localId":"3"/"localId":"3000000000"/g' itest-data.json
// These commands were used to replace the patient identifiers for SITE;22:
// $ sed -i.bak 's/SITE;22/SITE;-22/g' itest-data.json
// $ sed -i.bak 's/SITE:22:22/SITE:-22:-22/g' itest-data.json
// $ sed -i.bak 's/SITE:22/SITE:-22/g' itest-data.json
//
// 4. Send the captured requests to create the test patient before integration tests
// This is done by stuff-test-data.js, which is
// included as part of the `npm run test:int` script

// Prevent the script from accidentally being run;
// it may need edits by a developer before running
if (process.argv[2] !== '--dev') {
    console.log('This script is only meant for development purposes.');
    console.log('Run it with the --dev flag.');
    process.exit(1);
}

const _ = require('lodash');

console.log('[');
console.log(require('../captured.json') // node.js can only handle 256MB strings!
    .filter(o => _.get(o, ['_source', 'layers', 'http', 'http.request']) === '1')
    // create request-compatible object
    .map(object => {
        let result = {};
        let httpObject = object._source.layers.http;
        let description = _.find(httpObject, 'http.request.method');
        if (_.isUndefined(description)) {
            console.log('description undefined');
            console.error(httpObject);
            process.exit(1);
        }
        result.method = description['http.request.method'];
        result.uri = description['http.request.uri'];
        if (httpObject['http.content_type'] === 'application/json') {
            result.json = true;
        }
        if (result.json) {
            result.body = JSON.parse(httpObject['http.file_data']);
        } else {
            if (!_.isEmpty(httpObject['http.file_data'])) {
                result.body = httpObject['http.file_data'];
            }
        }
        return result;
    })
    .filter(o => o.method !== 'GET')
    .filter(o => !_.includes(['/ping'], o.uri))
    // discard incomplete job data
    .filter(o => o.uri === '/job' ? o.body.status === 'completed' : true)
    .map(o => JSON.stringify(o))
    .join(',\n'));
console.log(']');
