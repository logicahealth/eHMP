#!/bin/bash

#usage: sudo ./record-update/utils/run-record-re-enrichment-util.sh --pid "9E7A;3" --domain allergy --updateTime 20071217151354

/usr/local/bin/node ./record-update/utils/run-record-re-enrichment-util.js $@ | /usr/local/bin/node ./node_modules/.bin/bunyan -o short