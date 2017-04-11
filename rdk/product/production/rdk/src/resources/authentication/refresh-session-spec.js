'use strict';
var bunyan = require('bunyan');
var moment = require('moment');
var httpStatus = require('../../core/httpstatus.js');
var refreshSession = require('./refresh-session.js');

describe('RDK Session', function() {
    it('internal_server_error if none found', function(done) {
        var req = {
            session: {
                destroy: function(cb) {
                    cb();
                }
            }
        };
        req.logger = sinon.stub(bunyan.createLogger({
            name: 'refresh-session-resource'
        }));
        var res = {
            status: function(status) {
                res.status = status;
                return this;
            },
            rdkSend: function(body) {
                expect(body.code).to.match(/200.500.1004/);
                done();
            }
        };

        refreshSession(req, res);
    });

    it('sends back the refreshed user if authenticate', function(done) {
        var expires = moment().add(5, 'minutes').utc().format(); //an expiration for 5 min from now
        var req = {
            session: {
                destroy: function(cb) {
                    cb();
                },
                touch: function() {
                    var newExpiration = moment().add(15, 'minutes').utc().format();
                    this.user.expires = newExpiration;
                    this.expires = newExpiration;
                    this.cookie.expires = newExpiration;
                    return this;
                },
                user: {
                    consumerType: 'user',
                    expires: expires
                },
                cookie: {
                    expires: expires
                },
                expires: expires
            }
        };
        req.logger = sinon.stub(bunyan.createLogger({
            name: 'refresh-session-resource'
        }));
        var res = {
            status: function(status) {
                res.statusCode = status;
                return this;
            },
            rdkSend: function(body) {
                expect(res.statusCode).to.be.equal(200);
                expect(body.expires).to.be.gte(expires);
                done();
            }
        };

        refreshSession(req, res);
    });
});