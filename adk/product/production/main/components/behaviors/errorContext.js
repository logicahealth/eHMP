define([
    'underscore',
    'backbone',
    'marionette'
], function(
    _,
    Backbone,
    Marionette
) {
    'use strict';

    var ErrorContext = Backbone.Marionette.Behavior.extend({
        events: {
            'request:error:context': '_onRequest'
        },
        _onRequest: function(e, eventString) {
            if (!_.isString(eventString)) return;
            e.stopPropagation();
            var context = {};
            var title = _.get(this, 'options.title', '');
            var details = _.get(this, 'options.details', {});
            if (_.isFunction(title)) title = title.call(this.view);
            if (_.isFunction(details)) details = details.call(this.view);
            if (!_.isEmpty(title)) context.title = title;
            if (!_.isEmpty(details)) context.details = details;

            // should have { title: '', details: {} }
            // content of details object will be passed through to resource
            $(e.target).trigger(eventString, context);
        }
    });

    return ErrorContext;
});
