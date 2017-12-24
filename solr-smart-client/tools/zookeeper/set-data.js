'use strict';

var zookeeper = require('node-zookeeper-client');

var argv = require('yargs')
  .usage('Usage: $0 --zookeeper-connection <connect-string> --node-path <node-path> --data <data>')
  .option('z', {
    alias: 'zookeeper-connection',
    default: 'IP             ',
    describe: 'zookeeper connection string (single or comma-delimited list)',
    type: 'string'
  })
  .option('n', {
    alias: 'node-path',
    default: '/test/state.json',
    describe: 'Path of the node for which to set data',
    type: 'string'
  })
  .option('d', {
    alias: 'data',
    default: 'test',
    describe: 'data to set',
    type: 'string'
  })
  .alias('?', 'help')
  .help('help')
  .argv;

var zooKeeperConnection = argv['zookeeper-connection'];
var nodePath = argv['node-path'];
var data = argv.data ? new Buffer(argv.data) : null;

var client = zookeeper.createClient(zooKeeperConnection);

client.on('state', function(state) {
	if (state === zookeeper.State.SYNC_CONNECTED) {
    console.log('sessionId: %s', client.getSessionId().toString('hex'));
		client.setData(nodePath, data, function(error, data) {
			client.close();

			if (error) {
				console.log(error);
				process.exit(1);
			}

			console.log('Data at %s: %s', nodePath, data);
			process.exit();
		});
	}
});

client.connect();