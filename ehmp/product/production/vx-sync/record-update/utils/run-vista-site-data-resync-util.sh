#!/bin/bash

#usage: sudo ./record-update/utils/run-vista-site-data-resync-util.sh --site 9E7A,C877 --domain allergy --updateTime 20071217151553

/usr/local/bin/node ./record-update/utils/run-vista-site-data-resync-util.js $@ | /usr/local/bin/node ./node_modules/.bin/bunyan -o short