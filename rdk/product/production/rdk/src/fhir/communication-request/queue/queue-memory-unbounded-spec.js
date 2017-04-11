'use strict';

var queue = require('./queue-memory-unbounded');

// FUTURE-TODO: Re-enable (remove .skip) once resource is fully supported/tested end-to-end by system.
describe.skip('When messages are queued in memory', function() {
    var callback;

    var patientRecipient = 'patient/9E7A;10045';
    var providerRecipient = 'provider/PW    ';

    var singleRecipientMessage = {resourceType: 'CommunicationRequest',
        category: {coding: [{code: 'ehmp/msg/category/clinical'}]},
        sender: {reference: 'ehmp/msg/system/jbpm/activity/123/task/1'},
        medium : [{coding: [{code: 'ehmp/msg/medium/ui/todo'}]}],
        recipient: [{reference: patientRecipient}],
        payload: [{contentReference: {reference: 'patient/9E7A;10045/lab/123'}}],
        status: 'requested',
        reason: [{coding: [{code: 'ehmp/reason/clinical'}]}],
        subject: {reference: 'patient/9E7A;10045'},
        priority: {coding: [{code: 'ehmp/priority/high'}]}
    };

    var multiRecipientMessage = {resourceType: 'CommunicationRequest',
        category: {coding: [{code: 'ehmp/msg/category/clinical'}]},
        sender: {reference: 'ehmp/msg/system/jbpm/activity/234/task/5'},
        medium : [{coding: [{code: 'ehmp/msg/medium/ui/todo'}]}],
        recipient: [{reference: providerRecipient}, {reference: patientRecipient}],
        payload: [{contentReference: {reference: 'patient/9E7A;10045/lab/123'}}],
        status: 'requested',
        reason: [{coding: [{code: 'ehmp/reason/clinical'}]}],
        subject: {reference: 'patient/9E7A;10045'},
        priority: {coding: [{code: 'ehmp/priority/high'}]}
    };

    function enqueueCallback(err, result) {
        expect(err).to.be.null();
        expect(result).to.be.object();
    }

    function removeCallback(err, result) {
        expect(err).to.be.falsy();
        expect(result).to.be.falsy();
    }

    beforeEach(function() {
        callback = sinon.spy();

        queue.enqueue([patientRecipient], singleRecipientMessage, enqueueCallback);
        queue.enqueue([patientRecipient, providerRecipient], multiRecipientMessage, enqueueCallback);
    });

    afterEach(function(done) {
        queue.removeQueue(providerRecipient, removeCallback);
        queue.removeQueue(patientRecipient, removeCallback);

        queue.dequeueAll(providerRecipient, function(err, result) { expect(result.length).to.be(0); });
        queue.dequeueAll(patientRecipient, function(err, result) { expect(result.length).to.be(0); });

        callback.reset();

        done();
    });

    it('can dequeue all messages', function(done) {
        queue.dequeueAll(patientRecipient, callback);

        expect(callback.args[0][1]).must.have.length(2);

        done();
    });

    it('can dequeue a single message by resource id', function(done) {
        queue.dequeueAll(patientRecipient, function(err, result) {
            var resourceId = result[1].id;

            queue.dequeue(patientRecipient, resourceId, callback);
            expect(callback.args[0][1].id).must.be(resourceId);

            done();
        });
    });

    it('can dequeue a non existing queue without error', function(done) {
        queue.dequeueAll('123', callback);

        expect(callback.args[0][1]).must.have.length(0);

        done();
    });

    it('get a 404 error when dequeuing a single message by resource id that is not in the queue', function(done) {
        queue.dequeueAll(patientRecipient, function(err, result) {
            queue.dequeue(patientRecipient, 6, callback);
            expect(callback.args[0][0].code).must.be(404);

            done();
        });
    });

    it('can delete a single message by resource id', function(done) {
        queue.dequeueAll(patientRecipient, function(err, result) {
            var resourceId = result[1].id;

            queue.delete(patientRecipient, resourceId, callback);
            queue.dequeue(patientRecipient, resourceId, callback);
            expect(callback.args[1][0].code).must.be(404);

            done();
        });
    });
});
