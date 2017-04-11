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
            disabled: false,
            required: false,
            value: undefined, // Optional. Default value when model is empty.
            control: undefined, // Control name or class
            formatter: undefined,
            prependToDomId: null
        },
        initialize: function() {
            var control = Utils.resolveNameToClass(this.get("control"), "Control");
            this.set({
                controlName: this.get('control'),
                control: control
            }, {
                silent: true
            });
        }
    });

});