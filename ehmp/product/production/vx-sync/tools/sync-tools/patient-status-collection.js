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
		default: 9080,
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
// var port = argv.port || 9080;
// var path = argv.path || '/sync/combinedstat/';
var protocol = argv.protocol;
var host = argv.host;
var port = argv.port;
var path = argv.path;
var list = argv.list;
var sort = argv.sort;
var color = String(argv.color).toLowerCase() !== 'false' && String(argv.color).toLowerCase() !== 'off' && String(argv.color).toLowerCase() !== 'no';

var url = protocol + '://' + host + ':' + port + path;

var idList = ['9E7A;164',
	'9E7A;100608',
	'9E7A;253',
	'9E7A;227',
	'9E7A;71',
	'9E7A;239',
	'9E7A;100599',
	'9E7A;100001',
	'9E7A;231',
	'9E7A;3',
	'9E7A;9',
	'9E7A;18',
	'9E7A;722',
	'9E7A;100716',
	'9E7A;100840',
	'9E7A;100731',
	'9E7A;65',
	'9E7A;8',
	'9E7A;230',
	'9E7A;17',
	'9E7A;100125',
	'9E7A;229',
	'9E7A;420',
	'9E7A;100022',
	'9E7A;100012',
	'9E7A;271',
	'C877;1',
	'9E7A;428',
	'9E7A;1',
	'9E7A;100184',
	'9E7A;167',
	'9E7A;100615',
	'9E7A;301',
	'9E7A;100033',
	'9E7A;100817',
	'9E7A;149',
	'9E7A;204'
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