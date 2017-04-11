pushd ~/Projects/vistacore/ehmp/product/production/vx-sync

node endpoints/unsync-request/unsync-request-endpoint.js --port 8090 | node_modules/.bin/bunyan -o short > ./logs/unsync.log &
