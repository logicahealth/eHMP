define('main/components/applet_chrome/views/helpButtonView', [
    'backbone',
    'marionette'
], function(Backbone, Marionette) {
    'use strict';
    var HelpButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'span',
        template: false,
        attributes: function() {
            return{
                'class': 'grid-' + this.model.get('id')
            };
        },
        behaviors: function(){
            return {
                Tooltip: {},
                HelpLink: {
                    mapping: this.getOption('model').get('helpMapping'),
                    url: this.getOption('model').get('helpUrl')
                }
            };
        }
    });
    return HelpButtonView;
});
