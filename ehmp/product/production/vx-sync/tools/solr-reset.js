'use strict';

require('../env-setup');

var config = require(global.VX_ROOT + 'worker-config');
var solrSmartClient = require('solr-smart-client');
var log = require(global.VX_DUMMIES + 'dummy-logger');

var client = solrSmartClient.initClient(config.solrClient.core, config.solrClient.zooKeeperConnection, log);

client.deleteAll(function(error, response) {
    console.log(error, response);
});