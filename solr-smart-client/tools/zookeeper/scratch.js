'use strict';

var zookeeper = require('node-zookeeper-client');

var argv = require('yargs')
  .usage('Usage: $0 --zookeeper-connection <connect-string> --node-path <node-path>')
  .option('z', {
    alias: 'zookeeper-connection',
    default: 'IP             ',
    describe: 'zookeeper connection string (single or comma-delimited list)',
    type: 'string'
  })
  .option('n', {
    alias: 'node-path',
    default: '/live_nodes',
    describe: 'Path of the node to create',
    type: 'string'
  })
  .alias('?', 'help')
  .help('help')
  .argv;

var zooKeeperConnection = argv['zookeeper-connection'];
var nodePath = argv['node-path'];

var client = zookeeper.createClient(zooKeeperConnection);

client.on('state', function(state) {
  if (state === zookeeper.State.SYNC_CONNECTED) {
    console.log('sessionId: %s', client.getSessionId().toString('hex'));
    client.getChildren(nodePath, watch.bind(null, 1), function(error, children) {
      if (error) {
        console.log(error);
        return;
      }

      console.log('1: %s', children);

      client.getChildren(nodePath, watch.bind(null, 2), function(error, children) {
        if (error) {
          console.log(error);
          return;
        }
        console.log('2: %s', children);
      });
    });
  }
});

client.connect();

function watch(id, event) {
  console.log('id: %s', id, event);
}