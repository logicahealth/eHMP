pushd /opt/vxsync
beanstalkd -p 5002 -b data/beanstalk-2 -f0 -V -z 2000000 > ./logs/beanstalkd-2.log &
VXSYNC_LOG_SUFFIX=subscriberHost-storage-1 node subscriberHost.js --profile storage &
VXSYNC_LOG_SUFFIX=subscriberHost-storage-2 node subscriberHost.js --profile storage &
VXSYNC_LOG_SUFFIX=subscriberHost-storage-3 node subscriberHost.js --profile storage &
VXSYNC_LOG_SUFFIX=subscriberHost-storage-4 node subscriberHost.js --profile storage &
VXSYNC_LOG_SUFFIX=subscriberHost-storage-5 node subscriberHost.js --profile storage &
VXSYNC_LOG_SUFFIX=subscriberHost-storage-6 node subscriberHost.js --profile storage &
popd
