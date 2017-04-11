#!/bin/bash
#
# run-update.sh
#
# Sets up and runs the record-update subenvironment
#
# MUST BE RUN FROM /opt/vxsync_client

DIR="/opt/vxsync_client/data/record-update/beanstalk"

if [ ! -d $DIR ]; then
 echo Creating beanstalk persistence directory for record-update...
 mkdir -p $DIR
fi

# kill first 7 processes when this script is exited (via Ctrl+C or other signal that closes the script)
trap 'kill %1; kill %2; kill %3; kill %4; kill %5; kill %6; kill %7; echo Record Update Subenvironment closed.' EXIT

#run persistent beanstalk
beanstalkd -p 4999 -b data/record-update/beanstalk -f0 -V -z 20000000 > /var/log/vxsync/beanstalkd.log &

#run error-request
/usr/local/bin/node ./subscriberHost.js --profile error --config-override /opt/vxsync_client/record-update/update-config.json > /var/log/vxsync/update-error.log &

# Run 5 instances of record update handlers
# To add more instances:
# 1. Copy and paste one of the subcriberHost.js --profile update lines below
# 2. Add a "kill %<number>" to the trap command on line 17
# 3. Add a "%<number>" to the wait command at the bottom of this script
#    (this allows the new process to be closed when this run-update.sh script is closed.)
/usr/local/bin/node ./subscriberHost.js --profile update --config-override /opt/vxsync_client/record-update/update-config.json > /var/log/vxsync/subscriberHost-update.log &
/usr/local/bin/node ./subscriberHost.js --profile update --config-override /opt/vxsync_client/record-update/update-config.json > /var/log/vxsync/subscriberHost-update.log &
/usr/local/bin/node ./subscriberHost.js --profile update --config-override /opt/vxsync_client/record-update/update-config.json > /var/log/vxsync/subscriberHost-update.log &
/usr/local/bin/node ./subscriberHost.js --profile update --config-override /opt/vxsync_client/record-update/update-config.json > /var/log/vxsync/subscriberHost-update.log &
/usr/local/bin/node ./subscriberHost.js --profile update --config-override /opt/vxsync_client/record-update/update-config.json > /var/log/vxsync/subscriberHost-update.log &

echo run-update.sh: Record Update Subenvironment is running.
echo Press ctrl+c to close the subenvironment.
echo
echo Note:
echo To run this script in the background, start it followed by an \& as shown below:
echo sudo ./record-update/run-update.sh \&
echo When running this script in the backgorund, it can only be closed via kill command, so take note of the process id.

wait %1 %2 %3 %4 %5 %6 %7