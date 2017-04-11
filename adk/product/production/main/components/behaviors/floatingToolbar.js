define([
    'backbone',
    'marionette',
    'main/components/behaviors/floatingDialog',
    'main/components/appletToolbar/appletToolbarView',
    'api/Messaging'
], function(Backbone, Marionette, FloatingDialog, AppletToolbar, Messaging) {
    "use strict";

    var FloatingToolbar = FloatingDialog.extend({
        component: 'toolbar',
        initialize: function(options, view) {
            //the view's intiialize is called after this one so we have to hijack it to configure
            //toolbar options that might be state depenedent, meaning they set in the view's initialze
            var init = view.initialize;
            view.initialize = function() {
                init.apply(this, arguments);
                this.triggerMethod('onInitialize', options, view);
            };
            this.listenToOnce(view, 'onInitialize', this.configureToolbar);
        },
        configureToolbar: function(options, view) {
            var appletOptions = view.getOption('appletOption') || view.getOption('toolbarOptions'),
                toolbarOptions = (appletOptions) ? ((appletOptions.toolbarOptions) ? appletOptions.toolbarOptions : appletOptions) : null;

            options = _.extend({
                targetElement: view.options
            }, toolbarOptions, options);
            FloatingDialog.prototype.initialize.call(this, options, view);
        },
        DialogView: AppletToolbar.extend({
            onRender: function() {
                this.show(); //calls the toolbar's show method to show it immediately after it's created
            }
        }),
        isTargetInsideSibling: function(target) { //fix for gist rows being tabbable but trigger element being a child element
            return FloatingDialog.prototype.isTargetInsideSibling.call(this, target) || _.includes(target.classList, 'gist-item');
        }
    });

    return FloatingToolbar;
});