'use strict';

var async = require('async');
var request = require('request');

// These are the 37 patients synced by 'gradle syncCache'
var pids = [
  'SITE;164',
  'SITE;71',
  'SITE;100599',
  'SITE;253',
  'SITE;227',
  'SITE;100608',
  'SITE;9',
  'SITE;100001',
  'SITE;239',
  'SITE;231',
  'SITE;3',
  'SITE;18',
  'SITE;722',
  'SITE;65',
  'SITE;230',
  'SITE;17',
  'SITE;100716',
  'SITE;100840',
  'SITE;100731',
  'SITE;8',
  'SITE;100125',
  'SITE;420',
  'SITE;100022',
  'SITE;1',
  'SITE;1',
  'SITE;100012',
  'SITE;167',
  'SITE;100184',
  'SITE;271',
  'SITE;428',
  'SITE;100615',
  'SITE;301',
  'SITE;229',
  'SITE;100033',
  'SITE;100817',
  'SITE;149',
  'SITE;204'
];

var failed = [];
async.eachLimit(pids, 20, function(pid, callback) {
  request({
    url: 'http://IP             /sync/combinedstat/' + pid
  }, function(error, response, body) {
    body = JSON.parse(body);
    if (!body.syncCompleted || !body.solrSyncCompleted) {
      failed.push(pid + ': syncCompleted: ' + !!body.syncCompleted + '  solrSyncCompleted: ' + !!body.solrSyncCompleted + '  hasError: ' + !!body.hasError);
    }
    return callback(error);
  });
}, function(error) {
  console.log();
  if (error) {
    console.log(error);
  }
  console.log(failed);
  console.log();
  process.exit();
});