define([
    'underscore',
    'backbone',
    'main/overrides/common/errorCatching',
    'main/overrides/function'
], function(
    _,
    Backbone,
    ErrorCatchingHelpers,
    FunctionOverrides
) {
    "use strict";

    /*
     * The following wraps common Backbone methods in a try catch
     * in order to track any uncaught JavaScript errors
     */

    _.each(Backbone, function(value, key) {
        if (!_.isFunction(value) || !_.isObject(_.get(value, 'prototype'))) return;
        Backbone[key].prototype = _.extend(Backbone[key].prototype, _.transform(ErrorCatchingHelpers.functionsToWrapInTryCatch, function(result, options, functionName) {
            if (_.isArray(_.get(options, 'omitKeys')) && _.contains(_.get(options, 'omitKeys'), key)) return;
            var Orig = Backbone[key].prototype[functionName];
            if (_.isUndefined(Orig)) return;
            if (_.isFunction(_.get(options, 'getArguments'))) {
                result[functionName] = function() {
                    Orig.onError = _.get(options, 'onError', _.noop);
                    options.getArguments.apply(this, arguments);
                    return Orig.try(this, arguments);
                };
            } else {
                result[functionName] = function() {
                    Orig.onError = _.get(options, 'onError', _.noop);
                    return Orig.try(this, arguments);
                };
            }
        }));
    });

    var BackMod = Backbone.Model;
    Backbone.Model = _.extend(function() {
        BackMod.prototype.constructor.onError = ErrorCatchingHelpers.getErrorCallback('constructor');
        BackMod.prototype.constructor.try(this, arguments);
    }, BackMod);
    Backbone.Model.prototype = _.create(BackMod.prototype);
    Backbone.Model.prototype.constructor = Backbone.Model;

    var BackColl = Backbone.Collection;
    Backbone.Collection = _.extend(function() {
        BackColl.prototype.constructor.onError = ErrorCatchingHelpers.getErrorCallback('constructor');
        BackColl.prototype.constructor.try(this, arguments);
    }, BackColl);
    Backbone.Collection.prototype = _.create(BackColl.prototype);
    Backbone.Collection.prototype.constructor = Backbone.Collection;
    _.extend(Backbone.Collection.prototype, {
        model: Backbone.Model
    });

    return Backbone;
});
