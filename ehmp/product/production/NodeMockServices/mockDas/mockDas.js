'use strict';

const bodyParser = require('body-parser');

const mockDasConfig = require('./config');
const log = require('bunyan').createLogger(mockDasConfig.logger);
const _ = require('underscore');

const subscribeMiddleware = require('./subscribe-middleware');
const readMiddleware = require('./readDocument-middleware');
const emptyResponseListMiddleware = require('./_test/_emptyResponseList-middleware');

const port = require('yargs')
	.usage('Usage: $0 --port <port>')
	.demand(['port'])
	.argv.port;

const app = require('express')().use(bodyParser.json())
	.use(bodyParser.urlencoded({
		'extended': true
	}));

//FIVEHUNDREDTWENTYSIX,PATIENT to return empty document list
//NINE,PATIENT to return empty response
this.emptyResponseList = ['5000000089V224123', '10109V652700'];

const subscribeMethods = [subscribeMiddleware.validateSubscribeRequest.bind(null, log), subscribeMiddleware.handleSubscribeRequest.bind(this, log)];
const readMethods = [readMiddleware.validateReadRequest.bind(null, log), readMiddleware.handleReadRequest.bind(this, log), readMiddleware.returnReadResponse.bind(null, log)];

app.get('/ping', function(request, response) {
	response.status(200).json({
		message: 'pong'
	});
});
app.post('/HealthData/v1/Subscribe', subscribeMethods);
app.get('/HealthData/v1/readDocument/DocumentReference', readMethods);

app.get('/emptyResponseList/add', emptyResponseListMiddleware.addIcn.bind(this));
app.get('/emptyResponseList/remove', emptyResponseListMiddleware.removeIcn.bind(this));
app.get('/emptyResponseList', emptyResponseListMiddleware.check.bind(this));

app.listen(port);
log.info('Mock DAS listening on port %s', port);