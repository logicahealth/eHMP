pushd ~/Projects/vistacore/ehmp/product/production/vx-sync
beanstalkd -p 5000 -b data -f0 -V -z 2000000 > ./logs/beanstalkd.log &
VXSYNC_LOG_SUFFIX=pollerHost-SITE node pollerHost.js --site SITE &
VXSYNC_LOG_SUFFIX=pollerHost-SITE node pollerHost.js --site SITE &
VXSYNC_LOG_SUFFIX=pollerHost-2929 node pollerHost.js --site 2929 &
VXSYNC_LOG_SUFFIX=pollerHost-FFC7 node pollerHost.js --site FFC7 &
VXSYNC_LOG_SUFFIX=admin-endpoint node tools/beanstalk/admin-endpoint.js --port PORT &
VXSYNC_LOG_SUFFIX=writebackEndpoint node endpoints/writeback/writeback-endpoint.js --port 9090 &
VXSYNC_LOG_SUFFIX=error-processor node errorProcessorHost.js &
VXSYNC_LOG_SUFFIX=subscriberHost-primary node subscriberHost.js --profile primary &
VXSYNC_LOG_SUFFIX=subscriberHost-vistaprocessor node subscriberHost.js --profile vistaProcessor &
VXSYNC_LOG_SUFFIX=subscriberHost-vistahdr node subscriberHost.js --profile vistahdr &
VXSYNC_LOG_SUFFIX=subscriberHost-jmeadows node subscriberHost.js --profile jmeadows &
VXSYNC_LOG_SUFFIX=subscriberHost-hdr node subscriberHost.js --profile hdr &
VXSYNC_LOG_SUFFIX=subscriberHost-vler node subscriberHost.js --profile vler &
VXSYNC_LOG_SUFFIX=subscriberHost-pgd node subscriberHost.js --profile pgd &
VXSYNC_LOG_SUFFIX=subscriberHost-document-1 node subscriberHost.js --profile document &
VXSYNC_LOG_SUFFIX=subscriberHost-document-2 node subscriberHost.js --profile document &
VXSYNC_LOG_SUFFIX=subscriberHost-document-3 node subscriberHost.js --profile document &
VXSYNC_LOG_SUFFIX=subscriberHost-storage-1 node subscriberHost.js --profile storage &
VXSYNC_LOG_SUFFIX=subscriberHost-storage-2 node subscriberHost.js --profile storage &
VXSYNC_LOG_SUFFIX=subscriberHost-storage-3 node subscriberHost.js --profile storage &
VXSYNC_LOG_SUFFIX=subscriberHost-storage-4 node subscriberHost.js --profile storage &
VXSYNC_LOG_SUFFIX=subscriberHost-storage-5 node subscriberHost.js --profile storage &
VXSYNC_LOG_SUFFIX=subscriberHost-storage-6 node subscriberHost.js --profile storage &
VXSYNC_LOG_SUFFIX=subscriberHost-enrichment node subscriberHost.js --profile enrichment &
VXSYNC_LOG_SUFFIX=subscriberHost-prioritization node subscriberHost.js --profile prioritization &
VXSYNC_LOG_SUFFIX=subscriberHost-publish node subscriberHost.js --profile publish &
VXSYNC_LOG_SUFFIX=subscriberHost-error node subscriberHost.js --profile error &
VXSYNC_LOG_SUFFIX=syncRequestEndpoint node endpoints/vxs-endpoint.js --port 8080 &
popd
