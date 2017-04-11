#!/bin/bash
#
# run-update.sh
#
# Sets up and runs the record-update subenvironment
#
# MUST BE RUN FROM /opt/vxsync

DIR="/opt/vxsync/data/record-update/beanstalk"

if [ ! -d $DIR ]; then
 echo Creating beanstalk persistence directory for record-update...
 mkdir -p $DIR
fi

# kill first two processes when this script is Ctrl+C'd
trap 'kill %1; kill %2; kill %3; echo Subenvironment closed.' EXIT

#run persistent beanstalk
beanstalkd -p 4999 -b data/record-update/beanstalk -f0 -V -z 20000000 > /var/log/vxsync/beanstalkd.log &

#run error-request
/usr/local/bin/node ./subscriberHost.js --profile error --config-override /opt/vxsync/record-update/update-config.json > /var/log/vxsync/update-error.log &

#run record-update
/usr/local/bin/node ./subscriberHost.js --profile update --config-override /opt/vxsync/record-update/update-config.json > /var/log/vxsync/subscriberHost-update.log &

echo run-update.sh: Record Update Subenvironment is running.
echo Press ctrl+c to close the subenvironment.

wait %1 %2 %3