'use strict';

var fs = require('fs');
var util = require('util');
var async = require('async');
var _ = require('underscore');
var request = require('request');


/*
Load and parse patientFile or return an empty object if 'outputFile' does not exist.

logger: A bunyan-style logger

outputFile: The name and path of the outputFile

callback: A standard callback

fileSystem: an optional override of the 'fs' file system. For this function,
	the object must implement existsSync(file) and readFile(file, options, callback) functions.
*/
function loadPatientFile(logger, patientFile, callback, fileSystem) {
	fileSystem = fileSystem || fs;
	logger.debug('fetch-synced-patient-list.loadPatientFile(): patientFile: %s', patientFile);

	if (!fileSystem.existsSync(patientFile)) {
		logger.debug('fetch-synced-patient-list.loadPatientFile(): return empty object {}');
		return setTimeout(callback, 0, null, {});
	}

	fileSystem.readFile(patientFile, 'utf8', function(error, data) {
		logger.debug('fetch-synced-patient-list.loadPatientFile(): fs.readFile() callback');
		if (error) {
			logger.error('Unable to load patient file: %s', patientFile);
			logger.error(error);
			return callback(error);
		}

		try {
			logger.debug('fetch-synced-patient-list.loadPatientFile(): JSON.parse() file contents');
			return callback(null, JSON.parse(data));
		} catch (parseError) {
			logger.error('Unable to parse patient file: %s', patientFile);
			logger.error(parseError);
			return callback(util.format('Unable to parse patientFile: %s', patientFile));
		}
	});
}

/*
Returns a list of UIDs of ChemLabs to use when deleting from JDS.

logger: A bunyan-style logger

jdsConfig: An object of the form:
{
	protocol: protocol,
	host: host,
	port: port
}

identifier: A string with a patient identifier value

callback: A standard callback

requestLib: An optional override of the 'request' library function of the form:
	requestLib(options, callback)
*/
function fetchPatientDodChemLabUidList(logger, jdsConfig, identifier, callback, requestLib) {
	requestLib = requestLib || request;
	logger.debug('fetch-synced-patient-list.fetchPatientDodChemLabUidList() identifier: %s', identifier);
	logger.debug('fetch-synced-patient-list.fetchPatientDodChemLabUidList() provided requestLib?:', !!requestLib);

	var list;

	var options = {
		url: util.format('%s://%s:%s/vpr/%s/index/laboratory?filter=and(eq("facilityCode","DOD"),eq("categoryCode","urn:va:lab-category:CH"))', jdsConfig.protocol, jdsConfig.host, jdsConfig.port, identifier),
		method: 'GET'
	};

	return requestLib(options, function(error, response, body) {
		if (error || response.statusCode !== 200) {
			logger.error('Unable to fetch DOD ChemLab UID list for patient: %s', identifier);
			logger.error(error || response.statusCode);
			return callback(error || response.statusCode);
		}

		try {
			body = JSON.parse(body);
			list = _.map(body.data.items, function(chemLab) {
				return chemLab.uid;
			});
		} catch (parseError) {
			logger.error('Unable to parse JDS response');
			logger.error(parseError);
			return callback(parseError);
		}

		return callback(null, list);
	});
}

/*
var config = {
    jds: {
        protocol: 'http',
        host: 'IP        ',
        port: PORT,
        timeout: 300000
    }
};

example of PatientList output:
{
    items: [
        {
            jpid: "0003ee96-52a3-47bc-877b-250cbdac703c",
            lastAccessTime: 20170428003156,
            patientIdentifiers: [
                "SITE;254",
                "JPID;0003ee96-52a3-47bc-877b-250cbdac703c"
            ]
        },
        {
            jpid: "00133272-d558-457b-865b-4ee7b8311c13",
            lastAccessTime: 20170428003541,
            patientIdentifiers: [
                "SITE;100065",
                "JPID;00133272-d558-457b-865b-4ee7b8311c13"
            ]
        }
    ]
}
*/
function fetchSynchronizedPatientList(logger, jdsConfig, allSyncedPatients, callback, requestLib) {
	requestLib = requestLib || request;
	logger.debug('fetch-synced-patient-list.fetchSynchronizedPatientList() allSyncedPatients?: %s', allSyncedPatients);
	logger.debug('fetch-synced-patient-list.fetchSynchronizedPatientList() provided requestLib?: %s', !!requestLib);

	function hasDodChemLabs(identifier, callback) {
		fetchPatientDodChemLabUidList(logger, jdsConfig, identifier, function(error, result) {
			if (error) {
				return callback(error);
			}

			return callback(null, _.isArray(result) && _.size(result) > 0);
		}, requestLib);
	}

	var list;

	var options = {
		url: util.format('%s://%s:%s%s', jdsConfig.protocol, jdsConfig.host, jdsConfig.port, '/vpr/all/patientlist'),
		method: 'GET'
	};

	// First fetch all of the synced patient identifiers
	return requestLib(options, function(error, response, body) {
		if (error || response.statusCode !== 200) {
			logger.error('fetch-synced-patient-list.fetchSynchronizedPatientList() Unable to fetch patient list');
			logger.error(error || response.statusCode !== 200);
			return callback(error || response.statusCode !== 200);
		}

		try {
			logger.debug('fetch-synced-patient-list.fetchSynchronizedPatientList() full response: %s', body);
			body = JSON.parse(body);
			list = _.map(body.items, function(patientInfo) {
				// Get the first patientIdentifier value since any will work in following steps.
				return _.first(patientInfo.patientIdentifiers);
			});

			logger.debug('fetch-synced-patient-list.fetchSynchronizedPatientList() list of first identifiers: %s', list);
		} catch (parseError) {
			logger.error('fetch-synced-patient-list.fetchSynchronizedPatientList() Unable to parse patient list');
			logger.error(parseError);
			return callback(parseError);
		}
		// if allSyncedPatients === true then return all synced patients
		if (allSyncedPatients) {
			return callback(null, list);
		}

		// filter synced patients to only return those with DOD ChemLabs
		async.filterLimit(list, 5, hasDodChemLabs, callback);
	});
}


