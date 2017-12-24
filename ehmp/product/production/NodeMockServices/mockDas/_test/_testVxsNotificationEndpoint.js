'use strict';

const bodyParser = require('body-parser');

// var bunyan = require('bunyan');
//var log = require('bunyan').createLogger();

const port = require('yargs')
	.usage('Usage: $0 --port <port>')
	.demand(['port'])
	.argv.port;

const app = require('express')().use(bodyParser.json())
	.use(bodyParser.urlencoded({
		'extended': true
	}));

app.post('/vlerdas/notification', function(req, res){
	console.log(req.body);
	res.status(200).send();
});


app.listen(port);
console.log('Mock notification endpoint listening on port %s', port);