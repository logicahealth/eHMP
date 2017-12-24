define([
    'backbone',
    'main/ui_components/form/utils'
], function(
    Backbone,
    Utils
) {
    "use strict";

    return Backbone.Model.extend({
        defaults: {
            name: "", // Name of the model attribute; accepts "." nested path (e.g. x.y.z)
            placeholder: "",
            value: undefined, // Optional. Default value when model is empty.
            control: undefined, // Control name or class
            formatter: undefined,
            prependToDomId: null
        },
        initialize: function(attributes, options) {
            this.formView = _.get(options, 'formView');
            var controlClassPath = 'formView.controlClass.' + this.get("control");
            var control = _.get(this, controlClassPath, null);
            if (_.isNull(control)) {
                control = Utils.resolveNameToClass(this.get("control"), "Control");
            }
            this.set({
                controlName: this.get('control'),
                control: control
            }, {
                silent: true
            });
        },
        set: function() {
            var result = Backbone.Model.prototype.set.apply(this, arguments);
            if (!_.isEmpty(this._origAttributes) && !_.isEmpty(result.previousAttributes())) {
                _.extend(this._origAttributes, result.changed);
            }
            return result;
        },
        constructor: function(attributes, options) {
            this._origAttributes = _.clone(attributes);
            Backbone.Model.prototype.constructor.apply(this, arguments);
        }
    });

});
