#!/bin/sh
node ./mockHdrPubSub/mockHdr.js &
node ./mockVix/mockVix.js &
node mock-server.js "$@" | node_modules/.bin/bunyan
