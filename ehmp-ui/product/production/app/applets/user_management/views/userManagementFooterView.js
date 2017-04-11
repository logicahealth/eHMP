define([
    'backbone',
    'marionette',
    'jquery'
], function(Backbone, Marionette, $) {
    "use strict";
    var footerView = ADK.UI.Form.extend({
        fields: [{
            control: "container",
            extraClasses: ["text-right", "top-border-grey-light", "footer-content", "pixel-height-23", "background-color-primary-lightest"],
            items: [{
                control: "button",
                extraClasses: ["btn-icon"],
                name: "previous-page-button",
                label: "Previous Page",
                srOnlyLabel: true,
                icon: "fa-chevron-left fa-lg",
                disabled: false,
                title: "Press enter to access previous data.",
                id: "previous-page-button",
                type: "button"
            }, {
                control: "button",
                extraClasses: ["btn-icon"],
                name: "next-page-button",
                label: "Next Page",
                srOnlyLabel: true,
                icon: "fa-chevron-right fa-lg",
                disabled: false,
                title: "Press enter to access next data.",
                id: "next-page-button",
                type: "button"
            }]
        }],
        onInitialize: function() {
            this.model = this.options.model;
            this.toolbarView = this.options.toolbarView;
            this.toolbarView.footerView = this;
        },
        events: {
            'click .next-page-button button': function(e) {
                e.preventDefault();
                this.toolbarView.disableFormAndSearch(this.toolbarView.nextPage, '.next-page-button button');
            },
            'click .previous-page-button button': function(e) {
                e.preventDefault();
                this.toolbarView.disableFormAndSearch(this.toolbarView.previousPage, '.previous-page-button button');
            }
        },
        ui: {
            "nextPageButton": ".next-page-button",
            "previousPageButton": ".previous-page-button",
            "FooterContent": ".footer-content"
        },
        disablePagingButtons: function() {
            this.ui.nextPageButton = this.$el.find('.next-page-button');
            this.ui.previousPageButton = this.$el.find('.previous-page-button');
            this.ui.nextPageButton.trigger('control:disabled', true);
            this.ui.previousPageButton.trigger('control:disabled', true);
        },
        enablePagingButtons: function() {
            this.ui.nextPageButton = this.$el.find('.next-page-button');
            this.ui.previousPageButton = this.$el.find('.previous-page-button');
            this.ui.nextPageButton.trigger('control:disabled', false);
            this.ui.previousPageButton.trigger('control:disabled', false);
        },
        showFooterContent: function() {
            this.ui.FooterContent.trigger('control:hidden', false);
        },
        hideFooterContent: function() {
            this.ui.FooterContent.trigger('control:hidden', true);
        }
    });
    return footerView;
});