pushd /opt/vxsync
beanstalkd -p 5001 -b data/beanstalk-1 -f0 -V -z 2000000 > ./logs/beanstalkd-1.log &
VXSYNC_LOG_SUFFIX=subscriberHost-enrichment-1 node subscriberHost.js --profile enrichment &
VXSYNC_LOG_SUFFIX=subscriberHost-enrichment-2 node subscriberHost.js --profile enrichment &
VXSYNC_LOG_SUFFIX=subscriberHost-enrichment-3 node subscriberHost.js --profile enrichment &
VXSYNC_LOG_SUFFIX=subscriberHost-enrichment-4 node subscriberHost.js --profile enrichment &
popd
