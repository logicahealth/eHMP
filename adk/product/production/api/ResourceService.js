define([
    "backbone",
    "jquery",
    "api/UrlBuilder",
    "main/Session",
    "main/Utils",
    "api/SessionStorage",
    "api/UserService",
    "api/Navigation",
    "api/Enrichment",
    "main/pageable/pageable",
    "backbone.paginator",
    "backbone.fetch-cache"
], function(Backbone, $, UrlBuilder, session, utils, SessionStorage, UserService, Nav, Enrichment, ADKPagable) {
    'use strict';

    var DEFAULT_CACHE = true;

    // This number has to be high enough to ensure that there is enough columns to fill the entire screen
    // Otherwise the scroll event can not be triggered.
    var INITIAL_NUMBER_OF_ROWS = 40;
    //number of rows necessary for the table in a details modal with a chart
    var MAX_DETAILS_ROWS = 17;

    var DEFAULT_CACHE_EXPIRATION = 600; //false - never expires
    Backbone.fetchCache.localStorage = false;

    var Domain = Backbone.Model.extend({
        parse: function(response) {
            Enrichment.addFacilityMoniker(response);
            return response;
        }
    });

    Backbone.Collection.prototype.next = function(model) {
        return this.at(this.index(model) + 1) || model;
    };

    Backbone.Collection.prototype.prev = function(model) {
        return this.at(this.index(model) - 1) || model;
    };

    Backbone.Collection.prototype.index = function(model) {
        return this.indexOf(model);
    };

    Backbone.Collection.prototype.count = function() {
        return this.length;
    };

    //we create cleanup function to clean extraneous properties
    //that we set on the original backbone collection.
    //this cleans up potential closures from calling applets (fetchOptions being main problem).
    Backbone.Collection.prototype.cleanUp = function() {

        if (this.hasOwnProperty('originalModels')) {
            delete this.originalModels;
        }

        if (this.fetchOptions) {
            delete this.fetchOptions;
        }

        this.stopListening();
        this.reset();

    };

    Backbone.PageableCollection.prototype.next = function(model) {
        return this.fullCollection.at(this.index(model) + 1) || model;
    };

    Backbone.PageableCollection.prototype.prev = function(model) {
        return this.fullCollection.at(this.index(model) - 1) || model;
    };

    Backbone.PageableCollection.prototype.index = function(model) {
        return this.fullCollection.indexOf(model);
    };

    Backbone.PageableCollection.prototype.count = function() {
        return this.fullCollection.length;
    };

    Backbone.Collection.prototype.initialize = function(collection, config) {
        if (config && config.collectionParse) {
            this.collectionParse = function(collection) {
                return config.collectionParse(collection);
            };
        }
    };

    Backbone.Collection.prototype.parse = function(response) {
        var parsedResponse;
        if (response.data) {
            if (response.data.items) {
                parsedResponse = response.data.items;
            } else {
                parsedResponse = response.data;
            }
        } else {
            parsedResponse = response;
        }

        if (this.collectionParse) {
            this.reset(parsedResponse, {silent:true});
            parsedResponse = this.collectionParse(this);
        }
        return parsedResponse;
    };

    Backbone.PageableCollection.prototype.initialize = function(collection, config) {
        if (config && config.collectionParse) {
            this.collectionParse = function(collection) {
                return config.collectionParse(collection);
            };
        }
    };

    Backbone.PageableCollection.prototype.parse = function(response) {
        var parsedResponse;
        var collectionParse = this.collectionParse || _.get(this, 'fetchOptions.collectionConfig.collectionParse');
        if (response.data) {
            if (response.data.items) {
                parsedResponse = response.data.items;
            } else {
                parsedResponse = response.data;
            }
        } else {
            parsedResponse = response;
        }

        if (collectionParse) {
            this.reset(parsedResponse, {silent:true});
            parsedResponse = collectionParse(this);
        }
        return parsedResponse;
    };

    var DomainCollection = Backbone.Collection.extend({
        model: Domain
    });

    var PageableCollection = ADKPagable.extend({
        model: Domain
    });

    var setResponseLogId = function(resp, options) {
        if (options.xhr.getResponseHeader('logId')) {
            resp.logId = options.xhr.getResponseHeader('logId').concat(' (', resp.status, ')');
        }
    };

    var resourceService = {
        DomainCollection: DomainCollection,
        createEmptyCollection: function(options) {
            var fetchOptions = {};
            _.extend(fetchOptions, options);
            fetchOptions.resourceTitle = undefined;
            return this.fetchCollection(fetchOptions);
        },
        fetchCollection: function(options, existingCollection) {
            var resourceTitle = options.resourceTitle;
            var viewModel = options.viewModel;
            var criteria = options.criteria;
            var onSuccess = options.onSuccess;
            var cache;
            if (options.fetchType === "POST") {
                cache = (options.cache !== undefined) ? options.cache : false;
            } else {
                cache = (options.cache !== undefined) ? options.cache : DEFAULT_CACHE;
            }
            var cacheExpiration = options.cacheExpiration || DEFAULT_CACHE_EXPIRATION;
            var onError = options.onError;
            var createdCollection;
            var collectionConfig = {};
            if (options.resourceTitle) {
                if (options.fetchType === 'POST') {
                    collectionConfig = {
                        url: UrlBuilder.buildUrl(resourceTitle)
                    };
                } else {
                    collectionConfig = {
                        url: UrlBuilder.buildUrl(resourceTitle, criteria)
                    };
                }
            }

            var optionalCollectionConfig = _.get(options, 'collectionConfig');
            if (existingCollection && optionalCollectionConfig) existingCollection.collectionConfig = optionalCollectionConfig;
            if (existingCollection && options.resourceTitle) {
                if (options.fetchType === 'POST') {
                    existingCollection.url = UrlBuilder.buildUrl(resourceTitle);
                } else {
                    existingCollection.url = UrlBuilder.buildUrl(resourceTitle, criteria);
                }
                if (options.collectionConfig && options.collectionConfig.comparator && !existingCollection.comparator) {
                    existingCollection.comparator = options.collectionConfig.comparator;
                }
                createdCollection = existingCollection;
            } else {
                if (options.pageable === true) {
                    var pagingConfig;
                    if (options.detailModalTable === true) {
                        pagingConfig = {
                            mode: 'client',
                            state: {
                                pageSize: MAX_DETAILS_ROWS
                            }
                        };
                    } else {
                        pagingConfig = {
                            mode: 'client',
                            state: {
                                pageSize: INITIAL_NUMBER_OF_ROWS
                            }
                        };
                    }

                    //override defaults with options
                    _.extend(pagingConfig, options.collectionConfig);

                    //merge into collectionConfig
                    _.extend(collectionConfig, pagingConfig);

                    createdCollection = new PageableCollection([], collectionConfig);
                } else {
                    _.extend(collectionConfig, options.collectionConfig);
                    createdCollection = new DomainCollection([], collectionConfig);
                }

                createdCollection.url = collectionConfig.url;
            }
            if (viewModel !== undefined) {
                if (_.isFunction(viewModel.parse) && _.isFunction(Domain.prototype.parse)) {
                    viewModel.parse = _.compose(Domain.prototype.parse, viewModel.parse);
                }
                var ExtendedDomain = Domain.extend(viewModel);
                createdCollection.model = ExtendedDomain;
            }
            createdCollection.fetchOptions = options;

            var data = '',
                contentType = '';
            if (options.fetchType === 'POST') {
                if (options.pageable) {
                    data = options.criteria;
                } else {
                    data = JSON.stringify(options.criteria);
                }

                contentType = 'application/json';
            }

            if (options.resourceTitle) {
                createdCollection.xhr = createdCollection.fetch({
                    data: data,
                    contentType: contentType,
                    cache: cache,
                    expires: cacheExpiration, //expiration in seconds, default 5 minutes, false never expires
                    type: options.fetchType || 'GET',
                    success: function(collection, resp) {
                        if (createdCollection instanceof Backbone.PageableCollection) {
                            createdCollection.originalModels = createdCollection.fullCollection.toJSON();
                        } else {
                            createdCollection.originalModels = createdCollection.toJSON();
                        }

                        if (typeof onSuccess == "function") {
                            onSuccess(collection, resp);
                        }

                        collection.trigger('fetchSuccessful', collection);
                        collection.trigger('fetch:success', collection, resp);

                        delete collection.xhr;
                    },
                    error: function(collection, resp, options) {
                        setResponseLogId(resp, options);
                        collection.trigger('fetch:error', collection, resp);
                        if (typeof onError == "function") {
                            onError(collection, resp);
                        }
                        delete collection.xhr;
                    }
                });

                //Clear cache
                if (cache === false) {
                    this.clearCache(collectionConfig.url);
                }
            }

            return createdCollection;
        },
        resetCollection: function(originalCollection, options) {
            this.fetchCollection(options).on('sync', function(fetchedCollection) {
                originalCollection.reset(fetchedCollection.models);
            });
        },
        filterCollection: function(originalCollection, filterFunction) {
            originalCollection.reset(_.filter(originalCollection.models, function(model) {
                return filterFunction(model);
            }));
            return originalCollection.toJSON();
        },
        fetchModel: function(options) {
            var resourceTitle = options.resourceTitle;
            var viewModel = options.viewModel;
            var criteria = options.criteria;
            var createdModel, DomainModel;

            DomainModel = Backbone.Model.extend({
                parse: function(response) {
                    var parsedResponse;
                    if (response.data) {
                        if (response.data.items) {
                            parsedResponse = response.data.items[0];
                        } else {
                            parsedResponse = response.data;
                        }
                    } else {
                        parsedResponse = response;
                    }
                    return parsedResponse;
                }
            });

            if (viewModel !== undefined) {
                var ExtendedDomain = DomainModel.extend(viewModel);
                createdModel = new ExtendedDomain();
            } else {
                createdModel = new DomainModel();
            }
            createdModel.url = UrlBuilder.buildUrl(resourceTitle, criteria);
            return createdModel;
        },
        clearCache: function(url) {
            var clearUrl = url.url || url;
            Backbone.fetchCache.clearItem(clearUrl);
        },
        clearCacheByResourceTitle: function(resourceTitle) {
            var clearUrl = UrlBuilder.buildUrl(resourceTitle);
            Backbone.fetchCache._cache = _.omit(Backbone.fetchCache._cache, function(value, key) {
                return key.indexOf(clearUrl) >= 0;
            });
            Backbone.fetchCache.setLocalStorage();
        },
        clearAllCache: function(dominString) {
            if (dominString) {
                for (var domain in Backbone.fetchCache._cache) {
                    if (domain.indexOf(dominString) >= 0) {
                        delete Backbone.fetchCache._cache[domain];
                    }
                }
            } else {
                for (var url in Backbone.fetchCache._cache) {
                    delete Backbone.fetchCache._cache[url];
                }
            }
            Backbone.fetchCache.setLocalStorage();
        },
        buildUrl: function(resourceTitle, criteria) {
            return UrlBuilder.buildUrl(resourceTitle, criteria);
        },
        /**
         * Takes an url with :params and replaces them with their matching values. Parameters without a
         * matching value will be replaced with 'undefined'. Parameters are identified by a colon followed
         * by the name of the parameter. The parameter name must start with a letter and can be followed
         * by characters from the word class (e.g. a-z, A-Z, 0-9, _).
         *
         * @param url {string} Source URL. Follows the following form: http://somedomain/path/:param1/some/:param2/...
         * @param params {object} Object containing the key/values. Property names are the keys. (e.g. { param1: 'value1', param2: 'value2 })
         * @returns {string} An URL with all params replaced (e.g. http://somedomain/path/value1/some/value2/...).
         */
        replaceURLRouteParams: function(url, params) {
            return UrlBuilder.replaceURLRouteParams(url, params);
        },
        fetchResponseStatus: function(options) {
            var resourceTitle = options.resourceTitle;
            var criteria = options.criteria;
            var onSuccess = options.onSuccess;
            var cache = (options.cache !== undefined) ? options.cache : DEFAULT_CACHE;
            var cacheExpiration = options.cacheExpiration || DEFAULT_CACHE_EXPIRATION;
            var onError = options.onError;
            var createdCollection;
            var collectionConfig = {};
            if (options.resourceTitle) {
                collectionConfig = {
                    url: UrlBuilder.buildUrl(resourceTitle, criteria)
                };
            }
            _.extend(collectionConfig, options.collectionConfig);
            createdCollection = options.domainCollection || new DomainCollection([], collectionConfig);

            createdCollection.url = collectionConfig.url;

            createdCollection.fetchOptions = options;
            if (options.resourceTitle) {
                createdCollection.xhr = createdCollection.fetch({
                    cache: cache,
                    expires: cacheExpiration, //expiration in seconds, default 5 minutes, false never expires
                    success: function(collection, resp) {
                        if (typeof onSuccess == "function") {
                            onSuccess(collection, resp);
                        }
                        delete collection.xhr;
                    },
                    error: function(collection, resp, options) {
                        setResponseLogId(resp, options);
                        if (resp.status == 200 && (typeof onSuccess == "function")) {
                            onSuccess(collection, resp);
                        } else if (typeof onError == "function") {
                            onError(collection, resp);
                        }
                        delete collection.xhr;
                    }
                });

                //Clear cache
                if (cache === false) {
                    this.clearCache(collectionConfig.url);
                }
            }
        },
        fetchDateFilteredCollection: function(collection, dateFilterOptions) {
            // var date = SessionStorage.getModel('globalDate');
            collection.fetchOptions.criteria.filter = this.buildJdsDateFilter(dateFilterOptions);
            this.fetchCollection(collection.fetchOptions, collection);
        },
        buildJdsDateFilter: function(dateFilterOptions) {
            var fromDate, toDate;

            if (dateFilterOptions.hasOwnProperty('fromDate') || dateFilterOptions.hasOwnProperty('toDate')) {
                fromDate = dateFilterOptions.fromDate;
                toDate = dateFilterOptions.toDate;
            } else {
                var globalDate = SessionStorage.getModel('globalDate');
                fromDate = globalDate.get('fromDate');
                toDate = globalDate.get('toDate');
            }

            if (fromDate === undefined || fromDate === null || fromDate.trim().length === 0) {
                fromDate = '';
            } else {
                fromDate = '"' + utils.formatDate(fromDate, 'YYYYMMDD', 'MM/DD/YYYY') + '"';
            }

            if (toDate === undefined || toDate === null || toDate.trim().length === 0) {
                toDate = '';
            } else {
                toDate = '"' + utils.formatDate(toDate, 'YYYYMMDD', 'MM/DD/YYYY') + '"';
            }

            var dateFilter;

            if (fromDate !== '' && toDate !== '') {
                dateFilter = 'between(' + dateField + ',' + fromDate + ',' + toDate + ')';
            } else if (fromDate === '' && toDate !== '') {
                dateFilter = 'lte(' + dateField + ',' + toDate + ')';
            } else if (fromDate !== '' && toDate === '') {
                dateFilter = 'gte(' + dateField + ',' + fromDate + ')';
            } else {
                // error case
                console.error('ResourceService.js buildJdsDateFilter both fromDate and toDate are empty.');
            }

            // console.log('buildJdsDateFilter ', dateFilter);

            return dateFilter;
        }
    };

    var setPatientFetchParams = function(inPatient, opts) {
        var options = _.extend({}, opts);
        var patient = (options.patient || inPatient);
        if (!_.isUndefined(patient)) {
            if (_.isUndefined(options.criteria)) {
                options.criteria = {};
            }
            //Pid will be used if exists unless patientIdentifierType specified to ICN
            if (options.patientIdentifierType && patient.get(options.patientIdentifierType)) {
                options.criteria.pid = patient.get(options.patientIdentifierType);
            } else if (patient.get("pid")) {
                options.criteria.pid = patient.get("pid");
            } else if (patient.get("icn")) {
                options.criteria.pid = patient.get("icn");
            } else {
                options.criteria.pid = patient.get("id");
            }

            if (patient.has("acknowledged")) {
                options.criteria._ack = 'true';
            }
        }
        return options;
    };

    return resourceService;
});
