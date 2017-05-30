define([
    'main/overrides/backbone',
    'main/overrides/marionette',
    'main/overrides/function'
], function(
    BackboneOverride,
    MarionetteOverride,
    FunctionOverride
) {
    "use strict";

    return {
        Backbone: BackboneOverride,
        Marionette: MarionetteOverride,
        Function: FunctionOverride
    };
});
