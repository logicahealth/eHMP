define([
    'backbone',
    'marionette',
    'handlebars',
    'underscore'
], function(Backbone, Marionette, Handlebars) {
    'use strict';
    var channel = ADK.Messaging.getChannel('notes');
    return function(params) {
          var operationFooterView = Backbone.Marionette.ItemView.extend({
              template: Handlebars.compile('{{ui-button "No" id="btn-notes-operation-no" classes="btn-default btn-sm" title="Press enter to go back."}}{{ui-button "Yes" id ="btn-notes-operation-yes" classes="btn-primary btn-sm" title="Press enter to delete."}}'),
              events: {
               'click #btn-notes-operation-yes': 'onConfirmation',// params.yes_callback,
               'click #btn-notes-operation-no': 'onCancel'//params.no_callback,
              },
              onConfirmation: function(event) {
                  event.preventDefault();
                  event.stopImmediatePropagation();
                  ADK.UI.Alert.hide();
                  if(!_.isUndefined(params.yes_callback)){
                    params.yes_callback();
                  }
              },
              onCancel: function(event) {
                  event.preventDefault();
                  event.stopImmediatePropagation();
                  ADK.UI.Alert.hide();
                 if(!_.isUndefined(params.no_callback)){
                   params.no_callback();
                 }
              },
              tagName: 'span'
          });
          var operationBodyView = Backbone.Marionette.ItemView.extend({
              template: Handlebars.compile(params.message),
              tagName: 'p'
          });
        this.showModal = function(event) {
            var operationConfirmationView = new ADK.UI.Alert({
                title: 'Delete',
                icon: 'icon-triangle-exclamation',
                messageView: operationBodyView,
                footerView: operationFooterView
            });
            operationConfirmationView.show();
        };
    };

});
