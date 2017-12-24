pushd /opt/vxsync
VXSYNC_LOG_SUFFIX=pollerHost-SITE node pollerHost.js --site SITE &
popd
