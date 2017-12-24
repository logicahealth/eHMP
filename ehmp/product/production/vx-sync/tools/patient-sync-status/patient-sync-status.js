'use strict';

require('../../env-setup');

const fs = require('fs');
const async = require('async');
const moment = require('moment');
const JdsClient = require(global.VX_SUBSYSTEMS + 'jds/jds-client');

// Do this explicitly instead of importing the dummy-logger because the tests/
// directory (and therefore tests/dummies/dummy-logger.js) is not part of the deployment
const dummyLogger = {
	trace: function() {},
	debug: function() {},
	info: function() {},
	warn: function() {},
	error: function() {},
	fatal: function() {}
};

/*
This utility will get a list of all of the patients in JDS and then query each patient to
determine its status. For each patient which is "incomplete" based upon the criteria specified,
on the command line, an object will be created which details that patient's sync completion
status. If the --demographics option is passed to the utility, this information will also
include the patient's displayName and SSN (in rare cases, these might contain undefined values).

An example of the output of this utility run with the --demographics flag is included below. If
the --demographics flag had not been included, the 'ssn' and 'displayName' fields would not be
present in each object. Note that each entry is keyed by the patient's JPID. The array value
for 'patientIdentifiers' is the full list of all identifiers in stored in JDS for that patient.

{
    'b0788c49-75e5-4ee2-bb7d-e0993ca2d208': {
        patientIdentifiers: [ 'SITE;100890', 'JPID;b0788c49-75e5-4ee2-bb7d-e0993ca2d208' ],
        syncCompleted: false,
        solrSyncCompleted: true,
        hasError: false,
        ssn: 666001010,
        displayName: PATIENT,PATIENT
    },
    'bd5011e5-e43a-4917-a91d-068314ee0170': {
        patientIdentifiers: [ 'SITE;100889', 'JPID;bd5011e5-e43a-4917-a91d-068314ee0170' ],
        syncCompleted: false,
        solrSyncCompleted: true,
        hasError: false,
        ssn: undefined,
        displayName: undefined
    }
}

*/
const argv = require('yargs')
	.usage('Usage: $0 --protocol <http|https> --host <host> --port <port> --demographics --output-file <filename> --overwrite --error-only --exclude-solr --log-level <log-level>')
	.demand(['host', 'port', 'output-file'])
	.option('r', {
		alias: 'protocol',
		default: 'http',
		describe: 'protocol (http or https) when making the status call.',
		type: 'string'
	})
	.option('h', {
		alias: 'host',
		describe: 'IP Address of the JDS server.',
		type: 'string'
	})
	.option('p', {
		alias: 'port',
		describe: 'Port of the JDS server.',
		type: 'number'
	})
	.option('f', {
		alias: 'output-file',
		describe: 'Path to the file to output results.',
		type: 'string'
	})
	.option('o', {
		alias: 'overwrite',
		default: false,
		describe: 'If output-file exists, overwrite it.',
		type: 'boolean'
	})
	.option('d', {
		alias: 'demographics',
		default: false,
		describe: 'Get name and SSN (this will add to the run-time of this utility.',
		type: 'boolean'
	})
	.option('syn', {
		alias: 'sync-not-complete',
		default: false,
		describe: 'Return patients with sync errors.',
		type: 'boolean'
	})
    .option('son', {
        alias: 'solr-not-complete',
        default: false,
        describe: 'Return patients with solr sync errors.',
        type: 'boolean'
    })
    .option('no', {
        alias: 'no-lesrt',
        default: false,
        describe: 'Return patients with no latestEnterpriseSyncRequestTime',
        type: 'boolean'
    })
	.option('l', {
		alias: 'log-level',
		default: 'error',
		describe: 'Set the log level.',
		type: 'string'
	})
	.alias('?', 'help')
	.help('help')
	.argv;

const config = {
	syncIncomplete: argv['sync-not-complete'],
    solrIncomplete: argv['solr-not-complete'],
    noLesrt: argv['no-lesrt'],
	demographicsOn: argv.demographics,
	outputFile: argv['output-file'],
	overwrite: argv.overwrite
};


const logLevel = argv['log-level'];

let logger = require('bunyan').createLogger({
	name: 'patient-sync-status',
	level: logLevel
});

if (!config.overwrite && fs.existsSync(config.outputFile)) {
	logger.error('The output file "%s" already exists. Exiting utility.', config.outputFile);
	process.exit(1);
}


let jdsConfig = {
	maxMetastampSize: 20000,
	handlerMaxSockets: 5,
	jds: {
		protocol: argv.protocol,
		host: argv.host,
		port: argv.port,
		timeout: 60000 // taken from the default value used in JdsClient
	}
};

