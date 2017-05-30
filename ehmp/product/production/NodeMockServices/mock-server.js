/*jslint node: true */
'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var bunyan = require('bunyan');
app.config = require('./config.js');
var mockHdrProcess = require('./mockHdrProcess.js');
var mockMviProcess = require('./mockMviProcess.js');
var mockVhicProcess = require('./mockVhicProcess.js');
var logger = bunyan.createLogger(app.config.logger);

var bad_request = 400;
var expected_template = 'GenericObservationRead1';
var expected_filter = 'GENERIC_VISTA_LIST_DATA_FILTER';
var expected_type = 'json';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get('/repositories.URL       /fpds/:domain', function(req, res) {
    var templateId = req.param('templateId');
    var filterId = req.param('filterId');
    var clientName = req.param('clientName');
    var requestId = req.param('requestId');
    var clientRequestInitiationTime = req.param('clientRequestInitiationTime');
    var type = req.param('_type');

    var excludeIdentifier = req.param('excludeIdentifier');

    if((typeof excludeIdentifier === 'string' || Array.isArray(excludeIdentifier)) && excludeIdentifier.length > 0) {
        logger.info('mock-server -> "excludeIdentifier" parameter passed for "site blacklist" feature with value of: %s', excludeIdentifier);
    } else {
        logger.info('mock-server -> "excludeIdentifier" parameter not passed or passed without a value: %s', excludeIdentifier);
    }

    var message = '';
    if ((!templateId) || (templateId != expected_template)) {
        message = appendToMessage(message, 'Bad templateId--expected ' + expected_template + ' but found ' + templateId);
    }
    if ((!filterId) || (filterId != expected_filter)) {
        message = appendToMessage(message, 'Bad filterId--expected ' + expected_filter + ' but found ' + filterId);
    }
    if (!clientName) {
        message = appendToMessage(message, 'Missing required parameter clientName');
    }
    if ((type) && (type != expected_type)) {
        message = appendToMessage(message, 'Requested datatype of ' + type + ' is not supported');
    }
    if (!requestId){
        message = appendToMessage(message, 'Missing required parameter requestId');
    }
    if (!clientRequestInitiationTime){
        message = appendToMessage(message, 'Missing required parameter clientRequestInitiationTime');
    }

    if (message !== '') {
        logger.error(message);
        res.status(bad_request).send(message);
    } else {
        var pid = req.param('nationalId');
        var domain = req.params.domain;
        logger.debug('Received request for ' + domain + ' for ' + pid);

        mockHdrProcess.fetchHdrData(pid, domain, excludeIdentifier, res);
    }
});

app.post('/mvi', function(req, res) {
    mockMviProcess.fetchMviData(req, res);
});

app.post('/vhic', function(req, res) {
    mockVhicProcess.fetchVhicData(req, res);
});

var server = app.listen(app.config.port, function() {
    logger.info('Listening on port %d', server.address().port);
});

function appendToMessage(message, appendix) {
    if (message === '') {
        return appendix;
    }
    return message + '; ' + appendix;
}
