define([
    'backbone',
    'hbs!app/applets/allergy_grid/modal/detailsFooterTemplate',
    'app/applets/allergy_grid/writeback/enteredInErrorView'
], function(Backbone, detailsFooterTemplate, EnteredInErrorView) {
    'use strict';

    var FooterView = Backbone.Marionette.ItemView.extend({
        template: detailsFooterTemplate,
        events: {
            'click #error': 'enteredInError'
        },
        enteredInError: function() {
            ADK.UI.Modal.hide();
            EnteredInErrorView.createAndShowEieView(this.model);
        },
        templateHelpers: function() {
            var siteCode = ADK.UserService.getUserSession().get('site');
            var pidSiteCode = this.model.get('uid') ? this.model.get('uid').split(':')[3] : '';

            return {
                data: Boolean(ADK.UserService.hasPermission('eie-allergy') && pidSiteCode === siteCode)
            };
        }
    });

    return FooterView;
});