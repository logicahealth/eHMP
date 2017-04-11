'use strict';

var uuid = require('node-uuid');
var moment = require('moment');

var errorRequestType = 'error-request';
var startRequestType = 'start-request';
var completeRequestType = 'complete-request';


function create(type, error) {
    var job = {
        uuid: uuid.v4(),
        type: type,
        timestamp: moment.utc().format(),
    };

    if(error) {
        job.error = error;
    }

    return job;
}

module.exports.errorRequestType = errorRequestType;
module.exports.startRequestType = startRequestType;
module.exports.completeRequestType = completeRequestType;
module.exports.create = create;