'use strict';

var _ = require('lodash');
var rdkOuterceptors = require('./rdk-outerceptors');

describe('createOuterceptorHandler', function() {
    var app;
    var originalSend;
    var error;

    beforeEach(function() {
        error = null;
        app = {
            response: {
                send: function() {
                    this.done();
                },
                get: function() {},
                type: function() {},
                req: {
                    _resourceConfigItem: {
                        path: 'myPath'
                    }
                }
            },
            outerceptorPathRegistry: {
                myPath: [
                    function(req, res, body, callback) {
                        callback(error, req, res, body);
                    }
                ]
            }
        }
        app.response.app = app;
        originalSend = sinon.spy(app.response, 'send');
        app.outerceptorPathRegistry.myPath = _.map(app.outerceptorPathRegistry.myPath, function(func) {
            return sinon.spy(func);
        });
        app.logger = sinon.stub(require('bunyan').createLogger({
            name: 'app-factory-spec.js'
        }));

        rdkOuterceptors.createOuterceptorHandler(app);
    });

    function sendAndCheck() {
        var args = _.initial(arguments);
        app.response.done = _.last(arguments);
        app.response.send.call(app.response, args);
    }

    it('run outerceptors on send', function(done) {
        sendAndCheck({hi: 'lo'}, function() {
            expect(originalSend.calledOnce).to.be.true();
            _.each(app.outerceptorPathRegistry.myPath, function(spy) {
                expect(spy.calledOnce).to.be.true();
            });
            done();
        });
    });

    it('run outerceptors only once', function(done) {
        var body = {hi: 'lo'};
        sendAndCheck(body, function() {
            sendAndCheck(body, function() {
                expect(originalSend.calledTwice).to.be.true();
                _.each(app.outerceptorPathRegistry.myPath, function(spy) {
                    expect(spy.calledOnce).to.be.true();
                });
                done();
            });
        });
    });
});
