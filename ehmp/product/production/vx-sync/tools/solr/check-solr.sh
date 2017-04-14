
#!/bin/bash
# Patient Unsubscribe Utility
#
# Author: E. Clarke
#
# Usage: ./check-solr.sh -startdate <string> -enddate <string>
#
# Options:
#	-startdate <string> : startdate of patient syncs to check.
#	-enddate <string> : enddate of patient syncs to check.
pushd ../..
node ./tools/solr/check-solr.js $@ | node_modules/.bin/bunyan -o short
popd

