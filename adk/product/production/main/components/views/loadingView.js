define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'api/Messaging',
    'hbs!main/components/views/loadingTemplate',
    'main/ui_components/fullscreen_overlay/component'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    Messaging,
    LoadingTemplate,
    FullScreenOverlay
) {
    'use strict';

    var ApplicationLoadingView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile(
            '<div class="initial-app-load-indicator">' +
            '<img width="320" height="71" src="_assets/img/VA_logo.png" alt="VA Logo">' +
            '<h1>Loading eHMP<span aria-hidden="true">.</span><span aria-hidden="true">.</span><span aria-hidden="true">.</span></h1>' +
            '</div>'
        )
    });

    Messaging.on('show:app:loading', function() {
        this.loadingModal = new FullScreenOverlay({
            view: new ApplicationLoadingView(),
            theme: 'light',
            options: { 'callShow': true }
        });
        this.loadingModal.show();
    });

    Messaging.on('hide:app:loading', function() {
        FullScreenOverlay.hide();
    });

    var LoadingView = Backbone.Marionette.ItemView.extend({
        template: LoadingTemplate
    });

    var Loading = {
        create: function(options) {
            return new LoadingView();
        },
        view: LoadingView
    };
    return Loading;
});
