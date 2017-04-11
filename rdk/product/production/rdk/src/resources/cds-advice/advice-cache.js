'use strict';

var _ = require('lodash');

function createKey(pid, use) {
    return 'cds-advice' + pid + use;
}

function _get(session, pid, use) {
    var key = createKey(pid, use);
    var adviceCache = getCache(session);

    return _.isEmpty(adviceCache[key]) ? null : adviceCache[key];
}

function getCache(session) {
    if (!_.isObject(session)) {
        throw new Error('Called advice-cache without a session object.');
    }
    if (_.isEmpty(session.CDSAdviceCache)) {
        session.CDSAdviceCache = {};
    }
    return session.CDSAdviceCache;
}

module.exports = {
    /**
     * Retrieves the cached advice.
     *
     * We cache advice by session because we want the
     * performance gains of not generating advice more
     * than needed on a session, but we want to generate
     * advice at least once per session.
     *
     * @param {object} session Session object
     * @param {string} pid Patient Id
     * @param {string} use Rules execution intent
     */
    get: function(session, pid, use) {
        var cached = _get(session, pid, use);
        return cached ? {
            data: cached.value,
            readStatus: cached.readStatus
        } : null;
    },
    /**
     * Sets advice results to cache.
     *
     * We cache advice by session because we want the
     * performance gains of not generating advice more
     * than needed on a session, but we want to generate
     * advice at least once per session.
     *
     * @param {object} session Session object
     * @param {string} pid Patient Id
     * @param {string} use Rules execution intent
     * @param {array} adviceList List of advice to cache
     * @param {string} readStatus Read status filter applied to adviceList. Provides context for cached data.
     */
    set: function(session, pid, use, adviceList, readStatus) {
        var adviceCache = getCache(session);
        var cacheObj = {
            value: adviceList,
            readStatus: readStatus,
            hash: {}
        };
        if (adviceList.constructor === Array && adviceList.length > 0) {
            for (var i = 0; i < adviceList.length; i++) {
                var advice = adviceList[i];
                if (advice && advice.id) {
                    cacheObj.hash[advice.id] = advice;
                }
            }
        }
        adviceCache[createKey(pid, use)] = cacheObj;
    },
    /**
     * Retrieves an advice from the cached advice list.
     *
     * @param {object} session Session object
     * @param {string} pid Patient Id
     * @param {string} use Rules execution intent
     */
    getCachedAdvice: function(session, pid, use, id) {
        var cached = _get(session, pid, use);
        return cached ? cached.hash[id] : null;
    }
};
