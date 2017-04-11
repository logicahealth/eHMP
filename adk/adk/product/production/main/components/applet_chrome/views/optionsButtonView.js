define('main/components/applet_chrome/views/optionsButtonView', [
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'hbs!main/components/applet_chrome/templates/optionsButtonTemplate'
], function(Backbone,Marionette,$, _, OptionsButtonTemplate) {
    'use strict';
    var OptionsButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'span',
        modelEvents: {
            'change openContext': 'render'
        },
        getTemplate: function() {
            return OptionsButtonTemplate;
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
    return OptionsButtonView;
});
