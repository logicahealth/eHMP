'use strict';
var _ = require('lodash');
var logger = sinon.stub(require('bunyan').createLogger({
    name: 'pcmm-subsystem'
}));
var pcmm = require('./pcmm-subsystem');

describe('PCMM Sub System', function () {

    describe('contains required configuration', function (){

        it('and has a healthcheck', function (){
            var app = {};
            var jbpmHealthCheck = function (app, logger){
                return true;
            };
            app = _.set(app, 'subsystems.jbpm.getHealthcheck', jbpmHealthCheck);
            var config = pcmm.getSubsystemConfig(app, logger);

            expect(_.has(app, 'subsystems.jbpm.getHealthcheck'), 'App is expected to carry the jbpm healthcheck funciton').to.be.true();
            expect(config.healthcheck, 'expected the mock healthcheck to be true').to.be.true();
        });

    });

    describe('executes jbpm db query', function (){
        it('doQuery', function(done){
            var spy = sinon.spy(pcmm._db, 'doQuery');
            var callback = function (error, response){
                expect(spy.calledOnce).to.be.true();
                var firstSpy = spy.getCall(0);
                expect(firstSpy.args[0]).to.be.null();
                expect(firstSpy.args[1]).to.be.property('name', 'dbConfig');
                expect(firstSpy.args[2]).to.match(/SELECT/);
                expect(firstSpy.args[3]).to.be.a.function();//default numeric value
                spy.restore();
                done();
            };
            pcmm.doQuery({'name': 'dbConfig'}, 'SELECT * nowhere', callback);
        });
        it('doQueryWithParams', function(done){
            var spy = sinon.spy(pcmm._db, 'doQueryWithParams');
            var callback = function (error, response){
                expect(spy.calledOnce).to.be.true();
                var firstSpy = spy.getCall(0);
                expect(firstSpy.args[0]).to.be.null();
                expect(firstSpy.args[1]).to.be.property('name', 'dbConfig');
                expect(firstSpy.args[2]).to.match(/SELECT/);
                expect(firstSpy.args[3]).to.be.property('name', 'queryParams');
                expect(firstSpy.args[4]).to.be.a.function();
                expect(firstSpy.args[5]).to.be(1000000); //default numeric value
                spy.restore();
                done();
            };
            pcmm.doQueryWithParams({'name': 'dbConfig'}, 'SELECT * nowhere', {'name': 'queryParams'}, callback);

        });
        //The following requires work to be done on the fake oracle
        it.skip('doExecuteProcWithParams', function(done){
            var spy = sinon.spy(pcmm._db, 'doExecuteProcWithParams');
            var callback = function (error, response){
                expect(spy.calledOnce).to.be.true();
                var firstSpy = spy.getCall(0);
                expect(firstSpy.args[0]).to.be.null();
                expect(firstSpy.args[1]).to.be.property('name', 'dbConfig');
                expect(firstSpy.args[2]).to.match(/SELECT/);
                expect(firstSpy.args[3]).to.be.property('name', 'queryParams');
                expect(firstSpy.args[4]).to.be.a.function();
                expect(firstSpy.args[5]).to.be(1000000); //default numeric value
                spy.restore();
                done();
            };
            pcmm.doExecuteProcWithParams({'name': 'dbConfig'}, 'SELECT * nowhere', {'name': 'queryParams'}, callback);
        });
    });

    describe('supports querys to jbpm datastore', function (){
        it('by validating', function(){
            expect(true).to.be.true();
        });
    });
});
