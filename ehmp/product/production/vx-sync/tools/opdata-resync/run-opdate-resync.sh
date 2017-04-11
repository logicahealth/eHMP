#!/bin/bash
cd ../../
node tools/opdata-resync/vista-site-opdata-resync-util.js "$@" | node_modules/bunyan/bin/bunyan -o short
