'use strict';

var getHandler = require('./communication-request-get');

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
// FUTURE-TODO: Re-enable (remove .skip) once resource is fully supported/tested end-to-end by system.
describe.skip('When getting a communication request', function() {
    var callback, spyDequeue, queue;
    var queueName = 'provider/pu1234';
    var req = stubRequest();
    var res = stubResponse();

    beforeEach(function() {
        queue = {
            dequeue: function(queueName, id, callback) {
                return callback(null, {});
            },
            dequeueAll: function(queueName, callback) {
                return callback(null, []);
            }
        };

        callback = sinon.spy();
    });

    afterEach(function() {
        spyDequeue.reset();
        callback.reset();
    });

    it('dequeue is called if  resource id is provided', function(done) {
        spyDequeue = sinon.spy(queue, 'dequeue');

        getHandler.handle(queue, queueName, '1', callback, req, res);
        expect(spyDequeue.calledWith(queueName, '1')).to.be.true();
        expect(callback.callCount).to.be(1);

        done();
    });

    it('dequeue is called if  resource id is provided but has no requests', function(done) {
        spyDequeue = sinon.spy(queue, 'dequeue');

        getHandler.handle(queue, queueName, '2', callback, req, res);
        expect(spyDequeue.calledWith(queueName, '2')).to.be.true();
        expect(callback.callCount).to.be(1);

        done();
    });

    it('dequeueAll is called when a resource id is Not provided', function(done) {
        queue.dequeueAll = function(queueName, callback) {
            return callback(null, [{}]);
        };

        spyDequeue = sinon.spy(queue, 'dequeueAll');

        getHandler.handle(queue, queueName, {}, callback, req, res);

        expect(spyDequeue.calledWith(queueName)).to.be.true();
        expect(callback.callCount).to.be(1);

        done();
    });

});
