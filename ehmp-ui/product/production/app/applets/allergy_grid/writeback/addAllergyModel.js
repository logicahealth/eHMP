define([
    'backbone',
    'app/applets/allergy_grid/writeback/validationUtils'
], function(Backbone, validationUtils) {
    "use strict";

    var FormModel = Backbone.Model.extend({
        defaults: {
            allergen: '',
            allergyType: '',
            'reaction-date': '',
            'reaction-time': '',
            severity: '',
            'nature-of-reaction': '',
            moreInfo: ''
        },
        validate: function(attributes, options) {
            return validationUtils.validateModel(this);
        }
    });

    return FormModel;
});