let jdsClient = new JdsClient(logger, dummyLogger, jdsConfig);

let patientCollection = {};

fetchPatientList(logger, (error, patients) => {
	async.eachLimit(patients, 5, (patient, callback) => {
		logger.info(patient.jpid);
		fetchSyncStatus(logger, patient.jpid, (error, status) => {
			if (error) {
				return callback(error);
			}

            if (status.hasError ||
                (config.syncIncomplete && !status.syncCompleted) ||
                (config.solrIncomplete && !status.solrSyncCompleted) ||
                config.noLesrt && !status.latestEnterpriseSyncRequestTime) {

				patientCollection[patient.jpid] = {
					patientIdentifiers: patient.patientIdentifiers,
					syncCompleted: status.syncCompleted,
					solrSyncCompleted: status.solrSyncCompleted,
					hasError: status.hasError,
                    latestEnterpriseSyncRequestTime: status.latestEnterpriseSyncRequestTime
				};

				if (!config.demographicsOn) {
					logger.info(patientCollection[patient.jpid]);
					return callback();
				}

				return fetchNameSsn(logger, patient.jpid, (error, demographics) => {
					if (error) {
						return callback(error);
					}

					patientCollection[patient.jpid].ssn = demographics.ssn;
					patientCollection[patient.jpid].displayName = demographics.displayName;
					logger.info(patientCollection[patient.jpid]);
					return callback();
				});
			}

			return callback();
		});
	}, (error) => {
		if (error) {
			logger.error(error);
			return process.exit(1);
		}

		fs.writeFile(config.outputFile, JSON.stringify(patientCollection, null, 2), (error) => {
			if (error) {
				logger.error('Unable to write file: %s', config.outputFile);
				logger.error(error);
				logger.info(patientCollection);
				return process.exit(1);
			}

			logger.info('File written: %s', config.outputFile);
			process.exit();
		});
	});
});



function fetchPatientList(logger, callback) {
	logger.debug('patient-sync-status.fetchPatientList()');

	jdsClient.getPatientList(null, (error, response, patientList) => {
		if (error) {
			logger.error('patient-sync-status.fetchPatientList() Error retrieving patient list');
			logger.error(error);
			return callback('Error retrieving patient list');
		}

		logger.trace('patient-sync-status.fetchPatientList() Patient list: %s', patientList);
		if (!Array.isArray(patientList.items)) {
			return callback('patient-sync-status.fetchPatientList() JDS did not return a list');
		}

		return callback(null, patientList.items);
	});
}


function fetchSyncStatus(logger, jpid, callback) {
	logger.debug('patient-sync-status.fetchSyncStatus()');

	jdsClient.getSimpleSyncStatus({
		value: jpid
	}, (error, response, status) => {
		if (error) {
			logger.error('patient-sync-status.fetchSyncStatus() Error retrieving sync status for patient: %s', jpid);
			logger.error(error);
			return callback(`Error retrieving sync status for patient: %{jpid}`);
		}

		logger.debug('patient-sync-status.fetchSyncStatus() Patient %s sync status: %s', jpid, status);

		let syncStatus = {
			solrSyncCompleted: !!status.solrSyncCompleted,
			syncCompleted: !!status.syncCompleted,
			hasError: !!status.hasError,
            latestEnterpriseSyncRequestTime: status.latestEnterpriseSyncRequestTimestamp ? moment(status.latestEnterpriseSyncRequestTimestamp).format('DD MMM YYYY hh:mm a') : ''
		};

		logger.debug('patient-sync-status.fetchSyncStatus() Patient %s status: %j', jpid, syncStatus);
		return callback(null, syncStatus);
	});
}


function fetchNameSsn(logger, jpid, callback) {
	logger.debug('patient-sync-status.fetchNameSsn()');

	jdsClient.getPtDemographicsByPid(jpid, (error, response, patientInfo) => {
		if (error) {
			logger.error('patient-sync-status.fetchNameSsn() Error retrieving demographic info for patient: %s', jpid);
			logger.error(error);
			return callback(`Error retrieving demographic info for patient: %{jpid}`);
		}

		logger.trace('patient-sync-status.fetchNameSsn() Patient %s demographics list: %s', jpid, patientInfo);

		let demographics = {
			displayName: undefined,
			ssn: undefined
		};

		if (patientInfo.data && patientInfo.data.items && patientInfo.data.items.length > 0) {
			demographics.displayName = patientInfo.data.items[0].displayName;
			demographics.ssn = patientInfo.data.items[0].ssn;
		}

		logger.debug('patient-sync-status.fetchNameSsn() Patient %s name/ssn: %s/%s', jpid, demographics.displayName, demographics.ssn);
		return callback(null, demographics);
	});
}
