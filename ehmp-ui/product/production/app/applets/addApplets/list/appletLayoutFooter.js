define([
    'jquery',
    'backbone',
    'app/applets/addApplets/list/launchDeleteModal',
    'hbs!app/applets/addApplets/templates/appletFooter'
], function($, Backbone, launchDeleteModal, template) {
   'use strict';

   return Backbone.Marionette.ItemView.extend({
       template: template,

       ui: {
           deleteWorkspace: '.delete-workspace',
           exitEditor: '.exitEditing',
           openManager: '.open-manager'
       },

       // TODO none of these events have a keyboard handler
       events: {
           'click @ui.deleteWorkspace': 'deleteWorkspace',
           'click @ui.openManager': 'navigateToManager',
           'click @ui.exitEditor': 'hideOverlay'
       },

       initialize: function() {
           this.listenTo(ADK.Messaging, 'screen:navigate', function() {
               this.triggerMethod('click:switchboard');
           });
       },

       deleteWorkspace: function(event) {
           this.triggerMethod('click:switchboard');
           var triggerElement = this.$(event.target);
           var config = this.getOption('screenConfig');
           launchDeleteModal(config.id, config.title, triggerElement);
       },

       navigateToManager: function() {
           this.triggerMethod('click:switchboard');
           var modalRegion = ADK.Messaging.request('get:adkApp:region', 'modalRegion');
           var triggerElement = _.get(modalRegion, '$triggerElement[0]');
           ADK.UI.FullScreenOverlay.hide();
           var channel = ADK.Messaging.getChannel('workspaceManagerChannel');
           channel.trigger('workspaceManager', {
               triggerElement: triggerElement
           });
       },

       hideOverlay: function() {
           this.triggerMethod('save');
       }
   });
});