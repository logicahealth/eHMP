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
    default: '/test/state.json',
    describe: 'Path of the node to remove',
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
    client.remove(nodePath, function(error) {
      client.close();

      if (error) {
        console.log(error);
        process.exit(1);
      }

      console.log('Removed %s', nodePath);
      process.exit();
    });
  }
});

client.connect();