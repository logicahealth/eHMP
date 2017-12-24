define([
    'backbone',
    'marionette',
    'handlebars',
    'underscore'
], function(Backbone, Marionette, Handlebars, _) {
    "use strict";

    var ChildBehaviors = Backbone.Marionette.Behavior.extend({
        buildChildView: function(view, buildChildViewMethod, childViewBehaviors, self, model, ChildView, options) {
            var behaviors = _.extend({}, ChildView.prototype.behaviors || {});
            var compiledBehaviors = _.isFunction(childViewBehaviors) ? childViewBehaviors.call(self, options) : childViewBehaviors;
            _.extend(behaviors, compiledBehaviors);

            return buildChildViewMethod.call(view, model, ChildView.extend({
                behaviors: behaviors
            }), _.extend(options, _.result(self, 'childViewOptions')));
        },
        initialize: function(options) {
            this.childViewOptions = this.getOption('childViewOptions');
            this.triggerMethod('before:initialize', options);
            var _buildChildView = this.view.buildChildView;
            this.view.buildChildView = _.partial(this.buildChildView, this.view, _buildChildView, this.getOption('childViewBehaviors'), this);
            this.triggerMethod('after:initialize', options);
        },
        childViewOptions: {}
    });

    return ChildBehaviors;
});