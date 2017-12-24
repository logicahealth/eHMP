'use strict';

let solrSmartClient = require('../../solr-smart-client');

let logger = require('bunyan').createLogger({
  name: 'test',
  level: 'debug'
});

let config = {
  dataTimeoutMillis: 5000,
  core: 'vpr',
  zooKeeperConnection: 'IP             ',
  path: '/collections/state.json',
  nodeEventLogLevel: 'debug',
  zookeeperEventLogLevel: 'debug',
  zooKeeperOptions: {
    retries: 3
  }
};


let solrClient = solrSmartClient.createClient(logger, config);


solrClient.search('PID:1', function(error, data) {
  console.log(error);
  console.log(data);

  solrClient.search('PID:1', function(error, data) {
    console.log(error);
    console.log(data);

    process.exit();
  });
});


