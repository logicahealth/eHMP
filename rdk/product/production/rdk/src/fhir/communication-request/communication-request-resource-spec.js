'use strict';

var httpMocks = require('node-mocks-http');
var getHandler = require('./communication-request-get');
var addHandler = require('./communication-request-add');
var deleteHandler = require('./communication-request-delete');
var communicationRequestResource = require('./communication-request-resource');

describe('When the communication resource is called', function() {
    var req, res, mockHandler, spyStatus;

    var logger = sinon.stub(require('bunyan').createLogger({
        name: 'communication-request-resource'
    }));

    beforeEach(function() {
        req = {};
        req.logger = logger;
        req.params = {
            resourceId: 1000,
            recipientId: 'pu1234'
        };

        res = httpMocks.createResponse();
        spyStatus = sinon.spy(res, 'status');
    });

    afterEach(function() {
        mockHandler.restore();
        spyStatus.reset();
    });

    it('to get a single communication request return the request', function(done) {
        mockHandler = sinon.stub(getHandler, 'handle', function(queue, queueName, params, callback) {
            return callback(null, {});
        });


        function tester() {
            expect(mockHandler.callCount).to.be(1);
            expect(spyStatus.withArgs(200).called).to.be.true();

            done();
        }
        res.send = tester;

        communicationRequestResource._getCommunicationRequest(req, res);
    });

    it('to get a single communication request return a no found error', function(done) {
        mockHandler = sinon.stub(getHandler, 'handle', function(queue, queueName, params, callback) {
            return callback({
                code: 404,
                message: 'no found'
            });
        });


        function tester() {
            expect(mockHandler.callCount).to.be(1);
            expect(spyStatus.withArgs(404).called).to.be.true();

            done();
        }
        res.send = tester;

        communicationRequestResource._getCommunicationRequest(req, res);
    });

    it('to get all communication request return the requests', function(done) {
        mockHandler = sinon.stub(getHandler, 'handle', function(queue, queueName, params, callback) {
            return callback(null, {});
        });


        function tester() {
            expect(mockHandler.callCount).to.be(1);
            expect(spyStatus.withArgs(200).called).to.be.true();

            done();
        }
        res.send = tester;

        communicationRequestResource._getAllCommunicationRequests(req, res);
    });

    it('to get all communication request return a no found error', function(done) {
        mockHandler = sinon.stub(getHandler, 'handle', function(queue, queueName, params, callback) {
            return callback({
                code: 404,
                message: 'no found'
            });
        });


        function tester() {
            expect(mockHandler.callCount).to.be(1);
            expect(spyStatus.withArgs(404).called).to.be.true();

            done();
        }
        res.send = tester;

        communicationRequestResource._getAllCommunicationRequests(req, res);
    });

    it('to add a new communication request, add the request successfully', function(done) {
        mockHandler = sinon.stub(addHandler, 'handle', function(queue, message, callback) {
            return callback(null, {});
        });


        function tester() {
            expect(mockHandler.callCount).to.be(1);
            expect(spyStatus.withArgs(202).called).to.be.true();

            done();
        }
        res.send = tester;

        communicationRequestResource._addCommunicationRequest(req, res);
    });

    it('to add a new communication request, the add fails', function(done) {
        mockHandler = sinon.stub(addHandler, 'handle', function(queue, message, callback) {
            return callback({
                code: 500,
                message: 'no found'
            });
        });


        function tester() {
            expect(mockHandler.callCount).to.be(1);
            expect(spyStatus.withArgs(500).called).to.be.true();

            done();
        }
        res.send = tester;

        communicationRequestResource._addCommunicationRequest(req, res);
    });

    it('to delete a communication request, the request is successfully deleted', function(done) {
        mockHandler = sinon.stub(deleteHandler, 'handle', function(queue, message, id, callback) {
            return callback(null, {});
        });


        function tester() {
            expect(mockHandler.callCount).to.be(1);
            expect(spyStatus.withArgs(204).called).to.be.true();

            done();
        }
        res.send = tester;

        communicationRequestResource._deleteCommunicationRequest(req, res);
    });

    it('to delete a communication request, the delete fails', function(done) {
        mockHandler = sinon.stub(deleteHandler, 'handle', function(queue, message, id, callback) {
            return callback({
                code: 500,
                message: 'no found'
            });
        });


        function tester() {
            expect(mockHandler.callCount).to.be(1);
            expect(spyStatus.withArgs(500).called).to.be.true();

            done();
        }
        res.send = tester;

        communicationRequestResource._deleteCommunicationRequest(req, res);
    });

});
