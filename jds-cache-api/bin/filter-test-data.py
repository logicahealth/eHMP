#!/usr/bin/env python
# -*- coding: utf-8 -*-

# To run integration tests without requiring a full patient sync from the
# backend, we want to capture the network traffic while a patient gets synced,
# so that we can send the same requests adding the patient data in the future.
# This only needs to be done occasionally, when the test data for a patient
# gets updated.
#
# Overview:
# 1. Capture network data
# 2. Convert request data into the request.js configuration format
# 3. Replace the patient identifiers with custom non-conflicting identifiers
# 4. Send the captured requests to create the test patient before integration tests
#
# Detail:
#
# 1. Capture network data
#
# Get JDS to a clean state first:
# $ gradle resetSync
#
# Install tcpdump or wireshark on the host, and install wireshark on the client, then start the network capture
# (tcpdump version)
# $ ssh jds sudo -i "tcpdump -U -w - -B 10240 -s 0 -l -i any 'tcp port PORT or tcp port PORT'" | wireshark -k -i -
# (wireshark version)
# $ ssh jds sudo -i "tshark -w - -B 10240 -i any -F libpcap -f 'tcp port PORT or tcp port PORT'"|wireshark -k -i -
#
# Synchronize a patient, wait for completion, ensure data looks good, save a pcapng file from Wireshark
#
#
# 2. Convert request data into the request.js configuration format
#
# Convert the pcapng file to a JSON file
# $ tshark -r captured.pcapng -T json > captured.json
# Run this file to do the conversion
# $ filter-test-data.py > itest-data.json
#
# 3. Replace the patient identifiers with custom non-conflicting identifiers
# (don't forget both ; and : separators, don't forget lowercase)
#
# Use these commands to check the patient identifiers in the file:
# $ cat itest-data.json | grep -o '"uri":"/status/[^"/]*"' | sort -u
# $ grep patientIdentifiers itest-data.json
# $ cat itest-data.json | grep '/status' | grep -o '"localId":"[^"]*"' | sort -u
#
# These commands were used to replace the patient identifiers for SITE;3:
# $ sed -i.bak 's/SITE;3/SITE;3000000000/g' itest-data.json
# $ sed -i.bak 's/SITE;3/SITE;3000000000/g' itest-data.json
# $ sed -i.bak 's/9e7a;3/9e7a;3000000000/g' itest-data.json
# $ sed -i.bak 's/c877;3/c877;3000000000/g' itest-data.json
# $ sed -i.bak 's/SITE:3:3/SITE:3000000000:3000000000/g' itest-data.json
# $ sed -i.bak 's/SITE:3:3/SITE:3000000000:3000000000/g' itest-data.json
# $ sed -i.bak 's/9e7a:3:3/9e7a:3000000000:3000000000/g' itest-data.json
# $ sed -i.bak 's/c877:3:3/c877:3000000000:3000000000/g' itest-data.json
# $ sed -i.bak 's/SITE:3:/SITE:3000000000:/g' itest-data.json
# $ sed -i.bak 's/9e7a:3:/9e7a:3000000000:/g' itest-data.json
# $ sed -i.bak 's/SITE:3:/SITE:3000000000:/g' itest-data.json
# $ sed -i.bak 's/c877:3:/c877:3000000000:/g' itest-data.json
# $ sed -i.bak 's/32758/30000/g' itest-data.json
# $ sed -i.bak 's/10108V420871/10108V300000/g' itest-data.json
# $ sed -i.bak 's/"0000000003"/"3000000000"/g' itest-data.json
# $ sed -i.bak 's/DOD;0000000003/DOD;3000000000/g' itest-data.json
# $ sed -i.bak 's/"localId":"3"/"localId":"3000000000"/g' itest-data.json
# $ sed -i.bak 's/"localId":"3"/"localId":"3000000000"/g' itest-data.json
# These commands were used to replace the patient identifiers for SITE;22:
# $ sed -i.bak 's/SITE;22/SITE;-22/g' itest-data.json
# $ sed -i.bak 's/SITE:22:22/SITE:-22:-22/g' itest-data.json
# $ sed -i.bak 's/SITE:22/SITE:-22/g' itest-data.json
#
# 4. Send the captured requests to create the test patient before integration tests
# This is done by stuff-test-data.js, which is
# included as part of the `npm run test:int` script

from __future__ import print_function
import json
import sys
import os
from collections import OrderedDict

# Prevent the script from accidentally being run;
# it may need edits by a developer before running
if len(sys.argv) < 2 or sys.argv[1] != '--dev':
    print('This script is only meant for development purposes.')
    print('Run it with the --dev flag.')
    sys.exit(1)

# node.js can only handle 256MB strings
json_path = os.path.dirname(os.path.realpath(__file__)) + '/../captured.json'
captured = json.loads(open(json_path).read())


def only_requests(item):
    try:
        return item['_source']['layers']['http']['http.request'] == '1'
    except KeyError:
        return False


def transform_to_request_format(item):
    result = OrderedDict()
    http_object = item['_source']['layers']['http']
    for value in http_object.values():
        if not isinstance(value, dict):
            continue
        if 'http.request.uri' in value:
            result['method'] = value['http.request.method']
            result['uri'] = value['http.request.uri']
            break
    if 'uri' not in result:
        print('description undefined', file=sys.stderr)
        print(repr(http_object), file=sys.stderr)
        return sys.exit(1)
    try:
        if http_object['http.content_type'] == 'application/json':
            result['json'] = True
            result['body'] = json.loads(http_object['http.file_data'])
        else:
            if 'http.file_data' in http_object:
                result['body'] = http_object['http.file_data']
    except KeyError:
        pass
    return result


def no_get_requests(item):
    return item['method'] != 'GET'


def no_ping_requests(item):
    return item['uri'] != '/ping'


def only_completed_jobs(item):
    if item['uri'] != '/job':
        return True
    try:
        return item['body']['status'] == 'completed'
    except KeyError:
        return False


captured = filter(only_requests, captured)
captured = map(transform_to_request_format, captured)
captured = filter(no_get_requests, captured)
captured = filter(no_ping_requests, captured)
captured = filter(only_completed_jobs, captured)

print('[')
captured = ',\n'.join([json.dumps(item, separators=(',', ':')) for item in captured])
print(captured)
print(']')
