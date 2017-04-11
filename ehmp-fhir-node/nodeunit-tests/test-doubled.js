var fs = require('fs');

exports['calculate'] = function (test) {
    test.ok(true, 'everything is ok');
    test.done();
};


// exports.files = function(test) {
// 	var filelist = fs.readdirSync('./domain');
// 	for(var f in filelist) {
// 		if(!fs.statSync('./domain/' + filelist[f]).isDirectory()) {
// 			continue;
// 		}

// 		var domain = filelist[f];
// 		var trxr = require('../domain/' + domain + '/transformer');
// 		var ftch = require('../domain/' + domain + '/fetcher');
// 	}

//     test.ok(true, 'everything is ok');
//     test.done();
// };
