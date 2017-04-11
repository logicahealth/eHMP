'use strict';

var deleteHandler = require('./communication-request-delete');

function stubRequest() {
    var logger = {
        trace: function() {},
        debug: function() {},
        info: function() {},
        warn: function() {},
        error: function() {},
        fatal: function() {}
    };
    var app = {
        config: {
            generalPurposeJdsServer: ''
        }
    };
    var req = {
        logger: logger,
        app: app
    };
    return req;
}

function stubResponse() {
    var res = {
        status: function() {},
        send: function() {},
        next: function() {}
    };
    return res;
}
describe('When deleting a communication request', function() {
    var callback;
    var req = stubRequest();
    var res = stubResponse();
    var queueName = '9E7A;18';
    var queue = {
        delete: function(queueName, id, callback) {
            callback(null, 'deleteCalled');
        },
        removeQueue: function(queueName, callback) {
            callback(null, 'removeQueueCalled');
        }
    };

    beforeEach(function() {
        callback = sinon.spy();
    });

    afterEach(function() {
        callback.reset();
    });

    it('a single communication request is deleted if a resource id is provided', function(done) {
        deleteHandler.handle(queue, queueName, 1, callback, req, res);
        expect(callback.calledWith(null, 'deleteCalled'));

        done();
    });

});
