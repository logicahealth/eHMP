define([
    'underscore',
    'backbone',
    'marionette',
    'main/overrides/common/errorCatching',
    'main/overrides/function',
    'main/overrides/backbone'
], function(
    _,
    Backbone,
    Marionette,
    ErrorCatchingHelpers,
    FunctionOverrides,
    BackboneOverrides
) {
    "use strict";

    /*
     * The following wraps common Marionette methods in a try catch
     * in order to track any uncaught JavaScript errors
     */

    _.each(Backbone.Marionette, function(value, key) {
        if (!_.isFunction(value) || !_.isObject(_.get(value, 'prototype'))) return;
        Backbone.Marionette[key].prototype = _.extend(Backbone.Marionette[key].prototype, _.transform(ErrorCatchingHelpers.functionsToWrapInTryCatch, function(result, options, functionName) {
            if (_.isArray(_.get(options, 'omitKeys')) && _.contains(_.get(options, 'omitKeys'), key)) return;
            var Orig = Backbone.Marionette[key].prototype[functionName];
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

    return Backbone;
});
