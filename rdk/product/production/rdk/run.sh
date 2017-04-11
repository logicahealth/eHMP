#!/bin/sh
NODE_ENV='production' node bin/rdk-fetch-server.js "$@" | node_modules/.bin/bunyan
