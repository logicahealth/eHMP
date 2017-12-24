'use strict';

const async = require('async');
const fs = require('fs');
const _ = require('underscore');

const vlerMockDocFilenames = ['CCDA_allScripts_toc.b64', 'CCDA_cerner_toc.b64', 'CCDA_epic_encounter_level_data.b64', 'CCDA_epic_patient_level.b64', 'Conemaugh_C32_Deidentified.b64', 'default.b64-1', 'Hawaii_C32_T1_DeIdentified.b64', 'HEALTHELINK_C32_Deidentified.b64', 'IHIE_B1_Deidentified.b64', 'INHS_C32_Deidentified.b64', 'default.b64-2'];
const filenamesToMetadata = require('../data/das/readDocument/metadata.json');

function validateReadRequest(log, request, response, next) {
	let query = request.query;

	if (!query) {
		log.error('validateReadRequest: Returning error. Missing query parameters. request %j', request);
		return response.status(400).json({
			error: 'Missing query parameters'
		});
	} else if (!query['subject.Patient.identifier']) {
		log.error('validateReadRequest: Returning error. Missing paremeter "subject.Patient.identifier". request.query %j', query);
		return response.status(400).json({
			error: 'Missing paremeter "subject.Patient.identifier"'
		});
	} else if (!query._format) {
		log.error('validateReadRequest: Returning error. Missing paremeter "_format". request.query %j', query);
		return response.status(400).json({
			error: 'Missing paremeter "_format"'
		});
	}

	next();
}

function handleReadRequest(log, request, response, next) {
	let query = request.query;
	let patientIdentifierValue = query['subject.Patient.identifier'];
	request.patientIdentifierValue = patientIdentifierValue;
	log.debug('handleReadRequest: Read request received. patientIdentifierValue: %s', patientIdentifierValue);

	if (_.contains(this.emptyResponseList, patientIdentifierValue)) {
		response = buildResponse(request, response, [], next);
	} else {
		response = buildResponse(request, response, vlerMockDocFilenames, next);
	}
}

function buildResponse(request, response, filenameList, callback) {
	let docList = [];
	let result = {
		resourceType: 'Bundle'
	};

	async.each(filenameList, function(filename, asyncCallback){
		buildDocumentFromFile(filename, function(err, document){
			if(err){
				return asyncCallback(err);
			}

			docList.push(document);
			asyncCallback();
		});
	}, function(err){
		result.err = err;
		result.entry = docList;
		result.total = docList.length;
		response.result = result;
		callback();
	});
}

function buildDocumentFromFile(filename, callback) {
	let trueFilename = filename;
	if((/^default.b64/).test(filename)){
		trueFilename = 'default.b64';
	}

	fs.readFile('./data/das/readDocument/' + trueFilename, 'utf8', function(err, data) {
		if (err) {
			return callback('File read error: ' + err);
		}

		let document = {
			resource: filenamesToMetadata[filename],
			content: [{
				attachment: {
					Data: data
				}
			}]
		};

		callback(err, document);
	});
}

function returnReadResponse(log, request, response){
	if(response.result.err){
		log.error('returnReadResponse: Error encountered when compiling documents for for patientIdentifierValue %s, Error: %s', request.patientIdentifierValue, response.result.error);
		return response.status(500).json({message: 'Error: ' + response.result.err});
	}
	log.debug('returnReadResponse: Sending successful response for patientIdentifierValue %s:', request.patientIdentifierValue);
	response.status(200).json(response.result);
}

module.exports = {
	validateReadRequest: validateReadRequest,
	handleReadRequest: handleReadRequest,
	buildResponse: buildResponse,
	returnReadResponse: returnReadResponse
};