define([
    'backbone',
    'api/Messaging',
    'api/UrlBuilder'
], function(Backbone, Messaging, UrlBuilder) {
    "use strict";

    //model and collection events fired by Backbone
    var CommonEvents = ['change', 'sync', 'destroy', 'invalid', 'update', 'add', 'sort', 'reset', 'remove', 'request', 'error'],
        backboneMethodMap = {
            'create': 'POST',
            'read': 'GET',
            'update': 'PUT',
            'patch': 'PATCH',
            'delete': 'DELETE'
        },
        methodMap = {
            'create': 'create',
            'update': 'update',
            'patch': 'patch',
            'delete': 'delete',
            'read': 'read',
            'eie': 'update'
        },
        parseMethodMap = function(method) {
            var methodType = this.methodMap[method],
                methodName, resource, defaultParams;

            if (_.isString(methodType)) methodName = methodType;
            if (_.isFunction(methodType)) return methodType.call(this);
            if (_.isObject(methodType)) {
                methodName = methodType.method || methodMap[method];
                resource = methodType.resource;
                defaultParams = methodType.parameters;
            }

            return {
                method: methodName,
                resource: resource,
                parameters: defaultParams
            };
        };

    var AbstractCollection = Backbone.Collection.extend({
        childParse: true, //greedily convert objects and arrays into models and collections
        url: null,
        parse: function(resp, options) {
            return resp;
        },
        getUrl: function(method, options) {
            //Here is where one could specify a custom URL for different actions
            var url,
                opts = _.extend({
                    'params': this.params
                }, options),
                params = _.extend(this.defaultParams || {}, _.isFunction(opts.params) ? opts.params.apply(this, arguments) : opts.params),
                resource = opts.resource || this.resource;

            if (this.patient && this.patient.has("acknowledged")) {
                _.extend(params, {
                    '_ack': true
                });
            }

            switch (method.toLowerCase()) {
                case 'create': //request type POST
                case 'update': //request type PUT
                case 'patch': //request type PATCH
                case 'delete': //request type DELETE
                case 'read': //request type GET
                    url = UrlBuilder.buildUrl(resource, params);
                    break;
                default:
                    url = UrlBuilder.buildUrl(resource, params);
                    break;
            }

            return this.setDefaultParameters(url.replace(/\/+/g, '/'), options); //replace multiple /'s with one
        },
        setDefaultParameters: function(url) {
            return url;
        },
        parseParameters: function(url, parameters) {
            _.each(parameters, function(val, key) {
                url = url.replace(new RegExp(':' + key, 'g'), this.get(val) || _.get(this, val) || val);
            }, this);
            return url;
        },
        methodMap: methodMap,
        sync: function(method, collection, options) {
            var backboneMethod = parseMethodMap.call(this, method),
                opts = _.extend({
                    success: _.noop,
                    error: _.noop
                }, options),
                url;

            if (!_.isObject(opts)) throw new Error('Options must be an object');

            if (backboneMethod.resource) opts.resource = backboneMethod.resource;

            url = this.parseParameters(this.url || this.getUrl(method, opts), backboneMethod.parameters);

            collection.trigger('before:' + method, this);

            options = _.extend({}, options, {
                url: url,
                success: function(resp) {
                    opts.success.apply(this, arguments);
                    collection.trigger(method + ':success', collection, resp, options);
                },
                error: function(resp) {
                    opts.error.apply(this, arguments);
                    collection.trigger(method + ':error', collection, resp, options);
                },
                type: opts.type || backboneMethodMap[backboneMethod.method] || 'GET'
            });
            return Backbone.Collection.prototype.sync.call(this, backboneMethod.method, collection, options);
        }
    });


    var ADKCollection = AbstractCollection,
        modCollection = ADKCollection.extend({
            constructor: function(models, options) {

                var methodMap = this.methodMap,
                    removeReference = this._removeReference,
                    set = this.set;

                this.set = function(models, options) {
                    options = _.extend({}, options, {
                        parse: this.childParse || options.parse
                    });
                    set.call(this, models, options);
                };

                this.methodMap = _.extend({}, ADKModel.prototype.methodMap, methodMap);

                this.model = (this.model === Backbone.Model) ? modModel : this.model;
                this.Model = this.model; //create a reference for readability

                ADKCollection.apply(this, arguments);
            }
        });


    var AbstractModel = Backbone.Model.extend({
        childParse: true, //greedily convert objects and arrays into models and collections
        //childAttributes: [],  //convert only these attributes if applicable
        url: null,
        parse: function(resp, options) {
            return resp;
        },
        stopPropagation: CommonEvents, //a list of events to not bubble up from a child collection or model
        parseChildren: function(resp, options) {
            if (!this.childParse && _.isEmpty(this.childAttributes)) return resp;
            var Collection = this.Collection.extend({
                'parent': this
            });
            var Model = this.Model.extend({
                'parent': this
            });

            //just convert the childAttributes into a sub models/collection
            if (!_.isEmpty(this.childAttributes)) {
                _.each(this.childAttributes, function(val, index) {
                    var item = resp[val];
                    if (item) {
                        if (item instanceof Backbone.Collection) {
                            resp[val] = new Collection(item.models, _.extend({}, options, {
                                'parse': false
                            }));
                            return;
                        }
                        if (item instanceof Backbone.Model) {
                            resp[val] = new Model(item.attributes, _.extend({}, options, {
                                'parse': false
                            }));
                            return;
                        }
                        if (_.isArray(item)) {
                            resp[val] = new Collection(item, _.extend({}, options, {
                                'parse': false
                            }));
                            return;
                        }
                        if (_.isObject(item)) {
                            resp[val] = new Model(item, _.extend({}, options, {
                                'parse': false
                            }));
                        }
                    }
                }, this);
                return resp;
            }

            //convert all applicable attributes
            _.each(resp, function(val, key) {
                if (val instanceof Backbone.Collection) {
                    resp[key] = new Collection(val.models, _.extend({}, options, {
                        'parse': false
                    }));
                    return;
                }
                if (val instanceof Backbone.Model) {
                    resp[key] = new Model(val.attributes, _.extend({}, options, {
                        'parse': false
                    }));
                    return;
                }
                if (_.isArray(val)) {
                    resp[key] = new Collection(val, _.extend({}, options, {
                        'parse': false
                    }));
                    return;
                }
                if (_.isObject(val)) {
                    resp[key] = new Model(val, _.extend({}, options, {
                        'parse': false
                    }));
                }
            }, this);
            return resp;
        },
        getUrl: function(method, options) {
            //Here is where one could specify a custom URL for different actions
            var url,
                opts = _.extend({
                    'params': this.params
                }, options),
                //params is for query parameteres, in other words for a 'GET' request
                params = _.extend(this.defaultParams || {}, _.isFunction(opts.params) ? opts.params.apply(this, arguments) : opts.params),
                resource = opts.resource || this.resource;

            if (this.patient && this.patient.has("acknowledged")) {
                _.extend(params, {
                    '_ack': true
                });
            }

            switch (method.toLowerCase()) {
                case 'create': //request type POST
                case 'update': //request type PUT
                case 'patch': //request type PATCH
                case 'delete': //request type DELETE
                case 'read': //request type GET
                    url = UrlBuilder.buildUrl(resource, params);
                    break;
                default:
                    url = UrlBuilder.buildUrl(resource, params);
                    break;
            }

            return this.setDefaultParameters(url.replace(/\/+/g, '/'), options); //replace multiple /'s with one
        },
        setDefaultParameters: function(url) {
            return url;
        },
        parseParameters: function(url, parameters) {
            _.each(parameters, function(val, key) {
                url = url.replace(new RegExp(':' + key, 'g'), this.get(val) || _.get(this, val) || val);
            }, this);
            return url;
        },
        methodMap: methodMap,
        sync: function(method, model, options) {
            var backboneMethod = parseMethodMap.call(this, method),
                opts = _.extend({
                    success: _.noop,
                    error: _.noop
                }, options),
                url;

            if (!_.isObject(opts)) throw new Error('Options must be an object');

            if (backboneMethod.resource) opts.resource = backboneMethod.resource;

            url = this.parseParameters(this.url || this.getUrl(method, opts), backboneMethod.parameters);

            model.trigger('before:' + method, this);

            options = _.extend({}, options, {
                url: url,
                success: function(resp) {
                    opts.success.apply(this, arguments);
                    model.trigger(method + ':success', model, resp, options);
                },
                error: function(resp) {
                    opts.error.apply(this, arguments);
                    model.trigger(method + ':error', model, resp, options);
                },
                type: opts.type || backboneMethodMap[backboneMethod.method] || 'GET'
            });
            return Backbone.Model.prototype.sync.call(this, backboneMethod.method, model, options);
        },
        _removeReference: function(child, options) {
            if (child.parent === this) delete child.parent;
            child.off();
        },
        toJSON: function(options) {
            if (!this.childParse && _.isEmpty(this.childAttributes)) return Backbone.Model.prototype.toJSON.apply(this, arguments);
            var attrs = _.clone(this.attributes);

            if (!_.isEmpty(this.childAttributes)) {
                _.each(this.childAttributes, function(val, index) {
                    if (_.isEmpty(attrs[val])) return;
                    attrs[val] = attrs[val].toJSON();
                }, this);
                return attrs;
            }

            _.each(attrs, function(val, key) {
                if (val instanceof modCollection || val instanceof modModel) {
                    attrs[key] = val.toJSON();
                }
            }, this);
            return attrs;
        }
    });


    var ADKModel = AbstractModel,
        modModel = ADKModel.extend({
            constructor: function() {
                var methodMap = this.methodMap,
                    parse = this.parse,
                    set = this.set;

                this.parse = function(resp, options) {
                    var response = parse.apply(this, arguments);
                    return this.parseChildren.call(this, response, options);
                };

                this.set = function() {
                    var ref = set.apply(this, arguments);
                    _.each(this.changed, function(val, key) {
                        var attr = this._previousAttributes[key];
                        if (!attr) return;
                        if (attr instanceof Backbone.Model || attr instanceof Backbone.Collection) {
                            this._removeReference(attr);
                        }
                    }, this);
                    return ref;
                };

                this.methodMap = _.extend({}, ADKModel.prototype.methodMap, methodMap);

                this.Model = this.Model || modModel;
                this.Collection = this.Collection || modCollection;

                ADKModel.prototype.constructor.apply(this, arguments);

                if (this.parent && !this.collection) { //if the model is part of a collection this is already done for us
                    this.listenTo(this, 'all', function() {
                        var args = arguments,
                            found = _.filter(this.stopPropagation, function(event) {
                                return event === args[0];
                            });
                        if (!_.isEmpty(found)) return;
                        Marionette.triggerMethod.apply(this.parent, args);
                    });
                }
            }
        });

    return {
        Model: modModel,
        Collection: modCollection
    };

});