/*
Create a JSON file with the list of patient identifiers with a value
of true or false, where 'true' means the patient was already processed.
This value should be set by another utility when the work on that particular
patient is complete. This is to minimize reprocessing patients.

{
	"SITE;3": false,
	"SITE;8": false
}


jdsConfig: JDS connection information. This object should be of the form:
{
    "protocol": "http",
    "host": "IP        ",
    "port": "PORT",
}

outputFile: The path to the file containing all of the relevant patient data and
the processing status for each. This file will be a JSON object with the same
structure as the 'existingPatientData' object.

allSyncedPatients: A boolean to determine whether or not to filter out patients
    that do not have DOD ChemLab data. If 'true' ALL synced patients will be
    returned regardless of whether of not they have DOD ChemLabs.

callback: A standard callback

fileSystem: An optional override of the 'fs' file system. For this function,
	the object must implement writeFile(file, content, options, callback) function.

loadFunction: An optional override of the loadPatientFile() function defined in this
	file to simplify unit testing.

fetchFunction: An optional override of the fetchSynchronizedPatientList() function defined
	in this file to simplify unit testing.
*/
function createPatientList(logger, jdsConfig, outputFile, append, allSyncedPatients, callback, fileSystem, loadFunction, fetchFunction) {
	fileSystem = fileSystem || fs;
	loadFunction = loadFunction || loadPatientFile;
	fetchFunction = fetchFunction || fetchSynchronizedPatientList;
	logger.debug('fetch-synced-patient-list.createPatientList() append? %s  jdsConfig: %j', append, jdsConfig);
	logger.debug('fetch-synced-patient-list.createPatientList() provided fileSystem?: %s', !!fileSystem);

	if(!append) {
		loadFunction = function(logger, patientFile, callback) {
			logger.debug('fetch-synced-patient-list.createPatientList() append is false so return {}');
			setTimeout(callback, 0, null, {});
		};
	}

	loadFunction(logger, outputFile, function(error, existingPatientData) {
		if(error) {
			logger.error('fetch-synced-patient-list.createPatientList() Unable to load file: %s', outputFile);
			return callback(error);
		}

		fetchFunction(logger, jdsConfig, allSyncedPatients, function(error, result) {
			if (error) {
				logger.error('Unable to fetch patient list from %s://%s:%s', jdsConfig.protocol, jdsConfig.host, jdsConfig.port);
				logger.error(error);
				return callback(error);
			}

			var patients = {};
			_.each(result, function(pid) {
				patients[pid] = false;
			});

			patients = _.defaults(existingPatientData, patients);
			var fileOutput = JSON.stringify(patients);

			fileSystem.writeFile(outputFile, fileOutput, 'utf8', function(error) {
				logger.debug('fetch-synced-patient-list.createPatientList(): fs.writeFile() callback');
				if (error) {
					logger.error('Unable to write patient file: %s', outputFile);
					logger.error(error);
					return callback(error);
				}

				logger.debug('fetch-synced-patient-list.createPatientList(): patients written to file: %s', outputFile);
				return callback();
			});
		});
	});
}


module.exports.loadPatientFile = loadPatientFile;
module.exports.fetchPatientDodChemLabUidList = fetchPatientDodChemLabUidList;
module.exports.fetchSynchronizedPatientList = fetchSynchronizedPatientList;
module.exports.createPatientList = createPatientList;