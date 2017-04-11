'use strict';

var deleteHandler = require('./communication-request-delete');

describe('When deleting a communication request', function() {
    var callback;

    var queueName = '9E7A;18';
    var queue = {delete: function(queueName, id, callback) {
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
        deleteHandler.handle(queue, queueName, 1, callback);
        expect(callback.calledWith(null, 'deleteCalled'));

        done();
    });

    it('all communication requests are deleted if a resource id is Not provided', function(done) {
        deleteHandler.handle(queue, queueName, callback);
        expect(callback.calledWith(null, 'removeQueueCalled'));

        done();
    });
});
