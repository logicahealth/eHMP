define(['underscore'], function(_) {
    "use strict";

    // <function>.try(thisBind, [arg1, arg2]|argumentsObj)
    // (treat same way as <function>.apply)
    Function.prototype.try = function(thisBind) {
        var args = Array.prototype.slice.call(arguments);
        args.shift();
        try {
            return this.apply(thisBind, (_.isArguments(args[0]) ? args[0] : args));
        } catch (error) {
            // set up like: <function>.onError = function() {...} before calling
            // <function>.try
            if (_.isFunction(this.onError)) {
                this.onError.call(thisBind, error, args);
            }
        }
    };

    // really doesn't return anything..
    return Function;
});
