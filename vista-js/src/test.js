'use strict';

var util = require('util');
var _ = require('underscore');
var RpcClient = require('./RpcClient').RpcClient;

// var inspect = _.partial(util.inspect, _, {
// 	depth: null
// });

var logger = require('bunyan').createLogger({
	name: 'rpc',
	level: 'debug'
});


// function isLogger(obj) {
//     var funcList = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
//     return _.every(funcList, function(funcName) {
//         return _.isFunction(obj[funcName]);
//     });
// }


// console.log(isLogger(logger));

// console.log(isLogger({ trace: _.noop, debug: '_.noop', info: _.noop, warn: _.noop, error: _.noop, fatal: _.noop }));

// console.log(isLogger({}));

var config = {
	// host: '101.2.2.102',
	host: 'IP_ADDRESS',
	port: 9210,
	accessCode: 'PW',
	verifyCode: 'PW',
	context: 'VPR UI CONTEXT',
	localIP: '127.0.0.1',
	localAddress: 'localhost',
	connectTimeout: 3000,
	sendTimeout: 10000
};

// function makeVisible(string, openChar, closeChar) {
//     string = string || '';
//     openChar = openChar || '[';
//     closeChar = closeChar || ']';

//     return _.reduce(string, function(memo, ch) {
//         var code = ch.charCodeAt();
//         return memo + (code < 32 ? (openChar + code + closeChar) : ch);
//     }, '');
// }


// var str = '\u0000\u0000localhost.localdomain\u000D\u000AROU\u000D\u000AVISTA\u000D\u000A/dev/null:16898\u000D\u000A5\u000D\u000A0\u000D\u000AVISTA.LOCAL.US\u000D\u000A0\u000D\u000A\u0004';
// var changed = '[0][0]localhost.localdomain[13][10]ROU[13][10]VISTA[13][10]/dev/null:16898[13][10]5[13][10]0[13][10]VISTA.LOCAL.US[13][10]0[13][10][4]';

// var send = '[XWB]10304\u000ATCPConnect500140009127.0.0.1ff00010f00140009localhostff\u0004';
// var regex = new RegExp('^\\[XWB\\]10304\u000ATCPConnect500140009127\\.0\\.0\\.1ff00010f00140009localhostff\u0004$');


// console.log(regex.test(send));

// console.log('********** calling authenticate');
// config.PORT      ;
// RpcClient.authenticate(logger, config, function(error, result) {
// 	console.log('********');
// 	console.log(error);
// 	console.log(result);
// 	console.log('********');
// });


// var config = {
// 	// host: '101.2.2.102',
// 	host: 'IP_ADDRESS',
// 	port: 9210,
// 	accessCode: 'PW',
// 	verifyCode: 'PW',
// 	context: 'VPR SYNCHRONIZATION CONTEXT',
// 	localIP: '127.0.0.1',
// 	localAddress: 'localhost',
// 	connectTimeout: 3000,
// 	sendTimeout: 10000
// };


// config.PORT      ;
// console.log('********** calling rpc');
// RpcClient.callRpc(logger, config, 'ORWU USERINFO', function(error, result) {
// 	if (error) {
// 		console.log('******** ERROR');
// 		console.log('%j', error);
// 		return;
// 	}

// 	try {
// 		result = JSON.parse(result);
// 	} catch (err) {
// 		// do nothing
// 	}
// 	console.log('******** RESULT');
// 	console.log('%j', result);
// });

// console.log('********** calling rpc');
// RpcClient.callRpc(logger, config, 'VPRDJFS API', {
// 	'"server"': 'hmp-development-box',
// 	'"command"': 'startOperationalDataExtract'
// }, function(error, result) {
// 	console.log('********');
// 	if (error) {
// 		console.log(error);
// 	}

// 	try {
// 		result = JSON.parse(result);
// 	} catch (err) {
// 		// do nothing
// 	}
// 	console.log(inspect(result));
// 	console.log('********');
// });

// config.PORT       ;

// console.log('********** explicit auth');
// var client = RpcClient.create(logger, config);
// client.connect(function(error, result) {
// 	if (error) {
// 		console.log('Unable to connect to Vista');
// 		console.log(error);
// 		return;
// 	}

// 	console.log(result);
// 	console.log('connected');

// 	client.close(function(error, result) {
// 		console.log('********** explicit auth');
// 		if (error) {
// 			console.log('close() was not clean');
// 			console.log(error);
// 			return;
// 		}

// 		try {
// 			result = JSON.parse(result);
// 		} catch (err) {
// 			// do nothing
// 		}
// 		console.log('%j', result);
// 		console.log('********** explicit auth');
// 	});
// });

// config = {
// 	// host: '101.2.2.102',
// 	host: 'IP_ADDRESS',
// 	port: 99210,
// 	accessCode: 'PW',
// 	verifyCode: 'PW',
// 	context: 'VPR UI CONTEXT',
// 	localIP: '127.0.0.1',
// 	localAddress: 'localhost',
// 	connectTimeout: 3000,
// 	sendTimeout: 10000
// };


console.log('********** start');
var client = RpcClient.create(logger, config);
client.connect(function(error, result) {
	if (error) {
		console.log('Unable to connect to Vista');
		console.log(error);
		return;
	}

	console.log(result);
	console.log('connected');

	client.execute('ORWU USERINFO', function(error, result) {
		if (error) {
			console.log('Unable to execute command on Vista');
			console.log(error);
			return;
		}

		console.log(result);

		client.close(function(error, result) {
			console.log('********** close');
			if (error) {
				console.log('close() was not clean');
				console.log(error);
				return;
			}

			try {
				result = JSON.parse(result);
			} catch (err) {
				// do nothing
			}
			console.log('%j', result);
			console.log('********** end');
		});
	});
});


// 'ORWU USERINFO'
// 'ORWDAL32 DEF'