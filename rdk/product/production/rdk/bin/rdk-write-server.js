#!/usr/bin/env node
'use strict';

var path = require('path');
var rdk = require('../src/core/rdk');

var ROOT = path.resolve(__dirname, '..');

var app = rdk.appfactory().defaultConfigFilename(ROOT + '/config/rdk-write-server-config.json').argv(process.argv).build();

//notes
//med-orders
//lab-orders
//consult-orders
//problems
//allergies
//immunizations
//vitals

app.register('/patient/:pid/allergies', ROOT + '/src/write/allergies/allergies-resources');

//Removed in order to Disable Encounter Form: app.register('/patient/:pid/encounters', ROOT + '/src/write/encounters/encounters-resources');

app.register('/patient/:pid/immunizations', ROOT + '/src/write/immunizations/immunizations-resources');

app.register('/patient/:pid/orders', ROOT + '/src/write/orders/orders-resources');

app.register('/writeback/consult-orders', ROOT + '/src/write/consult-orders/consult-orders-resources');

app.register('/patient/:pid/clinical-objects', ROOT + '/src/write/clinical-objects/clinical-objects-resources');

app.register('/writeback/orders', ROOT + '/src/write/orders/sign-orders-resource');

app.register('/patient/:pid/notes', ROOT + '/src/write/notes/notes-resources');

app.register('/patient/:pid/problems', ROOT + '/src/write/problems/problems-resources');

app.register('/patient/:pid/vitals', ROOT + '/src/write/vitals/vitals-resources');

app.register('/labSupportData', ROOT + '/src/write/orders/lab/support-data/lab-support-data-resources');

app.register('/patient/:pid/numeric-lab-results', ROOT + '/src/write/numeric-lab-results/numeric-lab-results-resources');

var port = app.config.appServer.port;
var server = app.rdkListen(port, function() {
    var address = server.address();
    app.logger.info('Writeback Data Service listening at http://%s:%s', address.host, address.port);
});
