define([
    'backbone',
    'api/UrlBuilder',
    'api/Messaging',
    'api/PatientRecordService',
    'main/overrides/overrides'
], function(Backbone, UrlBuilder, Messaging, PatientRecordService) {
    'use strict';
    var BaseModel = Backbone.Model.extend({
        fetchOptionsDefaults: {
            cache: true,
            expires: 600
        },
        _initialize: function(attributes, options) {
            this.options = _.extend({
                allowAbort: true
            }, options);
            if (_.isString(this.options.resourceTitle)) {
                this.resourceTitle = this.options.resourceTitle;
            }
            this.listenTo(this, 'sync error', function(model, response, options) {
                delete this.xhr;
            });
        },
        _setUpFetchOptions: function(options) {
            var fetchOptions = options || _.result(this, 'fetchOptions', {});
            var patientFetchOptions = {};
            if (fetchOptions.patientData === true) {
                _.extend(patientFetchOptions, PatientRecordService.setPatientFetchParams(PatientRecordService.getCurrentPatient(), this.options));
            }
            fetchOptions = _.defaultsDeep({}, fetchOptions, patientFetchOptions, {
                resourceTitle: this.resourceTitle
            }, this.fetchOptionDefaults);
            if (_.isString(fetchOptions.resourceTitle)) {
                this.url = fetchOptions.url = UrlBuilder.buildUrl(fetchOptions.resourceTitle);
            }
            return fetchOptions;
        },
        save: function(attributes, options) {
            this.abort();
            var saveOptions = this._setUpFetchOptions(options);
            this.xhr = Backbone.Model.prototype.save.call(this, attributes, saveOptions);
        },
        fetch: function(options) {
            this.abort();
            var fetchOptions = this._setUpFetchOptions(options);
            this.xhr = Backbone.Model.prototype.fetch.call(this, fetchOptions);
        },
        abort: function() {
            if (_.get(this, 'options.allowAbort') === true && _.get(this, 'xhr.abort')) {
                this.xhr.abort();
                return true;
            }
            return false;
        }
    });
    var OrigModel = BaseModel;
    BaseModel = OrigModel.extend({
        constructor: function() {
            this._initialize.apply(this, arguments);
            var parse = this.parse;
            var onModelParseError = function(error, argsFromFailingFunc) {
                console.warn('ADK.Collections model parse error --', error, argsFromFailingFunc);
                if (this instanceof Backbone.Model) {
                    // thisBind in .try was model
                    var response = _.get(argsFromFailingFunc, '0.0');
                    var responseOptions = _.get(argsFromFailingFunc, '0.1');
                    this.trigger('error', this, response, responseOptions);
                }
            };
            this.parse = function() {
                OrigModel.prototype.parse.onError = onModelParseError;
                if (OrigModel.prototype.parse === parse) {
                    return OrigModel.prototype.parse.try(this, arguments);
                }
                var origArgs = arguments;
                var chainedParse = _.modArgs(parse, _.bind(function(origResults) {
                    return OrigModel.prototype.parse.try(this, origArgs);
                }, this));
                chainedParse.onError = onModelParseError;
                return chainedParse.try(this, arguments);
            };
            OrigModel.prototype.constructor.apply(this, arguments);
        }
    });

    return BaseModel;
});
