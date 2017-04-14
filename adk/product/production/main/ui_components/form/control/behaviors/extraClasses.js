define([
    'backbone',
    'marionette'
], function(
	Backbone,
	Marionette
) {
    "use strict";

    return Marionette.Behavior.extend({
        onBeforeRender: function() {
            this.setExtraClasses();
        },
        onRender: function(){
            this.$el.addClass(_.isString(this.extraClasses) ? this.extraClasses : '');
        },
        setExtraClasses: function(defaultClasses) {
            this.extraClasses = this.view.field.get('extraClasses') || defaultClasses || '';

            if (_.isArray(this.extraClasses)) {
                this.extraClasses = this.extraClasses.join(' ');
            } else if (!_.isString(this.extraClasses)) {
                this.extraClasses = '';
            }
        }
    });
});