/*!
  backbone.fetch-cache v1.4.1
  by Andy Appleton - https://github.com/mrappleton/backbone-fetch-cache.git
 */

// AMD wrapper from https://github.com/umdjs/umd/blob/master/amdWebGlobal.js

// FIXME the node phantomjs library used in this project does not work with bind() which is required for jdsFilter.
// https://github.com/ariya/phantomjs/issues/10522
// https://github.com/Medium/phantomjs/issues/288

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module and set browser global
    define(['underscore', 'backbone', 'jquery', 'jds-filter', 'queryString'], function (_, Backbone, $, jdsFilter, queryString) {
      return (root.Backbone = factory(_, Backbone, $, jdsFilter, queryString));
    });
  } else if (typeof exports !== 'undefined' && typeof require !== 'undefined') {
    module.exports = factory(require('underscore'), require('backbone'), require('jquery'), require('jds-filter'), require('queryString'));
  } else {
    // Browser globals
    root.Backbone = factory(root._, root.Backbone, root.jQuery, root.jdsFilter, root.queryString);
  }
}(this, function (_, Backbone, $, jdsFilter, queryString) {
  'use strict';
  // Setup
  var superMethods = {
    modelFetch: Backbone.Model.prototype.fetch,
    modelSync: Backbone.Model.prototype.sync,
    collectionFetch: Backbone.Collection.prototype.fetch
  },
  supportLocalStorage = (function() {
    var supported = typeof window.localStorage !== 'undefined';
    if (supported) {
      try {
        // impossible to write on some platforms when private browsing is on and
        // throws an exception = local storage not supported.
        localStorage.setItem('test_support', 'test_support');
        localStorage.removeItem('test_support');
      } catch (e) {
        supported = false;
      }
    }
    return supported;
  })();

  var dateFilterFields = [
    'entered',
    'dateTime',
    'referenceDateTime',
    'observed'
  ];
  var upperBoundOperators = [
    'lt',
    'lte'
  ];
  var lowerBoundOperators = [
    'gt',
    'gte'
  ];

  Backbone.fetchCache = (Backbone.fetchCache || {});
  Backbone.fetchCache._cache = (Backbone.fetchCache._cache || {});
  // Global flag to enable/disable caching
  Backbone.fetchCache.enabled = true;

  Backbone.fetchCache.priorityFn = function(a, b) {
    if (!a || !a.expires || !b || !b.expires) {
      return a;
    }

    return a.expires - b.expires;
  };

  Backbone.fetchCache._prioritize = function() {
    var sorted = _.values(this._cache).sort(this.priorityFn);
    var index = _.indexOf(_.values(this._cache), sorted[0]);
    return _.keys(this._cache)[index];
  };

  Backbone.fetchCache._deleteCacheWithPriority = function() {
    Backbone.fetchCache._cache[this._prioritize()] = null;
    delete Backbone.fetchCache._cache[this._prioritize()];
    Backbone.fetchCache.setLocalStorage();
  };

  Backbone.fetchCache.getLocalStorageKey = function() {
    return 'backboneCache';
  };

  if (typeof Backbone.fetchCache.localStorage === 'undefined') {
    Backbone.fetchCache.localStorage = true;
  }

  function splitQueryParametersFromUrl(url) {
    var urlParts = url.split('?');
    var baseUrl = urlParts[0];
    var urlQueryString = urlParts.slice(1).join('?');
    return {
      base: baseUrl,
      query: urlQueryString
    };
  }

  // Shared methods
  function getCacheKey(key, opts) {
    var cacheKey;
    if (key && _.isObject(key)) {
      // If the model has its own, custom, cache key function, use it.
      if (_.isFunction(key.getCacheKey)) {
        return key.getCacheKey(opts);
      }
    } else if (_.isFunction(key)) {
      return key(opts);
    }
    // else, use the URL
    if (opts && opts.url) {
      cacheKey = opts.url;
    } else {
      cacheKey = _.isFunction(key.url) ? key.url() : key.url;
    }
    if (opts && opts.data) {
      if(typeof opts.data === 'string') {
        cacheKey += '?' + opts.data;
      } else {
        cacheKey += '?' + $.param(opts.data);
      }
    }
    cacheKey = attemptCreateDateRangeFilterKey(cacheKey);
    return cacheKey;
  }

  function attemptCreateDateRangeFilterKey(cacheKey) {
    var urlParts = splitQueryParametersFromUrl(cacheKey);
    var urlQueryString = urlParts.query;
    var baseUrl = urlParts.base;
    var query = queryString.parse(urlQueryString);
    var filter = query.filter;
    var filterObj;
    if (filter) {
      filterObj = jdsFilter.parse(filter);
    }
    if (filterObj) {
      var filterParts = extractDateRangeFilters(filterObj);
      if (filterParts.mainFilter.length) {
        query.filter = jdsFilter.build(filterParts.mainFilter);
      }
      var queryStr = queryString.stringify(query);
      cacheKey = _.extend({
        url: baseUrl + '?' + queryStr,
        baseUrl: baseUrl,
        query: query,
        isDateRangeFilterKey: true
      }, filterParts);
    }
    return cacheKey;
  }

  function extractDateRangeFilters(filterObj) {
    var groupOperators = ['and', 'or', 'not'];
    var mainFilter = [];
    var dateFilter = [];
    var dateRange = {
      from: -Infinity,
      to: Infinity
    };
    _.each(filterObj, function(filterFunction) {
      var operator = filterFunction[0];
      var args = filterFunction.slice(1);
      var isGroupOperator = _.contains(groupOperators, operator);
      if (isGroupOperator) {
        var filters = extractDateRangeFilters(args);
        if (filters.dateFilter.length) {
          filters.dateFilter.unshift(operator);
          dateFilter.push(filters.dateFilter);
          dateRange = filters.dateRange;
        }
        if (filters.mainFilter.length) {
          filters.mainFilter.unshift(operator);
          mainFilter.push(filters.mainFilter);
        }
      } else {
        var expressionDateRange = getDateRange(operator, args);
        var isDateRangeUnlimited = (
        expressionDateRange.from === -Infinity &&
        expressionDateRange.to === Infinity);
        if (isDateRangeUnlimited) {
          mainFilter.push(filterFunction);
        } else {
          dateFilter.push(filterFunction);
          dateRange = expressionDateRange;
        }
      }
    });
    return {
      mainFilter: mainFilter,
      dateFilter: dateFilter,
      dateRange: dateRange
    };
  }

  function getDateRange(operator, args) {
    args = _.map(args, function unescape(arg) {
      if (_.isArray(arg)) {
        return arg.map(unescape);
        // return _.map(unescape, arg);
      }
      return jdsFilter.mStringUnescape(jdsFilter.mStringEnsureEscaped(arg));
    });
    var noRange = {
      from: -Infinity,
      to: Infinity
    };
    if (!_.contains(dateFilterFields, args[0])) {
      return noRange;
    }
    // YYYY required, MM optional, DD optional, xxx optional
    var dateRegex = /^\d{4}\d{2}?\d{2}?\d*$/;
    if (!dateRegex.test(args[1])) {
      return noRange;
    }
    if (_.contains(upperBoundOperators, operator)) {
      return {
        from: -Infinity,
        to: args[1]
      };
    }
    if (_.contains(lowerBoundOperators, operator)) {
      return {
        from: args[1],
        to: Infinity
      };
    }
    if (operator === 'between' && dateRegex.test(args[2])) {
      return {
        from: args[1],
        to: args[2]
      };
    }
    return noRange;
  }

  function mergeJdsItems(left, right) {
    return _.uniq(_.union(left, right), false, function(item) {
      return item.uid;
    });
  }

  function setCache(instance, opts, attrs) {
    opts = (opts || {});
    var key = Backbone.fetchCache.getCacheKey(instance, opts),
        expires = false,
        lastSync = (opts.lastSync || (new Date()).getTime()),
        prefillExpires = false;

    // Need url to use as cache key so return if we can't get it
    if (!key) { return; }

    // Never set the cache if user has explicitly said not to
    if (opts.cache === false) { return; }

    // Don't set the cache unless cache: true or prefill: true option is passed
    if (!(opts.cache || opts.prefill)) { return; }

    if (opts.expires !== false) {
      expires = (new Date()).getTime() + ((opts.expires || 5 * 60) * 1000);
    }

    if (opts.prefillExpires !== false) {
      prefillExpires = (new Date()).getTime() + ((opts.prefillExpires || 5 * 60) * 1000);
    }

    var dateRange = {
      from: -Infinity,
      to: Infinity
    };
    var dateRangeInfo = key;
    if(key.isDateRangeFilterKey) {
      dateRange = key.dateRange;
      key = key.url;  // key.url does not have the date range filter.
    }
    var cache = Backbone.fetchCache._cache[key];
    var isDateRangeFilterCache = dateRangeInfo.isDateRangeFilterKey;
    if(isDateRangeFilterCache && cache) {
      dateRange = getMergedDateRange(dateRange, cache.dateRange);

      if(attrs.error) {
        expires = 0;
      } else {
        var cacheItems = (cache.value.data || {}).items || [];
        if(!attrs.data) {
          attrs.data = {};
        }
        var attrData = attrs.data;
        var attrItems = attrData.items || [];
        var newItems = mergeJdsItems(cacheItems, attrItems);
        attrData.items = newItems;

      }
    }
    Backbone.fetchCache._cache[key] = {
      expires: expires,
      lastSync : lastSync,
      prefillExpires: prefillExpires,
      isDateRangeFilterCache: isDateRangeFilterCache,
      dateRange: dateRange,
      value: attrs
    };

    Backbone.fetchCache.setLocalStorage();
  }

  function getCache(key, opts) {
    if (_.isFunction(key)) {
      key = key();
    } else if(key && key.isDateRangeFilterKey) {
      var cacheInfo = key;
      key = cacheInfo.url;

    } else if (key && _.isObject(key)) {
      key = getCacheKey(key, opts);
    }

    return Backbone.fetchCache._cache[key];
  }

  function getLastSync(key, opts) {
    return getCache(key).lastSync;
  }

  function clearItem(key, opts) {
    if (_.isFunction(key)) {
      key = key();
    } else if (key && _.isObject(key)) {
      key = getCacheKey(key, opts);
    }
    delete Backbone.fetchCache._cache[key];
    Backbone.fetchCache.setLocalStorage();
  }

  function reset() {
    // Clearing all cache items
    Backbone.fetchCache._cache = {};
  }

  function setLocalStorage() {
    if (!supportLocalStorage || !Backbone.fetchCache.localStorage) { return; }
    try {
      localStorage.setItem(Backbone.fetchCache.getLocalStorageKey(), JSON.stringify(Backbone.fetchCache._cache));
    } catch (err) {
      var code = err.code || err.number || err.message;
      if (code === 22 || code === 1014) {
        this._deleteCacheWithPriority();
      } else {
        throw(err);
      }
    }
  }

  function getLocalStorage() {
    if (!supportLocalStorage || !Backbone.fetchCache.localStorage) { return; }
    var json = localStorage.getItem(Backbone.fetchCache.getLocalStorageKey()) || '{}';
    Backbone.fetchCache._cache = JSON.parse(json);
  }

  function nextTick(fn) {
    return window.setTimeout(fn, 0);
  }

  function isLeftBoundInside(requestedFrom, cachedFrom) {
    return (
      (cachedFrom === -Infinity) ||
      (requestedFrom !== -Infinity && requestedFrom >= cachedFrom )
    );
  }

  function isRightBoundInside(requestedTo, cachedTo) {
    return (
      (cachedTo === Infinity) ||
      (requestedTo !== Infinity && requestedTo <= cachedTo)
    );
  }

  function isDateRangeRequestCached(requestedDateRange, cachedDateRange) {
    return (
      isLeftBoundInside(requestedDateRange.from, cachedDateRange.from) &&
      isRightBoundInside(requestedDateRange.to, cachedDateRange.to)
    );
  }

  function getMergedDateRange(requestedDateRange, cachedDateRange) {
    var dateRange = _.clone(cachedDateRange);
    if(!isLeftBoundInside(requestedDateRange.from, cachedDateRange.from)) {
      dateRange.from = requestedDateRange.from;
    }
    if(!isRightBoundInside(requestedDateRange.to, cachedDateRange.to)) {
      dateRange.to = requestedDateRange.to;
    }
    return dateRange;
  }

  function updateDateFilter(dateFilter, dateRange) {
    var newFilter = [];
    for(var i=0; i < dateFilter.length; i++) {
      if(_.isArray(dateFilter[i])) {
        newFilter.push(updateDateFilter(dateFilter[i], dateRange));
      } else {
        if(_.contains(dateFilterFields, dateFilter[i + 1])) {
          if(_.contains(lowerBoundOperators, dateFilter[i]) && dateFilter[i + 2]) {
            newFilter.push(dateFilter[i]);
            newFilter.push(dateFilter[i + 1]);
            newFilter.push(dateRange.from);
            i += 2;
            continue;
          }
          if(_.contains(upperBoundOperators, dateFilter[i]) && dateFilter[i + 2]) {
            newFilter.push(dateFilter[i]);
            newFilter.push(dateFilter[i + 1]);
            newFilter.push(dateRange.to);
            i += 2;
            continue;
          }
          if(dateFilter[i] === 'between' && dateFilter[i + 2] && dateFilter[i + 3]) {
            newFilter.push(dateFilter[i]);
            newFilter.push(dateFilter[i + 1]);
            newFilter.push(dateRange.from);
            newFilter.push(dateRange.to);
            i += 3;
            continue;
          }
        }
        newFilter.push(dateFilter[i]);
      }
    }
    return newFilter;
  }

  function endsWith(string, substring) {
    return string.indexOf(substring) === string.length - substring.length;
  }

  function applyFilters(attributes, filters, order, start, limit) {
    if(!(attributes && attributes.data && attributes.data.items)) {
      return attributes;
    }
    var items = _.clone(attributes.data.items);
    items = jdsFilter.applyFilters(filters, items);
    start = start || 0;
    limit = limit || 0;
    var sort = /^(\w+) (ASC|DESC)$/;
    var sortable = sort.test(order) && order.match(sort);
    if(sortable) {
      items = _.sortBy(items);
      if(sortable[2] === 'DESC') {
        items = items.reverse();
      }
    }
    if(start) {
      items = items.slice(start);
    }
    if(limit > 0) {
      items = items.slice(0, limit);
    }

    var newAttributes = {};
    newAttributes.data = {};
    newAttributes.data.items = items;

    return newAttributes;
  }

  function fetch(superFetch, attributesSetter) {
    return function(opts) {
      // Bypass caching if it's not enabled
      if(!Backbone.fetchCache.enabled) {
        return superFetch.apply(this, arguments);
      }

      opts = _.defaults(opts || {}, { parse: true });
      var key = Backbone.fetchCache.getCacheKey(this, opts),
        data = getCache(key),
        expired = false,
        prefillExpired = false,
        attributes = false,
        deferred = new $.Deferred(),
        success = opts.success,
        self = this;

      function isPrefilling() {
        return opts.prefill && (!opts.prefillExpires || prefillExpired);
      }

      function setData(triggerSync) {
        attributes = attributesSetter(self, opts, attributes);
        // TODO: need to filter attributes here
        if(data.isDateRangeFilterCache) {
          attributes = applyFilters(attributes, key.dateFilter);
        }

        // Trigger sync events
        self.trigger('cachesync', self, attributes, opts);
        if(triggerSync) {
          self.trigger('sync', self, attributes, opts);
        }

        // Notify progress if we're still waiting for an AJAX call to happen...
        if (isPrefilling()) { deferred.notify(self); }
        // ...finish and return if we're not
        else {
          opts.success = success;
          if (_.isFunction(opts.success)) { opts.success(self, attributes, opts); }
          deferred.resolve(self);
        }
      }

      var newFetchNeeded;
      if (data) {
        expired = data.expires;
        expired = expired && data.expires < (new Date()).getTime();
        prefillExpired = data.prefillExpires;
        prefillExpired = prefillExpired && data.prefillExpires < (new Date()).getTime();
        if(data.isDateRangeFilterCache) {
          newFetchNeeded = !isDateRangeRequestCached(key.dateRange, data.dateRange);
          if(newFetchNeeded) {
            var newDateRange = getMergedDateRange(key.dateRange, data.dateRange);
            var queryObj = key.query;
            var newDateFilter = updateDateFilter(key.dateFilter, newDateRange);
            var filter = _.clone(key.mainFilter);
            filter.push(newDateFilter);
            var builtFilter = jdsFilter.build(filter);
            queryObj.filter = builtFilter;
            var queryStr = queryString.stringify(queryObj);
            var url = key.baseUrl + '?' + queryStr;

            // TODO ensure conflicting filters are not in the URL
            var optsData = opts.data || {};
            optsData.filter = builtFilter;
            opts.data = optsData;

            var newSuccess = function(resp) {
              Backbone.fetchCache.setCache(self, opts, resp);
              if(opts.async) {
                nextTick(setData);
              } else {
                setData();
              }
            };

            opts.success = newSuccess;
          }
          attributes = data.value;
          attributes = applyFilters(attributes, key.dateFilter);
        } else {
          attributes = data.value;
        }
      }

      if (!expired && (opts.cache || opts.prefill) && attributes && !newFetchNeeded) {
        // Ensure that cache resolution adhers to async option, defaults to true.
        if (opts.async == null) { opts.async = true; }

        if (opts.async) {
          nextTick(_.bind(setData, this, true));
        } else {
          setData(true);
        }

        if (!isPrefilling()) {
          return deferred;
        }
      }

      // Delegate to the actual fetch method and store the attributes in the cache
      var jqXHR = superFetch.apply(this, arguments);
      jqXHR
        // Set the new data in the cache
        //.done( _.bind(Backbone.fetchCache.setCache, null, this, opts) )
        .done(function(attrs) {
          if(!data || (data && !data.isDateRangeFilterCache)) {
            Backbone.fetchCache.setCache(self, opts, attrs);
          }
        })
        // resolve the returned promise when the AJAX call completes
        .done( _.bind(deferred.resolve, this, this) )
        // Reject the promise on fail
        .fail( _.bind(deferred.reject, this, this) );

      deferred.abort = jqXHR.abort;

      // return a promise which provides the same methods as a jqXHR object
      return deferred;
    };
  }

  // Instance methods
  Backbone.Model.prototype.fetch = fetch(superMethods.modelFetch,
    function(self, opts, attributes) {
      if (opts.parse) {
        attributes = self.parse(attributes, opts);
      }

      self.set(attributes, opts);
      if (_.isFunction(opts.prefillSuccess)) { opts.prefillSuccess(self, attributes, opts); }
      return attributes;
    }
  );

  // Override Model.prototype.sync and try to clear cache items if it looks
  // like they are being updated.
  Backbone.Model.prototype.sync = function(method, model, options) {
    // Only empty the cache if we're doing a create, update, patch or delete.
    // or caching is not enabled
    if (method === 'read' || !Backbone.fetchCache.enabled) {
      return superMethods.modelSync.apply(this, arguments);
    }

    var collection = model.collection,
        keys = [],
        i, len;

    // Build up a list of keys to delete from the cache, starting with this
    keys.push(Backbone.fetchCache.getCacheKey(model, options));

    // If this model has a collection, also try to delete the cache for that
    if (!!collection) {
      keys.push(Backbone.fetchCache.getCacheKey(collection));
    }

    // Empty cache for all found keys
    for (i = 0, len = keys.length; i < len; i++) { clearItem(keys[i]); }

    return superMethods.modelSync.apply(this, arguments);
  };

  Backbone.Collection.prototype.fetch = fetch(superMethods.collectionFetch,
    function(self, opts, attributes) {
      self[opts.reset ? 'reset' : 'set'](attributes, opts);
      if (_.isFunction(opts.prefillSuccess)) { opts.prefillSuccess(self); }
      return attributes;
    }
  );

  // Prime the cache from localStorage on initialization
  getLocalStorage();

  // Exports

  Backbone.fetchCache._superMethods = superMethods;
  Backbone.fetchCache.setCache = setCache;
  Backbone.fetchCache.getCache = getCache;
  Backbone.fetchCache.getCacheKey = getCacheKey;
  Backbone.fetchCache.getLastSync = getLastSync;
  Backbone.fetchCache.clearItem = clearItem;
  Backbone.fetchCache.reset = reset;
  Backbone.fetchCache.setLocalStorage = setLocalStorage;
  Backbone.fetchCache.getLocalStorage = getLocalStorage;
  Backbone.fetchCache.updateDateFilter = updateDateFilter;
  Backbone.fetchCache._extractDateRangeFilters = extractDateRangeFilters;
  Backbone.fetchCache._getDateRange = getDateRange;
  Backbone.fetchCache._getMergedDateRange = getMergedDateRange;
  Backbone.fetchCache.isDateRangeRequestCached = isDateRangeRequestCached;
  Backbone.fetchCache._mergeJdsItems = mergeJdsItems;

  return Backbone;
}));
