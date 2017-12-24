'use strict';

let SolrSmartClient = require('../../solr-smart-client').SolrSmartClient;

let logger = require('bunyan').createLogger({
  name: 'test',
  level: 'debug'
});

let config = {
  dataTimeoutMillis: 5000,
  core: 'vpr',
  zooKeeperConnection: 'IP             ',
  path: '/test/state.json',
  nodeEventLogLevel: 'debug',
  zookeeperEventLogLevel: 'debug',
  zooKeeperOptions: {
    retries: 3
  }
};


let solrSmartClient = new SolrSmartClient(logger, config);
solrSmartClient.start();




