'use strict';

var fs = require('fs');
var fspath = require('path');
var crypto = require('crypto');
var _ = require('lodash');

var recordToDirectory = fspath.resolve(__dirname, './recorded-responses');

module.exports.recordToDirectory = recordToDirectory;
module.exports.readResponse = readResponse;
module.exports.recordResponse = recordResponse;
module.exports.pathForRequest = pathForRequest;

function readResponse(options, callback) {
    var path = pathForRequest(options);

    options = _.clone(options);
    options.logger = true;

    var key = options.url;

    if (callback) {
        fs.readFile(path, {encoding: 'utf8'}, function(error, data) {
            extractResponse(data, key, callback);
        });
    } else {
        var data = fs.readFileSync(path, {encoding: 'utf8'});
        return extractResponse(data, key, function(error, response) {
            if (error) {
                throw error;
            }
            return response;
        });
    }
}

function extractResponse(data, key, callback) {
    if (data) {
        var record;
        try {
            record = JSON.parse(data);
        } catch (e) {
            return callback(e);
        }
        return callback(undefined, record.response, record.error);
    }
    return callback();
}

function recordResponse(options, response, responseError) {
    var path = pathForRequest(options);
    var record = {
        error: responseError,
        response: response
    };
    fs.writeFile(path, JSON.stringify(record), function(error) {
        if (error) {
            console.log('WARNING: recorded-response-repository.js couldn\'t record response for ' + path);
            console.dir(error);
        }
    });
}

function pathForRequest(options) {
    var url = fullUrl(options);
    url = stripProtocol(url);
    url = makeUrlReplacements(url);
    url = addMVIType(url, options);
    if (url.length > 243) {
        var md5 = crypto.createHash('md5');
        md5.update(url);
        url = md5.digest('hex');
    }
    url += '-';
    url += options.method || 'GET';
    url += '.json';
    // url = encodeURIComponent(url);
    return fspath.join(recordToDirectory, url);
}

function fullUrl(options) {
    var url = options.url;
    if (options.baseUrl) {
        if (_.startsWith(url, '/') && _.endsWith(options.baseUrl, '/')) {
            url = url.substring(1);
        } else if (!_.startsWith(url, '/') && !_.endsWith(options.baseUrl, '/')) {
            url += '/';
        }
        url = options.baseUrl + url;
    }
    return url;
}

function stripProtocol(url) {
    var index = url.indexOf('://');
    if (index !== -1) {
        url = url.substring(index+3);
    }
    return url;
}

var urlReplacements = [
    // replace path parameters:
    {regex: /\/vpr\/[^\/]+\/(find|index)\//, replacement: '/vpr/[pid]/$1/'},
    {regex: /\/vpr\/[^\/]+\/urn:va:([^:]+):[^\/]+$/, replacement: '/vpr/[pid]/urn:va:$1:[urn]'},
    {regex: /\/vpr\/(uid|pid|jpid|mpid)\/[^\/]+$/, replacement: '/vpr/$1/[pid]'},
    {regex: /\/vpr\/[^\/]+$/, replacement: '/vpr/[pid]'},
    {regex: /\/ehmpusers\/[^\/]+$/, replacement: '/ehmpusers/[urn]'},
    {regex: /\/status\/[^\/\?]+/, replacement: '/status/[pid]'},
    {regex: /\/statusod\/[^\/]+$/, replacement: '/statusod/[site]'},
    {regex: /\/task\/[^\/]+\//, replacement: '/task/[taskID]/'},
    {regex: /\/user\/(get|destroy)\/[^_]+_[^_]+_([^\/]+)$/, replacement: '/user/$1/[pid]_[thingID]_$2'},
    {regex: /\/user\/(get|destroy)\/[^_]+_([^\/]+)$/, replacement: '/user/$1/[pid]_$2'},
    {regex: /\/data\/urn:va:([^:]+):[^\/]+$/, replacement: '/data/urn:va:$1:[site]:[pid]'},
    {regex: /\/session\/(get|destroy)\/[^\/]+$/, replacement: '/session/$1/[sessionID]'},
    {regex: /\/notes\/[^\/]+$/, replacement: '/notes/[noteID]'},
    {regex: /\/documents\?dir=.+&file=.+\.(pdf|html)$/, replacement: '/documents?dir&file-$1'},
    {regex: /\/pidmeta\/\d+$/, replacement: '/pidmeta'},
    {regex: /\/orderfavs\/.*urn:va:.+$/, replacement: '/orderfavs/urn:va:[key]'},
    {regex: /\/urn:va:(.+):[^:\[\]\/]+$/, replacement: '/urn:va:$1:[urn]'},
    {regex: /\//g, replacement: '_'},                           // replace slashes with underscores
    {regex: /:/g, replacement: '-'},                            // replace colons with dashes
    {regex: /([&\?][^=]+)=[^&\?]+/g, replacement: '$1'}         // strip query parameter values
];

function makeUrlReplacements(url) {
    _.each(urlReplacements, function(matcher) {
        url = url.replace(matcher.regex, matcher.replacement);
    });
    return url;
}

function addMVIType(url, options) {
    if (!options.body) {
        return url;
    }

    var parseString = require('xml2js').parseString;
    var searchUtil = require('../src/resources/patient-search/results-parser');

    parseString(options.body, function(error, json) {
        if (!error) {
            var messageElement = searchUtil.retrieveObjFromTree(json, ['Envelope', 'Body', 0]);
            url += '-' + _.first(_.keys(messageElement));
        }
    });
    return url;
}
