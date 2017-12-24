'use strict';

const _ = require('lodash');
const logger = require('../dummies/dummy-logger');

// const logger = require('bunyan').createLogger({
//     name: 'pjds-client',
//     level: 'debug'
// });

const PjdsClient = require('../../src/pjds-client');
const clientUtils = require('../../src/client-utils');
const cache = require('cache');


describe('pjds-client', function() {
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
        spyOn(clientUtils, 'setStoreData').andCallFake(function(stubbedCache, data, callback) {
            return callback(null, {nodeUuid: '1s4a817b-93ff-4e7f-8af4-0de4a2498329'});
        });
        return fakeCache;
    }

    describe('PjdsClient', function() {
        const pjdsClientConfig = {
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
            const pjdsClient = new PjdsClient('log', 'metrics', pjdsClientConfig);
            expect(pjdsClient.log).toEqual('log');
            expect(pjdsClient.metrics).toEqual('metrics');
        });

        it('throws an error if the connection result was not ok', function() {
            stubCacheConnector(function() {
                return {
                    ok: false
                };
            });

            /**
             * @return {PjdsClient}
             */
            function createNewPjdsClient() {
                return new PjdsClient();
            }

            expect(createNewPjdsClient).toThrow();
        });

        describe('#connect', function() {
            it('connects to pjds via cacheConnector.connect', function() {
                const stubbedCache = stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);

                // First call upon instantiating PjdsClient
                expect(stubbedCache.open).toHaveBeenCalled();

                // Make a new spy to listen for the manual connect()
                stubbedCache.open = jasmine.createSpy().andReturn({
                    ok: true,
                    cache_pid: 1234  // eslint-disable-line camelcase
                });
                pjdsClient.connect();

                expect(stubbedCache.open).toHaveBeenCalled();
            });
        });

        describe('#disconnect', function() {
            it('disconnects from pjds via cacheConnector.disconnect', function() {
                const stubbedCache = stubCacheConnector();
                stubbedCache.close = jasmine.createSpy().andReturn('closed');
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const disconnectResult = pjdsClient.disconnect();
                expect(stubbedCache.close).toHaveBeenCalled();
                expect(disconnectResult).toEqual('closed');
            });
        });

        describe('#childInstance', function() {
            it('returns a new instance with the provided logger', function() {
                stubCacheConnector();
                const parentLogger = jasmine.createSpy();
                const childLogger = jasmine.createSpy();
                const pjdsClient = new PjdsClient(parentLogger, parentLogger, pjdsClientConfig);
                const childClient = pjdsClient.childInstance(childLogger);
                expect(pjdsClient.log).toEqual(parentLogger);
                expect(childClient.log).toEqual(childLogger);
                expect(pjdsClient.metrics).toEqual(parentLogger);
                expect(childClient.metrics).toEqual(pjdsClient.metrics);
                expect(childClient.config).toEqual(pjdsClient.config);
                expect(pjdsClient instanceof PjdsClient).toBeTruthy();
                expect(childClient instanceof PjdsClient).toBeTruthy();
            });
        });

        // PJDS store APIs
        describe('#getActiveUsers', function() {
            it('calls #getPjdsStoreData without filter', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(10);
                    expect(options['arguments'][0]).toEqual('activeusr');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual('');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual(false);
                    expect(options['arguments'][5]).toEqual('');
                    expect(options['arguments'][6]).toEqual(0);
                    expect(options['arguments'][7]).toEqual(999999);
                    expect(options['arguments'][8]).toEqual('');
                    expect(options['arguments'][9]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.getPjdsStoreData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'getPjdsStoreData').andCallThrough();
                pjdsClient.getActiveUsers('', _.noop);
            });

            it('calls #getPjdsStoreData with filter', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(10);
                    expect(options['arguments'][0]).toEqual('activeusr');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual('');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual(false);
                    expect(options['arguments'][5]).toEqual('eq(uid,urn:va:user:SITE:10000000016)');
                    expect(options['arguments'][6]).toEqual(0);
                    expect(options['arguments'][7]).toEqual(999999);
                    expect(options['arguments'][8]).toEqual('');
                    expect(options['arguments'][9]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.getPjdsStoreData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'getPjdsStoreData').andCallThrough();
                pjdsClient.getActiveUsers({filter: 'eq(uid,urn:va:user:SITE:10000000016)'}, _.noop);
            });
        });

        describe('#addActiveUser', function() {
            it('calls #setPjdsStoreData with activeUser.uid', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('SET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('activeusr');
                    expect(options['arguments'][1]).toEqual('urn:va:user:SITE:10000000016');
                    expect(options['arguments'][2]).toEqual(false);
                    expect(options['arguments'][3]).toEqual('1s4a817b-93ff-4e7f-8af4-0de4a2498329');
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.setPjdsStoreData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.addActiveUser({uid: 'urn:va:user:SITE:10000000016'}, _.noop);
            });
        });

        describe('#removeActiveUser', function() {
            it('calls #deletePjdsStoreData with uid', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('DEL^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('activeusr');
                    expect(options['arguments'][1]).toEqual('urn:va:user:SITE:10000000016');
                    expect(options['arguments'][2]).toEqual(false);
                    expect(options['arguments'][3]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.deletePjdsStoreData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'deletePjdsStoreData').andCallThrough();
                pjdsClient.removeActiveUser('urn:va:user:SITE:10000000016', _.noop);
            });
        });

        describe('#getOSyncClinicsBySite', function() {
            it('calls #getPjdsStoreIndexData with site', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('INDEX^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(12);
                    expect(options['arguments'][0]).toEqual('osynclinic');
                    expect(options['arguments'][1]).toEqual('osynclinic-site');
                    expect(options['arguments'][2]).toEqual('');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual('SITE');
                    expect(options['arguments'][5]).toEqual('');
                    expect(options['arguments'][6]).toEqual(false);
                    expect(options['arguments'][7]).toEqual('');
                    expect(options['arguments'][8]).toEqual(0);
                    expect(options['arguments'][9]).toEqual(999999);
                    expect(options['arguments'][10]).toEqual('');
                    expect(options['arguments'][11]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.getPjdsStoreIndexData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'getPjdsStoreIndexData').andCallThrough();
                pjdsClient.getOSyncClinicsBySite('SITE', _.noop);
            });
        });

        describe('#getOSyncClinicsByUid', function() {
            it('calls #getPjdsStoreData with uid', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(10);
                    expect(options['arguments'][0]).toEqual('osynclinic');
                    expect(options['arguments'][1]).toEqual('urn:va:clinic:SITE:10002');
                    expect(options['arguments'][2]).toEqual('');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual(false);
                    expect(options['arguments'][5]).toEqual('');
                    expect(options['arguments'][6]).toEqual(0);
                    expect(options['arguments'][7]).toEqual(999999);
                    expect(options['arguments'][8]).toEqual('');
                    expect(options['arguments'][9]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.getPjdsStoreData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'getPjdsStoreData').andCallThrough();
                pjdsClient.getOSyncClinicsByUid('urn:va:clinic:SITE:10002', _.noop);
            });
        });

        describe('#getAllOSyncClinics', function() {
            it('calls #getPjdsStoreData without uid', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(10);
                    expect(options['arguments'][0]).toEqual('osynclinic');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual('');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual(false);
                    expect(options['arguments'][5]).toEqual('');
                    expect(options['arguments'][6]).toEqual(0);
                    expect(options['arguments'][7]).toEqual(999999);
                    expect(options['arguments'][8]).toEqual('');
                    expect(options['arguments'][9]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.getPjdsStoreData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'getPjdsStoreData').andCallThrough();
                pjdsClient.getAllOSyncClinics(_.noop);
            });
        });

        describe('#createOSyncClinic', function() {
            it('calls #setPjdsStoreData without site and uid', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.createOSyncClinic(null, null, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No uid or site passed in'
                    }));
                    expect(pjdsClient.setPjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #setPjdsStoreData with site and without uid', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.createOSyncClinic('SITE', null, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No uid or site passed in'
                    }));
                    expect(pjdsClient.setPjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #setPjdsStoreData without site and with uid', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.createOSyncClinic(null, 'urn:va:clinic:SITE:10002', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No uid or site passed in'
                    }));
                    expect(pjdsClient.setPjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #setPjdsStoreData with site and uid', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('SET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('osynclinic');
                    expect(options['arguments'][1]).toEqual('urn:va:clinic:SITE:10002');
                    expect(options['arguments'][2]).toEqual(false);
                    expect(options['arguments'][3]).toEqual('1s4a817b-93ff-4e7f-8af4-0de4a2498329');
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.setPjdsStoreData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.createOSyncClinic('SITE', 'urn:va:clinic:SITE:10002', _.noop);
            });
        });

        describe('#deleteOSyncClinic', function() {
            it('calls #deletePjdsStoreData without uid', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'deletePjdsStoreData').andCallThrough();
                pjdsClient.deleteOSyncClinic(null, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No uid passed in'
                    }));
                    expect(pjdsClient.deletePjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #deletePjdsStoreData with uid', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('DEL^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('osynclinic');
                    expect(options['arguments'][1]).toEqual('urn:va:clinic:SITE:10002');
                    expect(options['arguments'][2]).toEqual(false);
                    expect(options['arguments'][3]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.deletePjdsStoreData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'deletePjdsStoreData').andCallThrough();
                pjdsClient.deleteOSyncClinic('urn:va:clinic:SITE:10002', _.noop);
            });
        });

        describe('#addToOsyncBlist', function() {
            it('calls #setPjdsStoreData without id, site, and list', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.addToOsyncBlist(null, null, null, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'Invalid list type'
                    }));
                    expect(pjdsClient.setPjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #setPjdsStoreData with id, and without site and list', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.addToOsyncBlist('SITE;1', null, null, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'Invalid list type'
                    }));
                    expect(pjdsClient.setPjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #setPjdsStoreData with id and site, and without list', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.addToOsyncBlist('SITE;1', 'SITE', null, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'Invalid list type'
                    }));
                    expect(pjdsClient.setPjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #setPjdsStoreData with id and list, and without site', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.addToOsyncBlist('SITE;1', null, 'patient', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'Invalid PID for site'
                    }));
                    expect(pjdsClient.setPjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #setPjdsStoreData with site and list, and without id', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.addToOsyncBlist(null, 'SITE', 'user', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No id passed in'
                    }));
                    expect(pjdsClient.setPjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #setPjdsStoreData with id, site, and list', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('SET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('osyncBlist');
                    expect(options['arguments'][1]).toEqual('urn:va:user:SITE:1');
                    expect(options['arguments'][2]).toEqual(false);
                    expect(options['arguments'][3]).toEqual('1s4a817b-93ff-4e7f-8af4-0de4a2498329');
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.setPjdsStoreData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.addToOsyncBlist('1', 'SITE', 'user', _.noop);
            });
        });

        describe('#removeFromOsyncBlist', function() {
            it('calls #deletePjdsStoreData without id, site, and list', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'deletePjdsStoreData').andCallThrough();
                pjdsClient.removeFromOsyncBlist(null, null, null, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'Invalid list type'
                    }));
                    expect(pjdsClient.deletePjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #deletePjdsStoreData with id, and without site and list', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'deletePjdsStoreData').andCallThrough();
                pjdsClient.removeFromOsyncBlist('SITE;1', null, null, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'Invalid list type'
                    }));
                    expect(pjdsClient.deletePjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #deletePjdsStoreData with id and site, and without list', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'deletePjdsStoreData').andCallThrough();
                pjdsClient.removeFromOsyncBlist('SITE;1', 'SITE', null, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'Invalid list type'
                    }));
                    expect(pjdsClient.deletePjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #deletePjdsStoreData with id and list, and without site', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'deletePjdsStoreData').andCallThrough();
                pjdsClient.removeFromOsyncBlist('SITE;1', null, 'patient', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'Invalid PID for site'
                    }));
                    expect(pjdsClient.deletePjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #deletePjdsStoreData with site and list, and without id', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'deletePjdsStoreData').andCallThrough();
                pjdsClient.removeFromOsyncBlist(null, 'SITE', 'user', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No id passed in'
                    }));
                    expect(pjdsClient.deletePjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #deletePjdsStoreData with id, site, and list', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('DEL^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('osyncBlist');
                    expect(options['arguments'][1]).toEqual('urn:va:user:SITE:1');
                    expect(options['arguments'][2]).toEqual(false);
                    expect(options['arguments'][3]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.deletePjdsStoreData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'deletePjdsStoreData').andCallThrough();
                pjdsClient.removeFromOsyncBlist('1', 'SITE', 'user', _.noop);
            });
        });

        describe('#getOsyncBlist', function() {
            it('calls #getPjdsStoreIndexData with site', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('INDEX^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(12);
                    expect(options['arguments'][0]).toEqual('osyncBlist');
                    expect(options['arguments'][1]).toEqual('osyncblist-patient');
                    expect(options['arguments'][2]).toEqual('');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual('');
                    expect(options['arguments'][5]).toEqual('');
                    expect(options['arguments'][6]).toEqual(false);
                    expect(options['arguments'][7]).toEqual('');
                    expect(options['arguments'][8]).toEqual(0);
                    expect(options['arguments'][9]).toEqual(999999);
                    expect(options['arguments'][10]).toEqual('');
                    expect(options['arguments'][11]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.getPjdsStoreIndexData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'getPjdsStoreIndexData').andCallThrough();
                pjdsClient.getOsyncBlist('patient', _.noop);
            });
        });

        describe('#getOsyncBlistByUid', function() {
            it('calls #getPjdsStoreData with site', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(10);
                    expect(options['arguments'][0]).toEqual('osyncBlist');
                    expect(options['arguments'][1]).toEqual('urn:va:user:SITE:1');
                    expect(options['arguments'][2]).toEqual('');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual(false);
                    expect(options['arguments'][5]).toEqual('');
                    expect(options['arguments'][6]).toEqual(0);
                    expect(options['arguments'][7]).toEqual(999999);
                    expect(options['arguments'][8]).toEqual('');
                    expect(options['arguments'][9]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.getPjdsStoreData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'getPjdsStoreData').andCallThrough();
                pjdsClient.getOsyncBlistByUid('urn:va:user:SITE:1', _.noop);
            });
        });

        describe('#createClinicalObject', function() {
            const data = {
                authorUid: 'urn:va:user:SITE:3',
                displayName: 'Rheumatology',
                domain: 'test-data',
                ehmpState: 'active'
            };

            it('calls #setPjdsStoreData without data', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.createClinicalObject(null, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No document passed in'
                    }));
                    expect(pjdsClient.setPjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #setPjdsStoreData with data', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('SET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('clinicobj');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual(false);
                    expect(options['arguments'][3]).toEqual('1s4a817b-93ff-4e7f-8af4-0de4a2498329');
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.setPjdsStoreData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.createClinicalObject(data, _.noop);
            });
        });

        describe('#updateClinicalObject', function() {
            const data = {
                authorUid: 'urn:va:user:SITE:3',
                displayName: 'Rheumatology',
                domain: 'test-data',
                ehmpState: 'active'
            };

            it('calls #setPjdsStoreData without uid or data', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.updateClinicalObject(null, null, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No document or uid passed in'
                    }));
                    expect(pjdsClient.setPjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #setPjdsStoreData without uid and with data', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.updateClinicalObject(null, data, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No document or uid passed in'
                    }));
                    expect(pjdsClient.setPjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #setPjdsStoreData with uid and without data', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.updateClinicalObject('urn:va:user:SITE:1', null, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No document or uid passed in'
                    }));
                    expect(pjdsClient.setPjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #setPjdsStoreData with uid and data', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('SET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('clinicobj');
                    expect(options['arguments'][1]).toEqual('urn:va:user:SITE:1');
                    expect(options['arguments'][2]).toEqual(false);
                    expect(options['arguments'][3]).toEqual('1s4a817b-93ff-4e7f-8af4-0de4a2498329');
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.setPjdsStoreData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.updateClinicalObject('urn:va:user:SITE:1', data, _.noop);
            });
        });

        describe('#deleteClinicalObject', function() {
            it('calls #deletePjdsStoreData without uid', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'deletePjdsStoreData').andCallThrough();
                pjdsClient.deleteClinicalObject(null, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No uid passed in'
                    }));
                    expect(pjdsClient.deletePjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #deletePjdsStoreData with uid', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('DEL^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('clinicobj');
                    expect(options['arguments'][1]).toEqual('urn:va:user:SITE:1');
                    expect(options['arguments'][2]).toEqual(false);
                    expect(options['arguments'][3]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.deletePjdsStoreData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'deletePjdsStoreData').andCallThrough();
                pjdsClient.deleteClinicalObject('urn:va:user:SITE:1', _.noop);
            });
        });

        describe('#getClinicalObject', function() {
            it('calls #getPjdsStoreData without filter', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'getPjdsStoreData').andCallThrough();
                pjdsClient.getClinicalObject(null, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No filter passed in'
                    }));
                    expect(pjdsClient.getPjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #getPjdsStoreData with filter', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(10);
                    expect(options['arguments'][0]).toEqual('clinicobj');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual('');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual(false);
                    expect(options['arguments'][5]).toEqual('eq(uid,urn:va:patient:SITE:10002)');
                    expect(options['arguments'][6]).toEqual(0);
                    expect(options['arguments'][7]).toEqual(999999);
                    expect(options['arguments'][8]).toEqual('');
                    expect(options['arguments'][9]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.getPjdsStoreData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'getPjdsStoreData').andCallThrough();
                pjdsClient.getClinicalObject('eq(uid,urn:va:patient:SITE:10002)', _.noop);
            });

            it('calls #getPjdsStoreIndexData with filter and index', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('INDEX^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(12);
                    expect(options['arguments'][0]).toEqual('clinicobj');
                    expect(options['arguments'][1]).toEqual('clinicobj_uid');
                    expect(options['arguments'][2]).toEqual('');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual('urn:va:patient:SITE');
                    expect(options['arguments'][5]).toEqual('');
                    expect(options['arguments'][6]).toEqual(false);
                    expect(options['arguments'][7]).toEqual('');
                    expect(options['arguments'][8]).toEqual(0);
                    expect(options['arguments'][9]).toEqual(999999);
                    expect(options['arguments'][10]).toEqual('');
                    expect(options['arguments'][11]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.getPjdsStoreIndexData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'getPjdsStoreIndexData').andCallThrough();
                pjdsClient.getClinicalObject('urn:va:patient:SITE', 'clinicobj_uid', _.noop);
            });
        });

        describe('#getPrefetchPatients', function() {
            it('calls #getPjdsStoreData without uid', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'getPjdsStoreData').andCallThrough();
                pjdsClient.getPrefetchPatients(null, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No filter passed in'
                    }));
                    expect(pjdsClient.getPjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #getPjdsStoreData with filter, and without template', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(10);
                    expect(options['arguments'][0]).toEqual('prefetch');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual('');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual(false);
                    expect(options['arguments'][5]).toEqual('eq(uid,urn:va:patient:SITE:10002)');
                    expect(options['arguments'][6]).toEqual(0);
                    expect(options['arguments'][7]).toEqual(999999);
                    expect(options['arguments'][8]).toEqual('');
                    expect(options['arguments'][9]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.getPjdsStoreData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'getPjdsStoreData').andCallThrough();
                pjdsClient.getPrefetchPatients('eq(uid,urn:va:patient:SITE:10002)', _.noop);
            });

            it('calls #getPjdsStoreData with filter, and with template', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(10);
                    expect(options['arguments'][0]).toEqual('prefetch');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual('minimal');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual(false);
                    expect(options['arguments'][5]).toEqual('eq(uid,urn:va:patient:SITE:10002)');
                    expect(options['arguments'][6]).toEqual(0);
                    expect(options['arguments'][7]).toEqual(999999);
                    expect(options['arguments'][8]).toEqual('');
                    expect(options['arguments'][9]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.getPjdsStoreData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'getPjdsStoreData').andCallThrough();
                pjdsClient.getPrefetchPatients('eq(uid,urn:va:patient:SITE:10002)', null, 'minimal',  _.noop);
            });

            it('calls #getPjdsStoreIndexData with filter and index, and without template', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('INDEX^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(12);
                    expect(options['arguments'][0]).toEqual('prefetch');
                    expect(options['arguments'][1]).toEqual('ehmp-patients');
                    expect(options['arguments'][2]).toEqual('minimal');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual('urn:va:patient:SITE');
                    expect(options['arguments'][5]).toEqual('');
                    expect(options['arguments'][6]).toEqual(false);
                    expect(options['arguments'][7]).toEqual('');
                    expect(options['arguments'][8]).toEqual(0);
                    expect(options['arguments'][9]).toEqual(999999);
                    expect(options['arguments'][10]).toEqual('');
                    expect(options['arguments'][11]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.getPjdsStoreIndexData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'getPjdsStoreIndexData').andCallThrough();
                pjdsClient.getPrefetchPatients('urn:va:patient:SITE', 'ehmp-patients', 'minimal', _.noop);
            });

            it('calls #getPjdsStoreIndexData with filter and index, and with template', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('INDEX^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(12);
                    expect(options['arguments'][0]).toEqual('prefetch');
                    expect(options['arguments'][1]).toEqual('ehmp-patients');
                    expect(options['arguments'][2]).toEqual('');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual('urn:va:patient:SITE');
                    expect(options['arguments'][5]).toEqual('');
                    expect(options['arguments'][6]).toEqual(false);
                    expect(options['arguments'][7]).toEqual('');
                    expect(options['arguments'][8]).toEqual(0);
                    expect(options['arguments'][9]).toEqual(999999);
                    expect(options['arguments'][10]).toEqual('');
                    expect(options['arguments'][11]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.getPjdsStoreIndexData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'getPjdsStoreIndexData').andCallThrough();
                pjdsClient.getPrefetchPatients('urn:va:patient:SITE', 'ehmp-patients', _.noop);
            });
        });

        describe('#updatePrefetchPatient', function() {
            const data = {
                uid: 'urn:va:patientList:SITE:3:3',
                pid: 'SITE;3',
                patientIdentifier: '3^PI^501^USVHA^P',
                isEhmpPatient: true,
                source: 'patientList',
                sourceDate: '20170111120000',
                facility: '501',
                clinic: 'Cancer Clinic'
            };

            it('calls #setPjdsStoreData without uid or data', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.updatePrefetchPatient(null, null, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No document or uid passed in'
                    }));
                    expect(pjdsClient.setPjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #setPjdsStoreData without uid and with data', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.updatePrefetchPatient(null, data, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No document or uid passed in'
                    }));
                    expect(pjdsClient.setPjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #setPjdsStoreData with uid and without data', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.updatePrefetchPatient('urn:va:user:SITE:1', null, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No document or uid passed in'
                    }));
                    expect(pjdsClient.setPjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #setPjdsStoreData with uid and data', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('SET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('prefetch');
                    expect(options['arguments'][1]).toEqual(data.uid);
                    expect(options['arguments'][2]).toEqual(true);
                    expect(options['arguments'][3]).toEqual('1s4a817b-93ff-4e7f-8af4-0de4a2498329');
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.setPjdsStoreData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'setPjdsStoreData').andCallThrough();
                pjdsClient.updatePrefetchPatient(data.uid, data, _.noop);
            });
        });

        describe('#removePrefetchPatient', function() {
            it('calls #deletePjdsStoreData without uid', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'deletePjdsStoreData').andCallThrough();
                pjdsClient.removePrefetchPatient(null, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No uid passed in'
                    }));
                    expect(pjdsClient.deletePjdsStoreData).not.toHaveBeenCalled();
                    done();
                });
            });

            it('calls #deletePjdsStoreData with uid', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('DEL^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('prefetch');
                    expect(options['arguments'][1]).toEqual('urn:va:patientList:SITE:3:3');
                    expect(options['arguments'][2]).toEqual(false);
                    expect(options['arguments'][3]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    expect(pjdsClient.deletePjdsStoreData).toHaveBeenCalled();
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                spyOn(pjdsClient, 'deletePjdsStoreData').andCallThrough();
                pjdsClient.removePrefetchPatient('urn:va:patientList:SITE:3:3', _.noop);
            });
        });

        // Generic Data Store APIs
        describe('#createPjdsStore', function() {
            it('returns an error if store name is empty', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                pjdsClient.createPjdsStore('', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No store name passed in'
                    }));
                    done();
                });
            });

            it('calls CREATEDB^VPRJGDSN with [store]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('CREATEDB^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(1);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const createStoreCallback = _.noop;
                pjdsClient.createPjdsStore('teststore', createStoreCallback);
            });

            it('calls CREATEDB^VPRJGDSN with [store], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('CREATEDB^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(1);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const createStoreCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                pjdsClient.createPjdsStore('teststore', createStoreCallback);
            });
        });

        describe('#clearPjdsStore', function() {
            it('returns an error if store name is empty', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                pjdsClient.clearPjdsStore('', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No store name passed in'
                    }));
                    done();
                });
            });

            it('calls CLR^VPRJGDSN with [store]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('CLR^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(1);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const clearStoreCallback = _.noop;
                pjdsClient.clearPjdsStore('teststore', clearStoreCallback);
            });

            it('calls CLR^VPRJGDSN with [store], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('CLR^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(1);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const clearStoreCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                pjdsClient.clearPjdsStore('teststore', clearStoreCallback);
            });
        });

        describe('#getPjdsStoreInfo', function() {
            it('returns an error if store name is empty', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                pjdsClient.getPjdsStoreInfo('', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No store name passed in'
                    }));
                    done();
                });
            });

            it('calls INFO^VPRJGDSN with [store]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('INFO^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(1);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const infoCallback = _.noop;
                pjdsClient.getPjdsStoreInfo('teststore', infoCallback);
            });

            it('calls INFO^VPRJGDSN with [store], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('INFO^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(1);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const infoCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                pjdsClient.getPjdsStoreInfo('teststore', infoCallback);
            });
        });

        describe('#getPjdsStoreData', function() {
            it('returns an error if store name is empty', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                pjdsClient.getPjdsStoreData('', 'urn:va:teststore:1', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No store name passed in'
                    }));
                    done();
                });
            });

            it('calls GET^VPRJGDSN with [store, uid] with default params', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(10);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('urn:va:teststore:1');
                    expect(options['arguments'][2]).toEqual('');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual(false);
                    expect(options['arguments'][5]).toEqual('');
                    expect(options['arguments'][6]).toEqual(0);
                    expect(options['arguments'][7]).toEqual(999999);
                    expect(options['arguments'][8]).toEqual('');
                    expect(options['arguments'][9]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const getStoreDataCallback = _.noop;
                pjdsClient.getPjdsStoreData('teststore', 'urn:va:teststore:1', getStoreDataCallback);
            });

            it('calls GET^VPRJGDSN with [store, uid, params]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(10);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('urn:va:teststore:1');
                    expect(options['arguments'][2]).toEqual('testtemplate');
                    expect(options['arguments'][3]).toEqual('asc ci');
                    expect(options['arguments'][4]).toEqual(true);
                    expect(options['arguments'][5]).toEqual('eq(authorUid,urn:va:user:SITE:3)');
                    expect(options['arguments'][6]).toEqual(5);
                    expect(options['arguments'][7]).toEqual(10);
                    expect(options['arguments'][8]).toEqual(2);
                    expect(options['arguments'][9]).toEqual(true);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const getStoreDataCallback = _.noop;
                const params = {
                    template: 'testtemplate',
                    order: 'asc ci',
                    skipLocked: true,
                    filter: 'eq(authorUid,urn:va:user:SITE:3)',
                    start: 5,
                    limit: 10,
                    startId: 2,
                    returnCounts: true
                };
                pjdsClient.getPjdsStoreData('teststore', 'urn:va:teststore:1', params, getStoreDataCallback);
            });

            it('calls GET^VPRJGDSN with [store, uid] with an empty uid to retrieve all data items', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(10);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual('');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual(false);
                    expect(options['arguments'][5]).toEqual('');
                    expect(options['arguments'][6]).toEqual(0);
                    expect(options['arguments'][7]).toEqual(999999);
                    expect(options['arguments'][8]).toEqual('');
                    expect(options['arguments'][9]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const getStoreDataCallback = _.noop;
                pjdsClient.getPjdsStoreData('teststore', '', getStoreDataCallback);
            });

            it('calls GET^VPRJGDSN with [store, uid, params] with an empty uid to retrieve all data items', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(10);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual('testtemplate');
                    expect(options['arguments'][3]).toEqual('asc ci');
                    expect(options['arguments'][4]).toEqual(true);
                    expect(options['arguments'][5]).toEqual('eq(authorUid,urn:va:user:SITE:3)');
                    expect(options['arguments'][6]).toEqual(5);
                    expect(options['arguments'][7]).toEqual(10);
                    expect(options['arguments'][8]).toEqual(2);
                    expect(options['arguments'][9]).toEqual(true);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const getStoreDataCallback = _.noop;
                const params = {
                    template: 'testtemplate',
                    order: 'asc ci',
                    skipLocked: true,
                    filter: 'eq(authorUid,urn:va:user:SITE:3)',
                    start: 5,
                    limit: 10,
                    startId: 2,
                    returnCounts: true
                };
                pjdsClient.getPjdsStoreData('teststore', '', params, getStoreDataCallback);
            });

            it('calls GET^VPRJGDSN with [pid, uid] with default params, and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(10);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('urn:va:teststore:1');
                    expect(options['arguments'][2]).toEqual('');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual(false);
                    expect(options['arguments'][5]).toEqual('');
                    expect(options['arguments'][6]).toEqual(0);
                    expect(options['arguments'][7]).toEqual(999999);
                    expect(options['arguments'][8]).toEqual('');
                    expect(options['arguments'][9]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const getStoreDataCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                pjdsClient.getPjdsStoreData('teststore', 'urn:va:teststore:1', getStoreDataCallback);
            });

            it('calls GET^VPRJGDSN with [store, uid, params], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(10);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('urn:va:teststore:1');
                    expect(options['arguments'][2]).toEqual('testtemplate');
                    expect(options['arguments'][3]).toEqual('asc ci');
                    expect(options['arguments'][4]).toEqual(true);
                    expect(options['arguments'][5]).toEqual('eq(authorUid,urn:va:user:SITE:3)');
                    expect(options['arguments'][6]).toEqual(5);
                    expect(options['arguments'][7]).toEqual(10);
                    expect(options['arguments'][8]).toEqual(2);
                    expect(options['arguments'][9]).toEqual(true);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const getStoreDataCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                const params = {
                    template: 'testtemplate',
                    order: 'asc ci',
                    skipLocked: true,
                    filter: 'eq(authorUid,urn:va:user:SITE:3)',
                    start: 5,
                    limit: 10,
                    startId: 2,
                    returnCounts: true
                };
                pjdsClient.getPjdsStoreData('teststore', 'urn:va:teststore:1', params, getStoreDataCallback);
            });

            it('calls GET^VPRJGDSN with [store, uid] with an empty uid to retrieve all data items, and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(10);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual('');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual(false);
                    expect(options['arguments'][5]).toEqual('');
                    expect(options['arguments'][6]).toEqual(0);
                    expect(options['arguments'][7]).toEqual(999999);
                    expect(options['arguments'][8]).toEqual('');
                    expect(options['arguments'][9]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const getStoreDataCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                pjdsClient.getPjdsStoreData('teststore', '', getStoreDataCallback);
            });

            it('calls GET^VPRJGDSN with [store, uid, params] with an empty uid to retrieve all data items, and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('GET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(10);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual('testtemplate');
                    expect(options['arguments'][3]).toEqual('asc ci');
                    expect(options['arguments'][4]).toEqual(true);
                    expect(options['arguments'][5]).toEqual('eq(authorUid,urn:va:user:SITE:3)');
                    expect(options['arguments'][6]).toEqual(5);
                    expect(options['arguments'][7]).toEqual(10);
                    expect(options['arguments'][8]).toEqual(2);
                    expect(options['arguments'][9]).toEqual(true);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const getStoreDataCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                const params = {
                    template: 'testtemplate',
                    order: 'asc ci',
                    skipLocked: true,
                    filter: 'eq(authorUid,urn:va:user:SITE:3)',
                    start: 5,
                    limit: 10,
                    startId: 2,
                    returnCounts: true
                };
                pjdsClient.getPjdsStoreData('teststore', '', params, getStoreDataCallback);
            });
        });

        describe('#setPjdsStoreData', function() {
            const data = {
                authorUid: 'urn:va:user:SITE:3',
                displayName: 'Rheumatology',
                domain: 'test-data',
                ehmpState: 'active'
            };

            const emptyData = '';
            const badData = 'authorUid:"urn:va:user:SITE:3",displayName:"Rheumatology",domain:"test-data",ehmpState:"active"';

            it('returns an error if store name is empty', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                pjdsClient.setPjdsStoreData('', 'urn:va:teststore:1', data, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No store name passed in'
                    }));
                    done();
                });
            });

            it('returns an error if data is empty', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                pjdsClient.setPjdsStoreData('teststore', 'urn:va:teststore:1', emptyData, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No data passed in'
                    }));
                    done();
                });
            });

            it('returns an error if data is not an object', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                pjdsClient.setPjdsStoreData('teststore', 'urn:va:teststore:1', badData, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'Data passed in not in correct format'
                    }));
                    done();
                });
            });

            it('calls SET^VPRJGDSN with [store, uid, data]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('SET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('urn:va:teststore:1');
                    expect(options['arguments'][2]).toEqual(false);
                    expect(options['arguments'][3]).toEqual('1s4a817b-93ff-4e7f-8af4-0de4a2498329');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const setStoreDataCallback = _.noop;
                pjdsClient.setPjdsStoreData('teststore', 'urn:va:teststore:1', data, setStoreDataCallback);
            });

            it('calls SET^VPRJGDSN with [store, uid, data, patch]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('SET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('urn:va:teststore:1');
                    expect(options['arguments'][2]).toEqual(true);
                    expect(options['arguments'][3]).toEqual('1s4a817b-93ff-4e7f-8af4-0de4a2498329');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const setStoreDataCallback = _.noop;
                pjdsClient.setPjdsStoreData('teststore', 'urn:va:teststore:1', data, true, setStoreDataCallback);
            });

            it('calls SET^VPRJGDSN with [store, uid, data] with an empty uid to have pJDS assign a uid', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('SET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual(false);
                    expect(options['arguments'][3]).toEqual('1s4a817b-93ff-4e7f-8af4-0de4a2498329');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const setStoreDataCallback = _.noop;
                pjdsClient.setPjdsStoreData('teststore', '', data, setStoreDataCallback);
            });

            it('calls SET^VPRJGDSN with [store, uid, data, patch] with an empty uid to have pJDS assign a uid', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('SET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual(true);
                    expect(options['arguments'][3]).toEqual('1s4a817b-93ff-4e7f-8af4-0de4a2498329');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const setStoreDataCallback = _.noop;
                pjdsClient.setPjdsStoreData('teststore', '', data, true, setStoreDataCallback);
            });

            it('calls SET^VPRJGDSN with [store, uid, data], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('SET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('urn:va:teststore:1');
                    expect(options['arguments'][2]).toEqual(false);
                    expect(options['arguments'][3]).toEqual('1s4a817b-93ff-4e7f-8af4-0de4a2498329');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const setStoreDataCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                pjdsClient.setPjdsStoreData('teststore', 'urn:va:teststore:1', data, setStoreDataCallback);
            });

            it('calls SET^VPRJGDSN with [store, uid, data, patch], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('SET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('urn:va:teststore:1');
                    expect(options['arguments'][2]).toEqual(true);
                    expect(options['arguments'][3]).toEqual('1s4a817b-93ff-4e7f-8af4-0de4a2498329');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const setStoreDataCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                pjdsClient.setPjdsStoreData('teststore', 'urn:va:teststore:1', data, true, setStoreDataCallback);
            });

            it('calls SET^VPRJGDSN with [store, uid, data] with an empty uid to have pJDS assign a uid, and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('SET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual(false);
                    expect(options['arguments'][3]).toEqual('1s4a817b-93ff-4e7f-8af4-0de4a2498329');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const setStoreDataCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                pjdsClient.setPjdsStoreData('teststore', '', data, setStoreDataCallback);
            });

            it('calls SET^VPRJGDSN with [store, uid, data, patch] with an empty uid to have pJDS assign a uid, and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('SET^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual(true);
                    expect(options['arguments'][3]).toEqual('1s4a817b-93ff-4e7f-8af4-0de4a2498329');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const setStoreDataCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                pjdsClient.setPjdsStoreData('teststore', '', data, true, setStoreDataCallback);
            });

        });

        describe('#deletePjdsStoreData', function() {
            it('returns an error if store name is empty', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                pjdsClient.deletePjdsStoreData('', 'urn:va:teststore:1', false, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No store name passed in'
                    }));
                    done();
                });
            });

            it('calls DEL^VPRJGDSN with [store, uid]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('DEL^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('urn:va:teststore:1');
                    expect(options['arguments'][2]).toEqual(false);
                    expect(options['arguments'][3]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const deleteStoreCallback = _.noop;
                pjdsClient.deletePjdsStoreData('teststore', 'urn:va:teststore:1', deleteStoreCallback);
            });

            it('calls DEL^VPRJGDSN with [store, uid, deleteAll, filter] with a filter', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('DEL^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('urn:va:teststore:1');
                    expect(options['arguments'][2]).toEqual(false);
                    expect(options['arguments'][3]).toEqual('eq(authorUid,urn:va:user:SITE:3)');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const deleteStoreCallback = _.noop;
                pjdsClient.deletePjdsStoreData('teststore', 'urn:va:teststore:1', false, 'eq(authorUid,urn:va:user:SITE:3)', deleteStoreCallback);
            });

            it('calls DEL^VPRJGDSN with [store, uid, deleteAll] with uid empty and deleteAll true', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('DEL^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual(true);
                    expect(options['arguments'][3]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const deleteStoreCallback = _.noop;
                pjdsClient.deletePjdsStoreData('teststore', '', true, deleteStoreCallback);
            });

            it('calls DEL^VPRJGDSN with [store, uid], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('DEL^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('urn:va:teststore:1');
                    expect(options['arguments'][2]).toEqual(false);
                    expect(options['arguments'][3]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const deleteStoreCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                pjdsClient.deletePjdsStoreData('teststore', 'urn:va:teststore:1', deleteStoreCallback);
            });

            it('calls DEL^VPRJGDSN with [store, uid, deleteAll, filter] with a filter, and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('DEL^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('urn:va:teststore:1');
                    expect(options['arguments'][2]).toEqual(false);
                    expect(options['arguments'][3]).toEqual('eq(authorUid,urn:va:user:SITE:3)');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const deleteStoreCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                pjdsClient.deletePjdsStoreData('teststore', 'urn:va:teststore:1', false, 'eq(authorUid,urn:va:user:SITE:3)', deleteStoreCallback);
            });

            it('calls DEL^VPRJGDSN with [store, uid, deleteAll] with uid empty and deleteAll true, and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('DEL^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(4);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('');
                    expect(options['arguments'][2]).toEqual(true);
                    expect(options['arguments'][3]).toEqual('');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const deleteStoreCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                pjdsClient.deletePjdsStoreData('teststore', '', true, deleteStoreCallback);
            });
        });

        describe('#createPjdsStoreIndex', function() {
            let indexData = {
                'indexName': 'testindex',
                'fields': 'authorUid',
                'sort': 'desc',
                'type': 'attr'
            };

            const emptyIndexData = '';
            const badIndexData = '"indexName":"testindex","fields":"authorUid","sort":"desc","type":"attr"';

            it('returns an error if store name is empty', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                pjdsClient.createPjdsStoreIndex('', indexData, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No store name passed in'
                    }));
                    done();
                });
            });

            it('returns an error if data is empty', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                pjdsClient.createPjdsStoreIndex('teststore', emptyIndexData, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No index data passed in'
                    }));
                    done();
                });
            });

            it('returns an error if data is not an object', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                pjdsClient.createPjdsStoreIndex('teststore', badIndexData, function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'Data passed in not in correct format'
                    }));
                    done();
                });
            });

            it('calls CINDEX^VPRJGDSN with [store, data]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('CINDEX^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(2);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('1s4a817b-93ff-4e7f-8af4-0de4a2498329');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const createIndexCallback = _.noop;
                pjdsClient.createPjdsStoreIndex('teststore', indexData, createIndexCallback);
            });

            it('calls CINDEX^VPRJGDSN with [store, data], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('CINDEX^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(2);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('1s4a817b-93ff-4e7f-8af4-0de4a2498329');
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const createIndexCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                pjdsClient.createPjdsStoreIndex('teststore', indexData, createIndexCallback);
            });
        });

        describe('#getPjdsStoreIndexData', function() {
            it('returns an error if store name is empty', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                pjdsClient.getPjdsStoreIndexData('', 'testindex', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No store name passed in'
                    }));
                    done();
                });
            });

            it('returns an error if index name is empty', function(done) {
                stubCacheConnector();
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                pjdsClient.getPjdsStoreIndexData('teststore', '', function(error) {
                    expect(error).toEqual(jasmine.objectContaining({
                        type: 'fatal-exception',
                        message: 'No index name passed in'
                    }));
                    done();
                });
            });

            it('calls INDEX^VPRJGDSN with [store, index] with default params', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('INDEX^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(12);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('testindex');
                    expect(options['arguments'][2]).toEqual('');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual('');
                    expect(options['arguments'][5]).toEqual('');
                    expect(options['arguments'][6]).toEqual(false);
                    expect(options['arguments'][7]).toEqual('');
                    expect(options['arguments'][8]).toEqual(0);
                    expect(options['arguments'][9]).toEqual(999999);
                    expect(options['arguments'][10]).toEqual('');
                    expect(options['arguments'][11]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const getIndexDataCallback = _.noop;
                pjdsClient.getPjdsStoreIndexData('teststore', 'testindex', getIndexDataCallback);
            });

            it('calls INDEX^VPRJGDSN with [store, index, params]', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('INDEX^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(12);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('testindex');
                    expect(options['arguments'][2]).toEqual('testtemplate');
                    expect(options['arguments'][3]).toEqual('desc cs');
                    expect(options['arguments'][4]).toEqual('urn:va:user:SITE:3');
                    expect(options['arguments'][5]).toEqual(3);
                    expect(options['arguments'][6]).toEqual(true);
                    expect(options['arguments'][7]).toEqual('eq(authorUid,urn:va:user:SITE:3)');
                    expect(options['arguments'][8]).toEqual(5);
                    expect(options['arguments'][9]).toEqual(10);
                    expect(options['arguments'][10]).toEqual(2);
                    expect(options['arguments'][11]).toEqual(true);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const getIndexDataCallback = _.noop;
                const params = {
                    template: 'testtemplate',
                    order: 'desc cs',
                    range: 'urn:va:user:SITE:3',
                    bail: 3,
                    skipLocked: true,
                    filter: 'eq(authorUid,urn:va:user:SITE:3)',
                    start: 5,
                    limit: 10,
                    startId: 2,
                    returnCounts: true
                };
                pjdsClient.getPjdsStoreIndexData('teststore', 'testindex', params, getIndexDataCallback);
            });

            it('calls INDEX^VPRJGDSN with [pid, index] with default params, and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('INDEX^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(12);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('testindex');
                    expect(options['arguments'][2]).toEqual('');
                    expect(options['arguments'][3]).toEqual('');
                    expect(options['arguments'][4]).toEqual('');
                    expect(options['arguments'][5]).toEqual('');
                    expect(options['arguments'][6]).toEqual(false);
                    expect(options['arguments'][7]).toEqual('');
                    expect(options['arguments'][8]).toEqual(0);
                    expect(options['arguments'][9]).toEqual(999999);
                    expect(options['arguments'][10]).toEqual('');
                    expect(options['arguments'][11]).toEqual(false);
                    expect(callback).toEqual(jasmine.any(Function));
                    return callback('error', {ErrorMessage: 'bail from retrieveQueryResult'});
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const getIndexDataCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                pjdsClient.getPjdsStoreIndexData('teststore', 'testindex', getIndexDataCallback);
            });

            it('calls INDEX^VPRJGDSN with [store, index, params], and calls retrieveQueryResult', function(done) {
                const stubbedCache = stubCacheConnector();
                stubbedCache.function = function(options, callback) {
                    expect(options.function).toEqual('INDEX^VPRJGDSN');
                    expect(options['arguments'].length).toEqual(12);
                    expect(options['arguments'][0]).toEqual('teststore');
                    expect(options['arguments'][1]).toEqual('testindex');
                    expect(options['arguments'][2]).toEqual('testtemplate');
                    expect(options['arguments'][3]).toEqual('desc cs');
                    expect(options['arguments'][4]).toEqual('urn:va:user:SITE:3');
                    expect(options['arguments'][5]).toEqual(3);
                    expect(options['arguments'][6]).toEqual(true);
                    expect(options['arguments'][7]).toEqual('eq(authorUid,urn:va:user:SITE:3)');
                    expect(options['arguments'][8]).toEqual(5);
                    expect(options['arguments'][9]).toEqual(10);
                    expect(options['arguments'][10]).toEqual(2);
                    expect(options['arguments'][11]).toEqual(true);
                    expect(callback).toEqual(jasmine.any(Function));
                    done();
                };
                const pjdsClient = new PjdsClient(logger, logger, pjdsClientConfig);
                const getIndexDataCallback = function(error) {
                    expect(error).toEqual({
                        type: 'transient-exception',
                        message: 'bail from retrieveQueryResult'
                    });
                    done();
                };
                const params = {
                    template: 'testtemplate',
                    order: 'desc cs',
                    range: 'urn:va:user:SITE:3',
                    bail: 3,
                    skipLocked: true,
                    filter: 'eq(authorUid,urn:va:user:SITE:3)',
                    start: 5,
                    limit: 10,
                    startId: 2,
                    returnCounts: true
                };
                pjdsClient.getPjdsStoreIndexData('teststore', 'testindex', params, getIndexDataCallback);
            });
        });
    });
});
