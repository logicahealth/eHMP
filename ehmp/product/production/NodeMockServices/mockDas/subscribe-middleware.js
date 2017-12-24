'use strict';

const request = require('request');
const qs = require('querystring');
const _ = require('underscore');
const mockSubscribeResponse = require('../data/das/Subscribe/response.json');

function validateSubscribeRequest(log, request, response, next) {
	let params = request.body;

	if (!params) {
		log.error('validateSubscribeRequest: Returning error. No body in POST request. request: %j', request);
		return response.status(400).json({
			error: 'No body in POST request'
		});
	} else if (!params.criteria || !_.isString(params.criteria)) {
		log.error('validateSubscribeRequest: Returning error. Missing or invalid "criteria" parameter. request.body: %j', params);
		return response.status(400).json({
			error: 'Missing or invalid "criteria" parameter'
		});
	} else if (!params.channel) {
		log.error('validateSubscribeRequest: Returning error. Missing "channel" parameter. request.body: %j', params);
		return response.status(400).json({
			error: 'Missing "channel" parameter'
		});
	} else if (!params.channel.endpoint) {
		log.error('validateSubscribeRequest: Returning error. Missing VX-Sync notification endpoint URL. request.body: %j', params);
		return response.status(400).json({
			error: 'Missing VX-Sync notification endpoint URL'
		});
	}

	let query = qs.parse(_.last(params.criteria.split('DocumentReference?')));
	let patientIdentifierValue = query['subject:Patient.identifier'] || query['subject.Patient.identifier'];
	if (!patientIdentifierValue) {
		return response.status(400).json({
			error: 'Criteria is missing "subject:Patient.identifier"'
		});
	}

	request.patientIdentifierValue = patientIdentifierValue;

	next();
}

function handleSubscribeRequest(log, request, response, next) {
	log.debug('handleSubscribeRequest: Subscribe request received. requestId: %s', request.body.id);
	setTimeout(sendNotification, 1000, log, this.emptyResponseList, request);

	response.status(200).json({
		message: 'Subscribe request received.'
	});
}

function sendNotification(log, emptyResponseList, req) {
	log.debug('sendNotification (requestId %s): Sending notification...', req.body.id);
	let params = req.body;
	let notificationUrl = params.channel.endpoint;

	//deep clone mockSubscribeResponse before changing it
	let subscribeResponse = JSON.parse(JSON.stringify(mockSubscribeResponse));
	subscribeResponse.criteria = params.criteria;
	subscribeResponse.channel = params.channel;
	subscribeResponse.reason = params.reason;

	if (_.contains(emptyResponseList, req.patientIdentifierValue)) {
		subscribeResponse.text.div = '<documents>Null</documents>';
	}

	request.post(notificationUrl, {
		json: subscribeResponse
	}, function(error, response) {
		log.error('sendNotification (requestId %s) Error encountered when sending notification to %s: error: %j, response: %j', req.body.id, notificationUrl, error, response);
	});
}

module.exports = {
	validateSubscribeRequest: validateSubscribeRequest,
	handleSubscribeRequest: handleSubscribeRequest,
	sendNotification: sendNotification
};