'use strict';

var getHandler = require('./communication-request-get');

describe('When getting a communication request', function() {
    var callback, spyDequeue, queue;
    var queueName = 'provider/PW    ';

    beforeEach(function() {
        queue = {dequeue: function(queueName, id, callback) {
            return callback(null, {});
        },
        dequeueAll: function(queueName, callback) {
            return callback(null, []);
        }};

        callback = sinon.spy();
    });

    afterEach(function() {
        spyDequeue.reset();
        callback.reset();
    });

    it('a single communication request is returned if  resource id is provided', function(done) {
        spyDequeue = sinon.spy(queue, 'dequeue');

        getHandler.handle(queue, queueName, '1', callback);
        expect(spyDequeue.calledWith(queueName, '1', callback)).to.be.true();
        expect(callback.callCount).to.be(1);

        done();
    });

    it('no communication request is returned if  resource id is provided but has no requests', function(done) {
        spyDequeue = sinon.spy(queue, 'dequeue');

        getHandler.handle(queue, queueName, '1', callback);
        expect(spyDequeue.calledWith(queueName, '2', callback)).to.be.false();
        expect(callback.callCount).to.be(1);
        console.log(callback.args[1]);

        done();
    });

    it('all communication requests are returned when a resource id is Not provided', function(done) {
        queue.dequeueAll = function(queueName, callback) {
            return callback(null, [{}]);
        };

        spyDequeue = sinon.spy(queue, 'dequeueAll');

        getHandler.handle(queue, queueName, {}, callback);

        expect(spyDequeue.calledWith(queueName)).to.be.true();
        expect(callback.callCount).to.be(1);
        expect(callback.args[0][1].length).to.be(1);

        done();
    });

});
