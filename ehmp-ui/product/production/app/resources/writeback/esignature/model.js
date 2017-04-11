define([
    'backbone',
    'underscore'
], function(Backbone, _) {

    var Model = ADK.Resources.Writeback.Model.extend({
        childAttributes: ['_labelsForSelectedValues'],
        defaults: function() {
            return {
                name: "",
                signatureCode: "",
                connectionPercent: "",
                ratedDisabilities: "None Stated",
                signItems: new Backbone.Collection(),
                itemChecklist: new Backbone.Collection()
            };
        },
        resourceEvents: {
            'before:create': 'setFields',
            'before:update': 'setFields'
        },
        validate: function(attributes, options) {
            this.errorModel.clear();

            if (_.isEmpty(this.get('signatureCode'))) {
                this.errorModel.set({
                    signatureCode: "Enter a valid signature"
                });
            }
            var selectedItems = this.getSelected();
            if (selectedItems.length === 0) {
                this.errorModel.set({
                    itemChecklist: "Select at least one item"
                });
            }
            if (!_.isEmpty(this.errorModel.toJSON())) {
                return "Validation errors. Please fix.";
            }
        },
        setFields: function() {
            this.get('signItems').reset(this.getSelected());
        },
        getSelected: function() {
            return this.get('itemChecklist').where({
                value: true
            });
        }
    });

    return Model;
});