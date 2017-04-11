'use strict';

require('../../env-setup');
var _ = require('underscore');
var request = require('request');
var async = require('async');
var VxSyncForeverAgent = require(global.VX_UTILS+'vxsync-forever-agent');


var argv = require('yargs')
  .usage('Usage: $0 [options...]')
  .demand(['iterations', 'url'])
  .describe('iterations', 'Number of parallel iterations to run (MAKE SURE YOU WRAP THE URL IN DOUBLE QUOTES OR PARAMETERS MAY BE LOST.)')
  .describe('url', 'The URL of the REST service to run.')
  .describe('timeout', 'The timeout in milliseconds to wait for a response from the rest service.  Default is 60000 milliseconds.')
  .describe('verbose', 'Output the contents of the body on each response.')
  .argv;


var timeout = 60000;
if (_.isNumber(argv.timeout)) {
  timeout = argv.timeout;
}

var errorCount = 0;
var successCount = 0;
var emptyResponseCount = 0;

// // Extract off the queryString part of this URL
// //---------------------------------------------
// var url;
// var queryString;
// var queryParams = {};
// if (argv.url.indexOf('?') > 0) {
//   url = url.substring(0, argv.url.indexOf('?'));
//   queryString = url.substring(argv.url.indexOf('?') + 1);
//   if ((queryString) && (queryString.length > 0)) {
//     var params = queryString.split('&');
//     if (_.isArray(params)) {
//       _.each(params, function (param) {
//         var parts = param.split('=');
//         if ((_.isArray(parts)) && (parts.length === 2)) {
//           queryParams[parts[0]] = parts[1];
//         }
//       });
//     }
//   }
// }

// console.log('url: %s', url);
// console.log('queryParams: %j', queryParams);


console.log('argv.verbose: %s', argv.verbose);

function runSingleTask(url, timeout, iter, verbose, callback) {
  var options = {
    url: url,
    timeout: timeout,
    agentClass: VxSyncForeverAgent
  };

  request(options, function(error, response, body) {
      if(error || (response && response.statusCode !== 200 && response.statusCode !== 204)) {
        console.log('Received error response.  iter: %s; error: %s', iter, error);
        errorCount++;
      } else {
          if(body) {
            if (verbose) {
              console.log('Received valid response. iter: %s; body: %j', iter, JSON.parse(body));
            } else {
              console.log('Received valid response. iter: %s', iter);
            }
            successCount++;
          } else {
            console.log('Received empty response.  iter: %s', iter);
            emptyResponseCount++;
          }
      }

      if (verbose) {
        console.log('response: %j', response);
      }
      return callback(null);
  });
}

var tasks = [];
var iter = 0;
_.times(argv.iterations, function() {
  tasks.push(runSingleTask.bind(null, argv.url, timeout, iter++, argv.verbose));
});

console.log('tasks.length: %s', tasks.length);

async.parallel(tasks, function(error, response) {
  if (error) {
    console.log('async.parallel failed.  Error: %j', error);
  }
  else {
    console.log('async.parallel succeeded.  Error: %j', response);
  }

  console.log("successCount: %s", successCount);
  console.log("errorCount: %s", errorCount);
  console.log("emptyResponseCount: %s", emptyResponseCount);

  process.exit();   // forces the process to exit when we are done.
});

