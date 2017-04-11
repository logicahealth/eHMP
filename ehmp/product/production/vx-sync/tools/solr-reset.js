'use strict';

require('../env-setup');

var config = require(global.VX_ROOT + 'worker-config');
var solr = require('solr-client');

var client = solr.createClient(config.solrClient);

client.UPDATE_JSON_HANDLER = 'update';

client.deleteAll(function(error, response) {
    console.log(error, response);
});