#!/bin/bash
# Patient Unsubscribe Utility
#
# Author: E. Clarke
#
# Usage: ./solr-reindex.sh -pid <string>
#
# Options:
#	-pid <string> : pid of patient to re-index.
pushd ../..
node ./tools/solr/solr-reindex.js $@ | node_modules/.bin/bunyan -o short
popd
