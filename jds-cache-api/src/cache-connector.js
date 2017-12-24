'use strict';

/*
 * Author: David Wicksell
 */

const _ = require('lodash');
const cache = require('cache');

const memberMap = new WeakMap();

/*
There is almost certainly a slicker way to do this with Proxy
and Reflect, but by making the delegation code explict, we can
document each method.

Additionally, each of those methods should actually pass the
specific parameters rather than the exploded ...params
*/

/**
 * @typedef {object} CacheConnectorConfig
 *
 * @property {string} ip_address
 * @property {number} tcp_port
 * @property {string} username Base64-encoded username. echo -n username | base64
 * @property {string} password Base64-encoded password. echo -n password | base64
 * @property {string} namespace Namespace. Example: "JSONVPR"
 */

/**
 * CacheConnector wraps the Cache API for internal use within this node module
 * and adds connection methods.
 */
class CacheConnector {
    constructor() {
        if (typeof new.target === 'undefined') {
            return new CacheConnector();
        }

        // memberMap is used to create private scope for methods without
        // creating new instances of functions. We want to hide cache
        // to prevent consumers from accidentally destroying data.
        memberMap.set(this, {
            cache: new cache.Cache()
        });
    }

    /**
     * Connect to a Cache instance using the cache.node Node.js database driver
     * @param {CacheConnectorConfig} config The configuration object that has connection parameters
     * @return {object} The result of Cache.open
     */
    connect(config) {
        const cacheOptions = _.clone(config);
        cacheOptions.username = cacheOptions.username || '';
        cacheOptions.password = cacheOptions.password || '';

        cacheOptions.username = Buffer.from(cacheOptions.username, 'base64').toString();
        cacheOptions.password = Buffer.from(cacheOptions.password, 'base64').toString();

        const result = memberMap.get(this).cache.open(cacheOptions);

        if (result.ok) {
            this.cache_pid = result.cache_pid || this.cache_pid; // eslint-disable-line camelcase
        } else {
            this.cache_pid = null; // eslint-disable-line camelcase
        }

        return result;
    }

    disconnect() {
        this.cache_pid = null; // eslint-disable-line camelcase

        return memberMap.get(this).cache.close();
    }

    open(...params) {
        return memberMap.get(this).cache.open(...params);
    }

    close(...params) {
        return memberMap.get(this).cache.close(...params);
    }

    version(...params) {
        return memberMap.get(this).cache.version(...params);
    }

    //noinspection ReservedWordAsName
    function(...params) {
        return memberMap.get(this).cache.function(...params);
    }

    get(...params) {
        return memberMap.get(this).cache.get(...params);
    }

    set(...params) {
        return memberMap.get(this).cache.set(...params);
    }

    kill(...params) {
        return memberMap.get(this).cache.kill(...params);
    }

    data(...params) {
        return memberMap.get(this).cache.data(...params);
    }

    global_directory(...params) { // eslint-disable-line camelcase
        return memberMap.get(this).cache.global_directory(...params);
    }

    increment(...params) {
        return memberMap.get(this).cache.increment(...params);
    }

    lock(...params) {
        return memberMap.get(this).cache.lock(...params);
    }

    unlock(...params) {
        return memberMap.get(this).cache.unlock(...params);
    }

    merge(...params) {
        return memberMap.get(this).cache.merge(...params);
    }

    order(...params) {
        return memberMap.get(this).cache.order(...params);
    }

    next(...params) {
        return memberMap.get(this).cache.next(...params);
    }

    next_node(...params) { // eslint-disable-line camelcase
        return memberMap.get(this).cache.next_node(...params);
    }

    previous(...params) {
        return memberMap.get(this).cache.previous(...params);
    }

    previous_node(...params) { // eslint-disable-line camelcase
        return memberMap.get(this).cache.previous_node(...params);
    }

    retrieve(...params) {
        return memberMap.get(this).cache.retrieve(...params);
    }

    update(...params) {
        return memberMap.get(this).cache.update(...params);
    }
}


module.exports = CacheConnector;
