#!/bin/sh
node ./mockHdrPubSub/mockHdr.js &
node mock-server.js "$@" | node_modules/.bin/bunyan
