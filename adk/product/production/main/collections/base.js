define([
    'backbone',
    'api/UrlBuilder',
    'api/Messaging',
    'main/models/models',
    'api/PatientRecordService',
    'main/overrides/overrides'
], function(Backbone, UrlBuilder, Messaging, ADKModels, PatientRecordService) {
    'use strict';

    var BaseCollection = Backbone.Collection.extend({
        model: ADKModels.BaseModel,
        fetchOptionDefaults: {
            data: '',
            contentType: '',
            cache: true,
            expires: 600, //expiration in seconds, default 5 minutes, false never expires
            type: 'GET'
        },
        initialize: function(models, options) {
            this.options = _.extend({
                allowAbort: true
            }, options);
            if (_.isString(this.options.resourceTitle)) {
                this.resourceTitle = this.options.resourceTitle;
            }
            this.listenTo(this, 'sync error', function(collection, response, options) {
                this._setRequestId(options);
                delete this.xhr;
            });
            BaseCollection.__super__.initialize.apply(this, arguments);
        },
        _setupFetchOptions: function(options) {
            options = options || _.result(this, 'fetchOptions', {});
            this.abort();
            var patientFetchOptions = {};
            if (this.options.patientData === true || options.patientData === true) {
                _.extend(patientFetchOptions, PatientRecordService.getCurrentPatient().setFetchParams(this.options));
            }
            return _.defaultsDeep({}, options, patientFetchOptions, {
                resourceTitle: this.resourceTitle
            }, this.fetchOptionDefaults);
        },
        fetch: function(options) {
            var fetchOptions = this._setupFetchOptions(options);
            if (_.isString(fetchOptions.resourceTitle)) {
                this.url = fetchOptions.url = UrlBuilder.buildUrl(fetchOptions.resourceTitle, fetchOptions.criteria, fetchOptions.allowDuplicateParams);
            }
            if(_.get(fetchOptions, 'type') === 'POST') {
                this.post.call(this, fetchOptions);
            } else {
                this.xhr = BaseCollection.__super__.fetch.call(this, fetchOptions);
            }
        },
        post: function post(options) {
            var fetchOptions = this._setupFetchOptions(options);
            if (_.isString(fetchOptions.resourceTitle)) {
                this.url = fetchOptions.url = UrlBuilder.buildUrl(fetchOptions.resourceTitle);
            }
            var data = _.defaultsDeep({
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(fetchOptions.criteria),
                headers: {
                    'X-HTTP-Method-Override': 'GET'
                }
            }, _.omit(fetchOptions, 'criteria'));
            this.xhr = BaseCollection.__super__.fetch.call(this, data);
        },
        getTotalItems: function() {
            return this.length;
        },
        abort: function() {
            if (_.get(this, 'options.allowAbort') === true && _.get(this, 'xhr.abort')) {
                this.xhr.abort();
                return true;
            }
            return false;
        },
        parse: function(response, options) {
            // done here instead of in on 'sync/error' in order to be done ASAP
            // (parse run before success and 'sync')
            this._setRequestId(options);
            return response;
            // return BaseCollection.__super__.parse.apply(this, arguments);
        },
        _setRequestId: function(options) {
            options = options || {};
            if (_.isFunction(_.get(options, 'xhr.getResponseHeader'))) {
                this.serverRequestId = options.xhr.getResponseHeader('X-Request-Id');
            }
        }
    });
    var OrigCollection = BaseCollection;
    var ModifiedBaseCollection = OrigCollection.extend({
        constructor: function() {
            var parse = this.parse;
            var onCollectionParseError = function(error, argsFromFailingFunc) {
                var collection;
                var response;
                var responseOptions;
                if (_.isObject(_.get(argsFromFailingFunc, '[0][0]'))) {
                    response = argsFromFailingFunc[0][0];
                }
                if (_.isObject(_.get(argsFromFailingFunc, '[0][1]'))) {
                    responseOptions = argsFromFailingFunc[0][1];
                }
                if (this instanceof Backbone.Collection) {
                    // thisBind in .try was collection
                    collection = this;
                    collection.trigger('error', collection, response, responseOptions);
                }
                console.warn('ADK.Collections collection parse error --', error, argsFromFailingFunc);
            };
            this.parse = function() {
                OrigCollection.prototype.parse.onError = onCollectionParseError;
                if (OrigCollection.prototype.parse === parse) {
                    return OrigCollection.prototype.parse.try(this, arguments);
                }
                var origArgs = arguments;
                var chainedParse = _.modArgs(parse, _.bind(function(origResults) {
                    return OrigCollection.prototype.parse.try(this, origArgs);
                }, this));
                chainedParse.onError = onCollectionParseError;
                return chainedParse.try(this, arguments);
            };
            OrigCollection.prototype.constructor.apply(this, arguments);
        }
    });
    return ModifiedBaseCollection;
});
