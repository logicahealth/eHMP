define([
    'backbone',
    'marionette',
    'hbs!app/applets/search/templates/rightSideButtonTemplate'
], function(Backbone, Marionette, rightSideButtonTemplate) {
    'use strict';
    var TEXT_SEARCH_CHANNEL = ADK.Messaging.getChannel('search');
    var RightSideButtonView = Backbone.Marionette.ItemView.extend({
        behaviors: {
            HelpLink: {
                container: '.help-button-container',
                mapping: 'record_search',
                buttonOptions: {
                    icon: 'fa-question-circle'
                }
            },
            Tooltip: {
                placement: 'top'
            }
        },
        template: rightSideButtonTemplate,
        ui: {
            closeTextSearchButton: '.text-search-close-button'
        },
        events: {
            'keydown @ui.closeTextSearchButton': 'handleEnterOrSpaceBar',
            'click @ui.closeTextSearchButton': 'returnToPreviousWorkspace'
        },
        returnToPreviousWorkspace: function() {
            TEXT_SEARCH_CHANNEL.trigger('cancelCloseSearch');
        },
        handleEnterOrSpaceBar: function(event) {
            var keyCode;
            if (!_.isUndefined(event)) {
                if (event.which) {
                    keyCode = event.which;
                } else {
                    keyCode = event.keyCode;
                }
            }
            if (!_.isUndefined(keyCode) && (keyCode === 13 || keyCode === 32)) {
                var targetElement = this.$(event.currentTarget);
                targetElement.focus();
                targetElement.trigger('click');
            }
        }
    });
    return RightSideButtonView;
});