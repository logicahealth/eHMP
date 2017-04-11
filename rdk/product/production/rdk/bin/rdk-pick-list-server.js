#!/usr/bin/env node
'use strict';

var path = require('path');
var rdk = require('../src/core/rdk');

var ROOT = path.resolve(__dirname, '..');

var app = rdk.appfactory().defaultConfigFilename('../../config/rdk-pick-list-server-config.json').argv(process.argv).build();

app.register('/', ROOT + '/src/write/pick-list/pick-list-resources');
app.register('/progress-notes-titles-asu-filtered', ROOT + '/src/write/pick-list/progressnotes/progress-notes-titles-endpoint');

require('../src/write/pick-list/pick-list-in-memory-rpc-call').loadLargePickLists(app);

var port = app.config.appServer.port;
var server = app.rdkListen(port, function() {
    var address = server.address();
    app.logger.info('Writeback Pick List Service listening at http://%s:%s', address.host, address.port);
});
