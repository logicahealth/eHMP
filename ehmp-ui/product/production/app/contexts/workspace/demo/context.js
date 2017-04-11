define([
    'underscore',
    'backbone',
    'marionette',
    'jquery',
    'handlebars'
], function(
    _,
    Backbone,
    Marionette,
    $,
    Handlebars
) {
    'use strict';

    var LayoutView = Backbone.Marionette.LayoutView.extend({
        className: "container-fluid",
        template: Handlebars.compile([
            '<div class="row">',
            '<div class="col-xs-12">',

            '<div id="banner-region" class="row background-color-primary-dark color-pure-white">',
            '<div class="col-xs-12">',
            '<div class="context-banner-bar-left pull-left"><h2 class="top-margin-sm">eHMP - UI Demo Environment</h2></div>',
            '</div>',
            '</div>',

            '<div id="content-region" class="row"></div>',

            '</div>',
            '</div>',
        ].join("\n")),
        regions: {
            content_region: '#content-region'
        }
    });

    var context = {
        id: 'demo',
        routeName: 'demo',
        defaultScreen: 'ui-components-demo',
        workspacesRequiredBeforeAppLoad: [],
        userRequired: false,
        layout: function(workspaceModel) {
            return LayoutView;
        },
        enter: function () {
        },
        exit: function () {
        },
        navigateTo: function(workspaceId) {
            return {
                workspaceId: workspaceId
            };
        }
    };

    return context;
});