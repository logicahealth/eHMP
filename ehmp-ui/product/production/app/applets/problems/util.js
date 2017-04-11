define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/problems/utilParse'
], function(Backbone, Marionette, _, Util) {
    "use strict";

    Util.getModalTitle = function(model) {
        return !_.isUndefined(model.get('groupName')) ? model.get('groupName') : model.get('problemText');
    };
    return Util;
});
