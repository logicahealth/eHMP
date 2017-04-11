define('main/components/applet_chrome/views/resizeView', [
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'api/Navigation',
    'hbs!main/components/applet_chrome/templates/maximizeTemplate',
    'hbs!main/components/applet_chrome/templates/minimizeTemplate'
], function(
    Backbone,
    Marionette,
    $,
    _,
    Navigation,
    maximizeTemplate,
    minimizeTemplate
) {
    'use strict';
    var ResizeView = Backbone.Marionette.ItemView.extend({
        tagName: 'span',
        getTemplate: function() {
            if (this.model.has('maximizeScreen')) {
                return maximizeTemplate;
            } else if (this.model.get('fullScreen') === true && Navigation.hasPreviousRoute() &&
                this.model.get('fromMinimizedToMaximized') && !Navigation.isFirstAndDefaultScreen()) {
                return minimizeTemplate;
            } else {
                return _.template('');
            }
        },
        attributes: function() {
            return{
                'class': 'grid-' + this.model.get('id')
            };
        },
        behaviors: {
            Tooltip: {}
        }
    });
    return ResizeView;
});