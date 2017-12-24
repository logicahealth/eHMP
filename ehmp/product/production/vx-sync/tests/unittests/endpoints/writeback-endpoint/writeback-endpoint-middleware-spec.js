'use strict';

require('../../../../env-setup');

var log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next lines are commented out before pushing
// var logUtil = require(global.VX_UTILS + 'log');
// log = logUtil._createLogger({
//     name: 'test',
//     level: 'debug',
//     child: logUtil._createLogger
// });

var DummyRequest = require(global.VX_ROOT + 'tests/frames/dummy-request');
var JdsClientDummy = require(global.VX_DUMMIES + 'jds-client-dummy');
var processWriteback = require(global.VX_ENDPOINTS + 'writeback/writeback-endpoint-middleware');

describe('writeback-endpoint-middleware', function(){
	describe('processWriteback', function(){
		it('sends writeback data to jds and solr', function(done){
            var config = {
                vistaSites: {
                    'SITE': {},
                    'SITE': {}
                },
                vista: {
                       domainsNoSolrTracking: []
               },
                jds: {
                    protocol: 'http',
                    host: 'IP        ',
                    port: PORT
                }
            };
            spyOn(log, 'child').andCallThrough();
            var env = {
                publisherRouter: {
                    publish: jasmine.createSpy().andCallFake(function(job, callback) { callback(); })
                },
                jds: new JdsClientDummy(log, config),
                metrics: log,
                solr: {
                    add: function (record, callback) { callback(); },
                    childInstance: function () { return env.solr; }
                }
            };

            env.jds._setResponseData(null,
                [
                    {
                        statusCode: 200
                    },
                    {
                        statusCode: 201
                    }
                ],
                null);
            env.publisherRouter.childInstance = function() { return env.publisherRouter; };
			var req = new DummyRequest({
                'pid': 'SITE;3'
            });
            req.body = {
                'pid': 'SITE;3',
                'uid': 'urn:va:allergy:SITE:3:12',
                'lastUpdateTime': '20150317200936'
            };
            req.headers = {
                'x-session-id': 'sessionId',
                'x-request-id': 'requestId'
            };
            var res = {
                status: jasmine.createSpy().andCallFake(function() { return res; }),
                send: jasmine.createSpy(),
                json: jasmine.createSpy()
            };
            processWriteback(log, config, env, req, res, function() {
                expect(log.child).toHaveBeenCalledWith(jasmine.objectContaining({sessionId: 'sessionId'}));
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith(jasmine.objectContaining({uid: 'urn:va:allergy:SITE:3:12'}));
                done();
            });
		});
	});
});
