'use strict';

var queue = require('./queue-beanstalk');

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'queue-beanstalk.js'
}));

// FUTURE-TODO: Re-enable (remove .skip) once resource is fully supported/tested end-to-end by system.
describe.skip('When messages are queued in beanstalk', function() {
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

    beforeEach(function(done) {
        queue.init(logger, '127.0.0.1', 11300);
        queue.enqueue([patientRecipient], singleRecipientMessage, function(err, result) {
            queue.enqueue([patientRecipient, providerRecipient], multiRecipientMessage, function(err, result) {
                done();
            });
        });
    });

    afterEach(function(done) {
        queue.removeQueue(providerRecipient, function(err, result) {
            queue.removeQueue(patientRecipient, function(err, result) {
                done();
            });
        });
    });

    it('can dequeue all messages', function(done) {
        queue.dequeueAll(patientRecipient, function(err, result) {
            expect(result).to.be.array();
            expect(result).must.have.length(2);

            done();
        });
    });

    it('can dequeue a single message by resource id', function(done) {
        queue.dequeueAll(patientRecipient, function(err, result) {
            var resourceId = result[1].id;

            queue.dequeue(patientRecipient, resourceId, function(err, result) {
                expect(result.id).must.be(resourceId);

                done();
            });
        });
    });

    it('can dequeue a non existing queue without error', function(done) {
        queue.dequeueAll('123', function(err, result) {
            expect(result).to.be.array();
            expect(result).must.have.length(0);

            done();
        });
    });

    it('get a 404 error when dequeuing a single message by resource id that is not in the queue', function(done) {
        queue.dequeueAll(patientRecipient, function(err, result) {
            queue.dequeue(patientRecipient, 6, function(err, result) {
                expect(err.code).must.be(404);

                done();
            });
        });
    });

    it('can delete a single message by resource id', function(done) {
        queue.dequeueAll(patientRecipient, function(err, result) {
            var resourceId = result[1].id;

            queue.delete(patientRecipient, resourceId, function(err, result) {
                queue.dequeue(patientRecipient, resourceId, function(err, result) {
                    expect(err.code).must.be(404);

                    done();
                });
            });
        });
    });

    it('can delete a non existent message by resource id without error', function(done) {
        queue.delete(patientRecipient, '345345345', function(err, result) {
            expect(err).to.be.null();

            done();
        });
    });
});
