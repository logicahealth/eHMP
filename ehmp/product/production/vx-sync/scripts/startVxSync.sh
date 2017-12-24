pushd ~/Projects/vistacore/ehmp/product/production/vx-sync
beanstalkd -p 5000 -V -z 2000000 > ./logs/beanstalkd.log &
node pollerHost.js --site SITE --site SITE | node_modules/.bin/bunyan -o short > ./logs/vista-poller.log &
node endpoints/writeback/writeback-endpoint.js --port PORT | node_modules/.bin/bunyan -o short > ./logs/writeback.log &

node tools/beanstalk/admin-endpoint.js --port PORT > ./logs/admin-endpoint.log &

# The following line runs multiple processes
# Note: it uses node clustering so it should not go to production
node subscriberHost.js | node_modules/.bin/bunyan -o short > ./logs/subscriber-host.log &

node endpoints/vxs-endpoint.js --port 8080 | node_modules/.bin/bunyan -o short > ./logs/api.log &
popd
