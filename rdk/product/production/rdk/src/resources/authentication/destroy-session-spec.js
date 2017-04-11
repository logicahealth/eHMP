'use strict';
var _ = require('lodash');
var bunyan = require('bunyan');
var httpMocks = require('node-mocks-http');
var httpStatus = require('../../core/httpstatus.js');
var destroySession = require('./destroy-session.js');


describe('Destroy Authentication Session', function() {
    var req;
    var res;
    var next;

    beforeEach(function(done) {
        req = {
            session: {
                destroy: function(cb) {
                    cb();
                }
            },
            logger: sinon.stub(bunyan.createLogger({
                name: 'api-destroy-session-resource'
            }))
        };

        next = sinon.spy();
        res = httpMocks.createResponse();
        done();
    });

    it('internal_server_error if none found', function(done) {
        res.rdkSend = function(body) {
            expect(body.code).to.be.match(/200.500.1003/);
            done();
        };

        destroySession(req, res);
    });


    it('handle error if destroy returns error', function(done) {
        _.set(req, 'session.user.consumerType', 'user'); //psudo valid user
        _.set(req, 'session.destroy', function(cb) {
            cb(new Error('this is a random error'), null);
        });
        res.rdkSend = function(body) {
            expect(body.code).to.be.match(/200.500.1002/);
            done();
        };

        destroySession(req, res);
    });

    it('destroyed if user found', function(done) {
        _.set(req, 'session.user.consumerType', 'user'); //psudo valid user
        res.rdkSend = function(body) {
            expect(res.statusCode).to.be.equal(httpStatus.ok);
            expect(body).to.be.empty();
            done();
        };

        destroySession(req, res);
    });
});