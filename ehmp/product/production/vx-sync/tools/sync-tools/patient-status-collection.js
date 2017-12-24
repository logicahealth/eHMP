'use strict';

var _ = require('underscore');
var async = require('async');
var request = require('request');
var util = require('util');
var clc = require('cli-color');


var argv = require('yargs')
	.usage('Usage: $0 --protocol <http|https> --host <host> --port <port> --path <path> --color [on|off] --add <id, ...> --remove <id, ...>')
	.option('r', {
		alias: 'protocol',
		default: 'http',
		describe: 'protocol (http or https) when making the status call',
		type: 'string'
	})
	.option('h', {
		alias: 'host',
		default: 'IP        ',
		describe: 'IP Address of the JDS server',
		type: 'string'
	})
	.option('p', {
		alias: 'port',
		default: PORT,
		describe: 'Port of the JDS server',
		type: 'number'
	})
	.option('t', {
		alias: 'path',
		default: '/sync/combinedstat/',
		describe: 'Path for the Simple Sync Status on the JDS server',
		type: 'string'
	})
	.option('c', {
		alias: 'color',
		default: 'on',
		describe: 'When or not to colorize the output (default is on)',
		type: 'string'
	})
	.option('a', {
		alias: 'add',
		describe: 'Patient Identifiers to add to the list',
		type: 'string'
	})
	.option('v', {
		alias: 'remove',
		describe: 'Patient Identifiers to remove from the list',
		type: 'string'
	})
	.option('l', {
		alias: 'list',
		describe: 'If true, then list the patient identifiers and stop',
		type: 'boolean'
	})
	.option('s', {
		alias: 'sort',
		describe: 'If true, then sort the output by identifier',
		type: 'boolean'
	})
	.alias('?', 'help')
	.string('add')
	.string('remove')
	.help('help')
	.argv;


// var protocol = argv.protocol || 'http';
// var host = argv.host || 'IP        ';
// var port = argv.port || PORT;
// var path = argv.path || '/sync/combinedstat/';
var protocol = argv.protocol;
var host = argv.host;
var port = argv.port;
var path = argv.path;
var list = argv.list;
var sort = argv.sort;
var color = String(argv.color).toLowerCase() !== 'false' && String(argv.color).toLowerCase() !== 'off' && String(argv.color).toLowerCase() !== 'no';

var url = protocol + '://' + host + ':' + port + path;

var idList = ['SITE;164',
	'SITE;100608',
	'SITE;253',
	'SITE;227',
	'SITE;71',
	'SITE;239',
	'SITE;100599',
	'SITE;100001',
	'SITE;231',
	'SITE;3',
	'SITE;9',
	'SITE;18',
	'SITE;722',
	'SITE;100716',
	'SITE;100840',
	'SITE;100731',
	'SITE;65',
	'SITE;8',
	'SITE;230',
	'SITE;17',
	'SITE;100125',
	'SITE;229',
	'SITE;420',
	'SITE;100022',
	'SITE;100012',
	'SITE;271',
	'SITE;1',
	'SITE;428',
	'SITE;1',
	'SITE;100184',
	'SITE;167',
	'SITE;100615',
	'SITE;301',
	'SITE;100033',
	'SITE;100817',
	'SITE;149',
	'SITE;204'
];

var addList = buildListFromArg(argv, 'add');
var removeList = buildListFromArg(argv, 'remove');

idList = updateIdList(idList, addList, removeList, sort);

if (list) {
	console.log();

	_.each(idList, function(id) {
		console.log(id);
	});

	console.log();
	process.exit();
}

async.map(idList, fetchStatus, function(error, result) {
	console.log();

	_.each(result, function(status) {
		var text = status.text;
		if (color) {
			text = status.colorize(text);
		}

		console.log(text);
	});

	console.log();
	process.exit();
});


function buildListFromArg(argv, argName) {
	if (!_.has(argv, argName)) {
		return [];
	}

	var list = argv[argName];

	if (!_.isArray(list)) {
		list = [list];
	}

	list = _.map(list, function(item) {
		return String(item).split(',');
	});

	list = _.flatten(list);
	list = _.filter(list, function(item) {
		return item.length > 0;
	});

	return list;
}

function updateIdList(idList, addList, removeList, sort) {
	idList = _.filter(idList, function(id) {
		return !_.contains(removeList, id);
	});

	_.each(addList, function(id) {
		if (!_.contains(idList, id)) {
			idList.push(id);
		}
	});

	if (sort) {
		idList.sort(compareIds);
		// idList.sort(compareIds);
	}

	return idList;
}

function compareIds(id1, id2) {
	if (id1 === id2) {
		return 0;
	}

	var id1Split = splitId(id1);
	var id2Split = splitId(id2);

	if (id1Split.site !== id2Split.site) {
		return id1Split.site.localeCompare(id2Split.site);
	}

	if (_.isNumber(Number(id1Split.id)) && _.isNumber(Number(id2Split.id))) {
		return Number(id1Split.id) - Number(id2Split.id);
	}

	return id1Split.id.localeCompare(id2Split.id);
}

function splitId(id) {
	if (!_.contains(id, ';')) {
		return {
			site: '^',
			id: id
		};
	}

	id = id.split(';');

	return {
		site: id[0],
		id: id[1]
	};
}

function fetchStatus(id, callback) {
	request(url + id, function(error, response, body) {
		if (error) {
			return callback(null, buildStatus(id, error, clc.redBright));
		}

		if (response.statusCode === 404) {
			return callback(null, buildStatus(id, 'NOT FOUND', clc.magentaBright));
		}

		if (response.statusCode !== 200) {
			return callback(null, buildStatus(id, util.format('UNEXPECTED RESPONSE: %s', String(body)), clc.magentaBright));
		}

		body = parseResponse(body);

		if (isSimpleSyncStatusComplete(body)) {
			return callback(null, buildStatus(id, 'COMPLETE', clc.cyanBright));
		}

		if (!isSimpleSyncStatusWithError(body)) {
			return callback(null, buildStatus(id, 'INCOMPLETE', clc.blueBright));
		}

		return callback(null, buildStatus(id, 'INCOMPLETE WITH ERRORS', clc.yellowBright));
	});
}

function buildStatus(id, text, colorizer) {
	return {
		text: util.format('%s: %s', id, text),
		colorize: colorizer
	};
}

function parseResponse(response) {
	try {
		return JSON.parse(response);
	} catch (error) {
		return response;
	}
}


function isSimpleSyncStatusWithError(simpleSyncStatus) {
	if (_.isEmpty(simpleSyncStatus)) {
		return false;
	}

	if (simpleSyncStatus.hasError) {
		return true;
	}

	if (_.isEmpty(simpleSyncStatus.sites)) {
		return false;
	}

	return _.some(simpleSyncStatus.sites, function(site) {
		return site.hasError;
	});
}

function isSimpleSyncStatusComplete(simpleSyncStatus) {
	if (_.isEmpty(simpleSyncStatus)) {
		return false;
	}

	if (_.has(simpleSyncStatus, 'syncCompleted') && !simpleSyncStatus.syncCompleted) {
		return false;
	}

	return _.every(simpleSyncStatus.sites, function(site) {
		return site.syncCompleted;
	});
}