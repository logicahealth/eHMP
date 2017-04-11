pushd /opt/vxsync
VXSYNC_LOG_SUFFIX=admin-endpoint node tools/beanstalk/admin-endpoint.js --port 9999 &
VXSYNC_LOG_SUFFIX=writebackEndpoint node endpoints/writeback/writeback-endpoint.js --port 9090 &
VXSYNC_LOG_SUFFIX=subscriberHost-primary node subscriberHost.js --profile primary &
VXSYNC_LOG_SUFFIX=subscriberHost-jmeadows node subscriberHost.js --profile jmeadows &
VXSYNC_LOG_SUFFIX=subscriberHost-hdr node subscriberHost.js --profile hdr &
VXSYNC_LOG_SUFFIX=subscriberHost-vler node subscriberHost.js --profile vler &
VXSYNC_LOG_SUFFIX=subscriberHost-pgd node subscriberHost.js --profile pgd &
VXSYNC_LOG_SUFFIX=subscriberHost-document-1 node subscriberHost.js --profile document &
VXSYNC_LOG_SUFFIX=subscriberHost-document-2 node subscriberHost.js --profile document &
VXSYNC_LOG_SUFFIX=subscriberHost-document-3 node subscriberHost.js --profile document &
VXSYNC_LOG_SUFFIX=subscriberHost-post node subscriberHost.js --profile post &
VXSYNC_LOG_SUFFIX=subscriberHost-error node subscriberHost.js --profile error &
VXSYNC_LOG_SUFFIX=syncRequestEndpoint node endpoints/vxs-endpoint.js --port 8080 &
popd
