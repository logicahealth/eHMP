#!/usr/bin/env node

'use strict';
var yargs = require('yargs');
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var moment = require('moment');
var fs = require('fs');
var config = require('./config');

var log = require('bunyan').createLogger(config.logger);
var mockVixProcess = require("./mockVixProcess.js");
var util = require('util');
var port = config.port;

log.debug('mockVix: Starting up...');


var app = express();

log.info('====>APP: ' + util.inspect(app, false, 4));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
	extended: false
}));

process.on('exit', function() {
	log.info("process on exit");
	saveAndExit();
});

process.on('SIGINT', function() {
	log.info("SIGINT received");
	saveAndExit();
});

process.on('SIGQUIT', function() {
	log.info("SIGQUIT received");
	saveAndExit();
});

process.on('SIGTERM', function() {
	log.info("SIGTERM received");
	saveAndExit();
});


app.get('/ping', function(req, res) {
	log.info("ping received");
	res.send('pong');
});


app.post('/vix/viewer/studyquery', [mockVixProcess.studyQuery
]);

app.get('/vix/viewer/studydetails', [mockVixProcess.studyDetails]);

app.get('/vix/viewer/thumbnails', [mockVixProcess.thumbnails]);

app.get('/vix/viewer', [mockVixProcess.viewer] )

// start it listening
app.listen(port);
log.debug('mockVix: Listening on port %s', port);

//
// cleanup and leave
//

function saveAndExit() {
	log.info("exiting");
	process.exit();

}
