'use strict';

require('../../../../env-setup');

var _ = require('underscore');
var handler = require(global.VX_HANDLERS + 'vler-to-vpr-xform/vler-to-vpr-xform-handler');
var log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'vler-sync-request-handler-spec',
//     level: 'debug'
// });
var nock = require('nock');
var PublisherRouterDummy = require(global.VX_DUMMIES + 'publisherRouterDummy');

var vlerRecord1 = {
    icn: '11111V22222',
    document: {
        homeCommunityId: 'urn:oid:2.16.840.1.113883.3.42.10001.100001.18',
        repositoryUniqueId: '2.16.840.1.113883.3.198',
        documentUniqueId: '5a31395c-b245-4333-b62f-e94fb0c7ae5d',
        mimeType: null,
        name: 'Summarization of episode note',
        authorList: [{
            name: '7.9^Epic - Version 7.9^^^^^^^&1.2.840.114350.1.1&ISO',
            institution: 'HEALTHeLINK'
        }],
        creationTime: '20140616213908',
        sourcePatientId: '1666000001^^^&2.16.840.1.113883.3.42.10001.100001.18&ISO',
        localId: 'urn.oid.2.16.840.1.113883.3.42.10001.100001.18_2.16.840.1.113883.3.198_5a31395c-b245-4333-b62f-e94fb0c7ae5d',
        uid: 'urn:va:vlerdocument:VLER:11111V22222:urn.oid.2.16.840.1.113883.3.42.10001.100001.18_2.16.840.1.113883.3.198_5a31395c-b245-4333-b62f-e94fb0c7ae5d',
        pid: 'VLER;11111V22222'
    },
    uid: 'urn:va:vlerdocument:VLER:11111V22222:urn.oid.2.16.840.1.113883.3.42.10001.100001.18_2.16.840.1.113883.3.198_5a31395c-b245-4333-b62f-e94fb0c7ae5d',
    stampTime: jasmine.any(String),
    pid: 'VLER;11111V22222'
};

describe('vler-to-vpr-xform-handler.js', function() {
    describe('getFullHtml', function() {
        it('Test compress required getFullHtml()', function() {
            var done = false;
            var error;
            var test = {
                callback: function(err, result) {
                    expect(result).toBe('XQAAAQADAAAAAAAAAAAzG8pMNEjf//XEQAA=');
                    done = true;
                    error = err;
                }
            };

            handler._getFullHtml(log, true, 'foo', test.callback);
            waitsFor(function() {
                return done;
            }, '"done" should be true', 1000);
            runs(function() {
                expect(error).toBeNull();
            });
        });

        it('Test compress not required getFullHtml()', function() {
            var done = false;
            var error;
            var test = {
                callback: function(err, result) {
                    expect(result).toBe('foo');
                    done = true;
                    error = err;
                }
            };

            handler._getFullHtml(log, false, 'foo', test.callback);
            waitsFor(function() {
                return done;
            }, '"done" should be true', 1000);
            runs(function() {
                expect(error).toBeNull();
            });
        });
    });

    describe('handler', function() {
        var referenceInfo = {
            requestId: 'vler-to-vpr-xform-requestId',
            sessionId: 'vler-to-vpr-xform-sessionId'
        };

        var config = {
            vler: {
                defaults: {
                    host: '0.0.0.0',
                    port: '1234',
                    method: 'GET',
                },
                vlerdocument: {
                    documentPath: '/vler/document'
                }
            }
        };

        var patientIdentifier = {
            type: 'pid',
            value: 'VLER;11111V22222'
        };

        var job = {
            type: 'vler-xform-vpr',
            timestamp: '20170101135900',
            patientIdentifier: patientIdentifier,
            jpid: 'aaaa-bbbb-cccc',
            referenceInfo: referenceInfo,
            dataDomain: 'vlerdocument',
            record: vlerRecord1,
            requestStampTime: '20170101135900',
            jobId: 'xxxx-yyyy-zzzz'
        };

        var environment = {
            publisherRouter: new PublisherRouterDummy()
        };

        var vlerHostAndPort = 'http://0.0.0.0:1234';
        var vlerQueryString = '/vler/document?icn=11111V22222&documentUniqueId=5a31395c-b245-4333-b62f-e94fb0c7ae5d&homeCommunityId=urn%3Aoid%3A2.16.840.1.113883.3.42.10001.100001.18&repositoryUniqueId=2.16.840.1.113883.3.198';

        it('Error path: error from vler request', function(done) {
            nock(vlerHostAndPort)
                .get(vlerQueryString)
                .replyWithError('ERROR from VLER');

            handler(log, config, environment, job, function(error, response) {
                expect(error).toBeTruthy();
                expect(response).toBeFalsy();
                done();
            });
        });
        it('Error path: null response from vler', function(done) {
            nock(vlerHostAndPort)
                .get(vlerQueryString)
                .reply(null, null);

            handler(log, config, environment, job, function(error, response) {
                expect(error).toBeTruthy();
                expect(response).toBeFalsy();
                done();
            });
        });
        it('Error path: non-200 response from vler', function(done) {
            nock(vlerHostAndPort)
                .get(vlerQueryString)
                .reply(500, {});

            handler(log, config, environment, job, function(error, response) {
                expect(error).toBeTruthy();
                expect(response).toBeFalsy();
                done();
            });
        });
        it('Error path: publisher error', function(done) {
            spyOn(environment.publisherRouter, 'publish').andCallFake(function(job, callback) {
                callback('Publisher Error');
            });

            nock(vlerHostAndPort)
                .get(vlerQueryString)
                .reply(200, {
                    vlerDocHtml: 'foo',
                    vlerDocType: 'bar'
                });

            handler(log, config, environment, job, function(error, response) {
                expect(error).toBeFalsy();
                expect(response).toEqual('FailedToPublishJobs');
                expect(environment.publisherRouter.publish).toHaveBeenCalled();
                done();
            });
        });
        it('Normal path', function(done) {
            spyOn(environment.publisherRouter, 'publish').andCallThrough();

            nock(vlerHostAndPort)
                .get(vlerQueryString)
                .reply(200, {
                    vlerDocHtml: 'foo',
                    vlerDocType: 'bar'
                });

            handler(log, config, environment, job, function(error, response) {
                expect(error).toBeFalsy();
                expect(response).toEqual('success');
                expect(environment.publisherRouter.publish).toHaveBeenCalled();
                expect(environment.publisherRouter.publish).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'event-prioritization-request',
                    timestamp: jasmine.any(String),
                    patientIdentifier: patientIdentifier,
                    jpid: 'aaaa-bbbb-cccc',
                    referenceInfo: referenceInfo,
                    dataDomain: 'vlerdocument',
                    record: _.defaults({kind: 'bar', fullHtml: 'foo', stampTime: jasmine.any(String), summary: vlerRecord1.document.name}, _.omit(vlerRecord1.document, 'localId')),
                    jobId: jasmine.any(String)
                }), jasmine.any(Function));
                done();
            });
        });
    });
});