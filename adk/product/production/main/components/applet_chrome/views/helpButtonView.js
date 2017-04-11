define('main/components/applet_chrome/views/helpButtonView', [
    'backbone',
    'marionette',
    'hbs!main/components/applet_chrome/templates/helpButtonTemplate'
], function(Backbone,Marionette, HelpButtonTemplate) {
    'use strict';
    var HelpButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'span',
        template: HelpButtonTemplate,
        attributes: function() {
            return{
                'class': 'grid-' + this.model.get('id')
            };
        },
        behaviors: {
            Tooltip: {}
        }
    });
    return HelpButtonView;
});
