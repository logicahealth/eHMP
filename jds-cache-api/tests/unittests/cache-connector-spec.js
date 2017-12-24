'use strict';

const _ = require('lodash');
const cache = require('cache');
const CacheConnector = require('../../src/cache-connector');

describe('cache-connector', function() {

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

    describe('CacheConector', function() {
        it('has connect and disconnect methods', function() {
            const cacheConnector = new CacheConnector();
            expect(_.isFunction(cacheConnector.connect)).toBeTruthy();
            expect(_.isFunction(cacheConnector.disconnect)).toBeTruthy();
        });
        it('exposes the cache.Cache methods', function() {
            const cacheConnector = new CacheConnector();
            _.each(cacheMethods, function(method) {
                expect(_.isFunction(cacheConnector[method])).toBeTruthy();
            });
        });

        describe('#connect', function() {
            it('uses the supplied config', function() {
                const jdsClientConfig = {
                    username: 'Zm9v',
                    password: 'YmFy',
                    myCustomConfig: true
                };
                const fakeCache = jasmine.createSpyObj('fakeCache', cacheMethods);
                fakeCache.open = function(params) {
                    expect(params.myCustomConfig).toEqual(true);
                    return {
                        ok: true
                    };
                };
                spyOn(cache, 'Cache').andReturn(fakeCache);
                const cacheConnector = new CacheConnector();
                cacheConnector.connect(jdsClientConfig);
            });
            it('clears the cache_pid if the connection was not ok', function() {
                const jdsClientConfig = {
                    username: 'Zm9v',
                    password: 'YmFy',
                    myCustomConfig: true
                };
                let responseNumber = 1;
                const fakeCache = jasmine.createSpyObj('fakeCache', cacheMethods);
                fakeCache.open = function(params) {
                    expect(params.myCustomConfig).toEqual(true);
                    if (responseNumber === 1) {
                        responseNumber++;
                        return {
                            ok: true,
                            cache_pid: 1234  // eslint-disable-line camelcase
                        };
                    }
                    return {
                        ok: false
                    };
                };
                spyOn(cache, 'Cache').andReturn(fakeCache);
                const cacheConnector = new CacheConnector();
                const resultOk = cacheConnector.connect(jdsClientConfig);
                expect(resultOk.ok).toEqual(true);
                expect(resultOk.cache_pid).toEqual(1234);
                expect(cacheConnector.cache_pid).toEqual(1234);
                const resultBad = cacheConnector.connect(jdsClientConfig);
                expect(resultBad.ok).toEqual(false);
                expect(resultBad.cache_pid).toEqual(null);
                expect(cacheConnector.cache_pid).toEqual(null);
            });
        });
        describe('#disconnect', function() {
            it('sets cache_pid to null', function() {
                const config = {
                    username: 'Zm9v',
                    password: 'YmFy',
                    myCustomConfig: true
                };
                const fakeCache = jasmine.createSpyObj('fakeCache', cacheMethods);
                spyOn(cache, 'Cache').andReturn(fakeCache);
                const cacheConnector = new CacheConnector();
                cacheConnector.cache_pid = 1234; // eslint-disable-line camelcase
                cacheConnector.disconnect(config);
                expect(cacheConnector.cache_pid).toEqual(null);
                expect(fakeCache.close).toHaveBeenCalled();
            });
        });
    });
});
