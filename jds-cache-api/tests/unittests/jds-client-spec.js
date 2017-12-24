'use strict';

const _ = require('lodash');
const logger = require('../dummies/dummy-logger');

// const logger = require('bunyan').createLogger({
//     name: 'jds-client',
//     level: 'debug'
// });

const JdsClient = require('../../src/jds-client');
const cache = require('cache');


describe('jds-client', function() {
    /**
     * Create a mock CacheConnector
     * @param {object} [open] A mock Cache.open method
     * @return {object} A mock cache.Cache instance
     */
    function stubCacheConnector(open) {
        const cacheMethods = [
            'open',
            'close',
            'version',
            'function',
            'get',
            'set',
            'kill',
            'data',
            'global_directory',
            'increment',
            'lock',
            'unlock',
            'merge',
            'order',
            'next',
            'next_node',
            'previous',
            'previous_node',
            'retrieve',
            'update'
        ];
        const fakeCache = jasmine.createSpyObj('fakeCache', cacheMethods);
        if (open) {
            fakeCache.open = open;
        } else {
            fakeCache.open = jasmine.createSpy().andReturn({
                ok: true,
                cache_pid: 1234  // eslint-disable-line camelcase
            });
        }
        spyOn(cache, 'Cache').andReturn(fakeCache);
        return fakeCache;
    }

    describe('JdsClient', function() {
        const jdsClientConfig = {
            username: 'Zm9v',
            password: 'YmFy',
            myCustomConfig: true
        };

        it('sets log, metrics, and config as members', function() {
            stubCacheConnector(function(params) {
                expect(params.username).toMatch(/^\w{3}$/);
                expect(params.password).toMatch(/^\w{3}$/);
                expect(params.myCustomConfig).toEqual(true);
                return {
                    ok: true,
                    cache_pid: 1234  // eslint-disable-line camelcase
                };
            });
            const jdsClient = new JdsClient('log', 'metrics', jdsClientConfig);
            expect(jdsClient.log).toEqual('log');
            expect(jdsClient.metrics).toEqual('metrics');
        });

        it('throws an error if the connection result was not ok', function() {
            stubCacheConnector(function() {
                return {
                    ok: false
                };
            });

            /**
             * @return {JdsClient}
             */
            function createNewJdsClient() {
                return new JdsClient();
            }

            expect(createNewJdsClient).toThrow();
        });

        describe('#connect', function() {
            it('connects to jds via cacheConnector.connect', function() {
                const stubbedCache = stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);

                // First call upon instantiating JdsClient
                expect(stubbedCache.open).toHaveBeenCalled();

                // Make a new spy to listen for the manual connect()
                stubbedCache.open = jasmine.createSpy().andReturn({
                    ok: true,
                    cache_pid: 1234  // eslint-disable-line camelcase
                });
                jdsClient.connect();

                expect(stubbedCache.open).toHaveBeenCalled();
            });
        });

        describe('#disconnect', function() {
            it('disconnects from jds via cacheConnector.disconnect', function() {
                const stubbedCache = stubCacheConnector();
                stubbedCache.close = jasmine.createSpy().andReturn('closed');
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const disconnectResult = jdsClient.disconnect();
                expect(stubbedCache.close).toHaveBeenCalled();
                expect(disconnectResult).toEqual('closed');
            });
        });

        describe('#childInstance', function() {
            it('returns a new instance with the provided logger', function() {
                stubCacheConnector();
                const parentLogger = jasmine.createSpy();
                const childLogger = jasmine.createSpy();
                const jdsClient = new JdsClient(parentLogger, parentLogger, jdsClientConfig);
                const childClient = jdsClient.childInstance(childLogger);
                expect(jdsClient.log).toEqual(parentLogger);
                expect(childClient.log).toEqual(childLogger);
                expect(jdsClient.metrics).toEqual(parentLogger);
                expect(childClient.metrics).toEqual(jdsClient.metrics);
                expect(childClient.config).toEqual(jdsClient.config);
                expect(jdsClient instanceof JdsClient).toBeTruthy();
                expect(childClient instanceof JdsClient).toBeTruthy();
            });
        });

        // Individual patient APIs
        describe('#getPtDemographicsByPid', function() {
            it('returns an error if pid is empty', function(done) {
                stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                jdsClient.getPtDemographicsByPid('', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No pid passed in'
                    }));
                    done();
                });
            });

            it('calls GETPT^VPRJPRN with [pid]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GETPT^VPRJPRN');
                    expect(options['arguments'].length).toEqual(1);
                    expect(options['arguments'][0]).toEqual('L33T;1');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const demographicsCallback = _.noop;
                jdsClient.getPtDemographicsByPid('L33T;1', demographicsCallback);
                // Doesn't work (?_?)
                // expect(stubbedCache.function).toHaveBeenCalledWith(jasmine.objectContaining({
                //     function: 'GETPT^VPRJPRN',
                //     arguments: ['L33T;1']
                // }), demographicsCallback);
            });

            it('calls GETPT^VPRJPRN with [pid], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GETPT^VPRJPRN');
                    expect(options['arguments'].length).toEqual(1);
                    expect(options['arguments'][0]).toEqual('L33T;1');
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const demographicsCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                jdsClient.getPtDemographicsByPid('L33T;1', demographicsCallback);
            });
        });

        describe('#getPtDemographicsByIcn', function() {
            it('returns an error if icn is empty', function(done) {
                stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                jdsClient.getPtDemographicsByIcn('', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No icn passed in'
                    }));
                    done();
                });
            });

            it('calls GETPT^VPRJPRN with [icn, start, limit, startId, returnCounts] (default values)', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GETPT^VPRJPRN');
                    expect(options['arguments'].length).toEqual(5);
                    expect(options['arguments'][0]).toEqual('1234V1234');
                    expect(options['arguments'][1]).toEqual(0);
                    expect(options['arguments'][2]).toEqual(999999);
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const demographicsCallback = _.noop;
                jdsClient.getPtDemographicsByIcn('1234V1234', demographicsCallback);
            });

            it('calls GETPT^VPRJPRN with [icn, start, limit, startId, returnCounts] (custom values)', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GETPT^VPRJPRN');
                    expect(options['arguments'].length).toEqual(5);
                    expect(options['arguments'][0]).toEqual('1234V1234');
                    expect(options['arguments'][1]).toEqual(1);
                    expect(options['arguments'][2]).toEqual(200);
                    expect(options['arguments'][3]).toEqual('urn:va:1');
                    expect(options['arguments'][4]).toEqual(true);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const demographicsCallback = _.noop;
                const options = {
                    start: 1,
                    limit: 200,
                    startId: 'urn:va:1',
                    returnCounts: true
                };
                jdsClient.getPtDemographicsByIcn('1234V1234', options, demographicsCallback);
            });

            it('calls GETPT^VPRJPRN with [icn, start, limit, startId, returnCounts], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GETPT^VPRJPRN');
                    expect(options['arguments'].length).toEqual(5);
                    expect(options['arguments'][0]).toEqual('1234V1234');
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const demographicsCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                jdsClient.getPtDemographicsByIcn('1234V1234', demographicsCallback);
            });
        });

        describe('#getPatientIndexData', function() {
            it('returns an error if pid is empty', function(done) {
                stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                jdsClient.getPatientIndexData('', 'index', 'template', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No pid passed in'
                    }));
                    done();
                });
            });

            it('returns an error if index is empty', function(done) {
                stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                jdsClient.getPatientIndexData('ABCD;6', '', 'template', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No index passed in'
                    }));
                    done();
                });
            });

            it('calls INDEX^VPRJPRN with [pid, index, template]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('INDEX^VPRJPRN');
                    expect(options['arguments'].length).toEqual(3);
                    expect(options['arguments'][0]).toEqual('ABCD;6');
                    expect(options['arguments'][1]).toEqual('docs');
                    expect(options['arguments'][2]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const indexCallback = _.noop;
                jdsClient.getPatientIndexData('ABCD;6', 'docs', '', indexCallback);
            });

            it('calls INDEX^VPRJPRN with [pid, index, template] with the default template when no template was provided', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('INDEX^VPRJPRN');
                    expect(options['arguments'].length).toEqual(3);
                    expect(options['arguments'][0]).toEqual('ABCD;6');
                    expect(options['arguments'][1]).toEqual('docs');
                    expect(options['arguments'][2]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const indexCallback = _.noop;
                jdsClient.getPatientIndexData('ABCD;6', 'docs', indexCallback);
            });

            it('calls INDEX^VPRJPRN with [pid, index, template], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('INDEX^VPRJPRN');
                    expect(options['arguments'].length).toEqual(3);
                    expect(options['arguments'][0]).toEqual('ABCD;6');
                    expect(options['arguments'][1]).toEqual('docs');
                    expect(options['arguments'][2]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const indexCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                jdsClient.getPatientIndexData('ABCD;6', 'docs', '', indexCallback);
            });
        });

        describe('#getPatientDomainData', function() {
            it('returns an error if pid is empty', function(done) {
                stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                jdsClient.getPatientDomainData('', 'domain', 'template', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No pid passed in'
                    }));
                    done();
                });
            });

            it('returns an error if domain is empty', function(done) {
                stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                jdsClient.getPatientDomainData('ABCD;6', '', 'template', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No domain passed in'
                    }));
                    done();
                });
            });

            it('calls FIND^VPRJPRN with [pid, domain, template]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('FIND^VPRJPRN');
                    expect(options['arguments'].length).toEqual(3);
                    expect(options['arguments'][0]).toEqual('ABCD;6');
                    expect(options['arguments'][1]).toEqual('document');
                    expect(options['arguments'][2]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const domainCallback = _.noop;
                jdsClient.getPatientDomainData('ABCD;6', 'document', '', domainCallback);
            });

            it('calls FIND^VPRJPRN with [pid, domain, template] with the default template when no template was provided', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('FIND^VPRJPRN');
                    expect(options['arguments'].length).toEqual(3);
                    expect(options['arguments'][0]).toEqual('ABCD;6');
                    expect(options['arguments'][1]).toEqual('document');
                    expect(options['arguments'][2]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const domainCallback = _.noop;
                jdsClient.getPatientDomainData('ABCD;6', 'document', domainCallback);
            });

            it('calls FIND^VPRJPRN with [pid, domain, template], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('FIND^VPRJPRN');
                    expect(options['arguments'].length).toEqual(3);
                    expect(options['arguments'][0]).toEqual('ABCD;6');
                    expect(options['arguments'][1]).toEqual('document');
                    expect(options['arguments'][2]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const domainCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                jdsClient.getPatientDomainData('ABCD;6', 'document', '', domainCallback);
            });
        });

        describe('#getPatientCountData', function() {
            it('returns an error if pid is empty', function(done) {
                stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                jdsClient.getPatientCountData('', 'countName', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No pid passed in'
                    }));
                    done();
                });
            });

            it('returns an error if countName is empty', function(done) {
                stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                jdsClient.getPatientCountData('ABCD;6', '', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No countName passed in'
                    }));
                    done();
                });
            });

            it('calls COUNT^VPRJPRN with [pid, countName]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('COUNT^VPRJPRN');
                    expect(options['arguments'].length).toEqual(2);
                    expect(options['arguments'][0]).toEqual('ABCD;6');
                    expect(options['arguments'][1]).toEqual('meds');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const countNameCallback = _.noop;
                jdsClient.getPatientCountData('ABCD;6', 'meds', '', countNameCallback);
            });

            it('calls COUNT^VPRJPRN with [pid, countName, template], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('COUNT^VPRJPRN');
                    expect(options['arguments'].length).toEqual(2);
                    expect(options['arguments'][0]).toEqual('ABCD;6');
                    expect(options['arguments'][1]).toEqual('meds');
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const countCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                jdsClient.getPatientCountData('ABCD;6', 'meds', countCallback);
            });
        });

        describe('#getPatientDataByPidAndUid', function() {
            it('returns an error if pid is empty', function(done) {
                stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                jdsClient.getPatientDataByPidAndUid('', 'urn:va:1234', 'template', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No pid passed in'
                    }));
                    done();
                });
            });

            it('returns an error if uid is empty', function(done) {
                stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                jdsClient.getPatientDataByPidAndUid('ABCD;6', '', 'template', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No uid passed in'
                    }));
                    done();
                });
            });

            it('calls GETOBJ^VPRJPRN with [pid, uid, template]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GETOBJ^VPRJPRN');
                    expect(options['arguments'].length).toEqual(3);
                    expect(options['arguments'][0]).toEqual('ABCD;6');
                    expect(options['arguments'][1]).toEqual('urn:va:1234');
                    expect(options['arguments'][2]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const indexCallback = _.noop;
                jdsClient.getPatientDataByPidAndUid('ABCD;6', 'urn:va:1234', '', indexCallback);
            });

            it('calls GETOBJ^VPRJPRN with [pid, uid, template] with the default template when no template was provided', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GETOBJ^VPRJPRN');
                    expect(options['arguments'].length).toEqual(3);
                    expect(options['arguments'][0]).toEqual('ABCD;6');
                    expect(options['arguments'][1]).toEqual('urn:va:1234');
                    expect(options['arguments'][2]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const indexCallback = _.noop;
                jdsClient.getPatientDataByPidAndUid('ABCD;6', 'urn:va:1234', indexCallback);
            });

            it('calls GETOBJ^VPRJPRN with [pid, uid, template], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GETOBJ^VPRJPRN');
                    expect(options['arguments'].length).toEqual(3);
                    expect(options['arguments'][0]).toEqual('ABCD;6');
                    expect(options['arguments'][1]).toEqual('urn:va:1234');
                    expect(options['arguments'][2]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const indexCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                jdsClient.getPatientDataByPidAndUid('ABCD;6', 'urn:va:1234', '', indexCallback);
            });
        });

        // Cross-patient APIs
        describe('#getPatientDataByUid', function() {
            it('returns an error if uid is empty', function(done) {
                stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                jdsClient.getPatientDataByUid('', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No uid passed in'
                    }));
                    done();
                });
            });

            it('calls GETUID^VPRJPRN with [uid, template, start, limit, startId, returnCounts] (default values)', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GETUID^VPRJPRN');
                    expect(options['arguments'].length).toEqual(6);
                    expect(options['arguments'][0]).toEqual('urn:va:1234');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual(0);
                    expect(options['arguments'][3]).toEqual(999999);
                    expect(options['arguments'][4]).toEqual('');
                    expect(options['arguments'][5]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const indexCallback = _.noop;
                jdsClient.getPatientDataByUid('urn:va:1234', indexCallback);
            });

            it('calls GETUID^VPRJPRN with [uid, template, start, limit, startId, returnCounts] (custom values)', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GETUID^VPRJPRN');
                    expect(options['arguments'].length).toEqual(6);
                    expect(options['arguments'][0]).toEqual('urn:va:1234');
                    expect(options['arguments'][1]).toEqual('template');
                    expect(options['arguments'][2]).toEqual(1);
                    expect(options['arguments'][3]).toEqual(99);
                    expect(options['arguments'][4]).toEqual('abc');
                    expect(options['arguments'][5]).toEqual(true);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const indexCallback = _.noop;
                const options = {
                    template: 'template',
                    start: 1,
                    limit: 99,
                    startId: 'abc',
                    returnCounts: true
                };
                jdsClient.getPatientDataByUid('urn:va:1234', options, indexCallback);
            });

            it('calls GETUID^VPRJPRN with [uid, template, start, limit, startId, returnCounts], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GETUID^VPRJPRN');
                    expect(options['arguments'].length).toEqual(6);
                    expect(options['arguments'][0]).toEqual('urn:va:1234');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual(0);
                    expect(options['arguments'][3]).toEqual(999999);
                    expect(options['arguments'][4]).toEqual('');
                    expect(options['arguments'][5]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const indexCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                jdsClient.getPatientDataByUid('urn:va:1234', indexCallback);
            });
        });

        describe('#getAllPatientIndexData', function() {
            it('returns an error if index is empty', function(done) {
                stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                jdsClient.getAllPatientIndexData('', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No index passed in'
                    }));
                    done();
                });
            });

            it('calls ALLINDEX^VPRJPRN with [index, template, order, range, bail, filter, start, limit, startId, returnCounts] (default values)', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('ALLINDEX^VPRJPRN');
                    expect(options['arguments'].length).toEqual(10);
                    expect(options['arguments'][0]).toEqual('docs');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual('');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual('');
                    expect(options['arguments'][5]).toEqual('');
                    expect(options['arguments'][6]).toEqual(0);
                    expect(options['arguments'][7]).toEqual(999999);
                    expect(options['arguments'][8]).toEqual('');
                    expect(options['arguments'][9]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const indexCallback = _.noop;
                jdsClient.getAllPatientIndexData('docs', indexCallback);
            });

            it('calls ALLINDEX^VPRJPRN with [index, template, order, range, bail, filter, start, limit, startId, returnCounts] (custom values)', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('ALLINDEX^VPRJPRN');
                    expect(options['arguments'].length).toEqual(10);
                    expect(options['arguments'][0]).toEqual('meds');
                    expect(options['arguments'][1]).toEqual('template');
                    expect(options['arguments'][2]).toEqual('order');
                    expect(options['arguments'][3]).toEqual('range');
                    expect(options['arguments'][4]).toEqual('bail');
                    expect(options['arguments'][5]).toEqual('filter');
                    expect(options['arguments'][6]).toEqual(1);
                    expect(options['arguments'][7]).toEqual(99);
                    expect(options['arguments'][8]).toEqual('startid');
                    expect(options['arguments'][9]).toEqual(true);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const indexCallback = _.noop;
                const options = {
                    template: 'template',
                    order: 'order',
                    range: 'range',
                    bail: 'bail',
                    filter: 'filter',
                    start: 1,
                    limit: 99,
                    startId: 'startid',
                    returnCounts: true
                };
                jdsClient.getAllPatientIndexData('meds', options, indexCallback);
            });

            it('calls ALLINDEX^VPRJPRN with [index, template, order, range, bail, filter, start, limit, startId, returnCounts], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('ALLINDEX^VPRJPRN');
                    expect(options['arguments'].length).toEqual(10);
                    expect(options['arguments'][0]).toEqual('docs');
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const indexCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                jdsClient.getAllPatientIndexData('docs', indexCallback);
            });
        });

        describe('#getAllPatientDomainData', function() {
            it('returns an error if domain is empty', function(done) {
                stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                jdsClient.getAllPatientDomainData('', 'filter', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No domain passed in'
                    }));
                    done();
                });
            });

            it('returns an error if filter is empty', function(done) {
                stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                jdsClient.getAllPatientDomainData('domain', '', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No filter passed in'
                    }));
                    done();
                });
            });

            it('calls ALLFIND^VPRJPRN with [domain, template, order, bail, filter, start, limit, startId, returnCounts] (default values)', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('ALLFIND^VPRJPRN');
                    expect(options['arguments'].length).toEqual(9);
                    expect(options['arguments'][0]).toEqual('document');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual('');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual('filter');
                    expect(options['arguments'][5]).toEqual(0);
                    expect(options['arguments'][6]).toEqual(999999);
                    expect(options['arguments'][7]).toEqual('');
                    expect(options['arguments'][8]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const domainCallback = _.noop;
                jdsClient.getAllPatientDomainData('document', 'filter',  domainCallback);
            });

            it('calls ALLFIND^VPRJPRN with [domain, template, order, bail, filter, start, limit, startId, returnCounts] (custom values)', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('ALLFIND^VPRJPRN');
                    expect(options['arguments'].length).toEqual(9);
                    expect(options['arguments'][0]).toEqual('document');
                    expect(options['arguments'][1]).toEqual('template');
                    expect(options['arguments'][2]).toEqual('order');
                    expect(options['arguments'][3]).toEqual('bail');
                    expect(options['arguments'][4]).toEqual('filter');
                    expect(options['arguments'][5]).toEqual(1);
                    expect(options['arguments'][6]).toEqual(99);
                    expect(options['arguments'][7]).toEqual('startId');
                    expect(options['arguments'][8]).toEqual(true);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const domainCallback = _.noop;
                const options = {
                    template: 'template',
                    order: 'order',
                    bail: 'bail',
                    start: 1,
                    limit: 99,
                    startId: 'startId',
                    returnCounts: true
                };
                jdsClient.getAllPatientDomainData('document', 'filter', options, domainCallback);
            });

            it('calls ALLFIND^VPRJPRN with [domain, template, order, bail, filter, start, limit, startId, returnCounts], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('ALLFIND^VPRJPRN');
                    expect(options['arguments'].length).toEqual(9);
                    expect(options['arguments'][0]).toEqual('document');
                    expect(options['arguments'][4]).toEqual('filter');
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const domainCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                jdsClient.getAllPatientDomainData('document', 'filter', domainCallback);
            });
        });

        describe('#getAllPatientCountData', function() {
            it('returns an error if countName is empty', function(done) {
                stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                jdsClient.getAllPatientCountData('', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No countName passed in'
                    }));
                    done();
                });
            });

            it('calls ALLCOUNT^VPRJPRN with [countName]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('ALLCOUNT^VPRJPRN');
                    expect(options['arguments'].length).toEqual(1);
                    expect(options['arguments'][0]).toEqual('meds');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const countNameCallback = _.noop;
                jdsClient.getAllPatientCountData('meds', '', countNameCallback);
            });

            it('calls ALLCOUNT^VPRJPRN with [countName, template], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('ALLCOUNT^VPRJPRN');
                    expect(options['arguments'].length).toEqual(1);
                    expect(options['arguments'][0]).toEqual('meds');
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const jdsClient = new JdsClient(logger, logger, jdsClientConfig);
                const countCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                jdsClient.getAllPatientCountData('meds', countCallback);
            });
        });

        // Operational Data APIs
        describe('#getOperationalDataByUid', function() {
            it('returns an error if uid is empty', function(done) {
                stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger);
                jdsClient.getOperationalDataByUid('', '', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No uid passed in'
                    }));
                    done();
                });
            });

            it('calls GETOBJ^VPRJDRN with [uid, template]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GETOBJ^VPRJDRN');
                    expect(options.arguments.length).toEqual(2);
                    expect(options.arguments[0]).toEqual('ABCD;6');
                    expect(options.arguments[1]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger);
                const indexCallback = _.noop;
                jdsClient.getOperationalDataByUid('ABCD;6', '', indexCallback);
            });

            it('calls GETOBJ^VPRJDRN with [uid, template], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GETOBJ^VPRJDRN');
                    expect(options.arguments.length).toEqual(2);
                    expect(options.arguments[0]).toEqual('ABCD;6');
                    expect(options.arguments[1]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const jdsClient = new JdsClient(logger, logger);
                const indexCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                jdsClient.getOperationalDataByUid('ABCD;6', '', indexCallback);
            });
        });

        describe('#getOperationalIndexData', function() {
            it('returns an error if index is empty', function(done) {
                stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger);
                jdsClient.getOperationalIndexData('', '', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No index passed in'
                    }));
                    done();
                });
            });

            it('calls INDEX^VPRJDRN with [index, template]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('INDEX^VPRJDRN');
                    expect(options.arguments.length).toEqual(2);
                    expect(options.arguments[0]).toEqual('ABCD;6');
                    expect(options.arguments[1]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger);
                const indexCallback = _.noop;
                jdsClient.getOperationalIndexData('ABCD;6', '', indexCallback);
            });

            it('calls INDEX^VPRJDRN with [index, template], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('INDEX^VPRJDRN');
                    expect(options.arguments.length).toEqual(2);
                    expect(options.arguments[0]).toEqual('ABCD;6');
                    expect(options.arguments[1]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const jdsClient = new JdsClient(logger, logger);
                const indexCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                jdsClient.getOperationalIndexData('ABCD;6', '', indexCallback);
            });
        });

        describe('#getOperationalDataCount', function() {
            it('returns an error if count is empty', function(done) {
                stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger);
                jdsClient.getOperationalDataCount('', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No countName passed in'
                    }));
                    done();
                });
            });

            it('calls COUNT^VPRJDRN with [count]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('COUNT^VPRJDRN');
                    expect(options.arguments.length).toEqual(2);
                    expect(options.arguments[0]).toEqual('test-name');
                    expect(options.arguments[1]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger);
                const countCallback = _.noop;
                jdsClient.getOperationalDataCount('test-name', countCallback);
            });

            it('calls COUNT^VPRJDRN with [count, all]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('COUNT^VPRJDRN');
                    expect(options.arguments.length).toEqual(2);
                    expect(options.arguments[0]).toEqual('test-name');
                    expect(options.arguments[1]).toEqual(true);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger);
                const countCallback = _.noop;
                jdsClient.getOperationalDataCount('test-name', true, countCallback);
            });

            it('calls COUNT^VPRJDRN with [count], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('COUNT^VPRJDRN');
                    expect(options.arguments.length).toEqual(2);
                    expect(options.arguments[0]).toEqual('test-name');
                    expect(options.arguments[1]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const jdsClient = new JdsClient(logger, logger);
                const countCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                jdsClient.getOperationalDataCount('test-name', countCallback);
            });

            it('calls COUNT^VPRJDRN with [count, all], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('COUNT^VPRJDRN');
                    expect(options.arguments.length).toEqual(2);
                    expect(options.arguments[0]).toEqual('test-name');
                    expect(options.arguments[1]).toEqual(true);
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const jdsClient = new JdsClient(logger, logger);
                const countCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                jdsClient.getOperationalDataCount('test-name', true, countCallback);
            });
        });

        describe('#getOperationalDataCollection', function() {
            it('returns an error if collection is empty', function(done) {
                stubCacheConnector();
                const jdsClient = new JdsClient(logger, logger);
                jdsClient.getOperationalDataCollection('', '', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No collection passed in'
                    }));
                    done();
                });
            });

            it('calls FIND^VPRJDRN with [collection, template]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('FIND^VPRJDRN');
                    expect(options.arguments.length).toEqual(2);
                    expect(options.arguments[0]).toEqual('test');
                    expect(options.arguments[1]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const jdsClient = new JdsClient(logger, logger);
                const collectionCallback = _.noop;
                jdsClient.getOperationalDataCollection('test', '', collectionCallback);
            });

            it('calls FIND^VPRJDRN with [collection, template], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('FIND^VPRJDRN');
                    expect(options.arguments.length).toEqual(2);
                    expect(options.arguments[0]).toEqual('test');
                    expect(options.arguments[1]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const jdsClient = new JdsClient(logger, logger);
                const collectionCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                jdsClient.getOperationalDataCollection('test', '', collectionCallback);
            });
        });
    });
});
