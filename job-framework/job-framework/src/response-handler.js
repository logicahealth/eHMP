'use strict';

var yaml = require('js-yaml');

var CRLF = new Buffer([0x0d, 0x0a]);

function ResponseHandler(logger, expectedResponse) {
    if (!(this instanceof ResponseHandler)) {
        return new ResponseHandler(logger, expectedResponse);
    }

    this.logger = logger;
    this.expectedResponse = expectedResponse;
}

ResponseHandler.prototype.reset = function() {
    this.logger.debug('ResponseHandler.reset(): Resetting ResponseHandler for expectedResponse %s', this.expectedResponse);

    this.complete = false;
    this.success = false;
    this.args = undefined;
    this.header = undefined;
    this.body = undefined;
};

ResponseHandler.prototype.RESPONSES_REQUIRING_BODY = {
    'RESERVED': 'passthrough',
    'FOUND': 'passthrough',
    'OK': 'yaml'
};

function findInBuffer(buffer, bytes) {
    var ptr = 0;
    var idx = 0;

    while (ptr < buffer.length) {
        if (buffer[ptr] === bytes[idx]) {
            idx++;
            if (idx === bytes.length) {
                return (ptr - bytes.length + 1);
            }
        } else {
            idx = 0;
        }
        ptr++;
    }
    return -1;
}

/*
data should be of type Buffer
*/
ResponseHandler.prototype.process = function(data) {
    this.logger.trace('ResponseHandler.process(): Entering method... data: %s, expectedResponse: %s', data, this.expectedResponse);

    var eol = findInBuffer(data, CRLF);
    if (eol > -1) {
        var sliceStart;

        // Header is everything up to the windows line break;
        // body is everything after.
        this.header = data.toString('utf8', 0, eol);
        this.body = data.slice(eol + 2, data.length);
        this.args = this.header.split(' ');

        var response = this.args[0];
        this.logger.trace('ResponseHandler.process(): found response: %s, expectedResponse: %s', response, this.expectedResponse);
        if (response === this.expectedResponse) {
            this.logger.trace('ResponseHandler.process(): Got expected response: %s', response);
            this.success = true;
            this.args.shift(); // remove it as redundant
        }

        if (this.RESPONSES_REQUIRING_BODY[response]) {
            this.logger.trace('ResponseHandler.process(): Parsing body for response %s', response);
            this.parseBody(this.RESPONSES_REQUIRING_BODY[response]);
            if (this.complete) {
                sliceStart = eol + 2 + data.length + 2;
                if (sliceStart >= data.length) {
                    return new Buffer(0);
                }
                this.logger.trace('ResponseHandler.process(): ResponseHandler for %s completed (body has been parsed); Returning with data %s', this.expectedResponse, data.slice(eol + 2 + data.length + 2));
                return data.slice(eol + 2 + data.length + 2);
            }
        } else {
            this.complete = true;
            sliceStart = eol + 2;
            if (sliceStart >= data.length) {
                return new Buffer(0);
            }
            this.logger.trace('ResponseHandler.process(): ResponseHandler for %s completed; Returning with data %s', this.expectedResponse, data.slice(eol + 2 + data.length + 2));
            return data.slice(eol + 2);
        }
    }
    this.logger.trace('ResponseHandler.process(): ResponseHandler for %s is still waiting.', this.expectedResponse);
    return data;
};

/*
RESERVED <id> <bytes>\r\n
<data>\r\n

OK <bytes>\r\n
<data>\r\n

Beanstalkd commands like reserve() & stats() return a body.
We must read <bytes> data in response.
*/
ResponseHandler.prototype.parseBody = function(how) {
    this.logger.trace('ResponseHandler.parseBody(%s) %j', how, this.body);

    if (this.body === undefined || this.body === null) {
        this.logger.trace('ResponseHandler.parseBody(%s): No body found!', how);
        return;
    }

    var expectedLength = parseInt(this.args[this.args.length - 1], 10);
    if (this.body.length > (expectedLength + 2)) {
        this.logger.trace('ResponseHandler.parseBody(%s): body contains multiple responses, splitting body: ', how, this.body.toString('utf-8'));
        this.logger.warn('ResponseHandler.parseBody(%s): (THIS IS NOT AN ERROR) body contains multiple responses, splitting body: ', how, this.body.toString('utf-8'));
        // Body contains multiple responses. Split off the remaining bytes.
        this.remainder = this.body.slice(expectedLength + 2);
        this.body = this.body.slice(0, expectedLength + 2);
    }

    if (this.body.length === (expectedLength + 2)) {
        this.args.pop();
        var body = this.body.slice(0, expectedLength);
        this.complete = true;
        this.logger.trace('ResponseHandler.parseBody(%s): Body found, marking ResponseHandler as complete: %s', how, body.toString('utf-8'));
        switch (how) {
            case 'yaml':
                this.args.push(yaml.load(body.toString()));
                break;

            default:
                this.args.push(body);
                break;
        }
    }
};


module.exports = ResponseHandler;
ResponseHandler._findInBuffer = findInBuffer;