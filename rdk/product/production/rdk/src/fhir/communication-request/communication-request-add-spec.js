'use strict';

var addHandler = require('./communication-request-add');

describe('When adding a communication request', function() {
    var callback, spyEnqueue, message;

    var queue = {enqueue: function(queueNames, message, callback) {
        return callback(null, message);
    }};

    beforeEach(function() {
        spyEnqueue = sinon.spy(queue, 'enqueue');
        callback = sinon.spy();

        message = {recipient: [{reference: 'provider/PW    '}, {reference: 'patient/9E7A;10045'}],
            payload: [{contentReference: {reference: 'patient/9E7A;10045/lab/123'}}]};
    });

    afterEach(function() {
        spyEnqueue.reset();
        callback.reset();
    });

    it('a single communication request is added to multiple recipient queues', function(done) {

        addHandler.handle(queue, message, callback);
        expect(callback.callCount).to.be(1);

        var queueNames = spyEnqueue.args[0][0];
        expect(queueNames.length).to.be(2);
        expect(queueNames).must.include('provider/PW    ');
        expect(queueNames).must.include('patient/9E7A;10045');

        var queueMessage = spyEnqueue.args[0][1];
        expect(queueMessage.identifier).to.not.be.undefined();
        expect(queueMessage.identifier.value).to.not.be.undefined();
        expect(queueMessage.resourceType).to.be('CommunicationRequest');

        done();
    });
});
