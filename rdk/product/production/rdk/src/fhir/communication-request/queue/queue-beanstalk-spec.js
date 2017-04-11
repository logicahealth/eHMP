'use strict';

var queue = require('./queue-beanstalk');
var Beanstalk = require('./../../../subsystems/beanstalk-subsystem');

var logger = sinon.stub(require('bunyan').createLogger({
    name: 'queue-beanstalk-mock.js'
}));

describe('When messages are queued in beanstalk with mock', function() {
    var mockClient, mockClientFactory;

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

    beforeEach(function() {
        mockClient = {
            openConnection: function(callback) {return callback(null, this);},
            closeConnection: function() {},
            use: function(tube, callback) {},
            put: function(priority, delay, ttr, payload, callback) {},
            watch: function (tube, callback) {},
            reserveWithTimeout: function(seconds, callback) {},
            destroy: function(jobId, callback) {},
            release: function(jobId, priority, delay, callback) {},
            peek: function(jobId, callback) {}
        };

        mockClientFactory = sinon.stub(Beanstalk, 'client', function(logger, host, port) {
            return mockClient;
        });

        queue.init(logger, '', 1);
    });

    afterEach(function() {
        mockClientFactory.restore();
    });

    it('can enqueue message to multiple queues', function(done) {
        mockClient.use = function(tube, callback) { return callback(null, tube);} ;
        mockClient.put = function(priority, delay, ttr, payload, callback) { return callback(); };

        var spyUse = sinon.spy(mockClient, 'use');
        var spyPut = sinon.spy(mockClient, 'put');

        queue.enqueue([patientRecipient, providerRecipient], multiRecipientMessage, function(err) {
            expect(err).to.be.falsy();

            expect(spyUse.calledTwice).to.be.true();
            expect(spyUse.calledWith(patientRecipient)).to.be.true();
            expect(spyUse.calledWith(providerRecipient)).to.be.true();

            expect(spyPut.calledTwice).to.be.true();
            expect(spyPut.getCall(0).calledWith(1,0,300,JSON.stringify(multiRecipientMessage))).to.be.true();
            expect(spyPut.getCall(1).calledWith(1,0,300,JSON.stringify(multiRecipientMessage))).to.be.true();

            spyPut.restore();
            spyUse.restore();

            done();
        });
    });

    it('can dequeue all messages', function(done) {
        var i = 1;

        mockClient.watch = function (tube, callback) { return callback(); };
        mockClient.reserveWithTimeout = function(seconds, callback) {
            if (i === 1) {
                return callback(null, i++, JSON.stringify( singleRecipientMessage));
            } else {
                return callback('TIMED_OUT');
            }
        };
        mockClient.release = function(jobId, priority, delay, callback) { return callback(); };

        var spyWatch = sinon.spy(mockClient, 'watch');
        var spyReserve = sinon.spy(mockClient, 'reserveWithTimeout');
        var spyRelease = sinon.spy(mockClient, 'release');

        queue.dequeueAll(patientRecipient, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.array();
            expect(result).must.have.length(1);
            expect(result[0].id).to.be(1);

            expect(spyWatch.calledOnce).to.be.true();

            expect(spyReserve.calledTwice).to.be.true();
            expect(spyRelease.calledOnce).to.be.true();

            spyWatch.restore();
            spyReserve.restore();
            spyRelease.restore();

            done();
        });
    });

    it('can dequeue a single message by resource id', function(done) {
        mockClient.peek = function(jobId, callback) {
            callback(null, 1, JSON.stringify(singleRecipientMessage));
        };

        var spyPeek = sinon.spy(mockClient, 'peek');

        queue.dequeue(patientRecipient, 1, function(err, result) {
            expect(result).to.be.object();
            expect(result.id).must.be(1);

            expect(spyPeek.calledOnce).to.be.true();

            spyPeek.restore();

            done();
        });
    });

    it('get a 404 error when dequeueing a single message by resource id that is not in the queue', function(done) {
        mockClient.peek = function(jobId, callback) {
            callback('NOT_FOUND');
        };

        var spyPeek = sinon.spy(mockClient, 'peek');

        queue.dequeue(patientRecipient, 1, function(err, result) {
            expect(err.code).must.be(404);
            expect(result).to.be.falsy();

            expect(spyPeek.calledOnce).to.be.true();

            spyPeek.restore();

            done();
        });
    });

    it('can delete a single message by resource id', function(done) {
        mockClient.destroy = function(id, callback) {
            return callback();
        };

        var spyDestroy = sinon.spy(mockClient, 'destroy');

        queue.delete(patientRecipient, 1, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.falsy();

            expect(spyDestroy.calledOnce).to.be.true();

            spyDestroy.restore();

            done();
        });
    });

    it('can delete a non existent message by resource id without error', function(done) {
        mockClient.destroy = function(id, callback) {
            return callback('NOT_FOUND');
        };

        var spyDestroy = sinon.spy(mockClient, 'destroy');

        queue.delete(patientRecipient, 1, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.falsy();

            expect(spyDestroy.calledOnce).to.be.true();

            spyDestroy.restore();

            done();
        });
    });

    it('can remove all messages from a queue', function(done) {
        var i = 1;

        mockClient.watch = function (tube, callback) { return callback(); };
        mockClient.reserveWithTimeout = function(seconds, callback) {
            if (i < 3) {
                return callback(null, i++, singleRecipientMessage);
            } else {
                return callback('TIMED_OUT');
            }
        };
        mockClient.destroy = function(id, callback) {
            return callback();
        };


        var spyWatch = sinon.spy(mockClient, 'watch');
        var spyReserve = sinon.spy(mockClient, 'reserveWithTimeout');
        var spyDestroy = sinon.spy(mockClient, 'destroy');

        queue.removeQueue(patientRecipient, function(err, result) {
            expect(err).to.be.falsy();
            expect(result).to.be.falsy();

            expect(spyWatch.calledOnce).to.be.true();

            expect(spyReserve.calledThrice).to.be.true();
            expect(spyDestroy.calledTwice).to.be.true();

            spyWatch.restore();
            spyReserve.restore();
            spyDestroy.restore();

            done();
        });
    });
});
